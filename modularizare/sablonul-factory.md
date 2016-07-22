## Șablon „factory” pentru obiecte

Folosit ori de câte ori avem nevoie de un obiect de un anumit tip.

```js
module.exports = function(optiuni){
  // inițializare -> algoritmul de contrucție al obiectului
  var obi = {val: 0};
  return {
    getCeva: function(){ /* obține ceva */ },
    cautaCeva: function(){},
    oValoare: obi.val || 2
  }
}
```

Pentru folosirea moștenirii prototipale, se poate folosi utilitarul `util` deja existent în Node.js

```js
require('util').inherits(copil, parinte);
```
