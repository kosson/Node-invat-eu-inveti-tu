# Introducere `Document`

Documentele Mongoose sunt o reprezentare a înregistrărilor din colecțiile MongoDB într-o relație directă unu-la-unu. Adică un document Mongoose oglindește o înregistrare dintr-o colecție în MongoDB.

Fiecare document Mongoose este o instanță a modelului său. `Document` și `Model` sunt două clase distincte în Mongoose. Clasa `Model` este o subclasă a lui `Document`. În momentul în care folosești contructorul `Model`, de fapt construiești un document. În Mongoose, un document este de fapt o instanță a unui model.

```javascript
const MyModel = mongoose.model('Test', new Schema({ name: String }));
const doc = new MyModel();

doc instanceof MyModel; // true
doc instanceof mongoose.Model; // true
doc instanceof mongoose.Document; // true
```

## Aducerea unui document din bază

Ceea ce obții atunci când apelezi `findOne()` din model, este un document Mongoose.

```javascript
const doc = await MyModel.findOne();

doc instanceof MyModel; // true
doc instanceof mongoose.Model; // true
doc instanceof mongoose.Document; // true
```

## Actualizarea unui document

Atunci când se constituie un document, toate modificările care i se aduc sunt contabilizate. Dacă se va face `save()` după modificarea documentului, toate modificările vor fi operate și pe documentul din baza de date.

```javascript
doc.name = 'foo';

// Mongoose trimite un `updateOne({ _id: doc._id }, { $set: { name: 'foo' } })`
// to MongoDB.
await doc.save();
```

În cazul în care documentul a fost șters din MongoDB între timp, Mongoose va da o eroare `DocumentNotFoundError`.

Apelând funcția `save()` este cel mai eficient mecanism de a actualiza un document în bază, pentru că beneficiezi și de faptul că se face validare, dar și de middleware-ul setat. Înainte de salvarea oricărui document, în spate se apelează metoda `validate()`.

Totuși, Mongoose oferă metodele `update()`, `updateMany()` și `findOneAndUpdate()` pentru actualizarea documentelor, dar acestea nu se folosesc de `save()` în subsidiar.

## Validarea documentelor

Înainte de a fi salvate în baza de date, documentele pot fi validate.

```javascript
const schema = new Schema({ name: String, age: { type: Number, min: 0 } });
const Person = mongoose.model('Person', schema);

let p = new Person({ name: 'foo', age: 'bar' });
// Cast to Number failed for value "bar" at path "age"
await p.validate();

let p2 = new Person({ name: 'foo', age: -1 });
// Path `age` (-1) is less than minimum allowed value (0).
await p2.validate();
```

Atunci când se fac actualizări ale documentelor, se pot face validări limitate folosind opțiunea [`runValidators`](https://mongoosejs.com/docs/validation.html#update-validators).

```javascript
// Cast to number failed for value "bar" at path "age"
await Person.updateOne({}, { age: 'bar' });

// Path `age` (-1) is less than minimum allowed value (0).
await Person.updateOne({}, { age: -1 }, { runValidators: true });
```

## Suprascrierea unui document

În cazul în care ai nevoie să suprascrii un document, ceea ce înseamnă înlocuirea tuturor cheilor dintr-un document, poți folosi metoda `overwrite()` urmată de un `save()`.

```javascript
const doc = await Person.findOne({ _id });

// Setează proprietatea `name` cu o nouă valoare și le șterge pe toate celelalte
doc.overwrite({ name: 'Jean-Luc Picard' });
await doc.save();
```

O altă modalitate este de a aplica metoda `Model.replaceOne()`.

```javascript
// Setează proprietatea `name` cu o nouă valoare și le șterge pe toate celelalte
await Person.replaceOne({ _id }, { name: 'Jean-Luc Picard' });
```
