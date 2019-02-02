# Util

Acest modul servește mecanismelor interne Node.js, dar funcțiile sale sunt oferite și programatorilor.

## util.callbackify(original)

Primește drept argument o funcție async sau o promisiune și returnează o funcție prezentând comportamentul unui callback. Din noul rol de callback Node.js, funcția va primi la obiectul error, motivul respingerii promisiunii, dar în cazul rezolvării, va primi `null`. Cel de-al doilea argument va fi valoarea rezolvată.

```javascript
const util = require('util');

async function returnez () {
  return 'ceva';
}
const transformata = util.callbackify(returnez);

transformata( (err, res) => {
  if (err) throw err;
  console.log(res);
});
```

## util.promisify(original)

Metoda ia o funcție care are drept prim argument obiectul de eroare urmat de un callback (tipicul callback-ului Node.js) și returnează o versiune promisificată a acesteia.

```javascript
const fs = require('fs');
const util = require('util');
const promisificata = util.promisify(fs.readdir);

(async () => {
  const resurse = await promisificata('.');
  for (let nume of resurse) {
    console.log(nume);
  }
})().catch(err => { 
    console.error(err); 
});
```
