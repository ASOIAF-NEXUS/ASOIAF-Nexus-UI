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
import {FilterData, Filter} from "../filter.tsx"
import {useContext, useMemo, useState} from "react";
import {useDisclosure} from "@mantine/hooks";
import FilterContext from "../FilterContext.ts";
import {SongData} from "../../songTypes.ts";


interface ListRowProps {
    item: SongData
}

function ListRow({item}: ListRowProps) {
    return <tr>
        <td>{item.id}</td>
        <td>{item._fullName}</td>
        <td>{item._prop}</td>
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


interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    dataFilter: FilterData
}

function FilterModal({isOpen, onClose, dataFilter}: FilterModalProps) {
    const {filterState, setFilterState} = useContext(FilterContext);

    const onClickPill = (filter: Filter, filterItem: string) => {
        setFilterState(prevState => {
            const newState = {...prevState};
            newState[filter.getFilterStateHash(filterItem)] = filter.cycleState(filterState[filter.getFilterStateHash(filterItem)]);
            return newState;
        });
    }

    return <Modal
        opened={isOpen}
        onClose={onClose}
        title="Filter"
        centered size="70%"
        scrollAreaComponent={ScrollArea.Autosize}
        overlayProps={{blur: 1}}
    >
        {dataFilter.filters.map((filter, fIx) =>
            <div className="m-1 mx-0" key={fIx}>
                <p>{filter.header}</p>
                <PillGroup>

                    {filter.getPillProps(filterState)
                        .map((props, iIx) => {
                            return <FilterPill
                                {...props}
                                key={`${fIx}-${iIx}`}
                                onClick={() => onClickPill(filter, props.item)}
                            />
                        })
                    }

                </PillGroup>
                <Divider className="m-1 mx-0"></Divider>
            </div>
        )}
    </Modal>
}


interface FilterBoxProps {
    data: SongData[],
    filterData: FilterData,
}

function FilterBox({data, filterData}: FilterBoxProps) {
    const {filterState, setFilterState} = useContext(FilterContext);
    const [searchText, setSearchText] = useState("");
    const [isFilterModalOpen, {open: doOpenFilterModal, close: doCloseFilterModal}] = useDisclosure(false);

    const doSetNextFilterState = (filter: Filter, filterItem: string, nextState: number) => {
        setFilterState(prevState => {
            const newState = {...prevState};
            newState[filter.getFilterStateHash(filterItem)] = nextState;
            return newState;
        });
    }

    const filteredData = useMemo(() => {
        return data.filter(ent => filterData.doFilterEntity(ent, filterState));
    }, [filterData, data, filterState]);
    const filteredSearchedData = useMemo(() => {
        if (searchText === "") return filteredData;
        return filteredData.filter(item => item._fullName.toLowerCase().includes(searchText.toLowerCase()));
    }, [filteredData, searchText]);

    return <>
        <FilterModal
            isOpen={isFilterModalOpen}
            onClose={doCloseFilterModal}
            dataFilter={filterData}
        ></FilterModal>

        <ButtonGroup className="m-1 filter-search-group">
            <Button
                variant="default"
                onClick={doOpenFilterModal}
            >Filter</Button>

            <TextInput
                className="filter-search__input"
                placeholder="Search..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                rightSection={searchText !== "" ? <Input.ClearButton onClick={() => setSearchText("")}/> : null}
                rightSectionPointerEvents="auto"
            ></TextInput>

            <Button
                variant="default"
                onClick={() => setFilterState(filterData.defaultFilterStates)}
            >Reset</Button>
        </ButtonGroup>
        <PillGroup className="mx-1">
            {filterData.filters.map((filter, fIx) => filter.getMiniPillProps(filterState)
                .map((props, iIx) => {
                    return <FilterMiniPill
                        {...props}
                        size="xs"
                        key={`${fIx}-${iIx}`}
                        onClick={() => doSetNextFilterState(filter, props.item, 0)}/>
                }))}
        </PillGroup>
        <table className="m-1 filter-list">
            <thead>
            <tr>
                <td><b>{filteredSearchedData.length} Items</b></td>
            </tr>
            </thead>
            <tbody>
            {filteredSearchedData.map((it, ix) => <ListRow key={ix} item={it}/>)}
            </tbody>
        </table>
    </>
}

export default FilterBox
