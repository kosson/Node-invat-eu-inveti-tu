# Evenimente în Node

Node.js pune la dispoziție obiecte numite `emitters` a căror sarcină este să genereze evenimente la anumite intervale. Evenimentele emise vor declanșa executarea unor funcții care au rol de receptoare (handlers). Toate obiectele care emit evenimente implementează clasa `EventEmitter`. Aceste obiecte oferă o metodă `eventEmiter.on()` care permite atașarea unor funcții la evenimentele emise. Aceste funcții vor fi executate sincron la momentul apelării lor. Metoda `eventEmiter.emit()` este folosită pentru a declanșa executarea funcțiilor receptor.

Modelul de emitere a unui eveniment

```javascript
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
myEmitter.emit('event');
```

## Tratarea this și arguments

De cele mai multe ori este nevoie să lucrezi cu obiectul this pe care îl formează callback-ul. La invocarea callback-ului, `this` va indica obiectul generat de invocarea metodei `eventEmitter.emit()`. Dacă nu vei folosi callback-uri declarate cu `function` nu vei avea acces la `this`. Metoda permite și pasarea mai multor argumente funcțiilor cu rol de callback.

```javascript
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', function(a, b) {
  console.log(a, b, this);
});
myEmitter.emit('event', 'a', 'b');
```

Folosirea funcțiilor săgeată va indica un obiect gol pentru `this`.

Toate funcțiile callback sunt apelate în manieră sincronă, una după alta în ordinea în care au fost introduse. Documentația Node menționează faptul că ordinea introducerii este determinantă pentru execuția funcțiilor. Menține o logică curată! Reține faptul că de fiecare dată când vei emite un eveniment, funcția sau funcțiile receptor vor fi apelate în ordinea înregistrării lor.

Transformarea modului sincron în asincron se poate face prin aplicarea utilitarelor `setImmediate()` și `process.nextTick()`.

```javascript
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
  setImmediate(() => {
    console.log('this happens asynchronously');
  });
});
myEmitter.emit('event', 'a', 'b');
```

Se poate emite un eveniment care să execute o singură dată funcția sau funcțiile receptor (handlerele). Acest lucru se poate realiza cu ajutorul metodei `eventEmitter.once()`.


```javascript
const myEmitter = new MyEmitter();
let x = 0;
myEmitter.once('bau', () => {
  x++;
});
myEmitter.emit('bau');
console.log(x);
```