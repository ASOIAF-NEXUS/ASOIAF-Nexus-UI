import {ReactNode, useState} from "react";
import {T_FilterState} from "../filter.tsx";
import FilterContext from "../FilterContext.ts";

interface FilterContextProviderProps {
    children: ReactNode
    defaultFilterStates: T_FilterState
}
function FilterContextProvider({children, defaultFilterStates}: FilterContextProviderProps) {
    const [filterState, setFilterState] = useState(defaultFilterStates);

    return <FilterContext.Provider value={{filterState, setFilterState}}>
        {children}
    </FilterContext.Provider>
}
 export default FilterContextProvider;
