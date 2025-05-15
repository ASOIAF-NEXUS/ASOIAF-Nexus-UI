import '@mantine/core/styles.css';
import "../features/filter/filter.css";
import {dataLoader} from "../utils/dataLoader.ts";
import FilterBox from "../features/filter/components/FilterBox.tsx"
import ArmyDisplay from "../features/listbuild/components/ArmyDisplay.tsx";
import FilterContextProvider from "../features/filter/components/FilterContextProvider.tsx";
import FactionSelect from "../features/listbuild/components/FactionSelect.tsx";
import {defaultArmyIds, SongData} from "../utils/songTypes.ts";
import "../utils/utils.ts"
import {ButtonGroup, Flex} from "@mantine/core";
import ArmyContextProvider from "../features/listbuild/components/ArmyContextProvider.tsx";
import SongDataFilterListDisplay from "../features/filter/components/SongDataFilterListDisplay.tsx";
import HoverContextProvider from "../features/hoverwindows/components/HoverContextProvider.tsx";
import ArmySizeSelect from "../features/listbuild/components/ArmySizeSelect.tsx";
import FormatSelect from "../features/listbuild/components/FormatSelect.tsx";
import SaveLoadControls from "../features/listbuild/components/SaveLoadArmies.tsx";
import ImportArmyButton from "../features/listbuild/components/ImportArmyButton.tsx";
import ExportArmyButton from "../features/listbuild/components/ExportArmyButton.tsx";
import {ArmyValidator} from "../features/listbuild/ArmyValidator.ts";
import {FilterSongData} from "../features/filter/filter.tsx";

const allData = dataLoader.load();
const data = allData.filter(d => d._prop != "tactics" && d._prop != "specials");
// const extraData = allData.filter(d => d._prop === "tactics" || d._prop === "specials");
const armyValidator = new ArmyValidator({data});
const filterSongData = new FilterSongData({validator: armyValidator});
data.forEach(item => filterSongData.addToFilters(item));

function ListBuilder() {
    return <>
        <HoverContextProvider>
            <FilterContextProvider defaultFilterStates={filterSongData.defaultFilterStates}>
                <ArmyContextProvider defaultArmyIDs={defaultArmyIds} data={data} validator={armyValidator}>
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
                                <ButtonGroup>
                                    <SaveLoadControls data={data}/>
                                </ButtonGroup>
                                <ButtonGroup>
                                    <ImportArmyButton />
                                    <ExportArmyButton />
                                </ButtonGroup>
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
