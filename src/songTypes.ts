import {Dictionary} from "./utils.ts";

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

export interface ArmyListData {
    faction: FACTIONS
    ids: number[]
}

interface ParsedArmyData {
    faction: FACTIONS
    commander: SongData | undefined
    units: {unit: SongData, attachments: SongData[]}[]
    ncu: SongData[]
    enemy: SongData[]
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
        enemy?: boolean
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
    _prop: "unknown" | "units" | "attachments" | "ncus" | "tactics" | "specials"
    _fullName: string
}

export function parseArmyList(armyList: ArmyListData, data: SongData[]) {
    const dataArray = armyList.ids.map(id => data.find(it => it.id === String(id))).filter(it => !!it);
    const army = {
        faction: armyList.faction,
        commander: dataArray.find(d => d.statistics.commander),
        units: [],
        ncu: [],
        enemy: []
    } as ParsedArmyData;

    let unit = undefined;
    for (const entity of dataArray) {
        if (entity._prop === "ncus") army.ncu.push(entity);
        else if (entity.statistics.enemy) army.enemy.push(entity);
        else if (entity._prop === "units") {
            if (unit !== undefined) army.units.push(unit);
            unit = {unit: entity, attachments: [] as SongData[]}
        } else if (entity._prop === "attachments") {
            if (unit !== undefined) unit.attachments.push(entity);
        }
    }

    return army
}
