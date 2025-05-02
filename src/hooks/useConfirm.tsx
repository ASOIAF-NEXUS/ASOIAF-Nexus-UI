import {Button, Flex, Modal} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useState} from "react";

export interface useConfirmHandlers {
    onConfirm?: () => void
    onCancel?: () => void
    onOpenModal?: () => void
    onCloseModal?: () => void
}
interface askConfirmOptions {
    onConfirm?: () => void
    onCancel?: () => void
    onOpenModal?: () => void
    onCloseModal?: () => void
    title?: string
    message?: string
}

function useConfirm() {
    const [opened, {open, close}] = useDisclosure(false);
    const [handlers, setHandlers] = useState({} as useConfirmHandlers);
    const [modalTitle, setModalTitle] = useState("Are you sure?");
    const [modalMessage, setModalMessage] = useState("");

    const doClose = () => {
        close();
        if (handlers.onCloseModal) handlers.onCloseModal();
    }

    const askConfirm = ({onOpenModal, onCloseModal, onConfirm, onCancel, message, title}: askConfirmOptions) => {
        setHandlers({onConfirm, onCancel, onOpenModal, onCloseModal});
        if (title) setModalTitle(title);
        if (message) setModalMessage(message);
        if (onOpenModal) onOpenModal();
        open();
    }

    const ConfirmModal = () => <Modal
        opened={opened}
        onClose={doClose}
        title={modalTitle}
        withCloseButton={false}
        size="30%"
    >
        {modalMessage ? <Flex className="m-1 my-0">{modalMessage}</Flex> : null}
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
