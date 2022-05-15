const { v1 } = require('../index.js').Splitgate;
let splitgate;

beforeEach(() =>{
    splitgate = new v1();
});

describe('[v1] Splitgate class creation', () => {
    it('successfully initializes without configuration', () => {
        expect(splitgate).toBeInstanceOf(v1);
    
        expect(splitgate.debug).toBeDefined();
        expect(splitgate.debug).toBe(false);

        expect(splitgate.version).toBeDefined();
        expect(splitgate.version).toBe(1);
    
        expect(splitgate.authorized).toBeDefined();
        expect(splitgate.authorized).toBe(false);

        expect(splitgate.userId).toBeDefined();
        expect(splitgate.userId).toEqual('');
    });
});