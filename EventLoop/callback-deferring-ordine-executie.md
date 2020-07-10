# Callbacks, programarea execuției asincron

În NodeJS, dacă o funcție acceptă ca argument un callback, acesta trebuie să fie pasat ultimul.

## Amânarea funcțiilor callback

Se folosește API-ul `process.nextTick()`, care amână execuția unei funcții până la următorul ciclu al buclei I/O. Poți considera `process.nextTick()` ca pe un punct de intrare în buclă. Funcționează astfel: se ia un callback ca argument și se introduce în capul *listei de execuție* (task queue) înaintea oricărui eveniment I/O care așteaptă, iar funcția gazdă va returna imediat. Funcția callback va fi invocată de îndată ce bucla începe un nou ciclu (adică când stiva este goală și poate fi trimis spre execuție callback-ul).

Un alt API pentru amânarea execuției este `setImmediate()`. Diferența dintre cele două este că `process.nextTick()` rulează înaintea tuturor evenimentelor I/O, pe când `setImmediate()` rulează după ultimul eveniment I/O, care este deja în task queue.

##  Ordinea de execuție a codului în Node.js

Node.js rulează un singur fir de execuție pentru codul JavaScript și controlează execuția folosind un *event loop*. Pentru orice altceva Node.js nu va ezita să folosească multiple fire de execuție.

Există un lucru foarte interesant care trebuie reținut de fiecare dată când pornești execuția unui program în Node.js. Fișierul de JavaScript pe care îl execuți cu Node.js pentru prima dată, va face parte din secvența de bootstrapping a lui Node.js. Acest lucru înseamnă că event loop-ul nu este pornit decât după ce codul acestui prim fișier este executat. În cazul în care avem callback-uri în cod, acestea vor beneficia de apelarea în *event loop*.

Astfel, în următorul exemplu, abia `// al_doilea.js` va rula promisiunea în *event loop*.

```javascript
// primul.js
new Promise(function (resolve, reject) {
  console.log('o promisiune nou-nouță');
  resolve();
}).then(() => {
  console.log('primul then apare mai târziu');
})
async function ceva () {
  console.log('interesant este când apare');
}
ceva().then(() => {
  console.log('când apare primul then?');
});
process.nextTick(() => {
  console.log('apar imediat după rularea codului JavaScript');
});
queueMicrotask(() => {
  console.log('eu apar ceva mai târziu...');
});
```

În acest exemplu, funcția din promisiune este executată imediat, dar `then` va fi executat de *event loop*. Ca o regulă generală, funcțiile sunt executate la momentul bootstrapping-ului, indiferent că sunt pasate unui constructor ori sunt declarate direct. Apoi vor fi executate în ordine oricare `process.nextTick(() => {console.log('ceva')})` declarat. Din motive istorice, `process.nextTick()` nu înseamnă chiar următorul tick de buclă. De fapt înseamnă „rulează codul la finalul executării codului JavaScript”. Trebuie menționat faptul că `nextTick` are cea mai înaltă prioritate. Acest cod va rula înaintea codului aflat în microtask queue.

Atunci și numai atunci, va fi apelat codul. Din acest motiv orice `process.nextTick` am avea în codul executat la momentul bootstrapping-ului, va fi executat după ce întregul cod JavaScript va fi executat. Putem spune că `process.nextTick()` și `queueMicrotask()` nu sunt executate în *event loop*. Restul, `setImmediate`, `setTimeout` și `setInterval` rulează în *event loop*.

Ca importanță, urmează prelucrarea codului din microtask queue, care sunt codul din `then`-uri. Atenție mare aici, codul `then`-urilor este executat înaintea oricărui `queueMicrotask` (introdus recent pentru a oferi un mecanism similar lui promise.resolve -> rularea a unui fragment de cod ca și cum ai avea au un `then` al unei promisiuni) doar dacă promisiunea se rezolvă pe loc, adică dacă are o parte de execuție asincronă codată. Dacă pui un `resolve()` și rezolvi instant, atunci `then`-urile vor avea precedență. Pur și simplu, codul `then`-urilor se execută sincron pentru că nu au codată partea de asincron.

Modulele ES6 sunt încărcate abia după ce event loop-ul a pornit. Modulele (`.mjs`) sunt de fapt promisiuni care sunt executate dintr-o promisiune.

Și al_doilea.js:

```javascript
const {readFile} = require('fs');
readFile(nume_fisier, () => {
  new Promise(function (resolve, reject) {
    console.log('o promisiune nou-nouță')
    resolve()
  }).then(() => {
    console.log('primul then')
  })
})
```

## Resurse

- [Workshop: Broken Promises, The Workshop Edition - Matteo Collina and James Snell, NearForm](https://www.youtube.com/watch?v=yRyfr1Qcf34)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
