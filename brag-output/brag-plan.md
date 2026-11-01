# Brag Plan: ShiftFit

## What is this app?
ShiftFit is a zero-bloat, OLED-black fitness & nutrition OS built specifically for 12-hour 4-on/3-off shift workers, dynamically auto-regulating training volume and macros based on real-time CNS fatigue.

## The angle
Shift workers are exhausted and standard gym apps assume everyone works a 9-to-5 with 8 hours of sleep. ShiftFit flips this: it actively regulates workouts and calorie targets depending on whether you're working a 12h day shift, a graveyard night shift, or an off day.

## Hook (first 2-3 seconds)
"12-hour shift today? Your workout just adapted." Bold emerald type over pure OLED black `#000000`, followed by a rapid shift badge switch (`Day Shift 12h` -> `Fatigue: 8/10`).

## Key moments (the middle)
- **CNS Fatigue Dial**: Interactive 1–10 slider adjusting workout intensity and dropping junk volume in real-time.
- **Gym Floor Adaptation ("Equipment Taken")**: One-tap intelligent exercise substitute when gym machines are occupied.
- **Floating Focus Rest Timer**: Takes over screen focus between sets with zero clutter.
- **Shift-Aligned Fuel**: Macro and hydration gauges tuned for exhausting 12-hour duty cycles.

## Outro / punchline
"Stop guessing. Keep your gains. ShiftFit."

## User flow worth showing
1. **Entry**: Worker opens the "Today" dashboard after a grueling shift, sets Fatigue slider to 8/10.
2. **Key Action**: App automatically trims volume to essential heavy compounds; user starts a set, swaps a crowded barbell for dumbbells with one tap ("Equipment Taken").
3. **Result**: Rest timer completes, set logs to offline IndexedDB, Fuel tab shows remaining water and high-protein targets.

## Tone
- Preset: `polished`
- Creative direction: Sleek iOS OLED dark-mode fitness OS for shift workers
- Interpretation: Deep contrast, crisp typography, restrained elegant motion, and zero SaaS fluff.

## Format: landscape — 1920x1080
## Duration: 20 seconds (exact sum: 3.7s + 5.2s + 5.8s + 5.3s = 20.0s)

## Visual identity (from the project)
- Background: `#000000` (Pure OLED Black)
- Accent: `#10b981` (Emerald-500) and `#06b6d4` (Cyan-500)
- Text: `#f5f5f5` (Primary) and `#9ca3af` (Secondary / Muted)
- Display font: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif
- Body font: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif
- Strongest visual element: Floating rest timer circular display and the minimal 4-tab iOS navigation bar.

## Share copy (draft)
Built ShiftFit: a zero-bloat, pure OLED-black PWA that dynamically auto-regulates your training and macros around 12-hour day & night shifts.

## Audio direction
- Role: Warm rhythmic electronic bed with crisp interface accents
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3`
- Music treatment: Fade in smoothly over 0.5s, clean beat-matched transitions, fade under final logo punchline
- Music cue guidance: Preset cues at 1.60s, 3.70s, 5.80s, 8.96s, 14.76s, 17.91s
- Audio-reactive treatment: Subtle ambient glow pulsation on emerald badges during beat drops
- SFX posture: Restrained, crisp tactile UI clicks on slider drag, exercise swap, and timer chime
- Audio-coupled moments: Fatigue dial tick at 4.2s; exercise swap click at 10.5s; rest timer finish chime at 13.5s
- Restraint rule: No harsh buzzers, sirens, or EDM risers

## Storyboard

### Scene 1 — The Shift Worker Reality (Hook) — 3.7s
- Screen: OLED Black canvas. Bold typography hits: "12-HOUR SHIFT TODAY?"
- Sub-text reveals: "Your workout just adapted."
- Visual: A sleek shift card appears showing `Day Shift 12h (07:00 - 19:00)` with status badge.
- Sequential/interaction: Badge glows and pulses on beat 1.60s.
- Audio intent: Sets immediate hook and modern tech vibe.
- Audio-coupled idea: Crisp interface tap sound as shift type locks in.
- Transition mood: Clean slide → Scene 2 (at 3.70s beat).

### Scene 2 — Live CNS Fatigue Auto-Regulation — 5.2s
- Screen: The "Today" minimalist dashboard appears.
- Visual: Large 1–10 Fatigue slider actively slides from 3 to 8. As the value hits 8, the workout summary card below visibly shifts from "High Volume (5 Sets)" to "CNS-Preserved (3 Heavy Sets)".
- Sequential/interaction: Simulated slider thumb drag with live feedback text: "Fatigue Elevated: Volume Auto-Adjusted".
- Audio intent: Demonstrates the intelligence and core algorithm.
- Audio-coupled idea: Subtle haptic clicks on slider drag.
- Transition mood: Soft wipe → Scene 3 (at 8.96s beat).

### Scene 3 — In The Trenches: Gym Floor & Equipment Swap — 5.8s
- Screen: Active Workout tab showing exercise tracking card: `Incline Barbell Press`.
- Visual: An alert pops up: "Equipment Taken?". User taps "Swap Exercise" -> Instant modal reveals Dumbbell Incline Press. One tap switches exercise seamlessly.
- Sequential/interaction: Tap gesture on "Swap", exercise row updates instantly, Floating Rest Timer triggers with circular countdown (60s).
- Audio intent: High satisfaction of frictionless gym logging.
- Audio-coupled idea: Soft button pop on swap; timer tick chime.
- Transition mood: Dramatic wipe → Scene 4 (at 14.76s beat).

### Scene 4 — Fuel, Offline PWA & Outro Punchline — 5.3s
- Screen: High-level Fuel & Hydration card with progress bars (200g Protein, 3.5L Water), followed by a swift transition to the centered ShiftFit emblem.
- Visual: Glowing emerald emblem, tagline: "Stop Guessing. Keep Your Gains.", pill label: "100% Offline PWA • 0ms Delay".
- Sequential/interaction: Three feature pills drop in sequentially (`OLED Black`, `Offline IndexedDB`, `Shift-Adaptive Rota`).
- Audio intent: Confident, resolved finale fading out smoothly.
- Audio-coupled idea: Subtle sub-bass hit on final logo settle at 17.91s.

**Music mood for this video:** Upbeat, modern electronic bounce (114.8 BPM).  
**Audio summary:** Starts with punchy hook, builds momentum during live slider & workout interaction, resolves cleanly into brand logo and tagline.
