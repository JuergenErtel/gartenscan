export function collectUniqueImagePaths(
  scanImagePaths: string[],
  coverImagePath: string
): string[] {
  const set = new Set<string>();
  for (const p of scanImagePaths) {
    if (p) set.add(p);
  }
  if (coverImagePath) set.add(coverImagePath);
  return [...set];
}
