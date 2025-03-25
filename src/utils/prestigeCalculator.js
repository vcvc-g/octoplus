export const getPrestigeLevel = (rank) => {
  if (rank <= 10) return 3;
  if (rank <= 30) return 2;
  return 1;
};

export const getAcceptanceRateLevel = (rate) => {
  if (rate < 5) return 1;
  if (rate < 15) return 2;
  if (rate < 30) return 3;
  return 4;
};