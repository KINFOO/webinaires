export const extractToken = (header: string) => {
  if (typeof header !== 'string') {
    return null;
  }
  const [method, hash] = header.split(' ');
  if (method !== 'Basic') {
    return null;
  }
  return hash;
};
