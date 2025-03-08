import * as React from "react";
import {createContext} from "react";
import {ArmyListData, SongData} from "../songTypes.ts";


interface ArmyContextVal {
    armyData: ArmyListData
    setArmyFaction: (f: string) => void
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
