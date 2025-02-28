import '@mantine/core/styles.css';
import "../filter.css";
import FilterBox from "./FilterBox.tsx"
import {useEffect, useMemo, useState} from "react";
import {SongData, DataLoader} from "../utils.ts"
import {FilterSongData} from "../filter.tsx";
import { useQuery } from '@tanstack/react-query';
import { LoadingOverlay } from '@mantine/core';
type Props = {
    addUnit: (x: SongData) => void
    data: SongData[]
    // chooserType: "Units" | "Attachments" | "Ncus" | "Tactics" | "Specials"
    // faction: string
}


function ListBuilder(props: Props) {
    const filterSongData = useMemo(() => {
        const filterer = new FilterSongData()
        return filterer
    }, []);

    return (
        <>
            <FilterBox data={props.data} dataFilter={filterSongData} addUnit={props.addUnit}></FilterBox>
        </>
    )
}

export default ListBuilder
