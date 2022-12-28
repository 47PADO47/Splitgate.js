import { HeadersInit, RequestInit } from "node-fetch";
import BaseApi from "./core/Base";
import { constructorOptionsV2, drops, Iv2Api, legacyProgression, lobbyMessage, Profile, publicProfile, raceTimes, redeemDaily, referralData, referralSeasonData, seasonReward, servers, streamStatus, User } from "./typings/v2";

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

    async login(platformToken = this.#platformToken): Promise<User> {
        if (this.authorized) return this.error("Already authorized");
        if (!platformToken) return this.error("No platform token provided");

        this.log('Logging in...');
        const response = await this.fetch(`${this.baseUrl}iam/v3/oauth/platforms/steam/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic MzZkOGEzN2JmZTlhNDEyYWJiMGIzMTc0OTM0NTg5YjU6`,
                ...this.headers,
            },
            body: `platform_token=${platformToken}`,
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
        
        this.log('Logged in');
        setInterval(() => {
            this.authorized = false;
            this.#refresh(this.#refreshToken);
        }, json.expires_in*1000);
        
        return this.user;
    };

    async logout() {
        this.log('Logging out...');
        
        this.#token = "";
        this.authorized = false;
        this.user = {};
        this.#platformToken = "";
        
        this.log('Logged out');
        return this.authorized;
    };

    async getCosmetics(userId = this.user.id) {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${userId}/customizations/chosen`);
        return data ?? {};
    };

    async getLobbyMessages(): Promise<lobbyMessage[]> {
        const data: lobbyMessage[] = await this.#fetch(`lobby/v1/messages`);
        return data ?? [];
    };

    async getPlaylists() {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/playlist/config`);
        return data ?? [];
    };

    async getBlocks() {
        const data = await this.#fetch(`lobby/v1/public/player/namespaces/splitgate/users/me/blocked`);
        return data ?? [];
    };

    async getProfile(): Promise<Profile> {
        const data: Profile = await this.#fetch(`basic/v1/public/namespaces/splitgate/users/me/profiles`);
        return data ?? {};
    };

    async getUserProfiles(userIds = [this.user.id]) {
        const data = await this.#fetch(`iam/v3/public/namespaces/splitgate/users/bulk/basic`, {
            body: JSON.stringify({userIds}),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        return data ?? {};
    };

    async getUserProfilesSteam(platformUserIds = [this.user.id]) {
        const data = await this.#fetch(`iam/v3/public/namespaces/splitgate/platforms/steam/users`, {
            body: JSON.stringify({platformUserIds}),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });
        return data ?? {};
    };

    async getReferralData(): Promise<referralData> {
        const data: referralData = await this.#fetch(`social/public/namespaces/splitgate/users/${this.user.id}/referral/info`);
        return data ?? {};
    };

    async getReferralSeasonData(seasonName = "Season2"): Promise<referralSeasonData> {
        const data: referralSeasonData = await this.#fetch(`social/public/namespaces/splitgate/users/${this.user.id}/referral/data?seasonName=${seasonName}`);
        return data ?? {};
    };

    async getSeasonPass(lang = "en") {
        const data = await this.#fetch(`seasonpass/public/namespaces/splitgate/seasons/current?language=${lang}`);
        return data ?? {};
    };

    async getSeasonReward(): Promise<seasonReward> {
        const data: seasonReward = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${this.user.id}/seasonreward`);
        return data ?? {};
    };

    async getPublicProfiles(userIds = [this.user.id]): Promise<publicProfile[]> {
        const data: publicProfile[] = await this.#fetch(`basic/v1/public/namespaces/splitgate/profiles/public?userIds=${userIds.join(",")}`);
        return data ?? [];
    };

    async getStreamStatus(): Promise<streamStatus> {
        const data: streamStatus = await this.#fetch(`basic/public/namespaces/splitgate/streamStatus`);
        return data ?? {};
    };

    async getServers(): Promise<servers> {
        const data: servers = await this.#fetch(`qosm/public/qos`);
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
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/seasons/current/name`, undefined, false);
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
        const data = await this.#fetch(`platform/public/namespaces/splitgate/items/locale/byIds?itemIds=${itemIds.join(",")}`);
        return data ?? {};
    };

    async getStats(userIds = [this.user.id]) {
        const data = await this.#fetch(`splitgate/public/namespaces/splitgate/stats/users/account?userIds=${userIds.join(",")}`);
        return data ?? {};
    };

    async getRaceTimes(userId = this.user.id, platform = "STEAM"): Promise<raceTimes> {
        const data: raceTimes = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${userId}/race?platform=${platform.toUpperCase()}`);
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

    async getDrops(userId = this.user.id): Promise<drops> {
        const data: drops = await this.#fetch(`platform/public/namespaces/splitgate/users/${userId}/drops`);
        return data ?? {};
    };

    async getCurrentSeasonUserData(userId = this.user.id) {
        const data = await this.#fetch(`seasonpass/public/namespaces/splitgate/users/${userId}/seasons/current/data`);
        return data ?? {};
    };

    async getLegacyProgression(userId = this.user.id): Promise<legacyProgression> {
        const data: legacyProgression = await this.#fetch(`social/public/namespaces/splitgate/users/${userId}/progression/legacy`);
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

    async claimDailyReward(): Promise<redeemDaily> {
        const data: redeemDaily = await this.#fetch(`splitgate/public/namespaces/splitgate/users/${this.user.id}/dailyCheckIn/claim`,
        {
            method: "POST"
        });
        return data ?? {};
    };

    async redeemCode(code = "", region = "US", lang = "en") {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${this.user.id}/fulfillment/code`, {
            body: JSON.stringify({code, region, lang}),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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

    async getRecentPlayers(userId = this.user.id, limit: number = 50, offset: number = 0) {
        const data = await this.#fetch(`sessionmanager/namespaces/splitgate/recentplayer/${userId}?limit=${limit}&offset=${offset}`);
        return data ?? {};
    };

    async getUsersPresence(userIds = [this.user.id], countOnly: boolean = false) {
        const data = await this.#fetch(`lobby/v1/public/presence/namespaces/splitgate/users/presence?userIds=${userIds.join(",")}&countOnly=${countOnly}`);
        return data ?? {};
    };

    async openDrop() {
        const data = await this.#fetch(`platform/public/namespaces/splitgate/users/${this.user.id}/drops/open`, {
            method: "POST"
        });
        return data ?? {};
    };

    async #fetch(url: string, options: RequestInit = {}, json: boolean = true): Promise<any> {
        if (!this.authorized) return this.error("Not authorized");
        
        const headers: HeadersInit = {
            'Authorization': `Bearer ${this.#token}`,
            ...this.headers,
            ...options?.headers ?? {}
        }
        const opts: RequestInit = {
            method: options?.method ?? "GET",
            headers: headers,
        };
        if (opts.method !== 'GET' && options?.body)
        opts.body = options.body;

        const response = await this.fetch(`${this.baseUrl}${url}`, opts);
        this.log(`#fetch: ${opts.method} ${url}`);

        if (!response.ok && response.status !== 400) return this.error(`Server status different from 200 (${response.status} - ${response.statusText})`);

        const data = json ? await response.json().catch(() => {
            return this.error("Failed to parse JSON");
        }) : await response.text().catch(() => {
            return this.error("Failed to parse Text");
        });

        if (!json) return data;
        if (data.errorCode) return this.error(data.errorMessage);
        
        this.log(`#fetch: returned`);
        return data;
    };

    async #refresh(refreshToken = this.#refreshToken) {
        if (!this.#platformToken) return this.error("User has not previously logged in");
        if (!refreshToken) return this.error("No refresh token provided");
        
        this.log(`Refreshing token...`);
        const response = await this.fetch(`${this.baseUrl}iam/v3/oauth/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic MzZkOGEzN2JmZTlhNDEyYWJiMGIzMTc0OTM0NTg5YjU6`,
                ...this.headers,
            },
            body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        });
        if (response.status !== 200) return this.error(`Server status different from 200 (${response.status} - ${response.statusText})`);
        
        const json = await response.json()
        .catch(() => {
            return this.error("Failed to parse JSON");
        });
        
        if (json.error) return this.error(json.error_description);
        this.#token = json.access_token;
        this.#refreshToken = json.refresh_token;
        this.authorized = true;

        this.log(`Token refreshed`);
        return this.#token;
    };
};

export default v2;