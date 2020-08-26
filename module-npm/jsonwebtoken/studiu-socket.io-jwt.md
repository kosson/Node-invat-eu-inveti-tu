### Socket.io, JWT, Express

Folosind socket-urile realizezi o comunicare duplex în timp real.

Atenție, serverul de socket-uri nu are de unde să știe cine este logat și cine nu este. Oricine poate intra pe stream. Autentificarea se poate face în două moduri: folosind cookie-uri sau folosind token-uri. Token-urile sunt preferabile.

#### Îmbinarea cu Express

Începând cu versiunea 3 a framework-ului, aplicațiile Express.js s-au transformat în niște funcții care gestionează apeluri. Acestea pot fi pasate unor instanțe `http` (din Node) sau `httpServer`. Pentru ca socket.io să funcționeze, trebuie să pasezi serverul creat instanței de socket.io. Fii foarte atent, ca metoda `listen()` să o ceri pe server, nu pe aplicația Express.

```javascript
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

server.listen(3000);
```

Putem asemui realizarea unei conexiuni folosind socket-urile precum realizarea unui pod. De pe un mal care poate fi serverul, vom construi podul către celălalt mal.
Vom servi utilizatorului o pagină web în care vom stabili celălalt cap de pod. Pentru exemplificare, cel mai simplu este să construiesc pe exemplul de aplicație tip chat oferit în documentația însoțitoare la Socket.io.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Un chat pe Socket.io</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font: 13px Helvetica, Arial; }
      form { background: #000; padding: 3px; position: fixed; bottom: 0; width: 100%; }
      form input { border: 0; padding: 10px; width: 90%; margin-right: .5%; }
      form button { width: 9%; background: rgb(130, 224, 255); border: none; padding: 10px; }
      #messages { list-style-type: none; margin: 0; padding: 0; }
      #messages li { padding: 5px 10px; }
      #messages li:nth-child(odd) { background: #eee; }
    </style>
  </head>
  <body>
    <ul id="messages"></ul>
    <form action="">
      <input id="mesaj" autocomplete="off" /><button>Trimite</button>
    </form>
  </body>
</html>
```

#### Aplicația `Socket.io`

Socket.io este compus din două părți:

- un server (`socket.io`), care se integrează cu serverul http al Node.,
- și o bibliotecă de cod rezidentă în client care se încarcă în browserul acestuia numită `socket.io-client`.

Serverul nostru trebuie să asculte evenimentul `connection`, iar pentru asta în aplicația de pe server, vom pune o funcție handler:

```javascript
io.on('connection', function(socket){
  console.log('S-a conectat un utilizator');
});
```

Pentru a putea asculta ceva, trebuie să existe un apel de la client. Astfel, în pagina servită acestuia, înainte de închiderea tag-ului `body` vom insera următorul fragment.

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
</script>
```

Acesta expune clientul la obiectul `io `și apoi se realizează conexiunea către server. Acesta este momentul când podul a fost încheiat. Invocarea `io()` va căuta conectarea cu serverul care a servit pagina.

Toate socket-urile dispun de un eveniment care permite deconectarea. Dacă un socket primește un callback pe evenimentul `disconect`, se va întrerupe conectarea.

```javascript
io.on('connection', function(socket){
  console.log('S-a conectat un utilizator');
  socket.on('disconnect', function(){
    console.log('Utilizatorul s-a deconectat');
  });
});
```

În momentul în care utilizatorul închide pagina, se va întrerupe conectarea cu serverul. Același lucru se petrece și în cazul în care utilizatorul face refresh la pagină - se deconectează și se reconectează.

Odată realizată conectarea, poți emite evenimente. Comunicarea dintre client și server se face prin evenimente care sunt ascultate și de o parte și de alta.

#### Emiterea de evenimente

Evenimentele sunt create cu scopul de a vehicula date. Acestea pot fi JSON sau binare. Să continuăm cu dezvoltarea exemplului de aplicație chat. Pentru aceasta va trebui să colectăm datele introduse în formular. Spre deosebire de exemplul documentației Socket.io, vom folosi JavaScript nativ. În client vom avea următorul fragment:

```html
<script>
  var socket = io();
  function trimiteDate () {
    var valoare = document.getElementById('mesaj').value;
    socket.emit('general', valoare);
    document.getElementById('mesaj').value = '';
  };
</script>
```

Ceea ce am realizat este crearea unui socket numit `general` pe care putem trimite în regim bidirecțional date.
Trebuie remarcat faptul că am curățat formularul după fiecare apăsare.
Vom actualiza și formularul pentru a fi grijulii să nu reîncarce pagina după fiecare apăsare de buton, care este echivalentul unui submit.

```html
<form onsubmit="return false;" id="chat" action="">
  <input id="mesaj" autocomplete="off" />
  <button name="trimite" onclick="trimiteDate()">Trimite</button>
  <!-- sau -->
  <!-- <input type = "button" name="data" onclick="trimiteDate()" value="Trimite"> -->
</form>
```

Să presupunem că avem mai mulți clienți conectați la server și că dorești să vadă toți ceea ce trimiți către server. Este precum o transmisie de radio în eter către toate posturile receptoare. În engleză îi spunem *broadcast*.

```javascript
io.emit('nume_eveniment', {for: 'everyone'});
```

Poți face broadcast excluzând de la primirea mesajului socket-ului emitentului, dacă este necesar. În acest sens `socket.io` pune la dispoziție un fanion numit `broadcast`.

```javascript
io.on('connection', (socket) => {
  socket.broadcast.emit('nume_eveniment', { some: 'data' });
});
```

Pentru a trimite un mesaj tuturor, care va fi primit inclusiv de emitent, se va folosi metoda `emit()` pe un eveniment pentru care se ascultă cu `socket.on()`. Vom modifica și noi codul de pe server. Această versiune este tot ce e nevoie pentru a realiza un chat simplu.

```javascript
io.on('connection', function (socket) {
  socket.on('nume_eveniment', function (mesaj) {
    mesaj.emit('nume_eveniment', mesaj);
  });
});
```

În client vom avea

```html
<script>
  var socket = io();
  function trimiteDate () {
    var valoare = document.getElementById('mesaj').value;
    socket.emit('general', valoare);
    document.getElementById('mesaj').value = '';
    // return false;
  };
  socket.on('test', function(mesaj){
    console.log(mesaj);
    var lielem = document.createElement("li");
    var node = document.createTextNode(mesaj);
    lielem.appendChild(node);

    var element = document.getElementById('mesaje');
    element.appendChild(lielem);
  });
</script>
```

## Referințe

- [JWT.IO](https://jwt.io/)
- [JSON Web Token (JWT) - RFC7519](https://tools.ietf.org/html/rfc7519)
- [OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/draft-ietf-oauth-token-exchange/)
- [JSON Web Token Claims, Auth0](https://auth0.com/docs/tokens/jwt-claims)
- [Token-based Authentication with Socket.IO](https://auth0.com/blog/auth-with-socket-io/)
- [Get Started with JSON Web Tokens](https://auth0.com/learn/json-web-tokens/)
- https://hacks.mozilla.org/2012/03/browserquest/
- [Where to Store Tokens](https://auth0.com/docs/security/store-tokens)
- [How to Store JWT for Authentication](https://www.youtube.com/watch?v=iD49_NIQ-R4)
- [What makes JSON Web Tokens (JWT) secure?, Siddharth Kshetrapal, Auth0](https://www.youtube.com/watch?v=rCkDE2me_qk)
- [Authentication on the Web (Sessions, Cookies, JWT, localStorage, and more)](https://www.youtube.com/watch?v=2PPSXonhIck)
