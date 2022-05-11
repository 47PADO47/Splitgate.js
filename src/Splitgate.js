const fetch = require('node-fetch');

class Splitgate {
    #token = "";
    #data = {};
    #baseUrl = "";
    #headers = "";
    constructor(platformAuthToken, authToken) {
        this.#token = "";
        this.authorized = false;

        this.userId = "";

        this.#data = {
            platformAuthToken,
            authToken,
        };
        
        this.#baseUrl = "https://api.splitgate.com/";
        this.#headers = {
            "Content-Type": "application/json",
            "User-Agent": "PortalWars/++PortalWars+Main-CL-1863 Windows/10.0.22000.1.256.64bit",
        };
    };

    async login (platformAuthToken = this.#data.platformAuthToken, authToken = this.#data.authToken, timeDifferenceFromUTC = 0) {
        if (this.authorized) return this.#error("Already authorized");

        const response = await fetch(`${this.#baseUrl}game-client/auth-token`, {
            method: "POST",
            headers: this.#headers,
            body: JSON.stringify({
                platform: "STEAM",
                platformAuthToken,
                platformTitleId: "677620",
                platformEnvironment: "Unknown",
                platformOs: "WINDOWS",
                authToken,
                timeDifferenceFromUTC 
            }),
        });

        if (response.status !== 200) return this.#error(`${response.status} ${response.statusText}`);

        const json = await response.json()
        .catch(() => {
            return this.#error("Failed to parse response");
        });

        this.#token = json.authToken;
        this.authorized = true;
        this.userId = json.userId;

        return this.authorized;
    };

    logout() {
        this.#token = "";
        this.authorized = false;
        this.userId = "";
        this.#data = {};
    }; 

    async getEnvironmentAds(lang = "en", region = "US") {
        const data = await this.#fetch(`misc/get-environment-ads?mapName=MainMenu&language=${lang}&region=${region}`);
        return data ?? {};
    };

    async getServerStatus() {
        const string = JSON.stringify({
            "userId": "",
            "platform": "STEAM",
            "platformId": "76561199003324402"
        });
        const encodedString = Buffer.from(string).toString('base64');
        const data = await this.#fetch(`server-status?encodedCompositePlatformId=${encodedString}`);
        return data ?? {};
    };

    async getStore() {
        const data = await this.#fetch("game-client/get-store");
        return data ?? {};
    };

    async getVivoxToken(type = "LOGIN") {
        const data = await this.#fetch("game-client/get-vivox-token", {
            method: "POST",
            body: JSON.stringify({
                "type": type,
                "team": -1,
                "isSpectator": false
            }),
        });
        return data ?? {};
    };

    async getFriends() {
        const data = await this.#fetch("game-client/get-friends");
        return data?.friends ?? {};
    };

    async getBlockedUsers() {
        const data = await this.#fetch("game-client/get-blocked-users");
        return data?.blockedUsers ?? {};
    };

    async claimDailyReward() {
        const data = await this.#fetch("game-client/claim-daily-check-in", {
            method: "POST",
            body: JSON.stringify({}),
        });
        return data ?? {};
    };

    async openDrop() {
        const data = await this.#fetch("game-client/drop-open", {
            method: "POST",
            body: JSON.stringify({}),
        });
        return data ?? {};
    };

    /**
     * 
     * @param {*} data {"chosenCustomizations":[{"customizationType":"Armor","customizationValue":"0-0"},{"customizationType":"Jetpack","customizationValue":"0-0"},{"customizationType":"PortalGun","customizationValue":"0-0"},{"customizationType":"AssaultRifle","customizationValue":"0-0"},{"customizationType":"BattleRifle","customizationValue":"0-8"},{"customizationType":"DMR","customizationValue":"0-0"},{"customizationType":"Pistol","customizationValue":"0-0"},{"customizationType":"PlasmaRifle","customizationValue":"0-0"},{"customizationType":"Railgun","customizationValue":"0-0"},{"customizationType":"RocketLauncher","customizationValue":"0-0"},{"customizationType":"Shotgun","customizationValue":"0-0"},{"customizationType":"SMG","customizationValue":"0-0"},{"customizationType":"Sniper","customizationValue":"0-65"},{"customizationType":"Portal","customizationValue":"0"},{"customizationType":"Spray","customizationValue":"0"},{"customizationType":"Emote","customizationValue":"0"},{"customizationType":"Oddball","customizationValue":"0-0"},{"customizationType":"Bat","customizationValue":"0-0"},{"customizationType":"NameTag","customizationValue":"0"},{"customizationType":"Banner","customizationValue":"0"}]}
     * @returns 
     */
    async updateChosenCustomizations(data) {
        const response = await this.#fetch("game-client/update-chosen-customizations", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response ?? {};
    };

    async getLeaderboard(type = "RANK", category = "RANKED_TEAM_TAKEDOWN", platform = "STEAM", difficulty = "None") {
        const data = await this.#fetch(`game-client/get-leaderboard?type=${type}&category=${category}&platform=${platform}&difficulty=${difficulty}`);
        return data ?? {};
    };

    async redeemDLCKey(key) {
        const data = await this.#fetch(`game-client/redeem-dlc-key`, {
            method: "POST",
            body: JSON.stringify({
                key,
            }),
        });
        return data ?? {};
    };

    async #fetch (url, opts) {
        if (!this.authorized) return this.#error("Not authorized");

        const response = await fetch(`${this.#baseUrl}${url}`, {
            headers: {
                "Authorization": `Bearer ${this.#token}`,
                ...this.#headers,
                ...opts?.headers,
            },
            ...opts,
        });

        if (response.status !== 200) {
            return this.#error(`${response.status} ${response.statusText}`);
        };

        const json = await response.json()
        .catch(() => {
            this.#error("Failed to parse response");
        });

        return json;

    };

    #error (message) {
        return Promise.reject(new Error(message));
    };

};
module.exports = Splitgate;