export function bigNumber(value: number) {
  if (value < 1000) {
    return value;
  }

  if (value < 1000000) {
    return `${Math.round(value / 100) / 10}k`;
  }

  return value;
}
