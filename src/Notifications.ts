import { NotificationData } from "@mantine/notifications";

export const successfulSignupNotification: NotificationData
    = {
    title: 'Success',
    message: 'Welcome to NEXUS!',
};

export const invalidLoginNotification: NotificationData
    = {
    title: 'Error',
    color: "red",
    message: 'Incorrect Login Credentials',
};

export const defaultErrorNotification: NotificationData
    = {
    title: "Error",
    color: "red",
    message: "We were unable to fulfill your request"
}