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

function getRenderedFaction(faction: FACTIONS) {
    switch (faction) {
        case FACTIONS.freefolk:
            return "Free Folk";
        case FACTIONS.nightswatch:
            return "Night's Watch";
        case FACTIONS.brotherhood:
            return "Brotherhood without Banners";
        default:
            return faction.toTitleCase();
    }
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
    _fTray?: string
    _fToHit?: string[]
    _fAttackDice?: string[]
    _fAttackTypes?: string[]
    _fAbilities?: string[]
    _fCharacter?: string[]
}

export enum BuilderRoles {
    commander = "Commander",
    unit = "Combat Unit",
    ncu = "NCU",
    attachment = "Attachment",
    enemy = "Enemy Attachment",
    none = "None",
}

export enum FilterCharCmdr {
    char = "Is a Character",
    cmdr = "Is a Commander",
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
    unit: { unit: null | SongData, attachments: SongData[] }[]
    ncu: SongData[]
    enemy: SongData[]
    points: number
    format: string
}

export const defaultArmySize = 40;
export const defaultArmyFormat = "standard";

export const defaultArmyIds: ArmyListIDs = {
    faction: FACTIONS.greyjoy,
    ids: [],
    points: defaultArmySize,
    format: defaultArmyFormat,
}
export const defaultArmyData: ArmyListData = {
    faction: FACTIONS.greyjoy,
    commander: undefined,
    unit: [],
    ncu: [],
    enemy: [],
    points: defaultArmySize,
    format: defaultArmyFormat,
}

export type T_armyFormat = {
    id: string
    name: string
    description: string
}

export const FORMATS: Dictionary<T_armyFormat> = {
    standard: {
        name: "Standard",
        id: "standard",
        description: "The rules described in the official rulebook."
    },
    classic: {
        name: "Classic",
        id: "classic",
        description: "Armies without extra points for attachments."
    },
    draft: {
        name: "Draft",
        id: "draft",
        description: "Build from a drafted pool, but with fewer restrictions."
    },
    milestone: {
        name: "Milestone",
        id: "milestone",
        description: "Armies change over the course of campaigns."
    },
}


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

export function* iterateArmyData(armyData: ArmyListData) {
    for (const unitObject of armyData.unit) {
        yield unitObject.unit;
        for (const attachment of unitObject.attachments) {
            yield attachment;
        }
    }
    for (const ncu of armyData.ncu) {
        yield ncu;
    }
    for (const enemy of armyData.enemy) {
        yield enemy;
    }
}

export function armyToTTS(army: ArmyListData) {
    return `${army.faction};${[...iterateArmyData(army)].map(it => it === null ? "0" : it.id).join(",")}`;
}

export function armyToString(army: ArmyListData) {
    let out = `Format: ${FORMATS[army.format]?.name || "Unknown Format"} (${army.points} Points)\n`;
    out += `Faction: ${getRenderedFaction(army.faction)}\n`;
    if (army.commander) out += `Commander: ${army.commander._fullName}\n`;
    else out += "Commander: No Commander included.\n";

    const appendUnit = (obj: SongData) => {
        out += ` • ${obj._fullName} (${obj.statistics.cost})\n`;
    }
    out += "\nCombat Units:\n";
    if (army.unit.length === 0) out += "No Combat Units included.\n"
    army.unit.forEach(u => {
        if (u.unit) appendUnit(u.unit);
        u.attachments.forEach(a => out += `     ${a._fullName} (${a.statistics.cost})\n`);
    });

    out += "\nNCUs:\n";
    if (army.ncu.length === 0) out += "No NCUs included.\n"
    army.ncu.forEach(ncu => appendUnit(ncu));

    if (army.enemy.length) {
        out += "\nEnemy Attachments:\n";
        army.enemy.forEach(enemy => appendUnit(enemy));
    }

    // :^)
    out += "\nArmy built on http://localhost:5173/\n"

    return out;
}
