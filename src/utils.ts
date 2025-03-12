// Certain minor words should be left lowercase unless they are the first or last words in the string
const TITLE_LOWER_WORDS = ["a", "an", "the", "and", "but", "or", "for", "nor", "as", "at", "by", "for", "from", "in", "into", "near", "of", "on", "onto", "to", "with", "over"];
const TITLE_LOWER_WORDS_RE = TITLE_LOWER_WORDS.map(it => new RegExp(`\\s${it}\\s`, "gi"));

declare global {
    interface String {
        toTitleCase(): string
    }
}
String.prototype.toTitleCase = function () {
    let str: string = this.replace(/([^\W_]+[^-\u2014\s/]*) */g, m0 => m0.charAt(0).toUpperCase() + m0.substring(1).toLowerCase());

    const len = TITLE_LOWER_WORDS.length;
    for (let i = 0; i < len; i++) {
        str = str.replace(
            TITLE_LOWER_WORDS_RE[i],
            txt => txt.toLowerCase(),
        );
    }
    str = str
        .split(/([;:?!.])/g)
        .map(pt => pt.replace(/^(\s*)(\S)/, (...m) => `${m[1]}${m[2].toUpperCase()}`))
        .join("");

    return str;
}

export interface Dictionary<T> {
    [key: string]: T;
}

export function clamp(num: number, min: number, max: number) {
    return Math.max(min, Math.min(num, max));
}
