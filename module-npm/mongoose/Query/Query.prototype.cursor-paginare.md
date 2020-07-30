# Query.prototype.cursor()

Mongoose folosește stream-urile implementate de Node.js pentru a aduce rezultate de la MongoDB, dar mai întâi de toate avem nevoie să constituim ceea ce se numește **cursor**, adică o instanță a lui [Query.prototype.cursor()](https://mongoosejs.com/docs/api.html#query_Query-cursor).

```javascript
const cursor = Person.find({ occupation: /host/ }).cursor();

for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  console.log(doc); // Afișează documentele unul după altul
}
```

În contextul folosirii bazei de date MongoDB, un [cursor](https://docs.mongodb.com/manual/tutorial/iterate-a-cursor/) este un obiect care permite iterarea unui set mare de date. Foarte util este să reții faptul că funcția MongoDB `find()` returnează un cursor. Un cursor este format și atunci când iterezi direct cu `for...await` pe un query.

```javascript
for await (const doc of Person.find()) {
  console.log(doc); // Afișează documentele unul după altul
}
```

Cursorul se va pierde în 10 minute rezultând într-o eroare `MongoError: cursor id 123 not found` (vezi [When a mongodb cursor will expire](https://stackoverflow.com/questions/21853178/when-a-mongodb-cursor-will-expire)). Pentru a modifica timpul cât este disponibil cursorul vom seta opțiunea `noCursorTimeout`.

```javascript
// MongoDB nu va mai închide cursorul automat după 10 minute.
const cursor = Person.find().cursor().addCursorFlag('noCursorTimeout', true);
```

Cursoarele mai pot fi pierdute și din cauza [timeout-urilor de sesiune idle](https://docs.mongodb.com/manual/reference/method/cursor.noCursorTimeout/#session-idle-timeout-overrides-nocursortimeout). Concluzia este că în ciuda unei setări `noCursorTimeout`, cursorul va fi pierdut după 30 de minute.

Un cursor este un obiect care pune la dispoziție o metodă asicronă `next()`.

```javascript
const mongodb = require('mongodb');

test();

async function test() {
  const db = await mongodb.MongoClient.connect('mongodb://localhost:27017/test');

  await db.collection('Movies').drop();
  await db.collection('Movies').insertMany([
    { name: 'Enter the Dragon' },
    { name: 'Ip Man' },
    { name: 'Kickboxer' }
  ]);

  // Don't `await`, instead get a cursor
  const cursor = db.collection('Movies').find();
  // Use `next()` and `await` to exhaust the cursor
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    console.log(doc.name);
  }
}
```

Această metodă returnează un wrapper peste cursorul driverului de MongoDB. Un `QueryCursor` expune o interfață Stream3 și o funcție `.next()`.

```javascript
const cursor = Customer.find({ name: 'Axl' }).cursor();
cursor.next.then(doc => {
  console.log(doc);
});
```

## Limitări

Metoda va executa toate hook-urile `pre` aplicate pe `find`, dar NU și hook-urile `post`.

## Modele de lucru

Metoda poate fi utilizată în două scenarii diferite. Primul este cel al tratării cursorului din poziția de stream așa cum este exemplul de mai jos.

```javascript
Thing.find({ nume: /^*ela$/ }).
  cursor().
  on('data', function (doc) {
    console.log(doc);
  }).
  on('end', function () {
    console.log('Done!');
  });
```

În documentul de prezentare a noilor posibilități tehnice ale versiunii 4.5, Valeri Karpov avertizează programatorii în ceea ce privește folosirea stream-urilor, care au un model *push-back*, ceea ce implică faptul că stream-ul va încerca să scoată cât mai repede documentele din server, opus unui model *pull-back* pe care îl are un cursor MongoDB ceea ce implică solicitarea documentelor unul după altul.

Sau poți folosi metoda `next()` pentru a accesa manual următorul document din stream. Aplicarea metodei `.next()` returnează o promisiune. Deci poți opta, fie pentru un callback, fie pentru o promisiune.

```javascript
var cursor = Thing.find({ name: /^*ela$/ }).cursor();
cursor.next(function(error, doc) {
  console.log(doc);
});
```

Pentru că `.next()` returnează un `Promise`, poți folosi pachetul  [co](https://www.npmjs.com/package/co) pentru a itera cu lejeritate prin toate documentele fără a le încărca în memorie. Acesta poate fi un răspuns la problemele legate de folosirea stream-urilor.

```javascript
co(function*() {
  const cursor = Thing.find({ name: /^hello/ }).cursor();
  for (let doc = yield cursor.next(); doc != null; doc = yield cursor.next()) {
    console.log(doc);
  }
});
```

Și încă un exemplu care face și o populare.

```javascript
co(function*() {
  const cursor = User.find({ name: 'Axl' }).populate('band').cursor();
  for (let doc = yield cursor.next(); doc != null; doc = yield cursor.next()) {
    // Afișează user, având câmpul `band` populat cu date
    console.log(doc);
  }
});
```

Dacă nu se dorește folosirea unei biblioteci de cod, precum `co`, Mongoose pune la dispoziție o metodă `eachAsync()`, care aplicată pe cursor, permite extragerea de documente din baza de date unul câte unul.

```javascript
cursor.eachAsync(doc => superagent.post('/saveDoc', doc)).
  then(() => console.log('done!'));
```

În exemplul prezentat, `superagent` poate fi chiar un client Elasticsearch. Metoda `eachAsync` pur și simplu execută câte o funcție pentru fiecare document adus de cursor. Dacă funcția internă pasată lui `eachAsync` returnează o promisiune, `eachAsync` va aștepta finalizarea acelei promisiuni înainte de a cere un nou document din colecție.
În cazul în care funcția internă nu returnează o promisiune, va cere imedial al document.

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
/
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


## Resurse

- [Cursors in Mongoose 4.5 | thecodebarbarian.com](https://thecodebarbarian.com/cursors-in-mongoose-45)
- [Common Async/Await Design Patterns in Node.js](http://thecodebarbarian.com/common-async-await-design-patterns-in-node.js.html)
