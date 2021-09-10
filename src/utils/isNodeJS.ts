export const isNodeJS = () => typeof window === 'undefined' && typeof module !== 'undefined' && module.exports;
