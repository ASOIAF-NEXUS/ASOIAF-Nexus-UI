import { Button, Paper, PasswordInput, Stack, TextInput, Title} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";

type Login = {username: string, password: string}


export function AuthForm({type, action}: {type: "sign-up" | "sign-in", action: (l: Login) => Promise<any>}) {
    const form = useForm({mode: "uncontrolled", initialValues: {username: "", password: ""}});
    const backend_url = import.meta.env.VITE_BACKEND_URL
    console.log(backend_url)
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
    const backend_url = import.meta.env.VITE_BACKEND_URL
    axios.post(`${backend_url}/api/v1/users/signup`, login);
}

export async function SignIn(login: Login): Promise<string> {
    const backend_url = import.meta.env.VITE_BACKEND_URL
    return await axios.post(`${backend_url}/api/v1/users/login`, login);
}