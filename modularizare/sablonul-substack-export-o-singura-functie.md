# module.exports este asignat cu o funcție

Atribuirea unei funcții lui `module.exports` este unul dintre cele mai întâlnite practici în universul Node.js. Se concentrează, de fapt pe expunerea unei singure funcționalități.

Ceea ce se realizează este expunerea unei singure funcționalități, ceea ce s-ar traduce ca punct unic de intrare. Comuntatea chiar denumește acest mod de a realiza module `substack pattern`. Se poate folosi acest mod de export pentru a introduce alte API-uri.

```js
// functionalitate.js
module.exports = function(demo){
  console.log('Demo-ul conține: ' + demo);
};

// main.js
var activitate = require('./functionalitate');

activitate('lorem ipsum');
```

Pentru a expune funcția ca un namespace:

```js
// functionalitate.js
module.exports.tester = function(demo){
  console.log('Demo-ul conține: ' + demo);
};

// main.js
var activitate = require('./functionalitate');

activitate.tester('text de test pentru namespace');
// Demo-ul conține: ceva pentru testul namespace
```
