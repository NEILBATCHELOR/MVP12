export const toISOString = (date: Date | string | null): string => {
  if (date === null) return new Date().toISOString();
  if (typeof date === 'string') return new Date(date).toISOString();
  return date.toISOString();
};

export const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};
