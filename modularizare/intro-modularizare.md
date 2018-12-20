# Modularizarea în Node

## Ce este un modul?

Pur și simplu este un fișier JavaScript sau chiar o întreagă bibliotecă de cod. Acesta poate fi importat în alt cod folosindu-se funcția `require()` din Node. Însuși efortul de standardizare al JavaScript a pornit pe calea modularizării de ceva timp.

## Cum funcționează modularizarea?

După cum spuneam, într-un fișier principal, care este numit `server.js` sau `index.js` sau `app.js` sau `main.js` (istoric vorbind, multe variante au fost și sunt în circulație), este invocată funcția `require()` cu un parametru care este numele modulului. Rezultatul este identificat cu o variabilă, care experiența practică ne sfătuiește să fie un `const`.

```javascript
const express = require('express');
```

Invocarea funcției, returnează un obiect.
Putem să ne închipuim modulele precum niște fragmente de care depinde funcționarea întregii aplicații. În unele lucrări sunt numite de-a dreptul **dependințe**. În cazul Express este nevoie și de o instanțiere prin `express()`.

### Exportul obiectelor

```javascript
const obiect = {a: 1};
exports.obiect = obiect;
```

### Importul obiectelor

```javascript
const routes = require('./module/rute.js');
```

Pentru modulele care fac parte din nucleul ecosistemului de pachete Nodejs, nu este nevoie specificarea căii și nici pentru pachetele descărcate cu `npm`. În cazul încărcării de scripturi din locațiile directorului aplicației, vor fi scrise începând cu punctul, care semnifică punctul de plecare locația fișierului din care se cheamă. Este un amănunt foarte important pentru care se poate rata instalarea.

```javascript
const express = require('express');
```

Pentru a ne asigura că resursele sunt găsite indiferent de sistemul de operare utilizat, se poate folosi modulul `path`.

```javascript
const path = require('path');
const rute = require(path.join(__dirname, 'module', 'rute.js'));
```

Calea absolută este oferită de `__dirname`.
În cazul în care `require()` indică către un director, fără a specifica numele fișierului, înseamnă că este căutat `index.js`.

## Mantre

- **module.exports** este obiectul returnat ca rezultat al unui apel `require()` în Node
- când faci cererea cu require folosește notația „./” pentru ca Node să știe că este vorba despre un modul local
- funcția exportată cu **module.exports** va fi intra în cache. Abia execuția variabilei referință ( care se încarcă cu evaluarea lui require ), va invoca codul din modul.
- fiecare modul este încărcat și evaluat prima dată când se face require. Orice apel a lui require cu numele modului, va returna versiunea din cache.
- Dincolo de a fi un sistem de încărcare a dependințelor, este și un instrument pentru construirea API-urilor prin posibilitățile de export și expunere selectivă a funcționalităților.
- Devine o bună practică folosirea lui `const` atunci când ceri module în Node.js pentru ca variabila care identifică modulul să nu fie accidental reasignată

```js
// șabloane de export
exports.numePropPublica = function(x){console.log(x);};

module.exports = {};

module.exports.obj = {};

exports.obj = {};
```

## Lămuriri cu privire la folosirea lui exports și module.exports în Node

[Node spune](http://nodejs.org/docs/v0.4.2/api/globals.html#module) că **module** este o referință către modulul curent. În particular, **module.exports** este același obiect precum **exports**. Astfel, **exports** poate fi considerat un alias a lui **module.exports**.

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
