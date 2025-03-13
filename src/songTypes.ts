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
            remove?: string[]
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

    _fullName: string
    _prop: "unknown" | "units" | "attachments" | "ncus" | "tactics" | "specials"
    _roleBuilder: BuilderRoles
}

export enum BuilderRoles {
    commander = "Commander",
    unit = "Combat Unit",
    ncu = "NCU",
    attachment = "Attachment",
    enemy = "Enemy Attachment",
    none = "None",
}

// The ids might be in a wrong order, creating an invalid list!
export interface ArmyListIDs {
    faction: FACTIONS
    ids: string[]
    points: number
    format: string
}
export interface ArmyListData {
    faction: FACTIONS
    commander: SongData | undefined
    unit: {unit: null | SongData, attachments: SongData[]}[]
    ncu: SongData[]
    enemy: SongData[]
    points: number
    format: string
}
export const defaultArmySize = 40;

export function armyIdsToArmyData(armyList: ArmyListIDs, data: SongData[]) {
    const army = {
        faction: armyList.faction,
        commander: undefined,
        unit: [],
        ncu: [],
        enemy: [],
        points: armyList.points,
        format: armyList.format,
    } as ArmyListData;

    let unit = undefined;
    for (const entId of armyList.ids) {
        const entity = entId === "0" ? null : data.find(it => it.id === entId);

        if (entity === undefined) {
            continue;
        }

        if (entity === null || entity._prop === "units") {
            if (unit !== undefined) army.unit.push(unit);
            unit = {unit: entity, attachments: [] as SongData[]}
        } else if (entity._prop === "attachments") {
            if (unit === undefined) unit = {unit: null, attachments: [] as SongData[]}
            unit.attachments.push(entity)
        } else if (entity._prop === "ncus") army.ncu.push(entity);
        else if (entity.statistics.enemy) army.enemy.push(entity);

        if (army.commander === undefined && entity?.statistics.commander) army.commander = entity;
    }
    if (unit !== undefined) army.unit.push(unit);

    return army
}

export function armyDataToArmyIds(armyData: ArmyListData) {
    const army = {
        faction: armyData.faction,
        ids: [],
        points: armyData.points,
        format: armyData.format,
    } as ArmyListIDs;
    armyData.unit.forEach(obj => {
        army.ids.push(obj.unit === null ? "0" : obj.unit.id);
        army.ids.push(...obj.attachments.map(a => a.id));
    });
    army.ids.push(...armyData.ncu.map(n => n.id));
    army.ids.push(...armyData.enemy.map(e => e.id));

    return army
}
