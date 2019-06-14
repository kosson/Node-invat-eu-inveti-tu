Mai întâi instalează middleware-ul `jsonwebtoken` cu `npm install jsonwebtoken --save`.

Cheamă middleware-ul în setările de server: `const jwt = require('jsonwebtoken');`.

În **client**, la conectare, se va trimite tokenul. Pentru asta trebuie configurată conexiune pentru a atașa token-ul.

```javascript
// la momentul conectării, trimite token-ul
socket = io(http://your-server-url, {
     query: {
       Token: ‘aiciVaStaTokeNul’,
     },
   });

// dacă reîmrospătezi tokenul, reatașează-l înainte de a încerca să te reconectezi
socket.on('reconnect_attempt', () => {
     this.socket.io.opts.query = {
       token: ‘aiciTokenulCelNou’,
     };
   });
```
