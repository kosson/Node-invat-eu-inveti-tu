# Obiectul `Socket`

## Proprietăți `Socket`

### Proprietatea `socket.id`

Această proprietate este o valoare `String`, care este un identificator unic. Această proprietate este creată imediat ce s-a declanșat evenimentul `connect`. Valoarea este reactualizată după declanșarea evenimentului  `reconnect`.

```javascript
const socket = io('http://localhost');

console.log(socket.id); // undefined

socket.on('connect', () => {
  console.log(socket.id); // 'G5p5...'
});
```

### Proprietatea `socket.connected`

Este o valoare `Boolean` care indică dacă un socket este conectat la server sau nu.

```javascript
const socket = io('http://localhost');

socket.on('connect', () => {
  console.log(socket.connected); // true
});
```

### Proprietatea `socket.disconnected`

Este o valoare `Boolean` care indică dacă un socket este deconectat la server sau nu.

```javascript
const socket = io('http://localhost');

socket.on('connect', () => {
  console.log(socket.disconnected); // false
});
```

## Metode `Socket`

### `socket.open()`

Metoda returnează un obiect `Socket`. Folosirea acestei metode se va face atunci când vrei să deschizi manual o conexiune.

```javascript
// evită conectarea automată!
const socket = io({
  autoConnect: false
});

// ...
socket.open();
```

Poate fi folosită cu succes atunci când intervine un eveniment `disconnect`.

```javascript
socket.on('disconnect', () => {
  socket.open();
});
```

### Metoda `socket.connect()`

Este un sinonim pentru metoda `socket.open()`.

### Metoda `socket.send([…args][, ack])`

Metoda trimite un eveniment tip `message`. Metoda returnează obiectul `Socket`. Opțional, primește argumente și un callback (`ack`). Pentru mai multe detalii, vezi `socket.emit(eventName[, …args][, ack])`.

### Metoda `socket.emit(eventName[, …args][, ack])`

Metoda emite către socket un eveniment denumit printr-un `String`. Pentru a trimite datele către server sunt suportate toate structurile de date care pot fi serializate, încluzând `Buffer`-ele.

Metoda returnează obiectul `Socket`.

```javascript
socket.emit('hello', 'world');
socket.emit('with-binary', 1, '2', { 3: '4', 5: new Buffer(6) });
```

Argumentul `ack` este un callback care va fi apelat la momentul în care serverul răspunde. Un posibil scenariu ar fi cu partea de server care ascultă pe un posibil eveniment. Să numim evenimentul `pac`.

```javascript
// server:
 io.on('connection', (socket) => {
   // ascultă pe pac
   socket.on('pac', (email, fn) => {
     fn('Eu sunt Ina');
   });
 });
```

Clientul va emite pe evenimentul `pac`.

```javascript
socket.emit('pac', 'ina7@yahoo.com', (data) => {
  console.log(data); // data va fi 'Eu sunt Ina'
});
```

### Metoda `socket.on(eventName, callback)`

Această metodă este folosită pentru a atașa funcții receptor evenimentelor definite de utilizator sau celor predefinit. Metoda returnează obiectul `Socket`. Primul argument pe care îl primește este denumirea unui eveniment și este de tip `String`. Cel de-al doilea argument este un callback cu rol de receptor pentru prelucrarea datelor.

```javascript
var socket = io();
socket.on('connect', function (socket) {
    console.log(`Eu sunt ${socket.id}`);
    socket.on('salut', function (date) {
        // prelucreaza datele primite
    });
});
```

Modele posibile de atașare ale funcțiilor receptor. Metoda ascultă pe evenimentul definit de utilizator și atașează un callback.

```javascript
// un receptor pentru un eveniment definit
socket.on('pac', (data) => {
  console.log(data);
});
```

O funcție cu rol de receptor poate primi mai multe argumente.

```javascript
// un receptor cu mai multe argumente
socket.on('pac', (a, b, c) => {
  // ...
});
```
Callback-ul poate primi chiar o funcție ca valoare.

```javascript
// with callback
socket.on('pac', (oFuncțieCaValoare) => {
  oFuncțieCaValoare(10);
});
```

Un obiect socket moștenește toate metodele clasei `Emitter`. Astfel, poate avea și alte metode precum `hasListeners`, `once` sau `off`.

### Metoda `socket.compress(value)`

Metoda setează un mecanism de prelucrare căruia i se va supune oricare eveniment emis ulterior. În acest caz, vorbim de o compresie a datelor. Fii atent că oricum acest mecanism este în efect chiar dacă nu apelezi metoda.

```javascript
socket.compress(false).emit('unEveniment', { nume: 'Ion' });
```

### Metoda `socket.binary(value)`

Metoda indică dacă datele de lucru vor fi într-un format binar. Specificarea acestei opțiuni presupune creșterea de performanță.

```javascript
socket.binary(false).emit('unEveniment', {  nume: 'Ion' });
```

### Metoda `socket.close()`

Metoda returnează obiectul `Socket`. Această metodă produce o deconectare a conexiunii.

### Metoda `socket.disconnect()`

Este sinonim metodei `socket.close()`.
