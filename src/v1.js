const BaseApi = require('./Base');

class v1 extends BaseApi {
    #token = "";
    #data = {};
    constructor(data = {
        platformAuthToken: "",
        authToken: "",
        timeDifferenceFromUTC: 0,
        debug: false
    }) {
        super({...data, version: 1});
        this.#token = "";
        this.authorized = false;

        this.userId = "";
        this.#data = data;
    };

    async login (platformAuthToken = this.#data.platformAuthToken, authToken = this.#data.authToken, timeDifferenceFromUTC = this.#data.timeDifferenceFromUTC) {
        if (this.authorized) return this.error("Already authorized");

        const response = await this.fetch(`${this.baseUrl}game-client/auth-token`, {
            method: "POST",
            headers: this.headers,
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

        if (response.status !== 200) return this.error(`Server status different from 200 (${response.status} - ${response.statusText})`);
        
        const json = await response.json()
        .catch(() => {
            return this.error("Failed to parse JSON");
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
        this.#data = {
            debug: this.#data.debug,
        };
        return this.authorized;
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
        if (!data) return this.error("No data provided");
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
        if (!key) return this.error("No key provided");
        const data = await this.#fetch(`game-client/redeem-dlc-key`, {
            method: "POST",
            body: JSON.stringify({
                key,
            }),
        });
        return data ?? {};
    };

    async acceptInvite(userId, platform = {
        name: "STEAM",
        id: "76561199003324402"
    }) {
        if (!userId || !platform.name || !platform.id) return this.error("No data provided");

        const string = JSON.stringify({
            "userId": userId,
            "platform": platform.name,
            "platformId": platform.id
        });
        const encodedString = Buffer.from(string).toString('base64');
        const data = await this.#fetch("game-client/accept-invite", {
            method: "POST",
            body: JSON.stringify({
                id: userId,
                type: "Party",
                encodedCompositePlatformId: encodedString
            }),
        });
        return data ?? {};
    };

    async claimDailyStreak() {
        const data = await this.#fetch("game-client/claim-daily-streak", {
            method: "POST",
            body: JSON.stringify({}),
        });
        return data ?? {};
    };

    async inviteUser(userId, platform = {
        name: "STEAM",
        id: "76561199003324402"
    }) {
        if (!userId || !platform.name || !platform.id) return this.error("No data provided");

        const string = JSON.stringify({
            "userId": userId,
            "platform": platform.name,
            "platformId": platform.id
        });
        const encodedString = Buffer.from(string).toString('base64');
        const data = await this.#fetch("game-client/invite-user", {
            method: "POST",
            body: JSON.stringify({
                id: userId,
                type: "Party",
                encodedCompositePlatformId: encodedString
            }),
        });
        return data ?? {};
    };

    async redeemItem(item, value) {
        if (!item || !value) return this.error("No data provided");

        const data = await this.#fetch("game-client/redeem-item", {
            method: "POST",
            body: JSON.stringify({
                id: `Customization-${item}-${value}` 
            }),
        });
        return data ?? {};
    };

    async reportUser(encodedData = {
        encodedCompositeUserId: "",
        encodedPlatformUserId: "",
    }, category = "", description = "", gameSessionId = "") {
        if (!encodedData.encodedCompositeUserId || !encodedData.encodedPlatformUserId || !category || !description || !gameSessionId) return this.error("No data provided");

        const string = JSON.stringify({
            "encodedCompositeUserId": encodedData.encodedCompositeUserId,
            "encodedPlatformUserId": encodedData.encodedPlatformUserId,
            "category": category,
            "description": description,
            "gameSessionId": gameSessionId
        });
        const encodedString = Buffer.from(string).toString('base64');
        const data = await this.#fetch("game-client/user-events", {
            method: "POST",
            body: JSON.stringify({
                encodedCompositeUserId: encodedString
            }),
        });
        return data ?? {};
    };

    async setFinishRaceCourse(map, timeInMs) {
        if (!map || !timeInMs) return this.error("No data provided");

        const data = await this.#fetch("game-client/finish-race-course", {
            method: "POST",
            body: JSON.stringify({map, "timeMs": timeInMs, updatedAt: new Date().toISOString()})
        });
        return data ?? {};
    };

    async redeemDailyCheckIn() {
        const data = await this.#fetch("game-client/redeem-daily-check-in", {
            method: "POST",
            body: JSON.stringify({}),
        });
        return data ?? {};
    };

    async getRecentlyEncounteredUsers() {
        const data = await this.#fetch("game-client/get-recently-encountered-users");
        return data?.recentlyEncounteredUsers ?? [];
    };

    async friendRequest(userId, encodedCompositePlatformId = "") {
        if (!userId) return this.error("No data provided");

        const data = await this.#fetch("game-client/friend-request", {
            method: "POST",
            body: JSON.stringify({
                friendId: userId,
                encodedCompositePlatformId
            }),
        });
        return data ?? {};
    };

    async #fetch (url, opts) {
        if (!this.authorized) return this.error("Not authorized");

        const response = await this.fetch(`${this.baseUrl}${url}`, {
            headers: {
                "Authorization": `Bearer ${this.#token}`,
                'Content-Type': 'application/json',
                ...this.headers,
                ...opts?.headers,
            },
            ...opts,
        });

        if (response.status !== 200) {
            return this.error(`${response.status} ${response.statusText}`);
        };

        const json = await response.json()
        .catch(() => {
            this.error("Failed to parse JSON");
        });

        return json;

    };
};

module.exports = v1;