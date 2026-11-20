// Standalone Unit Test Suite for CycleEngine & Date-fns Boundary Calculations
import { CycleEngine } from '../src/services/cycleEngine';
import { CycleSettings } from '../src/types';

console.log('--- RUNNING CYCLE ENGINE VERIFICATION SUITE ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${testName}`);
  } else {
    console.error(`✗ FAIL: ${testName}`);
    process.exit(1);
  }
}

// Test 1: Male profile returns inactive
const maleRes = CycleEngine.getPhaseInfo('2026-11-01', { enabled: true, cycleLengthDays: 28 }, 'male');
assert(!maleRes.isActive, 'Male profile returns inactive phase periodization');

// Test 2: Disabled cycle settings returns inactive
const disabledRes = CycleEngine.getPhaseInfo('2026-11-01', { enabled: false, cycleLengthDays: 28 }, 'female');
assert(!disabledRes.isActive, 'Disabled cycle setting returns inactive');

// Test 3: Day 1 (Menstrual)
const settings: CycleSettings = {
  enabled: true,
  lastPeriodStartDate: '2026-11-01',
  cycleLengthDays: 28,
};
const day1Res = CycleEngine.getPhaseInfo('2026-11-01', settings, 'female');
assert(day1Res.isActive && day1Res.phase === 'menstrual' && day1Res.cycleDay === 1, 'Day 1 is identified as Menstrual (Day 1/28)');
assert(day1Res.hydrationBumpMl === 200, 'Menstrual phase applies +200ml hydration bump');

// Test 4: Day 7 (Follicular)
const day7Res = CycleEngine.getPhaseInfo('2026-11-07', settings, 'female');
assert(day7Res.phase === 'follicular' && day7Res.cycleDay === 7, 'Day 7 is identified as Follicular (Day 7/28)');
assert(!day7Res.isPeakStrength, 'Follicular is not peak strength');

// Test 5: Day 14 (Ovulatory / Peak Strength)
const day14Res = CycleEngine.getPhaseInfo('2026-11-14', settings, 'female');
assert(day14Res.phase === 'ovulatory' && day14Res.cycleDay === 14, 'Day 14 is identified as Ovulatory (Day 14/28)');
assert(day14Res.isPeakStrength, 'Ovulatory is flagged as Peak Strength window');

// Test 6: Day 22 (Luteal / High Progesterone)
const day22Res = CycleEngine.getPhaseInfo('2026-11-22', settings, 'female');
assert(day22Res.phase === 'luteal' && day22Res.cycleDay === 22, 'Day 22 is identified as Luteal (Day 22/28)');
assert(day22Res.isHighProgesterone, 'Luteal phase flagged as High Progesterone');
assert(day22Res.hydrationBumpMl === 400, 'Luteal phase applies +400ml hydration bump');

// Test 7: Rollover into Next Cycle (Day 29 -> Day 1)
const day29Res = CycleEngine.getPhaseInfo('2026-11-29', settings, 'female');
assert(day29Res.phase === 'menstrual' && day29Res.cycleDay === 1, 'Day 29 rolls over into Day 1 of next cycle');

// Test 8: Non-standard cycle length (32 days)
const settings32: CycleSettings = {
  enabled: true,
  lastPeriodStartDate: '2026-11-01',
  cycleLengthDays: 32,
};
const day32Res = CycleEngine.getPhaseInfo('2026-12-02', settings32, 'female');
assert(day32Res.phase === 'luteal' && day32Res.cycleDay === 32, '32-day cycle tracks up to Day 32 in Luteal phase');

// Test 9: Manual Override for today
const settingsOverride: CycleSettings = {
  enabled: true,
  lastPeriodStartDate: '2026-11-01',
  cycleLengthDays: 28,
  phaseOverride: 'ovulatory',
  overrideDate: '2026-11-01',
};
const overrideRes = CycleEngine.getPhaseInfo('2026-11-01', settingsOverride, 'female');
assert(overrideRes.phase === 'ovulatory' && overrideRes.isPeakStrength, 'Manual override successfully overrides calculation');

console.log(`\nALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! 🎯\n`);
