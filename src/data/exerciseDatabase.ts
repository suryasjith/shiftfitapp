import { ExerciseDefinition } from '../types';

export const EXERCISE_DATABASE: Record<string, ExerciseDefinition> = {
  // Push / Chest
  'incline_db_press': {
    id: 'incline_db_press',
    name: 'Incline Dumbbell Press (30°)',
    targetMuscle: 'Chest (Upper Clavicular)',
    primaryEquipment: 'Dumbbells & Incline Bench',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSecs: 90,
    tips: 'Set bench to 30 degrees. Retract scapulae, drive elbows slightly inward (45°), press up and touch dumbbell bells together at top without clashing.',
    alternatives: [
      { name: 'Smith Machine Incline Press', equipment: 'Smith Machine', cue: 'Fixed bar path allows maximal clavicular fiber recruitment without stabilizing fatigue.' },
      { name: 'Incline Plate-Loaded Chest Press', equipment: 'Converging Chest Machine', cue: 'Follow natural converging arc to peak clavicular contraction.' },
      { name: 'Low-to-High Cable Fly', equipment: 'Dual Cable Pulley', cue: 'Step forward in staggered stance, drive palms upward and inward to chest height.' },
      { name: 'Incline Barbell Bench Press', equipment: 'Olympic Barbell & Bench', cue: 'Lower to upper chest below clavicle; drive through heels.' }
    ]
  },
  'flat_db_press': {
    id: 'flat_db_press',
    name: 'Flat Dumbbell Bench Press',
    targetMuscle: 'Chest (Mid/Lower Sternal)',
    primaryEquipment: 'Dumbbells & Flat Bench',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 3,
    defaultReps: '8-12',
    defaultRestSecs: 90,
    tips: 'Maintain slight arch in lower back, drive through feet, full stretch at bottom without dropping elbows too low.',
    alternatives: [
      { name: 'Barbell Flat Bench Press', equipment: 'Barbell & Bench', cue: 'Classic mass builder, touch mid-sternum, explosive lockout.' },
      { name: 'Seated Machine Chest Press', equipment: 'Plate/Pin Machine', cue: 'Zero stabilizer demand, ideal when CNS is taxed.' },
      { name: 'Weighted Chest Dips', equipment: 'Parallel Dip Bars', cue: 'Lean torso forward 30° to target sternal pec fibers.' },
      { name: 'Standing Cable Mid-Chest Press', equipment: 'Cable Station', cue: 'Continuous tension through peak contraction.' }
    ]
  },
  'cable_lateral_raise': {
    id: 'cable_lateral_raise',
    name: 'Cable Lateral Raise (Cuff/Handle)',
    targetMuscle: 'Shoulders (Side Delts)',
    primaryEquipment: 'Cable Tower',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Set pulley to wrist/knee height. Lead with elbow, tilt wrist slightly down, avoid shrugging traps to cap lateral delts.',
    alternatives: [
      { name: 'Seated Dumbbell Lateral Raise', equipment: 'Dumbbells & Bench', cue: 'Seated removes leg drive, pure side delt isolation.' },
      { name: 'Machine Lateral Raise', equipment: 'Lateral Raise Machine', cue: 'Pad contact ensures direct resistance curve at 90° abduction.' },
      { name: 'Incline Bench Lean-Away Lateral Raise', equipment: 'Dumbbell & Incline Bench', cue: 'Provides heavy stretch overload at bottom range.' },
      { name: 'Resistance Band Lateral Raise', equipment: 'Elastic Loop Band', cue: 'Peak resistance at maximal contraction.' }
    ]
  },
  'cable_fly': {
    id: 'cable_fly',
    name: 'Pec Deck / Standing Cable Fly',
    targetMuscle: 'Chest (Mid/Lower Sternal)',
    primaryEquipment: 'Pec Deck or Dual Cable',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Slight bend in elbows locked throughout movement. Focus on bringing biceps across chest for peak pec shortening.',
    alternatives: [
      { name: 'Dumbbell Flat Fly', equipment: 'Dumbbells & Bench', cue: 'Control deep eccentric stretch, stop when upper arms parallel to floor.' },
      { name: 'Low Cable Crossover', equipment: 'Dual Cable Station', cue: 'Focus on upper sternal contraction at eye level.' },
      { name: 'Push-Ups (Chest Focus)', equipment: 'Bodyweight', cue: 'Elevate feet for higher sternal/clavicular demand.' }
    ]
  },
  'tricep_rope_pushdown': {
    id: 'tricep_rope_pushdown',
    name: 'Tricep Rope Pushdown',
    targetMuscle: 'Arms (Triceps Long/Lateral)',
    primaryEquipment: 'Cable Tower with Rope',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Pin elbows to ribs. Flare rope apart at the bottom for intense lateral head squeeze.',
    alternatives: [
      { name: 'V-Bar Tricep Pushdown', equipment: 'Cable Tower with V-Bar', cue: 'Allows heavier loading with comfortable wrist angle.' },
      { name: 'Overhead Cable Tricep Extension', equipment: 'Cable Tower', cue: 'Maximizes stretch on long head of triceps.' },
      { name: 'Dumbbell Skullcrushers', equipment: 'Dumbbells & Flat Bench', cue: 'Lower to temples, flare elbows slightly out.' }
    ]
  },
  'overhead_cable_extension': {
    id: 'overhead_cable_extension',
    name: 'Overhead Cable Tricep Extension',
    targetMuscle: 'Arms (Triceps Long/Lateral)',
    primaryEquipment: 'Cable Tower & Rope',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Face away from high cable pulley. Keep upper arms fixed parallel to ears, extend fully forward.',
    alternatives: [
      { name: 'EZ-Bar Incline Skullcrusher', equipment: 'EZ-Bar & Incline Bench', cue: 'Constant tension without elbow torque.' },
      { name: 'Seated DB Overhead Extension', equipment: 'Single Heavy Dumbbell', cue: 'Cup dumbbell with both hands, deep stretch behind neck.' },
      { name: 'Cross-Body Cable Extension', equipment: 'Dual High Pulleys', cue: 'Natural ergonomic alignment with zero shoulder stress.' }
    ]
  },

  // Pull / Back & Delts
  'lat_pulldown': {
    id: 'lat_pulldown',
    name: 'Neutral/Wide Grip Lat Pulldown',
    targetMuscle: 'Back (Lats Width)',
    primaryEquipment: 'Lat Pulldown Machine',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSecs: 90,
    tips: 'Lean back 10-15°. Drive elbows straight down towards back pockets, do not pull down past chin level with arms.',
    alternatives: [
      { name: 'Weighted Pull-Ups', equipment: 'Pull-Up Bar', cue: 'Full dead hang to chin over bar for supreme lat width.' },
      { name: 'Half-Kneeling Single-Arm Cable Pulldown', equipment: 'Cable Tower', cue: 'Follows iliac fiber direction with zero lumbar load.' },
      { name: 'Plate-Loaded High Row Machine', equipment: 'Iso-Lateral Row Machine', cue: 'Independent arm movement ensures bilateral symmetry.' }
    ]
  },
  'chest_supported_row': {
    id: 'chest_supported_row',
    name: 'Chest-Supported T-Bar / DB Row',
    targetMuscle: 'Back (Upper Thickness & Traps)',
    primaryEquipment: 'T-Bar Row or Incline Bench & DBs',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 4,
    defaultReps: '8-12',
    defaultRestSecs: 90,
    tips: 'Chest firmly pinned to pad to remove lower back fatigue. Retract shoulder blades first, row elbows high and back.',
    alternatives: [
      { name: 'Seated Cable Row (Wide Neutral Grip)', equipment: 'Low Cable Row', cue: 'Pull handle into upper navel, squeeze rhomboids and mid-traps.' },
      { name: 'Bent-Over Barbell Row', equipment: 'Barbell', cue: 'Hinge at 45°, row bar to sternum (higher CNS load).' },
      { name: 'Single-Arm Dumbbell Row', equipment: 'Dumbbell & Flat Bench', cue: 'Elbow path tight to hip, deep stretch at bottom.' },
      { name: 'Machine ISO-Lateral Row', equipment: 'Plate Machine', cue: 'Stable seat platform, focus on peak upper back contraction.' }
    ]
  },
  'single_arm_cable_row': {
    id: 'single_arm_cable_row',
    name: 'Single-Arm Iliac Lat Cable Row',
    targetMuscle: 'Back (Lats Width)',
    primaryEquipment: 'Cable Station & D-Handle',
    mechanics: 'Compound',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 75,
    tips: 'Sit tall, pull elbow down and back directly to hip bone (iliac crest). Avoid twisting torso.',
    alternatives: [
      { name: 'Meadows Row', equipment: 'Landmine / Barbell', cue: 'Stand perpendicular, drive elbow out for lower lat & teres major.' },
      { name: 'Seated Single-Arm Cable Row', equipment: 'Low Row', cue: 'Pull handle directly into belt line.' },
      { name: 'Dumbbell Row on Bench', equipment: 'Dumbbells', cue: 'Arm path strictly along torso flank.' }
    ]
  },
  'face_pull': {
    id: 'face_pull',
    name: 'Cable Face Pull with External Rotation',
    targetMuscle: 'Shoulders (Rear Delts)',
    primaryEquipment: 'Cable Tower with Long Rope',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Set cable to eye height. Pull rope towards bridge of nose while externally rotating hands back like a double bicep pose.',
    alternatives: [
      { name: 'Reverse Pec Deck / Rear Delt Fly', equipment: 'Pec Deck Machine', cue: 'Keep arms slightly soft, push outward with pinkies.' },
      { name: 'Bent-Over Dumbbell Rear Delt Raise', equipment: 'Light Dumbbells', cue: 'Hinge 90°, swing dumbbells out in wide arc.' },
      { name: 'Incline Bench Prone Rear Delt Fly', equipment: 'Incline Bench & DBs', cue: 'Eliminates momentum, pure posterior delt focus.' }
    ]
  },
  'incline_db_curl': {
    id: 'incline_db_curl',
    name: 'Incline Dumbbell Bicep Curl',
    targetMuscle: 'Arms (Biceps & Brachialis)',
    primaryEquipment: 'Incline Bench (45-60°) & DBs',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Allow arms to hang straight down behind torso. Curl without swinging shoulders, full supination at the top.',
    alternatives: [
      { name: 'Standing EZ-Bar Bicep Curl', equipment: 'EZ-Bar', cue: 'Shoulder-width grip, smooth 3-second eccentric.' },
      { name: 'Cable Bicep Curl with Straight Bar', equipment: 'Low Cable Station', cue: 'Constant rotational tension throughout movement.' },
      { name: 'Preacher Bench Curl', equipment: 'Preacher Bench & Bar', cue: 'Strict short-head contraction with zero body sway.' }
    ]
  },
  'hammer_curl': {
    id: 'hammer_curl',
    name: 'Cross-Body / Neutral Hammer Curl',
    targetMuscle: 'Arms (Biceps & Brachialis)',
    primaryEquipment: 'Dumbbells',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Neutral palms-in grip. Builds the brachialis muscle underneath the bicep to push the peak higher and thicken forearms.',
    alternatives: [
      { name: 'Rope Cable Hammer Curl', equipment: 'Cable Station & Rope', cue: 'Pull to chest height, flare hands at peak.' },
      { name: 'Reverse Grip EZ-Bar Curl', equipment: 'EZ-Bar', cue: 'Overhand grip hits brachioradialis and upper forearm.' },
      { name: 'Incline Dumbbell Hammer Curl', equipment: 'Incline Bench & DBs', cue: 'Stretches long head under neutral wrist alignment.' }
    ]
  },

  // Legs / Lower Body Focus
  'hack_squat': {
    id: 'hack_squat',
    name: 'Hack Squat / Plate Leg Press',
    targetMuscle: 'Quads (Knee Extension)',
    primaryEquipment: 'Hack Squat Machine or 45° Leg Press',
    mechanics: 'Compound',
    cnsLoad: 'High',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSecs: 120,
    tips: 'Feet low-to-mid platform, knees tracking over second toe. Deep knee flexion for quad sweep without lower back rounding.',
    alternatives: [
      { name: '45-Degree Leg Press', equipment: 'Leg Press Machine', cue: 'Feet low and shoulder-width, lower until 90-degree knee angle.' },
      { name: 'Smith Machine Squat', equipment: 'Smith Machine', cue: 'Feet slightly forward, eliminates spinal balancing stress.' },
      { name: 'Bulgarian Split Squat', equipment: 'Dumbbells & Bench', cue: 'Rear foot elevated, upright torso for immense quad burn.' },
      { name: 'Barbell High-Bar Back Squat', equipment: 'Squat Rack & Barbell', cue: 'Classic strength builder, depth below parallel.' }
    ]
  },
  'romanian_deadlift': {
    id: 'romanian_deadlift',
    name: 'Dumbbell / Barbell Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings & Glutes (Hips & Posterior)',
    primaryEquipment: 'Dumbbells or Barbell',
    mechanics: 'Compound',
    cnsLoad: 'High',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSecs: 120,
    tips: 'Soft knees, push hips straight back into wall behind you until deep hamstring stretch. Keep bar glued to shins.',
    alternatives: [
      { name: 'Seated Leg Curl Machine', equipment: 'Seated Leg Curl', cue: 'Pelvis pinned, hits hamstrings in lengthened seated position.' },
      { name: 'Lying Hamstring Leg Curl', equipment: 'Lying Leg Curl Machine', cue: 'Hips pressed firmly down into bench, control the negative.' },
      { name: 'Smith Machine RDL', equipment: 'Smith Machine', cue: 'Fixed bar guide allows full focus on posterior hinge.' }
    ]
  },
  'leg_extension': {
    id: 'leg_extension',
    name: 'Leg Extension (Quad Peak)',
    targetMuscle: 'Quads (Knee Extension)',
    primaryEquipment: 'Leg Extension Machine',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 75,
    tips: 'Align knee joint with machine pivot. Pause 1 second at top contraction, control 3-second descent for rectus femoris tear.',
    alternatives: [
      { name: 'Sissy Squat (Bodyweight / Plate)', equipment: 'Sissy Squat Bench or Upright', cue: 'Lean back to maximize rectus femoris stretch.' },
      { name: 'Reverse Nordic Curl', equipment: 'Mat / Bodyweight', cue: 'Kneeling eccentric quad overload.' },
      { name: 'Close-Stance Goblet Squat', equipment: 'Kettlebell / Dumbbell & Heel Wedge', cue: 'Elevated heels force maximum knee travel.' }
    ]
  },
  'seated_leg_curl': {
    id: 'seated_leg_curl',
    name: 'Seated Leg Curl Machine',
    targetMuscle: 'Hamstrings & Glutes (Hips & Posterior)',
    primaryEquipment: 'Seated Leg Curl',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 75,
    tips: 'Flex toes up towards shins (dorsiflexion). Explode down, hold squeeze 1s, slow 3-second release.',
    alternatives: [
      { name: 'Lying Leg Curl Machine', equipment: 'Lying Leg Curl', cue: 'Keep hips pinned down, do not arch lower back.' },
      { name: 'Stability Ball Hamstring Curl', equipment: 'Exercise Ball', cue: 'Bridge hips up and curl heels to glutes.' },
      { name: 'Nordic Hamstring Curl', equipment: 'Ankle Anchor / Partner', cue: 'Ultimate eccentric hamstring builder.' }
    ]
  },
  'standing_calf_raise': {
    id: 'standing_calf_raise',
    name: 'Standing Calf Raise (Straight Leg)',
    targetMuscle: 'Calves & Core',
    primaryEquipment: 'Calf Machine or Smith Machine',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: '2-second dead stop at the bottom stretch, explode onto balls of big toes, hold peak 1 second.',
    alternatives: [
      { name: 'Leg Press Calf Press', equipment: '45° Leg Press', cue: 'Balls of feet on lower edge, strict ankle flexion.' },
      { name: 'Seated Calf Raise', equipment: 'Seated Calf Machine', cue: 'Targets soleus muscle for lower leg fullness.' },
      { name: 'Single-Leg Dumbbell Calf Raise', equipment: 'Dumbbell & Step', cue: 'Bodyweight + DB, unilateral stability.' }
    ]
  },
  'hanging_leg_raise': {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg / Knee Raise',
    targetMuscle: 'Calves & Core',
    primaryEquipment: 'Pull-Up Bar or Captains Chair',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Roll pelvis up towards sternum (do not just swing thighs). Keep abdominal wall tight to sculpt tight waistline.',
    alternatives: [
      { name: 'Cable Rope Crunch (Kneeling)', equipment: 'Cable Station & Rope', cue: 'Curl elbows down to knees without sitting back.' },
      { name: 'Ab Roller Wheel Rollout', equipment: 'Ab Wheel & Mat', cue: 'Full anti-extension core stabilizer.' },
      { name: 'Lying Flat Leg Raise', equipment: 'Gym Mat', cue: 'Keep lumbar spine pressed flat against floor.' }
    ]
  },

  // Shift-Day Maintenance & Mobility Express Movements
  'thoracic_foam_roll': {
    id: 'thoracic_foam_roll',
    name: 'Thoracic Extension & Foam Roller Decompression',
    targetMuscle: 'Back (Upper Thickness & Traps)',
    primaryEquipment: 'Foam Roller & Mat',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 2,
    defaultReps: '60s hold',
    defaultRestSecs: 30,
    tips: 'Roll upper back, pause at tight spinal segments, extend arms overhead to decompress after 12-hour standing or sitting.',
    alternatives: [
      { name: 'Dead Hang from Pull-Up Bar', equipment: 'Pull-Up Bar', cue: 'Hang relaxed for 45-60 seconds to decompress spinal discs.' },
      { name: 'Cat-Cow Flow', equipment: 'Yoga Mat', cue: 'Slow spinal flexion and extension synced to breathing.' }
    ]
  },
  'hip_flexor_stretch': {
    id: 'hip_flexor_stretch',
    name: '90/90 Hip Opener & Couch Stretch',
    targetMuscle: 'Hamstrings & Glutes (Hips & Posterior)',
    primaryEquipment: 'Wall / Bench & Mat',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 2,
    defaultReps: '45s/side',
    defaultRestSecs: 30,
    tips: 'Rear knee against wall/bench, squeeze glute to open anterior hip capsule after long 12h shifts.',
    alternatives: [
      { name: 'Pigeon Pose Stretch', equipment: 'Yoga Mat', cue: 'Deep glute and piriformis relief.' },
      { name: 'World Greatest Stretch', equipment: 'Bodyweight', cue: 'Lunge with thoracic twist and hamstring reach.' }
    ]
  },
  'shift_pump_circuit': {
    id: 'shift_pump_circuit',
    name: 'Express Cable/Band Hypertrophy Flush',
    targetMuscle: 'Chest (Mid/Lower Sternal)',
    primaryEquipment: 'Cable Station or Dumbbells',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 2,
    defaultReps: '15-20',
    defaultRestSecs: 45,
    tips: 'Light blood-flow pump session (RPE 6-7). Restores muscle glycogen and enhances recovery without CNS strain.',
    alternatives: [
      { name: 'Push-Up & Inverted Row Superset', equipment: 'Smith Bar / Floor', cue: 'Crisp bodyweight blood flow flush.' },
      { name: 'Dumbbell Full-Body Complex (Light)', equipment: 'Light Dumbbells', cue: 'RDL into Curl into Press, steady pace.' }
    ]
  }
};
