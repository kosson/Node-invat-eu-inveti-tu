# Emiterea evenimentelor

API-ul Socket.IO este inspirat din `EventEmitter`-ul lui Node.js. Acest lucru înseamnă că poți emite evenimente dintr-o parte și să le asculți în altă parte.

```javascript
// server-side
io.on("connection", (socket) => {
  socket.emit("salve", "popor");
});

// client-side
socket.on("salve", (arg) => {
  console.log(arg); // popor
});
```

Poți trimite oricâte argumente dorești. Este posibil să trimiți structuri de date serializabile, chiar și obiecte binare precum `Buffer` sau `TypedArray`.
În cazul în care trimiți date, nu este necesar să faci o serializare folosind `JSON.stringify()`. Această operațiune va fi făcută din oficiu.

```javascript
// RĂU
socket.emit("uneveniment", JSON.stringify({ nume: "Alina" }));

// BINE
socket.emit("uneveniment", { nume: "Alina" });
```

Totuși, `Map` și `Set` nu sunt serializate automat și este nevoie să introduci acest pas în logica programului.

```javascript
const serializedMap = [...myMap.entries()];
const serializedSet = [...mySet.keys()];
```

## Acknowledgements

Atunci când ai nevoie să lucrezi cu un model care se apropie de modelul API-urilor cerere-răspuns, Socket.IO oferă un model de lucru numit *acknowledgements*. Acesta funcționează adăugând un callback ca ultim argument al funcției `emit()`. Funcția cu rol de callback va fi apelată în partea cealaltă la momentul în care primește evenimentul. Callback-ului îi va fi pasat un obiect în care se va seta o anumită valoare așteptată de emitent. Obiectul se va întoarce la emitent care execută codul în funcție de valoarea primită prin obiect.
Modelul este util atunci când dorești să ai o confirmare de primire a evenimentului.

```javascript
// server-side
io.on("connection", (socket) => {
  socket.on("actualizează element", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    callback({
      status: "ok"
    });
  });
});

// client-side
socket.emit("actualizează element", "1", { name: "updated" }, (response) => {
  console.log(response.status); // ok
});
```

La nevoie, partea care primește poate doar să execute callback-ul, ceea ce va conduce la executarea acestuia și a codului său înapoi la emitent. În exemplul de mai jos, callback-ul este pasat serverului, care-l apelează ceea ce declanșează execuția acestuia și în client a cărei finalitate este setarea valorii unei variabile martor.

```javascript
// client
$('#inp').on('input', emitStartType);
$('#inp').on('blur',  emitStopType);

let typingTimeout = null;
let isStartTypeSent = false;

// cazul în care nu mai scrie, dar încă este focalizat pe input
function emitStartType() {
   clearTimeout(typingTimeout); // există încă în cronometrare vreun emitStopType? Fă clear
   typingTimeout = setTimeout(emitStopType, 1000);
   if (isStartTypeSent) return;
   socket.emit('start-type', name, () => {
      isStartTypeSent = true;
   });
}

function emitStopType() {
   socket.emit('stop-type', name, () => {
      isStartTypeSent = false;
   });
}

// server
socket.on('start-type', (name, cb) => {
    console.log(`${name} scrie`);
    // io.emit('start-type', name);
    socket.broadcast.emit('start-type', name); // broadcasts a message to all connected clients except the sender
    cb(); // socket.io acknowledgements
 });

 socket.on('stop-type', (name, cb) => {
    console.log(`${name} s-a oprit din scris`);
    // io.emit('stop-type', name);
   socket.broadcast.emit('stop-type', name); // broadcasts a message to all connected clients except the sender
   cb(); // socket.io acknowledgements
 });
```

Observă faptul că în server s-a apelat callback-ul ca logică a codului. Atenție, nu se face automat.

În cazul în care ai nevoie de implementarea unui timeout poți construi o logică în acest sens.

```javascript
const withTimeout = (onSuccess, onTimeout, timeout) => {
  let called = false;

  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);

  return (...args) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
  }
}

socket.emit("hello", 1, 2, withTimeout(() => {
  console.log("success!");
}, () => {
  console.log("timeout!");
}, 1000));
```

## Resurse

- [Emitting events | socket.io/docs/v4](https://socket.io/docs/v4/emitg-events)
