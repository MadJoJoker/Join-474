/**
 * Gibt das aktuelle Datum im Format TT.MM.JJJJ zurück.
 * @returns {string} Das formatierte Datum.
 */
export function getFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}
