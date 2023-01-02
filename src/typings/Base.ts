import { RequestInit } from "undici";
import { Headers } from "./constants";

interface IBaseApi {
    debug: boolean;
    version: number;
    fetch: Function;
    baseUrl: string;
    headers: Headers;
};

type BaseApiConstructor = {
    debug: boolean;
    version: number;
}

type BaseFetchOptions = {
    options?: RequestInit;
    json?: boolean;
}

export {
    IBaseApi,
    BaseApiConstructor,
    BaseFetchOptions,
}