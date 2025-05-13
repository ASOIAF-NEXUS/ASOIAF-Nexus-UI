import * as React from "react";
import {
    Attributes,
    cloneElement,
    CSSProperties,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import {createPortal} from "react-dom";
import {Button, Flex, Image, ScrollArea} from "@mantine/core";
import useMouseDrag from "../hooks/useMouseDrag.ts";
import "./hover.css"
import {clamp} from "../utils.ts";
import {useId, useViewportSize} from "@mantine/hooks";
import HoverContext from "../HoverContext.ts";


export interface HoverState {
    isHovering: boolean
    showAltContent: boolean
    permanent: boolean
    left: number
    top: number
    z: number
    height: number
    width: number
    offset: number
}

interface HoverWrapperProps {
    children: React.ReactElement
    hoverContent: React.ReactNode
    alternateContent?: React.ReactNode
    defaultSize?: { w: number, h: number }
    windowTitle?: string
}

export function HoverWrapper({children, hoverContent, alternateContent, defaultSize, windowTitle}: HoverWrapperProps) {
    const {height: screenHeight, width: screenWidth} = useViewportSize();
    const {getNextZIndex, createPermanentWindow, existsPermanentWindow} = useContext(HoverContext);
    const uuid = useId();
    const [hoverState, setHoverState] = useState<HoverState>({
        isHovering: false,
        showAltContent: false,
        permanent: false,
        left: 0,
        top: 0,
        z: 200,
        width: defaultSize?.w || 600,
        height: defaultSize?.h || 300,
        // Prevent flickering: the hover window would prevent hovering on the trigger element
        offset: 10,
    });
    const ref = useRef(null);
    const child = React.Children.only(children);
    const cloned = cloneElement(child, {
        ref,
    } as Attributes);

    useEffect(() => {
        const ele = ref.current as HTMLElement | null;

        if (ele === null) return undefined;

        const getTop = (y: number, state: HoverState) => {
            const downOutOfBounds = y + state.offset + state.height > screenHeight;
            const upOutOfBounds = y - state.height - state.offset < 0;

            if (upOutOfBounds && downOutOfBounds) return y + state.offset;
            else if (downOutOfBounds) return y - state.height - state.offset;
            return y + state.offset;
        }
        const getLeft = (x: number,  state: HoverState) => {
            const rightOutOfBounds = x + state.offset + state.width > screenWidth;
            const leftOutOfBounds = x - state.width - state.offset < 0;

            if (rightOutOfBounds && leftOutOfBounds) return x + state.offset;
            else if (rightOutOfBounds) return x - state.width - state.offset;
            return x + state.offset;
        }

        const controller = new AbortController();
        const signal = controller.signal;
        ele.addEventListener("mouseenter", (evt: MouseEvent) => {
            let stateForPermWindow: null | HoverState = null;
            setHoverState(prevState => {
                const permanent = evt.ctrlKey || prevState.permanent;
                const newState = {
                    ...prevState,
                    permanent,
                    isHovering: true,
                    showAltContent: evt.shiftKey || false,
                    left: getLeft(evt.x, prevState),
                    top: getTop(evt.y, prevState),
                    z: getNextZIndex(),
                };
                if (!prevState.permanent && permanent) {
                    stateForPermWindow = newState;
                }
                return newState;
            });
            if (stateForPermWindow !== null) createPermanentWindow({id: uuid, hoverState: stateForPermWindow, content: hoverContent, alternateContent, windowTitle});
        }, {signal});

        ele.addEventListener("mousemove", (evt: MouseEvent) => {
            let stateForPermWindow: null | HoverState = null;
            setHoverState(prevState => {
                const permanent = evt.ctrlKey || prevState.permanent;
                const newState = {
                    ...prevState,
                    permanent,
                    showAltContent: evt.shiftKey || false,
                    left: getLeft(evt.x, prevState),
                    top: getTop(evt.y, prevState),
                }

                if (!prevState.permanent && permanent) {
                    stateForPermWindow = newState;
                }
                return newState;
            });
            if (stateForPermWindow !== null) createPermanentWindow({id: uuid, hoverState: stateForPermWindow, content: hoverContent, alternateContent, windowTitle});
        }, {signal});

        ele.addEventListener("mouseleave", () => {
            setHoverState(prevState => {
                return {...prevState, isHovering: false}
            });
        }, {signal});

        return () => {
            controller.abort();
        };
    }, [getNextZIndex, screenHeight, screenWidth, uuid, createPermanentWindow, hoverContent, alternateContent, windowTitle]);

    if (!existsPermanentWindow(uuid) && hoverState.permanent) setHoverState(prev => ({...prev, permanent: false}));

    return <>
        {cloned}
        {!hoverState.isHovering || hoverState.permanent
            ? null
            : createPortal(
                <HoverWindow
                    hoverState={hoverState}
                    setHoverState={setHoverState}
                    windowTitle={windowTitle}
                    content={hoverContent}
                    alternateContent={alternateContent}
                ></HoverWindow>,
                document.body)
        }
    </>
}


interface ResizeBorderProps {
    direction: string
    handleDrag: (evt: MouseEvent) => void
    onStartDrag: () => void
}

function ResizeBorder({direction, handleDrag, onStartDrag}: ResizeBorderProps) {
    const {ref} = useMouseDrag({handleDrag, onStartDrag});

    return <div ref={ref} className={`hoverborder__resize-${direction}`}></div>
}


interface HoverWindowProps {
    content: React.ReactNode
    alternateContent?: React.ReactNode
    hoverState: HoverState
    setHoverState: (stFn: (hs: HoverState) => HoverState) => void
    windowTitle?: string
    onClose?: (evt: React.MouseEvent) => void
}

export function HoverWindow({content, alternateContent, hoverState, setHoverState, windowTitle, onClose}: HoverWindowProps) {
    const {height: screenHeight, width: screenWidth} = useViewportSize();
    const {getNextZIndex} = useContext(HoverContext);

    const offsetDrag = useRef({offsetX: 0, offsetY: 0})
    const onStartDrag = (evt: MouseEvent) => {
        offsetDrag.current = {offsetX: hoverState.left - evt.clientX, offsetY: hoverState.top - evt.clientY};
        setHoverState(prevState => {
            return {...prevState, z: getNextZIndex()}
        });
    }
    const handleDrag = (evt: MouseEvent) => {
        setHoverState(prevState => {
            return {
                ...prevState,
                left: evt.clientX + offsetDrag.current.offsetX,
                top: evt.clientY + offsetDrag.current.offsetY
            }
        })
    }
    const onStopDrag = () => {
        setHoverState(prevState => {
            return {
                ...prevState,
                left: clamp(prevState.left, -prevState.width / 2, screenWidth - prevState.width / 5),
                top: clamp(prevState.top, 0, screenHeight - prevState.height / 5),
            }
        });
    }
    const {ref: refMoveWindow} = useMouseDrag({handleDrag, onStartDrag, onStopDrag});

    const getResizeHandler = (direction: string) => {
        return (evt: MouseEvent) => {
            const dragNorth = () => {
                setHoverState(prevState => {
                    const newH = hoverState.top + hoverState.height - evt.clientY;
                    if (newH < 100) return {...prevState}
                    return {...prevState, height: newH, top: evt.clientY}
                });
            }
            const dragSouth = () => {
                setHoverState(prevState => {
                    const newH = evt.clientY - hoverState.top;
                    if (newH < 100) return {...prevState}
                    return {...prevState, height: newH}
                });
            }
            const dragEast = () => {
                setHoverState(prevState => {
                    const newW = evt.clientX - hoverState.left;
                    if (newW < 150) return {...prevState}
                    return {...prevState, width: newW}
                });
            }
            const dragWest = () => {
                setHoverState(prevState => {
                    const newW = hoverState.left + hoverState.width - evt.clientX;
                    if (newW < 150) return {...prevState}
                    return {...prevState, width: newW, left: evt.clientX}
                });
            }

            switch (direction) {
                case "n":
                    dragNorth();
                    break;
                case "ne":
                    dragNorth();
                    dragEast();
                    break;
                case "e":
                    dragEast();
                    break;
                case "se":
                    dragSouth();
                    dragEast();
                    break;
                case "s":
                    dragSouth();
                    break;
                case "sw":
                    dragSouth();
                    dragWest();
                    break;
                case "w":
                    dragWest();
                    break;
                case "nw":
                    dragNorth();
                    dragWest();
                    break;
            }
        }
    }
    const onStartResize = () => {
        setHoverState(prevState => {
            return {...prevState, z: getNextZIndex()}
        });
    }

    const style: CSSProperties = {
        top: hoverState.top,
        left: hoverState.left,
        width: `${hoverState.width}px`,
        height: `${hoverState.height}px`,
        background: "lightgray",
        zIndex: hoverState.z,
    }

    // "s" is rendered at the bottom
    const directions = ["n", "ne", "e", "se", "sw", "w", "nw"];
    const resizeBorders = directions.map(dir => <ResizeBorder
        key={dir}
        direction={dir}
        handleDrag={getResizeHandler(dir)}
        onStartDrag={onStartResize}
    ></ResizeBorder>);

    const onClickClose = (evt: React.MouseEvent) => {
        if (onClose) onClose(evt);
        else setHoverState(prev => ({...prev, permanent: false}));
    }

    return <div className="hover-window" style={style}>
        {resizeBorders}
        <Flex className="hoverborder hoverborder--top">
            <span ref={refMoveWindow} style={{color: "white", fontSize: "12px", paddingLeft: "2px", flexGrow: 1, textAlign: "left"}}>{windowTitle || ""}</span>
            <Button
                variant="transparent"
                size="xs"
                h={18}
                w={24}
                p={0}
                onClick={() => setHoverState(prev => ({...prev, showAltContent: !prev.showAltContent}))}
            >
                <Image h={18} w={18} src="./icon/cycle.png"></Image>
            </Button>
            <Button
                color="red"
                variant="transparent"
                h={18}
                w={36}
                p={0}
                onClick={onClickClose}
            >X</Button>
        </Flex>
        <ScrollArea className="h-100" scrollbars="y">
            <Flex direction="column" align="center">
                {hoverState.showAltContent && alternateContent !== undefined ? alternateContent : content}
            </Flex>
        </ScrollArea>
        <div className="hoverborder hoverborder--bottom">
            <ResizeBorder direction="s" handleDrag={getResizeHandler("s")} onStartDrag={onStartResize}></ResizeBorder>
        </div>
    </div>
}
