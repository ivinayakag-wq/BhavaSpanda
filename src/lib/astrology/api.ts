const NAVAMSHA_BASE = "https://api.navamsha.in";
const API_KEY = process.env.NAVAMSHA_API_KEY || "vda_live_2e7afa1a_lMy_iiNrJqNCaL3qFnV6uEVV79icZTxTNARGTCjD_Ps";

export interface BirthInput {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds?: number;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface PlanetData {
  name: string;
  sign: string;
  signLord: string;
  nakshatra: string;
  nakshatraPada: number;
  nakshatraLord: string;
  house: number;
  degree: number;
  isRetro: boolean;
}

export interface KundaliResult {
  ascendant: {
    sign: string;
    signLord: string;
    nakshatra: string;
    nakshatraPada: number;
    degree: number;
  };
  planets: PlanetData[];
  sunSign: string;
  moonSign: string;
  nakshatra: string;
  rawData: any;
}

export interface AshtakootResult {
  totalScore: number;
  effectiveTotalScore: number;
  maximumScore: number;
  kootas: Record<string, { score: number; maximum: number; brideValue: string; groomValue: string }>;
  recommendation: string;
  rawData: any;
}

function toVedicSignName(englishName: string): string {
  const map: Record<string, string> = {
    Aries: "Aries", Taurus: "Taurus", Gemini: "Gemini", Cancer: "Cancer",
    Leo: "Leo", Virgo: "Virgo", Libra: "Libra", Scorpio: "Scorpio",
    Sagittarius: "Sagittarius", Capricorn: "Capricorn", Aquarius: "Aquarius", Pisces: "Pisces",
  };
  return map[englishName] || englishName;
}

async function navamshaFetch(endpoint: string, body: any): Promise<any> {
  const res = await fetch(`${NAVAMSHA_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Navamsha API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data;
}

export async function fetchKundali(input: BirthInput): Promise<KundaliResult> {
  const data = await navamshaFetch("/api/v1/kundali/basic", {
    year: input.year,
    month: input.month,
    date: input.date,
    hours: input.hours,
    minutes: input.minutes,
    seconds: input.seconds ?? 0,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
  });

  const output = data.output;
  const asc = output.ascendant;
  const planets = output.planets;

  const sun = planets.Sun || {};
  const moon = planets.Moon || {};

  const planetList: PlanetData[] = Object.entries(planets).map(([name, p]: [string, any]) => ({
    name,
    sign: toVedicSignName(p.zodiac_sign_name),
    signLord: p.zodiac_sign_lord,
    nakshatra: p.nakshatra_name,
    nakshatraPada: p.nakshatra_pada,
    nakshatraLord: p.nakshatra_vimsottari_lord,
    house: p.house_number,
    degree: p.normDegree,
    isRetro: p.isRetro === "true",
  }));

  return {
    ascendant: {
      sign: toVedicSignName(asc.zodiac_sign_name),
      signLord: asc.zodiac_sign_lord,
      nakshatra: asc.nakshatra_name,
      nakshatraPada: asc.nakshatra_pada,
      degree: asc.normDegree,
    },
    planets: planetList,
    sunSign: toVedicSignName(sun.zodiac_sign_name || ""),
    moonSign: toVedicSignName(moon.zodiac_sign_name || ""),
    nakshatra: moon.nakshatra_name || "",
    rawData: output,
  };
}

export async function fetchAshtakoot(
  bride: BirthInput,
  groom: BirthInput
): Promise<AshtakootResult> {
  const data = await navamshaFetch("/api/v1/compatibility/ashtakoot", {
    bride: {
      year: bride.year, month: bride.month, date: bride.date,
      hours: bride.hours, minutes: bride.minutes, seconds: bride.seconds ?? 0,
      latitude: bride.latitude, longitude: bride.longitude, timezone: bride.timezone,
    },
    groom: {
      year: groom.year, month: groom.month, date: groom.date,
      hours: groom.hours, minutes: groom.minutes, seconds: groom.seconds ?? 0,
      latitude: groom.latitude, longitude: groom.longitude, timezone: groom.timezone,
    },
  });

  const output = data.output;
  const breakdown = output.breakdown || {};

  const kootas: Record<string, { score: number; maximum: number; brideValue: string; groomValue: string }> = {};
  for (const [key, val] of Object.entries(breakdown)) {
    const k = val as any;
    kootas[key] = {
      score: k.score ?? 0,
      maximum: k.maximum ?? 0,
      brideValue: k.bride_value ?? "",
      groomValue: k.groom_value ?? "",
    };
  }

  return {
    totalScore: output.total_score ?? 0,
    effectiveTotalScore: output.effective_total_score ?? output.total_score ?? 0,
    maximumScore: output.maximum_score ?? 36,
    kootas,
    recommendation: output.effective_total_score >= 24 ? "Strong" : output.effective_total_score >= 18 ? "Good" : "Challenging",
    rawData: output,
  };
}

export function parseBirthDetails(profile: any): BirthInput | null {
  if (!profile.birth_date || !profile.birth_time) return null;

  const bd = new Date(profile.birth_date);
  if (isNaN(bd.getTime())) return null;

  const timeParts = (profile.birth_time || "00:00").split(":");
  const hours = parseInt(timeParts[0], 10) || 0;
  const minutes = parseInt(timeParts[1], 10) || 0;

  let lat = 0, lng = 0, tz = 5.5;

  if (profile.birth_location) {
    const parts = profile.birth_location.split(",");
    if (parts.length >= 2) {
      lat = parseFloat(parts[0]) || 0;
      lng = parseFloat(parts[1]) || 0;
    }
  }

  if (profile.birth_timezone) {
    tz = parseFloat(profile.birth_timezone) || 5.5;
  }

  return {
    year: bd.getFullYear(),
    month: bd.getMonth() + 1,
    date: bd.getDate(),
    hours,
    minutes,
    latitude: lat,
    longitude: lng,
    timezone: tz,
  };
}

export function getNakshatraSign(nakshatra: string): string {
  const map: Record<string, string> = {
    Ashwini: "Aries", Bharani: "Aries", Krittika: "Aries",
    Rohini: "Taurus", Mrigashira: "Taurus",
    Ardra: "Gemini", Punarvasu: "Gemini",
    Pushya: "Cancer", Ashlesha: "Cancer",
    Magha: "Leo", "Purva Phalguni": "Leo", "Uttara Phalguni": "Leo",
    Hasta: "Virgo", Chitra: "Virgo", Swati: "Virgo",
    Vishakha: "Libra", Anuradha: "Libra", Jyeshtha: "Libra",
    Mula: "Sagittarius", "Purva Ashadha": "Sagittarius", "Uttara Ashadha": "Sagittarius",
    Shravana: "Capricorn", Dhanishtha: "Capricorn", Shatabhisha: "Capricorn",
    "Purva Bhadrapada": "Aquarius", "Uttara Bhadrapada": "Aquarius", Revati: "Aquarius",
  };
  return map[nakshatra] || "";
}
