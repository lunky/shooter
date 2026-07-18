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
