const regexEscapingChars = ['.', '?', '*', '|', '[', ']', '{', '}', '\\', '$', '^', '-'];
const specialSymbols = {
  empty: '',
  pipe: '|',
};
const commonRegex = {
  allSpaces: /\s+/g,
  validNumber: /^\d+(?:\.\d+)?$/,
};

export function pipeRegexValues(values) {
  return values.reduce((escaped, value) => {
    if (regexEscapingChars.includes(value)) {
      escaped.push(`\\${value}`);
    } else {
      escaped.push(value);
    }
    return escaped;
  }, []).join(specialSymbols.pipe);
}

export function joinPiped(...collections) {
  return collections.join(specialSymbols.pipe);
  // ['\\d', '!|\?'] ==> .join('|') ==> '\\d|!|\?'
}

export function removeSpaces(value) {
  return value.replace(commonRegex.allSpaces, specialSymbols.empty);
}

export function matchAll(sourceStr, regex) {
  return [...sourceStr.matchAll(regex)];
}