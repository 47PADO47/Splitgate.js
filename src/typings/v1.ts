interface Iv1Api {
    authorized: boolean;
    userId: string;
};

type v1ApiConstructor = {
    platformAuthToken: string;
    authToken: string;
    timeDifferenceFromUTC: number;
    debug: boolean;
};

type v1Data = {
    platformAuthToken?: string;
    authToken?: string;
    timeDifferenceFromUTC?: number;
    debug?: boolean;
};

type customizationDataV1 = {"chosenCustomizations":[{"customizationType":"Armor","customizationValue":string},{"customizationType":"Jetpack","customizationValue":string},{"customizationType":"PortalGun","customizationValue":string},{"customizationType":"AssaultRifle","customizationValue":string},{"customizationType":"BattleRifle","customizationValue":string},{"customizationType":"DMR","customizationValue":string},{"customizationType":"Pistol","customizationValue":string},{"customizationType":"PlasmaRifle","customizationValue":string},{"customizationType":"Railgun","customizationValue":string},{"customizationType":"RocketLauncher","customizationValue":string},{"customizationType":"Shotgun","customizationValue":string},{"customizationType":"SMG","customizationValue":string},{"customizationType":"Sniper","customizationValue":string},{"customizationType":"Portal","customizationValue":number | string},{"customizationType":"Spray","customizationValue":number | string},{"customizationType":"Emote","customizationValue":number | string},{"customizationType":"Oddball","customizationValue":string},{"customizationType":"Bat","customizationValue":string},{"customizationType":"NameTag","customizationValue":number | string},{"customizationType":"Banner","customizationValue":number | string}]}

export {
    Iv1Api,
    v1ApiConstructor,
    v1Data,
    customizationDataV1,
};