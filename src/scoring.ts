export function winningScore(score: number, opponent: number): boolean {
  return (score >= 21 && score - opponent >= 2) || score === 29;
}
