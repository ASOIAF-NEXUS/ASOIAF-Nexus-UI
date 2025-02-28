import * as React from "react";
import {createContext, Dispatch} from "react";
import {T_FilterState} from "./filter.tsx";


interface FilterContextVal {
    filterState: T_FilterState
    setFilterState: Dispatch<React.SetStateAction<T_FilterState>>
}

const FilterContext = createContext({} as FilterContextVal);

export default FilterContext;
