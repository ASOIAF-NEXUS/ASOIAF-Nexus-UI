import * as React from "react";
import {createContext} from "react";
import {ArmyListData, ArmyListIDs, SongData} from "../../utils/songTypes.ts";
import {useConfirmHandlers} from "../../hooks/useConfirm.tsx";
import {ArmyValidator} from "./ArmyValidator.ts";


interface ArmyContextVal {
    armyValidator: ArmyValidator
    armyData: ArmyListData
    armyIds: ArmyListIDs
    loadArmy: (armyIds: ArmyListIDs) => void
    confirmSetArmyFaction: (faction: string, handlers?: useConfirmHandlers) => void
    setArmyPoints: (points: number) => void
    setArmyFormat: (format: string) => void
    addToArmy: (obj: SongData) => void
    deleteFromArmy: ({ixRemove, key, ixRemoveChild}: {
        ixRemove: number,
        key: "unit" | "attachment" | "ncu" | "enemy",
        ixRemoveChild?: number,
    }) => void
    slot: number
    setSlot: (slot: number) => void
    allowIllegal: boolean
    setAllowIllegal: (newSate: boolean) => void
    ConfirmModal: () => React.ReactElement
}

const ArmyContext = createContext({} as ArmyContextVal);

export default ArmyContext;
