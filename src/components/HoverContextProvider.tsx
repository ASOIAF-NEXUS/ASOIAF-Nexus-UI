import {ReactNode, useRef} from "react";
import HoverContext from "../HoverContext";


interface HoverContextProviderProps {
    children: ReactNode
}

export function HoverContextProvider({children}: HoverContextProviderProps) {
    const nextZIndex = useRef(200);
    const getNextZIndex = () => nextZIndex.current++;

    return <HoverContext.Provider value={{getNextZIndex}}>
        {children}
    </HoverContext.Provider>
}

export default HoverContextProvider
