# socket.io-client

## Serverul io

[Clientul](https://socket.io/docs/client-api/) este expus conexiunii socket.io prin apelarea scriptului servit chiar de server, de regulă pe calea `/socket.io/socket.io.js`.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
</script>
```

În cazul în care dorești, poți specifica adresa web la care să se conecteze serverul clientului: `const socket = io('http://localhost')`. Același efect se poate obține prin import a bibliotecii `socket.io-client`.

```javascript
const io = require('socket.io-client');
// sau folosind sintaxa ES6
import io from 'socket.io-client';
```

### io.protocol

Returnează numărul protocolului folosit.

### io([url][, options])

Aceasta este metoda de a conecta clientul de server. Această metodă returnează însuși obiectul de conectare `socket`.

Metoda creează un nou `Manager` pentru URL-ul dat în primul parametru. Dacă există deja un `Manager`, va încerca să-l reutilizeze pe acela cu singura condiție ca opțiunea `multiplex` să nu fie setată la valoarea `false`.

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

Posibilitatea de a seta headerele este legată direct de activarea nivelului de transport care folosește polling-ul. Acesta mod este activat din oficiu. Headerele setate arbitrar u vor fi trimise atunci când se folosește modul websockets pentru transport. Handshack-ul websockets nu permite setarea de headere ( [Opening Handshake. The WebSocket Protocol. RFC6455](https://tools.ietf.org/html/rfc6455#section-4)).

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

## Obiectul Manager

Este un constructor: `new Manager(url[, options])`. Acest constructor returnează un obiect tip `Manager`.

### Parametrul `url`

Este un String care indică calea de conectarea.

### Parametrul `options`

 Acesta este un obiect de configurare.

#### `path`

Este un element a cărui valoare din oficiu este `/socket.io`, aceasta fiind calea pe care clientul trimite serverului datele. Este ceea ce vede serverul.

#### reconnection

Valoarea din oficiu este `true` și indică dacă un client se va reconecta automat la server în cazul pierderii conexiunii.

#### reconnectionAttempts

Valoarea din oficiu este `Infinity`. Această opțiune indică de câte ori ar trebui ca un client să încerce să se reconecteze la server.

#### reconnectionDelay

Valoarea din oficiu este o secundă (`1000` milisecunde). Această valoare indică clientului cât timp ar trebui să aștepte înainte de a încerca o reconectare. Această valoare va fi afectată prin scădere sau adunare de cea pe care o are setată proprietatea `randomizationFactor`.

#### reconnectionDelayMax

Este timpul pe care clientul trebuie să-l aștepte înainte de a încerca o reconectare. Valoarea din oficiu este de `5000`. Fiecare încercare va mări timpul de întârziere cu 2, fiind totuși influiențat de factorul de randomizare `randomizationFactor`.

#### randomizationFactor

Valoarea din oficiu este de `0.5`. Factorul de randomizarea poate fi definit într-o plajă de la `0`, la `1`.

#### timeout

Este timpul pe care îl va aștepra clientul până când va emite evenimentele `connect_error` și `connect_timeout`. Valoarea din oficiu este `20000`.

#### autoConnect

Este valoarea care în cazul setării inițiale este `true` și menționează faptul că un client se poate reconecta. Dacă într-un anumit caz este nevoie să fie setat la `false`, va trebui să apelezi `manager.open` ori de câte ori crezi că este oportun.

#### query

Este o proprietate a cărei valoare este un obiect. Obiectul va fi compus din parametrii care vor fi trimiși la momentul conectării clientului pe un nameserver. În partea de server, acest obiect poate fi accesat din `socket.handshake.query`.

#### parser

Această proprietate menționează parserul care trebuie folosit pentru datele trimise/primite. Valoarea din oficiu este un obiect `Parser` care vine în pachetul inițial al lui socket.io (`socket.io-parser`).

### Metodele obiectului `Manager`

Managerul este un obiect care gestionează conexiune clientului cu serverul.

#### manager.reconnection([value])

Metoda setează opțiunea `reconnection`. Dacă nu sunt pasați parametru, pur și simplu returnează valoarea existentă a opțiunii. Opțiunea `value` poate fi un `Boolean`.

#### manager.reconnectionAttempts([value])

Metoda setează opțiunea `reconnectionAttempts`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.reconnectionDelay([value])

Metoda setează opțiunea `reconnectionDelay`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.reconnectionDelayMax([value])

Metoda setează opțiunea `reconnectionDelayMax`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.timeout([value])

Metoda setează opțiunea `timeout`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.open([callback])

Dacă managerul de conexiune are setarea `autoConnect` cu valoarea `false`, va fi lansată o nouă tentativă de conectare. Argumentul acceptat poate fi o funcție care joacă rol de callback. Acest callback este executat dacă încercarea de conectare reușește/eșuează.

#### manager.connect([callback])

Este un sinonim la `manager.open([callback])`.

#### manager.socket(nsp, options)

Această metodă creează un nou obiect `Socket` pentru namespace-ul curent specificat prin primul argument, care este de tipul `String`. Al doilea parametru este un `Object` de configurare a socketului. Metoda returnează un obiect `Socket`.

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

## Obiectul `Socket`

### Proprietăți `Socket`

#### `socket.id`

Această proprietate este o valoare `String`, care este un identificator unic. Această proprietate este creată imediat ce s-a declanșat evenimentul `connect`. Valoarea este reactualizată după declanșarea evenimentului  `reconnect`.

```javascript
const socket = io('http://localhost');

console.log(socket.id); // undefined

socket.on('connect', () => {
  console.log(socket.id); // 'G5p5...'
});
```

#### `socket.connected`

Este o valoare `Boolean` care indică dacă un socket este conectat la server sau nu.

```javascript
const socket = io('http://localhost');

socket.on('connect', () => {
  console.log(socket.connected); // true
});
```

#### `socket.disconnected`

Este o valoare `Boolean` care indică dacă un socket este deconectat la server sau nu.

```javascript
const socket = io('http://localhost');

socket.on('connect', () => {
  console.log(socket.disconnected); // false
});
```

### Metode `Socket`

#### `socket.open()`

Metoda returnează un obiect `Socket`. Folosirea acestei metode se va face atunci când vrei să deschizi manual o conexiune.

```javascript
// evită conectarea automată!
const socket = io({
  autoConnect: false
});

// ...
socket.open();
```

Poate fi folosită cu succes atunci când intervine un eveniment `disconnect`.

```javascript
socket.on('disconnect', () => {
  socket.open();
});
```

#### `socket.connect()`

Este un sinonim pentru metoda `socket.open()`.

#### `socket.send([…args][, ack])`

Metoda trimite un eveniment tip `message`. Metoda returnează obiectul `Socket`. Opțional, primește argumente și un callback (`ack`). Pentru mai multe detalii, vezi `socket.emit(eventName[, …args][, ack])`.

#### `socket.emit(eventName[, …args][, ack])`

Metoda emite către socket un eveniment denumit printr-un `String`. Pentru a trimite datele către server sunt suportate toate structurile de date care pot fi serializate, încluzând `Buffer`-ele.

Metoda returnează obiectul `Socket`.

```javascript
socket.emit('hello', 'world');
socket.emit('with-binary', 1, '2', { 3: '4', 5: new Buffer(6) });
```

Argumentul `ack` este un callback care va fi apelat la momentul în care serverul răspunde. Un posibil scenariu ar fi cu partea de server care ascultă pe un posibil eveniment. Să numim evenimentul `pac`.

```javascript
// server:
 io.on('connection', (socket) => {
   // ascultă pe pac
   socket.on('pac', (email, fn) => {
     fn('Eu sunt Ina');
   });
 });
```
Clientul va emite pe evenimentul `pac`.

```javascript
socket.emit('pac', 'ina7@yahoo.com', (data) => {
  console.log(data); // data va fi 'Eu sunt Ina'
});
```

#### `socket.on(eventName, callback)`

Această metodă este folosită pentru a atașa funcții receptor evenimentelor definite de utilizator sau celor predefinit. Metoda returnează obiectul `Socket`. Primul argument pe care îl primește este denumirea unui eveniment și este de tip `String`. Cel de-al doilea argument este un callback cu rol de receptor pentru prelucrarea datelor.

```javascript
var socket = io();
socket.on('connect', function (socket) {
    console.log(`Eu sunt ${socket.id}`);
    socket.on('salut', function (date) {
        // prelucreaza datele primite
    });
});
```

Modele posibile de atașare ale funcțiilor receptor. Metoda ascultă pe evenimentul definit de utilizator și atașează un callback.

```javascript
// un receptor pentru un eveniment definit
socket.on('pac', (data) => {
  console.log(data);
});
```

O funcție cu rol de receptor poate primi mai multe argumente.

```javascript
// un receptor cu mai multe argumente
socket.on('pac', (a, b, c) => {
  // ...
});
```
Callback-ul poate primi chiar o funcție ca valoare.

```javascript
// with callback
socket.on('pac', (oFuncțieCaValoare) => {
  oFuncțieCaValoare(10);
});
```

Un obiect socket moștenește toate metodele clasei `Emitter`. Astfel, poate avea și alte metode precum `hasListeners`, `once` sau `off`.

#### socket.compress(value)

Metoda setează un mecanism de prelucrare căruia i se va supune oricare eveniment emis ulterior. În acest caz, vorbim de o compresie a datelor. Fii atent că oricum acest mecanism este în efect chiar dacă nu apelezi metoda.

```javascript
socket.compress(false).emit('unEveniment', { nume: 'Ion' });
```

#### `socket.binary(value)`

Metoda indică dacă datele de lucru vor fi într-un format binar. Specificarea acestei opțiuni presupune creșterea de performanță.

```javascript
socket.binary(false).emit('unEveniment', {  nume: 'Ion' });
```

#### `socket.close()`

Metoda returnează obiectul `Socket`. Această metodă produce o deconectare a conexiunii.

#### `socket.disconnect()`

Este sinonim metodei `socket.close()`.
