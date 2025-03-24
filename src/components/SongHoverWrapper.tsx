import {ReactElement} from "react";
import {SongData} from "../songTypes.ts";
import HoverWrapper from "./HoverWindow.tsx";
import {Image} from "@mantine/core";

interface SongHoverWrapperProps {
    children: ReactElement
    entity: SongData
}

function SongHoverWrapper({children, entity}: SongHoverWrapperProps) {
    const imageSrc = `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/generated/en/${entity.statistics.faction}/${entity.id}.jpg`;
    const imageBackSrc = `https://raw.githubusercontent.com/Pf2eTools/asoiaf-tmg-data/refs/heads/master/generated/en/${entity.statistics.faction}/${entity.id}b.jpg`;
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
