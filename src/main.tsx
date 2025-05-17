import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {theme} from "./theme";
import {MantineProvider} from "@mantine/core";
import {Notifications} from "@mantine/notifications";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import AuthProvider from "./features/auth/components/AuthProvider.tsx";
import {BrowserRouter} from "react-router";


createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <MantineProvider theme={theme}>
            <BrowserRouter>
                <Notifications/>
                <AuthProvider>
                    <App/>
                </AuthProvider>
            </BrowserRouter>
        </MantineProvider>
    </StrictMode>
);
