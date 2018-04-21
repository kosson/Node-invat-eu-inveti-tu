# http

Oricare aplicație care construiește un server web va genera un obiect server prin invocarea metodei `http.createServer()`.

```javascript
const http = require('http');

const server = http.createServer((request, response) => {
  // gestionează detaliile serverului
});
```

Funcția pasată drept callback este invocată pentru fiecare cerere HTTP făcută pe acel server. Obiectul generat de `createServer` este un `EventEmitter`, fapt care ne permite să atașăm funcții receptor,

```javascript
const server = http.createServer();
server.on('request', (request, response) => {
  // ce se petrece când va fi emis evenimentul request
});
server.listen(8888);
```

Atunci când serverul nostru primește o cerere HTTP, va fi apelat callback-ul împreună cu câteva obiecte care vor fi folosite pentru a gestiona solicitarea. Pentru a fi gata de a gestiona cereri, va trebui invocată și metoda `listen(8888)` căreia îi vom pasa portul pe care serverul ascultă.


## Request Body

Acesta este un obiect care se generează la momentul în care se fac solicitări serverului pe verbele `POST` și `PUT`. Obiectul `request` este pasat callback-ului și implementează interfața `ReadableStream`. Acest stream poate să fie trimis mai departe (`piped`) sau poți să-l exploatezi. Poți extrage datele setând niște receptori pe evenimentele `data` și `end`.