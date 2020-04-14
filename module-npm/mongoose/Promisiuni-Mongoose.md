# Promisiuni în Mongoose

În Mongoose versiunea 5 operațiunile asincrone precum `save()` și `find().exec()` returnează o promisiune cu excepția cazului în care le pasezi un callback.

```javascript
const Model = mongoose.model('Test', Schema({
  ceva: String
}));

const doc = new Model({ ceva: 'Bucegi' });

const promise = doc.save();
promise instanceof Promise; // true

const res = doc.save(function callback(err) {
  /*...*/
});
console.log(res); // undefined
```

Query-urile Mongoose **nu sunt promisiuni**. Metoda `find()` returnează un `Query` de Mongoose și nu o promisiune. Acestea au o funcție `then()` de conveniență, care poate fi apelată atunci este într-un lanț de promisiuni sau este folosit async/await.

```javascript
const query = Model.find();

query instanceof Promise; // false
query instanceof mongoose.Query; // true
// metoda de conveniență
Band.findOne({name: "Guns N' Roses"}).then(function(doc) {
  // use doc
});
```

Chiar dacă nu sunt promisiuni în adevăratul cuvânt, query-urile au o funcție `then()` care oferă un comportament similar celor din promisiuni. Acest lucru permite lucrul în scenarii care implică lucrul cu promisiuni.

```javascript
// Using queries with promise chaining
Model.findOne({ name: 'Mr. Anderson' }).
  then(doc => Model.updateOne({ _id: doc._id }, { name: 'Neo' })).
  then(() => Model.findOne({ name: 'Neo' })).
  then(doc => console.log(doc.name)); // 'Neo'

// Using queries with async/await
const doc = await Model.findOne({ name: 'Neo' });
console.log(doc.name); // 'Neo'
```

Pentru a lucra cu o promisiune, se va folosi `exec()`.

```javascript
var query = Band.findOne({name: "Guns N' Roses"});
assert.ok(!(query instanceof Promise));

// Un query nu este o promisiune chiar dacă are un `.then()`.
query.then(function (doc) {
  // use doc
});

// `.exec()` returnează o promisiune completă
var promise = query.exec();
assert.ok(promise instanceof Promise);

promise.then(function (doc) {
  // use doc
});
```

În cazul în care este nevoie de utilizarea unei alte biblioteci de cod pentru lucrul cu promisiunile, Mongoose permite acest lucru oferind un mecanism de conectare a acestora prin `mongoose.Promise`.

```javascript
var query = Band.findOne({name: "Guns N' Roses"});

// Use bluebird
mongoose.Promise = require('bluebird');
assert.equal(query.exec().constructor, require('bluebird'));

// Use q. Note that you **must** use `require('q').Promise`.
mongoose.Promise = require('q').Promise;
assert.ok(query.exec() instanceof require('q').makePromise);
```

## Resurse

- [Promises in Mongoose](https://masteringjs.io/tutorials/mongoose/promise)
- [Built-in Promises](https://mongoosejs.com/docs/promises.html)
