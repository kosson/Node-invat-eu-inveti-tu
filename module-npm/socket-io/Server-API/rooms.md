# Rooms

Un *namespace* poate fi înțeles ca adresa unei case de pe o stradă. Casa respectivă are camere. Vom vedea că poți să te alături participanților unei camere (*room*).

Un namespace nu este un *room* - *cameră*. O cameră este o delimitare logică a unui set de socketuri conectate la un namespace. Pentru fiecare namespace pot fi definite camere la care socket-ul clientului poate fi adăugat folosind metoda `join` (se alătură). Același socket client poate fi scos dintr-o cameră folosindu-se metoda `leave` (părăsește).

**Constituirea de camere (*rooms*) este o prerogativă a serverului**. Clientul nu va ști că a fost adăugat unei camere și nici nu va putea ști ce camere sunt disponibile, dar va putea asculta pe un anumite eveniment. Acest lucru se întâmplă pentru că introducerea în camere se petrece în server. Clientul doar trebuie să știe ce evenimente să asculte, fie că acestea sunt hard codate în client side, fie să sunt trimise de la server spre cunoașterea clientului. Tot ceea ce va ști inișial clientul este că primește mesaje dintr-un anume namespace pentru că și el va trebui să se conecteze la acel namespace.

Concluzie: clientul va ști care sunt camerele disponibile doar dacă serverul i le trimite ca date, fiind incorporate în logica client-side. Tot ceea ce trebuie sincronizat de la bun început sunt namespace-urile, care trebuie declarate și într-o parte, și în cealaltă.

Clientul se conectează la un namespace, dar nu știe care sunt camerele disponibile.

## Trimiterea mesajelor către cei conectați

În momentul în care emiți într-o cameră folosind un socket al clientului, mesajul nu va fi primit și de cel care l-a emis. Pentru a trimite un mesaj dintr-un socket conectat către participanții dintr-o cameră:

```javascript
serverio.on('connect', (socket) => {
  socket.to('numeCameră').emit('mesaje', 'Salut tuturor celor din numeCameră');
  // sau folosind metoda `in()`
  socket.in('numeCameră').emit('mesaje', 'Salut tuturor celor din numeCameră');
});
```

## Un namespace trimite mesaje oricărei camere

Un namespace poate organiza socket-urile în *camere* (*rooms*). Toate *camerele* unui namespace pot primi un mesaj de la namespace-ul sub care sunt organizate. Dacă dorești să trimiți mesaje pe care să le primească și cel care le-a emit, va trebui să emiți date către o cameră specificând în clar namespace-ul. În concluzie, [socket-ul nu va primi și el mesajul](https://socket.io/docs/server-api/#socket-to-room).

```javascript
serverio.on('connect', (socket) => {
  serverio.of(nume_namespace).to(numeCameră).emit('mesaje', 'Tuturor celor din această cameră');
  // sau folosind metoda `in()`
  serverio.of(nume_namespace).in(numeCameră).emit('mesaje', 'Tuturor celor din această cameră');
});
```

Această metodă este valabilă pentru cazul în care dorești să trimiți punctual un mesaj într-o cameră de oriunde te-ai afla în codul de pe server.

```javascript
const io = require('socket.io')(https);
const nameSpSeparat = io.of('/separat');
nameSpSeparat.to('spatiul01').emit('salutare', date);
```

## Trimiterea de mesaje între socketurile conectate

Fiecare socket conectat are propria sa *cameră* deja creată. Această cameră poartă numele id-ului de socket: `socket.id`.

```javascript
socket.to(idSocketCăruiaÎiTrimiți).emit('Salut, prietene!');
// sau folosind metoda `in()`
socket.in(idSocketCăruiaÎiTrimiți).emit('Salut, prietene!');
```

Te poți conecta la propria cameră pentru că id-ul de socket poate fi folosit drept identificator.

```javascript
socket.to(socket.id).emit('auth', token);
```

Același principiu poate fi folosit pentru a comunica direct socket la socket dacă cunoști id-ul altuia.

```javascript
socket.to(altSocketId).emit('unulaunu', date);
```

## Mesaje tuturor camerelor unui namespace

Pentru a trimite tuturor participanților dintr-o cameră, prefixezi camera cu namespace-ul sub care sunt toate camerele.

```javascript
io.of('/nume_namespace').emit('tuturor', date);
```

## Mesaje doar către socketul clientului - privat

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

## Cum părăsești o cameră

Pentru a părăsi o cameră, se folosește metoda `leave` la fel cum ai folosit `join`.

> Fiecare `Socket` al lui Socket.io este identificat printr-un identificator unic generat aleator `Socket#id`. Pentru a simplifica lucrurile, toate socketurile se conectează la o cameră identificată prin acest identificator unic. Acest lucru permite broadcast-ul de mesaje pe toate socketurile conectate.

```javascript
io.on('connect', function (socket) {
    socket.on('nume_eveniment', function (id, msg) {
        socket.broadcast.to(id).emit('un mesaj', msg);
    });
});
```

## Scenariu de conectare la o cameră și comunicare

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
