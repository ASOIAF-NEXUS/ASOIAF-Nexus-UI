import '@mantine/core/styles.css';
import "../filter.css";
import {FilterSongData} from "../filter.tsx";
import {dataLoader} from "../../dataLoader.ts";
import FilterBox from "./FilterBox.tsx"
import ArmyDisplay from "./ArmyDisplay.tsx";
import FilterContextProvider from "./FilterContextProvider.tsx";
import FactionSelect from "./FactionSelect.tsx";
import {ArmyListIDs, defaultArmyFormat, defaultArmySize, FACTIONS, SongData} from "../../songTypes.ts";
import "../../utils.ts"
import {Flex} from "@mantine/core";
import ArmyContextProvider from "./ArmyContextProvider.tsx";
import SongDataFilterListDisplay from "./SongDataFilterListDisplay.tsx";
import HoverContextProvider from "../../components/HoverContextProvider.tsx";
import ArmySizeSelect from "./ArmySizeSelect.tsx";
import FormatSelect from "./FormatSelect.tsx";
import SaveLoadControls from "./SaveLoadArmies.tsx";
import ImportArmyButton from "./ImportArmyButton.tsx";
import ExportArmyButton from "./ExportArmyButton.tsx";


const data = dataLoader.load().filter(d => d._prop != "tactics" && d._prop != "specials");
const filterSongData = new FilterSongData();
data.forEach(item => filterSongData.addToFilters(item));

const defaultArmyData: ArmyListIDs = {
    faction: FACTIONS.greyjoy,
    ids: [],
    points: defaultArmySize,
    format: defaultArmyFormat,
}

function ListBuilder() {
    const defaultFilterStates = filterSongData.defaultFilterStates;
    defaultFilterStates[filterSongData.factionFilter.getFilterStateHash(defaultArmyData.faction)] = 1;

    return <>
        <HoverContextProvider>
            <FilterContextProvider defaultFilterStates={defaultFilterStates}>
                <ArmyContextProvider defaultArmyData={defaultArmyData} data={data}>
                    <Flex gap="xl" direction="row" className="h-100">
                        <Flex className="h-100 w-60" direction="column">
                            <FilterBox<SongData>
                                data={data}
                                filterData={filterSongData}
                                FilterListDisplay={SongDataFilterListDisplay}
                            ></FilterBox>
                        </Flex>
                        <Flex className="h-100 w-40" direction="column">
                            <Flex className="my-1" align="center" gap={5}>
                                <FactionSelect filterData={filterSongData}></FactionSelect>
                                <ArmySizeSelect />
                                <FormatSelect />
                                <SaveLoadControls data={data}/>
                                <ImportArmyButton />
                                <ExportArmyButton />
                            </Flex>
                            <ArmyDisplay
                                filterData={filterSongData}
                            ></ArmyDisplay>
                        </Flex>
                    </Flex>
                </ArmyContextProvider>
            </FilterContextProvider>
        </HoverContextProvider>
    </>
}

export default ListBuilder
