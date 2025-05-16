import {Login} from "./authTypes.ts";
import {Api} from "../../lib/api.ts";


export async function signUp(login: Login) {
    return Api.post<void>("/users/signup", login);
}

export async function signIn(login: Login) {
    return Api.post<string>("/users/login", login);
}
