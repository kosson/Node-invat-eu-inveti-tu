# Aggregate

Operațiunile de agregare procesează mai multe document și returnează rezultatele computate. Aceste operațiuni pe care le putem denumi generic *agregări* sunt folosite în următoarele cazuri:
- gruparea valorilor din mai multe documente;
- aplicarea de operațiuni pe date grupate pentru a returna un rezultat unic;
- analiza datelor în timp.

Pentru a face agregări se vor iniția fluxuri de agregare numite în limba enegleză *aggregation pipelines*. Un *aggregation pipeline* constă din una sau mai multe etape care procesează documentele. Fiecare etapă procesează documentele într-un anumit fel.

## Mongoose

Un query care este o agregare, de fapt este un array de etape prin care trec documentele. Fiecare etapă este un obiect care descrie modul în care MongoDB ar trebui să transforme obiectul care ajunge în această etapă. Array-ul de etape se numește *pipeline*.

```javascript
await Character.create([
  { name: 'Jean-Luc Picard', age: 59, rank: 'Captain' },
  { name: 'William Riker', age: 29, rank: 'Commander' },
  { name: 'Deanna Troi', age: 28, rank: 'Lieutenant Commander' },
  { name: 'Geordi La Forge', age: 29, rank: 'Lieutenant' },
  { name: 'Worf', age: 24, rank: 'Lieutenant' }
]);

const filter = { age: { $gte: 30 } };
let docs = await Character.aggregate([
  { $match: filter }
]);

docs.length; // 1
docs[0].name; // 'Jean-Luc Picard'
docs[0].age // 59

// `$match` este similar lui `find()`
docs = await Character.find(filter);
docs.length; // 1
docs[0].name; // 'Jean-Luc Picard'
docs[0].age // 59
```

În exemplul anterior, documentația de la masteringjs.io ilustrează o etapă în care sunt filtrate documente.

Constructorul `Aggregate` este folosit pentru a crea fluxuri de agregare. Pentru a-l instanția se va folosi `Model.aggregate()`.

Metoda primeșe doi parametri:

- `[pipeline]` care este un array de obiecte;
- `[model]` este un model pe care se construiește agregarea.

Două exemple:

```javascript
const aggregate = Model.aggregate([
  { $project: { a: 1, b: 1 } },
  { $skip: 5 }
]);

Model.
  aggregate([{ $match: { age: { $gte: 21 }}}]).
  unwind('tags').
  exec(callback);
```

Documentele returnate de o agregare sunt obiecte JavaScript simple, nu documente mongoose.

## Grupare documente

Agregarea poate fi folosită pentru gruparea documentelor dacă acest lucru se dorește. În acest caz, operatorul `$group` se comportă precum o funcție `reduce()`. în exemplul de mai jos oferit tot de masteringjs.io grupează personajele în funcție de vârstă.

```javascript
let docs = await Character.aggregate([
  {
    $group: {
      // Fiecare `_id` trebuie să fie unic pentru ca în cazul mai multor
      // documente cu aceeași vârstă, MongoDB să incrementeze `count`.
      _id: '$age',
      count: { $sum: 1 }
    }
  }
]);

docs.length; // 4
docs.sort((d1, d2) => d1._id - d2._id);
docs[0]; // { _id: 24, count: 1 }
docs[1]; // { _id: 28, count: 1 }
docs[2]; // { _id: 29, count: 2 }
docs[3]; // { _id: 59, count: 1 }
```

## Compunerea etapelor

Compozabilitatea este punctul forte al agregărilor.

```javascript
let docs = await Character.aggregate([
  { $match: { age: { $lt: 30 } } },
  {
    $group: {
      _id: '$age',
      count: { $sum: 1 }
    }
  }
]);

docs.length; // 3
docs.sort((d1, d2) => d1._id - d2._id);
docs[0]; // { _id: 24, count: 1 }
docs[1]; // { _id: 28, count: 1 }
docs[2]; // { _id: 29, count: 2 }
```

## Clasa aggregate

Funcția `aggregate()` returnează o instanță a unei clase `Aggregate`. Instanțele sunt thenable astfel că poți folosi `await` și chainingul specific promisiunilor.

```javascript
let docs = await Character.aggregate().
  match({ age: { $lt: 30 } }).
  group({ _id: '$age', count: { $sum: 1 } });

docs.length; // 3
docs.sort((d1, d2) => d1._id - d2._id);
docs[0]; // { _id: 24, count: 1 }
docs[1]; // { _id: 28, count: 1 }
docs[2]; // { _id: 29, count: 2 }
```

## Middleware-ul mongoose

Middleware-ul `mongoose` are suport pentru hook-uri `pre('aggregate')` și `post('aggregate')`. Acestea oferă posibilitatea de a modifica pipeline-ul.

```javascript
const characterSchema = Schema({ name: String, age: Number });
characterSchema.pre('aggregate', function() {
  // Add a `$match` to the beginning of the pipeline
  this.pipeline().unshift({ $match: { age: { $lt: 30 } } });
});
const Character = mongoose.model('Character', characterSchema);

// The `pre('aggregate')` adds a `$match` to the pipeline.
let docs = await Character.aggregate().
  group({ _id: '$age', count: { $sum: 1 } });

docs.length; // 3
docs.sort((d1, d2) => d1._id - d2._id);
docs[0]; // { _id: 24, count: 1 }
docs[1]; // { _id: 28, count: 1 }
docs[2]; // { _id: 29, count: 2 }
```

# Resurse

- [An Introduction to Mongoose Aggregate | masteringjs.io | May 18, 2020](https://masteringjs.io/tutorials/mongoose/aggregate);
- [Aggregation | MongoDB](https://docs.mongodb.com/manual/aggregation/#aggregation)
