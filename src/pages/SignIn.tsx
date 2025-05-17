import {AuthForm} from "../features/auth/components/AuthForms.tsx";
import {useAuth} from "../features/auth/AuthContext.ts";
import {Login} from "../features/auth/authTypes.ts";
import {useNavigate} from "react-router";
import PageTitle from "../features/nav/Components/PageTitle.tsx";


export default function SignIn() {
    const {doSignIn} = useAuth();
    const navigate = useNavigate();

    const action = async (login: Login) => {
        await doSignIn({
            login,
            callbackSuccess: () => navigate("home", {replace: true}),
        });
    }

    return <>
        <PageTitle title="Login" />
        <AuthForm type="sign-in" action={action}/>
    </>
}
