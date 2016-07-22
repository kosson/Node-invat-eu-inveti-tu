## Șablonul „plugin”

Ținta este de a realiza un singur punct de intrare. Se importă un director întreg. În director există multiple fișiere js fiecare cu funcționalități diferite necesare pentru aplicație. Acestea sunt exportate prin intermediul unui fișier tip opis - index.js.

```js
// în main.js
var rute = require('./rutari');

// în rutari/index.js
module.exports = {
  utilizatori: require('./utilizatori.js'),
  conturi: require('./conturi.js')
};
```

Acest șablon este folosit și de npm.
