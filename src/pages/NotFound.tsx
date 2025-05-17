import {Text} from "@mantine/core";
import PageTitle from "../features/nav/Components/PageTitle.tsx";

function NotFoundPage() {
    return <>
        <PageTitle title="404" />
        <Text>Page not found.</Text>
    </>
}

export default NotFoundPage;
