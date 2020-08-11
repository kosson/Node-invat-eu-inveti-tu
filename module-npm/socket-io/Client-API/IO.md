# Obiectul IO

Acest obiect se formează în client.

```html
<script src="/socket.io/socket.io.js"></script>
<!-- sau -->
<script>
  const socket = io('http://localhost');
</script>
```

Poate fi cerut folosind sintaxa ES6 pentru module.

```javascript
import io from 'socket.io-client';
```

## Crearea obiectului socket `io([url][, options])`

Prin invocarea funcției io() se va crea o instanță a unui obiect `Socket` și va fi creat un obiect de tip `Manager` pentru URL-ul introdus. Obiectul `Socket` va avea setat drept namespace calea menționată în URL. Valoarea din oficiu este `/`. De exemplu, dacă url-ul pasat este `http://localhost:8080/resurse`, conexiunea pentru transport se va stabili la nivelul `http://localhost:8080`, iar conexiunea Socket.IO se va face la `/resurse`.

- **url** este un `String` care menționează namespace-ul la care se face conexiunea. Dacă nu este menționat, conectarea se va face la `window.location`, adică url-ul pe care este pagina deschisă.
- **options** este un `Object` care poate fi populat cu opțiunile de conectare a clientului la server.


Metoda creează instanțiază un nou obiect `Manager` pentru URL-ul menționat în primul parametru. Dacă există deja un obiect `Manager`, va încerca să-l reutilizeze pe acela cu singura condiție ca opțiunea `multiplex` să nu fie setată la valoarea `false`.

Ceea ce se va petrece în spatele cortinei, este o instațiere a unui `Manager` pentru url-ul pasat. Dacă există și alte apeluri din pagina clientului, `Manager`-ul va fi reutilizat cu excepția cazului în care opțiunea `multiplex` are setată valoarea la `false`. Setarea multiplexării la `false` atrage după sine generarea unei noi conexiuni de fiecare dată când clientul se conectează la server. Acest lucru este echivalentul opțiunii `'force new connection': true` pasate în obiectul de configurare a conexiunii sau mai nou `forceNew: true`.

Conectarea la un namespace specificat, de exemplu `io('/users')` declanșează câteva etape de conectare:

- prima dată clientul se va conecta pe rădăcină la `http://localhost` sau la rădăcina indicată de valoarea `window.location`;
- Imediat după, conexiunea Socket.IO se va face la namespace-ul specificat: `/users`.

## Trimiterea parametrilor

Dacă ai nevoie să trimiți din client către server parametri, care să fie atașați apelului fără a mai folosi un eveniment dedicat, poți face acest lucru folosindu-te de posibilitatea de a trimite opțiuni la momentul conectării, fie atașând la namespace: `http://localhost/users?token=b10ef34`, fie trimițând în obiectul de opțiuni ca al doilea argument, o proprietate `query`, care să conțină datele necesare.

```javascript
const socket = io('/resurse', {
  query: {
    token: 'b10ef34'
  }
});
```

Trimiterea parametrilor este în tandem cu momentul primirii acestora pe server. Obiectul `socket` din server are o proprietate [`handshake`](https://socket.io/docs/server-api/#socket-request), care este referința către un obiect, care are și o proprietate `query`, fiind chiar obiectul trimis de client. Handshake-ul se întâmplă o singură dată, la momentul conectării clientului cu serverul.

## Proprietăți și metode ale IO

### io.protocol

Returnează numărul protocolului folosit.

#### `path`

Valoarea din oficiu este `/socket.io`. Aceasta este calea care este luată în evidență pe server.

#### `reconnection`

Valoarea din oficiu este `true` și indică faptul că se va reîncerca reconectarea în mod automat.

#### `reconnectionAttempts`

Valoarea din oficiu este `Infinity` și indică faptul că se va reîncerca reconectarea fără oprire.

#### `reconnectionDelay`

Această valoare indică intervalul de timp care va trece până când se va încerca o nouă reconectare. Valoarea din oficiu este `1000` dar poate fi mai mare sau mai mică în funcție de valoarea de la `randomizationFactor`. Întârzierea (*delay*) inițială va fi o valoare între 500 și 1500 ms.

#### `randomizationFactor`

Este o valoare între 0 și 1. Cea din oficiu este `0.5`.

#### `reconnectionDelayMax`

Este timpul dintre încercările de reconectare. Fiecare încercare de reconectare va dubla timpul, dar va fi folosit și factorul de randomizare. Valoarea de start este `5000`.

#### `timeout`

Valoarea din oficiu este 20000. Aceasta este valoarea de timp după care va fi emis un eveniment `connect_error` și `connect_timeout`.

#### `autoConnect`

Valoarea din oficiu este `true` ceea ce înseamnă că un client se va autoreconecta. Dacă este setată la `false`, va trebui folosită metoda `manager.open()` pentru a stabili o conexiune.

#### `query`

Valoarea din oficiu este un obiect gol. În acest obiect pot fi introduse perechi chei: valoare, care sunt trimise drept query parameters atunci când se face conectarea la un namespace. Aceste valori pot fi exptrase în server din obiectul `socket.handshake.query`.

#### `parser`

Este parserul conexiunilor. Valoarea din oficiu este o instanță a obiectului `Parser` (`socket.io-parser`).

#### Parametrul `url`

Este o valoare `String`, care indică o cale pe care se va face comunicarea. Valoarea din oficiu este `window.location`, fiind chiar calea URL-ului pe care s-a făcut conectarea, adică pe rădăcină, de regulă (`/`). Pentru stabilirea de namespace-uri dedicate, se va menționa numele acestuia în acest parametru.

Pasarea acestui argument, este echivalent cu setarea prin opțiuni în mod explicit a unei valori `'force new connection': true` sau chiar direct `forceNew: true`.

De exemplu, dacă avem un link `http://localhost/users`, atunci conectarea se va face pe rădăcină mai întâi conexiunea care va asigura transportul, adică pe `http://localhost` și socketul se va configura pe calea specificată după rădăcină `/users`.

Câteva exemple de inițializare sunt relevante pentru a înțelege cum se formează conexiunea. Reține faptul că în momentul inițial, este folosită o singură conexiune pentru a se face conectarea la toate namespace-urile.

```javascript
const socket = io(); // conectează la rădăcină (/)
const adminSocket = io('/admin');
// o singură conexine este stabilită pentru
// conectarea pe rădăcină, dar și pe /admin
// fiind angajată aici multiplexarea
```

Dacă se dorește, este pobilă forțarea de conexiune separate pentru fiecare dintre conectări.

```javascript
const socket = io();
const adminSocket = io('/admin', { forceNew: true });
// vom avea două conexiuni distincte
```

Constituirea a două referințe separate pentru aceeași cale, se va solda cu inițierea a două conexiuni diferite, de fapt.

```javascript
var conexiune1 = io(); // o conexiune distinctă
var conexiune2 = io(); // altă conexiune distinctă
```

#### Parametrul `options`

Precum în cazul apelurilor care includ și un query, acest lucru este posibil și în cazul socketurilor, dacă valorile de query sunt pasate ca elemente ale obiectului specific pasat drept opțiuni. Acesta este un `Object`.

```javascript
var pubComm = io('/pub', {
    query: {
        Token: 'ceAmFacutBobita'
    }
});
```

Setarea de mai sus ar fi echivalentul unei interogări `https://192.168.1.2:443/pub?token=stringulTokenului`.

#### Conectarea pe o cale specificată - `path`

În cazul în care dorești conectarea pe o cale anume, aceasta poate fi specificată expres în obiectul de configurare al conexiunii.

```javascript
var socket = io('https://site.ro', {
  path: '/caledorita'
});
```

În acest caz, trebuie să avem un corespondent din partea serverului, care să poată răspunde. Astfel, va trebui configurat și în server echivalentul.

```javascript
// în server
var io = require('socket.io')({
  path: '/caledorita'
});
```

Apelul apare astfel: `site.ro/caleadorita/?EIO=3&transport=polling&sid=<id>`.

În cazul conectării la un namespace, dar cu un `path` specificat, apelul va apărea că se va face direct pe calea specificată.

```javascript
const socket = io('http://site.ro/admin', {
  path: '/caleadorita'
});
```

În acest caz, conectarea se va face la namespace-ul `/admin`, dar apelul va apărea ca unul pe calea specificată: `site.ro/caleadorita/?EIO=3&transport=polling&sid=<id>`.

#### Conectare folosind query parameters

În client ai calea cu tot cu interogare.

```javascript
const socket = io('https://site.ro?token=abc');
```

În server ar trebui să ai o zonă care să gestioneze o astfel de cerere. Mai întâi expui obiectul `io`.

```javascript
const io = require('socket.io')();
```

Apoi, introduci un lanț de prelucrare folosind middleware-ul `use`. În lanț vei pasa obiectul socket constituit mai sus. Scenariul de mai jos tratează o posibilă logare și autentificare a unui user care trimite un jsonwebtoken printr-un query.

```javascript
io.use((socket, next) => {
  let token = socket.handshake.query.token; // obține token-ul din handshake
  // pasează unei funcții arbitrare pentru validarea token-ului
  if (isValid(token)) {
    return next(); // dacă este valid tokenul, se pasează controlul pe următorul middleware
  }
  // dacă nu este valid token-ul, va fi emisă o eroare.
  return next(new Error('Eroare de autentificare!'));
});

// apoi pe primul eveniment connection
io.on('connection', (socket) => {
  let token = socket.handshake.query.token;
  // validare și lucru pe evenimentele definite arbitrar
});
```

Tot în scenariul de lucru cu query parameters, se poate folosi obiectul de configurare al conexiunii în care vom avea o proprietate `query`.

```javascript
var socket = io({
  query: {
    token: 'valoareaStringATokenului'
  }
});
```

Valoarea proprietății de configurare `query` poate fi actualizată la reconectare, dacă acest lucru este necesar.

```javascript
socket.on('reconnect_attempt', () => {
  socket.io.opts.query = {
    token: 'nouaValoareaStringATokenului'
  }
});
```

#### Setări suplimentare pentru headere - `extraHeaders`

Posibilitatea de a seta headerele este legată direct de activarea nivelului de transport care folosește polling-ul. Acesta mod este activat din oficiu. Headerele setate arbitrar nu vor fi trimise atunci când se folosește modul websockets pentru transport. Handshack-ul websockets nu permite setarea de headere ( [Opening Handshake. The WebSocket Protocol. RFC6455](https://tools.ietf.org/html/rfc6455#section-4)).

```javascript
const socket = io({
  transportOptions: {
    polling: {
      extraHeaders: {
        'x-clientid': 'abc'
      }
    }
  }
});

// server-side
const io = require('socket.io')();

// middleware
io.use((socket, next) => {
  let clientId = socket.handshake.headers['x-clientid'];
  if (isValid(clientId)) {
    return next();
  }
  return next(new Error('Eroare de autentificare'));
});
```

#### Conectarea doar pe `websocket`

Mai întâi, la momentul conectării se face un long-polling și abia după, dacă este posibil conexiunea este mutată pe WebSocket. Dacă dorești inițierea unei conexiuni numai folosind websockets, acest lucru poate fi configurat.

```javascript
var socket = io({
    transports: ['websocket']
});
```

La momentul când se face reconectarea indiferent după oricare eveniment de rețea, pentru siguranță ar fi bine adăugarea opțiunii care activează și long-polling-ul.

```javascript
socket.on('reconnect_attempt', () => {
    socket.io.opts.transports = ['polling', 'websocket'];
});
```

#### Specificarea unui parser pentru datele primite

Parserul din oficiu pe care îl folosește `Socket.io` este orientat către un nivel ridicat de compatibilitate, fapt care, potențial ar putea afecta performanța (`File`, `Blob` și binary check).

```javascript
const parser = require('socket.io-msgpack-parser'); // sau require('socket.io-json-parser')
const socket = io({parser: parser});

// pentru a se putea comunica cu serverul, serverul trebuie să folosească același parser
const io = require('socket.io')({parser: parser});
```

#### Stabilirea unei comunicări securizate

La nivelul serverului se vor face următoarele configurări.

```javascript
const fs     = require('fs');
const server = require('https').createServer({
  key:  fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
});
const io = require('socket.io')(server);
server.listen(3000);
```

În zona de client am putea avea:

```javascript
const socket = io({
  // prima opțiune
  ca: fs.readFileSync('server-cert.pem'),

  // A doua opțiune. Atenție, vei fi expus unor atacuri MITM!
  rejectUnauthorized: false
});
```
## Proprietăți ale clientului

### `client.conn`

Aceasta este o referință la conexiunea `Socket` a lui `engine.io`.

### `client.request`

Acesta este un proxy tip getter care returnează referința către o cerere (*request*) cu originea în `engine.io`. Această referință este utilă pentru a accesa headere ale cererilor precum `Cookie` sau `User-Agent`.


Acesta este obiectul socket care este constituit în client.

[Clientul](https://socket.io/docs/client-api/) este expus conexiunii socket.io prin apelarea scriptului servit chiar de server, de regulă pe calea `/socket.io/socket.io.js`.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

Opțional, poți specifica adresa web la care să se conecteze serverul clientului: `const socket = io('http://localhost')`. Același efect se poate obține prin import a bibliotecii `socket.io-client`.

```javascript
const io = require('socket.io-client');
// sau folosind sintaxa ES6
import io from 'socket.io-client';
```

## Evenimente

### `connect`

Este un eveniment care se declanșează la momentul în care se realizează o conexiune sau o reconectare cu succes.

În cazul clientului, toate evenimentele trebuie înregistrate în afara evenimentului `connect` pentru a nu se face o nouă înregistrare la o reconectare.

```javascript
socket.on('connect', () => {
  // ...
});
socket.on('myevent', () => {
  // ...
});
```

### `disconnect`

Este un eveniment care înregistrează un callback ce se va executa la momentul în care se întâmplă o deconectare.

```javascript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // deconectare de la server, trebuie o reconectare manuală
    socket.connect();
  }
  // altfel, socketul va încerca să se reconecteze automat.
});
```

### `connect_error`

Este un eveniment care se declanșează la o eroare de conectare. Este disponibil și un obiect `error` care poate fi prelucrat în callback.

```javascript
socket.on('connect_error', (error) => {
  // ...
});
```

### `connect_timeout`

Este un eveniment care se declanșează la momentul apariției unui timeout.

```javascript
socket.on('connect_timeout', (timeout) => {
  // ...
});
```

### `error`

Este un eveniment care înregistrează un receptor care se execută la momentul apariției unei erori. Callback-ul primește un obiect `Error`.

```javascript
socket.on('error', (error) => {
  // ...
});
```

### `reconnect`

Este un eveniment care se declanșeză la momentul în care se restabilește conectarea. Callback-ul primește un argument `attempt`, care va fi un număr ce reprezintă la a câta încercare s-a petrecut reconectarea.

```javascript
socket.on('reconnect', (attemptNumber) => {
  // ...
});
```

### `reconnect_attempt`

Este un eveniment care se declanșeză la momentul în care se restabilește conectarea. Callback-ul primește un argument `attempt`, care va fi un număr ce reprezintă la a câta încercare s-a petrecut reconectarea.

```javascript
socket.on('reconnect_attempt', (attemptNumber) => {
  // ...
});
```

### `reconnecting`

Este un eveniment care se declanșează la momentul în care se încearcă reconectarea.

```javascript
socket.on('reconnecting', (attemptNumber) => {
  // ...
});
```

### `reconnect_error`

Este un eveniment care se declanșeză la momentul în care restabilirea conectării a eșuat. Callback-ul primește un argument `error`, care este un obiect.

```javascript
socket.on('reconnect_error', (error) => {
  // ...
});
```

### `reconnect_failed`

Este un eveniment declașat atunci când reconectarea în contextul `reconnectionAttempts` eșuează.

```javascript
socket.on('reconnect_failed', () => {
  // ...
});
```

### `ping`

Se declanșeză când este trimis un ping către server.

```javascript
socket.on('ping', () => {
  // ...
});
```

### `pong`

Este declanșat când este primit un pong de la server. Callback-ului îi este disponibil un `Number`, care este latența - numărul de milisecunde de la ping.

```javascript
socket.on('pong', (latency) => {
  // ...
});
```
