export type Team = "flyers" | "badGuys";

export interface PeriodScore {
  flyers: number;
  badGuys: number;
  period: number;
}

export interface SaveEvent {
  name: string;
  value: string;
  previousValue: string;
}

export interface SavedGame {
  id: string;
  savedAt: string;
  homeTeam: string;
  badGuys: string;
  game: PeriodScore[];
  goals: PeriodScore[];
}
