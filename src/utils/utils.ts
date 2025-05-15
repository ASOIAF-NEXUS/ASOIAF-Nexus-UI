// Certain minor words should be left lowercase unless they are the first or last words in the string
const TITLE_LOWER_WORDS = ["a", "an", "the", "and", "but", "or", "for", "nor", "as", "at", "by", "for", "from", "in", "into", "near", "of", "on", "onto", "to", "with", "over"];
const TITLE_LOWER_WORDS_RE = TITLE_LOWER_WORDS.map(it => new RegExp(`\\s${it}\\s`, "gi"));

declare global {
    interface String {
        toTitleCase(): string

        uppercaseFirst(): string
    }
}
String.prototype.uppercaseFirst = function () {
    const str = this.toString();
    if (str.length === 0) return str;
    if (str.length === 1) return str.charAt(0).toUpperCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
};
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


export class SortUtil {
    static ascSortNumbers(a: number, b: number) {
        if (isNaN(a) && isNaN(b)) return 0;
        else if (isNaN(a)) return -1;
        else if (isNaN(b)) return 1;
        return a - b;
    }

    static ascSort(a: string, b: string) {
        if (a < b) return -1;
        else if (b < a) return 1;
        return 0;
    }

    static ascSortLower(a: string, b: string) {
        return SortUtil.ascSort(a.toLowerCase(), b.toLowerCase());
    }
}
