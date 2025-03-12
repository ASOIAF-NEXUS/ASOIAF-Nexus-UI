import {createContext} from "react";

interface HoverContextValues {
    getNextZIndex: () => number
}
const HoverContext = createContext({} as HoverContextValues);
export default HoverContext;
