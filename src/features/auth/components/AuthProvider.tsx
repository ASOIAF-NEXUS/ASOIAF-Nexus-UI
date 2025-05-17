import {AuthContext, SignInSignUpOpts} from "../AuthContext.ts";
import {ReactNode, useState} from "react";
import {notifications} from "@mantine/notifications";
import {
    defaultErrorNotification,
    invalidLoginNotification,
    successfulSignupNotification,
} from "../authNotifications.ts";
import {AxiosError} from "axios";
import {signIn, signUp} from "../authActions.ts";

interface AuthProviderProps {
    children: ReactNode
}

function AuthProvider({children}: AuthProviderProps) {
    const [authToken, setAuthToken] = useState("");
    const isUserLoggedIn = authToken !== "";

    const doSignIn = async (opts: SignInSignUpOpts) => {
        const {
            login,
            callbackSuccess,
            callbackFailure,
        } = opts;
        try {
            const token = await signIn(login);
            setAuthToken(token);
            if (callbackSuccess !== undefined) callbackSuccess();
        } catch (ex: unknown) {
            if (ex instanceof AxiosError && ex.status === 400) {
                notifications.show(invalidLoginNotification);
            } else {
                notifications.show(defaultErrorNotification);
            }
            if (callbackFailure !== undefined) callbackFailure();
        }
    }

    const doSignUp = async (opts: SignInSignUpOpts) => {
        const {
            login,
            callbackSuccess,
            callbackFailure,
        } = opts
        try {
            await signUp(login);
            notifications.show(successfulSignupNotification);
            const token = await signIn(login);
            setAuthToken(token);
            if (callbackSuccess !== undefined) callbackSuccess();
        } catch {
            notifications.show(defaultErrorNotification);
            if (callbackFailure !== undefined) callbackFailure();
        }
    }

    const doSignOut = () => {
        setAuthToken("");
    }

    return <AuthContext.Provider value={{
        token: authToken,
        isUserLoggedIn,
        doSignIn,
        doSignUp,
        doSignOut,
    }}>
        {children}
    </AuthContext.Provider>
}

export default AuthProvider;
