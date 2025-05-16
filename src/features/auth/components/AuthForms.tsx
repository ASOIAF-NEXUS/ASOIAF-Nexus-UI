import {Button, Paper, PasswordInput, Stack, TextInput, Title} from "@mantine/core";
import {useForm} from "@mantine/form";
import {Login} from "../authTypes.ts";

interface AuthFormProps {
    type: "sign-up" | "sign-in"
    action: (l: Login) => Promise<string | void>
}

export function AuthForm({type, action}: AuthFormProps) {
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
                        key={form.key("username")}
                        {...form.getInputProps("username")} />
                    <PasswordInput
                        label="Password"
                        key={form.key("password")}
                        {...form.getInputProps("password")} />
                    <Button type="submit">Submit</Button>
                </form>
            </Stack>
        </Paper>
    );
}
