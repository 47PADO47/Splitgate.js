import { BaseFetchOptions } from "./Base";

interface Iv2Api {
    authorized: boolean;
    user: User;
    version: number;
};

type constructorOptionsV2 = {
    platformToken: string;
    debug: boolean;
};

type fetchOptionsV2 = BaseFetchOptions & {
    base?: string;
    path: string;
};

type authorizationOptions = {
    token: string;
    type: 'refresh' | 'platform';
};

type User = {
    name?: string | undefined;
    platform?: {
        id?: string | undefined;
        userId?: string | undefined;
    };
    id?: string | undefined; 
    xuid?: string | undefined;
    bans?: unknown[];
};

interface redeemDaily {
    dayOfWeek?: number;
    daysClaimedCount?: number;
    daysMissedCount?: number;
    weekExpiresAtMs?: number;
};

type lobbyMessage = {
    Code?: string;
    CodeName?: string;
    Text?: string;
    Attributes?: string[] | [];
    Section?: string;
    Service?: string;
};

interface Profile {
    userId?: string;
    namespace?: string;
    firstName?: string;
    lastName?: string;
    avatarSmallUrl?: string;
    avatarUrl?: string;
    avatarLargeUrl?: string
    status?: string;
    language?: string;
    customAttributes?: {};
    publicId?: string;
    referralId?: string;
    userRoles?: [];
    privateCustomAttributes?: {}
};

interface referralData {
    namespace?: string;
    userId?: string;
    seasonName?: string;
    referrerId?: string;
    canBeReferred?: boolean;
    passLevel?: number;
};

interface referralSeasonData {
    namespace?: string;
    seasonName?: string;
    hasData?: boolean;
    refereeProgressionLevelThreshold?: number;
    maxProgressionLevel?: number;
    maxReferralPassLevel?: number;
    data?: referralSeasonDataRewardData[]
};

type referralSeasonDataRewardData = {
    id?: number;
    rewards?: referralSeasonDataReward[];
};

type referralSeasonDataReward = {
    type?: string;
    item?: referralSeasonDataRewardItem;
    quantity?: number
};

type referralSeasonDataRewardItem = {
    itemType?: string;
    itemSku?: string
};

interface seasonReward {
    level?: number;
    winCount?: number;
};

type publicProfile = {
    userId?: string;
    namespace?: string;
    avatarSmallUrl?: string;
    avatarUrl?: string;
    avatarLargeUrl?: string;
    publicId?: string;
}

interface streamStatus {
    imageUrl?: string;
    actionTitle?: {
      en?: 'Watch Now On Twitch';
      de?: 'Jetzt auf Twitch zuschauen';
      es?: 'Ver ahora en Twitch';
      'es-419'?: 'Ver ahora en Twitch';
      fr?: 'Regarder maintenant sur Twitch';
      it?: 'Guarda ora su Twitch';
      ja?: '今すぐTwitchで視聴する';
      ko?: '지금 Twitch에서 시청하세요';
      pl?: 'Oglądaj teraz na Twitchu';
      pt?: 'Ver Agora No Twitch';
      'pt-BR'?: 'Assista agora no Twitch';
      ro?: 'Urmărește acum pe Twitch';
      ru?: 'Смотри в Twitch';
      tr?: 'Şimdi Twitch Üzerinden İzle';
      'zh-Hant'?: '在 Twitch 上立即觀看'
    };
    actionValue?: 'https?://www.twitch.tv/splitgate';
    isLive?: boolean
};

interface servers {
    servers?: server[];
}

type server = {
    alias?: string;
    region?: string;
    ip?: string;
    port?: number;
    last_update?: string;
    status?: string
};

interface raceTimes {
    userId?: string;
    platform?: string;
    bestTimes?: races
};

type races = {
    [key: string]: {
        Easy?: number;
        Medium?: number;
        Hard?: number;
    }
};

interface legacyProgression {
    deprecatedLevel?: number;
    proTier?: number;
    proLevel?: number
};

interface drops {
    namespace?: string;
    userId?: string;
    count?: number
};

export {
    Iv2Api,
    constructorOptionsV2,
    fetchOptionsV2,
    authorizationOptions,
    User,

    redeemDaily,
    lobbyMessage,
    Profile,
    referralData,
    referralSeasonData,
    seasonReward,
    publicProfile,
    streamStatus,
    servers,
    raceTimes,
    legacyProgression,
    drops
}