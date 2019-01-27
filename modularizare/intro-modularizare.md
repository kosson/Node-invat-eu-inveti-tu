# Modularizarea în Node

JavaScript este un limbaj de programare care nu a avut din start suport pentru module. Singura metodă de a modulariza codul era prin setarea unor variabile globale. Inconvenientul este evident de vreme ce poți atribui altă valoare unui identificator pierzând referința la valoarea preexistentă. O altă variantă a fost introducerea codului în funcții, care erau autoexecutabile, returnând un obiect, care se prezenta ca o interfață.

```javascript
var modul = function mod01 () {
    var x = 10;
    return {
        adun: function (val) {
            console.log(x + val);
        }
    };
}();

modul.adun(3);
```

Și această metodă era supusă unor rigori de lucru privind ordinea de încărcare. În plus era mai mult de scris cod dedicat, adică funcția care returna obiectul, ș.a.m.d. Pentru a rezolva problemele menționate, dar și cu gândul de a rezolva posibilele circularități ale dependințelor (un modul x cere modulul y, care la rândul lui îl cere pe z, dar z are nevoie neapărat pe x), în practică s-a mai recurs la registre de dependințe. Acestea țineau evidența dependințelor, care pentru a evita încărcarea repetată, dacă *vedeau* că deja sunt încărcate, nu se mai executau.

```javascript
// registru
var modules = (function reg () {
    var module = {}; // un registru de evidență
    function define (nume_mod, functie) {
        // lazzy-loading
        if (module[nume_mod]) throw new Error('Modulul există deja și este încărcat!')

        var modul = {
            exports: {},
            func: functie,
            executat: false
        };
        module[nume_mod] = modul; // populezi obiectul modulelor
    };
    function require (nume_mod) {
        var modul = module[nume_mod];

        if(!modul) throw new Error('Nu există modulul cerut!')
        if(!modul.executed) {
            modul.executat = true;
            modul.func.call(module, modul, module.exports)
        }
        return modul.exports;
    };
    return {
        define: define, // expune metoda de lucru cu registrul
        require: require
    };
}());

// modul01.js
modules.define('primo', function mod01 () {
    var x = 10;
    return function adun (val) {
        return x + val;
    };
});

// modul02.js
modules.define('secundo', function mod02 () {
    var primo = modules.require('primo')(4);
    return {
        valoareCalculata: function dividCu (divizor) {            
            return primo / divizor;
        }
    }
});

// app
var ceva = modules.require('secundo');
console.log(ceva.valoareCalculata(3)); // 4.666666
```

Trebuie să-ți imaginezi aceste fragmente de cod fiecare în fișierul propriu. Odată strânse într-unul singur (operațiunea de bundling - `cat registru.js modul01.js modul02.js app.js > main.js`) vor funcționa corespunzător.

## Ce este un modul

Pur și simplu este un fișier JavaScript sau chiar o întreagă bibliotecă de cod. Acesta poate fi importat în alt cod folosindu-se funcția `require()` din Node. Însuși efortul de standardizare al JavaScript a pornit pe calea modularizării de ceva timp.

## Cum funcționează modularizarea

După cum spuneam, într-un fișier principal, care este numit `server.js` sau `index.js` sau `app.js` sau `main.js` (istoric vorbind, multe variante au fost și sunt în circulație), este invocată funcția `require()` cu un parametru care este numele modulului. Rezultatul este identificat cu o variabilă, care experiența practică ne sfătuiește să fie un `const`.

```javascript
const express = require('express');
```

Invocarea funcției, returnează un obiect.
Putem să ne închipuim modulele precum niște fragmente de care depinde funcționarea întregii aplicații. În unele lucrări sunt numite de-a dreptul **dependințe**. În cazul Express este nevoie și de o instanțiere prin `express()`.

## Exportul unor valori punctuale

În node putem exporta valori punctuale adăugând proprietăți obiectului `exports` folosind `exports.valoare`.

```javascript
const obiect = {a: 1};
exports.obiect = obiect;
exports.valoare = function adauga (a, b) {
    return a + b; // returnează valoarea calculată
};
```

## Exportul unui obiect

Pentru a pune la dispoziție un obiect complex, care oferă mai multe funcționalități, se va folosi obiectul `module`, atribuind obiectul proprietății `exports`.

```javascript
module.exports = function obiectComplex () {
    this.ceva = 'un fragment de text';
};
```

Obiectul `module` reprezintă chiar modulul curent, iar valoarea lui `modul.exports` reprezintă chiar obiectul care va fi returnat celor ce vor folosi acest modul.

## Folosirea modulelor

Pentru a accesa un modul, se va folosi funcția `require` căreia îi este pasat calea relativă sau absolută a fișierului care reprezintă modulul. Aceste module, fie provin dintr-un depozit extern așa cum este npmjs.com, fie pot fi constituite local.
Rolul lui `require` este acela de a găsi modulul, de a-l parsa și de a-l executa. La final, va returna valoarea exportată a modulului pe care o atribuim unei variabile locale pentru a avea o referință.
La momentul cererii unui modul, Node.js știe să completeze automat extensia `.js`. Deci, poți să o menționezi sau nu.

```javascript
var login = require('./models/login');
```

[Node spune](https://nodejs.org/docs/latest-v11.x/api/modules.html) că **module** este o referință către modulul curent. În particular, **module.exports** este același obiect precum **exports**. Astfel, **exports** poate fi considerat un alias a lui **module.exports**.

Pentru modulele care fac parte din nucleul ecosistemului de pachete Node.js, nu este nevoie specificarea căii și nici pentru pachetele descărcate cu `npm`. În cazul încărcării de scripturi din locațiile directorului aplicației, vor fi scrise începând cu punctul, care semnifică punctul de plecare locația fișierului din care se cheamă. Este un amănunt foarte important pentru care se poate rata instalarea.

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

- **module.exports** este obiectul returnat ca rezultat al unui apel `require()` în Node.js
- când faci cererea cu require folosește notația „./” pentru ca Node să știe că este vorba despre un modul local
- funcția exportată cu **module.exports** va fi intra în cache. Abia execuția variabilei referință ( care se încarcă cu evaluarea lui require ), va invoca codul din modul.
- fiecare modul este încărcat și evaluat prima dată când se face require. Orice apel a lui require cu numele modului, va returna versiunea din cache.
- Dincolo de a fi un sistem de încărcare a dependințelor, este și un instrument pentru construirea API-urilor prin posibilitățile de export și expunere selectivă a funcționalităților.
- Devine o bună practică folosirea lui `const` atunci când ceri module în Node.js pentru ca variabila care identifică modulul să nu fie accidental reasignată

```javascript
// șabloane de export
exports.numePropPublica = function(x){console.log(x);};

module.exports = {};

module.exports.obj = {};

exports.obj = {};
```

## Resurse

Merită urmărit [răspunsul de pe Stackoverflow](http://stackoverflow.com/questions/5311334/what-is-the-purpose-of-node-js-module-exports-and-how-do-you-use-it).