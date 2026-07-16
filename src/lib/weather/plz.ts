/** Deutsche PLZ: genau 5 Ziffern, fuehrende Nullen erlaubt. Aufrufer sollte vorher trimmen. */
export function isValidPLZ(plz: string): boolean {
  return /^\d{5}$/.test(plz);
}
