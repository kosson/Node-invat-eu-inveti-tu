## Șablonul „singleton”

Acest șablon este folosit pentru a „conserva” starea unei aplicații. Odată modificată o valoare din singleton, această modificare se repercutează la nivelul întregului cod.

```js
// modul.js
var valPrivata = 10;

module.exports = {
  publica: 25
};

// în app.js
var modul = require('./modul');
console.log(modul.valPrivata); // undefined
console.log(modul.publica); // 25
// dacă acum introduc o modificare a valorii lui „publica”
modul.publica++;
// valoarea din singleton se va incrementa și se va reflecta în întreaga aplicație
// dacă am avea un alt fișier, să zicem suma.js în care se face require la modul, vom avea acces la valoarea modificată
var modul = require('./modul');
console.log(modul.publica); // 26
```
