# events

Majoritatea modulelor care constituie nucleul Node.js, se bazează pe un comportament asincron, care își are rădăcinile în arhitectura bazată pe evenimente a unor obiecte (`emitters`), care emit evenimente. Aceste evenimente declanșează execuția unor funcții care se numesc receptori (`listeners`).

De exemplu, atunci când este citit un fișier cu `fs.ReadStream`, la deschiderea fișierului, este emis un eveniment. La fel se întâmplă și cu un stream care a primit date.

Toate obiectele care emit evenimente sunt instanțe ale clasei `EventEmitter`.

Metodele pe care le pune la dispoziție un obiect `EventEmitter` sunt:

- `on(event, listener)`, fiind o metodă care permite înregistrarea unui nou listener;
- `once(event, listener)`, fiind înregistrat un listener care după prima apelare este eliminat;
- `emit(event, [arg1], [arg2], [...])`, fiind posibilă pasarea de argumente suplimentare tuturor funcțiilor listener;
- `removeListener(event, listener)`, fiind o metodă ce elimină un listener pentru tipul de eveniment specificat.

Toate metodele returnează o instanță `EventEmitter` care permite chaining-ul. Funcțiile care joacă rol de receptor (*listener*) acceptă argumentele care sunt date la momentul emiterii evenimentului.

În momentul în care un obiect `EventEmitter` emite un eveniment, toate funcțiile receptor atașate acelui eveniment, sunt apelate sincron. Dacă funcțiile receptor returnează un rezultat, acesta va fi ignorat.

```javascript
const EventEmitter = require('events');
class EmitorulMeu extends EventEmitter {}

const emitorulMeu = new EmitorulMeu();

emitorulMeu.on('event', () => {
  console.log('a apărut un eveniment');
});
emitorulMeu.emit('event'); // am emis un eveniment
```

Metoda `emit` permite pasarea unui număr arbitrar de argumente funcției receptor.
La momentul apelării funcției receptor, legătura `this` se va face la instanța `EventEmitter` la care receptorul este atașat.

```javascript
const emitorulMeu = new EmitorulMeu();

emitorulMeu.on('event', function (val) {
  this === emitorulMeu; // true
});
emitorulMeu.emit('event', 2,);
```

Se pot folosi funcții arrow pentru funcțiile receptor, dar se va pierde legătura `this` către obiectul emitor.

Toate funcțiile receptor, vor fi apelate sincron în ordinea în care au fost înregistrate. Când anumite scenarii cer acest model, funcțiile receptor pof fi executate asincron folosind `setImmediate()` or `process.nextTick()`.

## Gestionarea evenimentelor

Atunci când un receptor este înregistrat cu un eveniment folosind metoda `on`, acel receptor va fi invocat de fiecare dată când va apărea evenimentul.
În cazul în care este folosită metoda `once`, receptorul va fi apelat o singură dată.
