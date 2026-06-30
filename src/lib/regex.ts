export interface Segment {
  text: string;
  isMatch: boolean;
  index: number;
}

export interface RegexResult {
  segments: Segment[];
  matchCount: number;
  error: string | null;
}

export function getRegexSegments(
  pattern: string,
  flags: { g: boolean; i: boolean; m: boolean },
  testString: string
): RegexResult {
  if (!pattern || !testString) {
    return {
      segments: [{ text: testString, isMatch: false, index: 0 }],
      matchCount: 0,
      error: null,
    };
  }

  try {
    const flagStr = [
      'g',
      flags.i ? 'i' : '',
      flags.m ? 'm' : '',
    ].filter(Boolean).join('');

    const regex = new RegExp(pattern, flagStr);
    const segs: Segment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let count = 0;

    while ((match = regex.exec(testString)) !== null) {
      if (match.index > lastIndex) {
        segs.push({ text: testString.slice(lastIndex, match.index), isMatch: false, index: lastIndex });
      }
      segs.push({ text: match[0], isMatch: true, index: match.index });
      lastIndex = match.index + match[0].length;
      count++;
      if (match[0].length === 0) regex.lastIndex++;
      if (!flags.g) break;
    }

    if (lastIndex < testString.length) {
      segs.push({ text: testString.slice(lastIndex), isMatch: false, index: lastIndex });
    }

    return { segments: segs, matchCount: count, error: null };
  } catch (e) {
    return { segments: [], matchCount: 0, error: (e as Error).message };
  }
}
