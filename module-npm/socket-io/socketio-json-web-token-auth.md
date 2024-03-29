# Introducere autentificare

Mecanismul de autentificare via socket-uri folosind JSON Web Tokens este folosit în cazul în care ai nevoie de o singură sesiune de comunicare, care să fie autentificată unic. Uneori, vezi cazul jocurilor, este necesar ca utilizatorul să beneficieze de o conexiune unică indiferent câte sesiuni de browsing are deschise.

Socket.io are un mecanism intern care generează un id aferent unui socket care va fi utilizat pentru a identifica conexiunea clientului. Valoarea va fi disponibilă după ce evenimentul `connect` a fost declanșat. Valoarea va fi actualizată după evenimentul `reconnect`.

```javascript
const serverio = io('http://localhost');

console.log(serverio.id); // undefined

serverio.on('connect', (socket) => {
  console.log(socket.id); // 'G5p5...'
});
```

Mai întâi de toate, clientul trebuie să facă un cont pentru aplicație. Această etapă este necesară pentru a avea informații de bază necesare verificării ulterioare a clientului la momentul logării și autentificării.

Un token JWT poate fi pasat de la client la server în scopul autentificării în câteva posibile scenarii:

- la conectarea inițială cu atașarea token-ului la query;
- lași clientul să se conecteze și apoi îi ceri token-ul;
- la reconectare, reatașează tokenul.

Lista cerințelor:

- Un user să se conecteze o singură dată, indiferent câte taburi ale browserului are deschise.
- userul să fie identificat cu ajutorul unui token.
- Tokenurile de autorizare nu trebuie să fie pasate prin parametri de query în link.

Strategia ar fi trimiterea unui mesaj de autentificare la momentul imediat conectării pe socket-uri.
La momentul în care se face un *handshake* pe socket-uri, se va crea un obiect `handshakeData`. Acest handshake este generat în urma unui apel, fie XHR, fie JSONP în caz că este un apel cross-domain. Un posibil model este oferit de realizarea de `namespace-uri`.

```javascript
io.of((name, query, next) => {
  // metoda checkToken trebuie să returneze un boolean, ce va indica dacă un client se poate conecta sau nu.
  next(null, checkToken(query.token));
}).on('connect', (socket) => { /* ... */ });
```

Această opțiune este folosită pentru că standardul privind socketurile menționează faptul că nu este permisă trimiterea de headere particularizate (custom). Un motiv pentru a nu trimite vreun token folosind *query parameters* este posibilitatea serverului de a face jurnalizarea cererilor și astfel să avem tokenuri în clar chiar în loguri.

## Posibil scenariu cu trimitere token fix

Mai întâi instalează middleware-ul `jsonwebtoken` cu `npm install jsonwebtoken --save`.
Cheamă middleware-ul în setările de server: `const jwt = require('jsonwebtoken');`.

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

## Scenariu de trimitere token în interval după conectare

Scenariu permite trimiterea unui token după momentul conectării la server. Se va folosi pachetul [socketio-auth](https://www.npmjs.com/package/socketio-auth).

## Resurse

- [Introduction to JSON Web Tokens](https://jwt.io/introduction/)
- [JSON Web Token (JWT) — The right way of implementing, with Node.js](https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e)
- [Enforcing a Single Web Socket Connection per User with Node.js, Socket.IO, and Redis](https://hackernoon.com/enforcing-a-single-web-socket-connection-per-user-with-node-js-socket-io-and-redis-65f9eb57f66a)
- [10.5.  WebSocket Client Authentication | The WebSocket Protocol](https://tools.ietf.org/html/rfc6455#section-10.5)
- [Token-based Authentication with Socket.IO](https://auth0.com/blog/auth-with-socket-io/)
- [Get Started with JSON Web Tokens](https://auth0.com/learn/json-web-tokens/)
- https://hacks.mozilla.org/2012/03/browserquest/
- [Implementing JWT based authentication in Node.js, Soham Kamani](https://www.sohamkamani.com/blog/javascript/2019-03-29-node-jwt-authentication/)
