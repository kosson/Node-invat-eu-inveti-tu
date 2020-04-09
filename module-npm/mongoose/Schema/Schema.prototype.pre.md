# Schema.prototype.pre()

## Parametri

Primul parametru este un `String` sau `Regex`, care este numele metodei.

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

## Resurse

- [Schema.prototype.pre()](https://mongoosejs.com/docs/api/schema.html#schema_Schema-pre)
