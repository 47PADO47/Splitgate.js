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

export {
    IBaseApi,
    BaseApiConstructor,
}