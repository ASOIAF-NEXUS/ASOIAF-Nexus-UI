import '@mantine/core/styles.css';
import "../filter.css";
import {FilterSongData} from "../filter.tsx";
import {dataLoader} from "../../dataLoader.ts";
import FilterBox from "./FilterBox.tsx"
import ArmyDisplay from "./ArmyDisplay.tsx";
import FilterContextProvider from "./FilterContextProvider.tsx";
import FactionSelect from "./FactionSelect.tsx";
import {defaultArmyIds, SongData} from "../../songTypes.ts";
import "../../utils.ts"
import {ButtonGroup, Flex} from "@mantine/core";
import ArmyContextProvider from "./ArmyContextProvider.tsx";
import SongDataFilterListDisplay from "./SongDataFilterListDisplay.tsx";
import HoverContextProvider from "../../components/HoverContextProvider.tsx";
import ArmySizeSelect from "./ArmySizeSelect.tsx";
import FormatSelect from "./FormatSelect.tsx";
import SaveLoadControls from "./SaveLoadArmies.tsx";
import ImportArmyButton from "./ImportArmyButton.tsx";
import ExportArmyButton from "./ExportArmyButton.tsx";
import {ArmyValidator} from "../ArmyValidator.ts";

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
