# Modularizarea în Node

## Mantre

- module.exports este obiectul returnat ca rezultat al unui apel require în Node
- când faci cererea cu require folosește notație „./” pentru ca Node să știe că este vorba despre un modul local
- funcția exportată cu module.exports va fi intra în cache. Abia execuția variabilei referință ( care se încarcă cu evaluarea lui require ), va invoca codul din modul.
- fiecare modul este încărcat și evaluat prima dată când se face require. Orice apel a lui require cu numele modului, va returna versiunea din cache.
- Dincolo de a fi un sistem de încărcare a dependințelor, este și un instrument pentru construirea API-urilor prin posibilitățile de export și expunere selectivă a funcționalităților.
- Devine o bună practică folosirea lui const atunci când ceri module în Node.js pentru ca variabila care identifică modulul să nu fie accidental reasignată

```js
// șabloane de export
exports.numePropPublica = function(x){console.log(x);};

module.exports = {};

module.exports.obj = {};

exports.obj = {};
```

## Lămuriri cu privire la folosirea lui exports și module.exports în Node

[Node spune](http://nodejs.org/docs/v0.4.2/api/globals.html#module) că **module** este o referință către modulul curent. În particular, **module.exports** este același obiect precum **exports**. **exports** poate fi considerat un alias a lui module.exports.

Un simplu exemplu:

```js
// faci un fisier counter.js
var count = 1;
exports.increment = function() { count++; };
exports.getCount = function() { return count; };

// în server.js
var counting = require('./counter.js');
console.log(counting.getCount()); // 1
counting.increment();
console.log(counting.getCount()); // 2
```

Merită urmărit [răspunsul de pe Stackoverflow](http://stackoverflow.com/questions/5311334/what-is-the-purpose-of-node-js-module-exports-and-how-do-you-use-it).
