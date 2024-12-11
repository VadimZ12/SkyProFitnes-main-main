export const getValidProgress = (newProgress : Record<string, number>): Record<string, number>=> {
    return Object.entries(newProgress).reduce((acc, [key, value]) => {
    if (!isNaN(value) && isFinite(value)) {
      acc[key] = Math.max(0, Math.min(value, 100));
    }
    return acc;
  }, {} as { [key: string]: number });
}