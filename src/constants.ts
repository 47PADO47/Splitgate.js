import { Headers, Urls } from "./typings/constants";

const urls = Object.freeze({
    1: 'https://api.splitgate.com/',
    2: 'https://splitgate.accelbyte.io/'
}) as Urls;

const headers = {
    "User-Agent": "PortalWars/++PortalWars+Main-CL-1863 Windows/10.0.22000.1.256.64bit",
} as Headers;

export {
    urls,
    headers,
};