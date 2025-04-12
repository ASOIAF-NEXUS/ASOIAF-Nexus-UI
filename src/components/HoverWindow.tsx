import * as React from "react";
import {Attributes, cloneElement, CSSProperties, useContext, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {Button, Flex, ScrollArea} from "@mantine/core";
import useMouseDrag from "../hooks/useMouseDrag.ts";
import "./hover.css"
import {clamp} from "../utils.ts";
import {useViewportSize} from "@mantine/hooks";
import HoverContext from "../HoverContext.ts";


type T_HoverState = {
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

function HoverWrapper({children, hoverContent, alternateContent, defaultSize, windowTitle}: HoverWrapperProps) {
    const {height: screenHeight, width: screenWidth} = useViewportSize();
    const {getNextZIndex} = useContext(HoverContext);
    const [hoverState, setHoverState] = useState<T_HoverState>({
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

        const getTop = (y: number, state: T_HoverState) => {
            const downOutOfBounds = y + state.offset + state.height > screenHeight;
            const upOutOfBounds = y - state.height - state.offset < 0;

            if (upOutOfBounds && downOutOfBounds) return y + state.offset;
            else if (downOutOfBounds) return y - state.height - state.offset;
            return y + state.offset;
        }
        const getLeft = (x: number,  state: T_HoverState) => {
            const rightOutOfBounds = x + state.offset + state.width > screenWidth;
            const leftOutOfBounds = x - state.width - state.offset < 0;

            if (rightOutOfBounds && leftOutOfBounds) return x + state.offset;
            else if (rightOutOfBounds) return x - state.width - state.offset;
            return x + state.offset;
        }

        const controller = new AbortController();
        const signal = controller.signal;
        ele.addEventListener("mouseenter", (evt: MouseEvent) => {
            setHoverState(prevState => {
                const permanent = evt.ctrlKey || prevState.permanent;
                return {
                    ...prevState,
                    isHovering: true,
                    showAltContent: evt.shiftKey || false,
                    permanent,
                    left: permanent ? prevState.left : getLeft(evt.x, prevState),
                    top: permanent ? prevState.top : getTop(evt.y, prevState),
                    z: permanent ? prevState.z : getNextZIndex(),
                }
            });
        }, {signal});

        ele.addEventListener("mousemove", (evt: MouseEvent) => {
            setHoverState(prevState => {
                const permanent = evt.ctrlKey || prevState.permanent;
                return {
                    ...prevState,
                    showAltContent: permanent ? prevState.showAltContent : evt.shiftKey || false,
                    permanent,
                    left: permanent ? prevState.left : getLeft(evt.x, prevState),
                    top: permanent ? prevState.top : getTop(evt.y, prevState),
                }
            });
        }, {signal});

        ele.addEventListener("mouseleave", () => {
            setHoverState(prevState => {
                return {...prevState, isHovering: false}
            });
        }, {signal});

        return () => {
            controller.abort();
        };
    }, [getNextZIndex, screenHeight, screenWidth]);

    return <>
        {cloned}
        {!hoverState.isHovering && !hoverState.permanent
            ? null
            : createPortal(
                <HoverWindow
                    hoverState={hoverState}
                    setHoverState={setHoverState}
                    windowTitle={windowTitle}
                >
                    {hoverState.showAltContent ? alternateContent : hoverContent}
                </HoverWindow>,
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
    children?: React.ReactNode
    hoverState: T_HoverState
    setHoverState: React.Dispatch<React.SetStateAction<T_HoverState>>
    windowTitle?: string
}

function HoverWindow({children, hoverState, setHoverState, windowTitle}: HoverWindowProps) {
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

    return <div className="hover-window" style={style}>
        {resizeBorders}
        <div ref={refMoveWindow} className="hoverborder hoverborder--top">
            <span style={{color: "white", fontSize: "12px", paddingLeft: "2px"}}>{windowTitle || ""}</span>
            <Button
                color="red"
                variant="transparent"
                style={{height: "18px"}}
                className="ml-auto"
                onClick={() => setHoverState(prev => ({...prev, permanent: false}))}
            >X</Button>
        </div>
        <ScrollArea className="h-100" scrollbars="y">
            <Flex direction="column" align="center">
                {children}
            </Flex>
        </ScrollArea>
        <div className="hoverborder hoverborder--bottom">
            <ResizeBorder direction="s" handleDrag={getResizeHandler("s")} onStartDrag={onStartResize}></ResizeBorder>
        </div>
    </div>
}


export default HoverWrapper;
