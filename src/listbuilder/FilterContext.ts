import {createContext} from "react";
import {T_FilterState, T_setFilterState} from "./filter.tsx";


interface FilterContextVal {
    filterState: T_FilterState
    setFilterState: T_setFilterState
}

const FilterContext = createContext({} as FilterContextVal);

export default FilterContext;
