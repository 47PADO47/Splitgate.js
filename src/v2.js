const BaseApi = require('./Base');

class v2 extends BaseApi {
    #platformToken = "";
    #token = "";
    constructor(data = {
        platformToken: "",
        debug: false,
    }) {
        super({...data, version: 2});
        this.#platformToken = data.platformToken;

        this.#token = "";
        this.authorized = false;

        this.user = {
            name: undefined,
            platform: {
                id: undefined,
                userId: undefined,
            },
            id: undefined,
            xuid: undefined,
            bans: [],
        };
    };

    async login(platformToken = this.#platformToken) {
        if (this.authorized) return this.error("Already authorized");
        if (!platformToken) return this.error("No platform token provided");

        const response = await this.fetch(`${this.baseUrl}iam/v3/oauth/platforms/steam/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic MzZkOGEzN2JmZTlhNDEyYWJiMGIzMTc0OTM0NTg5YjU6`,
                ...this.headers,
            },
            body: `platform_token=${platformToken}`,
        });
        if (response.status !== 200) return this.error(`Server returned a different status (${response.status} - ${response.statusText})`);
        
        const json = await response.json()
        .catch(() => {
            return this.error("Failed to parse JSON");
        });
        
        if (json.error) return this.error(json.error_description);

        this.#token = json.access_token;
        this.user = {
            name: json.display_name,
            platform: {
                id: json.platform_id,
                userId: json.platform_user_id,
            },
            id: json.user_id,
            xuid: json.xuid,
            bans: json.bans,
        };
        this.authorized = true;

        setTimeout(() => {
            this.authorized = false;
            this.#token = "";

            this.log("Logged out (Token expired)");
        }, json.expires_in*1000);
        return this.user;
    };

    async logout() {
        this.#token = "";
        this.authorized = false;
        this.user = {};
        this.#platformToken = "";
        return this.authorized;
    };

    async getAccountCosmetics() {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${this.user.id}/customizations/chosen`);
        return data ?? {};
    };

    async getLobbyMessages() {
        const data = await this.#fetch(`lobby/v1/messages`);
        return data ?? {};
    };

    async getPlaylists() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/playlist/config`);
        return data ?? [];
    };

    async claimDailyReward() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${this.user.id}/dailyCheckIn/status`);
        return data ?? {};
    };

    async getBlocks() {
        const data = await this.#fetch(`lobby/v1/public/player/namespaces/splitgate/users/me/blocked`);
        return data?.data ?? [];
    };

    async getProfile() {
        const data = await this.#fetch(`basic/v1/public/namespaces/splitgate/users/me/profiles`);
        return data ?? {};
    };

    async getUserProfiles(userIds = [""]) {
        const data = await this.#fetch(`iam/v3/public/namespaces/splitgate/users/bulk/basic`, {
            body: JSON.stringify({userIds})
        });
        return data?.data ?? {};
    };

    async getReferralData() {
        const data = await this.#fetch(`social/public/namespaces/splitgate/users/${this.user.id}/referral/info`);
        return data ?? {};
    };

    async getReferralSeasonData(seasonName = "Season1") {
        const data = await this.#fetch(`social/public/namespaces/splitgate/users/${this.user.id}/referral/data?seasonName=${seasonName}`);
        return data ?? {};
    };

    async getSeasonPass(lang = "en") {
        const data = await this.#fetch(`seasonpass/public/namespaces/splitgate/seasons/current?language=${lang}`);
        return data ?? {};
    };

    async #fetch(url, options = {}) {
        if (!this.authorized) return this.error("Not authorized");
        
        const response = await this.fetch(`${this.baseUrl}${url}`, {
            headers: {
                "Authorization": `Bearer ${this.#token}`,
                ...this.headers,
                ...options?.headers,
            }
        });

        if (response.status !== 200) return this.error(`Server returned a different status (${response.status} - ${response.statusText})`);

        const json = await response.json()
        .catch(() => {
            return this.error("Failed to parse JSON");
        });
        
        if (json.error) return this.error(json.error_description);

        return json;
    };
};

module.exports = v2