# Subdocuments

Sunt documentele care sunt încluse în alte documente. Acest lucru permite o reutilizare a codului. Subdocumentele au aceleași capacități funcționale precum documentul părinte, dar vor fi savate doar atunci când părintele este salvat. Totuși, fiecare subschemă are propria metodă `save()`, precum și `validate()`.

```javascript
const childSchema = new Schema({ name: 'string' });

const parentSchema = new Schema({
  // Array de subdocumente
  children: [childSchema],
  // Un singur subdocument inclus. Nu funcționează decât la versiuni >= 4.2.0
  child: childSchema
});
```

Apelarea lui `save()` pe părinte, va declanșa executarea lui `save()` pe subscheme.

```javascript
childSchema.pre('save', function (next) {
  if ('invalid' == this.name) {
    return next(new Error('#sadpanda'));
  }
  next();
});

const parent = new Parent({ children: [{ name: 'invalid' }] });
parent.save(function (err) {
  console.log(err.message) // #sadpanda
});
```

Calea creată prin subdocumente permite validarea acestora.
Subdocumentele pot avea la rândul lor middleware setat sau logică de validare. Poate avea chiar și virtuale.

Middleware-ul pentru `pre('save')` și `pre('validate')` se execută înainte de `pre('save')` al părintelui, dar după middleware-ul `pre('validate')` al părintelui.

```javascript
// Codul de mai jos va afișa 1-4 în ordine
const childSchema = new mongoose.Schema({ name: 'string' });

childSchema.pre('validate', function(next) {
  console.log('2');
  next();
});

childSchema.pre('save', function(next) {
  console.log('3');
  next();
});

const parentSchema = new mongoose.Schema({
  child: childSchema
});

parentSchema.pre('validate', function(next) {
  console.log('1');
  next();
});

parentSchema.pre('save', function(next) {
  console.log('4');
  next();
});
```

## Diferența dintre subdocumente și nested paths

În cazul în care am experimenta cu nested paths și cu subdocumentele, la momentul salvării, în MongoDB vom avea înregistrări identice. Totuși sunt diferențe majore între cele două abordări.

```javascript
// Subdocument
const subdocumentSchema = new mongoose.Schema({
  child: new mongoose.Schema({ name: String, age: Number })
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

// Nested path
const nestedSchema = new mongoose.Schema({
  child: { name: String, age: Number }
});
const Nested = mongoose.model('Nested', nestedSchema);
```

Una din diferențe este aceea că un copil în subdocumente are valoarea `undefined`, dacă nu este alimentat modelul cu date. În nested poți avea valoare `undefined` pentru copil.

```javascript
const doc1 = new Subdoc({});
doc1.child === undefined; // true
doc1.child.name = 'test'; // Throws TypeError: cannot read property...

const doc2 = new Nested({});
doc2.child === undefined; // false
console.log(doc2.child); // Prints 'MongooseDocument { undefined }'
doc2.child.name = 'test'; // Works
```

Începând cu Mongoose 5, metoda `set()` aplicată pe modelul încărcat cu date, va avea ca efect suprascrierea obiectului care era valoare a căii copilului în cazul subdocumentelor, iar în cazul nested-path-ului va face doar un merge ceea ce înseamnă de fapt că modifică doar valoarea proprietății unui membru al obiectului copobiectul

```javascript
const doc1 = new Subdoc({ child: { name: 'Luke', age: 19 } });
doc1.set({ child: { age: 21 } });
doc1.child; // { age: 21 }

const doc2 = new Nested({ child: { name: 'Luke', age: 19 } });
doc2.set({ child: { age: 21 } });
doc2.child; // { name: Luke, age: 21 }
```

## Căutarea unui subdocument

Fiecare subdocument are un `_id` al său. Array-urile din documente au o metodă `id()` care te ajută să cauți în acel array după un anume `_id`.

```javascript
const doc = parent.children.id(_id);
```

## Adăugarea subdocumentelor în array-uri

Array-urile (*MongooseArray*) beneficiază în mongoose de următoarele metode: `push`, `unshift` și `addToSet`. Astfel, un nou subdocument poate fi adăugat într-un array al unor posibile subdocumente făcând un push, precum în exemplul:

```javascript
const Parent = mongoose.model('Parent');
const parent = new Parent; // instanțiază modelul

// Creează un comentariu, care este un subdocument, de fapt.
parent.children.push({ name: 'Alina' });  // introdu un subdocument în array-ul destinat acestora `children`
const subdoc = parent.children[0];        // din motive demonstrative, fă o referință către primul element
console.log(subdoc)                       // { _id: '501d86090d371bab2c0341c5', name: 'Alina' }
subdoc.isNew;                             // true

parent.save(function (err) {
  if (err) return handleError(err)
  console.log('Success!');
});
```

## Crearea directă a subdocumentelor

Subdocumentele pot fi create fără a fi adăugate unui array folosind metoda `create` pusă la dispoziție de `MongoMongooseArray`.

```javascript
const newdoc = parent.children.create({ name: 'Aaron' });
```

## Eliminarea subdocumentelor

Toate subdocumentele au propria metodă `remove`. Pentru un subdocument dintr-un array dedicat acestora, metoda `remove` este echivalentă cu `pull()` aplicat la nivel individual de subdocument. Pentru un singur subdocument, `remove()` este echivalent cu setarea subdocumentului la valoarea `null`.

```javascript
// Echivalent lui `parent.children.pull(_id)`
parent.children.id(_id).remove();
// Echivalent lui `parent.child = null`
parent.child.remove();
parent.save(function (err) {
  if (err) return handleError(err);
  console.log('subdocumentele au fost eliminate');
});
```

## Părinții subdocumentelor

În cazul în care ai nevoie să ajungi la părintele unui subdocument, poți să-l accesezi folosind funcția `parent()`.

```javascript
const schema = new Schema({
  docArr: [{ name: String }],
  singleNested: new Schema({ name: String })
});
const Model = mongoose.model('Test', schema);

const doc = new Model({
  docArr: [{ name: 'foo' }],
  singleNested: { name: 'bar' }
});

doc.singleNested.parent() === doc; // true
doc.docArr[0].parent() === doc; // true
```

Dacă ai un subdocument plasat foarte adânc în ierarhie, poți accesa documentul rădăcină folosind metoda `ownerDocument()`.

```javascript
const schema = new Schema({
  level1: new Schema({
    level2: new Schema({
      test: String
    })
  })
});
const Model = mongoose.model('Test', schema);

const doc = new Model({ level1: { level2: 'test' } });

doc.level1.level2.parent() === doc; // false
doc.level1.level2.parent() === doc.level1; // true
```

## Array-ul de documente transformat automat la schemă

Dacă creezi o schemă cu un array de obiecte, Mongoose va converti automat obiectul într-o schemă automat:

```javascript
const parentSchema = new Schema({
  children: [{ name: 'string' }]
});
// Este echivalent cu:
const parentSchema = new Schema({
  children: [new Schema({ name: 'string' })]
});
```

Spre deosebire de array-uri, nested documents nu convertesc obiectele din scheme în subdocument:

```javascript
const schema = new Schema({
  nested: {
    prop: String
  }
});
```

Definirea tipurilor proprietăților în nested paths nu va conduce la obținerea unei validări, ci pur și simplu la definirea unei [mixed](https://mongoosejs.com/docs/schematypes.html#mixed) path, adică a proprietăților unui obiect.

```javascript
const schema = new Schema({
  nested: {
    // Do not do this! This makes `nested` a mixed path in Mongoose 5
    type: { prop: String },
    required: true
  }
});

const schema = new Schema({
  nested: {
    // This works correctly
    type: new Schema({ prop: String }),
    required: true
  }
});
```

Există posibilitatea de a-i spune lui Mongoose să convertească automat `type: { prop: String }` în `type: { prop: String }` prin setarea opțiunii `typePojoToMixed` la valoarea `false`.

```javascript
const schema = new Schema({
  nested: {
    // Because of `typePojoToMixed`, Mongoose knows to
    // wrap `{ prop: String }` in a `new Schema()`.
    type: { prop: String },
    required: true
  }
}, { typePojoToMixed: false });
```

## Resurse

- [Subdocuments](https://mongoosejs.com/docs/subdocs.html)
