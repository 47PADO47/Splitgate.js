import { fetch } from 'undici';
import { urls, headers } from './constants';
import { BaseApiConstructor, IBaseApi } from '../typings/Base';
import { Headers } from '../typings/constants';

class BaseApi implements IBaseApi {
    debug: boolean;
    version: number;
    fetch: Function;
    baseUrl: string;
    headers: Headers;
    constructor(data: BaseApiConstructor = {
        debug: false,
        version: 0,
    }) {
        this.debug = data.debug;
        this.version = data.version;
        this.fetch = fetch;
        
        this.baseUrl = urls[this.version];
        this.headers = headers;
    };

    error(message: string): Promise<never> {
        this.log(message);
        return Promise.reject(new Error(message));
    };

    log(message: string): void {
        if (this.debug) console.log(`\x1b[31m[SPLITGATE]\x1b[0m\x1b[36m[v${this.version}]\x1b[0m`, message);
    };

    getMethods(): string[] {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(prop => prop !== "constructor");
    };
};

export default BaseApi;