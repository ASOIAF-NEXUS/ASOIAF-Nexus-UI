import {Dictionary, SongData} from "./utils.ts";
import {FilterMiniPillProps, FilterPillProps} from "./components/FilterBox.tsx";

type T_FilterItemItem = string | number;
interface FilterItemOpts {
    item: T_FilterItemItem
    hash: string
}
class FilterItem {
    public item: T_FilterItemItem;
    public hash: string;

    constructor({item, hash}: FilterItemOpts) {
        this.item = item
        this.hash = hash
    }
}

interface FilterOpts {
    header: string
    alwaysRenderPill?: boolean
}

export class Filter {
    private readonly _header: string
    private _items: FilterItem[];
    private _itemsSet: Set<string>;
    private readonly _isAlwaysRenderPill: boolean;

    constructor({header, alwaysRenderPill}: FilterOpts) {
        this._header = header;
        this._isAlwaysRenderPill = !!alwaysRenderPill;

        this._items = [];
        this._itemsSet = new Set();
    }

    get header() {
        return this._header;
    }

    get defaultFilterState() {
        return Object.fromEntries(this._items.map(fi => [fi.hash, 0]))
    }

    nextState(prevState: number) {
        return (prevState + 1) % 3
    }

    _getItemHash(item: T_FilterItemItem) {
        return String(item);
    }

    _getFilterItem(item: T_FilterItemItem): FilterItem {
        const hash = this._getItemHash(item);
        return new FilterItem({item, hash})
    }

    addItem(item: T_FilterItemItem | FilterItem) {
        const filterItem = item instanceof FilterItem ? item : this._getFilterItem(item);
        if (this._itemsSet.has(filterItem.hash)) return;
        this._items.push(filterItem);
        this._itemsSet.add(filterItem.hash);
    }

    doFilterItem(filterValues: string[], filterState: Dictionary<number>) {
        let display = false;

        if (Object.values(filterState).every(v => v != 1)) display = true;
        display = display || filterValues.some(fv => filterState[fv] === 1);

        const hide = filterValues.some(fv => filterState[fv] === 2);

        return display && !hide
    }

    _getMiniPillProps_getPillProp (item: FilterItem, filterState: number): FilterMiniPillProps {
        return {
            isRenderPill: this._isAlwaysRenderPill || filterState !== 0,
            className: filterState === 0 ? "filter-pill--gray" : filterState === 1 ? "filter-pill--blue" : "filter-pill--red",
            children: item.hash.toTitleCase(),
            item: item.hash,
        }
    }

    getMiniPillProps (filterState: Dictionary<number>) {
        return this._items.map(filterItem => this._getMiniPillProps_getPillProp(
            filterItem,
            filterState[filterItem.hash],
        ));
    }

    _getPillProps_getPillProp (item: FilterItem, filterState: number): FilterPillProps {
        return {
            variant: filterState === 0 ? "light" : "filled",
            color: filterState === 0 ? "gray" : filterState === 1 ? "blue" : "red",
            children: item.hash.toTitleCase(),
            item: item.hash,
        }
    }

    getPillProps (filterState: Dictionary<number>) {
        return this._items.map(filterItem => this._getPillProps_getPillProp(
            filterItem,
            filterState[filterItem.hash],
        ));
    }
}

export abstract class DataFilter {
    abstract get filters(): Filter[]
    abstract doFilterItem(item: unknown, filterState: Dictionary<number>[]): boolean
    abstract addToFilters(item: unknown): void
    abstract getValuesForFilter(item: unknown): unknown[]
}

export class FilterSongData extends DataFilter {
    private readonly _typeFilter: Filter;
    private readonly _factionFilter: Filter;

    constructor() {
        super();
        this._typeFilter = new Filter({
            header: "Type",
        });

        this._factionFilter = new Filter({
            header: "Factions",
        });
    }

    get filters() {
        return [
            this._typeFilter,
            this._factionFilter,
        ]
    }

    addToFilters(ent: SongData) {
        this._typeFilter.addItem(ent._prop);
        this._factionFilter.addItem(ent.statistics.faction);
    }

    getValuesForFilter(ent: SongData) {
        return [
            ent._prop,
            ent.statistics.faction,
        ]
    }

    doFilterItem(item: SongData, filterState: Dictionary<number>[]) {
        const filterValues = this.getValuesForFilter(item);
        return this.filters.map((filter, ix) => {
            return filter.doFilterItem(filterValues, filterState[ix]);
        }).every(b => b);
    }
}
