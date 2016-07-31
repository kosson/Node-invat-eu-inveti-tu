# Named exports

Constă în a face public proprietățile obiectului `exports` însuși sau lui `module.exports`. Obiectul rezultat se comportă ca un namespace pentru un set de funcționalități înrudite.

```js
// functionalitate.js
exports.descriere = function(nume){
  console.log('Numele funcționalității' + nume);
};

exports.actiune = function(actiunea){
  console.log('Face ' + actiunea);
};

// app.js
var instrument = require('./functionalitate');
instrument.descriere('Ciocan');
instrument.actiune('lovește');
```

Funcțiile exportate sunt disponibile mai apoi ca proprietăți ale modulului încărcat.

Dat fiind faptul că Node.js folosește standardul CommonJS pentru modularizare, acesta presupune că ceea ce dorești să expui este public.

Pentru a lucra cu șabloane care permit o ascundere a funcționalităților și expunerea a ceea ce este util, Node.js propune folosirea lui module.export.
