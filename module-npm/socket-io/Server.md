# Instanțierea obiectului `Server`

Obiectul `Server` este disponibil în momentul în care este cerut modulul `socket.io`.

```javascript
var io = require('socket.io')();
// poți instanția și prin invocarea constructorului
var Server = require('socket.io');
var io = new Server();
```

Câteva alternative de creare a serverului:
-  `new Server(httpServer[, options])`,
-  `new Server(port[, options])`,
-  `new Server(options)`.

## Atașarea la un server http - `new Server(httpServer[, options])`

Instanțierea obiectului `Server` folosind constructorul, permite pasarea drept argumente un server http, la care Socket.io să se atașeze și opțional un obiect cu opțiuni de configurare (`new Server(httpServer[, options])`). Generarea unui obiect `Server` se poate face și prin invocarea fără `new`.

```javascript
const server = require('http').createServer();

const io = require('socket.io')(server, {
  path: '/test',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

server.listen(3000);
```

Opțiuni de configurare posibile:

| Nume opțiune | Din oficiu | Descriere |
|:-- |:-- |:-- |
| `path` | `/socket.io` | calea pe care se va face captura datagramelor |
| `serveClient` | `true` | indică dacă vor fi servite fișierele corespondente clientului |
| `adapter` | | Indică care `Adapter` trebuie folosit. Cel folosit din oficiu este unul bazat pe folosirea memoriei. Vezi [socket.io-adapter](https://github.com/socketio/socket.io-adapter) |
| `origins` | `*` | originile permise de unde se acceptă datagramele |
| `parser` | | Este parserul folosit. Socket.io oferă un `Parser` din oficiu. vezi [socket.io-parser](https://github.com/socketio/socket.io-parser)|

Opțiuni de configurare ale serverului intern `Engine.IO`.

| Nume opțiune | Din oficiu | Descriere |
|:-- |:-- |:-- |
| `pingTimeout` | `5000` | indică timpul în milisecunde fără un pachet pong după care conexiunea este considerată închisă|
|`pingInterval`|`25000`|timpul așteptat până când se va trimite un nou pachet ping|
|`upgradeTimeout`|`10000`|câte milisecunde până când un upgrade de rețea este anulat|
|`maxHttpBufferSize`|`10e7`|câte caractere sau bytes poate avea un mesaj înainte de a închide sesiunea (evitarea DoS)|
|`allowRequest`||Este o funcție care primește un handshake sau o cerere de upgrade a rețelei drept prim parametru cu ajutorul cărora se poate decide continuarea operațiunilor sau nu. Cel de-al doilea argument este o funcție care trebuie apelată cu datele deciziei luate (`fn(error, succes)`), unde `succes` este o valoare boolean pentru care `false` înseamnă că cererea este respinsă, iar `error` este un cod de eroare|
|`transports`|`['polling', 'websocket']`|niveluri de transport permise pentru conexiune|
|`allowUpgrades`|`true`|permite upradarea nivelului de transport de la polling la websocket|
|`perMessageDeflate`|`true`|parametrii extensiei `permessage-deflate` a lui WebSocket (vezi modulul `ws`). Pentru dezactivare, setează la `false`|
|`httpCompression`|`true`|parametrii de compresie a conexiunii în cazul polling-ului (vezi api-ul `zlib`)|
|`cookie`|`io`|este numele cookie-ului HTTP care conține id-ul clientului pentru a fi transmis ca parte a headerelor la momentul handshake-ului. Dacă setezi la `false`, nu a fi trimis vreunul.|
|`cookiePath`|`/`|calea pentru cookie. Dacă opțiunea cookie este la `false`, nu se va trimite nicio cale, ceea ce înseamnă că browserele vor trimite cookie-uri doar în calea `/engine.io`. Setează `false` ca să nu salvezi io cookie la toate cererile|
|`cookieHttpOnly`|`true`|dacă este setat la `true`, cookie-ul `HttpOnly` nu poate fi accesat de API-urile clientului așa cum este chiat JavaScript-ul. Această opțiune nu are niciun efect dacă `cookie` sau `cookiePath` este setat la `false`.|
|`wsEngine`|`ws`|Indică care implementare de websocket va fi folosită. Modulul specificat trebuie să fie conform interfeței `ws` (vezi modulul `ws`). Valoarea din oficiu este `ws`. Este disponibilă și o versiune C++ prin instalarea modulului `uws`.|

## Instanțierea cu specificarea portului - `new Server(port[, options])`

Portul este un `Number`, pe care un nou server http va fi creat prin instanțierea lui `http.Server`.

```javascript
const io = require('socket.io')(3000, {
  path: '/test',
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
```

Al doilea parametru este un obiect de configurare.

## Instanțierea serverului doar cu opțiuni - `new Server(options)`

```javascript
const io = require('socket.io')({
  path: '/test',
  serveClient: false,
});
// fie
const server = require('http').createServer(); // socket.io are nevoie de un server http
// atașarea serverului creat la instanța de socket.io
io.attach(server, {
  path: '/test',
  serveClient: false,
  // setări caracteristice engine.IO
  pingInterval: 10000,
  pingTimeout:  5000,
  cookie:       false
});
server.listen(3000);
// sau
io.attach(3000, {
  pingInterval: 10000,
  pingTimeout:  5000,
  cookie:       false
});
```

Serverul mai poate fi creat prin apelarea metodei `attach()` odată ce a fost cerut modulul. Mai întâi instanțiezi obiectul `socket`, eventual parametrizându-l. Apoi, atașezi serverul http.

Socket-ul are nevoie să se atașeze la un server `http` pentru a funcționa așa cum este cel pe care-l oferă NodeJS din oficiu `httpServer`. Pe lângă serverul HTTP, constructorul `Socket.io` acceptă suplimentar și un obiect cu opțiuni de configurare.

```javascript
var http   = require('http');
var server = http.createServer();
var io     = require('socket.io')(server, {opțiune: valoare});
```

În cele mai multe scenarii, serverul socket va folosi un server HTTP creat cu ajutorul lui `Express.js`.

## Proprietățile obiectului `socket`

### Proprietatea  `server.sockets`

Acesta este un alias pentru namespace-ul rădăcină: `/`. Se comportă ca un alias pentru namespace-ul din oficiu `/`.

```javascript
io.sockets.emit('salutare', 'toată lumea');
// fix echivalent cu
io.of('/').emit('salutare', 'toată lumea');
```

Aceast caz permite emiterea unui mesaj pe toate socketurile conectate.

### Proprietatea `server.serveClient([value])`

Această metodă returnează un `Server`. Dacă valoarea lui `value` este `true`, serverul va servi fișiere. După apelarea metodei `atach`, această metodă nu mai are niciun efect.

```javascript
// pasezi un server și opțiunea `serveClient`
const io = require('socket.io')(http, { serveClient: false });

// poți opta să nu pasezi un server și apoi să aplezi metoda
const io = require('socket.io')();
io.serveClient(false);
io.attach(http);
```

### Proprietatea `server.path([value])`

Parametrul pe care îl primește metoda, setează calea pe care vor fi servite fișierele statice și chiar `server.io`. Valoarea din oficiu este `/socket.io`. În cazul în care este apelată metoda fără argument, va fi returnată calea existentă.

```javascript
const io = require('socket.io')();
io.path('/subdirector');

// client-side
const socket = io({
  path: '/subdirector'
});
```

### Proprietatea `server.adapter([value])`

Valoarea lui `value` este un `Adapter`. Valoarea inițială pentru `Adapter` este ceea ce oferă Socket.io din oficiu, o soluție care folosește memoria. Vezi [socket.io-adapter](https://github.com/socketio/socket.io-adapter).

Dacă nu este pasată nicio valoare, invocarea metodei, va returna valoarea curentă.

```javascript
const io = require('socket.io')(3000);
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));
```

### Proprietatea `server.origins(fn)`

Argumentul pe care îl poate primi această metodă este o funcție căreia îi pot fi pasate două argumente:

- `origin`, care este chiar `String`,
- și o funcție cu rol de callback (`callback(error, success)`).

Callback-ul are drept argumente o valoare `String`, care indică eroarea, iar al doilea argument este o valoare `Boolean`, care atunci când este `false`, indică că respectiva cale nu este permisă. În acest caz, neapărat trebuie completat un fragment de text care să explice eroarea.

```javascript
io.origins((origin, callback) => {
  if (origin !== 'https://foo.example.com') {
    return callback('origin not allowed', false);
  }
  callback(null, true);
});
```

Probleme care pot apărea:
- în unele cazuri, nu poate fi detectată originea; poate să aibă valoarea `*`;
- Această metodă va fi executată pentru fiecare apel. Din acest motiv, trebuie să ruleze foarte repede. Nu o încărca cu operațiuni inutile;
- dacă `socket.io` este folosit în conjuncție cu `Express`, headerele CORS vor afecta doar apelurile socket.io. În cazul lui Express, poți folosi middleware-ul `cors`.

### Proprietatea `server.attach(httpServer[, options])`

Această metodă permite atașarea unui server la o instanță socket.io și modelează funcționarea prin pasarea unui obiect de opțiuni.

### Proprietatea `server.attach(port[, options])`

Această metodă menționează un port pe care instanța de socket.io să asculte. Metoda atașează un `Server` la o instanță de `engine.io` pe un server `http.Server`.

### Proprietatea `server.listen(httpServer[, options])`

Este o metodă sinonim `server.attach(httpServer[, options])`.

### Proprietatea `server.bind(engine)`

Primește ca prim argument un engine de tip `engine.Server`. Returnează un `Server`.
Metoda face o legătură către un anumit `Server` server.io sau un API compatibil.

### Proprietatea `server.onconnection(socket)`

Metoda primește ca prim argument un engine de tip `engine.Server`. Returnează un `Server`.
Metoda creează un nou client `soket.io` din `engine.io` sau alt API compatibil cu `Socket`.

### Proprietatea `server.of(nsp)`

Metoda va primi drept argument un identificator al unui nou namespace, care poate fi precizat ca:
- șir de caractere `String`,
- ca Expresie Regulată `RegExp`,
- o funcție.

Metoda returnează un `Namespace`. În cazul în care `Namespace`-ul deja a fost inițializat, îl va returna imediat.

```javascript
const adminNamespace = io.of('/admin');
```

RexExp-urile pot fi folosite pentru a crea un namespace într-o manieră dinamică.

```javascript
const dynamicNsp = io.of(/^\/dynamic-\d+$/).on('connect', (socket) => {
  const newNamespace = socket.nsp; // newNamespace.name === '/dynamic-101'

  // broadcast to all clients in the given sub-namespace
  newNamespace.emit('hello');
});

// client-side
const socket = io('/dynamic-101');

// broadcast to all clients in each sub-namespace
dynamicNsp.emit('hello');

// use a middleware for each sub-namespace
dynamicNsp.use((socket, next) => { /* ... */ });
```

Funcțiile sunt folosite în cazul în care ai nevoie să faci anumite verificări înainte de a permite unui client să folosească un anumit `Namespace`.

```javascript
io.of((name, query, next) => {
  // metoda checkToken trebuie să returneze un boolean, ce va indica dacă un client se poate conecta sau nu.
  next(null, checkToken(query.token));
}).on('connect', (socket) => { /* ... */ });
```

### Proprietatea `server.close([callback])`

Metoda oprește serverul `socket.io`. Funcția cu rol de callback, va fi executată atunci când toate conexiunile vor fi închise.

```javascript
const Server = require('socket.io');
const PORT   = 3030;
const server = require('http').Server();

const io = Server(PORT);

io.close(); // Close current server

server.listen(PORT); // PORT is free to use

io = Server(server);
```

### Proprietatea `server.engine.generateId`

Această metodă va genera un id de socket particularizat. Metoda va fi apelată cu un obiect `request` ca prim parametru.

```javascript
io.engine.generateId = (req) => {
  return "custom:id:" + custom_id++; // custom id trebuie să fie unic
}
```
