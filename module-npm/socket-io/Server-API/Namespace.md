# Namespace

Un namespace este un canal de comunicare, care permite elaborarea unei logici de construcție a aplicației care să permită zone delimitate, dar care folosesc aceeași conexiune. Ai putea plia namespace-urile pe zonele pe care le definești cu ajutorul rutelor, de exemplu. Într-o aplicație ai putea avea rute publice pornind de la rădăcină (`/`) și rute protejate așa cum ar fi zona de administrare (`/admin`). Namespace-urile sunt o facilitate a socket.io care îți permite realizarea de seturi de socketuri în funcție de zonele aplicației în care te afli sau dacă ai o aplicație în care organizări diferite (instituții) îți constituie propriile spații de colaborare. Namespace-urile nu trebuie confundate cu încăperile (*rooms*). Cel mai rapid mod de creare a namespace-urilor este să pasezi calea în momentul în care instanțiezi obiectul server.

```javascript
let socket1 = io('http://localhost:8080'); // va fi namespace-ul rădăcină: `/`
let socket2 = io('http://localhost:8080/admin'); // va fi namespace-ul administratorilor: `/admin`
let socket3 = io('http://localhost:8080/resurse'); // va fi namespace-ul resurselor: `/resurse`

socket.on('connect', (socket) => {}); // fiecare socket va fi diferit și independent.
```

Un `Namespace` este un set de socketuri, care sunt conectate împreună folosindu-se un identificator ce este menționat sub forma unei **căi** sau **endpoint**. Namespace-ul din oficiu, care este `/`, trimite mesaj tuturor indiferent dacă aparține unei camere sau nu. Pentru a emite un eveniment tuturor clienților conectați, se va folosi metoda `emit`.

```javascript
var io = require('socket.io')();
io.emit('salutare toata lumea'); // acest mesaj va aparea tuturor celor conectați
// echivalent cu
io.of('/').emit();

const admin = io.of('/admin');
admin.emit('Salutare tuturor administratorilor');
```

Atunci când se emite dintr-un namespace, nu se vor putea primi confirmări (*acknowledgements*).

Socketurile nu pot *asculta* mesaje de pe alte socketuri. Namespace-urile sunt complet separate. Trebuie reținut faptul că un client se va conecta mereu la rădăcină și abia apoi la alte namespace-uri. Namespace-urile vor folosi aceeași conexiune, acest lucru fiind realizat prin multiplexare.

Instanțierea obiectului `io` pur și simplu generează namespace-ul din oficiu care este `/`,  identificat prin `io.sockets` sau pur și simplu `io` (formă prescurtată acceptată). Toate mesajele emise pe aceste canale vor ajunge la toți clienții conectați la serverul de socket-uri.

```javascript
io.sockets.emit('general', 'Mesaj tuturor');
io.emit('general', 'Mesaj tuturor');
```

Propriu-zis, `io.emit('tuturor', date)` este echivalent cu `io.of('/').emit('tuturor', date)`. Putem spune că `io.emit('tuturor', date)` este o prescurtare pentru secvența care menționează și namespace-ul. În momentul în care clientul se conectează la server, automat se va declanșa evenimentul `connection`. Funcția callback cu rol de receptor, va fi executată și va primi drept parametru un obiect care reprezintă chiar clientul conectat. Acest parametru este numit prin convenție `socket`. Acest obiect este un `EventEmitter`, ceea ce permite atașarea de evenimente pentru a comunica cu browserul. Atașarea unui eveniment `connection` la server este echivalentul conectării direct la namespace-ul `/` în cazul în care nu este specificată altă cale.

O altă modalitate de a crea namespace-uri este următorul posibil model care implică apelarea metodei `of('/nume_namespace')`.

```javascript
const socketio = require('socket.io'); // instantațiezi obiectul socket.io
const io = socketio(serverExpress); // creezi serverul io pasându-i un server HTTP Express
io.emit('Tuturor celor conectați, pace!'); // acest mesaj va ajunge la toți clienții.
// menționezi namespace-ul de care ești interesat
const adminNsp = io.of('/admin'); // poate fi un String, un RegExp sau chiar o funcție.
adminNsp.emit('general', 'Salutare, administratori!'); // emiterea unui mesaj pe namespace
```

Trebuie reținut faptul că realizarea de namespace-uri este un detaliu de implementare a protocolului folosit de `socket.io`, iar *căile* nu sunt căi URL. URL-urile nu sunt influiențate, singurul în cazul lui `socket.io` fiind `/socket.io/`, pe care clientul are acces la serverul `socket.io` din backend. Atunci când este necesar, poți să te adresezi unui namespace anume făcând chaining direct precum în exemplul următor:

```javascript
const socketio = require('socket.io'); // instantațiezi obiectul socket.io
const io = socketio(serverExpress); // creezi serverul io pasându-i un server HTTP Express
// pentru că nu am specificat deja un namespace, vom opera pe root `/`
io.on('connection', (socket) => {
  socket.on('mesajeCatreToțiCeiConectați', (mesaj) => {
    io.emit('cătreToatăLumea', 'Salutare tuturor!');
    // sau
    io.of('/').emit('cătreToatăLumea', 'Salutare tuturor!');
  });
});
```

Încă un lucru foarte important: `io.on('connection')` în cazul de mai sus este același lucru cu `io.of('/').on('connection')`. Dacă nu specifici un namespace, va fi folosit root `/`.

Folosirea unui `Namespace` conduce la o economie a numărului de conexiuni TCP și realizează o separare logică a domeniilor de interacțiune a unei aplicații. Serverul `socket.io` pune la dispoziție metoda `of` pentru a crea un spațiu separat în canalul de comunicații.

```javascript
var adminNsp = io.of('/admin'); // sau `io.of('/admin').on('connection')`
// `adminNsp` este numele socketului pe care se vor face schimburile de mesaje
adminNsp.on('connection', function (socket) {
    // argumentul `socket` este socketul care s-a conectat!!!
    console.log('S-a conectat ', adminNsp.id);
});
adminNsp.emit('general', 'salut');
// în client
var adminNsp = io('/admin');
```

Serverul este singurul care poate comunica pe toate namespace-urile. Clientul nu poate opera decât într-un singur namespace odată.

```javascript
io.on('connection', (socket) => {
  // poți trimite pe un al namespace din root namespace, dacă ești server
  io.of('/admin').emit('mesaje', 'Salut, administratori!');
});
```

Comunicarea pe namespace-uri este bidirecțională. Acest lucru înseamnă că namespace-urile declarate pe server, trebuie să aibă un corespondent pe client.

`Namespace`-ul principal este `/` pe care se conectează clienții la momentul inițial și pe care ascultă la început serverul `socket.io`. Fiecare `namespace` emite un eveniment `connection`, care primește fiecare instanță `Socket` drept parametru.

```javascript
io.on('connection', function (socket) {
  socket.on('disconnect', function () { });
})
```

Socketurile dintr-un `Namespace` pot fi adresate prin proprietatea `sockets` a obiectului `Namespace`.

```javascript
var adminNsp = io.of('/admin');
adminNsp.sockets.emit('mesaj', 'A mai intrat cineva în namespace-ul de administrare');
// fiind perfect echivalent cu
adminNsp.emit('mesaj', 'A mai intrat cineva în namespace-ul de administrare');
```

Atenție la faptul că partea de client trebuie să definească și ea conectorul pentru canalul creat pe namespace-ul nou. Acesta este specificat, adăugând calea ca argument lui `io('/calenoua')`.

## Exemplu de creare a unui namespace cu rooms

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

Dacă dorești, din namespace-ul general `/` poți trimite mesaje către namespace-uri definite, cu o singură condiție. Aceasta este ca mai întâi să se fi creat deja canalul general și clientul să se fi conectat pe el, dar și pe cel definit separat. Reține faptul că generarea canalului principal și conectarea clientului se fac într-o manieră asincronă, ceea ce conduce la concluzia că mesajul trimis din canalul principal către cel definit separt se poate face după ce s-au stabilit toate conexiunile. O concluzie foarte importantă este că un namespace poate trimite mesaje întregului namespace indiferent de ce alte sub-namespace-uri au fost create și câte *rooms* au fiecare.

## Conectare dinamică la un namespace

Este posibil ca la un moment dat să ai nevoie să creezi obiecte `Namespace` în funcție de clienții care se conectează la server și namespace-ul creat local de aceștia. Pentru a avea un corespondent pe server care să poată potrivi o cerere a cărui namespace încă nu există, se poate folosi un RegExp la definirea unui obiect `Namespace`.

```javascript
const spatiidelucru = io.of(/^\/\w+$/);
// creează un obiect `Namespace` în funcție de namespace-ul setat în client

// ori de câte ori se conectează cineva,
spatiidelucru.on('connection', socket => {
  // setează namespace-ul unei constante
  const spatiu = socket.nsp;
  // acum poți emite și asculta
  spatiu.emit('hello');
});

// dacă ai nevoie de middleware, așa îl atribui fiecărui namespace:
spatiidelucru.use((socket, next) => {
  // fii atent ca userul să aibă acces la respectivul `spatiu`
  // În acest middleware ai putea face verificarea credențialelor
  next();
});
```

Un alt exemplu în care folosim pentru numele spațiului creat un prefix.

```javascript
const aplicatiameaNs = io.of(/^\/aplicatiamea-\d+$/).on('connection', (socket) => {
  const spatiulClientului = socket.nsp; // Dacă din client vine o conectare pe namespace-ul aplicatiamea-01,
  // atunci vom avea newNamespace.name === '/aplicatiamea-01'

  // broadcast către toți clienții dintr-un sub-namespace dat
  spatiulClientului.emit('mesaje', `Salut! Spațiul creat pentru tine este ${spatiulClientului}`);
});

// În setările clientului vom avea ceva similar cu:
const socket = io('/aplicatiamea-01');

// broadcast către toți clienții din fiecare sub-namespace-uri, adică toți cei care au namespace-uri în client
// prefixate cu `aplicatiamea`
aplicatiameaNs.emit('mesaje', 'Salutare tuturor spatiilor de lucru create!!!');

// se paote folosi și un middleware pentru fiecare sub-namespace
aplicatiameaNs.use((socket, next) => { /* ... */ });
```

## Middleware pe namespace-uri

Middleware-ul este o funcție care va fi executată pentru fiecare `Socket` care ajunge în server. Această funcție va primi drept parametri, obiectul socket (primul) și o funcție care va fi executată pentru a trimite `Socket`-ul pe următorul middleware dacă acesta există. Pentru a atașa middleware-ul unui obiect namespace, se va folosi metoda `use()`.

```javascript
// creează un middleware pentru namespace-ul rădăcină
io.use((socket, next) => {
  if (isValid(socket.request)) {
    next();
  } else {
    next(new Error('invalid'));
  }
});
```

Poți atașa middleware și pentru spațiile care au fost desemnate.

```javascript
io.of('/admin').use(async (socket, next) => {
  const user = await fetchUser(socket.handshake.query);
  if (user.isAdmin) {
    socket.user = user;
    next();
  } else {
    next(new Error('Nu ai credențiale de admin'));
  }
});
```

Folosind metoda `use()` poți atașa oricât middleware dorești. Acesta va fi executat secvențial în ordinea în care a fost introdus. Erorile vor fi pasate lui `next()`. În client, se poate seta un listener pentru evenimentul de eroare și astfel, în cazul în care în server a apărut o eroare în middleware-urile de pe un namespace, aceasta va ajunge și în client.

```javascript
import io from 'socket.io-client';

const socket = io();

socket.on('error', (reason) => {
  console.log(reason);
  // Va afișa mesajul de eroare de mai sus: `Nu ai credențiale de admin`.
});
```

## Compatibilitate middleware cu Express

Pentru a asigura compatibilitate cu middleware-ul Express, ai nevoie de o funcție wrapper pentru a face compatibile semnăturile.

```javascript
// ES5
function wrap (middleware) {
  return function matcher (socket, next) {
    middleware (socket.request, {}, next);
  }
}
// și one liner ES6
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next); // ES6
```

Atenție, middleware-ul care va întrerupe ciclul cerere (*request*) - răspuns (*response*), adică cele care nu apelează `next()`, nu vor fi luate în considerare și nu vor fi executate.

### Exemplu de utilizare a sesiunii Express cu Socket.io

```javascript
const session = require('express-session');

function wrap (middleware) {
  return function matcher (socket, next) {
    middleware (socket.request, {}, next);
  };
}
io.use(wrap(session({ secret: 'cats' })));

io.on('connect', (socket) => {
  // când ai nevoie să interacționezi cu sesiunea
  const session = socket.request.session;
});
```


```javascript
// creează sesiune - https://expressjs.com/en/advanced/best-practice-security.html
let sessionMiddleware = session({
    name: 'aplicatiamea',
    secret: process.env.COOKIE_ENCODING, // este setat în .env
    genid: function(req) {
        return uuidv1(); // use UUIDs for session IDs
    },
    store: new RedisStore({client: redisClient}),
    unref: true,
	  proxy:  true,
    resave: false,
    saveUninitialized: true,
    logErrors: true,
    cookie: {
        httpOnly: true,
        maxAge: (1 * 24 * 3600 * 1000),
        sameSite: 'lax' // https://www.npmjs.com/package/express-session#cookiesamesite
    }
});

const io = require('socket.io')(http, {
    transports: ['polling', 'websocket']
});

// conectarea obiectului sesiune ca middleware în tratarea conexiunilor socket.io
io.use(function clbkIOuseSessions(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
```

## Proprietățile unui `Namespace`

Un `Namespace` este un obiect, care oferă câteva proprietăți interesante.

### `namespace.name`

Această proprietate are drept valoare numele namespace-ului.

### `namespace.connected`

Proprietatea oferă acces la hash-urile obiectelor `Socket` conectate la acest namespace, fiecare fiind indexat prin `id`.

### `namespace.adapter`

Această proprietate indică adaptorul folosit pentru namespace. Este foarte utilă atunci când folosești un adaptor bazat pe Redis pentru că îți sunt oferite metode ce permit managementul socket-urilor și a *room*-urilor într-un cluster.

Adaptorul namespace-ului principal (`/`), nu poate fi accesat folosind această proprietate - `io.of('/').adapter`.

### `namespace.to(room)`

Această metodă primește un `String` drept parametru, care este numele unei camere și returnează obiectul namespace pentru viitoare chaining-uri.

```javascript
const io = require('socket.io')();
const adminNamespace = io.of('/admin');

adminNamespace.to('level1').emit('nume eveniment', { ceva: 'date' });
```

Pentru e emite mesaje altor camere, se poate folosi `to()` de mai multe ori.

### `namespace.in(room)`

Este sinonimul lui `namespace.to(room)`.

### `namespace.emit(eventName[, …args])`

Metoda primește ca prim argument numele evenimentului. Această metodă va emite un eveniment identificat prin `String`-ul argumentului către toți clienții conectați.

```javascript
const io = require('socket.io')();
io.emit('nume eveniment'); // emis pe namespace-ul principal `/`

const chat = io.of('/chat');
chat.emit('nume eveniment'); // emis tuturor socket-urilor conectate pe `chat`
```

Atunci când un eveniment este emis într-un namespace, nu mai sunt trimise acknowledgement-uri.

### `namespace.clients(callback)`

Metoda așteaptă o funcție cu rol de callback drept argument și va returna un array cu ID-urile conectate la namespace-ul curent.

```javascript
const io = require('socket.io')();
io.of('/chat').clients((error, clients) => {
  if (error) throw error;
  console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
});
```

Pentru a obține toți utilizatorii dintr-un room.

```javascript
io.of('/chat').in('general').clients((error, clients) => {
  if (error) throw error;
  console.log(clients); // => [Anw2LatarvGVVXEIAAAD]
});
```

Obține toți clienții conectați pe namespace-ul default (`/`).

```javascript
io.clients((error, clients) => {
  if (error) throw error;
  console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
});
```

### `namespace.use(fn)`

Această metodă este folosită pentru a adăuga un middleware, care este o funcție ce va fi executată ori de câte ori un `Socket` ajunge la server. Funcția cu rol de callback primește un obiect `socket` pentru fiecare client conectat. Callback-ul mai primește și un `next` drept argument, care poate fi invocat pentru deferirea execuției pe următorul middleware.

```javascript
io.use((socket, next) => {
  if (socket.request.headers.cookie) return next();
  next(new Error('Authentication error'));
});
```

Erorile sunt trimise înapoi clientului drept pachete specializate de eroare.

## Evenimente

### `connect`

Acest eveniment stabilește o conexiune `socket` cu un client.

```javascript
io.on('connect', (socket) => {
  // ...
});

io.of('/admin').on('connect', (socket) => {
  // ...
});
```

### `connection`

Acest eveniment este sinonim a lui `connect`.

## Modificatoare

### `volatile`

Aceasta este o proprietate a obiectului server `socket.io` care se comportă precum un modificator al tuturor evenimentelor care vor urma. În cazul în care clienții nu sunt gata să primească mesajele, acestea vor fi pierdute.

```javascript
io.volatile.emit('un eveniment', { ceva: 'date' }); // clientul poate primi sau nu datele
```

### `binary`

Acest modificator specifică dacă datele emise sunt binare. Atunci când este folosit, performanțele cresc. Valorile pot fi `true` sau `false`.

```javascript
io.binary(false).emit('un eveniment', { ceva: 'date' });
```

### `local`

Datele vor fi transmise doar nodului local atunci când este folosit adaptorul Redis.

```javascript
io.local.emit('un eveniment', { ceva: 'date' });
```
