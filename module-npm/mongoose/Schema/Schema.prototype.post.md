# Schema.prototype.post()

Middleware-ul `post` este executat **după** ce au fost executate metodele hook, dar și tot middleware-ul setat pentru `pre`.

```javascript
schema.post('init', function(doc) {
  console.log('Au fost inițializate din baza de date', doc._id);
});
schema.post('validate', function(doc) {
  console.log('Am validat, dar încă nu am salvat nimic', doc._id);
});
schema.post('save', function(doc) {
  console.log('Documentul a fost salvat', doc._id);
});
schema.post('remove', function(doc) {
  console.log('documentul a fost șters', doc._id);
});
```

## Parametri

Primul parametru este un `String` sau `Regex`, care este numele metodei.

Al doilea parametru poate fi un `Object` de configurare cu o proprietate `options`.
- **\[options.document]** «`Boolean`» În cazul în care `name` este un *hook* comun pentru middleware-ul documentului, dar și pentru query, setează valoarea la `true` pentru a fi rulat pe middleware-ul documentului.
- **\[options.query]** «`Boolean`» În cazul în care `name` este un *hook* comun pentru middleware-ul documentului, dar și pentru query, setează valoarea la `true` pentru a fi rulat pe middleware-ul query-ului.

Al treilea este funcția cu rol de callback.

## Exemple

```javascript
// creezi o schemă
var schema = new Schema(..);

schema.post('save', function (doc) {
  console.log('apar după ce documentul a fost salvat');
});

schema.post('find', function(docs) {
  console.log('acesta apare după ce rulezi un query find');
});

schema.post(/Many$/, function(res) {
  console.log('acesta apare după ce rulezi `updateMany()` sau `deleteMany()`);
});

// instanțiezi un model în baza schemei
var Model = mongoose.model('Model', schema);
var m = new Model(..);

m.save(function(err) {
  console.log('acesta apare după hook-ul `post`');
});

m.find(function(err, docs) {
  console.log('acesta apare după hook-ul `post` dedicat lui find');
});
```

## Hook-uri asincrone

Cel de-al doilea parametru al unei funcții cu rol de hook, trebuie să fie `next()`.

```javascript
// Declarăm un post hook asincron
schema.post('save', function(doc, next) {
  setTimeout(function() {
    console.log('post1');
    // Declanșarea celui de-al doilea prin apelarea lui next()
    next();
  }, 10);
});

// Nu se va executa dacă anteriorul nu a invocat `next()`
schema.post('save', function(doc, next) {
  console.log('post2');
  next();
});
```

## Hookuri post care preiau controlul

Toate post save hooks care sunt async și cele care sunt aplicate pe scheme copil, se vor executa înaintea callback-ului metodei `save()`. Asta înseamnă că [preiau controlul execuției](https://mongoosejs.com/docs/migrating_to_5.html#post-save-flow-control) înainte de a se face cu adevărat save-ul.

```javascript
// am declarat schema copil
const ChildModelSchema = new mongoose.Schema({
  text: {
    type: String
  }
});
// aplic schemei copil, un hook post save
ChildModelSchema.post('save', function(doc) {
  // In mongoose 5.x următorul console.log se va executa înaintea celui din save-ul schemei părinte
  console.log('Post save din copil');
});
//integrează subschema
const ParentModelSchema = new mongoose.Schema({
  children: [ChildModelSchema]
});

// generează modelul
const Model = mongoose.model('Parent', ParentModelSchema);
// hidratează modelul cu date constituind documentul
const m = new Model({ children: [{ text: 'test' }] });
// documentul se salvează
m.save(function() {
  // In mongoose 5.xm mesajul apare după ce apare cel din schema copil.
  console.log('Mesaj din callback-ul de salvare');
});
```

## Resurse

- [Schema.prototype.post()](https://mongoosejs.com/docs/api/schema.html#schema_Schema-post)
