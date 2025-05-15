import {ReactNode, useRef, useState} from "react";
import HoverContext from "../HoverContext.ts";
import {createPortal} from "react-dom";
import {HoverState, HoverWindow} from "./HoverWindow.tsx";
import {Dictionary} from "../../../utils/utils.ts";


interface HoverContextProviderProps {
    children: ReactNode
}

interface PermanentWindowState extends HoverState {
    id: string
    content: ReactNode
    alternateContent: ReactNode
    windowTitle?: string
}

export interface createPermanentWindowOpts {
    id: string
    hoverState: HoverState
    content: ReactNode
    alternateContent?: ReactNode
    windowTitle?: string
}

export function HoverContextProvider({children}: HoverContextProviderProps) {
    const nextZIndex = useRef(200);
    const [permanentWindows, setPermanentWindows] = useState<Dictionary<PermanentWindowState>>({});
    const getNextZIndex = () => nextZIndex.current++;

    const existsPermanentWindow = (id: string) => permanentWindows[id] !== undefined;
    const createPermanentWindow = (opts: createPermanentWindowOpts) => {
        const {
            id,
            hoverState,
            content,
            alternateContent,
            windowTitle
        } = opts;
        if (existsPermanentWindow(id)) return;

        setPermanentWindows(prev => {
            const newState = Object.fromEntries(Object.entries(prev).map(([id, state]) => [id, {...state}]));
            newState[id] = {
                id,
                ...hoverState,
                permanent: true,
                content,
                alternateContent,
                windowTitle,
            }
            return newState;
        });
    }


    const getHoverStateSetter = (id: string) => {
        return (getNewWindowState: (hs: HoverState) => HoverState) => {
            setPermanentWindows(prev => {
                const newState = Object.fromEntries(Object.entries(prev).map(([id, state]) => [id, {...state}]));
                newState[id] = {
                    id,
                    ...getNewWindowState(prev[id]),
                    content: prev[id].content,
                    alternateContent: prev[id].alternateContent,
                    windowTitle: prev[id].windowTitle,
                };

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return Object.fromEntries(Object.entries(newState).filter(([_, state]) => state.permanent));
            });
        }
    }

    return <HoverContext.Provider value={{getNextZIndex, createPermanentWindow, existsPermanentWindow}}>
        {children}
        {Object.entries(permanentWindows).map(([id, permHoverState]) => {
            const stateSetter = getHoverStateSetter(id);
            return createPortal(
                <HoverWindow
                    hoverState={permHoverState}
                    setHoverState={stateSetter}
                    windowTitle={permHoverState.windowTitle}
                    content={permHoverState.content}
                    alternateContent={permHoverState.alternateContent}
                    onClose={evt => {
                        if (evt.shiftKey) setPermanentWindows({});
                        else stateSetter(hs => ({...hs, permanent: false}));
                    }}
                ></HoverWindow>,
                document.body);
        })
        }
    </HoverContext.Provider>
}

export default HoverContextProvider
