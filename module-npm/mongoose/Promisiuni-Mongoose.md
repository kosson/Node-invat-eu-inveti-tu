# Promisiuni în Mongoose

Operațiunile asincrone precum `save()`, returnează promisiuni.

Query-urile Mongoose **nu sunt promisiuni**. Acestea au o funcție `then()` de conveniență, care poate fi apelată atunci este într-un lanț de promisiuni sau este folosit async/await.

```javascript
Band.findOne({name: "Guns N' Roses"}).then(function(doc) {
  // use doc
});
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
