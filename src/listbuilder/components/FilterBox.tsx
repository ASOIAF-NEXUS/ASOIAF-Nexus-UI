import * as React from "react";
import {useContext, useMemo, useState} from "react";
import {
    PillGroup,
    Button,
    TextInput,
    Input,
    ButtonGroup,
    Modal,
    ScrollArea,
    Flex,
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {FilterData} from "../filter.tsx"
import FilterContext from "../FilterContext.ts";


interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    dataFilter: FilterData
}

function FilterModal({isOpen, onClose, dataFilter}: FilterModalProps) {
    const {filterState, setFilterState} = useContext(FilterContext);

    return <Modal
        opened={isOpen}
        onClose={onClose}
        title="Filter"
        centered size="70%"
        scrollAreaComponent={ScrollArea.Autosize}
        overlayProps={{blur: 1}}
    >
        {dataFilter.filters.map(filter => filter.getRenderedModalRow(filterState, setFilterState))}
    </Modal>
}

const getSearchText = (obj: unknown) => {
    if (!obj || typeof obj !== "object") return String(obj);
    const asRecord = obj as Record<string, string>;
    if (typeof asRecord["_searchText"] === "string") return asRecord["_searchText"];
    if (typeof asRecord["_fullName"] === "string") return asRecord["_fullName"];
    if (typeof asRecord["name"] === "string") return asRecord["name"];
    return String(obj);
}

interface FilterBoxProps<T> {
    data: T[],
    filterData: FilterData,
    FilterListDisplay: React.FunctionComponent<{ displayData: T[] }>
}

function FilterBox<T>({data, filterData, FilterListDisplay}: FilterBoxProps<T>) {
    const {filterState, setFilterState} = useContext(FilterContext);
    const [searchText, setSearchText] = useState("");
    const [isFilterModalOpen, {open: doOpenFilterModal, close: doCloseFilterModal}] = useDisclosure(false);

    const filteredData = useMemo(() => {
        return data.filter(ent => filterData.doFilterEntity(ent, filterState));
    }, [filterData, data, filterState]);
    const filteredSearchedData = useMemo(() => {
        if (searchText === "") return filteredData;
        return filteredData.filter(item => getSearchText(item).toLowerCase().includes(searchText.toLowerCase()));
    }, [filteredData, searchText]);

    return <Flex className="h-100" direction="column">
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
            {filterData.filters.map(filter => filter.getRenderedMiniPills(filterState, setFilterState))}
        </PillGroup>
        <FilterListDisplay displayData={filteredSearchedData}></FilterListDisplay>
    </Flex>
}

export default FilterBox
