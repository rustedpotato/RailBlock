// Helper utilities and formatting functions
export const formatDate = (isoString: string): string => {
  try {
    return new Date(isoString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  } catch {
    return isoString;
  }
};
