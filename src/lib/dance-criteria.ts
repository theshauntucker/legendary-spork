/**
 * Style-specific and entry-type-specific judging criteria for dance/cheer analysis.
 * This is the single source of truth imported by the AI prompt builder.
 */

export interface StyleCriteria {
  styleDefinition: string;
  techniqueEmphasis: string[];
  performanceEmphasis: string[];
  choreographyEmphasis: string[];
  judgeVocabulary: string[];
  commonDeductions: string[];
}

export interface EntryTypeCriteria {
  additionalMetrics: string[];
  scoringNotes: string;
}

export const STYLE_CRITERIA: Record<string, StyleCriteria> = {
  Jazz: {
    styleDefinition:
      "Jazz dance emphasizes sharp, rhythmic movements with isolations, dynamic energy, and a blend of classical technique with contemporary flair. It demands strong musicality, clean lines, and explosive power.",
    techniqueEmphasis: [
      "sharp isolations and body control",
      "clean turns (pirouettes, chaînés) with spot",
      "high leaps with split and extension",
      "strength and power in movement execution",
      "pointed feet and stretched lines",
    ],
    performanceEmphasis: [
      "sustained high energy throughout",
      "attack on musical accents and hits",
      "confident stage presence and projection",
      "character and sass appropriate to the piece",
    ],
    choreographyEmphasis: [
      "use of syncopation and musical accents",
      "dynamic contrast between sharp and smooth",
      "creative transitions between phrases",
      "effective use of levels and directional changes",
    ],
    judgeVocabulary: ["attack", "placement", "isolation", "projection", "musicality", "extension"],
    commonDeductions: [
      "soft or incomplete isolations",
      "lack of energy in transitions",
      "sickled feet in jumps or turns",
      "off-balance turns",
      "losing character between movements",
    ],
  },
  Contemporary: {
    styleDefinition:
      "Contemporary dance blends ballet and modern techniques, emphasizing fluidity, emotional expression, and innovative movement exploration. It values vulnerability, breath-driven movement, and artistic risk-taking.",
    techniqueEmphasis: [
      "fluid transitions between movements",
      "controlled floor work and weight shifts",
      "balance and suspension",
      "articulation through the spine",
      "parallel and turned-out positions with intention",
    ],
    performanceEmphasis: [
      "authentic emotional connection",
      "vulnerability and raw expression",
      "breath-driven movement quality",
      "storytelling through the body",
    ],
    choreographyEmphasis: [
      "innovative movement vocabulary",
      "use of breath and suspension in phrasing",
      "meaningful use of stillness and negative space",
      "artistic risk-taking and originality",
    ],
    judgeVocabulary: ["fluidity", "intention", "breath", "weight", "suspension", "articulation"],
    commonDeductions: [
      "movement without clear intention",
      "disconnection from emotional content",
      "rough transitions in and out of floor work",
      "forced rather than organic movement",
      "lack of dynamic range",
    ],
  },
  Lyrical: {
    styleDefinition:
      "Lyrical dance combines ballet and jazz with deep emotional storytelling, using fluid, expressive movement to interpret song lyrics and melody. Musicality and genuine feeling are paramount.",
    techniqueEmphasis: [
      "fluid movement quality with ballet foundation",
      "controlled extensions and développés",
      "smooth transitions between positions",
      "graceful port de bras",
      "soft landings and controlled relevés",
    ],
    performanceEmphasis: [
      "genuine emotional expression and storytelling",
      "music interpretation — dancing WITH the lyrics",
      "dynamics matching the song's emotional arc",
      "eye focus and facial expression supporting the narrative",
    ],
    choreographyEmphasis: [
      "movement choices that reflect the lyrics/mood",
      "musical phrasing and breath alignment",
      "effective emotional build and resolution",
      "balanced use of traveling and grounded movement",
    ],
    judgeVocabulary: ["expression", "musicality", "phrasing", "fluidity", "artistry", "dynamics"],
    commonDeductions: [
      "performing emotion without technical control",
      "not connecting movement to the music/lyrics",
      "abrupt transitions breaking the flow",
      "overuse of one level or spatial pattern",
      "generic facial expression not matching choreographic intent",
    ],
  },
  "Hip Hop": {
    styleDefinition:
      "Hip Hop dance encompasses a range of street-originated styles emphasizing rhythm, groove, isolations, and musicality. It demands authentic bounce, confidence, and strong connection to the beat.",
    techniqueEmphasis: [
      "rhythm consistency and groove",
      "sharp hits and accents on the beat",
      "body control and isolations",
      "groundedness and bounce",
      "clean popping, locking, or breaking elements if used",
    ],
    performanceEmphasis: [
      "authentic energy and swag",
      "confidence and command of the stage",
      "commitment to the character/vibe of the music",
      "crowd engagement and presence",
    ],
    choreographyEmphasis: [
      "musicality and beat-riding",
      "creative use of levels and dynamics",
      "originality in movement vocabulary",
      "effective use of accents, stops, and pauses",
    ],
    judgeVocabulary: ["groove", "bounce", "hits", "swag", "pocket", "texture"],
    commonDeductions: [
      "dancing on top of the beat rather than in the pocket",
      "lack of authentic groove or bounce",
      "too much ballet/jazz technique bleeding through",
      "losing energy between combos",
      "movements too soft for the style",
    ],
  },
  Tap: {
    styleDefinition:
      "Tap dance uses rhythmic footwork to create percussive sound patterns. Dancers are both visual performers and musicians, judged on clarity of sound, rhythmic complexity, and showmanship.",
    techniqueEmphasis: [
      "clarity and crispness of tap sounds",
      "rhythmic accuracy and timing",
      "weight distribution and heel-toe articulation",
      "speed and control in complex footwork",
      "clean shuffles, flaps, pulls, and wings",
    ],
    performanceEmphasis: [
      "showmanship and personality",
      "upper body carriage while maintaining footwork",
      "musicality — dancing with the music, not just on it",
      "confident stage presence",
    ],
    choreographyEmphasis: [
      "rhythmic variety and complexity",
      "musical interpretation and improvisation",
      "effective use of dynamics (loud/soft)",
      "creative rhythmic patterns and syncopation",
    ],
    judgeVocabulary: ["clarity", "articulation", "rhythm", "syncopation", "musicianship", "crispness"],
    commonDeductions: [
      "muddy or unclear tap sounds",
      "losing timing in complex rhythmic passages",
      "upper body neglected — arms/face disconnected",
      "flat dynamics without volume variation",
      "shuffling or dragging instead of clean articulation",
    ],
  },
  Ballet: {
    styleDefinition:
      "Ballet is the foundational classical dance form emphasizing turnout, line, placement, and refined technique. It demands precision, grace, and years of disciplined training.",
    techniqueEmphasis: [
      "proper turnout from the hips",
      "clean line and placement in all positions",
      "controlled adagio and sustained balance",
      "clean pirouettes with proper preparation and finish",
      "pointed feet with proper arch engagement",
    ],
    performanceEmphasis: [
      "refined épaulement and port de bras",
      "graceful stage presence and classical quality",
      "musicality within classical form",
      "artistry that elevates technique beyond mechanics",
    ],
    choreographyEmphasis: [
      "appropriate classical vocabulary for the level",
      "effective use of classical structure (adagio, allegro)",
      "musicality and phrasing within classical framework",
      "balanced showcasing of technical elements",
    ],
    judgeVocabulary: ["turnout", "placement", "line", "épaulement", "aplomb", "port de bras"],
    commonDeductions: [
      "forced turnout from the knees",
      "broken line in arabesque or attitude",
      "lack of proper preparation for turns",
      "rolling ankles or sickled feet on relevé",
      "stiff or unmusical movement quality",
    ],
  },
  "Musical Theater": {
    styleDefinition:
      "Musical Theater dance combines acting, singing presence, and choreography to tell stories. It demands strong character work, versatility, and the ability to communicate narrative through movement.",
    techniqueEmphasis: [
      "versatile technique spanning jazz, ballet, and character movement",
      "clear body lines that support character portrayal",
      "strong turns and kicks executed in character",
      "precision in stylized movement vocabulary",
    ],
    performanceEmphasis: [
      "strong character commitment and acting",
      "facial expression that tells the story",
      "vocal energy and breath support even while dancing",
      "audience engagement and theatrical projection",
    ],
    choreographyEmphasis: [
      "storytelling through movement choices",
      "style-appropriate vocabulary (Golden Age vs contemporary MT)",
      "effective staging and character interaction",
      "moments of comedy, drama, or emotion well-placed",
    ],
    judgeVocabulary: ["character", "storytelling", "projection", "commitment", "versatility", "presence"],
    commonDeductions: [
      "breaking character between movements",
      "generic performance without specific character choices",
      "technique overshadowing storytelling",
      "lack of theatrical projection",
      "face not matching the narrative intent",
    ],
  },
  Pom: {
    styleDefinition:
      "Pom dance features sharp, synchronized movements with pom-poms, emphasizing precision, uniform execution, and high energy. It originates from spirit/cheer traditions and demands team unity.",
    techniqueEmphasis: [
      "sharp arm motions with clean angles",
      "precise pom placement and visibility",
      "tight formations and spacing",
      "synchronized movement execution",
      "strong kicks and jumps",
    ],
    performanceEmphasis: [
      "high energy and enthusiasm throughout",
      "uniform facial expression and team spirit",
      "crowd engagement and showmanship",
      "confident projection to all sections of audience",
    ],
    choreographyEmphasis: [
      "creative pom patterns and visual effects",
      "effective formation changes",
      "dynamic use of levels with poms",
      "musicality in arm placement timing",
    ],
    judgeVocabulary: ["precision", "uniformity", "sharpness", "formations", "energy", "visual effects"],
    commonDeductions: [
      "inconsistent pom placement across the team",
      "soft or lazy arm motions",
      "formation breakdowns or spacing issues",
      "poms blocking face or creating visual clutter",
      "uneven energy levels across performers",
    ],
  },
  Acro: {
    styleDefinition:
      "Acro dance seamlessly blends acrobatic elements with dance technique. It demands mastery of both trick execution and artistic dance movement, with safety and controlled landings being paramount.",
    techniqueEmphasis: [
      "clean execution of acrobatic tricks",
      "controlled landings and smooth transitions into/out of tricks",
      "flexibility demonstrated safely",
      "balance and stability in acrobatic elements",
      "dance technique maintained between acrobatic passes",
    ],
    performanceEmphasis: [
      "seamless integration — tricks feel like part of the dance",
      "confidence and showmanship during acrobatic elements",
      "consistent energy between tricks and dance sections",
      "performance quality not sacrificed for tricks",
    ],
    choreographyEmphasis: [
      "tricks integrated into the choreographic narrative",
      "variety of acrobatic elements (not repetitive)",
      "dance content balanced with acrobatic content",
      "creative transitions between tricks and dance",
    ],
    judgeVocabulary: ["execution", "landing", "integration", "control", "flexibility", "difficulty"],
    commonDeductions: [
      "wobbly or uncontrolled landings",
      "pausing before/after tricks — breaking the dance flow",
      "tricks that feel disconnected from the choreography",
      "repetitive trick selection",
      "dance sections significantly weaker than acro sections",
    ],
  },
  Cheer: {
    styleDefinition:
      "Competitive cheer combines stunts, tumbling, jumps, and dance with sharp precision and team synchronization. It emphasizes crowd appeal, energy, and flawless execution under high-energy conditions.",
    techniqueEmphasis: [
      "sharp motions with clean arm placement",
      "jump technique — height, form, and toe touch",
      "tumbling execution and landing control",
      "stunting stability and form",
      "synchronized team movement",
    ],
    performanceEmphasis: [
      "explosive energy and crowd appeal",
      "sharp facials and vocal energy",
      "team unity in expression and timing",
      "confidence and showmanship throughout",
    ],
    choreographyEmphasis: [
      "effective transitions between sections",
      "creative formation changes",
      "difficulty progression throughout the routine",
      "balance of stunts, tumbling, jumps, and dance",
    ],
    judgeVocabulary: ["execution", "sharpness", "difficulty", "synchronization", "crowd appeal", "transitions"],
    commonDeductions: [
      "bobbles or falls in stunts",
      "incomplete tumbling passes",
      "low jump height or poor form at peak",
      "timing breaks between sections",
      "lack of sharpness in motions",
    ],
  },
  "Open / Freestyle": {
    styleDefinition:
      "Open/Freestyle category allows creative fusion of multiple dance styles. Judges look for cohesive artistry, technical versatility, and innovative choreography that transcends single-style boundaries.",
    techniqueEmphasis: [
      "versatility across multiple techniques",
      "clean execution regardless of style blending",
      "controlled transitions between different movement qualities",
      "technical proficiency in each style referenced",
    ],
    performanceEmphasis: [
      "cohesive artistic vision despite style variety",
      "authentic commitment to each style element",
      "dynamic range and versatility in performance quality",
      "clear artistic intent throughout",
    ],
    choreographyEmphasis: [
      "innovative fusion of styles",
      "cohesive artistic narrative despite variety",
      "creative transitions between style elements",
      "originality in movement vocabulary",
    ],
    judgeVocabulary: ["versatility", "innovation", "fusion", "artistry", "originality", "cohesion"],
    commonDeductions: [
      "styles feel disjointed rather than fused",
      "one style significantly weaker than others",
      "lack of artistic cohesion",
      "style switches that feel random rather than intentional",
      "technique inconsistency across styles",
    ],
  },
  Clogging: {
    styleDefinition:
      "Clogging is a percussive folk dance emphasizing rhythmic footwork with clogging shoes. It demands precise timing, clear sound production, and energetic performance rooted in Appalachian tradition.",
    techniqueEmphasis: [
      "precise footwork with clear rhythmic patterns",
      "proper weight distribution and foot articulation",
      "speed and control in complex steps",
      "clean double-toe and buck-step execution",
      "consistency of sound quality",
    ],
    performanceEmphasis: [
      "energetic and joyful performance quality",
      "authentic connection to the musical style",
      "upper body engagement and arm styling",
      "confident showmanship",
    ],
    choreographyEmphasis: [
      "rhythmic creativity and pattern variety",
      "effective use of traditional and contemporary elements",
      "musical interpretation",
      "dynamic contrast in footwork complexity",
    ],
    judgeVocabulary: ["rhythm", "precision", "footwork", "timing", "energy", "authenticity"],
    commonDeductions: [
      "muddy or unclear footwork sounds",
      "inconsistent timing in syncopated patterns",
      "upper body stiff or disconnected",
      "repetitive step patterns",
      "losing the rhythmic foundation",
    ],
  },
  Pointe: {
    styleDefinition:
      "Pointe work is the apex of classical ballet technique, performed on the tips of fully extended feet using pointe shoes. It demands exceptional strength, balance, and years of preparatory training.",
    techniqueEmphasis: [
      "fully articulated rise through demi-pointe to full pointe",
      "stable balance and controlled relevés",
      "clean transitions between positions on pointe",
      "proper weight placement over the box",
      "silent and controlled descents from pointe",
    ],
    performanceEmphasis: [
      "effortless quality — concealing the difficulty",
      "classical grace and elegance",
      "musical sensitivity and phrasing",
      "refined épaulement and upper body carriage",
    ],
    choreographyEmphasis: [
      "appropriate difficulty level for the dancer",
      "effective balance of relevé, traveling, and turning on pointe",
      "classical structure and musicality",
      "well-placed moments of ballon and suspension",
    ],
    judgeVocabulary: ["alignment", "strength", "placement", "articulation", "grace", "control"],
    commonDeductions: [
      "rolling over the box or unstable ankles",
      "audible thumping on relevé or descent",
      "insufficient rise to full pointe",
      "breaking at the waist for balance",
      "pointe work that appears strained rather than effortless",
    ],
  },
  Character: {
    styleDefinition:
      "Character dance draws from folk and national dance traditions, adapted for the stage with theatrical flair. It demands authentic style representation, strong acting, and culturally informed movement.",
    techniqueEmphasis: [
      "authentic folk/character movement vocabulary",
      "strong footwork appropriate to the tradition",
      "proper carriage and stylistic posture",
      "controlled and stylized jumps and turns",
    ],
    performanceEmphasis: [
      "convincing character portrayal",
      "culturally respectful and authentic expression",
      "theatrical projection and stage presence",
      "energy appropriate to the character/tradition",
    ],
    choreographyEmphasis: [
      "authentic representation of the cultural style",
      "effective storytelling through traditional movement",
      "creative staging with character-appropriate elements",
      "musical choices that support the cultural context",
    ],
    judgeVocabulary: ["authenticity", "character", "tradition", "portrayal", "styling", "presence"],
    commonDeductions: [
      "inauthentic or superficial style representation",
      "breaking character during the performance",
      "generic movement not specific to the tradition",
      "costume or props not integrated with movement",
      "lack of research into the cultural context",
    ],
  },
  Improvisation: {
    styleDefinition:
      "Improvisation challenges dancers to create movement spontaneously, demonstrating their technical range, musicality, and artistic instinct in real time. It reveals a dancer's true movement vocabulary.",
    techniqueEmphasis: [
      "range of technical vocabulary demonstrated",
      "clean execution under spontaneous conditions",
      "use of varied movement qualities and dynamics",
      "floor work, standing, and aerial elements",
    ],
    performanceEmphasis: [
      "genuine in-the-moment connection",
      "responsiveness to the music in real time",
      "confidence and commitment to choices",
      "emotional authenticity and vulnerability",
    ],
    choreographyEmphasis: [
      "organic phrase development",
      "spatial awareness and use of the full stage",
      "dynamic range and contrast",
      "ability to develop and revisit movement ideas",
    ],
    judgeVocabulary: ["spontaneity", "musicality", "range", "commitment", "instinct", "authenticity"],
    commonDeductions: [
      "falling back on rehearsed combinations",
      "repetitive movement patterns",
      "not responding to the music",
      "playing it safe without taking risks",
      "losing focus or energy mid-improvisation",
    ],
  },
};

export const ENTRY_TYPE_CRITERIA: Record<string, EntryTypeCriteria> = {
  Solo: {
    additionalMetrics: [],
    scoringNotes:
      "Evaluate individual technique, artistry, and stage presence. The spotlight is entirely on one performer — every detail is visible.",
  },
  "Duo/Trio": {
    additionalMetrics: ["partner chemistry and connection", "timing between performers", "use of complementary movement"],
    scoringNotes:
      "Under Technique, also evaluate timing between performers. Under Choreography, assess how partner interactions enhance the piece.",
  },
  "Small Group": {
    additionalMetrics: ["synchronization and unison timing", "formation clarity and spacing", "visual impact as a group"],
    scoringNotes:
      "Under Technique, evaluate unison timing and formation execution. Under Choreography, assess formation changes, spatial design, and how group dynamics serve the piece.",
  },
  "Large Group": {
    additionalMetrics: [
      "precision and uniformity across all members",
      "formation transitions and spacing discipline",
      "visual cohesion from a judges-table perspective",
    ],
    scoringNotes:
      "Under Technique, prioritize uniformity — identical timing, lines, and energy across all members. Under Choreography, evaluate the visual impact of formations, ripple effects, and group patterns.",
  },
  Line: {
    additionalMetrics: [
      "line uniformity and precision",
      "formation spacing and alignment",
      "synchronization across the full line",
    ],
    scoringNotes:
      "Under Technique, evaluate absolute synchronization and identical execution. Under Choreography, assess creative use of the large ensemble format (ripples, waves, cascades).",
  },
  "Super Line": {
    additionalMetrics: [
      "extreme precision across a very large ensemble",
      "formation clarity at scale",
      "visual impact and wow factor from audience perspective",
    ],
    scoringNotes:
      "Under Technique, synchronization must be near-flawless at this scale. Under Choreography, evaluate large-scale visual effects and the ambition of formation design.",
  },
  Production: {
    additionalMetrics: [
      "theatrical cohesion and production value",
      "effective use of props, costumes, or set pieces if present",
      "storytelling arc across the full production",
      "cast coordination across multiple sections",
    ],
    scoringNotes:
      "Under Performance, evaluate theatrical elements, storytelling, and production value. Under Choreography, assess the narrative arc, section transitions, and how all elements serve the overall vision.",
  },
  "Extended Line": {
    additionalMetrics: [
      "uniformity across the extended ensemble",
      "formation precision and spacing",
      "sustained energy across all members",
    ],
    scoringNotes:
      "Under Technique, evaluate synchronization consistency even at large scale. Under Performance, assess whether energy is sustained uniformly across all performers.",
  },
};

/**
 * Get competition benchmark context for an age/style/entry combination.
 */
export function getCompetitionContext(ageGroup: string, style: string, entryType: string): {
  benchmarkContext: string;
  ageStyleNote: string;
} {
  const age = ageGroup.split(" ")[0]; // "Senior" from "Senior (15-19)"

  // High-competition categories
  const highCompetition = ["Contemporary", "Lyrical", "Jazz"];
  const isHighComp = highCompetition.includes(style);

  const isGroup = ["Small Group", "Large Group", "Line", "Super Line", "Production", "Extended Line"].includes(entryType);
  const isSeniorPlus = ["Senior", "Adult"].includes(age);
  const isYounger = ["Mini", "Petite"].includes(age);

  let benchmarkContext = "";
  if (isHighComp && isSeniorPlus) {
    benchmarkContext = `${age} ${style} is one of the most competitive categories at regional and national competitions. Expect higher average scores and tighter margins between award levels.`;
  } else if (isHighComp) {
    benchmarkContext = `${style} is a popular and competitive style. ${age}-division dancers are evaluated with age-appropriate expectations, but strong technique is still expected.`;
  } else if (isSeniorPlus) {
    benchmarkContext = `${age} ${style} competitors are expected to show mature technique and artistry. This category may have fewer entries but high individual quality.`;
  } else if (isYounger) {
    benchmarkContext = `${age}-division ${style} is scored with developmental expectations. Judges look for age-appropriate technique, performance quality, and joy in movement.`;
  } else {
    benchmarkContext = `${age} ${style} is scored against regional competition standards. Judges evaluate technique, performance, and choreography appropriate to the age and style.`;
  }

  let ageStyleNote = "";
  if (isSeniorPlus && isHighComp) {
    ageStyleNote = `For ${age}-division ${style}, judges expect advanced technique, mature emotional expression, and polished artistry.`;
  } else if (isGroup) {
    ageStyleNote = `For ${age} ${entryType} entries, synchronization and formation precision are weighted heavily alongside individual technique.`;
  } else if (isYounger) {
    ageStyleNote = `For ${age} dancers, judges prioritize clean fundamentals, age-appropriate performance quality, and evident training foundations.`;
  } else {
    ageStyleNote = `For ${age}-division ${style}, judges look for solid technique, genuine performance quality, and choreography that showcases the dancer's strengths.`;
  }

  return { benchmarkContext, ageStyleNote };
}
