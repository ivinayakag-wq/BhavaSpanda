const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export type SunSign = (typeof SIGNS)[number];

const ELEMENT: Record<SunSign, string> = {
  Aries: "fire", Leo: "fire", Sagittarius: "fire",
  Taurus: "earth", Virgo: "earth", Capricorn: "earth",
  Gemini: "air", Libra: "air", Aquarius: "air",
  Cancer: "water", Scorpio: "water", Pisces: "water",
};

const NATURE: Record<SunSign, string> = {
  Aries: "movable", Cancer: "movable", Libra: "movable", Capricorn: "movable",
  Taurus: "fixed", Leo: "fixed", Scorpio: "fixed", Aquarius: "fixed",
  Gemini: "dual", Virgo: "dual", Sagittarius: "dual", Pisces: "dual",
};

const GENDER: Record<SunSign, string> = {
  Aries: "male", Taurus: "female", Gemini: "male", Cancer: "female",
  Leo: "male", Virgo: "female", Libra: "male", Scorpio: "female",
  Sagittarius: "male", Capricorn: "female", Aquarius: "male", Pisces: "female",
};

const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  fire: { fire: 1, earth: 0, air: 1, water: -1 },
  earth: { fire: 0, earth: 1, air: -1, water: 1 },
  air: { fire: 1, earth: -1, air: 1, water: 0 },
  water: { fire: -1, earth: 1, air: 0, water: 1 },
};

function indexOf(sign: string): number {
  return SIGNS.indexOf(sign as SunSign);
}

function relationshipBonus(sign1: string, sign2: string): number {
  if (sign1 === sign2) return 0;
  const diff = (indexOf(sign2) - indexOf(sign1) + 12) % 12;
  if ([1, 4, 5, 7, 10, 11].includes(diff)) return 10;
  if ([2, 3, 9].includes(diff)) return 5;
  return -5;
}

function computeScore(sign1: string, sign2: string): number {
  if (sign1 === sign2) {
    const sameSignScores: Record<string, number> = {
      Aries: 70, Taurus: 65, Gemini: 75, Cancer: 70,
      Leo: 72, Virgo: 68, Libra: 73, Scorpio: 78,
      Sagittarius: 74, Capricorn: 66, Aquarius: 76, Pisces: 72,
    };
    return sameSignScores[sign1] ?? 70;
  }

  const e1 = ELEMENT[sign1 as SunSign] ?? "";
  const e2 = ELEMENT[sign2 as SunSign] ?? "";
  const elemBonus = (ELEMENT_COMPAT[e1]?.[e2] ?? 0) * 15;
  const relBonus = relationshipBonus(sign1, sign2);
  const genderMatch = GENDER[sign1 as SunSign] !== GENDER[sign2 as SunSign] ? 5 : 0;

  return Math.max(0, Math.min(100, 50 + elemBonus + relBonus + genderMatch));
}

function generateDescription(sign1: string, sign2: string): string {
  if (sign1 === sign2) {
    const descs: Record<string, string> = {
      Aries: "Two Rams create a dynamic, competitive bond full of passion and drive. Learning to share the spotlight is key.",
      Taurus: "Double Taurus brings deep sensuality and stubbornness in equal measure. Stability is your superpower when you don't dig in your heels.",
      Gemini: "A meeting of two curious minds. Conversation flows endlessly, but grounding each other in shared routines builds lasting love.",
      Cancer: "Profound emotional depth defines this pairing. You understand each other's moods without words — a rare gift that requires gentle handling.",
      Leo: "Double Leo radiates warmth, creativity, and charisma. The challenge is ensuring the stage is big enough for both stars.",
      Virgo: "Two meticulous hearts find beauty in details and order. Remember to loosen perfectionism and embrace life's beautiful mess.",
      Libra: "Harmony and romance abound when two Libras meet. Decision-making may stall, but your shared love for beauty creates a graceful life.",
      Scorpio: "Intensity squared. This bond is transformative, magnetic, and deeply healing — but only if both partners embrace vulnerability.",
      Sagittarius: "Freedom-loving archers together means adventure never ends. Building a home base between journeys strengthens this spirited match.",
      Capricorn: "Ambitious and grounded, two Capricorns build empires together. Don't forget to celebrate the small joys along the climb.",
      Aquarius: "Two visionaries dreaming of a better world. Your intellectual connection is electrifying — remember to tend to the heart too.",
      Pisces: "Dreamers in love create a world of poetry and compassion. Stay anchored enough to navigate practical life together.",
    };
    return descs[sign1] ?? "A powerful connection of shared essence and understanding.";
  }

  const e1 = ELEMENT[sign1 as SunSign] ?? "";
  const e2 = ELEMENT[sign2 as SunSign] ?? "";
  const n1 = NATURE[sign1 as SunSign] ?? "";
  const n2 = NATURE[sign2 as SunSign] ?? "";

  const elementPhrases: Record<string, Record<string, string>> = {
    fire: {
      fire: "Two sparks create a blazing bonfire — passionate and inspiring, but watch for burnout.",
      earth: "Fire inspires earth to dream, earth grounds fire's flames. A nurturing cycle of action and stability.",
      air: "Fire and air fuel each other's growth. Ideas ignite action, and the adventure never stalls.",
      water: "Fire sizzles against water's depths. Passion meets emotion — challenging yet profoundly transformative.",
    },
    earth: {
      fire: "Earth provides the foundation fire needs to burn safely. A steady, productive partnership.",
      earth: "Deeply rooted and practical, this pair builds a life of substance and security. Growth takes time but lasts.",
      air: "Earth and air can struggle to meet — one seeks tangibility, the other ideas. Bridging this gap brings balance.",
      water: "Water nourishes earth, earth gives water form. A naturally fertile bond that grows richer with time.",
    },
    air: {
      fire: "Air fans fire's flames into brilliance. An exhilarating partnership of ideas and action.",
      earth: "Air's ideas need earth's practicality to land. Patience and translation make this pair unstoppable.",
      air: "Boundless intellectual synergy — two minds exploring the cosmos together. Remember to come back down to earth.",
      water: "Air ripples water's surface, water gives air's thoughts emotional weight. A poetic and thoughtful match.",
    },
    water: {
      fire: "Water tempers fire, fire transforms water into steam. Intense chemistry that demands respect and space.",
      earth: "Water flows through earth's valleys, earth shapes water's path. A deeply supportive, natural harmony.",
      air: "Water feels and air thinks — understanding this difference is the bridge between heart and mind.",
      water: "Emotions run deep and wordless understanding flows between you. Tend to boundaries to avoid drowning in feeling.",
    },
  };

  const phrase = elementPhrases[e1]?.[e2] ?? "A balanced meeting of different cosmic energies.";
  const naturePhrase =
    n1 === n2
      ? `Both share a ${n1} nature, amplifying their natural rhythm together.`
      : `Their ${n1} and ${n2} natures bring complementary — sometimes challenging — pacing.`;

  return `${phrase} ${naturePhrase}`;
}

type Entry = { score: number; description: string };

const matrix: Record<string, Record<string, Entry>> = {} as any;

for (const s1 of SIGNS) {
  matrix[s1] = {} as Record<string, Entry>;
  for (const s2 of SIGNS) {
    matrix[s1][s2] = {
      score: computeScore(s1, s2),
      description: generateDescription(s1, s2),
    };
  }
}

export const sunSignCompatibility: Readonly<Record<string, Readonly<Record<string, Readonly<Entry>>>>> = matrix;

export function getSunSignCompatibility(sign1: string, sign2: string): Entry {
  return sunSignCompatibility[sign1]?.[sign2] ?? { score: 50, description: "Neutral compatibility. More data needed." };
}

export function getElement(sign: string): string {
  return ELEMENT[sign as SunSign] ?? "unknown";
}

export function getNature(sign: string): string {
  return NATURE[sign as SunSign] ?? "unknown";
}
