export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now(); // Check if token is expired
  } catch {
    return true; // Token is invalid or can't be decoded
  }
};
