import * as React from "react";
import {createContext} from "react";
import {ArmyListData, SongData} from "../songTypes.ts";
import {confirmHandlers} from "../hooks/useConfirm.tsx";

export interface withConfirm {
    askConfirm?: (handlers: confirmHandlers) => void
    onConfirm?: () => void
    onCancel?: () => void
}


interface ArmyContextVal {
    armyData: ArmyListData
    setArmyFaction: (f: string, withConfirm?: withConfirm) => void
    setArmyPoints: (n: number) => void
    setArmyFormat: (f: string) => void
    addToArmy: (obj: SongData) => void
    deleteFromArmy: ({ixRemove, key, ixRemoveChild}: {
        ixRemove: number,
        key: "unit" | "attachment" | "ncu" | "enemy",
        ixRemoveChild?: number,
    }) => void
    slot: React.RefObject<number>
}

const ArmyContext = createContext({} as ArmyContextVal);

export default ArmyContext;
