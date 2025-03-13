import {Button, Flex, Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useState} from "react";

interface useConfirmOptions {
    title: string
    message: string
    onOpen?: () => void
    onClose?: () => void
}

export interface confirmHandlers {
    onConfirm?: () => void
    onCancel?: () => void
}

function useConfirm({title, message, onOpen, onClose}: useConfirmOptions) {
    const [opened, {open, close}] = useDisclosure(false);
    const [handlers, setHandlers] = useState({} as confirmHandlers);

    const doOpen = () => {
        open();
        if (onOpen) onOpen();
    }
    const doClose = () => {
        close();
        if (onClose) onClose();
    }

    const askConfirm = (_handlers: confirmHandlers) => {
        setHandlers(_handlers);
        doOpen();
    }

    const ConfirmModal = () => <Modal
        opened={opened}
        onClose={doClose}
        title={title}
        withCloseButton={false}
        size="30%"
    >
        <Flex className="m-1 my-0">{message}</Flex>
        <Flex justify="center" align="center">
            <Button
                className="m-1"
                color="green"
                onClick={() => {
                    if (handlers.onConfirm) handlers.onConfirm();
                    doClose();
                }}
            >Yes
            </Button>
            <Button
                className="m-1"
                color="red"
                onClick={() => {
                    if (handlers.onCancel) handlers.onCancel();
                    doClose();
                }}
            >Cancel
            </Button>
        </Flex>
    </Modal>

    return {ConfirmModal, askConfirm}
}

export default useConfirm;
