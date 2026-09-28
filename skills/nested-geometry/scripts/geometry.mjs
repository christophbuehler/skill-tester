import { pathToFileURL } from 'node:url';
export function nestedRadius(outer, border, padding, margin = 0) {
  const values = [outer, border, padding, margin];
  if (values.some(x => !Number.isFinite(x) || x < 0)) throw new Error('Use finite nonnegative lengths in a single unit.');
  const inset = border + padding + margin;
  return { outer, inset, inner: Math.max(0, outer - inset) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const values = process.argv.slice(2).map(Number);
  if (values.length < 3 || values.length > 4) throw new Error('Usage: node geometry.mjs outer border padding [margin]');
  console.log(JSON.stringify(nestedRadius(...values), null, 2));
}
