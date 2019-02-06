# Modularizarea în Node

## Introducere

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

Node.js implementează modularitatea folosind [CommonJS](https://requirejs.org/docs/commonjs.html). Acest lucru permite organizarea codului mai eficientă și expunerea funcționalităților necesare printr-o interfață publică: `module.exports`. unul din motivele pentru care este folosit sistemul de module, este acela pentru că oferă incapsulare codului din modul. Este ca și cum ai avea codul izolat într-o funcție auto-executabilă: `(function () { })();`. Tot codul care este declarat în modul, nu poate fi accesat din afară.

## Ce este un modul

În Node.js fiecare fișier este tratat ca un modul în sine. În interiorul motorului V8, implementarea modulelor conform CommonJS se rezumă la ambalarea codului propriu într-o expresie de funcție căreia îi sunt pasate câteva referințe esențiale pentru a face posibilă modularizarea.

```javascript
(function (exports, require, module, __filename, __filename) {
    // aici este codul sursă scris de tine!!!
});
```

Privind acest fragment (poți explora modul de funcționare cu Debugger-ul), realizăm că din start, codul prorpiu are acces la obiectele care vor fi vehiculul prin care vom putea colporta funcționalități în alte module. Ca ultim pas după executarea codului sursă pe care tu l-ai scris, motorul V8 va face un return lui `module.export`, ceea ce va expune entitățile care s-au format prin evaluarea codului tău. Aceasta este puntea cu restul modulelor care îl vor cere pe acesta. Poți să gândești propriul cod precum corpul expresiei de funcție anonimă cu care motorul îl va înveli.

Toate variabilele locale ale unui modul sunt considerate private. De regulă, fragmentul de text pe care îl pasezi lui `require('./numemodul')` este și calea către modul, fără a mai preciza extensia `.js`, pe care motorul V8 o completează automat. Însuși efortul de standardizare al JavaScript a pornit pe calea modularizării de ceva timp. Node.js folosește standardele CommonJS, dar mai nou, oferă suport și pentru modulele introduse de versiunea ES2015.

Cererea pentru un modul se face prin apelarea funcției `require('nume_modul')`. Această operațiune este una sincronă, însemnând că se va proceda la o localizare a fișierului JavaScript, citirea acestuia și construirea tuturor legăturilor la valorile din memorie. Dacă a fost apelat o dată, modulul va intra într-un cache din care va fi disponibil ori de câte ori va mai fi cerut din interiorul aplicației sau din alte module.

### Module complexe

Uneori este nevoie să grupezi mai multe fișiere într-un singur modul. Ceea ce va face `require()` este să caute în directorul specificat ca argument un fișier `index.js` pe care să-l încarce ca punct de acces.

```text
nume_aplicatie
 - nume_modul
   - index.js
   - x-module.js
   - y-module.js
 - app.js
```

Pentru ca totul să funcționeze, în `nume_modul`, fișierul `index.js` trebuie să agrege celelalte module din director și să le expună prin `module.exports` folosind un obiect literal, de exemplu.

```javascript
// nume_modul/index.js
var x = require('./x-module');
var y = require('./y-module');

module.exports = {
    x: x,
    y: y
}
// app.js
var nume_modul = require('./nume_modul');
```

### Import de date

Mecanismele modulare ale Node.js oferă posibilitatea de a cere și fișiere `.json`, care pot conține date. Acestea odată introduse prin `var date = require('./date-lucru.json');`, structura JSON va fi convertită într-un obiect JavaScript pe care puteți să-l folosiți.

## Cum funcționează modularizarea

După cum spuneam, într-un fișier principal, care este numit `server.js` sau `index.js` sau `app.js` sau `main.js` (istoric vorbind, multe variante au fost și sunt în circulație), este invocată funcția `require()` cu un parametru care este numele modulului. Rezultatul este identificat cu o variabilă, care experiența practică ne sfătuiește să fie un `const`.

```javascript
const express = require('express');
```

Invocarea funcției, returnează un obiect. Putem să ne închipuim modulele precum niște fragmente de care depinde funcționarea întregii aplicații. În unele lucrări sunt numite de-a dreptul **dependințe**. În cazul Express este nevoie și de o instanțiere prin `express()`.

Ar fi util să privim mai îndeaproape cum lucrează modularizarea. Să presupunem că avem codul unui modul și acesta expune o funcție.

```javascript
// fisierul salutare.js
function salutari (nume) {
    console.log('Salut ' + nume);
};
module.exports = salutari;

// fișierul index.js
const salut = require('./salutari');
/* presupunem că ambele fișiere stau în aceeași rădăcină */ 
salut('Ioanide');
```

Ce se petrece în spate este o împachetare a codului din modulul `salutare.js` într-o structură de execuție care permite modularizarea.

```javascript
(function (exports, require, module, __filename, __dirname) {
    function salutari (nume) {
        console.log('Salut ' + nume);
    };
    module.exports = salutari;
})
```

Acesta este motivul pentru care funcția noastră are acces la `module` și la `exports`. Variabila `module` este o referință către modulul curent în curs de editare. Referința `module.exports` este obiectul sau valoarea la care va avea acces utilizatorul care va importa modulul.

### Caching

Făcând primul apel `require` pentru a încărca un modul, Node.js va folosi un mecanism de caching prin care va păstra referința către obiectul sau valoarea adusă. Acest lucru înseamnă că de fiecare dată când modulul va fi cerut în diferitele părți ale aplicației, se va face o legătură la același obiect, dacă acesta a mai fost cerut anterior.

Te poți gândi la module ca la niște obiecte Singleton, care își păstrează starea pe toată perioada de viață a aplicației.

## Exportul valorilor

Obiectul `module` reprezintă chiar modulul curent, iar valoarea lui `module.exports` reprezintă chiar obiectul care va fi returnat celor ce vor folosi acest modul. Toate variabilele definite într-un modul nu vor ajunge în obiectul `global`. Obiectul `exports` este un alias pentru `module.exports`.

Reține faptul că în Node.js putem exporta valori adăugând proprietăți obiectului `exports` folosind `exports.identificator`. Node.js permite exportul unui string simplu, unui număr, une funcții sau al unui obiect complex.

```javascript
// obiect
const obiect = {a: 1};
exports.un_obiect = obiect;
// funcție
exports.o_functie = function adauga (a, b) {
    return a + b; // returnează valoarea calculată
};
// valoare
module.exports.varsta = 12;
```

Mai trebuie precizat faptul că atunci când faci o atribuire a unei valori obiectului `exports`, obiectul va deveni valoarea care îi este atribuită. pur ți simplu, identificatorul `exports` va fi suprascris cu ceea ce îi este atribuit.

### Exportul de variabile globale

În modul, poți crea variabile globale pe care mai apoi să le expui celui care importă modulul.

```javascript
// modul.js expune
var ceva = function c () {}
// modul care importa
require('./modul.js');
```

Acest mod de a expune funcționalitățile modulelor este de evitat.

### Exportul unei funcții anonime

Pentru a evita poluarea mediului global, ai putea împacheta serviciile într-o funcție, pe care să o exportăm.

```javascript
// modul.js expune
module.exports = function spun () { console.log('bau')};
// app.js care importă
var spun = require('./modul.js');
spun();
```

### Exportul unei funcții numite

Un alt model în locul suprascrierii valorii lui `exports` este de dorit. Ceea ce se poate face este să populăm cu proprietăți obiectul `exports`.

```javascript
// modul.js expune
exports.facCeva = function () {
    console.log('fac și eu ceva');
};
// este echivalent cu
module.exports.faceCeva = function () {
    console.log('fac și eu ceva');
};
// app.js care importă
var faceCeva = require('./modul.js').faceCeva;
```

Popularea obiectului `exports` cu proprietăți va necesita la momentul `require` să fie specificată care proprietate se dorește a fi atribuită identificatorului. Dacă nu am fi precizat numele cheii (`require('./modul.js').faceCeva`), în cazul `faceCeva` am atribui întregul obiect `exports` acestuia.

### Exportul unui obiect

Poți exporta un obiect simplu instanțiat dintr-un constructor.

```javascript
// modul.js
var Obiect = function () {};
Obiect.prototype.cevaNou = function () {
    console.log('bau`);
};
module.exports = new Obiect(); // înlocuiește obiectul exports cu cel nou creat.
// app.js
var obi = require('./modul');
obi.cevaNou();
```

sau poți specifica direct care să fie numele obiectului.

```javascript
// modul.js
var Obiect = function () {};
Obiect.prototype.cevaNou = function () {
    console.log('bau`);
};
exports.Obi = new Obiect();
// app.js
var obi = require('./modul').Obi;
obi.cevaNou();
```

### Exportul unui prototype

Uneori este necesară instanțierea unui obiect din modulul în care ajunge. Pentru a realiza acest lucru, vom exporta funcția constructur cu un obiect prototipal îmbogățit.

```javascript
// modul.js
var Obiect = function () {};
Obiect.prototype.cevaNou = function () {
    console.log('bau`);
};
module.exports = Obiect;
// app.js
var Obi = require('./modul');
var obiNou = new Obi();
obiNou();
```

Ai putea exporta un constructor care să aibă nume.

```javascript
// modul.js
var Obiect = function () {};
Obiect.prototype.cevaNou = function () {
    console.log('bau`);
};
exports.Obiect = Obiect;
// app.js
var Obi = require('./modul').Obiect;
var obiNou = new Obi();
obiNou();
```

### Exportul altor module

Poți exporta module care abia au fost cerute. Acesta este cazul în care agregi într-un modul mai multe alte volume. Acest lucru permite centralizarea setărilor într-un director dedicat, unde există separat pentru fiecarea serviciu configurările necesare și un obiect Singleton central (`config.js`), care le importă pe restul expunându-le rând pe rând cu `module.exports`.

```javascript
// fișier config.js
exports.redis = require('./redis');
exports.mongodb = require('./mongodb');
```

Ceea ce permite o astfel de schemă este expunerea accesului la configurările și operaționalizarea unui serviciu ca un modul accesibil tuturor celor care au nevoie de el.

```javascript
// redis.js
var Redis   = require('redis');
var config  = require('./config').redis;
/* realizează conexiunea */
var rclient = Redis.createClient(config.port, config.host, config.options);
/* expune conexiunea realizată */
module.exports = rclient;
```

Pentru toate modulele care necesită conectare la Redis, tot ce va fi nevoie este să chemi `var redis = require('./redis');`.

## Folosirea modulelor

Pentru a accesa un modul, se va folosi funcția `require` căreia îi este pasat calea relativă sau absolută a fișierului care reprezintă modulul. Aceste module, fie provin dintr-un depozit extern așa cum este npmjs.com, fie pot fi constituite local. Dacă nu este specificată calea, atunci Node.js va căuta în modulele instalate - `node_modules`.
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

## Module ES6

Node.js a început să implementeze sistemul de module din ES6. Pentru că pentru modulele implementate folosind CommonJS, folosesc fișiere cu extensia `.js`, pentru a folosi sistemul modular al ES6, va folosi fișiere cu extensia `.mjs`. Modulele ES6 vor fi încărcate asincron.
Entitățile exportate dintr-un modul ES6, vor fi declarate folosind cuvântul cheie `export`.

```javascript
// test.mjs
function facCeva () {
    return 'ceva';
};
export facCeva;
export default obi = {'a': 1};
```

Cuvântul cheie `export` poate fi pus înaintea declarației unei valori, a unei funcții sau unei clase. Cuvântul cheie `default` indică ceea ce expune din oficiu modulul atunci când este importat.

Pentru a folosi un modul ES6 va trebui să-l imporți folosind cuvântul cheie `import`. Ca efect, va fi importat în modulul curent, ceea ce a exportat cel vizat. Folosirea lui `import` pare similară lui `require`, ceea ce înseamnă, de fapt că va fi creat un obiect ale cărui proprietăți vor fi valorile exportate.

```javascript
import * as nume_identificare from 'test.mjs';
nume_identificare.facCeva(); 
```

### Module Node.js în cele ES6

Într-un modul ES6 se pot cere module Node.js.

```javascript
// modul.mjs
import fs from 'fs';
import util from 'util';
const fsp = fs.promises;
```

Invers nu funcționează, adică să ceri un modul ES6 dintr-unul Node.js pentru că implementarea modului de căutare a celor două diferă.

## Module din directoare

Până în acest moment ceea ce înțelegeam prim nodul, se înțelegea solicitarea unui singur fișier care conținea codul respectivului modul. Node.js permite importul a mai multor resurse, care sunt grupate într-un director, fiind descrise de un fișier `package.json`. Un astfel de modul se numește **pachet**.

Să presupunem că într-un director numit `pachetulMeu` avem un fișier care poartă codul modului nostru în subdirectorul `./lib` și `package.json`, care descrie pachetul.

```javascript
{
    name: "pachetulMeu",
    main: "./lib/pachetfain.js"
}
```

Dacă această structură se află în directorul `pachetfain`, atunci când va fi cerut cu `require('./pachetfain')`, Node.js va încărca și compila conținutul fișierului din `./pachetfain/lib/pachetfain.js`. În cazul în care Node.js nu găsește fișierul `package.json`, va căuta `index.js` sau `index.node`.

Acest model este urmat de pachetele pe care `npm` le gestionează.

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

- Merită urmărit [răspunsul de pe Stackoverflow](http://stackoverflow.com/questions/5311334/what-is-the-purpose-of-node-js-module-exports-and-how-do-you-use-it).
- [ECMAScript Modules](https://nodejs.org/api/esm.html)