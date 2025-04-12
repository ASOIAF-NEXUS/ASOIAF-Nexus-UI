import {Dictionary, SortUtil} from "../utils.ts";
import {FilterCharCmdr, SongData} from "../songTypes.ts";
import {
    Button,
    ButtonGroup,
    Combobox,
    Divider,
    Flex,
    Input, InputBase,
    PillGroup,
    Text,
    useCombobox
} from "@mantine/core";
import * as React from "react";
import {useState} from "react";


type T_FilterItemValue = string | number;
type T_FilterValues = undefined | T_FilterItemValue | T_FilterItemValue[];
export type T_FilterState = Dictionary<number>;
export type T_setFilterState = React.Dispatch<React.SetStateAction<T_FilterState>>


interface FilterItemOpts {
    item: T_FilterItemValue
    hash: string
}

class FilterItem {
    public item: T_FilterItemValue;
    public hash: string;

    constructor({item, hash}: FilterItemOpts) {
        this.item = item
        this.hash = hash
    }
}

interface FilterBaseOpts {
    header: string
    allowedStates?: number[]
}

export abstract class FilterBase {
    protected readonly _header: string
    protected readonly _hash: string
    protected readonly _states: number[];

    protected constructor({header, allowedStates}: FilterBaseOpts) {
        this._header = header;
        this._hash = header.toLowerCase().replace(/\s/g, "");
        this._states = allowedStates !== undefined ? allowedStates : [0, 1, 2];
    }

    get header() {
        return this._header;
    }

    get hash() {
        return this._hash;
    }

    protected _isOwnFilterStateHash(fsHash: string) {
        return fsHash.startsWith(this.hash);
    }

    protected _getOwnFilterState(filterState: T_FilterState): T_FilterState {
        return Object.fromEntries(Object.keys(filterState).filter(k => this._isOwnFilterStateHash(k)).map(k => [k, filterState[k]]));
    }

    isActive(filterState: T_FilterState) {
        const ownFilterState = this._getOwnFilterState(filterState);
        return Object.values(ownFilterState).some(v => v !== 0);
    }

    protected _cycleState(prevState: number) {
        const prevIx = this._states.findIndex(n => n === prevState);
        const nextIx = (prevIx + 1) % this._states.length;
        return this._states[nextIx];
    }

    abstract get defaultFilterState(): Dictionary<number>

    abstract doFilterEntity(entity: unknown, filterState: T_FilterState): boolean

    abstract getRenderedModalRow(filterState: T_FilterState, setFilterState: T_setFilterState): React.ReactElement

    abstract getRenderedMiniPills(filterState: T_FilterState, setFilterState: T_setFilterState): React.ReactElement[]
}


interface FilterOpts<EntityType> {
    header: string
    getFilterValues: (entity: EntityType) => T_FilterValues
    items?: T_FilterItemValue[]
    getDefaultFilterState?: (fi: FilterItem) => number
    itemSortFn?: ((a: FilterItem, b: FilterItem) => number) | null
    allowedStates?: number[]
    itemRenderFn?: (fi: FilterItem) => React.ReactNode
    itemRenderFnMini?: (fi: FilterItem) => React.ReactNode
    displayPillFn?: (fi: FilterItem, fs: T_FilterState) => boolean
}

export class Filter<EntityType> extends FilterBase {
    protected _items: FilterItem[];
    protected _itemsSet: Set<string>;
    protected readonly _getDefaultFilterState: (fi: FilterItem) => number
    protected readonly _itemSortFn: ((a: FilterItem, b: FilterItem) => number) | undefined
    protected readonly _itemRenderFn: (fi: FilterItem) => React.ReactNode
    protected readonly _itemRenderFnMini: (fi: FilterItem) => React.ReactNode
    protected readonly _isDisplayPill: (fi: FilterItem, fs: T_FilterState) => boolean
    protected readonly _getFilterValues: (entity: EntityType) => T_FilterValues

    constructor({
                    header,
                    items,
                    getFilterValues,
                    getDefaultFilterState,
                    itemSortFn,
                    allowedStates,
                    itemRenderFn,
                    itemRenderFnMini,
                    displayPillFn
                }: FilterOpts<EntityType>) {

        super({header, allowedStates});
        this._items = [];
        this._itemsSet = new Set();
        if (items !== undefined) items.forEach(it => this.addItem(it));

        this._getFilterValues = getFilterValues;

        this._getDefaultFilterState = typeof getDefaultFilterState === "function"
            ? getDefaultFilterState
            : () => 0;

        if (itemSortFn === null) this._itemSortFn = undefined;
        else if (itemSortFn === undefined) this._itemSortFn = (a, b) => {
            if (typeof a.item === "number" && typeof b.item === "number") return SortUtil.ascSortNumbers(a.item, b.item);
            if (typeof a.item === "string" && typeof b.item === "string") return SortUtil.ascSortLower(a.item, b.item);
            return 0;
        }
        else this._itemSortFn = itemSortFn

        this._itemRenderFn = typeof itemRenderFn === "function"
            ? itemRenderFn
            : fi => fi.hash.toTitleCase();

        this._itemRenderFnMini = typeof itemRenderFnMini === "function"
            ? itemRenderFnMini
            : fi => fi.hash.toTitleCase();

        this._isDisplayPill = typeof displayPillFn === "function"
            ? displayPillFn
            : (fi, fs) => fs[this.getFilterStateHash(fi)] != 0;
    }

    get defaultFilterState() {
        return Object.fromEntries(this._items.map(fi => {
            return [
                this.getFilterStateHash(fi),
                this._getDefaultFilterState(fi)
            ];
        }))
    }

    getFilterStateHash(filterItem: FilterItem | string) {
        if (filterItem instanceof FilterItem) return `${this.hash}.${filterItem.hash}`;
        return `${this.hash}.${filterItem}`;
    }

    protected _getItemHash(item: T_FilterItemValue) {
        return String(item);
    }

    protected _getFilterItem(item: T_FilterItemValue): FilterItem {
        const hash = this._getItemHash(item);
        return new FilterItem({item, hash})
    }

    addItem(item: T_FilterValues) {
        if (item === undefined) return;
        if (item instanceof Array) item.forEach(it => this.addItem(it));
        else {
            const filterItem = this._getFilterItem(item);
            if (this._itemsSet.has(filterItem.hash)) return;
            this._items.push(filterItem);
            this._itemsSet.add(filterItem.hash);
        }
    }

    doFilterEntity(entity: EntityType, filterState: T_FilterState) {
        const ownFilterState = this._getOwnFilterState(filterState);
        const filterValues = this._getFilterValues(entity);
        const valuesAsArray = (filterValues instanceof Array ? filterValues : [filterValues]).filter(v => v != undefined);

        let display = false;
        if (Object.values(ownFilterState).every(v => v != 1)) display = true;
        display = display || valuesAsArray.some(fv => ownFilterState[this.getFilterStateHash(this._getItemHash(fv))] === 1);

        const hide = valuesAsArray.some(fv => ownFilterState[this.getFilterStateHash(this._getItemHash(fv))] === 2);

        return display && !hide;
    }

    protected get _sortedItems () {
        return [...this._items].sort(this._itemSortFn);
    }

    protected _isItemActive(item: FilterItem, filterState: T_FilterState) {
        const stateHash = this.getFilterStateHash(item);
        const state = filterState[stateHash];
        return state === 1 || state === 2;
    }

    protected _onClickFilterPill(setFilterState: T_setFilterState, filterItem: FilterItem) {
        setFilterState(prevState => {
            const newState = {...prevState};
            const stateHash = this.getFilterStateHash(filterItem);
            newState[stateHash] = this._cycleState(prevState[stateHash]);
            return newState;
        });
    }

    protected _getRenderedFilterPill(filterState: T_FilterState, filterItem: FilterItem, setFilterState: T_setFilterState) {
        const stateHash = this.getFilterStateHash(filterItem);
        const fs = filterState[stateHash];
        return <Button
            size="xs"
            key={stateHash}
            variant={fs === 0 ? "light" : "filled"}
            color={fs === 0 ? "gray" : fs === 1 ? "blue" : "red"}
            onClick={() => this._onClickFilterPill(setFilterState, filterItem)}
        >
            {this._itemRenderFn(filterItem)}
        </Button>
    }

    protected _getRenderedFilterPills(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return this._sortedItems.map(fi => this._getRenderedFilterPill(filterState, fi, setFilterState));
    }

    protected _getRenderedControlButtonGroup(setFilterState: T_setFilterState) {
        const setAll = (toSet: number) => {
            setFilterState(prevState => {
                const newState = {...prevState};
                this._items.forEach(fi => {
                    const stateHash = this.getFilterStateHash(fi);
                    newState[stateHash] = toSet;
                });
                return newState;
            });
        }
        const setDefault = () => {
            setFilterState(prevState => ({...prevState, ...this.defaultFilterState}))
        }
        return <ButtonGroup className="ml-auto">
            {this._states.includes(1)
                ? <Button variant="outline" size="xs" onClick={() => setAll(1)}>All</Button>
                : null}
            <Button variant="outline" size="xs" color="gray" onClick={() => setAll(0)}>Clear</Button>
            {this._states.includes(2)
                ? <Button variant="outline" size="xs" color="red" onClick={() => setAll(2)}>None</Button>
                : null}
            <Button variant="outline" size="xs" color="gray" onClick={setDefault}>Default</Button>
        </ButtonGroup>
    }

    getRenderedModalRow(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return <div className="m-1 mx-0" key={this.header}>
            <Flex className="my-1">
                <Text fw={600}>{this.header}</Text>
                {this._getRenderedControlButtonGroup(setFilterState)}
            </Flex>
            <PillGroup>
                {this._getRenderedFilterPills(filterState, setFilterState)}
            </PillGroup>
            <Divider className="m-1 mx-0"></Divider>
        </div>
    }

    protected _onClickMiniPill(setFilterState: T_setFilterState, filterItem: FilterItem) {
        setFilterState(prevState => {
            const newState = {...prevState};
            newState[this.getFilterStateHash(filterItem)] = 0;
            return newState;
        });
    }

    protected _getRenderedMiniPill(filterState: T_FilterState, filterItem: FilterItem, setFilterState: T_setFilterState) {
        if (!this._isDisplayPill(filterItem, filterState)) return null;

        const stateHash = this.getFilterStateHash(filterItem);
        const fs = filterState[stateHash];

        return <Button
            key={stateHash}
            size="xs"
            radius="md"
            h={18}
            px={5}
            color={fs === 0 ? "gray.5" : fs === 1 ? "blue.4" : "red.4"}
            variant="filled"
            onClick={() => this._onClickMiniPill(setFilterState, filterItem)}
        >
            {this._itemRenderFnMini(filterItem)}
        </Button>
    }

    getRenderedMiniPills(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return this._sortedItems.map(fi => this._getRenderedMiniPill(filterState, fi, setFilterState)).filter(e => e !== null);
    }
}


interface MultiFilterOpts {
    filters: FilterBase[]
    header: string
}

export class MultiFilter extends FilterBase {
    private readonly _filters: FilterBase[];

    constructor({header, filters}: MultiFilterOpts) {
        super({header, allowedStates: [1, 0, 2]});

        this._filters = filters;
    }

    private get _hashCombineFilters() {
        return `${this.hash}.combine`;
    }

    private _getCombineMode(filterState: T_FilterState) {
        switch (filterState[this._hashCombineFilters]) {
            case 0:
                return "OR";
            case 1:
                return "AND";
            case 2:
                return "XOR";
            default:
                return "AND";
        }
    }

    get defaultFilterState() {
        return this._filters.reduce((acc, curr) => {
            return {...acc, ...curr.defaultFilterState}
        }, {[this._hashCombineFilters]: 1});
    }

    doFilterEntity(entity: unknown, filterState: T_FilterState) {
        const combine = this._getCombineMode(filterState);
        if (combine === "AND") {
            return this._filters.map(filter => filter.doFilterEntity(entity, filterState)).every(b => b);
        }
        const activeFilters = this._filters.filter(f => f.isActive(filterState));
        if (combine === "OR") {
            return activeFilters.length === 0 || activeFilters.map(f => f.doFilterEntity(entity, filterState)).some(b => b);
        } else if (combine === "XOR") {
            return activeFilters.length === 0 || activeFilters.map(f => f.doFilterEntity(entity, filterState)).filter(b => b).length === 1;
        }
        // Should be unreachable
        return true;
    }

    getRenderedModalRow(filterState: T_FilterState, setFilterState: T_setFilterState) {
        const combineMode = this._getCombineMode(filterState);
        const cycleCombineMode = () => {
            setFilterState(prevState => {
                return {...prevState, [this._hashCombineFilters]: this._cycleState(prevState[this._hashCombineFilters])}
            })
        }
        return <div className="m-1 mx-0" key={this.hash}>
            <Flex className="my-1">
                <Text fw={600}>{this.header}</Text>
                <Flex className="ml-auto" gap={5}>
                    <Text>Combine Group:</Text>
                    <Button w={60} color="teal" variant="outline" size="xs"
                            onClick={cycleCombineMode}>{combineMode}</Button>
                </Flex>
            </Flex>
            {this._filters.map(f => {
                return <div className="ml-2" key={f.hash}>{f.getRenderedModalRow(filterState, setFilterState)}</div>
            })}
        </div>
    }

    getRenderedMiniPills(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return this._filters.map(f => f.getRenderedMiniPills(filterState, setFilterState)).flat();
    }
}

interface SearchableFilterOps<EntityType> {
    header: string
    getFilterValues: (entity: EntityType) => T_FilterValues
    itemSortFn?: ((a: FilterItem, b: FilterItem) => number) | null
    itemRenderFn?: (fi: FilterItem) => React.ReactNode
    itemRenderFnMini?: (fi: FilterItem) => React.ReactNode
    displayPillFn?: (fi: FilterItem, fs: T_FilterState) => boolean
}

export class SearchableFilter<EntityType> extends Filter<EntityType> {
    constructor({
                    header,
                    getFilterValues,
                    itemSortFn,
                    itemRenderFn,
                    itemRenderFnMini,
                    displayPillFn
                }: SearchableFilterOps<EntityType>) {
        super({
            header,
            getFilterValues,
            itemSortFn,
            itemRenderFn,
            itemRenderFnMini,
            displayPillFn
        });
    }

    get defaultFilterState() {
        return {}
    }

    getRenderedModalRow(filterState: T_FilterState, setFilterState: T_setFilterState) {
        const addFilterState = (item: FilterItem, newState: number) => {
            setFilterState(prevState => {
                const filterHash = this.getFilterStateHash(item);
                return {...prevState, [filterHash]: newState}
            });
        }
        return <div className="m-1 mx-0" key={this.header}>
            <Flex className="my-1">
                <Text fw={600}>{this.header}</Text>
            </Flex>
            <PillGroup>
                {this._getRenderedFilterPills(filterState, setFilterState)}
            </PillGroup>
            <SearchableFilterSearchInput filterItems={this._sortedItems} addPill={addFilterState}></SearchableFilterSearchInput>
            <Divider className="m-1 mx-0"></Divider>
        </div>
    }

    protected _onClickFilterPill(setFilterState: T_setFilterState, filterItem: FilterItem) {
        setFilterState(prevState => {
            const newState = {...prevState};
            const stateHash = this.getFilterStateHash(filterItem);
            delete newState[stateHash];
            return newState;
        });
    }

    protected _getRenderedFilterPills(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return this._sortedItems.filter(fi => this._isItemActive(fi, filterState)).map(fi => this._getRenderedFilterPill(filterState, fi, setFilterState));
    }

    protected _onClickMiniPill(setFilterState: T_setFilterState, filterItem: FilterItem) {
        setFilterState(prevState => {
            const newState = {...prevState};
            delete newState[this.getFilterStateHash(filterItem)];
            return newState;
        });
    }

    getRenderedMiniPills(filterState: T_FilterState, setFilterState: T_setFilterState) {
        return this._sortedItems.filter(fi => this._isItemActive(fi, filterState)).map(fi => this._getRenderedMiniPill(filterState, fi, setFilterState)).filter(e => e !== null);
    }
}

interface SearchableFilterSearchInputProps {
    filterItems: FilterItem[]
    addPill: (fi: FilterItem, state: number) => void
}
// eslint-disable-next-line react-refresh/only-export-components
function SearchableFilterSearchInput({filterItems, addPill}: SearchableFilterSearchInputProps) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [searchText, setSearchText] = useState("");

    const filteredOptions = searchText === "" ? filterItems : filterItems.filter(it => it.hash.toLowerCase().includes(searchText.toLowerCase().trim()));
    // This component becomes very sluggish if we render every option (in case for ability filter: 436 options causes noticeable delay when opening the filterbox)
    const options = filteredOptions.slice(0, 10).map((item) => (
        <Combobox.Option value={item.hash} key={item.hash}>
            <Flex gap={5} align="center">
                {item.hash}
                <ButtonGroup>
                    <Button size="xs" color="blue.4" onClick={() => addPill(item, 1)}></Button>
                    <Button size="xs" color="red.4" onClick={() => addPill(item, 2)}></Button>
                </ButtonGroup>
            </Flex>
        </Combobox.Option>
    ));
    if (options.length === 10 && filteredOptions.length > 10) {
        options.push(<Combobox.Option value="options-hidden" key="options-hidden">
            <Text>{filteredOptions.length - 10} more options hidden...</Text>
        </Combobox.Option>)
    }

    return <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={() => {
            combobox.closeDropdown();
        }}
        position="bottom"
    >
        <Combobox.Target>
            <InputBase
                className="my-1"
                placeholder="Search Ability Name..."
                value={searchText}
                onChange={(event) => {
                    combobox.openDropdown();
                    combobox.updateSelectedOptionIndex();
                    setSearchText(event.target.value);
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => {
                    combobox.closeDropdown();
                    setSearchText("");
                }}
                rightSection={searchText !== "" ? <Input.ClearButton onClick={() => setSearchText("")}/> : null}
                rightSectionPointerEvents="auto"
            ></InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
            <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                {options.length > 0 ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
            </Combobox.Options>
        </Combobox.Dropdown>
    </Combobox>
}


export abstract class FilterData {
    abstract get filters(): FilterBase[]

    abstract get defaultFilterStates(): T_FilterState

    abstract addToFilters(entity: unknown): void

    abstract doFilterEntity(entity: unknown, filterState: T_FilterState): boolean
}

export class FilterSongData extends FilterData {
    readonly factionFilter: Filter<SongData>;
    readonly typeFilter: Filter<SongData>;
    readonly trayFilter: Filter<SongData>;
    readonly costFilter: Filter<SongData>;
    readonly attackFilter: MultiFilter;
    readonly attackTypeFilter: Filter<SongData>;
    readonly attackDiceFilter: Filter<SongData>;
    readonly toHitFilter: Filter<SongData>;
    readonly characterFilter: Filter<SongData>;
    readonly speedFilter: Filter<SongData>;
    readonly defenseFilter: Filter<SongData>;
    readonly moraleFilter: Filter<SongData>;
    readonly abilitiesFilter: SearchableFilter<SongData>;

    constructor() {
        super();
        this.factionFilter = new Filter({
            header: "Factions",
            getFilterValues: (ent: SongData) => ent.statistics.faction,
        });
        this.typeFilter = new Filter({
            header: "Type",
            getFilterValues: (ent: SongData) => ent._roleBuilder,
            itemRenderFn: (fi: FilterItem) => fi.hash,
            itemRenderFnMini: (fi: FilterItem) => fi.hash,
        });
        this.trayFilter = new Filter({
            header: "Tray",
            items: ["infantry", "cavalry", "solo", "warmachine"],
            itemSortFn: null,
            getFilterValues: (ent: SongData) => ent._fTray,
        });
        this.costFilter = new Filter({
            header: "Cost",
            itemRenderFnMini: fi => `Cost: ${fi.hash}`,
            itemSortFn: (a, b) => {
                const valA = Number(a.item);
                const valB = Number(b.item);
                if (isNaN(valA)) return 1;
                if (isNaN(valB)) return -1;
                return SortUtil.ascSortNumbers(valA, valB);
            },
            getFilterValues: (ent: SongData) => ent.statistics.cost,
        });

        this.toHitFilter = new Filter({
            header: "To Hit",
            itemRenderFnMini: h => `Hit: ${h.item}`,
            getFilterValues: (ent: SongData) => ent._fToHit,
        });
        this.attackDiceFilter = new Filter({
            header: "Attack Dice",
            itemRenderFnMini: fi => `Atk: ${fi.item}`,
            itemSortFn: (a, b) => {
                if (typeof a.item != "string" || typeof b.item != "string") return 0;
                return b.item.split("/").length - a.item.split("/").length || SortUtil.ascSort(b.item, a.item);
            },
            getFilterValues: (ent: SongData) => ent._fAttackDice,
        });
        this.attackTypeFilter = new Filter({
            header: "Attack Type",
            items: ["Melee", "Short Range", "Long Range"],
            itemSortFn: null,
            getFilterValues: (ent: SongData) => ent._fAttackTypes,
        });
        this.attackFilter = new MultiFilter({
            header: "Attacks",
            filters: [this.attackTypeFilter, this.attackDiceFilter, this.toHitFilter],
        });
        this.characterFilter = new Filter({
            header: "Character/Commander",
            getFilterValues: (ent: SongData) => ent._fCharacter,
            items: [FilterCharCmdr.char, FilterCharCmdr.cmdr],
            itemSortFn: null,
        });
        this.speedFilter = new Filter({
            header: "Speed",
            getFilterValues: (ent: SongData) => ent.statistics.speed,
            itemRenderFnMini: (fi: FilterItem) => `Speed: ${fi.item}`,
        });
        this.defenseFilter = new Filter({
            header: "Defense",
            getFilterValues: (ent: SongData) => ent.statistics.defense,
            itemRenderFnMini: (fi: FilterItem) => `Defense: ${fi.item}+`,
            itemRenderFn: (fi: FilterItem) => `${fi.item}+`,
        });
        this.moraleFilter = new Filter({
            header: "Morale",
            getFilterValues: (ent: SongData) => ent.statistics.morale,
            itemRenderFnMini: (fi: FilterItem) => `Morale: ${fi.item}+`,
            itemRenderFn: (fi: FilterItem) => `${fi.item}+`,
        });
        this.abilitiesFilter = new SearchableFilter({
            header: "Abilities",
            getFilterValues: (ent: SongData) => ent._fAbilities,
        })
    }

    get filters() {
        return [
            this.factionFilter,
            this.typeFilter,
            this.trayFilter,
            this.costFilter,
            this.speedFilter,
            this.abilitiesFilter,
            this.defenseFilter,
            this.moraleFilter,
            this.attackFilter,
            this.characterFilter,
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
        this.costFilter.addItem(ent.statistics.cost);
        this.speedFilter.addItem(ent.statistics.speed);
        this.defenseFilter.addItem(ent.statistics.defense);
        this.moraleFilter.addItem(ent.statistics.morale);
        this.attackDiceFilter.addItem(ent._fAttackDice);
        this.toHitFilter.addItem(ent._fToHit);
        this.abilitiesFilter.addItem(ent._fAbilities);
    }

    doFilterEntity(entity: SongData, filterState: T_FilterState) {
        return this.filters.map(filter => filter.doFilterEntity(entity, filterState)).every(b => b);
    }
}
