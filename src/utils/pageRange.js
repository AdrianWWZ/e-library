/**
 * "1-3, 8, 10-" -> [1, 2, 3, 8, 10, 11, ... max]
 * Throws an Error with a friendly message if the input is invalid.
 */
export const parsePageRange = (input, max) => {
  const normalised = input.replace(/\s*[-–]\s*/g, "-").trim();
  if (!normalised) throw new RangeError("Enter some pages, e.g. 1-3, 8");

  const pages = new Set();
  for (const part of normalised.split(/[\s,;]+/).filter(Boolean)) {
    const match = part.match(/^(\d+)(?:-(\d*))?$/);
    if (!match) throw new RangeError(`"${part}" isn't a page or range`);
    const start = Number(match[1]);
    const end =
      match[2] === undefined ? start : match[2] === "" ? max : Number(match[2]);
    if (start < 1 || end > max || start > end)
      throw new RangeError(`Pages must be between 1 and ${max}`);
    for (let p = start; p <= end; p++) pages.add(p);
  }
  return [...pages].sort((a, b) => a - b);
};
