import {Dictionary} from "../utils.ts";
import {SongData} from "../songTypes.ts";
import {Button, Divider, Pill, PillGroup} from "@mantine/core";
import * as React from "react";


type T_FilterValue = string | number;
export type T_FilterState = Dictionary<number>;
export type T_setFilterState = React.Dispatch<React.SetStateAction<T_FilterState>>


interface FilterItemOpts {
    item: T_FilterValue
    hash: string
}
class FilterItem {
    public item: T_FilterValue;
    public hash: string;

    constructor({item, hash}: FilterItemOpts) {
        this.item = item
        this.hash = hash
    }
}


interface FilterOpts {
    header: string
    alwaysRenderPill?: boolean
    getDefaultFilterState?: (fi: FilterItem) => number
}
export class Filter {
    private readonly _header: string
    private readonly _hash: string
    private _items: FilterItem[];
    private _itemsSet: Set<string>;
    private readonly _isAlwaysRenderPill: boolean;
    private readonly _getDefaultFilterState: ((fi: FilterItem) => number) | undefined

    constructor({header, alwaysRenderPill, getDefaultFilterState}: FilterOpts) {
        this._header = header;
        this._hash = header.toLowerCase().replace(/\s/g, "");
        this._isAlwaysRenderPill = !!alwaysRenderPill;
        this._getDefaultFilterState = getDefaultFilterState

        this._items = [];
        this._itemsSet = new Set();
    }

    get header() {
        return this._header;
    }

    get hash() {
        return this._hash;
    }

    get defaultFilterState() {
        return Object.fromEntries(this._items.map(fi => {
            let state = 0;
            if (this._getDefaultFilterState != undefined) state = this._getDefaultFilterState(fi);
            return [
                this.getFilterStateHash(fi),
                state
            ];
        }))
    }

    getFilterStateHash(filterItem: FilterItem | string) {
        if (filterItem instanceof FilterItem) return `${this.hash}.${filterItem.hash}`;
        return `${this.hash}.${filterItem}`;
    }

    private _isOwnFilterStateHash(fsHash: string) {
        return fsHash.startsWith(this.hash);
    }

    private _getOwnFilterState(filterState: T_FilterState): T_FilterState {
        return Object.fromEntries(Object.keys(filterState).filter(k => this._isOwnFilterStateHash(k)).map(k => [k, filterState[k]]));
    }

    cycleState(prevState: number) {
        return (prevState + 1) % 3
    }

    private _getItemHash(item: T_FilterValue) {
        return String(item);
    }

    private _getFilterItem(item: T_FilterValue): FilterItem {
        const hash = this._getItemHash(item);
        return new FilterItem({item, hash})
    }

    addItem(item: T_FilterValue | FilterItem) {
        const filterItem = item instanceof FilterItem ? item : this._getFilterItem(item);
        if (this._itemsSet.has(filterItem.hash)) return;
        this._items.push(filterItem);
        this._itemsSet.add(filterItem.hash);
    }

    doFilterEntity(filterValues: T_FilterValue[], filterState: T_FilterState) {
        let display = false;
        const ownFilterState = this._getOwnFilterState(filterState);

        if (Object.values(ownFilterState).every(v => v != 1)) display = true;
        display = display || filterValues.some(fv => ownFilterState[this.getFilterStateHash(this._getItemHash(fv))] === 1);

        const hide = filterValues.some(fv => ownFilterState[this.getFilterStateHash(this._getItemHash(fv))] === 2);

        return display && !hide
    }

    private _onClickFilterPill(setFilterState: T_setFilterState, filterItem: FilterItem) {
        setFilterState(prevState => {
            const newState = {...prevState};
            const stateHash = this.getFilterStateHash(filterItem);
            newState[stateHash] = this.cycleState(prevState[stateHash]);
            return newState;
        });
    }

    private _getRenderedFilterPill(filterState: T_FilterState, filterItem: FilterItem, setFilterState: T_setFilterState) {
        const stateHash = this.getFilterStateHash(filterItem);
        const fs = filterState[stateHash];
        return <Button
            size="xs"
            key={stateHash}
            variant={fs === 0 ? "light" : "filled"}
            color={fs === 0 ? "gray" : fs === 1 ? "blue" : "red"}
            onClick={() => this._onClickFilterPill(setFilterState, filterItem)}
        >
            {filterItem.hash.toTitleCase()}
        </Button>
    }

    private _getRenderedFilterPills(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return this._items.map(fi => this._getRenderedFilterPill(filterState, fi, setFilterState));
    }

    getRenderedModalRow (filterState: T_FilterState, setFilterState: T_setFilterState) {
        return <div className="m-1 mx-0" key={this.header}>
            <p>{this.header}</p>
            <PillGroup>
                {this._getRenderedFilterPills(filterState, setFilterState)}
            </PillGroup>
            <Divider className="m-1 mx-0"></Divider>
        </div>
    }

    private _onClickMiniPill(setFilterState: T_setFilterState, filterItem: FilterItem) {
        setFilterState(prevState => {
            const newState = {...prevState};
            newState[this.getFilterStateHash(filterItem)] = 0;
            return newState;
        });
    }

    private _getRenderedMiniPill(filterState: T_FilterState, filterItem: FilterItem, setFilterState: T_setFilterState) {
        const stateHash = this.getFilterStateHash(filterItem);
        const fs = filterState[stateHash];

        if (!this._isAlwaysRenderPill && fs === 0) return null;

        return <Pill
            key={stateHash}
            size="xs"
            className={fs === 0 ? "filter-pill--gray" : fs === 1 ? "filter-pill--blue" : "filter-pill--red"}
            onClick={() => this._onClickMiniPill(setFilterState, filterItem)}
        >
            {filterItem.hash.toTitleCase()}
        </Pill>
    }

    getRenderedMiniPills(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return this._items.map(fi => this._getRenderedMiniPill(filterState, fi, setFilterState));
    }
}

export abstract class FilterData {
    abstract get filters(): Filter[]

    abstract get defaultFilterStates(): T_FilterState

    abstract addToFilters(entity: unknown): void

    abstract getValuesForFilter(entity: unknown): T_FilterValue[][]

    abstract doFilterEntity(entity: unknown, filterState: T_FilterState): boolean
}

export class FilterSongData extends FilterData {
    readonly typeFilter: Filter;
    readonly factionFilter: Filter;

    constructor() {
        super();
        this.typeFilter = new Filter({
            header: "Type",
        });

        this.factionFilter = new Filter({
            header: "Factions",
            // getDefaultFilterState: fi => {
            //     const armyData = {faction: FACTIONS.greyjoy};
            //     return Number(fi.hash == armyData.faction)
            // }
        });
    }

    get filters() {
        return [
            this.typeFilter,
            this.factionFilter,
        ]
    }

    get defaultFilterStates(): T_FilterState {
        return this.filters.map(f => f.defaultFilterState).reduce((acc, curr) => {
            return {...acc, ...curr}
        }, {});
    }

    addToFilters(ent: SongData) {
        this.typeFilter.addItem(ent._roleBuilder);
        this.factionFilter.addItem(ent.statistics.faction);
    }

    getValuesForFilter(ent: SongData): T_FilterValue[][] {
        return [
            [ent._roleBuilder],
            [ent.statistics.faction],
        ]
    }

    doFilterEntity(entity: SongData, filterState: T_FilterState) {
        const filterValues = this.getValuesForFilter(entity);
        return this.filters.map((filter, ix) => {
            return filter.doFilterEntity(filterValues[ix], filterState);
        }).every(b => b);
    }
}
