# Șablonul constructor

Un modul care exportă un contructor, de fapt exportă o funcție.
Ceea ce este permis utilizatorului este ca acesta să creeze noi instanțe și să extindă prototipul.
Exportarea unui constructor sau a unei clase (ECMAScript 2015) oferă tot un punct de intrare unic pentru modul. Comparativ cu șablonul substack, acest modul expune mai mult mecanismele interne, ceea ce în schimb poate fi receptat ca un mecanism puternic de extindere a funcționalității.

```js
// modul.js
function Tester(ceva){
  this.ceva = ceva;
};

Tester.prototype.raspunde = function(mesaj){
  console.log('Te îngân: ' + mesaj);
};

module.exports = Tester;

// main.js
var Tester = require('./modul');

var urla = new Tester('Se aude?');
console.log(urla.ceva);
urla.raspunde('Un ecou...');
/*
 Se aude?
 Te îngân: Un ecou...
 */
```

EcmaScript 2015 introduce sintaxa clasei, fiind, de fapt un ambalaj sintactic pentru constructori.

```js
class Tester{
  constructor(ceva){
    this.ceva = ceva;
  }
  raspunde(mesaj){
    console.log(`Te îngân: ${mesaj}`);
  }
};

module.exports = Tester;

// main.js
var Tester = require('./modul');

var urla = new Tester('Se aude?');
console.log(urla.ceva);
urla.raspunde('Un ecou...');
/*
 Se aude?
 Te îngân: Un ecou...
 */
```

Este un șablon foarte puternic pentru că permite utilizatorului să extindă modulul importat prin lanțul prototipal oferit.

Un mic truc oferă posibilitatea transformării într-un `factory` iar acest lucru previne folosirea modului fără `new`:

```js
// modul.js
function Tester(ceva){
  if(!(this instanceOf Tester)){
    return new Tester(ceva);
  }
  this.ceva = ceva;
};
module.exports = Tester;
```

ES2015 introduce o proprietate nouă `new.target` care este disponibilă tuturor funcțiilor și care rezolvă la `true` dacă funcția a fost invocată cu `new`.

```js
// modul.js
function Tester(ceva){
  if(!new.target){
    return new Tester(ceva);
  }
  this.ceva = ceva;
};
module.exports = Tester;
```

Ceea ce face acest truc este de a verifica dacă `this` există și dacă este o instanță a lui Tester. Dacă este false, înseamnă că Tester() a fost invocat fără new și se face un serviciu returnându-se o instanță corespunzătoare.

Se poate face și export de instanțe ale modulelor. Sunt utile atunci când dorești să conservi starea într-o aplicație.

```js
// modul.js
function Ubique(mesaj){
  this.mesaj = mesaj;
  this.contor = 0;
};
Ubique.prototype.afiseaza = function afiseaza(text){
  this.contor++;
  console.log('Ce apare în consola: ' + mesaj + text + '(' + contor ' mesaje primite)');
  this.mesaj = text;
};
module.exports = new Ubique('START');

// main.js
var inspector = require('./modul');
inspector.mesaj;
inspector.afiseaza('ceva de test');
inspector.mesaj;
inspector.contor;
```

Pentru că modulul este cașat (cached), fiecare modul care cere modulul Ubique, de fapt va obține de fiecare dată aceeași instanță a obiectului și astfel având access toți la aceeași stare reflectată de instanțiere. Pentru că este oferit acces prin lanțul prototipal, nu este garantată unicitatea la nivel de aplicație așa cum o face șablonul Singleton.
