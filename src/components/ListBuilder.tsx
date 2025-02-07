import '@mantine/core/styles.css';
import "../filter.css";
import FilterBox from "./FilterBox.tsx"
import {useEffect, useMemo, useState} from "react";
import {SongData, DataLoader} from "../utils.ts"
import {FilterSongData} from "../filter.tsx";



function ListBuilder() {
    const [data, setData] = useState([] as SongData[]);

    useEffect(() => {
        const loader = new DataLoader();
        loader.pLoadSetState(setData)
    }, []);

    const filterSongData = useMemo(() => {
        return new FilterSongData()
    }, []);

    return (
        <>
            <div className="filter-wrapper">
                <FilterBox data={data} dataFilter={filterSongData}></FilterBox>
            </div>
        </>
    )
}

export default ListBuilder
