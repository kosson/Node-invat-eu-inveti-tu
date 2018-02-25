# Totul in Mongoose pornește de la o schema.

Fiecare schema se mapează pe o colecție MongoDB.

Vezi exemplul dat [la capitolul dedicat acestora](http://mongoosejs.com/docs/guide.html) din documentația oficială.
Schema indică numele câmpurilor și tipurile datelor.

## Creează un model

```javascript
// creezi fișierul în app/models/bear.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BearSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Bear', BearSchema);
```
**ATENȚIE!** module.exports este obiectul returnat ca rezultat al unui apel require în Node. Se folosește module.exports pentru cazul în care dorești să accesezi o funcție care să fie utilă și nu doar un simplu obiect cu proprietăți. Este și cazul nostru.

## Cere modelul bazei de date în scriptul de server:

```js
var Bear = require('./app/models/bear'); //ai acces la obiectul de tip model Bear
```

**ATENȚIE!** Când faci cererea cu require folosește notație „./” pentru ca Node să știe că este vorba despre un modul local.
