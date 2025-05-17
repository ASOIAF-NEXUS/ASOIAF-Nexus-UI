import {createContext, useContext} from "react";
import type {AuthToken, Login} from "./authTypes.ts";

interface AuthContextVal {
    token: AuthToken
    isUserLoggedIn: boolean
    doSignIn: (opts: SignInSignUpOpts) => Promise<void>
    doSignUp: (opts: SignInSignUpOpts) => Promise<void>
    doSignOut: () => void
}

export interface SignInSignUpOpts {
    login: Login,
    callbackSuccess?: () => void,
    callbackFailure?: () => void
}


export const AuthContext = createContext<AuthContextVal>({
    token: "",
    isUserLoggedIn: false,
} as AuthContextVal);

export const useAuth = () => useContext(AuthContext);
