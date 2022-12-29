import { HeadersInit, RequestInit } from "node-fetch";
import BaseApi from "./core/Base";
import { authorizationOptions, constructorOptionsV2, drops, fetchOptionsV2, Iv2Api, legacyProgression, lobbyMessage, Profile, publicProfile, raceTimes, redeemDaily, referralData, referralSeasonData, seasonReward, servers, streamStatus, User } from "./typings/v2";

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

        const expiration = await this.#authorize({
            token: platformToken,
            type: 'platform'
        });
        this.#platformToken = platformToken;
        
        setInterval(async () => {
            this.authorized = false;
            await this.#authorize({
                token: this.#refreshToken,
                type: 'refresh',
            });
        }, expiration*100);
        
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
        const data = await this.#fetch({ path: `users/${userId}/customizations/chosen`, base: 'platform/public' });
        return data ?? {};
    };

    async getLobbyMessages(): Promise<lobbyMessage[]> {
        const data: lobbyMessage[] = await this.#fetch({ path: `lobby/v1/messages` });
        return data ?? [];
    };

    async getPlaylists() {
        const data = await this.#fetch({ path: `playlist/config`, base: 'splitgate/public' });
        return data ?? [];
    };

    async getBlocks() {
        const data = await this.#fetch({ path: `users/me/blocked`, base: 'lobby/v1/public/player' });
        return data ?? [];
    };

    async getProfile(): Promise<Profile> {
        const data: Profile = await this.#fetch({ path: `users/me/profiles`, base: 'basic/v1/public' });
        return data ?? {};
    };

    async getUserProfiles(userIds = [this.user.id]) {
        const data = await this.#fetch({
                path: `users/bulk/basic`,
                base: 'iam/v3/public',
                options: {
                    body: JSON.stringify({ userIds }),
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                }
            });
        return data ?? {};
    };

    async getUserProfilesSteam(platformUserIds = [this.user.id]) {
        const data = await this.#fetch({
                path: `platforms/steam/users`,
                base: 'iam/v3/public',
                options: {
                    body: JSON.stringify({ platformUserIds }),
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                }
            });
        return data ?? {};
    };

    async getReferralData(): Promise<referralData> {
        const data: referralData = await this.#fetch({ path: `users/${this.user.id}/referral/info`, base: 'social/public' });
        return data ?? {};
    };

    async getReferralSeasonData(seasonName = "Season2"): Promise<referralSeasonData> {
        const data: referralSeasonData = await this.#fetch({ path: `users/${this.user.id}/referral/data?seasonName=${seasonName}`, base: 'social/public' });
        return data ?? {};
    };

    async getSeasonPass(lang = "en") {
        const data = await this.#fetch({ path: `seasons/current?language=${lang}`, base: 'seasonpass/public' });
        return data ?? {};
    };

    async getSeasonReward(): Promise<seasonReward> {
        const data: seasonReward = await this.#fetch({ path: `users/${this.user.id}/seasonreward`, base: 'splitgate/public' });
        return data ?? {};
    };

    async getPublicProfiles(userIds = [this.user.id]): Promise<publicProfile[]> {
        const data: publicProfile[] = await this.#fetch({ path: `profiles/public?userIds=${userIds.join(",")}`, base: 'basic/v1/public' });
        return data ?? [];
    };

    async getStreamStatus(): Promise<streamStatus> {
        const data: streamStatus = await this.#fetch({ path: `streamStatus`, base: 'basic/public' });
        return data ?? {};
    };

    async getServers(): Promise<servers> {
        const data: servers = await this.#fetch({ path: `qosm/public/qos` });
        return data ?? {};  
    };

    async getFeedStatus() {
        const data = await this.#fetch({ path: `feedStatus`, base: 'basic/public' });
        return data ?? {};
    };

    async getChallenges() {
        const data = await this.#fetch({ base: 'splitgate/public', path: `challenges` });
        return data ?? {};
    };

    async getChallengesState() {
        const data = await this.#fetch({ base: 'splitgate/public', path: `challenges/state` });
        return data ?? {};
    };

    async getCurrentSeasonName() {
        const data = await this.#fetch({ base: 'splitgate/public', path: `seasons/current/name`, options: undefined, json: false });
        return data ?? {};
    };

    async getPlacementGamesNeeded() {
        const data = await this.#fetch({ base: 'splitgate/public', path: `stats/users/placementGamesNeeded` });
        return data ?? {};
    };

    async getViews() {
        const data = await this.#fetch({ base: 'platform/public', path: `views` });
        return data ?? {};
    };

    async getViewSections(viewId = "") {
        const data = await this.#fetch({ base: 'platform/public', path: `views/${viewId}/sections` });
        return data ?? {};
    };

    async getItems(itemIds=[""]) {
        const data = await this.#fetch({ base: 'platform/public', path: `items/locale/byIds?itemIds=${itemIds.join(",")}` });
        return data ?? {};
    };

    async getStats(userIds = [this.user.id]) {
        const data = await this.#fetch({ base: 'splitgate/public', path: `stats/users/account?userIds=${userIds.join(",")}` });
        return data ?? {};
    };

    async getRaceTimes(userId = this.user.id, platform = "STEAM"): Promise<raceTimes> {
        const data: raceTimes = await this.#fetch({ base: 'splitgate/public', path: `users/${userId}/race?platform=${platform.toUpperCase()}` });
        return data ?? {};
    };

    async getDailyPlayStreak(userId = this.user.id) {
        const data = await this.#fetch({ base: 'splitgate/public', path: `users/${userId}/dailyPlayStreak` });
        return data ?? {};
    };

    async getDailyCheckInStatus(userId = this.user.id) {
        const data = await this.#fetch({ base: 'splitgate/public', path: `users/${userId}/dailyCheckIn/status` });
        return data ?? {};
    };

    async SyncSteamDlc(steamId = "", userId = this.user.id, appId = "677620") {
        const data = await this.#fetch({
                base: 'platform/public', path: `users/${userId}/dlc/steam/sync`, options: {
                    body: JSON.stringify({ steamId, appId }),
                    method: "PUT"
                }
            });
        return data ?? {};
    };

    async SyncSteamIap(steamId = "", userId = this.user.id, appId = "677620") {
        const data = await this.#fetch({
                base: 'platform/public', path: `users/${userId}/iap/steam/sync`, options: {
                    body: JSON.stringify({ steamId, appId }),
                    method: "PUT"
                }
            });
        return data ?? {};
    };

    async getBadges(userIds = [this.user.id]) {
        const data = await this.#fetch({ base: 'splitgate/public', path: `badges/users?userIds=${userIds.join(",")}` });
        return data ?? {};
    };

    async getDrops(userId = this.user.id): Promise<drops> {
        const data: drops = await this.#fetch({ base: 'platform/public', path: `users/${userId}/drops` });
        return data ?? {};
    };

    async getCurrentSeasonUserData(userId = this.user.id) {
        const data = await this.#fetch({ base: 'seasonpass/public', path: `users/${userId}/seasons/current/data` });
        return data ?? {};
    };

    async getLegacyProgression(userId = this.user.id): Promise<legacyProgression> {
        const data: legacyProgression = await this.#fetch({ base: 'social/public', path: `users/${userId}/progression/legacy` });
        return data ?? {};
    };

    async getProgression(userId = this.user.id) {
        const data = await this.#fetch({ base: 'social/public', path: `users/${userId}/progression` });
        return data ?? {};
    };

    async getWallet() {
        const data = await this.#fetch({ base: 'platform/public', path: `users/${this.user.id}/wallets/SC` });
        return data ?? {};
    };

    async getParty(partyId = "") {
        const data = await this.#fetch({ base: 'lobby/v1/public/party', path: `parties/${partyId}` });
        return data ?? {};
    };

    async claimDailyReward(): Promise<redeemDaily> {
        const data: redeemDaily = await this.#fetch({
                base: 'splitgate/public', path: `users/${this.user.id}/dailyCheckIn/claim`, options: {
                    method: "POST"
                }
            });
        return data ?? {};
    };

    async redeemCode(code = "", region = "US", lang = "en") {
        const data = await this.#fetch({
                base: 'platform/public', path: `users/${this.user.id}/fulfillment/code`, options: {
                    body: JSON.stringify({ code, region, lang }),
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                }
            });
        return data ?? {};
    };

    async getMatch(matchId = "") {
        const data = await this.#fetch({ base: 'sessionmanager', path: `matchsession/${matchId}` });
        return data ?? {};
    };

    async rejectMatch(matchId = "", ticket = "") {
        const data = await this.#fetch({
                base: 'sessionmanager', path: `gamesession/${matchId}/ticket/${ticket}/reject-match`, options: {
                    method: "DELETE"
                }
            });
        return data ?? {};
    };

    async getUserSessions(userId = this.user.id) {
        const data = await this.#fetch({ base: 'sessionmanager', path: `users/${userId}/sessions` });
        return data ?? {};
    };

    async claimChallengeReward(challengeId = "", challengeType = "") {
        const data = await this.#fetch({
                base: 'splitgate/public', path: `users/${this.user.id}/challenges/claim-reward`, options: {
                    body: JSON.stringify({ challengeType, challengeId }),
                    method: "POST"
                }
            });
        return data ?? {};
    };

    async getRecentPlayers(userId = this.user.id, limit: number = 50, offset: number = 0) {
        const data = await this.#fetch({ base: 'sessionmanager', path: `recentplayer/${userId}?limit=${limit}&offset=${offset}` });
        return data ?? {};
    };

    async getUsersPresence(userIds = [this.user.id], countOnly: boolean = false) {
        const data = await this.#fetch({ base: 'lobby/v1/public/presence', path: `users/presence?userIds=${userIds.join(",")}&countOnly=${countOnly}` });
        return data ?? {};
    };

    async openDrop() {
        const data = await this.#fetch({
                base: 'platform/public', path: `users/${this.user.id}/drops/open`, options: {
                    method: "POST"
                }
            });
        return data ?? {};
    };

    async getTransactions(userId = this.user.id, currency = 'SC') {
        return await this.#fetch({
            base: 'platform/public',
            path: `users/${userId}/wallets/${currency}/transactions`
        });
    };

    async getOrders(userId = this.user.id) {
        return await this.#fetch({
            base: 'platform/public',
            path: `users/${userId}/orders`
        });
    };

    async getSavedMaps() {
        return await this.#fetch({
            base: 'ugc/v1/public',
            path: 'maps/metadata/all'
        });
    };

    async getMap(shareCode: string) {
        return await this.#fetch({
            base: 'ugc/v1/public',
            path: `maps/sharecodes/${shareCode}`
        });
    };

    async isValidCreator(creatorCode: string) {
        const response = await this.fetch(`https://api.nexus.gg/v1/attributions/creators/${creatorCode}`, {
            headers: {
                'X-SHARED-SECRET': '4cc97343522a404ba86f1add1681a4e3'
            }
        });
        if (!response.ok) return false;

        const data = await response.text();
        if (data.toLowerCase() === 'not found') return false;

        return JSON.parse(data);
    };
    
    async #fetch({ path, base, options = {}, json = true }: fetchOptionsV2): Promise<any> {
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
        const url = base ? `${base}/namespaces/splitgate/${path}` : path;

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

    async #authorize({token, type}: authorizationOptions): Promise<number> {
        if (!token) return this.error("No token provided");
        if (type == "refresh" && !this.#platformToken) return this.error("User has not previously logged in");
        
        this.log(`Using ${type} token...`);

        let body = `${type}_token=${token}`;
        if (type == "refresh") body += `&grant_type=${type}_token`;

        const response = await this.fetch(`${this.baseUrl}iam/v3/oauth${type == "platform" ? '/platforms/steam': ''}/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic MzZkOGEzN2JmZTlhNDEyYWJiMGIzMTc0OTM0NTg5YjU6`,
                ...this.headers,
            },
            body,
        });
        if (response.status !== 200) return this.error(`Server status different from 200 (${response.status} - ${response.statusText})`);
        
        const json = await response.json()
        .catch(() => {
            return this.error("Failed to parse JSON");
        });
        
        if (json.error) return this.error(json.error_description);
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
        this.#token = json.access_token;
        this.#refreshToken = json.refresh_token;

        this.log(type === "refresh" ? `Token refreshed` : 'Logged in');
        return json.expires_in || 3600;
    };
};

export default v2;