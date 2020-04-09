# before

Acest hook este executat o singură dată. Să prespunem că avem un scenariu în care trebuie să testăm scrierea într-o bază de date MongoDB.
Testele le vom face cu Mocha, care oferă utilitarul `assert()`.

```javascript
// create_test.js
const assert = require('assert');
const Comp = require('../models/competenta-specifica');

describe('Creează competență specifică - test', () => {
    it('Creează o competență', (done) => {
        // fă un assertion
        const comp = new Comp({
            nume: 'Identificarea semnificaţiei unui mesaj oral, pe teme accesibile, rostit cu claritate',
            ids: '1.1'
        });
        comp.save().then(() => {
            assert(!comp.isNew); // dacă a fost salvat în bază valoarea pasată lui assert va fi false. Pentru a trece testul o facem truthy
            done();
        }).catch((err) => {
            if(err) throw new Error('Zice: ', err.message);
        });
    });
});
```

După ce vom seta cadrul de test pentru a scrie o înregistrare în bază, avem nevoie de un helper pentru a face conectarea cu baza.

```javascript
const mongoose = require('mongoose');

// hook necesar pentru execuția fix o singură dată în setul de test mocha
before(() => {
    // MONGOOSE - Conectare la MongoDB
    mongoose.set('useCreateIndex', true); // Deprecation warning
    mongoose.connect('mongodb://localhost/redcolector', {useNewUrlParser: true});
    mongoose.connection.on('error', function () {
        console.warn('Database connection failure');
        process.exit();
    });
    mongoose.connection.once('open', function () {
        console.log("Database connection succeded");
        done(); // este specific doar pentru testare cu mocha
    });
});

// Înainte de a face orice cu baza de date, mai întâi rulează ce este în beforeEach
beforeEach((done) => {
    mongoose.connection.collections.competentaspecificas.drop(() => {
      // fă ce ai de făcut după ce s-a făcut drop
      done();
    });
});
```
