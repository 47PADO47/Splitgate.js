import { RequestInit } from "node-fetch";
import BaseApi from "./Base";
import { constructorOptionsV2, Iv2Api, User } from "./typings/v2";

class v2 extends BaseApi implements Iv2Api {
    #platformToken = "";
    #token = "";
    #refreshToken = "";
    authorized: boolean;
    user: User;
    constructor(data: constructorOptionsV2 = {
        platformToken: "",
        debug: false,
    }) {
        super({...data, version: 2});
        this.#platformToken = data.platformToken;

        this.#token = "";
        this.#refreshToken = "";
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
            body: this.#refreshToken ? `grant_type=refresh_token&refresh_token=${this.#refreshToken}` : `platform_token=${platformToken}`,
        });
        if (response.status !== 200) return this.error(`Server status different from 200 (${response.status} - ${response.statusText})`);
        
        const json = await response.json()
        .catch(() => {
            return this.error("Failed to parse JSON");
        });
        
        if (json.error) return this.error(json.error_description);

        this.#platformToken = platformToken;
        this.#token = json.access_token;
        this.#refreshToken = json.refresh_token;
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
            this.login(this.#platformToken);
        }, json.expires_in*60*1000);
        return this.user;
    };

    async logout() {
        this.#token = "";
        this.authorized = false;
        this.user = {};
        this.#platformToken = "";
        return this.authorized;
    };

    async getCosmetics(userId = this.user.id) {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${userId}/customizations/chosen`);
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

    async getBlocks() {
        const data = await this.#fetch(`lobby/v1/public/player/namespaces/splitgate/users/me/blocked`);
        return data ?? [];
    };

    async getProfile() {
        const data = await this.#fetch(`basic/v1/public/namespaces/splitgate/users/me/profiles`);
        return data ?? {};
    };

    async getUserProfiles(userIds = [this.user.id]) {
        const data = await this.#fetch(`iam/v3/public/namespaces/splitgate/users/bulk/basic`, {
            body: JSON.stringify({userIds}),
            method: "POST",
        });
        return data ?? {};
    };

    async getUserProfilesSteam(platformUserIds = [this.user.id]) {
        const data = await this.#fetch(`iam/v3/public/namespaces/splitgate/platforms/steam/users`, {
            body: JSON.stringify({platformUserIds}),
            method: "POST",
        });
        return data ?? {};
    };

    async getReferralData() {
        const data = await this.#fetch(`social/public/namespaces/splitgate/users/${this.user.id}/referral/info`);
        return data ?? {};
    };

    async getReferralSeasonData(seasonName = "Season2") {
        const data = await this.#fetch(`social/public/namespaces/splitgate/users/${this.user.id}/referral/data?seasonName=${seasonName}`);
        return data ?? {};
    };

    async getSeasonPass(lang = "en") {
        const data = await this.#fetch(`seasonpass/public/namespaces/splitgate/seasons/current?language=${lang}`);
        return data ?? {};
    };

    async getSeasonReward() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${this.user.id}/seasonreward`);
        return data ?? {};
    };

    async getPublicProfiles(userIds = [this.user.id]) {
        const data = await this.#fetch(`basic/v1/public/namespaces/splitgate/profiles/public?userIds=${userIds.join(",")}`);
        return data ?? {};
    };

    async getStreamStatus() {
        const data = await this.#fetch(`basic/public/namespaces/splitgate/streamStatus`);
        return data ?? {};
    };

    async getServers() {
        const data = await this.#fetch(`qosm/public/qos`);
        return data ?? {};  
    };

    async getFeedStatus() {
        const data = await this.#fetch(`basic/public/namespaces/splitgate/feedStatus`);
        return data ?? {};
    };

    async getChallenges() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/challenges`);
        return data ?? {};
    };

    async getChallengesState() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/challenges/state`);
        return data ?? {};
    };

    async getCurrentSeasonName() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/seasons/current/name`);
        return data ?? {};
    };

    async getPlacementGamesNeeded() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/stats/users/placementGamesNeeded`);
        return data ?? {};
    };

    async getViews() {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/views`);
        return data ?? {};
    };

    async getViewSections(viewId = "") {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/views/${viewId}/sections`);
        return data ?? {};
    };

    async getItems(itemIds=[""]) {
        const data = await this.#fetch(`/platform/public/namespaces/splitgate/items/locale/byIds?itemIds=${itemIds.join(",")}`);
        return data ?? {};
    };

    async getStats(userIds = [this.user.id]) {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/stats/users/account?userIds=${userIds.join(",")}`);
        return data ?? {};
    };

    async getRaceTimes(userId = this.user.id, platform = "STEAM") {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${userId}/race?platform=${platform.toUpperCase()}`);
        return data ?? {};
    };

    async getDailyPlayStreak(userId = this.user.id) {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${userId}/dailyPlayStreak`);
        return data ?? {};
    };

    async getDailyCheckInStatus(userId = this.user.id) {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${userId}/dailyCheckIn/status`);
        return data ?? {};
    };

    async SyncSteamDlc(steamId = "", userId = this.user.id, appId = "677620") {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${userId}/dlc/steam/sync`, {
            body: JSON.stringify({steamId, appId}),
            method: "PUT"
        });
        return data ?? {};
    };

    async SyncSteamIap(steamId = "", userId = this.user.id, appId = "677620") {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${userId}/iap/steam/sync`, {
            body: JSON.stringify({steamId, appId}),
            method: "PUT"
        });
        return data ?? {};
    };

    async getBadges(userIds = [this.user.id]) {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/badges/users?userIds=${userIds.join(",")}`);
        return data ?? {};
    };

    async getDrops(userId = this.user.id) {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${userId}/drops`);
        return data ?? {};
    };

    async getCurrentSeasonUserData(userId = this.user.id) {
        const data = await this.#fetch(`/seasonpass/public/namespaces/splitgate/users/${userId}/seasons/current/data`);
        return data ?? {};
    };

    async getLegacyProgression(userId = this.user.id) {
        const data = await this.#fetch(`social/public/namespaces/splitgate/users/${userId}/progression/legacy`);
        return data ?? {};
    };

    async getProgression(userId = this.user.id) {
        const data = await this.#fetch(`social/public/namespaces/splitgate/users/${userId}/progression`);
        return data ?? {};
    };

    async getWallet() {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${this.user.id}/wallets/SC`);
        return data ?? {};
    };

    async getParty(partyId = "") {
        const data = await this.#fetch(`lobby/v1/public/party/namespaces/splitgate/parties/${partyId}`);
        return data ?? {};
    };

    async claimDailyReward() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${this.user.id}/dailyCheckIn/claim`,
        {
            method: "POST"
        });
        return data ?? {};
    };

    async redeemCode(code = "", region = "US", lang = "en") {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${this.user.id}/fulfillment/code`, {
            body: JSON.stringify({code, region, lang}),
            method: "POST"
        });
        return data ?? {};
    };

    async getMatch(matchId = "") {
        const data = await this.#fetch(`sessionmanager/namespaces/splitgate/matchsession/${matchId}`);
        return data ?? {};
    };

    async rejectMatch(matchId = "", ticket = "") {
        const data = await this.#fetch(`sessionmanager/namespaces/splitgate/gamesession/${matchId}/ticket/${ticket}/reject-match`, {
            method: "DELETE"
        });
        return data ?? {};
    };

    async getUserSessions(userId = this.user.id) {
        const data = await this.#fetch(`sessionmanager/namespaces/splitgate/users/${userId}/sessions`);
        return data ?? {};
    };

    async claimChallengeReward(challengeId = "", challengeType = "") {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${this.user.id}/challenges/claim-reward`, {
            body: JSON.stringify({challengeType, challengeId}),
            method: "POST"
        });
        return data ?? {};
    };

    async #fetch(url: string, options: RequestInit = {}) {
        if (!this.authorized) return this.error("Not authorized");
        
        const response = await this.fetch(`${this.baseUrl}${url}`, {
            headers: {
                "Authorization": `Bearer ${this.#token}`,
                ...this.headers,
                ...options?.headers,
            },
            ...options
        });

        if (response.status !== 200) return this.error(`Server status different from 200 (${response.status} - ${response.statusText})`);

        const json = await response.json()
        .catch(() => {
            return this.error("Failed to parse JSON");
        });
        
        if (json.error) return this.error(json.error_description);

        return json;
    };
};

export default v2