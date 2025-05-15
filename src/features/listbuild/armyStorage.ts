import {ArmyListIDs} from "../../utils/songTypes.ts";
import {Dictionary} from "../../utils/utils.ts";
import {v4 as uuidv4} from 'uuid';


export interface SavableArmyData {
    id: string
    name: string
    timeSaved: number
    army: ArmyListIDs
}


abstract class ArmyStorage {
    protected abstract _save(): void
    protected abstract _load(): Dictionary<SavableArmyData>

    private _armies: Dictionary<SavableArmyData>

    constructor() {
        this._armies = {};
    }

    getSavableArmyData(armyData: ArmyListIDs, name: string): SavableArmyData {
        return {
            id: uuidv4(),
            name: name,
            timeSaved: Date.now(),
            army: armyData
        }
    }

    save (army: SavableArmyData) {
        this._armies[army.id] = army;
        this._save();
    }
    load () {
        this._armies = this._load();
    }
    delete (id: string) {
        if (this._armies[id]) delete this._armies[id];
        this._save();
    }

    get armies () {
        return this._armies;
    }
}

export class ArmyStorageLocalstorage extends ArmyStorage {
    private _STORAGE_KEY = "armyStorage";

    protected _save() {
        const asJsonString = JSON.stringify(this.armies);
        localStorage.setItem(this._STORAGE_KEY, asJsonString);
    }

    protected _load() {
        const saved = localStorage.getItem(this._STORAGE_KEY);
        if (saved === null) return {};
        return JSON.parse(saved);
    }
}
