# Schema.prototype.pre()

## Parametri

Primul parametru este o valoare `String` sau `Regex`, care este numele metodei pentru care se va scrie un middleware. De exemplu, pentru a înregistra un middleware pe `doc.remove()`, de exemplu, vei specifica `schema.pre('remove')`. În cazul în care vei dori executarea unui `Query.remove()`, va trebui specificat acest lucru adăugându-se o opțiune de inactivare pentru documente, precum în `schema.pre('remove', {query: true, document: false}, fn)`.

Pentru `updateOne` și `deleteOne`, middleware-ul este înregistrat direct pe `Query.updateOne()` și `Query.deleteOne()`. Acest lucru are ca efect ca atunci când se execută cele două metode pe document, vor fi executate hook-urile de pe schemă pentru că `this` va fi obiectul schemă, nu document. Pentru a înregistra `updateOne` și `deleteOne` ca middleware de document, se va folosi `schema.pre('updateOne', {document: true, query: false}, fn)`.

Atenție la faptul că metoda `create()` declanșează hook-urile `save()`.

Funcțiile cu rol de hook-uri în `pre`, se vor executa una după cealaltă câtă vreme fiecare își va încheia execuția aplelând `next()`.

```javascript
var schema = new Schema(..);
schema.pre('save', function(next) {
  // aici fă transformări
  next();
});
```

În cazul în care folosești `next()`, apelarea sa în funcția de callback nu conduce la oprirea execuției acesteia. Dacă acest lucru se impune, atunci vei face un `return next()`.

```javascript
var schema = new Schema(..);
schema.pre('save', function(next) {
  if (foo()) {
    console.log('calling next!');
    // `return next();` va preveni execuția restului funcției
    /*return*/ next();
  }
  // dacă nu folosești `return` mai sus, următoare linie se va executa
  console.log('after next');
});
```

Dacă folosești Mongoose 5.x, nu mai trebuie apelat manual `next()` fiind posibil să returnezi o funcție care va fi o promisiune.

```javascript
schema.pre('save', function() {
  return executăFunctieDeTransformare().then(() => maiFaOTransformare());
});

// Dacă versiunea de Node.js >= 7.6.0:
schema.pre('save', async function() {
  await executăFunctieDeTransformare();
  await maiFaOTransformare();
});
```

Al doilea parametru poate fi un `Object` de configurare cu o proprietate `options`.
- **\[options.document]** «`Boolean`» În cazul în care `name` este un *hook* comun pentru middleware-ul documentului, dar și pentru query, setează valoarea la `true`. De exemplu, setează `options.document` cu valoarea `true` pentru a aplica acest *hook* lui `Document#deleteOne()` și nu lui `Query#deleteOne()`.
- **\[options.query]** «`Boolean`» În cazul în care `name` este un *hook* comun pentru middleware-ul documentului, dar și pentru query, setează valoarea la `true` pentru a fi rulat pe middleware-ul query-ului.

Al treilea este funcția cu rol de callback.

## Exemple

```javascript
var toySchema = new Schema({ name: String, created: Date });

toySchema.pre('save', function(next) {
  // dacă nu este setată data calendaristică, fă acest lucru
  if (!this.created) this.created = new Date;
  next();
});

toySchema.pre('validate', function(next) {
  if (this.name !== 'Woody') this.name = 'Woody';
  next();
});

// Este echivalentul apelării lui `pre()` pe `find`, `findOne`, `findOneAndUpdate`.
toySchema.pre(/^find/, function(next) {
  console.log(this.getFilter());
});

// Este echivalentul apelării lui `pre()` pe `updateOne`, `findOneAndUpdate`.
toySchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  console.log(this.getFilter());
});

toySchema.pre('deleteOne', function() {
  // Rulează când apelezi `Toy.deleteOne()`
});

toySchema.pre('deleteOne', { document: true }, function() {
  // Rulează când apelezi `doc.deleteOne()`
});
```

## Tratarea erorilor

În cazul în care o funcție setată drept hook `pre` dă o eroare, Mongoose, nu va mai executa și middleware-ul care urmează. Eroarea va fi pasată callback-ului, iar în cazul în care se folosesc promisiunile, acestea vor fi rejected.

```javascript
schema.pre('save', function(next) {
  const err = new Error('ceva nu a funcționat corect');
  // Dacă apelezi next() cu un argument, se consideră că acel argument este o eroare.
  next(err);
});

schema.pre('save', function() {
  // poți returna chiar o promisiune care rejectează
  return new Promise((resolve, reject) => {
    reject(new Error('ceva nu a funcționat corect'));
  });
});

schema.pre('save', function() {
  // poți ridica o eroare în maniera sincronă obișnuită
  throw new Error('ceva nu a funcționat corect');
});

schema.pre('save', async function() {
  await Promise.resolve();
  // ridică o eroare într-o funcție `async`
  throw new Error('ceva nu a funcționat corect');
});

// modificările nu vor fi operate din cazuza apariției erorilor
myDoc.save(function(err) {
  console.log(err.message); // afișare sau tratare erori în callback
});
```

## Resurse

- [Schema.prototype.pre()](https://mongoosejs.com/docs/api/schema.html#schema_Schema-pre)
- [pre](https://mongoosejs.com/docs/middleware.html#pre)
