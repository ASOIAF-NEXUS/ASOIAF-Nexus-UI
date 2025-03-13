import {ReactNode, useRef, useState} from "react";
import ArmyContext, {withConfirm} from "../ArmyContext.ts";
import {
    armyDataToArmyIds,
    armyIdsToArmyData,
    ArmyListIDs,
    BuilderRoles,
    defaultArmySize,
    SongData
} from "../../songTypes.ts";


interface ArmyContextProviderProps {
    children: ReactNode
    defaultArmyData: ArmyListIDs
    data: SongData[]
}

function ArmyContextProvider({children, defaultArmyData, data}: ArmyContextProviderProps) {
    const [armyIds, setArmyIds] = useState(defaultArmyData);
    const slot = useRef(-1);

    const armyData = armyIdsToArmyData(armyIds, data);

    const addToArmy = function (dataToAdd: SongData) {
        if (data.find(it => it.id === dataToAdd.id) === undefined) return;

        let nextSlot = -1;
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
                if (slot.current >= armyData.unit.length || slot.current === -1) {
                    armyData.unit.push({unit: null, attachments: [dataToAdd]});
                } else {
                    armyData.unit[slot.current].attachments.push(dataToAdd);
                    // Only stay on current slot if we can add more attachments to the unit. Right now, assume that we can't
                    // nextSlot = slot.current;
                }
                break;
            }
            case BuilderRoles.unit: {
                if (slot.current >= armyData.unit.length || slot.current === -1 || armyData.unit[slot.current].unit !== null) {
                    armyData.unit.push({unit: dataToAdd, attachments: []});
                    nextSlot = armyData.unit.length - 1;
                } else {
                    armyData.unit[slot.current].unit = dataToAdd;
                    nextSlot = slot.current;
                }
                break;
            }
        }

        setArmyIds(armyDataToArmyIds(armyData));
        slot.current = nextSlot;
    }

    const deleteFromArmy = function ({ixRemove, key, ixRemoveChild}: {
        ixRemove: number,
        key: "unit" | "attachment" | "ncu" | "enemy",
        ixRemoveChild?: number,
    }) {
        let removed: SongData | undefined | null;
        if (key === "unit") {
            removed = armyData.unit[ixRemove].unit;
            armyData.unit[ixRemove].unit = null
            slot.current = ixRemove;
        } else if (key === "attachment") {
            if (ixRemoveChild !== undefined) removed = armyData.unit[ixRemove].attachments.splice(ixRemoveChild, 1)[0];
            if (armyData.unit[ixRemove].attachments.length === 0) slot.current = ixRemove;
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
            slot.current = -1;
        }
        if (removed?.id === armyData.commander?.id) armyData.commander = undefined;

        setArmyIds(armyDataToArmyIds(armyData));
    }

    const _setArmyFaction = function (faction: string) {
        setArmyIds(prev => {
            if (faction === prev.faction) return prev;
            return {...prev, faction: faction, ids: []} as ArmyListIDs
        });
    }

    const setArmyFaction = function (faction: string, withConfirm?: withConfirm) {
        if (withConfirm && withConfirm.askConfirm && faction !== armyIds.faction && armyIds.ids.length) {
            withConfirm.askConfirm({
                onConfirm: () => {
                    if (withConfirm.onConfirm) withConfirm.onConfirm();
                    _setArmyFaction(faction);
                },
                onCancel: withConfirm.onCancel,
            });
        } else {
            _setArmyFaction(faction);
            if (withConfirm?.onConfirm) withConfirm.onConfirm();
        }
    }

    const setArmyPoints = function (points: number) {
        setArmyIds(prev => {
            return {...prev, points: points || defaultArmySize, ids: [...prev.ids]} as ArmyListIDs
        });
    }

    const setArmyFormat = function (format: string) {
        setArmyIds(prev => {
            return {...prev, format, ids: [...prev.ids]} as ArmyListIDs
        });
    }

    return <ArmyContext.Provider value={{armyData, addToArmy, deleteFromArmy, setArmyFaction, setArmyPoints, setArmyFormat, slot}}>
        {children}
    </ArmyContext.Provider>
}

export default ArmyContextProvider;
