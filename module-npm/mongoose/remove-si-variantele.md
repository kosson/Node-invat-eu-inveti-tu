# Eliminarea înregistrărilor

În lucrul cu Mongoose avem de-a face cu două entități care pun la dispoziție metoda `remove`.

Prima entitate este modelul în sine, care este o clasă, de fapt cu toate metodele și proprietățile sale. Printre acestea, relevante pentru această secțiune sunt:

- `remove()`
- `findOneAndRemove()`
- `findByIdAndRemove()`

Odată ce modelul a fost instanțiat având date, acesta la rândul său are o metodă `remove`. Această modalitate se dovedește eficientă atunci când avem o referință deja către elementul in baza de date pe care dorim să-l eliminăm.

```javascript
const assert = require('assert');
const Comp = require('../models/competenta-specifica');

describe('Ștergerea unei înregistrări din baza de date', () => {
    let comp; // este instanță de competență
    beforeEach((done) => {
        comp = new Comp({
            nume: 'Identificarea unor informaţii variate dintr-un mesaj rostit cu claritate',
        });
        comp.save().then(() => {
            done();
        });
    });
    it('Ștergere folosind metoda remove din model', (done) => {
        comp.remove().then((r) => { // (node:20763) DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
            // console.log(r); // trebuie să ai un `deletedCount: 1`
            Comp.findOne({nume: 'Identificarea unor informaţii variate dintr-un mesaj rostit cu claritate'});
        }).then((inregistrare) => {
            // console.log(inregistrare)
            assert(inregistrare === undefined);
            done();
        });
    });
    it('Ștergere folosind metoda remove din clasă', (done) => {
        Comp.remove().then((r) => { // (node:20763) DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
            // console.log(r); // trebuie să ai un `deletedCount: 1`
            Comp.findOne({nume: 'Identificarea unor informaţii variate dintr-un mesaj rostit cu claritate'});
        }).then((inregistrare) => {
            // console.log(inregistrare)
            assert(inregistrare === undefined);
            done();
        });
    });
    it('Ștergere folosind metoda findOneAndRemove din clasă', (done) => {
        Comp.findOneAndRemove({nume: 'Identificarea unor informaţii variate dintr-un mesaj rostit cu claritate'}).then((r) => { // (node:20763) DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
            // console.log(r); // trebuie să ai un `deletedCount: 1`
            Comp.findOne({nume: 'Identificarea unor informaţii variate dintr-un mesaj rostit cu claritate'});
        }).then((inregistrare) => {
            // console.log(inregistrare)
            assert(inregistrare === undefined);
            done();
        });
    });
    it('Ștergere folosind metoda findByIdAndRemove din clasă', (done) => {
        Comp.findByIdAndRemove(comp._id).then((r) => { // (node:20763) DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
            // console.log(r); // trebuie să ai un `deletedCount: 1`
            Comp.findOne({nume: 'Identificarea unor informaţii variate dintr-un mesaj rostit cu claritate'});
        }).then((inregistrare) => {
            // console.log(inregistrare)
            assert(inregistrare === undefined);
            done();
        });
    });
});
```
