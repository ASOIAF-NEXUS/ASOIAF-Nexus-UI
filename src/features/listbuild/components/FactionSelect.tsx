import {Button, Image, Popover} from "@mantine/core";
import {useContext, useState} from "react";
import ArmyContext from "../ArmyContext.ts";
import {FACTIONS} from "../../../utils/songTypes.ts";
import {useFilterContext} from "../../filter/FilterContext.ts";
import {FilterSongData} from "../../filter/filter.tsx";


interface FactionSelectOpts {
    filterData: FilterSongData
}

function FactionSelect({filterData}: FactionSelectOpts) {
    const {setFilterState} = useFilterContext();
    const {armyData, confirmSetArmyFaction, ConfirmModal} = useContext(ArmyContext);
    const [openedPopover, setOpenedPopover] = useState(false);

    const onChange = (faction: FACTIONS) => {
        confirmSetArmyFaction(faction, {
            onOpenModal: () => setOpenedPopover(false),
            onConfirm: () => setFilterState(filterData.defaultFilterStates),
        });
    }

    const renderBtn = (faction: FACTIONS) => {
        const src = `./img/crest-${faction}.png`;
        return <Button
            key={faction}
            style={{padding: 5, margin: 5}}
            variant={armyData.faction === faction ? "light" : "subtle"}
            color="gray"
            h={70}
            w={70}
            onClick={() => onChange(faction)}
        ><Image h={60} w="auto" fit="contain" src={src}></Image></Button>
    }

    return <>
        <ConfirmModal/>
        <Popover width={355} position="bottom" withArrow shadow="md" opened={openedPopover} onChange={setOpenedPopover}>
            <Popover.Target>
                <Button h={50} w={50} variant="default" style={{padding: 2}} onClick={() => setOpenedPopover(o => !o)}>
                    <Image
                        h="100%"
                        w="auto"
                        fit="contain"
                        src={`./img/crest-${armyData.faction}.png`}>
                    </Image>
                </Button>
            </Popover.Target>
            <Popover.Dropdown>
                {Object.values(FACTIONS).map(it => renderBtn(it))}
            </Popover.Dropdown>
        </Popover>
    </>
}

export default FactionSelect;
