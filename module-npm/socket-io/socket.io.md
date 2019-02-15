# Socket.io

## 1. Introducere

Socket.io este o bibliotecă de cod care permite comunicare bidirecțională în timp real între clienți și un server. Un avantaj este faptul că se vor realiza conexiuni indiferent de layer-ele interpuse (proxy-uri, load balance-re, etc). Reconectarea clientului se va face automat. Socket.io folosește în subsidiar `engine.io` care este un protocol de comunicare ce va folosi tehnologii de conectare care să asigure o legătură strabilă indiferent de tehnologiile interpuse între client și server. 

Pentru interacțiunea cu toți clienții care se conectează, se utilizează clasa `Socket`. Nivelul de transport este asigurat prin XHR/JSONP (numit și long-polling) și acolo unde este posibil, se va folosi WebSocket, dacă legătura stabilită permite. Socket.IO nu este o implementare de WebSocket. Socket.io atașează informații suplimentare fiecărui pachet (tip pachet și namespace, ack id) și din acest motiv nu se poate conecta la servere WebSocket.

Un client care a reușit să facă o conexiune, va sta conectat pe termen nedefinit, iar atunci când serverul nu mai este disponibil, va încerca să se conecteze fără a se deconecta.

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

1.1 Universul socket-io

![Socket.io dependency graph](/media/nicolaie/DATA/DEVELOPMENT/JAVASCRIPT/Node-invat-eu-inveti-tu/module-npm/socket-io/dependencies.jpg "Universul socket-io")

## 2. Instanțierea obiectului server

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

### 2.1. Proprietăți și metode ale obiectului `io` (server)

Odată instanțiat obiectul server, acesta expune câteva proprietăți și metode.

#### 2.1.1. Proprietatea `on`

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

#### 2.1.2. Metoda `of(nsp)`

Această metodă este folosită pentru a crea namespace-uri, adică adrese diferite care folosesc aceeași conexiune. Important este faptul că namespace-ul poate fi un șir de caractere, o expresie regulată sau chiar o funcție.

```javascript
const adminNamespace = io.of('/admin');
```

Metoda va returna un namespace.

#### 2.1.3. Proprietatea `sockets`

Acesta este un alias pentru namespace-ul rădăcină: `/`.

```javascript
io.sockets.emit('salutare', 'toată lumea');
// fix echivalent cu
io.of('/').emit('salutare', 'toată lumea');
```

#### 2.1.4. Metoda `serveClient([value])`

Argumentul acceptat este o valoare `Boolean`. Dacă valoarea returnată este `true`, serverul atașat va servi fișierele către client.

```javascript
// pass a server and the `serveClient` option
const io = require('socket.io')(http, { serveClient: false });

// or pass no server and then you can call the method
const io = require('socket.io')();
io.serveClient(false);
io.attach(http);
```

#### 2.1.5. Metoda `path([value])`

Metoda path acceptă drept argument un șir de caractere, care va crea calea menționată prin care vor fi servite fișiere și `engine.io`-ul. Valoarea din oficiu este `/socket.io`.

```javascript
const io = require('socket.io')();
io.path('/myownpath');

// client-side
const socket = io({
  path: '/myownpath'
});
```

#### 2.1.6. Metoda `adapter([value])`

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

Rulând `socket.io` cu adaptorul de Redis, vei putea folosi multiple instanțe `socket.io` pe procese și servere diferite. Acestea vor putea să emită evenimente unele altora. Broadcastul va fi asigurat către clienți prin mecanismul Pub/Sub al Redis-ului.

#### 2.1.7. Metoda `origins([value])`

Această metodă poate seta originile pachetelor. Dacă nu primește un argument, va returna valoarea curentă.

```javascript
io.origins(['https://foo.example.com:443']);
```

#### 2.1.8. Metoda `origins(fn)`

Primește drept argument o funcție, care la rândul ei are două argumente. Funcția returnează obiectul server. Argumentele acestei metode pot fi:

- un șir de caractere, care indică originea și
- callback-ul, care are drept argumente un obiect de eroare și unul de succes.

Cât privește callback-ul, cel de-aul doilea argument va fi o valoare `Boolean`, care indică dacă de pe originea indicată se pot primi pachete. Dacă valoarea este `false`, trebuie introdusă o valoare string drept valoare pentru eroare, care va fi adăugată răspunsului server-ului.

```javascript
io.origins((origin, callback) => {
  if (origin !== 'https://foo.example.com') {
    return callback('origin not allowed', false);
  }
  callback(null, true);
});
```

Această funcție va fi executată pentru fiecare request. Din acest motiv, va trebui ținută la un minimum. Atunci când nu poți identifica sursa, valoarea pentru aceasta va fi `*`. În cazul utilizării cu framework-ul Express, headerele CORS vor fi afectate doar pentru cererile `socket.io`. Pentru Express, se va folosi modulul `cors`.

#### 2.1.9. Metoda `attach(httpServer[, options])`

Argumentul `httpServer` este cel la care va fi atașată instanța socket.io. Pot fi introduse opțiuni de configurare a serverului.

#### 2.1.10. Metoda `attach(port[, options])`

Menționează portul pe care va rula instanța de socket atașată unui server http. Similar poți folosi metoda `listen(httpServer[, options])`.

#### 2.1.11. Metoda `bind(engine)`

Metoda returnează obiectul server după ce l-a legat de o anume versiune de server `socket.io`.

#### 2.1.12. Metoda `onconnection(socket)`

Metoda returnează serverul după ce a creat un nou client `socket.io` de la instanța de `Socket` reprezentând `engine.io`.

## 3. Răspunsuri de confirmare

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

## 4. Emiterea pe toate socketurile

Se comportă ca un alias pentru namespace-ul din oficiu `/`.

```javascript
io.sockets.emit('hi', 'everyone');
// echivalent cu
io.of('/').emit('hi', 'everyone');
```

## 5. Broadcasting

Dacă atașezi un fanion `broadcasting` proprietății `emit` sau `send`, vei putea trimite mesaje tuturor mai puțin ție, cel care face broadcastingul.

```javascript
// pe server
io.on('connection', function (socket) {
  socket.broadcast.emit('Fraților, s-a conectat ' + socket.id);
});
```

## 6. Resurse statice clienților

Socket.io stabilește automat o legătură cu agentul utilizatorului căruia îi sunt trimise automat resurse de către serverul Socket.io. Directorul stabilit din oficiu pentru a servi resursele de conectare clientului este `/socket.io`. Poți schimba această valoare la una preferată, dacă acest lucru este necesar.

```javascript
const io = require('socket.io')();
io.path('/myownpath');

// client-side
const socket = io({
  path: '/myownpath'
});
```

## 7. Ce este un socket

Un `socket` este un obiect instanțiat în baza clasei [`Socket`](https://socket.io/docs/server-api/#Socket), care are rolul să comunice cu browserul clientului. De la bun început, socket-urile aparțin namespace-ului general `/`. Un obiect `socket` nu folosește direct TCP/IP sockets. Acest obiect creat pe baza clasei `Socket` moștenește din clasa `EventEmitter` din Node.js, ceea ce îl transformă într-un obiect care poate emite și reacționa la evenimente. Documentația aduce mențiunea că această clasă suprascrie metoda `emit` a clasei `EventEmitter`, dar restul este păstrat intact.

```javascript
// server side
io.on('connection', function(socket){
  socket.on('salutări', function(){ });
});
```

În fragmentul de cod de mai sus, obiectul `socket` pasat callback-ului este un obiect care aparține serverului socket.io din server. Clientul va genera și el pe partea sa un obiect `socket`, dar acesta nu este cel de pe server. Sunt două planuri diferite, care trebuie înțelese distinct în ceea ce privește acest obiect.

```javascript
socket.on('connection', function(socket){
    socket.emit('salutări', 'salve prietene!');
})
```



## 8. Namespace-uri / multiplexare

Namespace-urile reprezintă seturi de socketuri conectate ca o zonă identificabilă distinct, care este specificată de numele unei căi. Această cale identifică namespace-ul. Orice client se va conecta automat la rădăcină (`/` - namespace-ul principal) și abia după aceea la alte namespace-uri. 

Indiferent de namespace-urile la care se conectează, toți clienții vor folosi aceeași conexiune. Nu se va genera o conexiune separată pentru fiecare namespace în parte. Namespace-urile pot fi considerate endpoint-uri sau rute.

Un *namespace* poate fi înțeles ca adresa unei case de pe o stradă. Casa respectivă are camere. Vom vedea că poți să te alături participanților unei camere (*room*).

```javascript
const io = require('socket.io')();
io.emit('general', 'Salutare toată lumea!');
```

Instanțierea obiectului `io` pur și simplu generează namespace-ul din oficiu care este `/`,  identificat prin `io.sockets` sau pur și simplu `io` (formă prescurtată acceptată). Toate mesajele emise pe aceste canale vor ajunge la toți clienții conectați la serverul de socket-uri.

```javascript
io.sockets.emit('general', 'Mesaj tuturor');
io.emit('general', 'Mesaj tuturor');
```

Propriu-zis, `io.emit('tuturor', date)` este echivalent cu `io.of('/').emit('tuturor', date)`. Putem spune că `io.emit('tuturor', date)` este o prescurtare pentru secvența care menționează și namespace-ul.

Fiecare namespace emite un eveniment numit `connection` care primește instanța `socket` drept parametru, care reprezintă răspunsul de la client.

```javascript
io.on('connection', function(socket){
  socket.on('disconnect', function(){ });
});
```

Privind din perspectiva namespace-urilor, `io.on('connection', () => {})` este o prescurtare la varianta care menționează numele namespace-ului: `io.of('/').on(...)`. Acest amănunt trebuie reținut pentru că în momentul în care vei dori ca un client să se conecteze pe alt namespace, va trebui să creezi un listener pe acel namespace meniționându-l: `io.of('/admin').on('connect', (socket) => {})`. Ca o regulă generală, dacă nu este specificat namespace-ul, acesta va fi cel general.

În momentul în care clientul se conectează la server, automat se va declanșa evenimentul `connection`. Funcția callback cu rol de receptor, va fi executată și va primi drept parametru un obiect care reprezintă chiar clientul conectat. Acest parametru este numit prin convenție `socket`. Acest obiect este un `EventEmitter`, ceea ce permite atașarea de evenimente pentru a comunica cu browserul. Atașarea unui eveniment `connection` la server este echivalentul conectării direct la namespace-ul `/` în cazul în care nu este specificată altă cale.

Socket.io oferă posibilitatea utilizării unei singure conexiuni pentru mai multe Namespace-uri. Fiecare pachet aparține unui namespace. Un namespace este identificat cu o cale reprezentată astfel: `/cale`. Totuși, indiferent de faptul că un client va alege să folosească diferite namespace-uri, prima conectare se va face întotdeauna la namespace-ul `/`. Dacă pentru un namespace serverul răspunde cu un pachet `CONNECT`, calea multiplexată trebuie să fie considerată conectată.

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

### 8.1. Crearea de namespace-uri

Socket.io pune la dispoziție metoda `of` pentru a crea un spațiu separat în canalul de comunicații.

```javascript
var adminNsp = io.of('/admin');
adminNsp.on('connection', function (socket) {
    console.log('S-a conectat cineva');    
});
adminNsp.emit('general', 'salut');
// client
var adminNsp = io('/admin');
```

Antenție la faptul că partea de client trebuie să definească și ea conectorul pentru canalul creat pe namespace-ul nou. Acesta este specificat, adăugând calea ca argument lui `io('/calenoua')`.

**Fii avizat**! 

Comunicarea pe namespace-uri este bidirecțională. Acest lucru înseamnă că namespace-urile declarate pe server, trebuie să aibă un corespondent pe client.

```javascript
// server.js
let namespaces = []; // array-ul populat va fi exportat din modul
let adminNs   = new Namespace(0, 'admin',   '/img/admin.jpeg',   '/admin');
let creatorNs = new Namespace(1, 'creator', '/img/creator.jpeg', '/creator');
let userNs    = new Namespace(2, 'user',    '/img/users.jpeg',   '/user');

// CONSTRUCȚIE ROOMS
adminNs.addRoom(new Room(0, 'general', 'admin'));
creatorNs.addRoom(new Room(0, 'resources', 'creator'));
userNs.addRoom(new Room(0, 'chat', 'user'));

namespaces.push(adminNs, creatorNs, userNs);
io.on('connection', (socket) => {
    // trimite către client informații despre toate endpoint-urile existente
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        };
    });
    socket.emit('data', nsData); // trimite clientului datele
    // pe eventul 'data' trebuie sa asculte userul la prima conectare
});

// client
var socket     = io();          // primul contact [NECESAR]
var userNsp    = io('/user');   // se va conecta automat
var creatorNsp = io('/creator');// se va conecta automat
var adminNsp   = io('/admin');  // se va conecta automat

// imediat ce te conectezi, asculta datele specifice
socket.on('data', (nsData) => {
  // console.log(JSON.stringify(nsData));
  // AFIȘEAZĂ TOATE ROLURILE ÎN BAZA NAMESPACE-URILOR
  let namespaces = document.querySelector('.namespaces');
  namespaces.innerHTML = '';
  nsData.forEach((ns) => {
    namespaces.innerHTML += `<span class="namespace" data-ns="${ns.endpoint}"><img src="${ns.img}" />${ns.endpoint.slice(1)}</span>`;
  });

  // ATAȘEAZĂ RECEPTORI PE FIECARE ROL
  Array.from(document.getElementsByClassName('namespace')).forEach((element) => {
    // console.log(element);    
    element.addEventListener('click', (e) => {
      // console.log(e.target);
      let endpoint = element.getAttribute('data-ns');
      console.log(endpoint);      
    });
  });
});
```



Modul în care se creează namespace-urile poate conduce la concluzia eronată că acestea ar fi căi ale URL-ului. URL-urile nu sunt influiențate, singurul în cazul lui `Socket.io` fiind `/socket.io/`, pe care clientul are acces la componenta care-i permite conectarea la serves. Pentru crearea de namespace-uri, metoda `of` acceptă și regex-uri.

Dacă dorești, din namespace-ul general `/` poți trimite mesaje către namespace-uri definite, cu o singură condiție. Aceasta este ca mai întâi să se fi creat deja canalul general și clientul să se fi conectat pe el, dar și pe cel definit separat. Reține faptul că generarea canalului principal și conectarea clientului se fac într-o manieră asincronă, ceea ce conduce la concluzia că mesajul trimis din canalul principal către cel definit separt se poate face după ce s-au stabilit toate conexiunile. O concluzie foarte importantă este că un namespace poate trimite mesaje întregului namespace indiferent de ce alte sub-namespace-uri au fost create și câte *rooms* au fiecare.

### 8.2. Conectare dinamică la un namespace

După cum deja am aflat, metoda `of`, care crează namespace-urile, suplimentar unui string, acceptă drept valoare pentru parametrul care specifică calea și un regexp, și la nevoie chiar o funcție.

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

### 8.3. Crearea de rooms (camere)

Pentru fiecare namespace pot fi definite camere la care socket-ul clientului poate fi adăugat folosind metoda `join` (se alătură). Același socket client poate fi scos dintr-o cameră folosindu-se metoda `leave` (părăsește). Constituirea de camere (*rooms*) este o prerogativă a serverului. Din oficiu, clientul nu știe pe ce camere a fost adăugat pentru că acest lucru se petrece în partea de server. Logica programului de pe server în comunicare cu cea de la client va fi cea care va înștiința clientul despre camerele disponibile.

Clientul se conectează la un namespace, dar nu știe care sunt camerele disponibile. Tot ceea ce va ști este că primește mesaje unui anume namespace pentru că și el va trebui să se conecteze la acel namespace.

#### 8.3.1. Cum setezi o camera

Gestionarea accesului și ieșirii dintr-o *cameră* se face în partea de server folosind două metode: [`socket.join('nume_camera')`](https://socket.io/docs/server-api/#socket-join-room-callback) și `socket.leave('nume_camera')`. Opțional `socket.join('nume_camera', function() { //gestioneaza conectarea});` poate primi un callback util pentru a gestiona conectarea și ce se petrece cu un client care a intrat într-o cameră.

```javascript
socket.on('connection', function (socket) {
    socket.join('cam01');
    socket.to('cam01').emit('special', `${socket.id} ești membru al cam01`);
});
```

Folosind meoda `join` putem spune să introducem clientul reprezentat de obiectul `socket` în cameră.

De îndată ce un socket va fi introdus într-o cameră, poți să emiți către client ce date dorești. Poate fi un mesaj sau un `Buffer`. În momentul în care se va face `emit`-ul toți clienții care erau deja în cameră, vor afla de prezența noului venit.

Clientul nu va ști că a fost adăugat unei camere, dar va putea asculta pe un anumite eveniment.

```javascript
socket.on('special', (date) => {
    console.log(date);
})
```

Mesajele de la `socket.to('cam01')` vor fi primite doar de cei care sunt în acele camere. Mesajele prefixate cu namespace-ul, vor fi primite de la server, nu de la socket, având efectul concret că vor fi primite de toți cei conectați la server prin acea cameră inclusiv cel care a emis mesajul `io.of('/').to('cam01').emit('special')`. Când faci emit doar cu socketul, toți vor primi mesajul din cameră, dar nu și cel care-l emite.

#### 8.3.2. Conectarea la mai multe camere

Un client poate fi conectat la mai multe camere deodată. Metoda pentru a realiza acest lucru este tot [`join`](https://socket.io/docs/server-api/#socket-join-rooms-callback) cu notabila excepție că îi pasezi drept prim parametru un array în care sunt menționate toate camerele la care socketul va fi conectat.

#### 8.3.3 Comunicarea din camere

Din moment ce ești într-o cameră, pentru a face broadcasting sau pentru a emite, se pot folosi interșanjabil metodele `to` și `in`.

```javascript
socket.to('camera_albastra').emit('salutari', date);
```

Pentru a emite date către mai multe camere, vor trebui înlănțuite camerele folosind metoda `to`.

```javascript
socket.to('camera01').to('camera02').emit('salutari', date);
```

O mențiune importantă care trebuie făcută aici. În momentul în care emiți într-o cameră folosind un socket, mesajul nu va fi primit și de cel care l-a emis. Dacă dorești acest lucru, va trebui să emiți date către o cameră specificând în clar namespace-ul. În concluzie, [socket-ul nu va primi și el mesajul](https://socket.io/docs/server-api/#socket-to-room).

În cazul în care dorești să trimiți punctual un mesaj într-o cameră de oriunde te-ai afla în codul de pe server, poți să face acest lucru specificând namespace-ul.

```javascript
const io = require('socket.io')(https);
const nameSpSeparat = io.of('/separat');
nameSpSeparat.to('spatiul01').emit('salutare', date);
```

#### 8.3.4. Camera proprie și conectare socket la socket

Te poți conecta la propria cameră pentru că id-ul de socket poate fi folosit drept identificator. 

```javascript
socket.to(socket.id).emit('auth', token);
```

Același principiu poate fi folosit pentru a comunica direct socket la socket dacă cunoști id-ul altuia.

```javascript
socket.to(altSocketId).emit('unulaunu', date);
```

#### 8.3.5. Mesaje tuturor

Namespace-ul trimite mesaj tuturor indiferent dacă aparține unei camere sau nu.

```javascript
io.emit(); // mesajul ajunge la toți
// echivalent cu
io.of('/').emit();
```

Pentru a trimite tuturor participanților dintr-o cameră, prefixezi camera cu namespace-ul sub care sunt toate camerele.

```javascript
io.of('/nume_namespace').emit('tuturor', date);
```



#### 8.3.6. Cum părăsești o cameră

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



#### 8.3.7. Scenariu de conectare la o cameră și comunicare

Să presupunem că am stabilit comunicarea cu browserul clientului și că am stabilit care sunt namespace-urile și camerele lor asociate în obiecte distincte. După cum am menționat deja, clientul nu va ști la momentul conectării pe un namespace în ce cameră va fi. Dar pentru o comunicare cu interfața pe care o realizăm clientului, va trebui să comunicăm de pe server datele privind câte namespace-uri există și camerele arondate acestora. Vom porni de la premisa că avem la dispoziție un array cu obiecte care reprezintă namespace-urile construite. Aceste obiecte vor avea o proprietate care este un array de obiecte care reprezintă camerele fiecărui namespace.

```javascript
let namespaces = []; // array-ul populat va fi exportat din modul
let adminNs   = new Namespace(0, 'admin',   '/img/admin.jpeg',   '/admin');
let creatorNs = new Namespace(1, 'creator', '/img/creator.jpeg', '/creator');
let userNs    = new Namespace(2, 'user',    '/img/users.jpeg',   '/user');

// CONSTRUCȚIE ROOMS
adminNs.addRoom(new Room(0, 'general', 'admin'));
creatorNs.addRoom(new Room(0, 'resources', 'creator'));
userNs.addRoom(new Room(0, 'chat', 'user'));

namespaces.push(adminNs, creatorNs, userNs);
```

În cazul de mai sus, punctul central îl va constitui array-ul obiectelor namespace.

Următorul pas este ca din server să stabilim un prim contact pe evenimentul `connection`.

```javascript
// PRIMA CONECTARE va fi făcută pe RĂDĂCINA! (/)
io.on('connection', (socket) => {
    // trimite către client date necesare pentru fiecare endpoint.
    let nsData = namespaces.map((namespace) => {
        return {
            img:      namespace.img,
            endpoint: namespace.endpoint
        };
    });
    socket.emit('data', nsData); // trimite clientului datele
    // pe eventul 'data' trebuie sa asculte userul la prima conectare
});
```

Clientul va asculta pe evenimentul `data` pentru datele relevate.

```javascript
// imediat ce te conectezi, asculta datele specifice
socket.on('data', (data) => {
  // AFIȘEAZĂ TOATE ROLURILE ÎN BAZA NAMESPACE-URILOR
  let namespaces = document.querySelector('.namespaces');
  namespaces.innerHTML = '';
  data.forEach((ns) => {
    namespaces.innerHTML += `<span class="namespace" data-ns="${ns.endpoint}"><img src="${ns.img}" />${ns.endpoint.slice(1)}</span>`;
  });
  // ATAȘEAZĂ RECEPTORI PE FIECARE ROL
  Array.from(document.getElementsByClassName('namespace')).forEach((element) => {  
    element.addEventListener('click', (e) => {
      let endpoint = element.getAttribute('data-ns');
      // apelează funcția de conectare la namespace
  	  joinNamespace(endpoint);
    });
  });
  joinNamespace('/users');
});
```

Acesta este un scenariu foarte simplu de comunicare între server și client cu scopul de a expune datele de conectare pe camere.

Pentru managementul conectărilror ulterioare, vom gestiona clienții prin alocarea lor dinamică.

```javascript
namespaces.forEach(function manageNsp (namespace) {
    // pentru fiecare endpoint, la conectarea clientului
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        console.log(`User ${nsSocket.id} joined ${namespace.endpoint}`); // vezi cine s-a conectat
        nsSocket.emit('nsRoomLoad', namespace.rooms); 
        // pentru toate namespace-urile primise, clientul trebuie să 
        // aterizeze undeva. Va ateriza în primul namespace din toate trimise
        // care va avea atașat toate camerele disponibile pentru acel ns

        // integrarea userului în camera pe care a ales-o!
        nsSocket.on('joinRoom', (roomToJoin, nrUsersCallbackFromClient) => {
            // #0 Înainte de a te alătura unei camere, trebuie să o părăsești
            // pe anterioara, altfel mesajele se vor duce în mai multe deodată.
            const roomToLeave = Object.keys(nsSocket.rooms)[1];
            // utilizatorul va fi în cea de-a doua valoare pentru cameră din obiect
            // pentru că prima cameră pentru un namespace este propria cameră a userului.
            // Concluzia este că userul are din start propria cameră la conectarea cu un ns!!!
            nsSocket.leave(roomToLeave);
            updateUsersInRooms(namespace, roomToleave); // actualizează numărul celor rămași

            /* #1 Adaugă clientul unei camere */
            nsSocket.join(roomToJoin);

            /* #2 Aflăm care este camera aleasă de user din obiectul camerelor */
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomToJoin;
                // căutăm în obiectele room colectate prin instanțierea clasei Namespace
                // dacă există vreo cameră precum cea obținută mai sus.
                // va returna chiar obiectul de cameră, 
                // dacă aceasta a fost găsită între cele asociate namespace-ului
            });

            /* #3 Îi trimitem istoria */
            nsSocket.emit('historyUpdate', nsRoom.history); // ori de câte ori cineva se va conecta, va primi și istoricul
            
            /* #4 trimitem numărul membrilor actualizat cu fiecare sosire */
            updateUsersInRooms(namespace, roomToJoin);
        });
        // ascultarea mesajelor de la client pentru actualizarea tuturor socketurilor din room
        // trebuie sa identifici in care cameră este clientul si sa trimiti datele sale din mesaj tuturor
        nsSocket.on('comPeRoom', (data) => {
            // putem trimite mai multe informații pe lângă mesajul original
            const dataPlus = {
                mesaj: data.text,
                time: Date.now(),
                username: "nu-hardcoda-info"
            };
            console.log(dataPlus);
            // AFLA în ce room este acest socket client care a emis mesajul
            // https: //socket.io/docs/server-api/#socket-rooms
            console.log(nsSocket.rooms); // obiectul cu toate camerele în care este userul
            // utilizatorul va fi în cea de-a doua valoare pentru cameră din obiect
            // pentru că prima cameră pentru un namespace este propria cameră a userului.
            const roomTitle = Object.keys(nsSocket.rooms)[1];
            // console.log(roomTitle);
            // Avem nevoie și de obiectul room corespondent camerei în care este socketul
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle;
                // căutăm în obiectele room colectate prin instanțierea clasei Namespace
                // dacă există vreo cameră precum cea obținută mai sus.
                // va returna chiar obiectul de cameră, 
                // dacă aceasta a fost găsită între cele asociate namespace-ului
            });
            nsRoom.addMessage(dataPlus); // ori de câte ori vine un mesaj, va fi băgat în history
            io.of(namespace.endpoint).to(roomTitle).emit('comPeRoom', dataPlus);
            // se menționează explicit numele namespace-ului în loc de nsSocket
            // pentru ca mesajul să fie primit și de cel care l-a emis
        });
    });
});

function updateUsersInRooms (namespace, roomToJoin) {
    // trimite tuturor socketurilor conectate numarul de useri prezenti după update-ul prezent doar in UI-ul ultimului venit.
    // https://socket.io/docs/server-api/#namespace-clients-callback
    // execută callback-ul clientului
    io.of(namespace.endpoint).in(roomToJoin).clients((err, clients) => {
        // actualizează în toți clienții
        io.of('/users').in(roomToJoin).emit('updateMembers', clients.length);
        // callbackul este rulat cu datele despre user și actualizează
        // DOM-ul din client în timp real. OAU!!!!!!!
    });
}
```

Pe partea de client, putem construi două funcții specializate pentru conectarea la namespace și alta privind conectarea pe cameră

```javascript
let nsSocket = '';

// ACCES LA NAMESPACE
function joinNamespace(endpoint) {
   // mai întâi verifică dacă există un socket activ
  if(nsSocket) {
    // dacă există un socket activ, atunci a rămas de la o sesiune anterioară
	nsSocket.close(); // este nevoie să-l închizi
    // scoate funcțiile receptor care au fost adăugate pentru alt namespace
    document.querySelector('#input-text').removeEventListener('submit', submission);
  }
  nsSocket = io(`${endpoint}`); // setează variabila globală

  /* Desfășoară toată logica de după crearea endpointului */

  // PRIMEȘTE DE LA SERVER CARE SUNT CAMERELE PENTRU ENDPOINTUL ALES
  nsSocket.on('nsRoomLoad', (nsRooms) => {
    // pe evenimentul nsRoomLoad asculta datele care precizează câte camere sunt.
    console.log(nsRooms);
  });

  /*POSIBIL MODEL DE PRELUARE DATE DIN FORM*/ 
  // TODO: Explorează integrarea cu aplicația
  nsSocket.on('comPeRoom', (msg) => {
    console.log(msg);
    document.querySelector('#mesaje').innerHTML += `<li>${msg.text}</li>`;
  });
  document.querySelector('.form').addEventListener('submit', submission);
}

// callback pentru funcția receptor
function submission (event) {
  event.preventDefault(); // previne un refresh de pagină la send
  const newMessage = document.querySelector('#user-msg').value;
  nsSocket.emit('newMsg2Server', {
    text: newMessage
  });
}

// ACCES LA ROOM
function joinRoom(roomName) {

  /* #1 Intră într-o cameră */
  // trimite serverului numele camerei pentru care se dorește intrarea
  // informațiile privind camerele disponibile trebuie să preexiste.
  nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
    // odată adăugat la un room, vom actualiza numărul participanților
    // este locul din DOM unde este afișat numărul clienților din cameră
    // FIXME: Actualizează DOM-ul să aibă un element care să afișeze numărul de useri.
    document.querySelector('.numar-curent-de-useri').innerHTML = `${newNumberOfMembers}`;
  });
    
  // Adaugă funcții receptor pentru toate camerele
  let roomNodes = document.getElementsByClassName('room');
  Array.from(roomNodes).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      joinRoom(e.target.innerText);
    });
  });
    
  /* #2 Actualizează istoricul mesajelor */
  nsSocket.on('historyUpdate', (history) => {
    // afișează istoricul modificând DOM-ul
    const mesajNou = document.querySelector('#mesaje');
    // la prima conectare, se vor șterge toate mesajele
    mesajeleDinUI.innerHTML = "";
    // trecem prin mesajele istorice
    history.forEach((mesaj) => {
      const newMsg = buidHTML(mesaj);
      const mesajeleExistente = mesajeleDinUI.innerHTML; // mesajeleExistente va porni gol.
      mesajeleDinUI.innerHTML = mesajeleExistente + newMsg; // la el se vor adăuga cele din istoric
      // apoi la ceea ce preexistă se vor adăuga altele care au intrat in istoric cu fiecare emit din client
      // aceasta este metoda de a construi top-down
      mesajeleDinUI.scrollTo(0, mesajeleDinUI.scrollHeight);
      // se va vedea ultimul mesaj intrat, nu primul care forțează userul să facă scroll.
    });

    /* #3 Actualizează numărul membrilor afișat */
    nsSocket.on('updatemembers', (numMembers) => {
      document.querySelector('.numar-curent-de-useri').innerHTML = `${numMembers}`;
    });
  });
}
```





## 9. Evidența clienților

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

## 10. Evenimente predefinite (server)

### connect

Acest eveniment apare instantaneu la momentul conectării unui client.

```javascript
io.on('connect', (socket) => {
  // ...
});
// conectarea specificând o anume cale
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
io.binary(false).emit('eveniment');
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

## Client

### Obiectul conexiunii `io`

#### io(\[url][, options])

Primul pas în stabilirea unei conexiuni cu serverul este să instanțiezi un obiect socket apelând metoda `io` cu câțiva parametri.

- **url** este un `String` care menționează namespace-ul la care se face conexiunea. Dacă nu este menționat, conectarea se va face la `window.location`, adică url-ul pe care este pagina deschisă.
- **options** este un `Object` care poate fi populat cu opțiunile de conectare a clientului la server.

Metoda va returna un obiect `Socket`.

Ceea ce se va petrece în spatele cortinei, este o instațiere a unui `Manager` pentru url-ul pasat. Dacă există și alte apeluri din pagina clientului, `Manager`-ul va fi reutilizat cu excepția cazului în care opțiunea `multiplex` are setată valoarea la `false`. Setarea multiplexării la `false` atrage după sine generarea unei noi conexiuni de fiecare dată când clientul se conectează la server. Acest lucru este echivalentul opțiunii `'force new connection': true` pasate în obiectul de configurare a conexiunii sau mai nou `forceNew: true`.

Conectarea la un namespace specificat, de exemplu `io('/users')` declanșează câteva etape de conectare:

- prima dată clientul se va conecta pe rădăcină la `http://localhost` sau la rădăcina indicată de valoarea `window.location`;
- Imediat după, conexiunea Socket.IO se va face la namespace-ul specificat: `/users`.

#### Trimiterea parametrilor

Dacă ai nevoie să trimiți din client către server parametri, care să fie atașați apelului fără a mai folosi un eveniment dedicat, poți face acest lucru folosindu-te de posibilitatea de a trimite opțiuni la momentul conectării, fie atașând la namespace: `http://localhost/users?token=b10ef34`, fie trimițând în obiectul de opțiuni ca al doilea argument, o proprietate `query`, care să conțină datele necesare.

```javascript
const socket = io({
  query: {
    token: 'b10ef34'
  }
});
```

Trimiterea parametrilor este în tandem cu momentul primirii acestora pe server. Obiectul `socket` are o proprietate [`handshake`](https://socket.io/docs/server-api/#socket-request), care este referința către un obiect, care între celelalte, are și `query`, care este chiar obiectul trimis de client.

```javascript
{
  query: {}
}
```

Handshake-ul ce întâmplă o singură dată, la momentul conectării clientului cu serverul.



### Obiectul `socket`

#### socket.emit(eventName\[, …args][, ack])

Clientul poate emite date folosind un anumit eveniment convenit cu serverul. În plus, mai poate trimite ca al treilea argument (`[, ack]`), o funcție callback, dar care este foarte specială pentru că va fi executată, nu local în client, ci va fi trimisă serverului, care o va executa el. Magie curată!

```javascript
// din client
function joinRoom(roomName) {
  // trimite serverului numele camerei pentru care se dorește intrarea
  // informațiile privind camerele disponibile trebuie să preexiste.
  nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
    // odată adăugat la un room, vom actualiza numărul participanților
    document.querySelector('.numar-curent-de-useri').innerHTML = `${newNumberOfMembers}`;
  });
}
 
/* SERVERUL */
var {io,namespaces} = require('./server');

// PRIMA CONECTARE va fi făcută pe RĂDĂCINA! (/)
io.on('connection', (socket) => {
    // trimite către client date necesare pentru fiecare endpoint.
    // parcurge array-ul namespace-urilor și redu cu map la minimum esențial
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        };
    });
    // console.log(nsData);
    socket.emit('data', nsData); // trimite clientului datele
    // pe eventul data trebuie sa asculte userul la prima conectare
});

// CONECTĂRI ULTERIOARE PE ENDPOINTURILE ALESE DE CLIENT
// ascultarea dinamică a conexiunilor cu LOOP prin namespaces pentru a vedea cine cui namespace apartine.
namespaces.forEach(function manageNsp (namespace) {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        console.log(`User ${nsSocket.id} joined ${namespace.endpoint}`); // vezi cine s-a conectat
        nsSocket.emit('nsRoomLoad', namespaces[0].rooms); 
        // pentru toate namespace-urire primise, clientul trebuie să 
        // aterizeze undeva. Va ateriza în primul namespace din toate trimise
        // care va avea atașat toate camerele disponibile pentru acel ns

        // integrarea userului în camera pe care a ales-o!
        nsSocket.on('joinRoom', (roomToJoin, nrUsersCallbackFromClient) => {
            // FIXME: Nu uita să construiești un mecanism de history
            nsSocket.join(roomToJoin);
            nrUsersCallbackFromClient();
        });
    });
});
```

