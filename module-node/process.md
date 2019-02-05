# Obiectul process

Acest obiect oferă informații despre procesele Node.js în desfășurare. Fiind un obiect global este disponibil fără a fi făcut un `require`. Este o instanță a lui `EventEmitter`.

## process.argv

Argv este prescurtarea de la *argument vector*. Această proprietate returnează un array cu toate argumentele din linia de comandă, care au fost pasate lui `node` la momentul invocării procesului.

Primul element din array va fi `process.execPath`. Cel de-al doilea argument este calea fișierului JavaScript care este executat. Cel de-al treilea element din array va fi numele fișierului care va fi executat. Restul argumentelor vor fi cele care au fost introduse de utilizator la invocarea lui *node*.

```javascript
// file-tracker.js
​const​ fs = require(​'fs'​);
​​const​ numefisier = process.argv[2];
​if​ (!numefisier) {
​   ​throw​ Error(​'Introdu numele fișierului'​);
​}
​fs.watch(numefisier, () => console.log(​`Fișierul ​${numefisier}​ a fost modificat.`​));
​console.log(​`Now watching ​${numefisier}​ for changes...`​);
// comanda din consola ​​node​​ file-tracker.js ​​ceva.txt​
```