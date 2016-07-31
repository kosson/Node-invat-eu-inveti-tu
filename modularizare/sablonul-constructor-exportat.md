# Șablonul constructor

Ceea ce este permis utilizatorului este ca acesta să creeze noi instanțe și să extindă prototipul.

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

Este un șablon foarte puternic pentru că permite utilizatorului să extindă modulul importat prin lanțul prototipal oferit.

Un mic truc oferă posibilitatea transformării într-un `factory`:

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
