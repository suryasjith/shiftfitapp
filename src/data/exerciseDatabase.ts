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
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg',
    formPoints: [
      'Angle bench to 30° to target upper clavicular chest fibers.',
      'Tuck elbows 45° to protect rotator cuffs; avoid flaring.',
      'Control eccentric stretch (2-3s) without bouncing at the bottom.'
    ],
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
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg',
    formPoints: [
      'Plant feet flat and pack shoulder blades firmly into the bench.',
      'Lower dumbbells until upper arms break parallel with your chest.',
      'Squeeze chest together at apex without locking elbows violently.'
    ],
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
    tips: 'Set pulley at wrist height. Lean away slightly, raise arm in scapular plane (15° forward) to parallel. Zero swinging or trap shrugging.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg',
    formPoints: [
      'Set cable height at wrist level and lean slightly away from the stack.',
      'Lead with your elbow in the scapular plane (15° forward of body).',
      'Pause at parallel; do not shrug traps to heave the weight up.'
    ],
    alternatives: [
      { name: 'Dumbbell Seated Lateral Raise', equipment: 'Dumbbells', cue: 'Chest against inclined bench eliminates torso momentum completely.' },
      { name: 'Machine Lateral Raise', equipment: 'Pin Selector Machine', cue: 'Continuous tension profile peaking at shortened side delt position.' },
      { name: 'Behind-Back Cable Lateral Raise', equipment: 'Cable Tower', cue: 'Greatest stretch at bottom across lumbar curve.' }
    ]
  },
  'cable_fly': {
    id: 'cable_fly',
    name: 'Standing Mid-Cable Chest Fly',
    targetMuscle: 'Chest (Mid/Lower Sternal)',
    primaryEquipment: 'Dual Cable Pulley',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Slight bend in elbows locked throughout movement. Bring hands together in hugging motion, hard peak contraction for 1 second.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg',
    formPoints: [
      'Maintain a soft bend in elbows; imagine hugging a giant barrel.',
      'Keep chest elevated and shoulders pinned back throughout.',
      'Squeeze and hold peak contraction for 1 full second.'
    ],
    alternatives: [
      { name: 'Pec Deck Machine', equipment: 'Machine', cue: 'Eliminates shoulder drift, maximum mid-chest burn.' },
      { name: 'Incline Dumbbell Fly', equipment: 'Dumbbells & Bench', cue: 'Deep eccentric stretch across clavicular fibers.' }
    ]
  },
  'tricep_rope_pushdown': {
    id: 'tricep_rope_pushdown',
    name: 'Cable Rope Tricep Pushdown',
    targetMuscle: 'Arms (Triceps Long/Lateral)',
    primaryEquipment: 'Cable Tower & Rope',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Pin elbows to ribcage. Push down and spread rope ends apart at bottom to maximize lateral head recruitment.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_Rope_Attachment/0.jpg',
    formPoints: [
      'Glue elbows tight to your ribcage; do not let them drift forward.',
      'Spread rope ends outward at full extension for peak lateral head tension.',
      'Control the eccentric phase back to 90° before pressing again.'
    ],
    alternatives: [
      { name: 'Straight Bar Cable Pushdown', equipment: 'Cable & Straight Bar', cue: 'Heavier overload potential for medial and lateral heads.' },
      { name: 'Overhead Dumbbell Tricep Extension', equipment: 'Dumbbell', cue: 'Full stretch on long head.' }
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
    defaultReps: '10-14',
    defaultRestSecs: 60,
    tips: 'Pulley set at hip height. Face away, extend arms straight forward/upward, deep stretch behind neck.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg',
    formPoints: [
      'Position pulley around hip height and lean torso forward 30°.',
      'Allow hands to travel behind head to achieve maximum tricep long-head stretch.',
      'Drive forward into full lockout without moving elbow joints.'
    ],
    alternatives: [
      { name: 'Incline Skull Crushers', equipment: 'EZ Bar & Incline Bench', cue: 'Constant tension at lockout angle.' },
      { name: 'Cable Katana Extension', equipment: 'Dual Pulley', cue: 'Eliminates shoulder mobility restrictions completely.' }
    ]
  },

  // Pull / Back & Biceps
  'lat_pulldown': {
    id: 'lat_pulldown',
    name: 'Wide-Grip Lat Pulldown',
    targetMuscle: 'Back (Lats Width)',
    primaryEquipment: 'Lat Pulldown Machine',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 4,
    defaultReps: '8-10',
    defaultRestSecs: 90,
    tips: 'Thumbless grip slightly wider than shoulders. Drive elbows down to hips, lean back 10-15 degrees max, pull bar to upper sternum.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg',
    formPoints: [
      'Grip slightly wider than shoulders and maintain a 15° slight lean.',
      'Initiate by pulling shoulder blades down before bending elbows.',
      'Drive elbows down towards back pockets; stop at clavicle.'
    ],
    alternatives: [
      { name: 'Assisted Pull-Up', equipment: 'Gravitron Machine', cue: 'Pure vertical pulling pattern with variable CNS assist.' },
      { name: 'Neutral-Grip Lat Pulldown', equipment: 'Mag/V-Grip', cue: 'Joint-friendly wrist angle with increased lat lever arm.' },
      { name: 'Single-Arm Half-Kneeling Lat Pulldown', equipment: 'Cable Station', cue: 'Aligns perfectly with iliac lat fiber orientation.' }
    ]
  },
  'chest_supported_row': {
    id: 'chest_supported_row',
    name: 'Chest-Supported Incline T-Bar Row',
    targetMuscle: 'Back (Upper Thickness & Traps)',
    primaryEquipment: 'Incline Bench & Dumbbells / Machine',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSecs: 90,
    tips: 'Chest pinned to pad completely eliminates lower back strain. Flare elbows 45-60 degrees, squeeze rhomboids and middle traps at top.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/T-Bar_Row_with_Handle/0.jpg',
    formPoints: [
      'Pin sternum to pad to take 100% of lower back spinal load away.',
      'Row with elbows flared 45-60° to recruit mid-traps and rhomboids.',
      'Retract scapulae fully at top; hold contraction for 1 second.'
    ],
    alternatives: [
      { name: 'Seated Cable Row (Wide Grip)', equipment: 'Cable Row Station', cue: 'Target upper back thickness with neutral posture.' },
      { name: 'Seal Row', equipment: 'Flat Elevated Bench & Barbell', cue: 'Zero momentum, pure upper back isolation.' },
      { name: 'Meadows Row', equipment: 'Landmine & Plates', cue: 'Asymmetrical unilateral lat & rhomboid powerhouse.' }
    ]
  },
  'single_arm_cable_row': {
    id: 'single_arm_cable_row',
    name: 'Half-Kneeling Single-Arm Cable Row',
    targetMuscle: 'Back (Lats Width)',
    primaryEquipment: 'Cable Station & D-Handle',
    mechanics: 'Compound',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Opposite knee forward. Row to hip crest with elbow tracking tight to torso. Protricate scapula at full stretch.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_One-arm_Cable_Pulley_Rows/0.jpg',
    formPoints: [
      'Set cable at stomach height and kneel with opposite leg forward.',
      'Pull handle straight back toward hip crest, keeping elbow brushing ribs.',
      'Allow shoulder blade to reach forward on release for deep lat stretch.'
    ],
    alternatives: [
      { name: 'Dumbbell Single-Arm Row', equipment: 'Dumbbell & Flat Bench', cue: 'Heavy overload, maintain flat spinal alignment.' },
      { name: 'Plate-Loaded Machine Row', equipment: 'ISO Machine', cue: 'Fixed arc of motion, maximum mind-muscle connection.' }
    ]
  },
  'face_pull': {
    id: 'face_pull',
    name: 'Cable Face Pull with External Rotation',
    targetMuscle: 'Shoulders (Rear Delts)',
    primaryEquipment: 'Cable Tower & Rope',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Set pulley to eye height. Pull rope toward forehead while rotating knuckles backward so hands finish above elbows.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg',
    formPoints: [
      'Set pulley at eye level using double rope attachment.',
      'Pull toward bridge of nose while externally rotating hands back.',
      'Finish with knuckles facing back and elbows higher than shoulders.'
    ],
    alternatives: [
      { name: 'Rear Delt Reverse Fly Machine', equipment: 'Pec Deck Machine', cue: 'Pure rear delt abduction without rhomboid takeover.' },
      { name: 'Incline Prone Dumbbell Rear Fly', equipment: 'Dumbbells & Bench', cue: 'Gravity-loaded peak tension at horizontal.' }
    ]
  },
  'incline_db_curl': {
    id: 'incline_db_curl',
    name: 'Incline Dumbbell Bicep Curl',
    targetMuscle: 'Arms (Biceps & Brachialis)',
    primaryEquipment: 'Incline Bench & Dumbbells',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Bench at 45-60°. Arms hang straight down behind torso. Curl up while supinating (palms facing ceiling). Full stretch on long head.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Curl/0.jpg',
    formPoints: [
      'Set bench to 45-60°; let arms hang fully perpendicular to ground.',
      'Supinate wrists (turn pinkies up) as you curl toward shoulders.',
      'Keep upper arm locked back to maintain tension on bicep long head.'
    ],
    alternatives: [
      { name: 'Bayesian Cable Curl', equipment: 'Low Cable Station', cue: 'Constant stretch tension from behind body.' },
      { name: 'Standing EZ-Bar Curl', equipment: 'EZ Bar & Plates', cue: 'Maximum progressive overload across both heads.' }
    ]
  },
  'hammer_curl': {
    id: 'hammer_curl',
    name: 'Standing Neutral-Grip Hammer Curl',
    targetMuscle: 'Arms (Biceps & Brachialis)',
    primaryEquipment: 'Dumbbells',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Thumbs pointed up throughout. Targets brachialis (pushes bicep peak up) and brachioradialis (forearm thickness).',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg',
    formPoints: [
      'Maintain neutral palms-facing-in grip throughout entire range.',
      'Keep elbows pinned to sides; curl up until forearm touches bicep.',
      'Control lowering phase to build brachialis and forearm thickness.'
    ],
    alternatives: [
      { name: 'Rope Cable Hammer Curl', equipment: 'Low Cable & Rope', cue: 'Smooth continuous resistance curve.' },
      { name: 'Cross-Body Hammer Curl', equipment: 'Dumbbells', cue: 'Biases brachialis with elbow pointed slightly across chest.' }
    ]
  },

  // Legs & Core
  'hack_squat': {
    id: 'hack_squat',
    name: 'Machine Hack Squat / V-Squat',
    targetMuscle: 'Quads (Knee Extension)',
    primaryEquipment: 'Hack Squat Machine',
    mechanics: 'Compound',
    cnsLoad: 'High',
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSecs: 120,
    tips: 'Feet low on platform for maximal knee flexion. Back pinned to pad, descend below parallel. Control 3-second eccentric.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg',
    formPoints: [
      'Position feet shoulder-width, lower on platform for quad emphasis.',
      'Keep lumbar spine flat against back pad throughout descent.',
      'Descend into full knee flexion under a controlled 3-second negative.'
    ],
    alternatives: [
      { name: 'Leg Press (Quad-Dominant)', equipment: '45° Leg Press', cue: 'Feet low and narrow on sled, lower back glued to seat.' },
      { name: 'Smith Machine Squat', equipment: 'Smith Machine', cue: 'Feet slightly forward, upright torso maximizes knee extension.' },
      { name: 'Heels-Elevated Goblet Squat', equipment: 'Dumbbell & Wedge', cue: 'Minimal spinal compression, deep quad stretch.' },
      { name: 'Barbell High-Bar Back Squat', equipment: 'Squat Rack & Barbell', cue: 'Classic builder, drive through mid-foot.' }
    ]
  },
  'romanian_deadlift': {
    id: 'romanian_deadlift',
    name: 'Dumbbell Romanian Deadlift (RDL)',
    targetMuscle: 'Hamstrings & Glutes (Hips & Posterior)',
    primaryEquipment: 'Dumbbells',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSecs: 90,
    tips: 'Soft bend in knees locked in place. Push hips back as if trying to touch wall behind you. Stop when hips stop moving back (shin level).',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg',
    formPoints: [
      'Maintain soft knee bend and push hips backward towards the wall.',
      'Keep weights skimming down your thighs and shins close to body.',
      'Stop when hips cannot travel further back; squeeze glutes to stand.'
    ],
    alternatives: [
      { name: 'Barbell RDL', equipment: 'Barbell & Plates', cue: 'Higher load capacity, strap up to eliminate grip bottleneck.' },
      { name: 'Smith Machine RDL', equipment: 'Smith Machine', cue: 'Stabilized hinge allows pure hamstring stretch focus.' },
      { name: 'Single-Leg Cable RDL', equipment: 'Cable Station', cue: 'Fixes side-to-side imbalances with zero lower back strain.' }
    ]
  },
  'leg_extension': {
    id: 'leg_extension',
    name: 'Seated Quad Leg Extension',
    targetMuscle: 'Quads (Knee Extension)',
    primaryEquipment: 'Leg Extension Machine',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Align knee joint with machine pivot. Hold handles tight to lock pelvis into seat. 1-second pause at full extension.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg',
    formPoints: [
      'Line up knee joints with the red pivot point axis of the machine.',
      'Hold handles firmly to pull your hips deep into the back pad.',
      'Extend fully and pause for 1 second at the top of each rep.'
    ],
    alternatives: [
      { name: 'Sissy Squat (Bodyweight/Weighted)', equipment: 'Bodyweight / Plate', cue: 'Unmatched rectus femoris stretch at deep knee flexion.' },
      { name: 'Reverse Nordic Curl', equipment: 'Mat', cue: 'Bodyweight eccentric quad builder.' }
    ]
  },
  'seated_leg_curl': {
    id: 'seated_leg_curl',
    name: 'Seated Hamstring Leg Curl',
    targetMuscle: 'Hamstrings & Glutes (Hips & Posterior)',
    primaryEquipment: 'Seated Leg Curl Machine',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Seated positions place hamstrings in hip flexion (greater stretch & hypertrophy than lying curl). Lock thigh pad firmly.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg',
    formPoints: [
      'Clamp thigh pad tightly to prevent hip elevation during the curl.',
      'Pull heels firmly towards glutes in a controlled arching motion.',
      'Resist the eccentric back to starting position over 2-3 seconds.'
    ],
    alternatives: [
      { name: 'Lying Leg Curl', equipment: 'Lying Leg Curl Machine', cue: 'Focus on peak contraction with hips pressed into pad.' },
      { name: 'Stability Ball Hamstring Curl', equipment: 'Swiss Ball', cue: 'Combines knee flexion with active glute bridge.' }
    ]
  },
  'standing_calf_raise': {
    id: 'standing_calf_raise',
    name: 'Standing Machine Calf Raise',
    targetMuscle: 'Calves & Core',
    primaryEquipment: 'Standing Calf Machine / Smith Machine',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSecs: 60,
    tips: 'Knees straight to recruit gastrocnemius. Deep 2-second stretch at bottom, explode up onto big toe ball, hold peak for 1s.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg',
    formPoints: [
      'Keep knees locked straight to bias the gastrocnemius muscle.',
      'Sink heels deep into a 2-second dead-stop stretch at the bottom.',
      'Drive up high onto the balls of big toes; hold apex for 1 second.'
    ],
    alternatives: [
      { name: 'Seated Calf Raise', equipment: 'Seated Calf Machine', cue: 'Bent knee shifts load to soleus muscle.' },
      { name: 'Leg Press Calf Press', equipment: 'Leg Press', cue: 'Zero spinal loading, excellent stretch depth.' }
    ]
  },
  'hanging_leg_raise': {
    id: 'hanging_leg_raise',
    name: 'Captain’s Chair / Hanging Leg Raise',
    targetMuscle: 'Calves & Core',
    primaryEquipment: 'Captain’s Chair / Pull-Up Bar',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSecs: 60,
    tips: 'Do not just swing legs. Posteriorly tilt pelvis—roll hips up toward ribcage so lower abs contract, not just hip flexors.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg',
    formPoints: [
      'Support forearms comfortably on pads and engage upper back.',
      'Curl pelvis upward toward your chest instead of just swinging legs.',
      'Lower slowly without allowing your body to swing or hyperextend.'
    ],
    alternatives: [
      { name: 'Cable Rope Crunch', equipment: 'High Cable & Rope', cue: 'Kneeling crunch, round spine to contract rectus abdominis.' },
      { name: 'Decline Bench Reverse Crunch', equipment: 'Decline Bench', cue: 'Safe progressive lower abdominal loading.' }
    ]
  },

  // Shift Day Mobility & Express
  'thoracic_foam_roll': {
    id: 'thoracic_foam_roll',
    name: 'Thoracic Extension Foam Roll & Opener',
    targetMuscle: 'Back (Upper Thickness & Traps)',
    primaryEquipment: 'Foam Roller',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 2,
    defaultReps: '60s',
    defaultRestSecs: 30,
    tips: 'Roll upper back, pause on stiff segments and extend backward over roller without arching lower back. Ideal after long shift sitting/standing.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upper_Back_Stretch/0.jpg',
    formPoints: [
      'Place roller beneath upper shoulder blade region, hands cradling head.',
      'Gently extend backwards over roller without arching lumbar spine.',
      'Breathe deeply into stiff segments for 60 seconds of gentle mobilization.'
    ],
    alternatives: [
      { name: 'Cat-Cow Mobility Flow', equipment: 'Floor Mat', cue: 'Synchronized spinal flexion and extension with breath.' },
      { name: 'Wall Angels', equipment: 'Wall', cue: 'Scapular retraction and thoracic extension posture reset.' }
    ]
  },
  'hip_flexor_stretch': {
    id: 'hip_flexor_stretch',
    name: 'Half-Kneeling Couch / Hip Flexor Stretch',
    targetMuscle: 'Hamstrings & Glutes (Hips & Posterior)',
    primaryEquipment: 'Mat / Bench',
    mechanics: 'Isolation',
    cnsLoad: 'Low',
    defaultSets: 2,
    defaultReps: '45s/side',
    defaultRestSecs: 30,
    tips: 'Tuck tailbone (posterior pelvic tilt), squeeze glute of rear leg, shift hips slightly forward until deep stretch is felt in anterior hip/thigh.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Intermediate_Hip_Flexor_and_Quad_Stretch/0.jpg',
    formPoints: [
      'Take a half-kneeling stance and tuck tailbone under (posterior tilt).',
      'Actively squeeze rear glute to release tension in front hip flexor.',
      'Hold upright posture without collapsing into lower back.'
    ],
    alternatives: [
      { name: 'Standing Quad & Psoas Stretch', equipment: 'Bodyweight', cue: 'Maintain rib-to-pelvis connection.' },
      { name: 'Pigeon Pose', equipment: 'Mat', cue: 'Deep glute and external rotator decompression.' }
    ]
  },
  'shift_pump_circuit': {
    id: 'shift_pump_circuit',
    name: '15-Min Express Shift Pump (Pushups + Band Pull-Aparts)',
    targetMuscle: 'Chest (Mid/Lower Sternal)',
    primaryEquipment: 'Bodyweight & Resistance Band',
    mechanics: 'Compound',
    cnsLoad: 'Low',
    defaultSets: 3,
    defaultReps: '15-20',
    defaultRestSecs: 45,
    tips: 'Continuous movement circuit to drive blood flow without accumulating nervous system fatigue after a draining 12h shift.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg',
    formPoints: [
      'Perform pushups with elbows tucked 45° and core braced solid.',
      'Transition immediately to band pull-aparts to reset posture.',
      'Focus on continuous rhythmic circulation rather than muscular failure.'
    ],
    alternatives: [
      { name: 'Dumbbell Metabolic Pump', equipment: 'Light Dumbbells', cue: 'High-rep lateral raise and bicep curl flow.' },
      { name: 'Bodyweight Mobility Circuit', equipment: 'Bodyweight', cue: 'Restorative circulation flow.' }
    ]
  },
  'seated_leg_press': {
    id: 'seated_leg_press',
    name: 'Seated Leg Press Machine',
    targetMuscle: 'Quads (Knee Extension)',
    primaryEquipment: '45° / Horizontal Leg Press',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 4,
    defaultReps: '10-12',
    defaultRestSecs: 90,
    tips: 'Plant feet shoulder-width mid-platform. Lower sled with control until knees form 90 degrees without rounding lower back off back pad. Press through mid-foot and heels without violently hyperextending knees at apex.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg',
    formPoints: [
      'Maintain firm contact between lower back and back pad throughout entire ROM.',
      'Control eccentric descent (3 seconds) to 90 degrees; avoid bouncing at bottom.',
      'Drive evenly through heels; stop just short of full joint lockout.'
    ],
    alternatives: [
      { name: 'Machine Hack Squat', equipment: 'Hack Squat Machine', cue: 'Controlled sled descent with stable foot placement.' },
      { name: 'Goblet Squat', equipment: 'Dumbbell / Kettlebell', cue: 'Hold weight at chest and squat between hips.' }
    ]
  },
  'machine_chest_press': {
    id: 'machine_chest_press',
    name: 'Seated Machine Chest Press',
    targetMuscle: 'Chest (Mid/Lower Sternal)',
    primaryEquipment: 'Selectorized Chest Machine',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 90,
    tips: 'Adjust seat height so handles align with mid-chest. Retract shoulder blades firmly into pad. Press smoothly into full contraction and control return without letting weight stack crash.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.jpg',
    formPoints: [
      'Align handles at mid-chest level with elbows tucked 45 degrees.',
      'Keep shoulder blades packed against the seat pad throughout the press.',
      'Smooth 2-3 second return to stretch pecs without slamming stack plates.'
    ],
    alternatives: [
      { name: 'Flat Dumbbell Press', equipment: 'Dumbbells & Bench', cue: 'Natural converging press path.' },
      { name: 'Standing Cable Mid-Chest Press', equipment: 'Cable Station', cue: 'Constant tension throughout range.' }
    ]
  },
  'db_romanian_deadlift_light': {
    id: 'db_romanian_deadlift_light',
    name: 'Dumbbell Romanian Deadlift (Form Focus)',
    targetMuscle: 'Hamstrings & Glutes (Hips & Posterior)',
    primaryEquipment: 'Light Dumbbells',
    mechanics: 'Compound',
    cnsLoad: 'Moderate',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSecs: 90,
    tips: 'Stand with soft knees. Push hips back as if touching a wall behind you while keeping dumbbells grazing down your shins. Feel deep hamstring stretch and squeeze glutes to return upright.',
    visualGifUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift_from_Deficit/0.jpg',
    formPoints: [
      'Maintain slight bend in knees; movement is a pure hip hinge backward.',
      'Keep dumbbells tight to legs; do not let spine round or slouch forward.',
      'Drive hips forward to stand; squeeze glutes at the top without hyperextending.'
    ],
    alternatives: [
      { name: 'Seated Hamstring Leg Curl', equipment: 'Leg Curl Machine', cue: 'Pure knee flexion with zero lower back strain.' },
      { name: 'Glute Bridge', equipment: 'Mat & Light Dumbbell', cue: 'Direct glute contraction with stable floor support.' }
    ]
  },
};
