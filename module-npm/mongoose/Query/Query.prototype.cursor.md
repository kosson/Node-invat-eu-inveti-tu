# Query.prototype.cursor()

În contextul folosirii bazei de date MongoDB, un [cursor](https://docs.mongodb.com/manual/tutorial/iterate-a-cursor/) este un obiect care permite iterarea unui set mare de date. Foarte util este să reții faptul că funcția MongoDB `find()` returnează un cursor. Un cursor este un obiect care pune la dispoziție o metodă asicronă `next()`.

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

## Resurse

- [Cursors in Mongoose 4.5 | thecodebarbarian.com](https://thecodebarbarian.com/cursors-in-mongoose-45)
- [Common Async/Await Design Patterns in Node.js](http://thecodebarbarian.com/common-async-await-design-patterns-in-node.js.html)
