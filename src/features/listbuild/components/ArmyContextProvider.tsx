import {ReactNode, useState} from "react";
import ArmyContext from "../ArmyContext.ts";
import {armyDataToArmyIds, ArmyListIDs, BuilderRoles, defaultArmySize, SongData} from "../../../utils/songTypes.ts";
import {ArmyValidator} from "../ArmyValidator.ts";
import useConfirm, {useConfirmHandlers} from "../../../hooks/useConfirm.tsx";


interface ArmyContextProviderProps {
    children: ReactNode
    defaultArmyIDs: ArmyListIDs
    data: SongData[]
    validator: ArmyValidator
}

function ArmyContextProvider({children, defaultArmyIDs, data, validator}: ArmyContextProviderProps) {
    const [armyIds, _setArmyIds] = useState(defaultArmyIDs);
    const [slot, _setSlot] = useState(-1);
    const [allowIllegal, setAllowIllegal] = useState(false);
    const {ConfirmModal, askConfirm} = useConfirm();

    const setArmyIds = (fnGetNewState: (prevState: ArmyListIDs) => ArmyListIDs, callback?: () => void) => {
        _setArmyIds(prev => {
            const newState = fnGetNewState(prev);
            // We need to update the state in validator immediately. Otherwise, the new value would only be accessible AFTER ALL state setting hooks have finished running.
            validator.onArmyListChange(newState);
            if (callback !== undefined) callback();

            return newState;
        });
    }
    const setSlot = (newSlot: number) => {
        validator.setSlot(newSlot);
        _setSlot(newSlot);
    }

    const armyData = validator.armyListData;

    const addToArmy = function (dataToAdd: SongData) {
        if (data.find(it => it.id === dataToAdd.id) === undefined) return;

        let nextSlot = -1;
        // Only stay on current slot if we can add more attachments to the unit
        let slotIfIsAttachable = -1

        switch (dataToAdd._roleBuilder) {
            case BuilderRoles.commander: {
                armyData.commander = dataToAdd;
                if (dataToAdd._prop === "units") {
                    armyData.unit.splice(0, 0, {unit: dataToAdd, attachments: []});
                    nextSlot = 0;
                } else if (dataToAdd._prop === "attachments") {
                    armyData.unit.splice(0, 0, {unit: null, attachments: [dataToAdd]});
                    nextSlot = 0;
                } else if (dataToAdd._prop === "ncus") armyData.ncu.splice(0, 0, dataToAdd);
                break;
            }
            case BuilderRoles.ncu:
                armyData.ncu.push(dataToAdd);
                break;
            case BuilderRoles.enemy:
                armyData.enemy.push(dataToAdd);
                break;
            case BuilderRoles.attachment: {
                const isSlotLegal = allowIllegal || validator.getEntityReasonsIllegalSlot(dataToAdd).length === 0;
                if (slot >= armyData.unit.length || slot === -1 || !isSlotLegal) {
                    if (slot >= armyData.unit.length) slotIfIsAttachable = armyData.unit.length;
                    armyData.unit.push({unit: null, attachments: [dataToAdd]});
                } else {
                    armyData.unit[slot].attachments.push(dataToAdd);
                    slotIfIsAttachable = slot
                }
                break;
            }
            case BuilderRoles.unit: {
                const isSlotLegal = allowIllegal || validator.getEntityReasonsIllegalSlot(dataToAdd).length === 0;
                if (slot >= armyData.unit.length || slot === -1 || armyData.unit[slot].unit !== null || !isSlotLegal) {
                    armyData.unit.push({unit: dataToAdd, attachments: []});
                    slotIfIsAttachable = armyData.unit.length - 1;
                } else {
                    armyData.unit[slot].unit = dataToAdd;
                    slotIfIsAttachable = slot;
                }
                break;
            }
        }

        setArmyIds(
            () => armyDataToArmyIds(armyData),
            () => {
                if (validator.isSlotAttachable(slotIfIsAttachable)) setSlot(slotIfIsAttachable);
                else setSlot(nextSlot);
            },
        );
    }

    const deleteFromArmy = function ({ixRemove, key, ixRemoveChild}: {
        ixRemove: number,
        key: "unit" | "attachment" | "ncu" | "enemy",
        ixRemoveChild?: number,
    }) {
        let nextSlot = slot;
        let removed: SongData | undefined | null;
        if (key === "unit") {
            removed = armyData.unit[ixRemove].unit;
            armyData.unit[ixRemove].unit = null
            nextSlot = ixRemove;
        } else if (key === "attachment") {
            if (ixRemoveChild !== undefined) removed = armyData.unit[ixRemove].attachments.splice(ixRemoveChild, 1)[0];
            if (armyData.unit[ixRemove].attachments.length === 0) nextSlot = ixRemove;
        } else if (key === "ncu") {
            removed = armyData.ncu.splice(ixRemove, 1)[0];
        } else if (key === "enemy") {
            removed = armyData.enemy.splice(ixRemove, 1)[0];
        }

        if (
            (key === "unit" || key === "attachment")
            && armyData.unit[ixRemove].unit === null
            && armyData.unit[ixRemove].attachments.length === 0
        ) {
            armyData.unit.splice(ixRemove, 1);
            nextSlot = -1;
        }
        if (removed?.id === armyData.commander?.id) armyData.commander = undefined;

        setArmyIds(() => armyDataToArmyIds(armyData));
        setSlot(nextSlot);
    }

    const _setArmyFaction = function (faction: string) {
        setArmyIds(prev => {
            if (faction === prev.faction) return prev;
            return {...prev, faction: faction, ids: []} as ArmyListIDs
        });
    }

    const confirmSetArmyFaction = function (faction: string, handlers?: useConfirmHandlers) {
        handlers = handlers || {};

        if (faction !== armyIds.faction && armyIds.ids.length) {
            askConfirm({
                ...handlers,
                onConfirm: () => {
                    _setArmyFaction(faction);
                    if (handlers.onConfirm) handlers.onConfirm();
                },
                title: "Are you sure?",
                message: "Selecting a new faction will wipe your army!"
            });
        } else {
            _setArmyFaction(faction);
            if (handlers.onConfirm) handlers.onConfirm();
        }
    }

    const setArmyPoints = function (points: number) {
        setArmyIds(prev => {
            return {...prev, points: points || defaultArmySize, ids: [...prev.ids]}
        });
    }

    const setArmyFormat = function (format: string) {
        setArmyIds(prev => {
            return {...prev, format, ids: [...prev.ids]}
        });
    }

    const loadArmy = function (army: ArmyListIDs) {
        setArmyIds(() => army);
    }

    return <ArmyContext.Provider value={{
        armyData,
        armyIds,
        slot,
        setSlot,
        allowIllegal,
        setAllowIllegal: (b) => setAllowIllegal(b),
        armyValidator: validator,
        loadArmy,
        addToArmy,
        deleteFromArmy,
        confirmSetArmyFaction,
        setArmyPoints,
        setArmyFormat,
        ConfirmModal
    }}>
        {children}
    </ArmyContext.Provider>
}

export default ArmyContextProvider;
