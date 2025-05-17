import {useEffect} from "react";

interface PageTitleProps {
    title: string
}

function PageTitle({title}: PageTitleProps) {

    useEffect(() => {
        document.title = title === "" ? "NEXUS" : `NEXUS - ${title}`;
    }, [title])

    return null;
}


export default PageTitle;
