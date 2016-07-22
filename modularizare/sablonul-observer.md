## Șablonul Observer

Este folosit atunci când un callback nu mai reușește să ofere funcționalități mai dinamice.

Problema este că un callback este apelat o singură dată și se declanșează la finalul rulării codului. Un callback nu poate fi eliminat și nici nu poate fi adăugat dinamic.

Dacă la finalizarea execuției unui modul importat ai nevoie doar de un singur event, este îndeajuns să pasezi un callback.

```js
var actiune = require('./actiune.js')(callback);
```

Pentru a rezolva aceste deficiențe ale callbac-urilor, se va folosi șablonul Observer cu emitere de evenimente.

```js
// modul.js
var util = require('util');

var Actiunea = function Actiunea(){
  this.faCeva = function(){
    // cod care face prelucrări
    activitate.emit('done', {amIncheiat: new Date()});
  };
};

util.inherits(Actiunea, require('events').EventEmitter);

module.exports = oActiune;

// main.js
var Actiunea = require('./modul.js');
var actiune = new Actiunea();

actiune.on('done', function(argument){
  console.log('Treburile au fost făcute la', argument.amIncheiat);
  actiune.removeAllListeners();
});

actiune.faCeva();
```
