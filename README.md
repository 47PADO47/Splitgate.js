# Splitgate.js
Api wrapper for the steam game Splitgate

## Installation
```bash
npm install splitgate.js
```

## Example
```javascript
    const { Splitgate } = require('splitgate.js');
    const splitgate = new Splitgate();

    (async () => {
        await splitgate.login('platformAuthToken', 'authToken');

        const status = await splitgate.getServerStatus();
        console.log(`Servers are ${status.isLive ? 'online' : 'offline'}`);
    })();
```