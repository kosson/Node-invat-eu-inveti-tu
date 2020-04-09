# beforeEach

Indică faptul că va repeta o operațiune ori de câte ori se va face un `save` în bază. Mongoose este un wrapper peste MongoDB. De exemplu, poți accesa direct o colecție din bază: `mongoose.connection.collections.numecolectie`.

De exemplu, cum ștergi toate înregistrările unei colecții mai înainte de a introduce una nouă. Acest lucru ar fi necesar pentru a face un test de conectare și încărcare date folosind Mocha, de exemplu.

```javascript
const mongoose = require('mongoose');
// MONGOOSE - Conectare la MongoDB
mongoose.set('useCreateIndex', true); // Evitare deprecation warning
mongoose.connect(process.env.MONGO_LOCAL_CONN, {useNewUrlParser: true});
mongoose.connection.on('error', function () {
    console.warn('Database connection failure');
    process.exit();
});
mongoose.connection.once('open', function () {
    console.log("Database connection succeded");
});

// Înainte de a face orice cu baza de date, mai întâi rulează ce este în beforeEach
beforeEach((done) => {
  mongoose.connection.collections.competente.drop(() => {
    // fă ce ai de făcut după ce s-a făcut drop
    done();
  });
});
```

Să presupunem că facem untest de introducere date. În alt fișier vom avea bateria de test.

```javascript
// /test/create_test.js
const assert = require('assert');
const Comp = require('../models/competenta-specifica');
describe('Creează competență specifică - test', () => {
    it('Creează o competență', () => {
        // fă un assertion
        const comp = new Comp({
            nume: 'Identificarea semnificaţiei unui mesaj oral, pe teme accesibile, rostit cu claritate',
            ids: '1.1',
        });
        comp.save();
    });
});
```
