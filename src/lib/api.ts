import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

export class Api {
    private static _backendHost = import.meta.env.VITE_BACKEND_URL;
    private static _version = "v1";
    private static _axios = axios.create({
        baseURL: `${this._backendHost}/api/${this._version}`
    });

    static async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig<unknown>): Promise<T> {
        const response = await this._axios.post<T, AxiosResponse<T>>(url, data, config);
        return response.data;
    }
}
