# Namespace

Un `Namespace` este un set de socketuri, care sunt conectate împreună folosindu-se un identificator ce este menționat sub forma unei **căi** sau **endpoint**. Trebuie reținut faptul că realizarea de namespace-uri este un detaliu de implementare a protocolului folosit de `socket.io`, iar *căile* nu sunt căi URL. URL-urile nu sunt influiențate, singurul în cazul lui `socket.io` fiind `/socket.io/`, pe care clientul are acces la serverul `socket.io` din backend.

Folosirea unui `Namespace` conduce la o economie a numărului de conexiuni TCP și realizează o separare logică a domeniilor de interacțiune a unei aplicații. Serverul `socket.io` pune la dispoziție metoda `of` pentru a crea un spațiu separat în canalul de comunicații.

```javascript
var adminNsp = io.of('/admin');
adminNsp.on('connection', function (socket) {
    console.log('S-a conectat cineva');
});
adminNsp.emit('general', 'salut');
// în client
var adminNsp = io('/admin');
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

Antenție la faptul că partea de client trebuie să definească și ea conectorul pentru canalul creat pe namespace-ul nou. Acesta este specificat, adăugând calea ca argument lui `io('/calenoua')`.

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

După cum deja am aflat, metoda `of`, care crează namespace-urile, suplimentar unui string, acceptă drept valoare pentru parametrul care specifică calea și un RegExp, și la nevoie chiar o funcție.

```javascript
const dynamicNsp = io.of(/^\/dynamic-\d+$/).on('connect', (socket) => {
  const newNamespace = socket.nsp; // newNamespace.name === '/dynamic-101'

  // broadcast către toți clienții dintr-un sub-namespace dat
  newNamespace.emit('hello');
});

// client-side
const socket = io('/dynamic-101');

// broadcast către toți clienții din fiecare sub-namespace-uri
dynamicNsp.emit('hello');

// se paote folosi și un middleware pentru fiecare sub-namespace
dynamicNsp.use((socket, next) => { /* ... */ });
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
