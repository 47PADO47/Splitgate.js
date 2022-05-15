# Splitgate.js
Api wrapper for the steam game Splitgate

## Installation
```bash
npm install splitgate.js
```

## Example
```javascript
    const { Splitgate } = require('splitgate.js');
    const v1 = new Splitgate.v1();
    const v2 = new Splitgate.v2();

    (async () => {
        await v1.login('platformAuthToken', 'authToken');
        await v2.login('platformToken');

        const status = await v1.getServerStatus();
        console.log(`Servers are ${status.isLive ? 'online' : 'offline'}`);

        const pass = await v2.getSeasonPass();
        console.log(`The season pass will end on ${new Date(pass.end).toLocaleDateString()}`);
    })();
```