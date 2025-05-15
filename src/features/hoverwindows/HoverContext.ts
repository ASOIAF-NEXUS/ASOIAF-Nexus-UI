import {createContext} from "react";
import {createPermanentWindowOpts} from "./components/HoverContextProvider.tsx";

interface HoverContextValues {
    getNextZIndex: () => number
    createPermanentWindow: (opts: createPermanentWindowOpts) => void
    existsPermanentWindow: (id: string) => boolean
}
const HoverContext = createContext({} as HoverContextValues);
export default HoverContext;
