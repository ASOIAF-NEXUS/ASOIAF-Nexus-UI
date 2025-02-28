import {
    PillGroup,
    Pill,
    MantineSize, ButtonVariant, DefaultMantineColor,
    Button,
    TextInput,
    Input,
    ButtonGroup,
    Modal,
    ScrollArea,
    Divider,
} from "@mantine/core";
import {Dictionary, SongData} from "../utils.ts"
import {DataFilter, Filter} from "../filter.tsx"
import {useEffect, useMemo, useState} from "react";
import {useDisclosure} from "@mantine/hooks";


interface ListRowProps {
    item: SongData
    addUnit: (x: SongData) => void,
}

function ListRow({item, addUnit}: ListRowProps) {
    return <tr>
        <td>{item._fullName}</td>
        <td>{item._prop}</td>
        <td><Button onClick={()=> {addUnit(item)}}>Add</Button></td>
    </tr>
}

export interface FilterPillProps {
    variant: ButtonVariant
    color: DefaultMantineColor
    children: string
    item: string
    size?: MantineSize
    onClick?: () => void
}

function FilterPill({...props}: FilterPillProps) {
    return <Button
        {...props}
        size="xs"
    ></Button>
}


interface FilterModalProps {
    isOpen: boolean
    onClose: (fs: T_FilterState) => void
    dataFilter: DataFilter
    filterState: T_FilterState
    doSetNextState: (ixFilter: number, item: string, nextState: number) => void
}

function FilterModal({isOpen, onClose, dataFilter, filterState, doSetNextState}: FilterModalProps) {

    const onClickPill = (filter: Filter, fIx: number, item: string) => {
        const nextState = filter.nextState(filterState[fIx][item]);
        doSetNextState(fIx, item, nextState);
    }

    return <Modal
        opened={isOpen}
        onClose={() => onClose(filterState)}
        title="Filter"
        centered size="70%"
        scrollAreaComponent={ScrollArea.Autosize}
        overlayProps={{blur: 1}}
    >
        {dataFilter.filters.map((filter, fIx) =>
            <div className="m-1 mx-0" key={fIx}>
                <p>{filter.header}</p>
                <PillGroup>

                    {filter.getPillProps(filterState[fIx])
                        .map((props, iIx) => {
                            return <FilterPill
                                {...props}
                                key={`${fIx}-${iIx}`}
                                onClick={() => onClickPill(filter, fIx, props.item)}
                            />
                        })
                    }

                </PillGroup>
                <Divider className="m-1 mx-0"></Divider>
            </div>
        )}
    </Modal>
}


export interface FilterMiniPillProps {
    isRenderPill: boolean
    className: string
    children: string
    item: string
    size?: MantineSize
    onClick?: () => void
}

function FilterMiniPill({isRenderPill, ...props}: FilterMiniPillProps) {
    if (!isRenderPill) return null
    return <Pill {...props}></Pill>
}


interface FilterBoxProps {
    data: SongData[],
    dataFilter: DataFilter,
    addUnit: (x: SongData) => void,
}

type T_FilterState = Dictionary<number>[]

function FilterBox({data, dataFilter, addUnit}: FilterBoxProps) {

    const [filterState, setFilterState] = useState(dataFilter.filters.map(f => f.defaultFilterState));
    const [searchText, setSearchText] = useState("");

    const [isFilterModalOpen, {open: doOpenFilterModal, close: doCloseFilterModal}] = useDisclosure(false);

    useEffect(() => {
        data.forEach(item => dataFilter.addToFilters(item));
        setFilterState(dataFilter.filters.map(f => f.defaultFilterState));
    }, [data, dataFilter]);

    const filteredData = useMemo(() => {
        return data.filter(item => dataFilter.doFilterItem(item, filterState));
    }, [dataFilter, data, filterState]);
    const filteredSearchedData = useMemo(() => {
        if (searchText === "") return filteredData;
        return filteredData.filter(item => item._fullName.toLowerCase().includes(searchText));
    }, [filteredData, searchText]);

    const doSetNextState = (filterIx: number, item: string, nextState: number) => {
        setFilterState(prevState => {
            const newState = prevState.map(s => Object.assign({}, s));
            newState[filterIx][item] = nextState;
            return newState;
        });
    }

    const onClickMiniPill = (fIx: number, item: string) => {
        doSetNextState(fIx, item, 0);
    }

    return <>
        <FilterModal
            isOpen={isFilterModalOpen}
            onClose={(finalFilterState: T_FilterState) => {
                setFilterState(finalFilterState);
                doCloseFilterModal();
            }}
            dataFilter={dataFilter}
            filterState={filterState}
            doSetNextState={doSetNextState}
        ></FilterModal>

        <ButtonGroup className="filter-search-group">
            <Button
                variant="default"
                onClick={doOpenFilterModal}
            >Filter</Button>

            <TextInput
                className="filter-search__input"
                placeholder="Search..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value.toLowerCase())}
                rightSection={searchText !== "" ? <Input.ClearButton onClick={() => setSearchText("")}/> : null}
                rightSectionPointerEvents="auto"
            ></TextInput>

            <Button
                variant="default"
                onClick={() => setFilterState(dataFilter.filters.map(f => f.defaultFilterState))}
            >Reset</Button>
        </ButtonGroup>
        <PillGroup className="">
            {dataFilter.filters.map((filter, fIx) => filter.getMiniPillProps(filterState[fIx])
                .map((props, iIx) => {
                    return <FilterMiniPill
                        {...props}
                        size="xs"
                        key={`${fIx}-${iIx}`}
                        onClick={() => onClickMiniPill(fIx, props.item)}/>
                }))}
        </PillGroup>
        <table className="">
            <thead>
            <tr>
                <td><b>{filteredSearchedData.length} Items</b></td>
            </tr>
            </thead>
            <tbody>
            {filteredSearchedData.map((it, ix) => <ListRow key={ix} item={it} addUnit={addUnit}/>)}
            </tbody>
        </table>
    </>
}

export default FilterBox
