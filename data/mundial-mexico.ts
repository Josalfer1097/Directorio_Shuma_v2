/**
 * Static data for Mexico's World Cup 2026 matches.
 * No external APIs — update this file manually as the tournament progresses.
 */

export interface MatchResult {
  round: string;
  opponent: string;
  /** Opponent's flag emoji, shown next to the name in match cards */
  flag?: string;
  date: string; // ISO date
  /** Local kickoff time, 24h format e.g. "19:00" */
  time?: string;
  status: "played" | "upcoming";
  result?: { mexico: number; opponent: number; scorers?: string[] };
  venue?: string;
}

export const mexicoMatches: MatchResult[] = [
  {
    round: "Fase de Grupos - Jornada 1",
    opponent: "Sudáfrica",
    flag: "\u{1F1FF}\u{1F1E6}",
    date: "2026-06-11",
    status: "played",
    result: {
      mexico: 2,
      opponent: 0,
      scorers: ["Julián Quiñones", "Raúl Jiménez"],
    },
    venue: "Estadio Ciudad de México",
  },
  {
    round: "Fase de Grupos - Jornada 2",
    opponent: "Corea del Sur",
    flag: "\u{1F1F0}\u{1F1F7}",
    date: "2026-06-18",
    time: "19:00",
    status: "upcoming",
    venue: "Estadio Guadalajara (Akron)",
  },
  {
    round: "Fase de Grupos - Jornada 3",
    opponent: "Chequia",
    flag: "\u{1F1E8}\u{1F1FF}",
    date: "2026-06-24",
    time: "19:00",
    status: "upcoming",
    venue: "Estadio Ciudad de México",
  },
];

/**
 * Signature of the current data set — used to detect "new match updates"
 * the user hasn't seen yet (compared against a localStorage value).
 */
export function getMatchesSignature(): string {
  return mexicoMatches
    .map((m) => `${m.date}:${m.opponent}:${m.status}:${m.result ? `${m.result.mexico}-${m.result.opponent}` : "x"}`)
    .join("|");
}
