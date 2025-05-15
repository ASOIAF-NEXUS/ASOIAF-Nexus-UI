import {
    armyIdsToArmyData,
    ArmyListData,
    ArmyListIDs,
    BuilderRoles,
    defaultArmyData,
    defaultArmyIds,
    FACTIONS,
    iterateArmyData,
    SongData
} from "../../utils/songTypes.ts";
import {Dictionary} from "../../utils/utils.ts";

interface ArmyPointPool {
    max: number
    points: number
    filter: (entity: SongData) => boolean
}


interface ArmyValidatorOpts {
    data: SongData[]
}

export interface Legality {
    isLegal: boolean
    reasonsIllegal: string[]
    isLegalSlot: boolean[]
    reasonsIllegalSlot: string[][]
}

export class ArmyValidator {
    private readonly _data: SongData[]
    private _idToLegality: Dictionary<Legality>
    private _armyListIDs: ArmyListIDs
    private _armyListData: ArmyListData
    private _activeSlot: number

    public pointPools: ArmyPointPool[]

    constructor({data}: ArmyValidatorOpts) {
        this._data = data;
        this._idToLegality = {};

        this._armyListIDs = defaultArmyIds;
        this._armyListData = defaultArmyData;
        this._activeSlot = -1;

        this.pointPools = [
            {
                max: Math.floor(this.armyListIds.points / 10),
                points: 0,
                filter: entity => [BuilderRoles.attachment, BuilderRoles.enemy].includes(entity._roleBuilder)
            },
            {max: this.armyListIds.points, points: 0, filter: () => true},
        ];
    }

    setSlot(slot: number) {
        this._activeSlot = slot;
    }

    get activeSlot() {
        return this._activeSlot;
    }

    setArmyListIDs(listIDs: ArmyListIDs) {
        this._armyListIDs = listIDs;
    }

    get armyListIds() {
        return this._armyListIDs;
    }

    setArmyListData(listData: ArmyListData) {
        this._armyListData = listData;
    }

    get armyListData() {
        return this._armyListData;
    }

    get armyEntities() {
        return [...iterateArmyData(this.armyListData)].filter(it => it !== null);
    }

    onArmyListChange(armyListIDs: ArmyListIDs) {
        this.setArmyListIDs(armyListIDs);
        this.setArmyListData(armyIdsToArmyData(armyListIDs, this._data));
        this.calculateArmySize();
        this.buildLegalityMap();
    }

    buildLegalityMap() {
        this._idToLegality = {}
        this._data.forEach(entity => {
            const reasonsIllegal = this.getEntityReasonsIllegal(entity);
            const isLegal = reasonsIllegal.length === 0;
            const numSlots = this.armyListData.unit.length;
            const reasonsIllegalSlot = isLegal
                ? Array.from({length: numSlots}, (_, ix) => this.getEntityReasonsIllegalSlot(entity, ix))
                : Array(numSlots).fill(reasonsIllegal);

            this._idToLegality[entity.id] = {
                isLegal,
                reasonsIllegal: reasonsIllegal,
                isLegalSlot: reasonsIllegalSlot.map(r => r.length === 0),
                reasonsIllegalSlot: reasonsIllegalSlot,
            };
        });
    }

    isSlotAttachable(slot: number) {
        return  this._data.some(ent => ent._roleBuilder === BuilderRoles.attachment && this.getEntityReasonsIllegalSlot(ent, slot).length === 0);
    }

    exceedsPoints() {
        return this.pointPools.some(pool => pool.points > pool.max);
    }

    // FIXME: hardcoded trash below
    // complete trash
    calculateArmySize() {
        this.pointPools = [
            {
                max: Math.floor(this.armyListIds.points / 10),
                points: 0,
                filter: entity => entity._roleBuilder === BuilderRoles.attachment || entity._roleBuilder === BuilderRoles.enemy,
            },
            {max: this.armyListIds.points, points: 0, filter: () => true},
        ];

        for (const entity of iterateArmyData(this.armyListData)) {
            if (entity == null) continue;
            const cost = entity.statistics.cost;
            const costNum = isNaN(Number(cost)) ? 0 : Number(cost);

            for (const pool of this.pointPools) {
                if (pool.filter(entity) && pool.points < pool.max) {
                    pool.points += costNum;
                    break;
                } else if (pool === this.pointPools[this.pointPools.length - 1]) {
                    pool.points += costNum;
                }
            }
        }
    }

    getFeasibleFactions() {
        switch (this.armyListIds.faction) {
            case FACTIONS.freefolk:
            case FACTIONS.neutral:
                return [this.armyListIds.faction];
            case FACTIONS.brotherhood:
                return [FACTIONS.brotherhood, FACTIONS.baratheon, FACTIONS.stark, FACTIONS.neutral];
            default:
                return [this.armyListIds.faction, FACTIONS.neutral];
        }
    }

    getEntityReasonsIllegal(entity: SongData) {
        if (this._idToLegality[entity.id] !== undefined) return this._idToLegality[entity.id].reasonsIllegal;

        const entities = [...this.armyEntities, entity];

        const reasonFactionIllegal = this.getEntityReasonFactionIllegal(entity);
        if (reasonFactionIllegal) return [reasonFactionIllegal];
        if (this.armyListData.commander !== undefined && entity._roleBuilder === BuilderRoles.commander) return ["Your army may only include 1 commander"]
        if (this.getDuplicateCharacterNames(entities).length) return ["Character already included"];
        return [];
    }

    ignoresAttRestrictions(entity: SongData) {
        return [
            "20809",
            "20404"
        ].includes(entity.id);
    }

    getEntityReasonsIllegalSlot(entity: SongData, slot?: number) {
        slot = slot !== undefined ? slot : this.activeSlot;
        const defaultValue = this.getEntityReasonsIllegal(entity).length ? ["Illegal"] : [];
        if (slot === -1 || slot >= this.armyListData.unit.length) return defaultValue;
        // Other entities don't use slot
        if (entity._roleBuilder !== BuilderRoles.attachment && entity._roleBuilder !== BuilderRoles.unit) return defaultValue;
        if (this._idToLegality[entity.id] !== undefined && this._idToLegality[entity.id].reasonsIllegalSlot.length < slot) return this._idToLegality[entity.id].reasonsIllegalSlot[slot];

        const slotItem = this.armyListData.unit[slot];
        const slotUnit = slotItem.unit;
        const slotAttachments = slotItem.attachments;
        if (entity._roleBuilder === BuilderRoles.attachment) {
            const potentialAttachments = [...slotAttachments, entity];
            if (!this.isFollowAttachmentRestrictions(slotUnit, potentialAttachments)) return ["Attachment limit"];
            if (!this.isFollowAttachmentType(slotUnit, potentialAttachments)) return ["Can't attach to this unit"];
        }

        if (entity._roleBuilder === BuilderRoles.unit) {
            if (slotAttachments.length === 0) return defaultValue;
            if (!this.isFollowAttachmentType(entity, slotAttachments)) return ["Can't attach to this unit"];
        }

        return defaultValue;
    }

    isFollowAttachmentRestrictions(_unit: SongData | null, attachments: SongData[]) {
        return attachments.filter(att => !this.ignoresAttRestrictions(att)).length <= 1;
    }
    isFollowAttachmentType(unit: SongData | null, attachments: SongData[]) {
        if (attachments.length === 0) return true;
        if (unit != null && attachments.some(a => a.statistics.type != unit.statistics.tray)) return false;
        if (unit != null && unit.statistics.tray === "solo") return false;
        if (attachments.some(a => a.statistics.type !== attachments[0].statistics.type)) return false;
        return true;
    }
    getDuplicateCharacterNames(entities: SongData[]) {
        const names = entities.filter(e => e.statistics.character).map(e => e.name);
        const counts = names.reduce((acc, curr) => ({...acc, [curr]: (acc[curr] || 0) + 1}), {} as Dictionary<number>);
        return Object.keys(counts).filter(k => counts[k] > 1);
    }
    getEntityReasonFactionIllegal(entity: SongData) {
        if (!this.getFeasibleFactions().includes(entity.statistics.faction)) return "Wrong faction";
        if (entity._roleBuilder === BuilderRoles.commander && entity.statistics.faction === FACTIONS.neutral && this.armyListIds.faction !== FACTIONS.neutral) return "Only neutrals may include neutral commanders";
        if (this.armyListIds.faction === FACTIONS.brotherhood) {
            const isStarkBara = (e: SongData) => e.statistics.faction === FACTIONS.stark || e.statistics.faction === FACTIONS.baratheon;
            if (entity._roleBuilder != BuilderRoles.unit && isStarkBara(entity)) return "Wrong faction";
            if (isStarkBara(entity) && this.armyListData.unit.filter(u => u.unit && isStarkBara(u.unit)).length) return "May only include 1 combat unit from baratheon/stark";
        }
    }

    getArmyReasonsIllegal() {
        const warnings: string[] = [];
        const errors: string[] = [];

        if (this.armyListData.commander === undefined) warnings.push("No commander");
        if (this.armyListData.unit.some(it => it.unit === null)) warnings.push("Some attachments aren't attached to a unit")

        if (this.exceedsPoints()) errors.push("Exceeds point limit");
        this.armyEntities.forEach(ent => {
            const reasonIllegalFaction = this.getEntityReasonFactionIllegal(ent);
            if (reasonIllegalFaction) errors.push(`${reasonIllegalFaction}: "${ent.name}"`);
        });
        this.armyListData.unit.forEach((item, slot) => {
            const attachLimit = this.isFollowAttachmentRestrictions(item.unit, item.attachments);
            const attachType = this.isFollowAttachmentType(item.unit, item.attachments);
            if (!attachLimit) errors.push(`Unit ${slot + 1} (${item.unit === null ? "Empty" : item.unit.name}) exceeds attachment limit`);
            if (!attachType) errors.push(`Unit ${slot + 1} (${item.unit === null ? "Empty" : item.unit.name}) can't attach some of its attachments`);
        });
        if (this.armyEntities.filter(sd => sd && sd.statistics.commander).length > 1) errors.push("Army includes more than 1 commander")
        const duplicateChars = this.getDuplicateCharacterNames(this.armyEntities);
        if (duplicateChars.length) errors.push(`Army includes duplicate character${duplicateChars.length > 1 ? "s" : ""}: ${duplicateChars.join(", ")}`)

        return {warnings, errors};
    }
}
