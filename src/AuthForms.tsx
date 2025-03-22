import { Button, Paper, PasswordInput, Stack, TextInput, Title} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { createContext } from "react";

type Login = {username: String, password: String}
type AuthToken = string;

export const AuthContext = createContext<AuthToken>("");

export function AuthForm({type, action}: {type: "sign-up" | "sign-in", action: (l: Login) => Promise<any>}) {
    const form = useForm({mode: "uncontrolled", initialValues: {username: "", password: ""}});

    return (
        <Paper shadow="md" radius="sm" p="xl" withBorder>
            <Stack gap="md">
            <Title>
                {type === "sign-up" && "Sign Up For NEXUS"}
                {type === "sign-in" && "Sign In To NEXUS"}
            </Title>
            <form onSubmit={form.onSubmit(action)}>
                <TextInput
                    label="Username"
                    key={form.key('username')}
                    {...form.getInputProps('username')} />
                <PasswordInput
                    label="Password"
                    key={form.key('password')}
                    {...form.getInputProps('password')} />
                <Button type="submit">Submit</Button>
            </form>
            </Stack>
        </Paper>
    );
}

export async function SignUp(login: Login) {
    axios.post("http://localhost:8080/api/v1/users/signup", login);
}

export async function SignIn(login: Login): Promise<string> {
    return await axios.post("http://localhost:8080/api/v1/users/login", login);
}