interface Iv2Api {
    authorized: boolean;
    user: User;
    version: number;
};

type constructorOptionsV2 = {
    platformToken: string;
    debug: boolean;
};

type User = {
    name?: string | undefined,
    platform?: {
        id?: string | undefined,
        userId?: string | undefined,
    },
    id?: string | undefined, 
    xuid?: string | undefined,
    bans?: unknown[],
};

export {
    Iv2Api,
    constructorOptionsV2,
    User,
}