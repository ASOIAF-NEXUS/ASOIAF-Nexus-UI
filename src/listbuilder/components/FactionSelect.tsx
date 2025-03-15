import {Button, Image, Popover} from "@mantine/core";
import {useContext, useState} from "react";
import FilterContext from "../FilterContext.ts";
import ArmyContext from "../ArmyContext.ts";
import {FilterSongData} from "../filter.tsx";
import {FACTIONS} from "../../songTypes.ts";
import useConfirm from "../../hooks/useConfirm.tsx";


interface FactionSelectOpts {
    filterData: FilterSongData
}

function FactionSelect({filterData}: FactionSelectOpts) {
    const {setFilterState} = useContext(FilterContext);
    const {armyData, setArmyFaction} = useContext(ArmyContext);
    const {ConfirmModal, askConfirm} = useConfirm({
        title: "Are you sure?",
        message: "Selecting a new faction will wipe your army!",
        onOpen: () => setOpenedPopover(false),
    });
    const [openedPopover, setOpenedPopover] = useState(false);

    const onChange = (faction: FACTIONS) => {
        setArmyFaction(faction, {
            askConfirm,
            onConfirm: () => {
                setFilterState(() => {
                    const newState = filterData.defaultFilterStates;
                    const factionFilter = filterData.factionFilter;
                    newState[factionFilter.getFilterStateHash(faction)] = 1;
                    return newState;
                });
            }
        });
    }

    const renderBtn = (faction: FACTIONS) => {
        const src = `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/assets/warcouncil/${faction}/crest-shadow.png`;
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
                        src={`https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/assets/warcouncil/${armyData.faction}/crest-shadow.png`}>
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
