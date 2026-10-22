# ShiftFit: 4-3 Recomp & Lifestyle OS (iOS PWA)

A mobile-responsive Progressive Web Application (PWA) specifically optimized for **iOS Safari** that serves as a personalized gym training instructor and lifestyle tracker for **12-hour shift workers** (4-on/3-off rotas) pursuing **aesthetic body recomposition** (target: maintaining 75–78kg).

---

## ⚡ Core System Architecture

### 1. Dynamic Rota-Based Scheduling (The Engine)
- **Base 4-on / 3-off 12-Hour Shift Cycle**: Set an anchor date and the engine dynamically maps your shift cycle.
- **Overtime Shift Support**: Tap any date in the calendar to flag it as an Overtime 12h Shift (Day/Night) or swap shift days.
- **CNS Fatigue-Aware Workout Allocation**:
  - **Off-Day 1**: Heavy Push (Upper Clavicular Chest, Lateral Delts, Triceps)
  - **Off-Day 2**: Heavy Legs (Quad Sweep, RDL Posterior Chain, Calves & Core)
  - **Off-Day 3**: Heavy Pull (Lat Width & Thickness, Upper Back, Biceps)
  - **Shift-Day 1**: Spinal Decompression & Deep Mobility (Post-12h shift recovery)
  - **Shift-Day 2**: 20-min Maintenance Hypertrophy Flush (Sustains protein synthesis without CNS drain)
  - **Shift-Days 3 & 4**: Complete CNS Rest / Active Recovery
  - **Overtime Conflicts**: When overtime is scheduled on an off-day, the engine automatically throttles the workout into a high-density 25-minute CNS-sparing express session to prevent overtraining and systemic burnout.

### 2. Workout Execution & Tracking
- **Aesthetic Body Recomposition Focus**: Hypertrophy programming targeting the classic aesthetic V-taper, clavicular upper chest shelf, lateral delt cap, and lean waist.
- **Granular Set Logging**: Log weight (kg), reps, and check off completed sets with instant previous-weight memory.
- **Auto-Starting Countdown Rest Timer**: Auto-triggers upon completing any set with customizable audio bells (Web Audio API synthetic frequencies) and vibration haptic cues.
- **"Equipment Taken" Dynamic Alternatives**: One-tap swap button on every movement providing 3–4 biomechanically equivalent alternatives targeting the *exact same muscle group and resistance curve*.
- **Daily 1–10 Fatigue / CNS Auto-Regulation**: Interactive readiness slider upon opening the app:
  - *Score 1–4 (Rested)*: Full prescribed heavy hypertrophy volume (4 sets).
  - *Score 5–7 (Moderate Shift Drain)*: Drops 1 accessory set, keeping heavy top sets intact.
  - *Score 8–10 (Severe Exhaustion)*: Auto-reduces volume by 40–50%, replaces spinal axial loads with machine/cuff alternatives, or routes to mobility.

### 3. Nutrition, Hydration & Weight Management
- **Macro Tracker**: Calorie and macro cycling between Shift Days (185g P / 70g F / 200g C / 2,170 kcal) and Off Days (185g P / 65g F / 260g C / 2,365 kcal).
- **Visual Progress Bars**: Real-time visual status indicating **Target Met**, **Remaining**, or **Exceeded**.
- **Hydration Checklist**: 3.8L daily target tailored for shift workers facing dry air-conditioned ward/industrial environments, featuring timed shift checkpoints.
- **Bodyweight Tracking & 7-Day Moving Average**: Morning weigh-in log with real-time 7-day moving average calculation to filter daily water fluctuations and hold the **75–78kg maintenance corridor**.

### 4. Weekly Analytics & Review Dashboard
- **Correlated Statistical Breakdown**: Correlates 7-day average bodyweight delta, macro adherence rate (%), and total weekly tonnage volume progression (kg).
- **Actionable Next-Week Improvements**: Algorithmic bulleted list pinpointing exact adjustments (e.g., carbohydrate adjustments, shift-day whey isolate prep, or progressive overload recommendations).

### 5. Cloud-Sync Progress Media & Backend
- **Physique Photo Vault**: Weekly prompt (e.g. Week 42) with pose guides (Front Relaxed, Front Double Bicep, Side Chest, Back Lat Spread, Waist/Abs).
- **Google Drive API Cloud Sync**:
  - Securely uploads progress photos to a dedicated `ShiftFit_Physique_Vault` folder in your Google Drive.
  - **PC Desktop Native Sync**: Because the image is stored in your Google Drive cloud, the **Google Drive for Desktop** client automatically downloads it to your local PC folder the next time your PC is turned on — completely independent of whether your PC was on during your gym session!
- **Supabase Storage Alternative**: Optional full backend integration for Supabase Cloud storage bucket.
- **100% Offline Capability**: Uses IndexedDB storage with automatic LocalStorage fallback and one-click JSON backup export.

---

## 📱 iOS Safari PWA Installation

To run fullscreen like a native iOS app:
1. Open the hosted URL in **Safari** on your iPhone.
2. Tap the **Share** button (box with upward arrow) at the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"**. The ShiftFit icon will appear on your home screen and open without Safari address bars!

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone <repo-url>
cd "Project Trainer App"

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🌐 Deploying to GitHub Pages

This app is pre-configured for instant zero-configuration deployment to GitHub Pages via Vite and GitHub Actions:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ShiftFit PWA"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings > Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
3. The included workflow `.github/workflows/deploy.yml` will automatically build and publish the app!

---

## ☁️ Google Drive Desktop Sync Setup Guide

To enable native PC folder sync:
1. Ensure you have **Google Drive for Desktop** installed on your Mac/PC.
2. In ShiftFit, open the **Vault** tab and tap **Cloud Setup**.
3. Provide your Google Drive OAuth2 token (or Supabase credentials).
4. Every weekly physique photo uploaded in the gym goes directly to your cloud `ShiftFit_Physique_Vault` folder, and automatically appears in your local PC directory `C:\Users\<Name>\Google Drive\ShiftFit_Physique_Vault\` whenever your PC connects to the internet!
