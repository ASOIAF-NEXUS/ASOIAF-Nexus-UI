import {ReactElement} from "react";
import {SongData} from "../songTypes.ts";
import {HoverWrapper} from "./HoverWindow.tsx";
import {Image} from "@mantine/core";

interface SongHoverWrapperProps {
    children: ReactElement
    entity: SongData
}

function SongHoverWrapper({children, entity}: SongHoverWrapperProps) {
    const imageSrc = `./img/${entity.id}x1.webp`;
    const imageBackSrc = `./img/${entity.id}bx1.webp`;
    const defaultSize = entity._prop === "units" ? {w: 600, h: 369} : {w: 300, h: 439}

    const getImage = (src: string) => {
        return <Image
            src={src}
        ></Image>
    }

    return <HoverWrapper
        hoverContent={getImage(imageSrc)}
        alternateContent={getImage(imageBackSrc)}
        defaultSize={defaultSize}
        windowTitle={entity._fullName}
    >
        {children}
    </HoverWrapper>
}

export default SongHoverWrapper;
