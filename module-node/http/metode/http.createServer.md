# http.createServer

Invocarea acestei metode returnează un obiect `http.Server`. Classa `http.Server` extinde `net.Server`, care la rândul său extinde clasa `EventEmitter`.

```javascript
const http = require('node:http');

// Creează un server local pentru a primi datele
const server = http.createServer();

// Ascultă pe evenimentul request
server.on('request', (request, response) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    data: 'Salutări!',
  }));
});

server.listen(8080);
```

La momentul în care instanțiezi serverul, poți să pasezi un callback, care în fundal, Node.js o va atașa pe evenimentul `request`, ceea ce va reduce din verbozitatea codului.

```javascript
const http = require('node:http');

// Creează un server local pentru a primi datele
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    data: 'Hello World!',
  }));
});

server.listen(8000);
```

## Semnătura

Metoda are următoarea semnătură: `http.createServer([options][, requestListener])`.

## Parametri

Primul parametru este un obiect cu opțiuni care parametrizează conexiunea numit generic `options`.

- `connectionsCheckingInterval` - setează intervalul în milisecunde pentru a verifica timeout-ul pentru cerere și headers în cazul în care cererea eșuează. Valoarea din oficiu este `30000`;
- `headersTimeout` - setează intervalul în milisecunde în care pot fi primite headerele de la client. Vezi [server.headersTimeout](https://nodejs.org/api/http.html#serverheaderstimeout). Valoarea din oficiu este `60000`.
- `insecureHTTPParser`
- `IncomingMessage`
- `keepAlive`
- `keepAliveInitialDelay`
- `keepAliveTimeout`
- `maxHeaderSize`
- `noDelay`
- `requestTimeout`
- `joinDuplicateHeaders`
- `ServerResponse`
- `uniqueHeaders`

Cel de-al doilea parametru este o funcție numită generic `requestListener` care va fi cea care va gestiona datele cererii.

## Funcția cu rol de callback

În semnătură vedem că cel de-al doilea argument pasat metodei `createServer` este o funcție care de îndată ce va fi semnalată prezența unei cereri de la un client prin evenimentul `request`, va fi executată. Node.js va crea două obiecte foarte importante care vor fi pasate automat funcției cu rol de callback. Primul obiect va fi reprezentarea cererii (*request*), iar cel de-al doilea va fi reprezentarea răspunsului care va fi trimis clientului (*response*). Cele două obiecte vor fi atribuite unor parametri numiți generic `req` și `res`. Aceste nume pentru cei doi parametri au fost decantate în timp ca un acord tacit al programatorilor de a avea o convenție ce ușurează citirea codului. Obiectul ce reprezintă cererea are cel puțin două proprietăți `url` și `method` esențiale, iar cel del=-al doilea un set mai mare de metode printre care `write` și `end`.

Node.js va popula cele două obiecte care vor fi disponibile în contextul de execuție al callback-ului. Primul obiect va fi populat cu date rezultate din parsarea cererii, iar cel de-al doilea obiect va fi populat cu metode necesare prelucrării și trimiterii răspunsului. De fapt, aceste metode vor fi tot atâtea apeluri ale mecanismelor interne ale Node.js (C++) care vor modela și eventual trimite răspunsul.

## Resurse

- [http.createServer([options][, requestListener]) | nodejs.org/api](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener)
- [http.Server | nodejs.org/api](https://nodejs.org/api/http.html#class-httpserver)
- [net.Server | nodejs.org/api](https://nodejs.org/api/net.html#class-netserver)