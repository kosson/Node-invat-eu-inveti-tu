# Modularizarea în Node

## Introducere

JavaScript este un limbaj de programare care nu a avut din start suport pentru module. Singura metodă de a modulariza codul era prin setarea unor variabile globale. Inconvenientul este evident de vreme ce poți atribui altă valoare unui identificator pierzând referința la valoarea preexistentă. O altă variantă a fost introducerea codului în funcții, care erau autoexecutabile (IIFE - Immediately Invoked Function Expression), returnând un obiect, care se prezenta ca o interfață. Acest model de organizare se numește *revealing module pattern* și reușește crearea unui mediu lexical încapsulat, separat de global scope.

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

## Module CommonJS în Node.js

Sistemul de modularizare al Node.js este bazat pe implementarea de Singleton-uri. Sistemul de modularizare în Node.js se numește [CommonJS](https://requirejs.org/docs/commonjs.html) și folosește cuvântul cheie `require` pentru a importa funcții, variabile și clase. În acest moment, Node.js folosește și sintaxa de gestiune a modulelor ES6 (*ESM*), folosind cuvântul cheie `import`. Suportul pentru module ESM a fost introdus odată cu versiunea 13.2. Implementarea este diferită de cea a browserului. Node.js folosește module care se află doar pe sistemul local.

În Nodejs, modulele permit organizarea codului mai eficientă, precum și expunerea funcționalităților necesare printr-o interfață publică: `module.exports`. Unul din motivele pentru care este folosit sistemul de module, este acela pentru că oferă incapsulare codului din modul. Este ca și cum ai avea codul izolat într-o funcție auto-executabilă: `(function () { })();`. Tot codul care este declarat în modul, nu poate fi accesat din afară.

Pentru a expune funcționalitățile modulului, se vor folosi identificatorii cu rol special `export` și `module.exports`.

## Ce este un modul

În Node.js fiecare fișier este tratat ca un modul în sine. Un fișier poate fi introdus din necesitate în economia unui script.

În interiorul motorului V8, implementarea modulelor conform CommonJS se rezumă la ambalarea codului propriu într-o expresie de funcție căreia îi sunt pasate câteva referințe esențiale pentru a face posibilă modularizarea.

```javascript
(function (exports, require, module, __filename, __filename) {
    // aici este codul sursă scris de tine!!!
});
```

Privind acest fragment (poți explora modul de funcționare cu Debugger-ul), realizăm că din start, codul propriu are acces la obiectele care vor fi vehiculul prin care vom putea colporta funcționalități în alte module. Ca ultim pas după executarea codului sursă pe care tu l-ai scris, motorul V8 va face un return lui `module.export`, ceea ce va expune entitățile care s-au format prin evaluarea codului tău. Aceasta este puntea cu restul modulelor care îl vor cere pe acesta. Poți să gândești propriul cod precum corpul expresiei de funcție anonimă cu care motorul îl va înveli.

Toate variabilele locale ale unui modul sunt considerate private; modulele au propriul lor mediu lexical. Acest lucru înseamnă că nu ai acces la variabilele unui modul la rularea codului. De regulă, fragmentul de text pe care îl pasezi lui `require('./numemodul')` este și calea către modul, fără a mai preciza extensia `.js`, pe care motorul V8 o completează automat.

Cererea pentru un modul se face prin apelarea funcției `require('nume_modul')`. Această operațiune este una sincronă, însemnând că se va proceda la o localizare a fișierului JavaScript, citirea acestuia și construirea tuturor legăturilor la valorile din memorie. Dacă a fost apelat o dată, modulul va intra într-un cache din care va fi disponibil ori de câte ori va mai fi cerut din interiorul aplicației sau din alte module.

Reține faptul că un modul poate modifica orice entitate aflată în global space, aici fiind incluse și obiectele care sunt în cache.

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

## Cum funcționează modularizarea CommonJS

După cum spuneam, într-un fișier principal, care este numit `server.js` sau `index.js` sau `app.js` sau `main.js` (istoric vorbind, multe variante au fost și sunt în circulație), este invocată funcția `require()` cu un parametru care este numele modulului. Rezultatul este identificat cu o variabilă, care experiența practică ne sfătuiește să fie un `const`.

```javascript
const express = require('express');
```

Invocarea funcției, returnează un obiect. Putem să ne închipuim modulele precum niște fragmente de care depinde funcționarea întregii aplicații. În unele lucrări sunt numite de-a dreptul **dependințe**. În cazul Express.js este nevoie și de o instanțiere prin `express()`.

Ar fi util să privim mai îndeaproape cum lucrează modularizarea. Să presupunem că avem codul unui modul care expune o funcție.

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

```javascript
// șabloane de export
exports.numePropPublica = function (x) {
  console.log(x);
};

module.exports = {};

module.exports.obj = {};

exports.obj = {};
```

Reține faptul că în Node.js putem exporta valori adăugând proprietăți obiectului `exports` folosind `exports.identificator`.

## module.exports versus exports

Trebuie spus faptul că `exports` și `module.exports` sunt două obiecte diferite în Node.js.

### Crearea de namespace-uri cu exports

Pentru a nu distruge alias-ul, nu atribui niciodată direct lui `exports` nicio valoare (`exports =  function () {}`). Ferește-te de această greșeală. Gândește-l pe `exports` ca un obiect care trebuie populat. Această metodă de a face exporturile, se numește *named exports*.

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

Mai trebuie precizat faptul că atunci când faci o atribuire directă a unei valori obiectului `exports`, obiectul va deveni valoarea care îi este atribuită. Pur și simplu, identificatorul `exports` va fi suprascris cu ceea ce îi este atribuit.

Folosirea de *named exports* se face atunci când dorești să tratezi un modul ca pe un *namespace* al mai multor funcționalități înrudite.

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

### Exportul unei funcționalități unice cu module.exports

Pentru a evita poluarea mediului global, ai putea împacheta serviciile într-o funcție, pe care să o exportăm. Funcția exportată se comportă precum un namespace. Acest mod de lucru este larg răspândit și în comunitate este numit *substack pattern*. Avantajul este legat de faptul că există un singur punct de intrare.

```javascript
// modul.js expune
module.exports = function spun () { console.log('bau')};
// app.js care importă
var spun = require('./modul.js');
spun();
```

#### Exportul unui constructor sau al unei clase

Pentru a pune la dispoziție un obiect complex, care oferă mai multe funcționalități, se va folosi obiectul `module`, atribuind obiectul proprietății `exports`.

```javascript
module.exports = function obiectComplex () {
    this.ceva = 'un fragment de text';
};
```

Obiectul `module` reprezintă chiar modulul curent, iar valoarea lui `modul.exports` reprezintă chiar obiectul care va fi returnat celor ce vor folosi acest modul.

##### Exportul unui contructor

Poți exporta un obiect simplu instanțiat dintr-un constructor.

```javascript
// modul.js
var Obiect = function () {};
Obiect.prototype.cevaNou = function () {
    console.log('bau');
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
    console.log('bau');
};
exports.Obi = new Obiect();
// app.js
var obi = require('./modul').Obi;
obi.cevaNou();
```

În cazul în care vei instanția de mai multe ori obiectul, acesta va fi același pentru că de fiecare dată când vom instanția, nu vom crea un obiect nou, ci ne va fi servit din cache o referință către primul.

```javascript
module.exports = new Obiect(); // înlocuiește obiectul exports cu cel nou creat.
// app.js
var obi1 = require('./modul');
var obi2 = require('./modul');
// obi2 nu va fi un obiect nou, ci o referință către `obi1`.
```

Vei obține două obiecte separate doar dacă exporți constructorul.

```javascript
module.exports = Obiect;
```

##### Exportul unei clase

Un modul care exportă o clasă poate fi considerat o specializare a celui care exportă o funcție. Ceea ce aduce în plus este faptul că poate crea noi instanțe și putem să le extindem.

```javascript
// modul1.js
class Comunicator {
  constructor (cine) {
    this.cine = cine;
  }
  zice (continut) {
    console.log(`${this.cine} zice: ${continut}`);
  }
}
```

Pentru a utiliza clasa vom face un require.

```javascript
// index.js
const Comunicator = require('./modul1');
let primulComunicator = new Comunicator('Ionuț');
primulComunicator.zice('Florile de cireș sunt superbe!');
let alDoileaComunicator = new Comunicator('Adela');
alDoileaComunicator.zice('Vom sădi noi lăstari de coacăz');
```

Pentru a crea instanțe care mențin o anumită stare, vom exporta obiectul deja instanțiat. De fiecare dată când este cerut modului, datorită caching-ului, vor obține aceeași instanță a obiectului și astfel, vom realiza o stare accesibilă mai multor consumatori. Vorbim tot despre un Singleton.

```javascript
// modul1.js
class Comunicator {
  constructor (cine) {
    this.deCateOri = 0;
    this.cine = cine;
  }
  zice (continut) {
    this.deCateOri++;
    console.log(`${this.cine} zice: ${continut}`);
  }
}
module.exports = new Comunicator('NIMENI');
```

Chiar dacă vorbim despre un model bazat pe un Singleton, faptul că folosim clase, ne permite, în cazul în care este necesar, o instanțiere separată de cea din cache chiar dacă nu exportăm clasa.

```javascript
// index.js
const Comunicator = require('./modul1');
const unNouObiComunicator = new Comunicator.constructor('CINEVA');
```

Atenție, în cazul în care clasa nu este exportată de autor, nu se va forța instanțierea folosind metoda prezentată mai sus.

## Exportul de variabile globale

În modul, poți crea variabile globale pe care mai apoi să le expui celui care importă modulul.

```javascript
// modul.js expune
var ceva = function c () {}
// modul care importa
require('./modul.js');
```

Acest mod de a expune funcționalitățile modulelor este de evitat.

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

### Monkey patching

Petru că un modul are posibilitatea de a modifica entitățile din global space și obiectele care sunt cache-uite, se pot modifica obiecte la momentul runtime-ului. Această metodă nu este încurajată, dar din motive de testare, se poate aplica.

```javascript
// patch.js
require('./modul1').numeFunctieNoua = function () {
  // cod
}

//index.js
require('./patch'); // mai întâi injectezi funcția ca patch
const numeModulPatchuit = require('./modul1'); // apoi constitui o instanță
// acum în `numeModulPatchuit` ai acces la funcția injectată
```

### Gestionarea folosind condiții

Gestionarea modulelor folosind CommonJS permite încărcarea unui modul în funcție de satisfacerea unor criterii.

```javascript
let modul = null;
if (ceva === true) {
  modul = require('./modul1');
} else {
  modul = requite('./modul2');
}
```

## Module ESM

Node.js a început să implementeze sistemul de module ESM (ECMAScript Modules). Pentru că pentru modulele implementate folosind CommonJS, folosesc fișiere cu extensia `.js`, pentru a folosi sistemul modular al ES6, va folosi fișiere cu extensia `.mjs`. Modulele ESM vor fi încărcate asincron. Diferența dintre modulele CommonJS și ESM este că cele ESM trebuie încărcate la începutul modulului și nu pot fi gestionate în structuri decizionale. Faptul că încărcare se face la început, se poate face tree shacking.

Reține faptul că Node.js consideră că toate fișierele cu extensia `.js` onorează CommonJS. Astfel, utilizarea sintaxei ESM într-un fișier cu extensia `.js` va rezulta într-o stare de eroare. Pentru ca un modul să-i semnaleze lui Node.js faptul că trebuie să onoreze sintaxa ESM, trebuie ca fișierul modulului să aibă extensia `.mjs`. Mai trebuie adăugat în fișierul `package.json` al celui mai apropiat părinte, un câmp `"type": "module"`.

### Exportul din module ESM

Entitățile exportate dintr-un modul ESM, vor fi declarate folosind cuvântul cheie `export`.

```javascript
// test.mjs
function facCeva () {
    return 'ceva';
};
export facCeva;
export default obi = {'a': 1};
```

Cuvântul cheie `export` poate fi pus înaintea declarației unei valori, a unei funcții sau unei clase. Cuvântul cheie `default` indică ceea ce expune din oficiu modulul atunci când este importat.

În cazul în care este necesar, se poate face un export `default`.

```javascript
// modul1.js
export default class Ceva {
  constructor (date) {
    this.date = date;
  }
  facCeva (val) {
    return this.date.a + val;
  }
}
// index.js
import Ceva from './modul1.js';
const instantaNoua = new Ceva({a: 10});
instantaNoua.facCeva('2');
```

În cazul în care este necesar, poți exporta un `default`, dar și o funcție separată sau oricare altă entitate.

```javascript
// modul1.js
export default function ceva () {};
export function altceva () {};
// index.js
import ceva, {altceva} from './modul1.js';
```

### Importul modulelor ESM

Pentru a folosi un modul ES6 va trebui să-l imporți folosind cuvântul cheie `import`. Ca efect, va fi importat în modulul curent, ceea ce a exportat cel vizat. Folosirea lui `import` pare similară lui `require`, ceea ce înseamnă, de fapt că va fi creat un obiect ale cărui proprietăți vor fi valorile exportate.

```javascript
import * as nume_identificare from 'test.mjs';
nume_identificare.facCeva();
```

În exemplu, `nume_identificare` stabilește un namespace. Trebuie remarcat că spre deosebire de modulele CommonJS, trebuie menționată extensia fișierului modulului.

În cazul în care ai nevoie doar de o parte a funcționalităților modulului ESM, se vor preciza entitățile care se doresc.

```javascript
import {functiaAia} from 'modulul1.js';
functiaAia('Bau!');
```

În cazul în care avem conflicte cu entități existente, am putea redenumi entitatea importată.

```javascript
import {log as logAlt} from './modul1.mjs';
```

### Module CommonJS în cele ESM

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

## Resurse

- [Modules: CommonJS modules](https://nodejs.org/api/modules.html)
- Merită urmărit [răspunsul de pe Stackoverflow](http://stackoverflow.com/questions/5311334/what-is-the-purpose-of-node-js-module-exports-and-how-do-you-use-it).
- [ECMAScript Modules](https://nodejs.org/api/esm.html)
