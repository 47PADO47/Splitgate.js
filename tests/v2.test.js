const { v2 } = require('../dist/index.js');
let splitgate;

beforeEach(() =>{
    splitgate = new v2();
});

describe('[v2] Splitgate class creation', () => {
    it('successfully initializes without configuration', () => {
        expect(splitgate).toBeInstanceOf(v2);
    
        expect(splitgate.debug).toBeDefined();
        expect(splitgate.debug).toBe(false);

        expect(splitgate.version).toBeDefined();
        expect(splitgate.version).toBe(2);
    
        expect(splitgate.authorized).toBeDefined();
        expect(splitgate.authorized).toBe(false);

        expect(splitgate.user).toBeDefined();
        expect(splitgate.user).toEqual({
            name: undefined,
            platform: {
                id: undefined,
                userId: undefined,
            },
            id: undefined,
            xuid: undefined,
            bans: [],
        });
    });
});