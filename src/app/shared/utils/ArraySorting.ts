export function SortMatchesByLatest(a, b): number {
  if (a.date.seconds < b.date.seconds) {
    return 1;
  }
  if (a.date.seconds > b.date.seconds) {
    return -1;
  }
  return 0;
}
