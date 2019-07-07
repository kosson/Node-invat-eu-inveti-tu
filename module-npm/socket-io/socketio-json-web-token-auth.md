# Introducere autentificare

Mai întâi de toate, clientul trebuie să facă un cont pentru aplicație. Această etapă este ncesară pentru a avea informații de bază necesare verificării ulterioare a clientului la momentul logării și autentificării.

Un token JWT poate fi pasat de la client la server în scopul autentificării în câteva posibile scenarii:

- la conectarea inițială cu atașarea token-ului la query;
- lași clientul să se conecteze și apoi îi ceri token-ul;
- la reconectare.

Mai întâi instalează middleware-ul `jsonwebtoken` cu `npm install jsonwebtoken --save`.

Cheamă middleware-ul în setările de server: `const jwt = require('jsonwebtoken');`.

## Scenariul

### Pas 1 - Clientul se conectează

Serverul verifică legitimitatea clientului și dacă acesta există în baza de date, îi va trimite un token necesar autentificărilor pe anumite căi. Acest token este stocat local (`localStorage`).

### Pas 2 - Accesarea căilor protejate






În **client**, la conectare, se va trimite tokenul. Pentru asta trebuie configurată conexiune pentru a atașa token-ul.

```javascript
// la momentul conectării, trimite token-ul
socket = io(http://your-server-url, {
     query: {
       token: ‘aiciVaStaTokenul’,
     },
   });

// dacă reîmprospătezi tokenul, reatașează-l înainte de a încerca să te reconectezi
socket.on('reconnect_attempt', () => {
     this.socket.io.opts.query = {
       token: ‘aiciTokenulCelNou’,
     };
   });
```

## Referințe

- [Introduction to JSON Web Tokens](https://jwt.io/introduction/)
- [JSON Web Token (JWT) — The right way of implementing, with Node.js](https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e)
