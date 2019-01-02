# Socket.io

Socket.io este o bibliotecă de cod care permite comunicare bidirecțională în timp real între clienți și un server. Un avantaj este faptul că se vor realiza conexiuni indiferent de layere-le interpuse(proxy-uri, load balance-re). Autoreconectarea clientului să va face automat.

Este posibilă și comunicare la nivel binar. Din browser datele pot fi emise ca `ArrayBuffer` sau `Blob`, iar din NodeJS ca `ArrayBuffer` și `Buffer`.
Pentru a separa canalele de comunicare, Socket.io permite realizarea de spații separate în funcție de modelul de comunicare sau separația resurselor. Aceste spații sunt numite *namespaces*, acestea comportându-se ca niște canale separate de comunicare. Aceste canale separate, vor folosi aceeași conexiune creată.

În fiecare Namespace, poți crea zone diferite numite rooms (canale arbitrare).

Expunerea serverului se face pur și simplu prin cerere.

```javascript
var io = require('socket.io')();
// sau
const Server = require('socket.io');
const io = new Server();
```

Socket-ul are nevoie să se atașeze la un server http pentru a funcționa așa cum este cel pe care-l oferă NodeJS din oficiu `httpServer`. Pe lângă serverul HTTP, Socket.io acceptă și un obiect cu opțiuni de configurare.

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

// either
const server = require('http').createServer();

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

server.listen(3000);

// or
io.attach(3000, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});
```

## Multiplexare

Socket.io oferă posibilitatea utilizării unei singure conexiuni pentru mai multe Namespace-uri.

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

## Resurse statice clienților

Socket.io stabilește automat o legăură cu agentul utilizatorului căruia îi sunt trimise automat resurse de către serverul Socket.io. Directorul stabilit din oficiu pentur a servi resursele de conectare clientului este `/socket.io`. Poți schimba această valoare la una preferată, dacă acest lucru este necesar.

```javascript
const io = require('socket.io')();
io.path('/myownpath');

// client-side
const socket = io({
  path: '/myownpath'
});
```

## Namespace-uri

Namespace-urile reprezintă seturi de socketuri conectate ca o zonă identificabilă distinct, care este specificată de numele unei căi. Această cale identifică namespace-ul. Orice client se va conecta automat la rădăcină (`/` - namespace-ul principal) și abia după aceea la alte namespece-uri. Indiferent de namespace-urile la care se conectează, toți clienții vor folosi aceeași conexiune. Nu se va genera o conexiune separată pentru fiecare namespace în parte. Namespace-urile pot fi considerate endpoint-uri sau căi.

Namespace-ul din oficiu este `/`, care este identificat prin `io.sockets` sau pur și simplu `io` (formă prescurtată acceptată). Toate mesajele emise pe aceste canale vor ajunge la toți clienții conectați la serverul de socketuri.

```javascript
io.sockets.emit('general', 'Mesaj tuturor');
io.emit('general', 'Mesaj tuturor');
```

Fiecare namespace emite un eveniment numit `connection` care primește instanța `Socket` drept parametru.

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

## Folosirea middleware-ului

În anumite scenarii este nevoie de folosirea unui middleware de fiecare dată când se primește un mesaj. În acest scop se va folosi metoda `use` care va primi drept callback o funcție ce primește drept parametri socketul și o funcție pentru a deferi execuția următorului middleware.

```javascript
io.use(function (socket, next) {
    if (socket.request.headers.cookie) return next();
    next(new Error('Authentication error'));
});
```