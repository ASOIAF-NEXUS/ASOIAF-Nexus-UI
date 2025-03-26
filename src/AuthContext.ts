import { createContext } from "react";
import type { AuthToken } from "./types";

export const AuthContext = createContext<AuthToken>("");
