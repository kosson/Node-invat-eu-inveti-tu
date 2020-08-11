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
| `pingInterval`|`25000`|timpul așteptat până când se va trimite un nou pachet ping|
| `upgradeTimeout`|`10000`|câte milisecunde până când un upgrade de rețea este anulat|
| `maxHttpBufferSize`|`10e7`|câte caractere sau bytes poate avea un mesaj înainte de a închide sesiunea (evitarea DoS)|
| `allowRequest`||Este o funcție care primește un handshake sau o cerere de upgrade a rețelei drept prim parametru cu ajutorul cărora se poate decide continuarea operațiunilor sau nu. Cel de-al doilea argument este o funcție care trebuie apelată cu datele deciziei luate (`fn(error, succes)`), unde `succes` este o valoare boolean pentru care `false` înseamnă că cererea este respinsă, iar `error` este un cod de eroare|
| `transports`|`['polling', 'websocket']`|niveluri de transport permise pentru conexiune|
| `allowUpgrades`|`true`|permite upradarea nivelului de transport de la polling la websocket|
| `perMessageDeflate`|`true`|parametrii extensiei `permessage-deflate` a lui WebSocket (vezi modulul `ws`). Pentru dezactivare, setează la `false`|
| `httpCompression`|`true`|parametrii de compresie a conexiunii în cazul polling-ului (vezi api-ul `zlib`)|
| `cookie`|`io`|este numele cookie-ului HTTP care conține id-ul clientului pentru a fi transmis ca parte a headerelor la momentul handshake-ului. Dacă setezi la `false`, nu a fi trimis vreunul.|
| `cookiePath`|`/`|calea pentru cookie. Dacă opțiunea cookie este la `false`, nu se va trimite nicio cale, ceea ce înseamnă că browserele vor trimite cookie-uri doar în calea `/engine.io`. Setează `false` ca să nu salvezi io cookie la toate cererile|
| `cookieHttpOnly`|`true`|dacă este setat la `true`, cookie-ul `HttpOnly` nu poate fi accesat de API-urile clientului așa cum este chiat JavaScript-ul. Această opțiune nu are niciun efect dacă `cookie` sau `cookiePath` este setat la `false`.|
| `wsEngine`|`ws`|Indică care implementare de websocket va fi folosită. Modulul specificat trebuie să fie conform interfeței `ws` (vezi modulul `ws`). Valoarea din oficiu este `ws`. Este disponibilă și o versiune C++ prin instalarea modulului `uws`.|

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

Serverul mai poate fi creat prin apelarea metodei `attach()` odată ce a fost cerut modulul. Mai întâi instanțiezi obiectul `socket`, eventual parametrizându-l. Apoi, atașezi serverul HTTP.

Socket-ul are nevoie să se atașeze la un server `http` pentru a funcționa așa cum este cel pe care-l oferă NodeJS din oficiu `httpServer`. Pe lângă serverul HTTP, constructorul `Socket.io` acceptă suplimentar și un obiect cu opțiuni de configurare.

```javascript
var http   = require('http');
var server = http.createServer();
var io     = require('socket.io')(server, {opțiune: valoare});
```

În cele mai multe scenarii, serverul socket va folosi un server HTTP creat cu ajutorul lui `Express.js`.

## Proprietăți și metode ale obiectului server

### Proprietatea `server.sockets`

Acesta este un alias pentru namespace-ul rădăcină: `/`. Se comportă ca un alias pentru namespace-ul din oficiu `/`.

```javascript
io.sockets.emit('salutare', 'toată lumea');
// fix echivalent cu
io.of('/').emit('salutare', 'toată lumea');
```

Aceast caz permite emiterea unui mesaj pe toate socketurile conectate.

### Metoda `server.serveClient([value])`

Argumentul acceptat este o valoare `Boolean`. Dacă valoarea returnată este `true`, serverul atașat va servi fișierele către client. Această metodă returnează un `Server`. Dacă valoarea lui `value` este `true`, serverul va servi fișiere. După apelarea metodei `atach`, această metodă nu mai are niciun efect.

```javascript
// pasezi un server și opțiunea `serveClient`
const io = require('socket.io')(http, { serveClient: false });

// poți opta să nu pasezi un server și apoi să aplezi metoda
const io = require('socket.io')();
io.serveClient(false);
io.attach(http);
```

### Metoda `server.path([value])`

Socket.io stabilește automat o legătură la client căruia îi sunt trimise automat informații. Directorul stabilit din oficiu pentru a servi resursele de conectare clientului este `/socket.io`. Poți schimba această valoare la una preferată, dacă acest lucru este necesar. Parametrul pe care îl primește metoda, setează calea pe care vor fi servite fișierele statice și chiar `server.io`. În cazul în care este apelată metoda fără argument, va fi returnată calea din oficiu.

```javascript
const io = require('socket.io')();
io.path('/subdirector');

// client-side
const socket = io({
  path: '/subdirector'
});
```

### Metoda `server.adapter([value])`

Valoarea lui `value` este un `Adapter`. Aceasta indică prin valoarea dată ce adaptor este nevoie în cazul în care intenționezi să folosești `socket.io` cu servicii externe. Valoarea inițială pentru `Adapter` este ceea ce oferă Socket.io din oficiu, o soluție care folosește memoria. Vezi [socket.io-adapter](https://github.com/socketio/socket.io-adapter).

Dacă nu este pasată nicio valoare, invocarea metodei, va returna valoarea curentă.

```javascript
const io = require('socket.io')(3000);
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));
```

Exemplul manualului este un server [Redis](https://github.com/socketio/socket.io-redis). Valoarea din oficiu indică folosirea memoriei mașinii pe care rulează serverul. Dacă nu este introdus niciun argument, metoda returnează adaptorul în uz curent.

```javascript
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));

io.emit('salutare', 'tuturor clienților');
io.to('camera 10').emit('salut', "Salutare tuturor celor din 'camera 10'.");

io.on('connection', (socket) => {
  socket.broadcast.emit('salut', 'tuturor cu excepția celui care a trimis mesajul');
  socket.to('camera 10').emit('salut', "tuturor din 'camera 10' cu excepția celui care a trimis");
});
```

Rulând `socket.io` cu adaptorul de Redis, vei putea folosi multiple instanțe `socket.io` pe procese și servere diferite. Acestea vor putea să emită evenimente unele altora. Broadcastul va fi asigurat către clienți prin mecanismul Pub/Sub al Redis-ului.

###  Metoda `server.origins([value])`

Această metodă poate seta originile pachetelor. Dacă nu primește un argument, va returna valoarea curentă.

```javascript
io.origins(['https://foo.example.com:443']);
```

### Metoda `server.origins(fn)`

Argumentul pe care îl poate primi această metodă este o funcție căreia îi pot fi pasate două argumente:

- un șir de caractere, care indică originea `origin`,
- și o funcție cu rol de callback (`callback(error, success)`).

Cât privește callback-ul, cel de-al doilea argument va fi o valoare `Boolean`, care indică dacă de pe originea indicată se pot primi pachete. Dacă valoarea este `false`, trebuie introdusă o valoare string drept valoare pentru eroare, care va fi adăugată răspunsului server-ului.

```javascript
io.origins((origin, callback) => {
  if (origin !== 'https://foo.example.com') {
    return callback('origin not allowed', false);
  }
  callback(null, true);
});
```

Această funcție va fi executată pentru fiecare request. Din acest motiv, va trebui ținută la un minimum. Atunci când nu poți identifica sursa, valoarea pentru aceasta va fi `*`. În cazul utilizării cu Express.js, headerele CORS vor fi afectate doar pentru cererile `socket.io`. Pentru Express.js, se va folosi middleware-ul `cors`.

### Metoda `server.attach(httpServer[, options])`

Această metodă permite atașarea unui server la o instanță socket.io și modelează funcționarea prin pasarea unui obiect de opțiuni.

### Metoda `server.attach(port[, options])`

Această metodă menționează un port pe care instanța de socket.io să asculte. Metoda atașează un `Server` la o instanță de `engine.io` pe un server `http.Server`. Similar poți folosi metoda `listen(httpServer[, options])`.

### Metoda `server.listen(httpServer[, options])`

Este o metodă sinonim `server.attach(httpServer[, options])`.

### Metoda `server.bind(engine)`

Primește ca prim argument un engine de tip `engine.Server`. Returnează un `Server`.
Metoda face o legătură către un anumit `Server` server.io sau un API compatibil.

### Metoda `server.onconnection(socket)`

Metoda primește ca prim argument un engine de tip `engine.Server`. Returnează un `Server`.
Metoda creează un nou client `soket.io` din `engine.io` sau alt API compatibil cu `Socket`.

### Metoda `server.of(nsp)`

Această metodă este folosită pentru a crea namespace-uri, adică adrese diferite care folosesc aceeași conexiune. Important este faptul că namespace-ul poate fi un șir de caractere, o expresie regulată sau chiar o funcție.

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

### Metoda `server.close([callback])`

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

### Metoda `server.engine.generateId`

Această metodă va genera un id de socket particularizat. Metoda va fi apelată cu un obiect `request` ca prim parametru.

```javascript
io.engine.generateId = (req) => {
  return "custom:id:" + custom_id++; // custom id trebuie să fie unic
}
```

### Metoda `server.on()`

Serverul odată instanțiat poate interacționa prin gestionarea evenimentelor la care răspunde prin callback-uri.

```javascript
io.on('connect', function (socket) {});
```

Ascultarea conexiunii pentru a gestiona pachetele care sosesc se face prin atașarea unui callback care va răspunde procesând datele primite și eventual trimițând un răspuns. Obiectul `socket` primit de callback reprezintă clientul conectat. Lui îi vom putea atașa un eveniment prin care îi vom comunica date.

```javascript
io.on('connect', function (socket) {
  socket.emit('request', 'o valoare'); // trimitem date spre client
  socket.on('reply', function (date) { // primim date ascultând un eveniment
    // prelucrarea datelor primite
  });
});
```

Numele evenimentelor prezentate nu trebuie să fie identice cu cele specificate în documentație. Numele acestora, cu excepția celor specifice API-ului, poate fi orice șir de caractere.

În cazul în care dorești să comunici deodată tuturor celor conectați, va trebui să se apeleze un `emit` pe obiectul server.

```javascript
io.on('connect', function (socket) {
  socket.emit('request', 'o valoare'); // trimitem date spre client
  io.emit('broadcast', 'valoare');     // va fi trimis tuturor celor conectați același mesaj
  socket.on('reply', function (date) { // primim date ascultând un eveniment
    // prelucrarea datelor primite
  });
});
```

### Metoda `server.path([value])`

Metoda path acceptă drept argument un șir de caractere, care va crea calea menționată prin care vor fi servite fișiere și `engine.io`-ul. Valoarea din oficiu este `/socket.io`.

```javascript
const io = require('socket.io')();
io.path('/cale');

// client-side
const socket = io({
  path: '/cale'
});
```

## Răspunsuri de confirmare

Uneori, atunci când trimiți mesaje, ai nevoie de confirmări privind starea acestora.

```javascript
var io = require('socket.io')(80);

io.on('connection', function (socket) {
  socket.on('ferret', function (name, word, fn) {
    fn(name + ' says ' + word);
  });
});
// client
var socket = io(); // TIP: io() with no args does auto-discovery
  socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
    socket.emit('ferret', 'tobi', 'woot', function (data) { // args are sent in order to acknowledgement function
      console.log(data); // data will be 'tobi says woot'
    });
  });
```

## Evidența socket-urilor conectate

Există scenarii în care se dovedește util să constitui un array cu toate socket-urile care s-au conectat la server.

```javascript
var io = require('socket.io')(https), sockets = [];
io.on('connection', function(socket){
    sockets.push(socket); // hidratăm array-ul
    // tratarea deconectării
    socket.on('disconnect', function(){
        for(let i = 0; i < socket.length; i++){
            if(sockets[i].id === socket.id){
                sockets.splice(i, 1);
            }
        }
        console.log(`Socket ${socket.id} s-a deconectat`);
    });
});
```

Socket.io oferă chiar o metodă care generează un array a socketurilor conectate. Pentru a se gestiona socketurile conectate, există o metodă `clients` pe care o putem folosi pentru un namespace specificat.

```javascript
var io = require('socket.io')(https);
io.of('/admin').clients( (error, clients) => {
    if (error) throw error;
    console.log(clients); // este un array cu toți cei conectați
});
```

Poți obține și clienții conectați într-un room.

```javascript
io.of('/admin').in('general').clients((error, clients) => {
  if (error) throw error;
  console.log(clients); // un array al clienților
});
```

Pentru a obține o colecție cu toți clienții conectați pe rădăcină `/`, pur și simplu aplici metoda `clients` pe server direct.

```javascript
io.clients((error, clients) => {
    console.log(clients); // un array cu toți cei conectați pe rădăcină.
});
```

## Fanioane speciale pentru server

### `volatile`

Setează un modificator pentru un `emit` care urmează, dar pentru care datele ar putea fi pierdute din cauza pierderii legăturii cu, clientul.

```javascript
io.volatile.emit('uneveniment', {"date": "ceva"});
```

### `binary`

Specifică dacă sunt așteptate date binare în cele care vor fi emise. Atunci când acest eveniment este emis, crește performanța. Valoarea este boolean.

```javascript
io.binary(false).emit('eveniment');
```

### `local`

Setează un modificator pentru un `emit` care urmează. Datele vor fi emise doar pe nodul curent (folosit când se utilizează Redis, de exemplu).

```javascript
io.local.emit('eveniment', {"ceva":"date"});
```

## Evenimentele unui socket

Obiectului `socket`, i se pot adăuga funcții receptor (*listeners*) pentru următoarele evenimente care pot apărea.

### `connect`

Este un eveniment declanșat când clientul se conectează cu succes la un server sau se reconectează.

Callback-urile care vor fi executate ca urmare a evenimentului `connect` trebuie declarate în afară pentru a nu fi redeclarate ori de câte ori clientul se reconectează.

```javascript
// Server
io.on('connect', (socket) => {
    // ZONA PRIVATĂ CLIENT - CONTACT PE ID
    socket.on(socket.id, (data) => {
        console.log(data);
        // Pas1. Require un modul care să ofere o funcție de autentificare
    });
    socket.emit(socket.client.id, 'Cam greu, boss');
});


// Client
function connectHandler () {
  // trimite token, dacă acesta deja există!
  if (localStorage.jwt) {
    socket.emit(socket.id, {
      token: localStorage.jwt
    });
  }

  login(); // trimite datele formularului la server pentru autentificare
  socket.on(socket.id, (data) => {
    console.log(data);

  });
}
socket.on('connect', connectHandler);

function login () {
  // capturează valorile
  var email = document.getElementById('email').value;
  var password = document.getElementById('passwd').value;
  var obiLogin = {
    email: email,
    password: password
  }
  $('#loginfrm').modal('hide');
  socket.emit(socket.id, obiLogin);
}
```

### `close`

Se atașează o funcție receptor pentru eventualitatea în care un utilizator se va deconecta de la server. Funcția receptor poate avea următoarele argumente:

- un șir de caractere (`String`) care să aducă lămuriri asupra cauzei deconectării;
- un obiect descriptiv, care poate fi pasat opțional.

### `message`

La apariția unui astfel de eveniment, înseamnă că serverul tocmai a primit un mesaj de la client și receptorul este apelat cu un argument care poate fi:

- un `String` care este Unicode
- un `Buffer`, fiind un conținut binar.

### `error`

Declanșează un receptor atunci când a fost semnalată o stare de eroare. Receptorul primește un obiect `Error`.

### `flush`

Acest eveniment declanșează un receptor pentru a curăța `write buffer`-ul. Receptorul rpimește chiar bufferul care trebuie curățat.

### `drain`

Este un eveniment care semnalează golirea buffer-ului.

### `packet`

Acest eveniment va apărea în cazul în care un socket a primit un pachet, fie acesta un `message` sau un `ping`. Argumentele pe care funcția receptor le poate primi sunt:

- `type`, care indică tipul pachetului primit și
- `data`, fiind un pachet de date dacă tipul este un `message`.

### `packetCreate`

Acest eveniment va apela callbackul înainte ca socket să trimită un pachet. Argumentele pe care funcția receptor le poate primi sunt:

- `type`, care indică tipul pachetului primit și
- `data`, fiind un pachet de date dacă tipul este un `message`.
