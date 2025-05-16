import {AuthForm} from "../features/auth/components/AuthForms.tsx";
import {useAuth} from "../features/auth/AuthContext.ts";
import {Login} from "../features/auth/authTypes.ts";
import {NavigationState} from "../features/nav/navTypes.ts";


interface SignInProps {
    setNavigationState: (ns: NavigationState) => void
}

export default function SignIn({setNavigationState}: SignInProps) {
    const {doSignIn} = useAuth();
    const action = async (login: Login) => {
        await doSignIn({
            login,
            callbackSuccess: () => setNavigationState("home"),
        });
    }

    return <AuthForm type="sign-in" action={action}/>
}
