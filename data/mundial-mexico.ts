/**
 * Static data for Mexico's World Cup 2026 matches.
 * No external APIs — update this file manually as the tournament progresses.
 */

export interface MatchResult {
  round: string;
  opponent: string;
  date: string; // ISO date
  status: "played" | "upcoming";
  result?: { mexico: number; opponent: number; scorers?: string[] };
  venue?: string;
}

export const mexicoMatches: MatchResult[] = [
  {
    round: "Fase de Grupos - Jornada 1",
    opponent: "Sudáfrica",
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
    opponent: "Por definir",
    date: "2026-06-18",
    status: "upcoming",
    venue: "Estadio Akron, Guadalajara",
  },
  {
    round: "Fase de Grupos - Jornada 3",
    opponent: "Por definir",
    date: "2026-06-24",
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
    .map((m) => `${m.date}:${m.status}:${m.result ? `${m.result.mexico}-${m.result.opponent}` : "x"}`)
    .join("|");
}
