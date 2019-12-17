# Socket.io

## 1. Introducere

Socketurile sunt baza tuturor conexiunilor pe web. La nivelul cel mai de jos al unei conexiuni care se stabilește prin TCP (Transfer Control Protocol), socketurile de rețea[^Network socket]

[^Network socket]: [Network socket, Wikipedia]()https://en.wikipedia.org/wiki/Network_socket

 sunt stream-uri de bytes între două computere, unul cu rol de client, iar celălalt cu rol de server. Propriu-zis, ceea ce introduci byte cu byte într-o parte, apare în cealaltă parte. Atunci când apelezi un server, mai întâi se deschide o conexiune socket și apoi se trimite un header al cererii urmat de un body. Headerul și corpul sunt bytes transmiși serverului. Dimensiunea este specificată în header și astfel socketul serverului va ști când să se oprească din ascultat cererea. În cazul în care în header nu este specificat `Keep-Alive`, serverul va închide conexiunea.

Protocolul în baza căruia funcționează și serverul Socket.io este [The WebSocket Protocol (RFC 6455)](https://tools.ietf.org/html/rfc6455). Trebuie menționat din capul locului că acest protocol nu sunt socket-urile TCP descrise mai sus.

###1.1. Privire generală Socket.IO

Socket.io este o bibliotecă de cod care permite comunicare bidirecțională în timp real între clienți și un server. Un avantaj este faptul că se vor realiza conexiuni indiferent de layer-ele interpuse (proxy-uri, load balance-re, etc). Reconectarea clientului se va face automat. Socket.io folosește în subsidiar `engine.io` care este un protocol de comunicare ce va folosi tehnologii de conectare care să asigure o legătură stabilă indiferent de tehnologiile interpuse între client și server.

Pentru interacțiunea cu toți clienții care se conectează, se utilizează clasa `Socket`. Nivelul de transport este asigurat prin XHR/JSONP (numit și [long-polling](https://en.wikipedia.org/wiki/Push_technology#Long_polling)) și acolo unde este posibil, se va folosi WebSocket, dacă legătura stabilită permite. Serverul va *upgrada* conexiunea confirmând cu `*HTTP/1.1 101 Switching Protocols*` în headerul de răspuns. Acest upgrade instruiește clientul să mențină legătura cu serverul și să folosească conexiunea stabilită ca un **stream**.

Socket.io nu este o implementare a standardului WebSocket. Socket.io atașează informații suplimentare fiecărui pachet (tip pachet și namespace, ack id) și din acest motiv nu se poate conecta la servere WebSocket.

Un client care a reușit să facă o conexiune, va sta conectat pe termen nedefinit, iar atunci când serverul nu mai este disponibil, va încerca să se conecteze fără a se deconecta. Acest lucru este posibil pentru că Socket.io implementează un mecanism de sincronizare prin care cele două părți află despre starea celuilalt. Mecanismul implică setarea de timere în ambele părți, care măsoară intervalele de timp în care răspunsul este primit la momentul când este inițiată comunicarea (etapa de handshake). Aceste timere necesită ca toate cererile ulterioare ale clientului să fie direcționate către același server. În cazul în care sunt folosite mai multe noduri (multiple servere sau un cluster), este necesară folosirea unui mecanism intermediar de gestiune a împerechierii cererii cu serverul sau worker-ul. Acesta se numește *sticky-session*. Pentru mai multe detalii, vezi [*stiky load balancing*](https://socket.io/docs/using-multiple-nodes/).

Este posibilă și o comunicare a datelor în format binar. Din browser datele pot fi emise ca `ArrayBuffer` sau `Blob`, iar din NodeJS ca `ArrayBuffer` și `Buffer`.
Pentru a separa canalele de comunicare, `Socket.io` permite realizarea de zone separate în funcție de modelul de comunicare sau separația resurselor. Aceste spații sunt numite *namespaces*. Acestea se comportă precum canale separate de comunicare. Aceste canale separate, vor folosi aceeași conexiune creată în baza multiplexării.

În fiecare namespace, poți crea zone diferite numite *rooms* (canale arbitrare). Expunerea serverului se face pur și simplu prin cererea modului `socket.io`. Va fi returnat un constructor, care acceptă un argument. Acesta este un server HTTP.

```javascript
var io = require('socket.io')();
// sau
const Server = require('socket.io');
const io = new Server();
```

Clientul se va conecta la server pentru că acesta este expus pe server pe calea `/socket.io/socket.io.js`; `<script src="/socket.io/socket.io.js"></script>`. Același script de conectare, poate fi adus de la `https://cdnjs.com/libraries/socket.io`. Pentru a fi folosit cu Browserify și Webpack, se va instala pachetul de client: `npm install --save socket.io-client`.

To clientul va trebui ca în scriptul principal pe care îl va încărca în pagină, să inițieze comunicarea cu serverul creând o instanță: `var socket = io()`. Dacă invoci obiectul fără niciun argument, descoperirea serverului din backend se va face automat.

### 1.2. Long polling

Traducerea termenului *polling* în limba română este de *apel selectiv*, iar în interacțiunea unui client cu serverul, această activitate ar putea privită ca un dialog permanent cu scopul de a menține o legătură continuă care să permită serverului să trimită un răspuns la un moment dat. Această activitate trebuie privită din perspectiva standardului HTTP, care nu este proiectat să mențină o legătură permanentă, ci doar apeluri la care se răspunde punctual cu o resursă. Polling-ul de bază se realizează cu API-ul `XMLHttpRequest` (*Asynchronous JavaScript and XML* - AJAX), iar în cazul în care nu există suport pe server pentru long pooling, acesta poate fi făcut folosind `JSONP`. Marele dezavantaj al acestei tehnici este că are nevoie de resurse considerabile de calcul, memorie și bandă.

Odată cu evoluția Internetului, necesitatea de a dezvolta aplicații în client care să ofere facilitatea de comunicarea în timp real cu serverul, a condus la apariția faimosului API `XMLHttpRequest` în browser în periada *Războiului browserelor*. Acest API a deschis drumul manipulării modelului de comunicare HTTP bazat pe cerere - răspuns într-unul care să pară a fi *real time*. Unul din acest modele se numește **long polling**[^Push technology].

[^Push technology]: Acest model face parte din suita care generic se numesc tehnologii de push. Pentru mai multe detalii, vezi [Push technology, Long pooling, Wikipedia](https://en.wikipedia.org/wiki/Push_technology#Long_polling)

Spre deosebire de celelalte tehnici, long polling-ul va încerca să mențină deschisă o conexiune cât mai mult posibil, oferind clientului un răspuns atunci când date proaspete sunt disponibile. Long polling-ul implementează `XMLHttpRequest`.

Implementarea unui astfel de model implică sprijinul serverului, care să accepte astfel de conexiuni specializate. Din partea clientului se așteaptă ca acesta să fie capabil de a gestiona o singură conexiune, cea către server. Atunci când clientul primește date, va mai iniția o conexiune după și așa mai departe, legătura cu serverul părând a fi neîntreruptă. De fapt, există mici pauze, care sunt gândite pentru a degreva serverul de încărcare. Aceste pauze pot parametrizabile prin setarea header-ului `Keep-Alive` în momentul în care clientul așteaptă un răspuns.

Serverul are o misiune mai delicată pentru că trebuie să gestioneze starea în care se află conexiunile. În cazul în care avem de a face cu o arhitectură mai complexă (multiple servere cu balans), care necesită constituirea unui adevărat mecanism care să țină evidența stării conexiunii. Atributul folosit pentru managementul stării în arhitecturi complexe este **stickiness**, **session stickiness**.

Acest mecanism de gestiune a stării conexiunii, va avea în sarcină și rezolvarea problemelor de timeout, care ar putea apărea dată fiind parcurgerea mai multor componente software posibile: servere, balance-re, proxy-uri, etc. Pentru evitarea complexităților pe care le-a angajat *long polling*-ul cu scopul de a oferi o comunicare apropiată de real-time, a fost proiectat un protocol țintit către comunicare bidirecțională: `WebSockets` sau `WebRTC`. Apariția acestui standard este de dată recentă și încă mediul de dezvoltare are nevoie de a maturiza soluții de implementare.

În cazul Socket.io, este folosită tehnica de long polling pentru a stabili conexiunea și apoi se face un salt, dacă este posibil și suportat la comunicarea pe websockets. Reține faptul că diferite arhitecturi de comunicare (proxy-uri, *balancer*e) vor bloca comunicarea pe Websockets și din acest motiv încă este nevoie de long polling. Un alt motiv este suportul, care în momentul acesta încă nu este uniform.

Long polling-ul este un artificiu de comunicare peste modelul HTTP, care vine cu un set de probleme. De exemplu, ordonarea mesajelor în cazul în care un client deschide mai multe tab-uri și astfel, mai multe cereri către server fără posibilitatea de a le ordona. În scenariile în care datele sunt păstrate pe client, așa cum pot fi token-uri de autentificare, este posibil ca acestea să fie suprascrise, dacă se folosesc mecanisme de persistență precum `localStorage` sau `IndexDb`.

Alte probleme apar atunci când dorești distribuirea conexiunilor pe mai multe procese sau servere folosindu-se mecanisme de ***sticky session***. De exemplu, toate conexiunile de pe un domeniu pot *ateriza* pe un singur proces, restul nefiind încărcate deloc. Un alt exemplu este legat de posibilitatea ca un atacator să declanșeze un DoS pentru că alocarea pe servere/procese este un determinată de IP-uri care pot fi aflate, și de aici o suprafață de atact facilă.

Pentru a nu gestiona deficiențele pe care long polling-ul le aduce, este de dorit lucrul doar cu clienți care suportă websockets. Soluția pentru clienții care accesează serverul de după proxy-uri sau alte filtre este securizarea canalului de comunicare prin TSL: `https://` în loc de `http://` și `wss://` în loc de `ws://`.

### 1.3. Universul socket-io

![Socket.io dependency graph](dependencies.jpg "Universul socket-io")

### 2.1. Proprietăți și metode ale obiectului `io` (server)

Odată instanțiat obiectul server, acesta expune câteva proprietăți și metode.

#### 2.1.1. Metoda `on()`

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

Metoda va returna un `Namespace`.

#### 2.1.4. Metoda  `serveClient([value])`

Argumentul acceptat este o valoare `Boolean`. Dacă valoarea returnată este `true`, serverul atașat va servi fișierele către client.

```javascript
// pass a server and the `serveClient` option
const io = require('socket.io')(http, { serveClient: false });

// or pass no server and then you can call the method
const io = require('socket.io')();
io.serveClient(false);
io.attach(http);
```

#### 2.1.5. Metoda  `path([value])`

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

## 5. Broadcasting

Dacă atașezi un fanion `broadcasting` proprietății `emit` sau `send`, vei putea trimite mesaje tuturor mai puțin ție, cel care face broadcastingul.

```javascript
// pe server
io.on('connection', function (socket) {
  socket.broadcast.emit('Fraților, s-a conectat ' + socket.id);
});
```

## 6. Resurse statice clienților

Socket.io stabilește automat o legătură la client căruia îi sunt trimise automat informații. Directorul stabilit din oficiu pentru a servi resursele de conectare clientului este `/socket.io`. Poți schimba această valoare la una preferată, dacă acest lucru este necesar.

```javascript
const io = require('socket.io')();
io.path('/myownpath');

// client-side
const socket = io({
  path: '/myownpath'
});
```

## 7. Namespace-uri / multiplexare

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

### 7.3. Crearea de rooms (camere)

Pentru fiecare namespace pot fi definite camere la care socket-ul clientului poate fi adăugat folosind metoda `join` (se alătură). Același socket client poate fi scos dintr-o cameră folosindu-se metoda `leave` (părăsește).

**Constituirea de camere (*rooms*) este o prerogativă a serverului**.

Din oficiu, clientul nu știe pe ce camere a fost adăugat pentru că acest lucru se petrece în partea de server. Clintul doar trebuie să știe ce evenimente să asculte, fie că acestea sunt hard codate în client side, fie să sunt trimise de la server spre cunoașterea clientului.

Concluzie: clientul va ști care sunt camerele disponibile doar dacă serverul i le trimite ca date, fiind incorporate în logica client-side. Tot ceea ce trebuie sincronizat de la bun început sunt namespace-urile, care trebuie declarate și într-o parte, și în cealaltă.

Clientul se conectează la un namespace, dar nu știe care sunt camerele disponibile. Tot ceea ce va ști este că primește mesaje unui anume namespace pentru că și el va trebui să se conecteze la acel namespace.

#### 7.3.1. Cum setezi o camera

Gestionarea accesului și ieșirii dintr-o *cameră* se face în partea de server folosind două metode: [`socket.join('nume_camera')`](https://socket.io/docs/server-api/#socket-join-room-callback) și `socket.leave('nume_camera')`.

Opțional `socket.join('nume_camera', function() { //gestioneaza conectarea});` poate primi un callback util pentru a comunica și primi date în cameră.

```javascript
socket.on('connection', function (socket) {
    socket.join('cam01');
    io.to('cam01').emit('special', `${socket.id} ești membru al cam01`);
});
// sau
socket.on('connection', function (socket) {
    socket.join('cam01');
    socket.to('cam01').emit('special', `${socket.id} ești membru al cam01`);
    // mesajele emise cu socket.to vor fi primite de toți cei din camera respectivă
    // dar nu și de cel care le-a emis!!! Pentru asta emite cu io.to('camera')
});
// și cu o funcție callback construind o cameră privată doar a clientului
socket.on('connect', (socket) => {
    socket.join(socket.id, () => {
        socket.emit('salut', 'un spațiu doar al clientului definit prin socket.id');
    });
});
// odată camera setată, poți comunica date și din afara callback-ului
socket.on('connect', (socket) => {
    socket.join(socket.id, () => {
        socket.emit('salut', 'un spațiu doar al clientului definit prin socket.id');
    });
    // pentru a comunica din afara callback-ului, folosește obiectul io.
    io.to(socket.id).emit('salut', 'din alte zone');
    // mesajele emise astfel, vor fi primite și de emitenți
});
```

Folosind metoda `join` putem spune să introducem clientul reprezentat de obiectul `socket` în cameră.

De îndată ce un socket va fi introdus într-o cameră, poți să emiți către client ce date dorești. Poate fi un mesaj sau un `Buffer`. În momentul în care se va face `emit`-ul toți clienții care erau deja în cameră, vor afla de prezența noului venit.

Clientul nu va ști că a fost adăugat unei camere, dar va putea asculta pe un anumite eveniment.

```javascript
socket.on('special', (date) => {
    console.log(date);
})
```

Mesajele de la `socket.to('cam01')` vor fi primite doar de cei care sunt în acele camere. Mesajele prefixate cu namespace-ul, vor fi primite de la server, nu de la socket, având efectul concret că vor fi primite de toți cei conectați la server prin acea cameră inclusiv cel care a emis mesajul `io.of('/').to('cam01').emit('special')`. Când faci emit doar cu socketul, toți vor primi mesajul din cameră, dar nu și cel care-l emite.

#### 7.3.2. Conectarea la mai multe camere

Un client poate fi conectat la mai multe camere deodată. Metoda pentru a realiza acest lucru este tot [`join`](https://socket.io/docs/server-api/#socket-join-rooms-callback) cu notabila excepție că îi pasezi drept prim parametru un array în care sunt menționate toate camerele la care socketul va fi conectat.

#### 7.3.3 Comunicarea din camere

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

#### 7.3.4. Camera proprie pe baza id-ului și conectare socket la socket

Te poți conecta la propria cameră pentru că id-ul de socket poate fi folosit drept identificator.

```javascript
socket.to(socket.id).emit('auth', token);
```

Același principiu poate fi folosit pentru a comunica direct socket la socket dacă cunoști id-ul altuia.

```javascript
socket.to(altSocketId).emit('unulaunu', date);
```

#### 7.3.5. Mesaje doar către socketul clientului - privat

În anumite scenarii cum ar fi comunicarea erorilor, a diferitelor alte resurse de la server către client, este necesară stabilirea unui eveniment a cărui nume să fie însuși `socket.id`. În acest mod, vei ști foarte clar faptul că ai la dispoziție un schimb de mesaje țintit doar pe id-ul clientului. Acesta nu este un mijloc securizat de comunicare a datelor pentru că în cazul în care aplicația pune la dispoziție și un chat, id-urile ar putea fi cunoscute. Un utilizator rău intenționat, le-ar putea folosi pentru a trimite mesaje care să imite schimbul de date de la server. Pentru a realiza un model mai sigur, creează o cameră folosind `socket.id`.

```javascript
/*SERVER*/
// Mesagerie strict pe client
socket.on(socket.id, (data) => {
    // fă ceva cu datele la nivel de server
});

/*CLIENT*/
socket.on(socket.id, (data) => {
    // fă ceva cu datele la nivel de client
    socket.emit(socket.id, 'merci pentru date');
});
```

Modelul folosind o cameră realizează o izolare mai bună și în cazul comunicării de date sensibile cum ar fi autentificarea, este de dorit

```javascript
/*SERVER*/
socket.join(socket.id, () => {
    // let rooms = Object.keys(socket.rooms);
    // console.log(rooms);
    socket.emit('salut', 'salut prietene, lucram in camera');
});
```

Asigură-te că de îndată ce ai terminat episodul de autentificare sau ceea ce necesită stabilirea unei camere dedicate, clientul este scos din camera creată pentru el, pentru a nu oferi o suprafață de atac.

Avantajul folosirii camerei private este acela că poți emite evenimente specifice cum ar fi `login`, `signin`, etc.

#### 7.3.6. Mesaje tuturor

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

#### 7.3.7. Cum părăsești o cameră

Pentru a părăsi o cameră, se folosește metoda `leave` la fel cum ai folosit `join`.

> Fiecare `Socket` al lui Socket.io este identificat printr-un identificator unic generat aleator `Socket#id`. Pentru a simplifica lucrurile, toate socketurile se conectează la o cameră identificată prin acest identificator unic. Acest lucru permite broadcast-ul de mesaje pe toate socketurile conectate.

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

#### 7.3.8. Scenariu de conectare la o cameră și comunicare

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

## 8. Evidența clienților

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

## 9. Evenimente predefinite (server)

### 9.1. `connect`

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

### 9.2. connection

Este sinonim evenimentului `connect`.

## 10. Fanioane speciale pentru server

### 10.1. `volatile`

Setează un modificator pentru un `emit` care urmează, dar pentru care datele ar putea fi pierdute din cauza pierderii legăturii cu, clientul.

```javascript
io.volatile.emit('uneveniment', {"date": "ceva"});
```

### 10.2. `binary`

Specifică dacă sunt așteptate date binare în cele care vor fi emise. Atunci când acest eveniment este emis, crește performanța. Valoarea este boolean.

```javascript
io.binary(false).emit('eveniment');
```

### 10.3. `local`

Setează un modificator pentru un `emit` care urmează. Datele vor fi emise doar pe nodul curent (folosit când se utilizează Redis, de exemplu).

```javascript
io.local.emit('eveniment', {"ceva":"date"});
```

### 11.2. Evidența socketurilor la conectare

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

Socket.io oferă chiar o metodă care generează un array a socketurilor conectate.

```javascript
io.clients((error, clients) => {
    console.log(clients); // un array cu toți cei conectați pe rădăcină.
});
```

### 11.3. Evenimentele unui socket

Obiectului `socket`, i se pot adăuga funcții receptor (*listeners*) pentru următoarele evenimente care pot apărea.

#### `connect`

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

#### 11.3.1. `close`

Se atașează o funcție receptor pentru eventualitatea în care un utilizator se va deconecta de la server. Funcția receptor poate avea următoarele argumente:

- un șir de caractere (`String`) care să aducă lămuriri asupra cauzei deconectării;
- un obiect descriptiv, care poate fi pasat opțional.

#### 11.3.2. `message`

La apariția unui astfel de eveniment, înseamnă că serverul tocmai a primit un mesaj de la client și receptorul este apelat cu un argument care poate fi:

- un `String` care este Unicode
- un `Buffer`, fiind un conținut binar.

#### 11.3.3. `error`

Declanșează un receptor atunci când a fost semnalată o stare de eroare. Receptorul primește un obiect `Error`.

#### 11.3.4. `flush`

Acest eveniment declanșează un receptor pentru a curăța `write buffer`-ul. Receptorul rpimește chiar bufferul care trebuie curățat.

#### 11.3.5. `drain`

Este un eveniment care semnalează golirea buffer-ului.

#### 11.3.6. `packet`

Acest eveniment va apărea în cazul în care un socket a primit un pachet, fie acesta un `message` sau un `ping`. Argumentele pe care funcția receptor le poate primi sunt:

- `type`, care indică tipul pachetului primit și
- `data`, fiind un pachet de date dacă tipul este un `message`.

#### 11.3.7. `packetCreate`

Acest eveniment va apela callbackul înainte ca socket să trimită un pachet. Argumentele pe care funcția receptor le poate primi sunt:

- `type`, care indică tipul pachetului primit și
- `data`, fiind un pachet de date dacă tipul este un `message`.

##13. Sticky load balancing

În cazul unor aplicații de mari dimensiuni, dacă dorești să distribui încărcătura conexiunilor pe mai multe mașini sau folosind mai mulți workeri (procese), trebuie să te asiguri de faptul că o cerere asociată cu anume id de sesiune se conectează cu procesul sau serverul din care sunt originare. Acest mecanism de load balancing, care să identifice cererea cu procesul (să le facă *sticky*) este absolut necesar de etapa de long pooling până la momentul upgradării conexiunii la websockets.

Trebuie să luăm mereu în considerare faptul că anumiți clienți nu au capacitatea de a comunica pe websockets, ceea ce îi va determina să folosească long polling-ul. În acest caz, este posibil ca o conectare să se fi făcut la server, dar nu au apucat să trimită vreo crere către acesta. Documentația oficială indică necesitatea unui instrument cu care să se constituie un tampon în procesul care gestionează conexiunea pe long polling. Datele vor fi scrise într-o etapă intermediară pentru ca alți clienți care au suport pentru websockets, fiind mai rapizi, trebuie să scrie datele pe care ei le emit și celor care folosesc long polling-ul.

În cazul în care nu oferi suport pentru long pooling, poți limita lucrul doar la websockets.

```javascript
const client = io('https://unsite.ro', {
    transports: ['websocket']
});
```

Varianta de suport din oficiu, oferă și long polling și ar fi echivalentă cu menționarea explictă.

```javascript
const client = io('https://unsite.ro', {
    transports: ['websocket', 'polling']
});
```







## 14. Debugging

Socket.io folosește în scopuri de depanare (debugging), modulul npm `debug`.

### 14.1. Nivel de client

În codul clientului poți introduce o secvență care va folosi mecanismul de stocare local al browserului.

```javascript
localStorage.debug = '*';                            // logging-ul arată totul
localStorage.debug = 'engine.io-client:polling-xhr'; // logging pe anumite segmente
```

Poți introduce mai multe zone de interes pentru debugging.

```javascript
localStorage.debug = 'engine.io-client:polling, engine.io-client:socket';
```

### 14.2. Nivel de server

La nivel de server, pentru a porni debuging-ul, vei porni aplicația folosind variabila de mediu `DEBUG`.

```bash
DEBUG=* node server
```

Ca să nu mai menționezi `DEBUG=*`, cel mai bine ar fi să faci un `export DEBUG=*`. Apoi vei putea porni aplicația în mod normal, dar vei beneficia de debugging.

Pentru a întrerupe acest comportament, se va face un `export DEBUG=null`.

Pentru a face logging doar pentru socket.io, vei proceda la un `export DEBUG=socket.io:server node server`.

## Referințe

- [The WebSocket Protocol | RFC 6455](https://tools.ietf.org/html/rfc6455)
- [WebSockets - A Conceptual Deep-Dive](https://www.ably.io/concepts/websockets)
- [Long Polling - Concepts and Considerations](https://www.ably.io/concepts/long-polling)
- [Known Issues and Best Practices for the Use of Long Polling and Streaming in Bidirectional HTTP: draft-loreto-http-bidirectional-07](https://tools.ietf.org/id/draft-loreto-http-bidirectional-07.html)
- [HTML5 WebSocket: A Quantum Leap in Scalability for the Web](http://websocket.org/quantum.html)
- [HTMLLiving Standard — Last Updated 23 February 2019](https://html.spec.whatwg.org/multipage/web-sockets.html)
- [The Myth of Long Polling](https://blog.baasil.io/why-you-shouldnt-use-long-polling-fallbacks-for-websockets-c1fff32a064a)
- [Why you don’t need Socket.IO](https://codeburst.io/why-you-don-t-need-socket-io-6848f1c871cd)