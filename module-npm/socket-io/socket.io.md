# Socket.io

Socket.io este o bibliotecă de cod care permite comunicare bidirecțională în timp real între clienți și un server. Un avantaj este faptul că se vor realiza conexiuni indiferent de layer-ele interpuse (proxy-uri, load balance-re, etc). Reconectarea clientului se va face automat. Pentru interacțiunea cu toți clienții care se conectează, se utilizează clasa `Socket`. Nivelul de transport este asigurat prin XHR/JSONP și acolo unde este disponibil se va folosi WebSocket. Socket.IO nu este o implementare de WebSocket. Socket.io atașează informații suplimentare fiecărui pachet (tip pachet și namespace, ack id) și din acest motiv nu se poate conecta la servere WebSocket.

Este posibilă și comunicare a datelor în format binar. Din browser datele pot fi emise ca `ArrayBuffer` sau `Blob`, iar din NodeJS ca `ArrayBuffer` și `Buffer`.
Pentru a separa canalele de comunicare, `Socket.io` permite realizarea de spații separate în funcție de modelul de comunicare sau separația resurselor. Aceste spații sunt numite *namespaces*, acestea comportându-se ca niște canale separate de comunicare. Aceste canale separate, vor folosi aceeași conexiune creată.

În fiecare Namespace, poți crea zone diferite numite rooms (canale arbitrare). Expunerea serverului se face pur și simplu prin cererea modului `socket.io`. Va fi returnat un constructor, care acceptă un argument. Acesta este un server HTTP.

```javascript
var io = require('socket.io')();
// sau
const Server = require('socket.io');
const io = new Server();
```

Clientul se va conecta la server pentru că acesta este expus pe server pe calea `/socket.io/socket.io.js`; `<script src="/socket.io/socket.io.js"></script>`. Același script de conectare, poate fi adus de la `https://cdnjs.com/libraries/socket.io`. Pentru a fi folosit cu Browserify și Webpack, se va instala pachetul de client: `npm install --save socket.io-client`.

To clientul va trebui ca în scriptul principal pe care îl va încărca în pagină, să inițieze comunicarea cu serverul creând o instanță: `var socket = io()`. Dacă invoci obiectul fără niciun argument, descoperirea serverului din backend se va face automat.

## Instanțierea constructorul 

Socket-ul are nevoie să se atașeze la un server `http` pentru a funcționa așa cum este cel pe care-l oferă NodeJS din oficiu `httpServer`. Pe lângă serverul HTTP, constructorul `Socket.io` acceptă suplimentar și un obiect cu opțiuni de configurare.

```javascript
var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server, {opțiune: valoare});
```

Opțiuni de configurare posibile:

| Nume opțiune | Valoare | Descriere |
|:-- |:-- |:-- |
| `path` | `/socket.io` | calea pe care se va face captura datagramelor |
| `serveClient` | `true` | indică dacă vor fi servite fișierele corespondente clientului |
| `adapter` | | Indică care `Adapter` trebuie folosit. Cel folosit din oficiu este unul bazat pe folosirea memoriei. Vezi [socket.io-adapter](https://github.com/socketio/socket.io-adapter) |
| `origins` | `*` | originile permise de unde se acceptă datagramele |
| `parser` | | Este parserul folosit. Socket.io oferă un `Parser` din oficiu. vezi [socket.io-parser](https://github.com/socketio/socket.io-parser)|

Modele de atașare a serverului și opțiunilor.

```javascript
const io = require('socket.io')({
  path: '/test',
  serveClient: false,
});

// fie
const server = require('http').createServer();

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

server.listen(3000);

// sau
io.attach(3000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
```

## Proprietăți și metode ale obiectului

Odată instanțiat obiectul server, acesta expune câteva proprietăți și metode.

### Proprietatea `on`

Serverul odată instanțiat poate interacționa prin gestionarea evenimentelor la care răspunde prin callback-uri.

```javascript
ion.on('connect', function (socket) {});
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

### Proprietatea `of`

Această proprietate este folosită pentru a crea namespace-uri, adică niște benzi de circulația a pachetelor care se pot diferenția chiar dacă folosesc aceeași conexiune.

### Proprietatea `sockets`

Acesta este un alias pentru namespace-ul rădăcină: `/`.

```javascript
io.sockets.emit('salutare', 'toată lumea');
// fix echivalent cu
io.of('/').emit('salutare', 'toată lumea');
```

### Metoda `serveClient([value])`

Argumentul acceptat este o valoare `Boolean`. Dacă valoarea returnată este `true`, serverul atașat va servi fișierele către client.

```javascript
// pass a server and the `serveClient` option
const io = require('socket.io')(http, { serveClient: false });

// or pass no server and then you can call the method
const io = require('socket.io')();
io.serveClient(false);
io.attach(http);
```

### Metoda `path([value])`

Metoda path acceptă drept argument un șir de caractere, care va crea calea menționată prin care vor fi servite fișiere și `engine.io`-ul. Valoarea din oficiu este `/socket.io`.

```javascript
const io = require('socket.io')();
io.path('/myownpath');

// client-side
const socket = io({
  path: '/myownpath'
});
```

### Metoda `adapter([value])`

Indică prin valoarea dată ce adaptor este nevoie în cazul în care intenționezi să folosești `socket.io` cu servicii externe. Exemplul manualului este un server [Redis](https://github.com/socketio/socket.io-redis). Valoarea din oficiu indică folosirea memoriei mașinii pe care rulează serverul. Dacă nu este introdus niciun argument, metoda returnează adaptorul în uz curent.

```javascript
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'localhost', port: 6379 }));

io.emit('hello', 'to all clients');
io.to('room42').emit('hello', "to all clients in 'room42' room");

io.on('connection', (socket) => {
  socket.broadcast.emit('hello', 'to all clients except sender');
  socket.to('room42').emit('hello', "to all clients in 'room42' room except sender");
});
```

Rulând `socket.io` cu adaptorul de Redis, vei putea folosi multiple instanțe `socket.io` pe procede și servere diferite. Acestea vor putea să emită evenimente unele altora. Broadcastul va fi asigurat către clienți prin mecanismul Pub/Sub al Redis-ului.

### Metoda `origins([value])`

Această metodă poate seta originile pachetelor. Dacă nu primește un argument, va returna valoarea curentă.

```javascript
io.origins(['https://foo.example.com:443']);
```

## Multiplexare

Socket.io oferă posibilitatea utilizării unei singure conexiuni pentru mai multe Namespace-uri. Fiecare pachet aparține unui namespace. Un namespace este identificat cu o cale reprezentată astfel `/cale`. Totuși, indiferent de faptul că un client va alege să folosească diferite namespace-uri, prima conectare se va face întotdeauna la namespace-ul `/`. Dacă pentru un namespace serverul răspunde cu un pachet `CONNECT`, calea multiplexată trebuie să fie considerată conectată.

```javascript
var io = require('socket.io')(80);
var chat = io.of('/chat').on('connection', function (socket) {
    socket.emit('mesaj', 'ceva ce doar /chat va primi');
    chat.emit('mesaj', 'ceva primit de toți participanții din /chat');
});
var news = io.of('/news').on('connection', function (socket) {
    socket.emit('mesaj', 'ceva trimis pe /news');
});
// în client
var chat = io.connect('http://localhost/chat'),
    news = io.connect('http://localhost/news');

chat.on('connect', function () {
  chat.emit('ceva pe chat');
});

news.on('news', function () {
  news.emit('O nouă știre');
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

## Emiterea pe toate socketurile

Se comportă ca un alias pentru namespace-ul din oficiu `/`.

```javascript
io.sockets.emit('hi', 'everyone');
// echivalent cu
io.of('/').emit('hi', 'everyone');
```

## Broadcasting

Dacă atașezi un fanion `broadcasting` proprietății `emit` sau `send`, vei putea trimite mesaje tuturor mai puțin ție, cel care face broadcastingul.

```javascript
// pe server
io.on('connection', function (socket) {
  socket.broadcast.emit('Fraților, s-a conectat ' + socket.id);
});
```

## Resurse statice clienților

Socket.io stabilește automat o legăură cu agentul utilizatorului căruia îi sunt trimise automat resurse de către serverul Socket.io. Directorul stabilit din oficiu pentru a servi resursele de conectare clientului este `/socket.io`. Poți schimba această valoare la una preferată, dacă acest lucru este necesar.

```javascript
const io = require('socket.io')();
io.path('/myownpath');

// client-side
const socket = io({
  path: '/myownpath'
});
```

## Namespace-uri

Namespace-urile reprezintă seturi de socketuri conectate ca o zonă identificabilă distinct, care este specificată de numele unei căi. Această cale identifică namespace-ul. Orice client se va conecta automat la rădăcină (`/` - namespace-ul principal) și abia după aceea la alte namespace-uri. Indiferent de namespace-urile la care se conectează, toți clienții vor folosi aceeași conexiune. Nu se va genera o conexiune separată pentru fiecare namespace în parte. Namespace-urile pot fi considerate endpoint-uri sau rute.

Namespace-ul din oficiu este `/`, care este identificat prin `io.sockets` sau pur și simplu `io` (formă prescurtată acceptată). Toate mesajele emise pe aceste canale vor ajunge la toți clienții conectați la serverul de socketuri.

```javascript
io.sockets.emit('general', 'Mesaj tuturor');
io.emit('general', 'Mesaj tuturor');
```

Fiecare namespace emite un eveniment numit `connection` care primește instanța `socket` drept parametru.

```javascript
io.on('connection', function(socket){
  socket.on('disconnect', function(){ });
});
```

### Crearea de namespace-uri

În acest scop, serverul Socket.io pune la dispoziție metoda `of`. Metoda `of` poate crea un spațiu separat în canalul de comunicații.

```javascript
var adminNsp = io.of('/admin');
adminNsp.on('connection', function (socket) {
    console.log('S-a conectat cineva');    
});
nsp.emit('general', 'salut');
// client
var asminNsp = io('/admin');
```

Modul în care se creează namespace-urile poate conduce la concluzia eronată că acestea ar fi căi ale URL-ului. URL-urile nu sunt influiențate, singurul în cazul lui `Socket.io` fiind `/socket.io/`, pe care se accesează componenta clientului.

### Crearea de rooms (camere)

Pentru fiecare namespace pot fi definite canale pe care socket-ul poate face un `join` (se alătură) sau `leave` (părăsește).
Poți *intra* într-un room (*cameră*).

```javascript
socket.on('connection', function (socket) {
    socket.join('nume_room');
});
```

Din moment ce ești într-o cameră, pentru a face broadcasting sau pentru a emite, se pot folosi interșanjabil metodele `to` și `in`.

```javascript
io.to('nume_room').emit('nume_eveniment', 'date');
```

Pentru a părăsi un canal, se folosește metoda `leave` la fel cum ai folosit `join`.

> Fiecare `Socket` al lui Socket.IO este identificat printr-un identificator unic generat aleator `Socket#id`. Pentru a simplifica lucrurile, toate socketurile se conectează la o cameră identificată prin acest identificator unic. Acest lucru permite broadcast-ul de mesaje pe toate socketurile conectate.

```javascript
io.on('connect', function (socket) {
    socket.on('nume_eveniment', function (id, msg) {
        socket.broadcast.to(id).emit('un mesaj', msg);
    });
});
```

Pentru a emite un eveniment tuturor clienților conectați, se va folosi metoda `emit`.

```javascript
var io = require('socket.io')();
io.emit('salutare toata lumea'); // acest mesaj va aparea tuturor celor conectați

const admin = io.of('/admin');
admin.emit('Salutare tuturor administratorilor');
```

Atunci când se emite dintr-un namespace, nu se vor putea primi confirmări (*acknowledgements*).

## Evidența clienților

Pentru a obține o metodă de a se ține evidența clienților conectați. Fiecare client are un id. Pentru a se gestiona clienții, există o metodă `clients` pe care o putem folosi pentru un namespace specificat.

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

## Evenimente predefinite

### connect

Acest eveniment apare instantaneu la momentul conectării unui client.

```javascript
io.on('connect', (socket) => {
  // ...
});

io.of('/admin').on('connect', (socket) => {
  // ...
});
```

La fiecare conectare a clientului indiferent de motiv, va fi generat un id unic diferit.

### connection

Este sinonim evenimentului `connect`.

## Fanioane speciale pe socket.io

### volatile

Setează un modificator pentru un `emit` care urmează, dar pentru care datele ar putea fi pierdute din cauza pierderii legăturii cu, clientul.

```javascript
io.volatile.emit('uneveniment', {"date": "ceva"});
```

### binary

Specifică dacă sunt așteptate date binare în cele care vor fi emise. Atunci când acest eveniment este emis, crește performanța. Valoarea este boolean.

```javascript
io.binary(false).emit('eveniment);
```

### local

Setează un modificator pentru un `emit` care urmează. Datele vor fi emise doar pe nodul curent (folosit când se utilizează Redis, de exemplu).

```javascript
io.local.emit('eveniment', {"ceva":"date"});
```

## Obiectul socket

Este utilizat de Socket.io pentru a gestiona clienții care se conectează și trebuie înțeles ca o reprezentare a clientului. Un `socket` ține de un anumit `namespace`, iar cel din oficiu este `/`. Pentru a asigura comunicarea, clasa `Socket` folosește o subclasă numită `Client`. Această clasă nu interacționează cu socket-urile TCP/IP.

Clasa `Socket` moștenește de la `EventEmiter`, suprascrie metoda `emit`, dar nu modifică restul metodelor `EventEmiter`. Toate metodele sunt ale lui `EventEmiter`.

### Proprietățile lui socket

#### socket.id

Acesta este un identificator al sesiunii de comunicare deschisă. Această informație vine din subclasa `Client`.

#### socket.rooms

Acesta este un obiect care ține evidența camerelor (*rooms*) în care se află clientul.

```javascript
io.on('connection', (socket) => {
    socket.join('camera 007', () => {
        let rooms = Object.keys(socket.rooms);
        console.log(rooms);       
    });
});
```

#### socket.client

Aceasta este o referință către obiectul `Client`.

#### socket.conn

Este o referință către conexiunea `Client` (obiectul `Socket` a lui `engine.io`). Acesta permite accesul direct la nivelul de transport IO, care în mare parte abstractizează socketul TCP/IP real.

#### socket.request

Este un getter cu model de funcționare al unui proxy, care returnează o referință către obiectul `request`, care vine chiar de la subclasa `Client`. Este foarte util pentru a accesa headerele unei cereri cum ar fi `Cookie` sau `User-Agent`.

#### socket.handshake

Oferă detaliile handshake-ului printr-un obiect.

```javascript
io.use((socket, next) => {
    let handshake = socket.handshake;
    // fă ceva cu datele.
});
io.on('connection', (socket) => {
    let handshake = socket.handshake;
});
/*
{
  headers: /* the headers sent as part of the handshake */,
  time: /* the date of creation (as string) */,
  address: /* the ip of the client */,
  xdomain: /* whether the connection is cross-domain */,
  secure: /* whether the connection is secure */,
  issued: /* the date of creation (as unix timestamp) */,
  url: /* the request URL string */,
  query: /* the query object */
}
*/
```

#### socket.use(fn)

În anumite scenarii este nevoie de folosirea unui middleware de fiecare dată când se primește un mesaj. În acest scop se va folosi metoda `use` care va primi drept callback o funcție ce primește drept parametri socketul și o funcție pentru a deferi execuția următorului middleware.

```javascript
io.use(function (socket, next) {
    if (socket.request.headers.cookie) return next();
    next(new Error('Authentication error'));
});
```

Funcția pasată trebuie considerată un middleware. Această funcție este executată pentru fiecare `Packet` sosit. Funcția primește drept parametru pachetul sosit și o funcție care trimite execuția următorului middleware. Erorile care ar putea apărea sunt trimise următorului middleware, dar și clientului ca pachete `error`.

```javascript
io.on('connection', (socket) => {
    socket.use((packet, next) => {
        if (packet.ceva === true) return next();
        next(new Error('A ieșit prost'));
    });
});
```

#### socket.send([...args][, ack])

Trimite un eveniment `message`.

#### socket.emit(eventName[,..args][,ack])

Această metodă suprascrie `EventEmitter.emit` și returnează un obiect `socket`. Metoda emite un eveniment în `socket`ul identificat de nume.

```javascript
socket.emit('hello', 'world');
socket.emit('with-binary', 1, '2', { 3: '4', 5: new Buffer(6) });
```

#### socket.server

### Evenimentele unui socket

Obiectului `socket`, i se pot adăuga funcții receptor (*listeners*) pentru următoarele evenimente care pot apărea.

#### close

Se atașează o funcție receptor pentru eventualitatea în care un utilizator se va deconecta de la server. Funcția receptor poate avea următoarele argumente:

- un șir de caractere (`String`) care să aducă lămuriri asupra cauzei deconectării;
- un obiect descriptiv, care poate fi pasat opțional.

#### message

La apariția unui astfel de eveniment, înseamnă că serverul tocmai a primit un mesaj de la client și receptorul este apelat cu un argument care poate fi:

- un `String` care este Unicode
- un `Buffer`, fiind un conținut binar.

#### error

Declanșează un receptor atunci când a fost semnalată o stare de eroare. Receptorul primește un obiect `Error`.

#### flush

Acest eveniment declanșează un receptor pentru a curăța `write buffer`-ul. Receptorul rpimește chiar bufferul care trebuie curățat.

#### drain

Este un eveniment care semnalează golirea buffer-ului.

#### packet

Acest eveniment va apărea în cazul în care un socket a primit un pachet, fie acesta un `message` sau un `ping`. Argumentele pe care funcția receptor le poate primi sunt:

- `type`, care indică tipul pachetului primit și
- `data`, fiind un pachet de date dacă tipul este un `message`.

#### packetCreate

Acest eveniment va apela callbackul înainte ca socket să trimită un pachet. Argumentele pe care funcția receptor le poate primi sunt:

- `type`, care indică tipul pachetului primit și
- `data`, fiind un pachet de date dacă tipul este un `message`.
