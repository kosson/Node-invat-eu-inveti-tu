# Schema.prototype.post()

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

## Resurse

- [Schema.prototype.post()](https://mongoosejs.com/docs/api/schema.html#schema_Schema-post)
