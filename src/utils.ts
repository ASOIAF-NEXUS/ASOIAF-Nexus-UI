// Certain minor words should be left lowercase unless they are the first or last words in the string
import * as React from "react";

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

export enum FACTIONS {
    martell = "martell",
    brotherhood = "brotherhood",
    lannister = "lannister",
    greyjoy = "greyjoy",
    freefolk = "freefolk",
    bolton = "bolton",
    baratheon = "baratheon",
    targaryen = "targaryen",
    stark = "stark",
    nightswatch = "nightswatch",
    neutral = "neutral",
}

export interface Dictionary<T> {
    [key: string]: T;
}

export interface SongData {
    id: string,
    name: string,
    subname?: string
    type?: string
    statistics: {
        version: string
        faction: FACTIONS
        type: string
        cost: number | string
        speed?: number
        defense?: number
        morale?: number
        attacks?: [
            {
                name: string
                type: "melee" | "short" | "long"
                hit: number
                dice: number[]
            }
        ],
        abilities?: [
                { name: string, effect: string[], icons: string[] } | string
        ],
        text?: [
            { trigger?: string, effect?: string[], remove?: string }
        ]
        tray?: string
        wounds?: number
        commander?: boolean
        character?: boolean
        tactics?: {
            cards: Dictionary<string>
            remove: string[]
        }
        remove?: string
        commander_id?: string
        commander_name?: string
        commander_subname?: string

        front?: Dictionary<unknown>
        back?: Dictionary<unknown>
        size?: { w: number, h: number }
    }
    fluff?: {
        lore: string
        quote: string
    }

    __isMutated: boolean
    _prop: string
    _fullName: string
}

type FactionData = {
    units: SongData[]
    ncus: SongData[]
    attachments: SongData[]
    tactics: SongData[]
    specials: SongData[]
}

export class DataLoader {

    async pLoad(url: string): Promise<FactionData> {
        const response = await fetch(url)
        return response.json()
    }

    async pLoadJson() {
        const baseUrl = "https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/data/en/"
        const data = await Promise.all(Object.keys(FACTIONS).map(f => this.pLoad(`${baseUrl}${f}.json`)));

        return Object.values(data).flatMap(dict => Object.entries(dict).flatMap(([prop, items]) => {
            return items.map(ent => DataLoader._mutateEntity(ent, prop));
        }))
    }

    static _mutateEntity(ent: SongData, prop: string) {
        if (ent.__isMutated) return ent;

        ent._fullName = ent.subname ? `${ent.name.toTitleCase()} - ${ent.subname.toTitleCase()}` : ent.name.toTitleCase();
        ent._prop = prop;

        return ent;
    }

    async pLoadSetState(setState: React.Dispatch<SongData[]>) {
        const jsonData = await this.pLoadJson();
        setState(jsonData)
    }
}
