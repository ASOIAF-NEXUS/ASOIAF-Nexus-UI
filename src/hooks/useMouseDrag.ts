import {useEffect, useRef} from "react";

interface useMouseDragOpts {
    handleDrag: (evt: MouseEvent) => void
    onStartDrag?: (evt: MouseEvent) => void
    onStopDrag?: (evt: MouseEvent) => void
}

function useMouseDrag({handleDrag, onStartDrag, onStopDrag}: useMouseDragOpts) {
    const ref = useRef(null);
    const isDragging = useRef(false);

    useEffect(() => {
        const ele = ref.current as HTMLElement | null;

        if (ele === null) return undefined;

        const controller = new AbortController();
        const signal = controller.signal;

        const onMouseMove = (evt: MouseEvent) => {
            evt.preventDefault();
            handleDrag(evt);
        }

        const onMouseUp = (evt: MouseEvent) => {
            if (isDragging.current) {
                isDragging.current = false;
                unbind();
                if (onStopDrag) onStopDrag(evt);
            }
        }

        const bind = () => {
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }
        const unbind = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        ele.addEventListener("mousedown", (evt: MouseEvent) => {
            if (!isDragging.current) {
                isDragging.current = true;
                bind();
                if (onStartDrag) onStartDrag(evt);
                onMouseMove(evt);
            }
        }, {signal});

        return () => {
            controller.abort();
        };
    }, [handleDrag, onStartDrag, onStopDrag]);

    return {ref}
}

export default useMouseDrag;
