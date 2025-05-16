import {AuthForm} from "../features/auth/components/AuthForms.tsx";
import {useAuth} from "../features/auth/AuthContext.ts";
import {Login} from "../features/auth/authTypes.ts";
import {NavigationState} from "../features/nav/navTypes.ts";


interface SignUpProps {
    setNavigationState: (ns: NavigationState) => void
}

export default function SignUp({setNavigationState}: SignUpProps) {
    const {doSignUp} = useAuth();
    const action = async (login: Login) => {
        await doSignUp({
            login,
            callbackSuccess: () => setNavigationState("home"),
        });
    }

    return <AuthForm type="sign-up" action={action}/>
}
