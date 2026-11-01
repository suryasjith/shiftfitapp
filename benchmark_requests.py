#!/usr/bin/env python3
"""
Async API Benchmark & Load Simulator with Exponential Backoff
Uses asyncio and aiohttp to send concurrent requests, handle HTTP 429 rate limits,
and log precise request latency & status codes for backend benchmarking.
"""

import argparse
import asyncio
import logging
import random
import sys
import time
from dataclasses import dataclass, field
from typing import List, Optional
import aiohttp


# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
class CustomFormatter(logging.Formatter):
    """Custom colorized formatter for terminal logging output."""

    GREY = "\x1b[38;20m"
    GREEN = "\x1b[32;20m"
    YELLOW = "\x1b[33;20m"
    RED = "\x1b[31;20m"
    BOLD_RED = "\x1b[31;1m"
    CYAN = "\x1b[36;20m"
    RESET = "\x1b[0m"

    FORMAT = "%(asctime)s [%(levelname)-8s] %(message)s"

    FORMATS = {
        logging.DEBUG: GREY + FORMAT + RESET,
        logging.INFO: CYAN + FORMAT + RESET,
        logging.WARNING: YELLOW + FORMAT + RESET,
        logging.ERROR: RED + FORMAT + RESET,
        logging.CRITICAL: BOLD_RED + FORMAT + RESET,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno, self.FORMAT)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


logger = logging.getLogger("api_benchmark")


def setup_logger(log_file: Optional[str] = None):
    logger.setLevel(logging.DEBUG)
    logger.handlers.clear()

    # Console Handler with color formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(CustomFormatter())
    logger.addHandler(console_handler)

    # Optional File Handler with standard plain formatting
    if log_file:
        file_handler = logging.FileHandler(log_file, mode="a", encoding="utf-8")
        file_handler.setLevel(logging.DEBUG)
        file_fmt = logging.Formatter(
            "%(asctime)s [%(levelname)-8s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_handler.setFormatter(file_fmt)
        logger.addHandler(file_handler)


# ---------------------------------------------------------------------------
# Benchmark Data Structures
# ---------------------------------------------------------------------------
@dataclass
class RequestResult:
    request_id: int
    status_code: Optional[int]
    latency_ms: float
    attempts: int
    success: bool
    error: Optional[str] = None


@dataclass
class BenchmarkStats:
    total_requests: int
    results: List[RequestResult] = field(default_factory=list)
    total_duration_s: float = 0.0

    @property
    def successful_requests(self) -> int:
        return sum(1 for r in self.results if r.success)

    @property
    def failed_requests(self) -> int:
        return sum(1 for r in self.results if not r.success)

    @property
    def latencies(self) -> List[float]:
        return sorted([r.latency_ms for r in self.results if r.latency_ms > 0])

    def print_summary(self):
        lats = self.latencies
        count = len(lats)

        print("\n" + "=" * 60)
        print("                 BENCHMARK SUMMARY REPORT")
        print("=" * 60)
        print(f"Total Requests Dispatched : {self.total_requests}")
        print(f"Successful Requests (2xx) : {self.successful_requests}")
        print(f"Failed Requests           : {self.failed_requests}")
        print(f"Total Benchmark Time      : {self.total_duration_s:.3f} s")

        if self.total_duration_s > 0:
            throughput = len(self.results) / self.total_duration_s
            print(f"Throughput                : {throughput:.2f} req/s")

        if count > 0:
            avg_lat = sum(lats) / count
            p50 = lats[int(count * 0.50)]
            p90 = lats[min(int(count * 0.90), count - 1)]
            p99 = lats[min(int(count * 0.99), count - 1)]

            print("\nLatency Metrics (Backend Response Times):")
            print(f"  • Min Latency           : {lats[0]:.2f} ms")
            print(f"  • Average Latency       : {avg_lat:.2f} ms")
            print(f"  • Median (P50)          : {p50:.2f} ms")
            print(f"  • P90 Latency           : {p90:.2f} ms")
            print(f"  • P99 Latency           : {p99:.2f} ms")
            print(f"  • Max Latency           : {lats[-1]:.2f} ms")
        print("=" * 60 + "\n")


# ---------------------------------------------------------------------------
# Request Worker with Exponential Backoff
# ---------------------------------------------------------------------------
async def send_simulated_request(
    session: aiohttp.ClientSession,
    request_id: int,
    url: str,
    method: str = "GET",
    json_payload: Optional[dict] = None,
    headers: Optional[dict] = None,
    semaphore: Optional[asyncio.Semaphore] = None,
    max_retries: int = 5,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    timeout_s: float = 15.0,
    simulate_rate_limits: bool = False,
) -> RequestResult:
    """
    Sends a request with concurrency limiting and exponential backoff on HTTP 429.
    Measures latency for each attempt.
    """
    sem = semaphore or asyncio.Semaphore(100)

    async with sem:
        attempt = 0
        while attempt <= max_retries:
            attempt += 1
            start_time = time.perf_counter()

            try:
                logger.debug(
                    f"[Req #{request_id:02d}] (Attempt {attempt}) Sending {method} {url}"
                )

                async with session.request(
                    method=method,
                    url=url,
                    json=json_payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=timeout_s),
                ) as response:
                    # Read response body to accurately measure full backend roundtrip
                    await response.read()
                    latency_ms = (time.perf_counter() - start_time) * 1000
                    status = response.status

                    # Simulated rate limit for testing purposes if flag enabled
                    if simulate_rate_limits and attempt == 1 and (request_id % 3 == 0):
                        status = 429

                    # Check for HTTP 429 Rate Limit
                    if status == 429:
                        # Extract Retry-After if present
                        retry_after = response.headers.get("Retry-After")
                        if retry_after and retry_after.replace(".", "", 1).isdigit():
                            backoff = float(retry_after)
                        else:
                            # Exponential backoff with jitter: base * 2^(attempt-1) + random jitter
                            jitter = random.uniform(0.1, 0.5)
                            backoff = min(max_delay, (base_delay * (2 ** (attempt - 1))) + jitter)

                        if attempt <= max_retries:
                            logger.warning(
                                f"[Req #{request_id:02d}] HTTP 429 Rate Limit | "
                                f"Latency: {latency_ms:6.2f}ms | "
                                f"Backing off for {backoff:.2f}s (Attempt {attempt}/{max_retries})"
                            )
                            await asyncio.sleep(backoff)
                            continue  # Retry
                        else:
                            logger.error(
                                f"[Req #{request_id:02d}] HTTP 429 Exceeded max retries ({max_retries}) | "
                                f"Final Latency: {latency_ms:6.2f}ms"
                            )
                            return RequestResult(
                                request_id=request_id,
                                status_code=status,
                                latency_ms=latency_ms,
                                attempts=attempt,
                                success=False,
                                error="Rate limit retries exhausted",
                            )

                    # Successful response (2xx)
                    if 200 <= status < 300:
                        logger.info(
                            f"[Req #{request_id:02d}] HTTP {status} OK  | "
                            f"Latency: {latency_ms:6.2f}ms | "
                            f"Attempts: {attempt}"
                        )
                        return RequestResult(
                            request_id=request_id,
                            status_code=status,
                            latency_ms=latency_ms,
                            attempts=attempt,
                            success=True,
                        )

                    # Other HTTP Status (e.g., 4xx, 5xx)
                    logger.warning(
                        f"[Req #{request_id:02d}] HTTP {status} ERR | "
                        f"Latency: {latency_ms:6.2f}ms | "
                        f"Attempts: {attempt}"
                    )
                    return RequestResult(
                        request_id=request_id,
                        status_code=status,
                        latency_ms=latency_ms,
                        attempts=attempt,
                        success=False,
                        error=f"HTTP status {status}",
                    )

            except (aiohttp.ClientError, asyncio.TimeoutError) as err:
                latency_ms = (time.perf_counter() - start_time) * 1000
                if attempt <= max_retries:
                    jitter = random.uniform(0.1, 0.5)
                    backoff = min(max_delay, (base_delay * (2 ** (attempt - 1))) + jitter)
                    logger.warning(
                        f"[Req #{request_id:02d}] Connection Error: {type(err).__name__} | "
                        f"Latency: {latency_ms:6.2f}ms | Retrying in {backoff:.2f}s..."
                    )
                    await asyncio.sleep(backoff)
                else:
                    logger.error(
                        f"[Req #{request_id:02d}] Connection Failed after {attempt} attempts: {err}"
                    )
                    return RequestResult(
                        request_id=request_id,
                        status_code=None,
                        latency_ms=latency_ms,
                        attempts=attempt,
                        success=False,
                        error=str(err),
                    )

        return RequestResult(
            request_id=request_id,
            status_code=None,
            latency_ms=0.0,
            attempts=attempt,
            success=False,
            error="Exceeded retry limits",
        )


# ---------------------------------------------------------------------------
# Benchmark Orchestrator
# ---------------------------------------------------------------------------
async def run_benchmark(
    url: str,
    concurrency: int = 20,
    total_requests: int = 20,
    method: str = "GET",
    json_payload: Optional[dict] = None,
    headers: Optional[dict] = None,
    max_retries: int = 5,
    base_delay: float = 1.0,
    timeout_s: float = 15.0,
    simulate_rate_limits: bool = False,
) -> BenchmarkStats:
    """Orchestrates concurrent requests and gathers benchmark telemetry."""

    logger.info(
        f"Starting benchmark: {total_requests} requests with concurrency {concurrency}"
    )
    logger.info(f"Target URL: {method} {url}")

    semaphore = asyncio.Semaphore(concurrency)
    conn = aiohttp.TCPConnector(limit=concurrency + 10)

    overall_start = time.perf_counter()

    async with aiohttp.ClientSession(connector=conn) as session:
        tasks = [
            asyncio.create_task(
                send_simulated_request(
                    session=session,
                    request_id=i + 1,
                    url=url,
                    method=method,
                    json_payload=json_payload,
                    headers=headers,
                    semaphore=semaphore,
                    max_retries=max_retries,
                    base_delay=base_delay,
                    timeout_s=timeout_s,
                    simulate_rate_limits=simulate_rate_limits,
                )
            )
            for i in range(total_requests)
        ]

        results = await asyncio.gather(*tasks)

    total_duration = time.perf_counter() - overall_start

    stats = BenchmarkStats(
        total_requests=total_requests,
        results=list(results),
        total_duration_s=total_duration,
    )
    return stats


# ---------------------------------------------------------------------------
# CLI Argument Parser & Entry Point
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Async benchmark load tester with exponential backoff on HTTP 429."
    )
    parser.add_argument(
        "--url",
        type=str,
        default="http://localhost:20128/v1/models",
        help="Target API URL (default: OmniRoute models endpoint at http://localhost:20128/v1/models)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=20,
        help="Number of concurrent requests (default: 20)",
    )
    parser.add_argument(
        "--total",
        type=int,
        default=20,
        help="Total number of simulated requests to send (default: 20)",
    )
    parser.add_argument(
        "--method",
        type=str,
        default="GET",
        choices=["GET", "POST", "PUT", "DELETE"],
        help="HTTP method (default: GET)",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=5,
        help="Max retries for rate limit 429 responses (default: 5)",
    )
    parser.add_argument(
        "--base-delay",
        type=float,
        default=1.0,
        help="Base backoff delay in seconds (default: 1.0)",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=15.0,
        help="Request timeout in seconds (default: 15.0)",
    )
    parser.add_argument(
        "--simulate-rate-limits",
        action="store_true",
        help="Simulate 429 responses locally on initial attempts to test backoff logic",
    )
    parser.add_argument(
        "--log-file",
        type=str,
        default="benchmark_results.log",
        help="File path to write detailed benchmark log output (default: benchmark_results.log)",
    )

    args = parser.parse_args()

    setup_logger(args.log_file)

    try:
        stats = asyncio.run(
            run_benchmark(
                url=args.url,
                concurrency=args.concurrency,
                total_requests=args.total,
                method=args.method,
                max_retries=args.retries,
                base_delay=args.base_delay,
                timeout_s=args.timeout,
                simulate_rate_limits=args.simulate_rate_limits,
            )
        )
        stats.print_summary()
    except KeyboardInterrupt:
        logger.warning("\nBenchmark cancelled by user.")
    except Exception as e:
        logger.exception(f"Fatal error during benchmark: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
