import {Dictionary} from "../utils.ts";
import {FilterMiniPillProps, FilterPillProps} from "./components/FilterBox.tsx";
import {SongData} from "../songTypes.ts";


type T_FilterValue = string | number;
export type T_FilterState = Dictionary<number>;


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

    _isOwnFilterStateHash(fsHash: string) {
        return fsHash.startsWith(this.hash);
    }

    _getOwnFilterState(filterState: T_FilterState): T_FilterState {
        return Object.fromEntries(Object.keys(filterState).filter(k => this._isOwnFilterStateHash(k)).map(k => [k, filterState[k]]));
    }

    cycleState(prevState: number) {
        return (prevState + 1) % 3
    }

    _getItemHash(item: T_FilterValue) {
        return String(item);
    }

    _getFilterItem(item: T_FilterValue): FilterItem {
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

    _getMiniPillProps_getPillProp(item: FilterItem, filterState: number): FilterMiniPillProps {
        return {
            isRenderPill: this._isAlwaysRenderPill || filterState !== 0,
            className: filterState === 0 ? "filter-pill--gray" : filterState === 1 ? "filter-pill--blue" : "filter-pill--red",
            children: item.hash.toTitleCase(),
            item: item.hash,
        }
    }

    getMiniPillProps(filterState: T_FilterState) {
        return this._items.map(filterItem => this._getMiniPillProps_getPillProp(
            filterItem,
            filterState[this.getFilterStateHash(filterItem)],
        ));
    }

    _getPillProps_getPillProp(item: FilterItem, filterState: number): FilterPillProps {
        return {
            variant: filterState === 0 ? "light" : "filled",
            color: filterState === 0 ? "gray" : filterState === 1 ? "blue" : "red",
            children: item.hash.toTitleCase(),
            item: item.hash,
        }
    }

    getPillProps(filterState: T_FilterState) {
        return this._items.map(filterItem => this._getPillProps_getPillProp(
            filterItem,
            filterState[this.getFilterStateHash(filterItem)],
        ));
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
        this.typeFilter.addItem(ent._prop);
        this.factionFilter.addItem(ent.statistics.faction);
    }

    getValuesForFilter(ent: SongData): T_FilterValue[][] {
        return [
            [ent._prop],
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
