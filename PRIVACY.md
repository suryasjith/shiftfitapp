# Privacy Policy & Data Sovereignty Architecture

**Effective Date:** November 1, 2026  
**Application:** ShiftFit: 4-3 Recomp & Lifestyle OS (Progressive Web Application)

---

## 1. Local-First Privacy Guarantee (Privacy by Design)

ShiftFit is engineered from the ground up to follow **Privacy by Design (GDPR Article 25)**. Unlike conventional fitness and wellness trackers:

- **Zero Cloud Servers:** ShiftFit operates entirely in your web browser. There is no remote central database or backend collecting your information.
- **Zero Telemetry & Analytics:** We do not track pageviews, clicks, session length, or device fingerprints. No Google Analytics, no Meta Pixel, no Mixpanel, and no remote crash reporting.
- **Zero Advertising or Data Monetization:** We never sell, rent, monetize, or broker personal or biological metrics to third parties, health insurance providers, or data brokers.
- **Zero Tracking Cookies:** ShiftFit uses standard browser storage (`IndexedDB` and `localStorage`) solely to store your workouts, custom shifts, and nutrition logs locally on your machine.

---

## 2. Personal & Health Data Storage (IndexedDB)

All biometric data inputted during onboarding and daily tracking (including body weight, height, biological gender, workout weights, nutrition intake, and fatigue ratings) is saved **strictly on your personal device's local storage**.

- **Storage Engine:** Standard browser-managed `IndexedDB` (`shiftfit_database`).
- **Data Persistence:** Your data remains on your physical device across sessions and offline workouts.
- **Data Deletion:** If you clear your browser site data or reset ShiftFit via the settings, your data is erased immediately from your local storage.

---

## 3. Data Portability & Rights (GDPR & CCPA Compliance)

Under international data privacy standards including the **EU General Data Protection Regulation (GDPR)** and the **California Consumer Privacy Act (CCPA)**:

1. **Right to Access & Portability:** You can export a full, unencrypted JSON copy of your entire workout and biometric history at any time by tapping **Offline DB > Export Local Backup**.
2. **Right to Erasure (Right to Be Forgotten):** You have immediate, autonomous ability to erase all data stored in the local IndexedDB database with zero delays, without needing to submit requests to a data controller.
3. **Right to Rectification:** All historical entries (weight, nutrition, sets, dates) are fully editable directly within the application interface.

---

## 4. Third-Party Network Requests

ShiftFit minimizes external network calls:
- **Exercise Biomechanics Images:** Exercise visual guides are fetched on-demand from public open-source content delivery networks (GitHub raw content for `free-exercise-db`). No personal parameters or identifiers are sent in these image asset requests.
- **Tutorial Links:** Tapping "YT" initiates a standard external link to YouTube search results. No user data is passed to external services.

---

## 5. Contact & Open Source Auditing

ShiftFit is 100% open source under the MIT License. Anyone can inspect, audit, or verify our local-first, zero-tracking codebase at:
[https://github.com/suryasjith/shiftfitapp](https://github.com/suryasjith/shiftfitapp)
