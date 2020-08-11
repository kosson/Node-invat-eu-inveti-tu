# Obiectul `socket` al serverului

Un `socket` este un obiect instanțiat în baza clasei [`Socket`](https://socket.io/docs/server-api/#Socket), care are rolul să comunice cu browserul clientului. Numele clasei nu implică faptul că există vreo legătură cu socket-ul TCP/IP.

Un socket aparține unui `Namespace`. `Namespace`-ul din oficiu este `/`. În interiorul fiecărui `Namespace`, se pot defini canale arbirare, numite `room`. Obiectul `socket` poate să se alăture sau să părăsească un `room`.

Pentru a comunica cu browserul clientului, folosind un obiect de comunicare instanțiat în baza clasei `Client`, care asigură comunicarea.

Acest obiect creat pe baza clasei `Socket` moștenește din clasa `EventEmitter` din Node.js, ceea ce îl transformă într-un obiect care poate emite și reacționa la evenimente. Documentația aduce mențiunea că această clasă suprascrie metoda [`emit`](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args) a clasei `EventEmitter`, dar restul este păstrat intact.

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

Un `socket` este utilizat pentru a gestiona clienții care se conectează și trebuie înțeles ca **o reprezentare a clientului conectat**. Un `socket` ține de un anumit `namespace`, iar cel din oficiu este `/`. Pentru a asigura comunicarea, clasa `Socket` folosește o subclasă numită `Client`. Această clasă nu interacționează cu socket-urile TCP/IP.

Clasa `Socket` moștenește de la `EventEmiter`, suprascrie metoda `emit`, dar nu modifică restul metodelor `EventEmiter`. Toate metodele sunt ale lui `EventEmiter`.

## Proprietățile obiectului `socket`

### Proprietatea `socket.id`

Acesta este un identificator al sesiunii de comunicare. Această informație vine din subclasa `Client`. Este un `String` care identifică sesiunea de `socket`. Valoarea va fi disponibilă după ce evenimentul `connect` a fost declanșat. Valoarea va fi actualizată după evenimentul `reconnect`.

```javascript
const serverio = io('http://localhost');

console.log(serverio.id); // undefined

serverio.on('connect', (socket) => {
  console.log(socket.id); // 'G5p5...'
});
```

### Proprietatea `socket.rooms`

Acesta **este un obiect** care ține evidența camerelor (*rooms*) în care se află clientul.

```javascript
serverio.on('connection', (socket) => {
    socket.join('camera 007', () => {
        let rooms = Object.keys(socket.rooms);
        // obții un array cu numele camerelor în care se află socket-ul conectat
        console.log(rooms);
    });
});
```

### Proprietatea `socket.client`

Aceasta este o referință către obiectul `Client` din spatele conexiunii.

### Proprietatea `socket.conn`

Este o referință către conexiunea `Client` (obiectul `Socket` a lui `engine.io`). Acesta permite accesul direct la nivelul de transport IO, care în mare parte abstractizează socketul TCP/IP real.

### Proprietatea `socket.request`

Este un getter care are un model de funcționare precum al unui proxy. Returnează o referință către obiectul `request`, care vine chiar de la subclasa `Client`. Este foarte util pentru a accesa headerele unei cereri cum ar fi `Cookie` sau `User-Agent`. Este foarte util atunci când aplicația este protejată CSRF: Cross-Site Request Forgery.

De exemplu, în client setezi ca în fiecare cerere socket.io să fie trimis și tokenul `_csrf`.

```javascript
var csrfToken = '';

if(document.getElementsByName('_csrf')[0].value) {
    csrfToken = document.getElementsByName('_csrf')[0].value;
}

var pubComm = io('/redcol', {
    upgrade: true,
    query: {['_csrf']: csrfToken}
});
```

Acest lucru este necesar pentru că de cele mai multe ori, clientul va face polling, ceea ce implică o serie nesfârșită de cereri GET și POST-uri. În cazul în care nu tratezi cazul special al csrf-ului vei avea erori în server pentru toate rutele protejate.

Mai este și cazul în care ai nevoie de acces la cookie-uri pentru a obține informații utile serverului. Cookie-urile pot fi extrase din `socket.request.headers.cookie`.

```javascript
const cookie = require('cookie'); // https://www.npmjs.com/package/cookie

io.on('connection', (socket) => {
  const cookies = cookie.parse(socket.request.headers.cookie || '');
});
```

### Proprietatea `socket.handshake`

Handshack-ul se petrece la momentul în care se stabilește comunicarea între client și server. Acest obiect, care este inclus în datele care vin din client, oferă detaliile de conexiune.

```javascript
{
  headers: /* headerele trimise de client */,
  time:    /* data creării ca string */,
  address: /* IP-ul clientului */,
  xdomain: /* dacă avem o conexiune cross-domain sau nu */,
  secure:  /* conexiune securizată sau nu */,
  issued:  /* data emiterii cererii ca unix timestamp */,
  url:     /* string-ul URL-ului pe care s-a făcut cererea */,
  query:   /* obiectul query */
}
```

Pentru a obține acest obiect, poți apela la un scenariu tipic unui middleware în care parametrul este chiar obiectul `socket` și callback-ul este un `next` care va trece către următoarea operațiune pe date.

```javascript
// server
io.use((socket, next) => {
    let handshake = socket.handshake;
    // fă ceva cu datele.
});
// client
io.on('connection', (socket) => {
    let handshake = socket.handshake;
    // fă ceva cu datele.
});
```

Trebuie punctat faptul că în obiectul `query`, care este membru al obiectului `handshake`, poți găsi datele specifice unei anumite cereri către server. De exemplu, `id`-ul unui utilizator sau al unei resurse.

### Metoda `socket.use(fn)`

În anumite scenarii este nevoie de folosirea unui middleware de fiecare dată când se primește un mesaj (un `Packet`). În acest scop, se va folosi metoda `use` care va primi drept callback o funcție ce primește drept parametri socket-ul și o funcție pentru a deferi execuția către următorul middleware.

```javascript
io.use(function (socket, next) {
    if (socket.request.headers.cookie) return next();
    next(new Error('Authentication error'));
});
```

Funcția pasată trebuie considerată un middleware. Această funcție este executată pentru fiecare `Packet` sosit. Funcția primește drept parametru pachetul sosit și o funcție care trimite execuția următorului middleware. Erorile care ar putea apărea sunt trimise următorului middleware, dar și clientului ca pachete `error`.

```javascript
io.on('connection', (socket) => {
    // folosirea unui middleware pentru fiecare packet
    socket.use((packet, next) => {
        if (packet.ceva === true) return next();
        next(new Error('A ieșit prost'));
    });
});
```

### Metoda `socket.send([...args][, ack])`

Trimite un eveniment `message`.

### `socket.emit(eventName[,..args][,ack])`

Această metodă suprascrie `EventEmitter.emit` și returnează un obiect `socket`. Metoda emite un eveniment în `socket`-ul identificat de nume.

```javascript
socket.emit('mesaj', 'Salutare!');
socket.emit('date-binare', 1, '2', { 3: '4', 5: new Buffer(6) });
```

Clientul poate emite date folosind un anumit eveniment convenit cu serverul. În plus, mai poate trimite ca al treilea argument (`[, ack]`), o funcție callback, dar care este foarte specială pentru că va fi executată odată cu apariția răspunsului.

În fapt, ceea ce este permis este trimiterea de argumente unei funcții callback, care este rulată în client. Să ne uităm la partea serverului:

```javascript
socket.emit('misc', {nume: 'Primus'}, function clbkTestMisc (data) {
    console.log(data); // datele vor fi cele trimise ca acknowledgement de la client.
});
```

La momentul în care se face emit-ul pe evenimentul `misc`, va fi trimis și un argument (`Primus`), iar al treilea argument va fi o funcție callback care să prelucreze răspunsul care vine de la client.

În partea clientului avem un fragment de cod care ascultă pe evenimentul `misc`.

```javascript
var pubComm = io('/pub');
pubComm.on('misc', function clbkOnMisc (data, fn) {
    console.log(data); // Primus
    fn({name: "Decepticon", value: 10}); // datele sunt trimise serverului
});
```

În callback-ul metodei `on`, vom avea drept prim parametru identificatorul a cărei valoare va fi cea trimisă se server (`Primus`). Al doilea parametru este o funcție. Rolul acestei funcții este să trimită înapoi serverului, pe același eveniment, datele din primul argument.

Semnătura funcției care este pasată în rol de callback (`fn` în cazul nostru <`fn.toSource()`>) este următoarea:

```javascript
function() {
  if (!n) {
    n = !0;
    var r = s(arguments);
    u("sending ack %j", r),
      e.packet({
        type: h(r) ? o.BINARY_ACK : o.ACK,
        id: t,
        data: r
      })
  }
}
```

### Metoda `socket.on(eventName, callback)`

Această metodă este moștenită din funcția constructor `EventEmitter`. Drept argumente primește un `String`, care este numele evenimentului și o funcție cu roll de callback, care primește la rândul său datele de la cel care le-a emis.

Metoda returnează obiectul `socket`.

```javascript
socket.on('news', (data) => {
  console.log(data);
});
// callback-ul poate primi argumente trimise de emiter
socket.on('news', (arg1, arg2, arg3) => {
  // ...
});
// poate trimite date emiter-ului drept acknowledgement
socket.on('news', (data, callback) => {
  callback(0);
});
```

#### Exemplu de lucru curent

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
var {io, namespaces} = require('./server');

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

// CONECTĂRI ULTERIOARE PE ENDPOINT-URILE ALESE DE CLIENT
// ascultarea dinamică a conexiunilor cu LOOP prin namespaces pentru a vedea cine cui namespace apartine.
namespaces.forEach(function manageNsp (namespace) {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        console.log(`User ${nsSocket.id} joined ${namespace.endpoint}`); // vezi cine s-a conectat
        nsSocket.emit('nsRoomLoad', namespaces[0].rooms);
        // pentru toate namespace-urire primise, clientul trebuie să
        // aterizeze undeva. Va ateriza în primul namespace din toate cele trimise
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

Manualul Socket.io pune la dispoziție și o paletă de cazuri pentru metoda `emit`.

```javascript
serverio.on('connect', onConnect);

function onConnect(socket){

  // trimite clientului diverse informații pe un eveniment personalizat
  socket.emit('salutare', 'mă vezi?', 1, 2, 'abc');

  // trimite tuturor clienților, mai puțin celui care a emis mesajul
  socket.broadcast.emit('broadcast', 'salut tuturor! Eu nu-mi văd mesajul.');

  // trimit tuturor clienților din camera 'game', mai puțin mie însumi
  socket.to('game').emit('Salutare tuturor!', "facem un joc?");

  // trimit tuturor clienților din camera 'game1' și/sau 'game2', mai puțin mie însumi
  socket.to('game1').to('game2').emit('Salutare tuturor!', "facem un joc?");

  // trimit tuturor clienților din camera 'game', plus mie însumi
  serverio.in('game').emit('start', 'vom iniția o altă partidă imediat');

  // trimit tuturor clienților din namespace-ul 'myNamespace', plus mie însumi
  serverio.of('myNamespace').emit('pehol', 'începem campionatul imediat');

  // trimit mesaj unei anumite camere dintr-un namespace anume, plus mie însumi
  serverio.of('myNamespace').to('marte').emit('simulare', 'incepem simularile pedologice');

  // trimitere mesaj unui anume socketid (mesaj privat)
  serverio.to(<socketid>).emit('contact', 'Salut, te-am văzut la cinema.');

  // trimite mesaj cu mesaj de confirmare
  socket.emit('pingpong', 'ce crezi despre socket?', function (răspuns) {});

  // trimitere de mesaje fără a folosi compresia
  socket.compress(false).emit('fara', "nu fă asta mai ales în polling");

  // trimiterea de mesaje care ar putea fi ignorate decă avem un client indisponibil
  socket.volatile.emit('poateprimesti', 'Este posibil să primești acest mesaj');

  // specifică dacă datele trimise sunt binare
  socket.binary(false).emit('simple', 'Pe simple, nu trimit binare');

  // trimite mesaje tuturor clienților din acest nod (cazul folosirii mai multora)
  serverio.local.emit('salut', 'trimit pe acest nod');

  // trimite tuturor clienților conectați
  serverio.emit('acesta va ajunge la toți clienții conectați pe acest server');
};
```

### Metoda `socket.join(room[, callback])`

Metoda adaugă un socket într-o cameră specificată ca `String` în primul argument. Al doilea parametru este o funcție cu rol de callback, care poate prelucra erorile apărute (*error signature*). Metoda returnează obiectul de tip `Socket` pentru a se putea face chaining mai departe.

```javascript
serverio.on('connection', (socket) => {
  socket.join('camera 007', () => {
    let rooms = Object.keys(socket.rooms);
    console.log(rooms); // [ <socket.id>, 'room 237' ]
    // ai putea să-i anunți pe toți cei din cameră că a apărut un nou utilizator
    serverio.to('camera 007').emit('Ni s-a adăugat ', socket.id);
  });
});
```

Mecanismele care permit intrarea unui socket într-un *room* sunt asigurate de un `Adapter`, care este atașat la un obiect `Server`. `Adapter`-ul din oficiu este [socket.io-adapter](https://github.com/socketio/socket.io-adapter), fiind rezident în memorie la runtime.

### Metoda `socket.join(rooms[, callback])`

Folosind această metodă, un socket se poate alătura mai multor camere specificate în array-ul pasat drept prim parametru. Al doilea parametru este o funcție cu rol de callback, care poate prelucra erorile apărute (*error signature*).

Metoda returnează obiectul de tip `Socket` pe care se face chaining mai departe.

```javascript
serverio.on('connection', (socket) => {
  socket.join(['camera 1', 'camera 2'], () => {
    const rooms = Object.keys(socket.rooms);
    // este un array al tuturor camerelor în care a fost inclus socketul conectat
    serverio.to('camera 1').to('camera 2').emit('A intrat ', socket.id);
  });
});
```

### Metoda `socket.leave(room[, callback])`

Este metoda folosită pentru a părăsi un *room*. Al doilea parametru este o funcție cu rol de callback, care poate prelucra erorile apărute (*error signature*).

Metoda returnează obiectul `socket` pe care se face chaining. În momentul în care socket-ul experimentează o deconectare, vor fi părăsite și toate *room*-urile.

```javascript
serverio.on('connection', (socket) => {
  socket.leave('camera 007', () => {
    serverio.to('camera 007').emit(`utilizatorul ${socket.id} a ieșit!`);
  });
});
```

### Metoda `socket.to(room)`

Metoda creează un modificator pentru toate evenimentele emit care vor urma. Mesajele care vor urma, vor fi *transmise* socket-urilor conectare dintr-o anumită cameră. Socketul conectat care emite evenimentul va fi exlus din lista celor care primesc mesajul. Când se face broadcasting (*transmisiune*), nu se face acknowledgement. Metoda primește drept parametru un `String` care este numele unui *room*.

Metoda returnează obiectul `socket` pe care se poate face chaining mai apoi.

```javascript
serverio.on('connection', (socket) => {

  // transmisiune către un singur room
  socket.to('oCamerăAnume').emit('mesaje', { ceva: 'date' });

  // transmisiune către mai multe camere odată
  socket.to('camera 1').to('camera 2').emit('Salutare!');

  // un mesaj privat către alt socket
  socket.to(idUlUnuiSocketConectatDeja).emit('Salut!');
});
```

În cazul în care folosești `socket.to(idUlUnuiSocketConectatDeja).emit('Salut!');`, mesajul va fi primit doar de către destinatar. Cel care emite mesajul, nu-l va vedea. Acesta este cazul în care se constituie o cameră din id-ul unui socket. Este ca și cum ai propria ta cameră în care poți primi mai multe socket-uri conectate. Trimiterea unui mesaj într-un astfel de scenariu este echivalent cu trimiterea mesajului tuturor celor conectați la respectiva cameră cu minusul major că cel care emite mesajul, nu poate să vadă ce a trimis. Rezolvarea vine din utilizarea lui `serverio.to(socket.id).emit('ceva')`.

**Fiecare socket întră automat într-un room propriu definit de id**. Acest fapt permite o ușoară expediere a mesajelor către alte socketuri. De fapt, realizezi o comunicare unu la unu; un chat privat. Metodele de realizare a unui schimb de mesaje unu la unu implică folosirea serverului și nu a socket-ului.

```javascript
// trimit tuturor clienților din namespace-ul 'myNamespace', plus mie însumi
serverio.of('myNamespace').emit('pehol', 'începem campionatul imediat');

// trimit mesaj unei anumite camere dintr-un namespace anume, plus mie însumi
serverio.of('myNamespace').to('marte').emit('simulare', 'incepem simularile pedologice');
```

### Metoda `socket.in(room)`

Este sinonim lui `socket.to(room)`.

### `socket.compress(value)`

Este o metodă care menționează dacă se va face o compresie a datelor la momentul emiterii. Metoda returnează obiectul `Socket` pe care se poate face chaining.

```javascript
io.on('connection', (socket) => {
  socket.compress(false).emit('faracompresie', "nu e cea mai bună soluție");
});
```

### `socket.disconnect(close)`

Metoda deconectează clientul, dacă valoarea `Boolean` pasată este `true`, este închisă conexiunea. Altfel, deconectează doar namespace-ul.

```javascript
io.on('connection', (socket) => {
  setTimeout(() => socket.disconnect(true), 5000);
});
```

## Modificatori

### `broadcast`

Este un modificator al unui `emit()`, care va trimite un mesaj tuturor socketurilor, mai puțin celui care a trimis.

```javascript
io.on('connection', (socket) => {
  socket.broadcast.emit('nume eveniment', { ceva: 'date' });
});
```

### `volatile`

Acest modificator indică faptul că mesajul va pierdut dacă socketul client nu-l poate primi din diferite cauze.

```javascript
io.on('connection', (socket) => {
  socket.volatile.emit('mesaj', { ceva: 'date' });
});
```

### `binary`

Cu acest modificator indici faptul că datele sunt binare. Dacă valoarea pasată drept argument este `true`, datele care vor fi trimise sunt binare. În caz contrar, pui valoarea `false`.

```javascript
var io = require('socket.io')();
io.on('connection', function(socket){
  socket.binary(false).emit('eveniment', { ceva: 'date' }); //d atele nu sunt binare
});
```

## Evenimente

### `disconnect`

Acest eveniment are o metodă callback, care va fi executată la momentul în care se petrece deconectarea unui client.

```javascript
io.on('connection', (socket) => {
  socket.on('disconnect', (reason) => {
    // ...
  });
});
```

Motivele (`reason`) pot fi următoarele:

| Reason| De unde | Descriere |
|-:|:-:|:-|
| `transport error` | de la server | Este o eroare de transport |
| `server namespace disconnect` | de la server | Serverul face un `socket.disconnect()` |
| `client namespace disconnect` | de la client | a fost primit un pachet disconnect de la client |
| `ping timeout` | de la client | Clientul a încetat să mai răspundă la pinguri în intervalul specificat prin configurarea lui `pingTimeout` |
| `transport close` | de la client | Clientul a încetat să mai trimită date |

### `error`

Este un obiect de eroare, care este constituit atunci când apare o eroare.

```javascript
io.on('connection', (socket) => {
  socket.on('error', (error) => {
    // ...
  });
});
```

### `disconnecting`

Acest eveniment are în callback un argument care oferă motivul pentru care s-a petrecut deconectarea.
Acest eveniment apare atunci când un client este pe cale să fie deconectat, dar încă nu a părăsit o cameră.

```javascript
io.on('connection', (socket) => {
  socket.on('disconnecting', (reason) => {
    let rooms = Object.keys(socket.rooms);
    // ...
  });
});
```

## Restul metodelor

Trebuie reținut faptul că obiectul `socket` moștenește toate metodele puse la dispoziție de constructorul [EventEmitter](https://nodejs.org/api/events.html).


## Client

Clasa `Client` reprezintă o conexiune a lui `engine.io`. Un `Client` poate fi asociat cu mai multe `Socket`-uri multiplexate care aparțin diferitelor `Namespace`-uri.

## Resurse

- [Socket | server-api](https://socket.io/docs/server-api/#Socket)
