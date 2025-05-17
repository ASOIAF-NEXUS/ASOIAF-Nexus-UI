import {AuthForm} from "../features/auth/components/AuthForms.tsx";
import {useAuth} from "../features/auth/AuthContext.ts";
import {Login} from "../features/auth/authTypes.ts";
import {useNavigate} from "react-router";
import PageTitle from "../features/nav/Components/PageTitle.tsx";


export default function SignUp() {
    const {doSignUp} = useAuth();
    const navigate = useNavigate();

    const action = async (login: Login) => {
        await doSignUp({
            login,
            callbackSuccess: () => navigate("home", {replace: true}),
        });
    }

    return <>
        <PageTitle title="Sign Up"/>
        <AuthForm type="sign-up" action={action}/>
    </>
}
