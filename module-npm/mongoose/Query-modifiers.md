# Modificatori de Query

## Implementare paginare

Modificatorii `skip()` și `limit()` permit implementarea paginări rezultatelor.

Folosind `skip()` declari limita de la care să porneasscă selecția. Modificatorul `limit()` declară numărul de înregistrări care să fie aduse din set. Pentru a avea o ordine în setul adus din bază, se poate adăuga un modificator `sort()`. Pentru `sort()`, o valoare atribuită câmpului după care se face sortarea, de `1` înseamnă o sortare ascendentă. O valoare `-1` este o sortare descendentă.

```javascript
const assert  = require('assert');
const Resursa = require('../models/resursa-red');
describe('Citește resurse din baza de date', () => {
    let res01, res02, res03, res04; // este instanță de competență
    beforeEach((done) => {
        res01 = new Resursa({title: 'Mișcarea haotică a gândurilor'});
        res02 = new Resursa({title: 'O resursă pentru educație fizică'});
        res03 = new Resursa({title: 'O altă resursă'});
        res04 = new Resursa({title: 'Și o resursă pentru a face viața mai ușoară'});
        Promise.all([res01.save(), res02.save(), res03.save(), res04.save()]).then(() => done());
    });
    it('paginare folosind skip și limit', (done) => {
      Resursa.find({})
          .sort({title: 1})
          .skip(1)
          .limit(2)
          .then((resurse) => {
              assert(resurse.length === 2);
              // assert(resurse[0].title === 'O resursă pentru educație fizică');
              // assert(resurse[0].title === 'O altă resursă');
              done();
          });
  });
}
```

## Obținerea unor informații de limite

Să presupunem că avem nevoie de prima și ultima înregistrare dintr-o colecție. Pentru a aduce aceste două limite, este nevoie de parcurgerea tuturor înregistrărilor, sortarea acestora și extragerea informațiilor de la cele aflate la limită.

```javascript
const Resursa = require('../models/resursa-red');
/**
 * Această funcție va returna o promisiune
 * @return {promise} promisiunea aduce un obiect cu reperele
 * primei resurse educaționale introduse și a ultimei.
*/
module.exports = () => {
    const queryLimInferioara = Resurse.find({})
        .sort({date: 1})
        .limit(1)
        .then((resurse) => {
            return resurse[0].date;
        }); // Caută în toate înregistrările pe care le vei sorta, pe prima, pe care o vei aduce. E posibil să fie mai multe introduse în acelați timp.
    const queryLimSup = Resurse.find({})
        .sort({date: -1})
        .limit(1)
        .then((resurse) => {
            return resurse[0].date;
        });
    return Promise.all([queryLimInferioara, queryLimSup])
        .then((limite) => {
            return {
                inf: limite[0],
                sup: limite[1]
            }
        });
};
```

## Căutare în baza de date

```javascript
const Resursa = require('../models/resursa-red');
/**
 * Caută în colecția de resurse pentru a prepopula landing page-ul sau oricare alte secțiuni ale aplicației.
 * @param {object} criteria, fiind obiectul proiecție pentru căutare în MongoDB.
 * Este un obiect care definește atributele după care vor fi evaluate înregistrările rând pe rând.
 * Ne-ar interesa atributele: arieCurriculara, level, grupCompetente și disciplinaPrimara
 * Fiecare dintre criterii poate fi o opțiune dintr-un select a cărei selecție va resorta rezultatele.
 * @param {string} cheie, fiind un key din înregistrare după care se va face sortarea rezultatelor.
 * Această cheie va fi un string adus dinamic din client.
 * @param {integer} offset, fiind un număr ce indică câte rezultate vor fi omise (skip) în setul rezultatelor. Necesar paginării rezultatelor. Default: 0.
 * @param {integer} limit, fiind numărul de resurse care vor fi returnate. Necesar paginării rezultatelor. Default: 20.
 * @return {promise} promisiunea aduce un obiect
 * Semnătura obiectului este {resurse: [resurse], total: total, offset: offset, limit: limit }
 * Proprietatea total dorim să numere toate obiectele din colecție. Această operațiune este asincronă și ea
*/
module.exports = (criteria, cheie, offset = 0, limit = 10) => {
    // var objSortare = {};
    // objSortare[cheie] = 1; // mai bine folosești interpolated properties din ES6
    // {[cheie]: 1} // montează valoarea lui chei drept proprietate a obiectului de parametrizare a sortării
    const query = Resursa.find(criteria)
        .sort({[cheie]: 1})
        .skip(offset)
        .limit(limit);

    return Promise.all([query, Resurse.countDocuments()]).then((rezultate) => {
        // returnează obiectul respectând semnătura convenită în spec mai sus.
        return {
            resurse: rezultate[0],
            total:   rezultate[1],
            offset:  offset,
            limit:   limit
        }
    });
};
```
