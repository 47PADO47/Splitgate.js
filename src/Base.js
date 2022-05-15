const fetch = require('node-fetch');
const { urls, headers } = require('./constants');

class BaseApi {
    constructor(data = {
        debug: false,
        version: 0,
    }) {
        this.debug = data.debug;
        this.version = data.version;
        this.fetch = fetch;
        
        this.baseUrl = urls[this.version];
        this.headers = headers;
    };

    error(message) {
        if (this.debug) this.log(message);
        return Promise.reject(new Error(message));
    };

    log(message) {
        console.log(`\x1b[31m[SPLITGATE]\x1b[0m\x1b[36m[v${this.version}]\x1b[0m`, message);
    };

    #fetch() {
        return this.error("Not implemented");
    };

    getMethods() {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(prop => prop !== "constructor");
    };
};
module.exports = BaseApi;