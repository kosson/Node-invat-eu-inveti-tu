# Model.find()

Metoda este folosită pentru a căuta documente în MongoDB. Returnează un obiect de tip `Query`. Obiectele query returnate nu sunt promisiuni.

Metoda primește câțiva posibili parametri, primul fiind filtrul după care se face căutare, iar restul sunt opționali.

## Parametri

### `filter`

Este un `Object` sau un `ObjectId`.

Aceste obiecte cu rol de filtru sunt formatate conform `SchemaType`-ului corespondent înainte de a fi trimisă comanda către bază.

### `[projection]`

Proiecția poate fi un șir de caractere (`String`) sau un `Object`. Această proiecție este folosită pentru a specifica câmpurile care să fie aduse din bază. Vezi și [`Query.prototype.select()`](https://mongoosejs.com/docs/api.html#query_Query-select).

### `[options]`

Este un `Object` opțional - vezi [`Query.prototype.setOptions()`](https://mongoosejs.com/docs/api.html#query_Query-setOptions)

Opțiunile posibile sunt:

`tailable`
`sort` - https://mongoosejs.com/docs/api/query.html#query_Query-sort
`limit`
`skip`
`allowDiskUse`
`batchSize`
`readPreference`
`hint`
`comment`
`snapshot`
`maxscan`

### `[callback]`

Este o funcție cu rol de callback în cazul în care este aleasă această opțiune.

## Exemplu

```javascript
// are numele john și are cel puțin 18 ani
MyModel.find({ name: 'john', age: { $gte: 18 }});

// se execută și pasează rezultatele în callback
MyModel.find({ name: 'john', age: { $gte: 18 }}, function (err, docs) {});

// caută un nume asemănător (LIKE) cu john, selectând doar câmpurile "name" și "friends"
MyModel.find({ name: /john/i }, 'name friends', function (err, docs) { })

// pasarea opțiunilor folosind un obiect
MyModel.find({ name: /john/i }, null, { skip: 10 })

// pasarea opțiunilor folosind un obiect și executarea callback-ului
MyModel.find({ name: /john/i }, null, { skip: 10 }, function (err, docs) {});

// Executarea unui query explicit
var query = MyModel.find({ name: /john/i }, null, { skip: 10 })
query.exec(function (err, docs) {});

// poți folosi promisiunea care a fost returnată din executarea unui query
var query = MyModel.find({ name: /john/i }, null, { skip: 10 });
var promise = query.exec();
promise.addBack(function (err, docs) {});
```

## Filtre folosind `$or` și `$and`

Folosirea unor proprietăți în obiectul filtru va avea drept rezultat găsirea tuturor documentelor care se potrivesc acelor proprietăți.

```javascript
const docs = await Character.find({
  age: { $gte: 29 },
  rank: 'Commander'
});
```

În cazul în care faci o căutare în baza potrivirii a cel puțin unuia dintre criterii, vei folosi operatorul `$or`.

```javascript
const docs = await Character.find({
  $or: [
    { age: { $gte: 29 } },
    { rank: 'Commander' }
  ]
});
```

Se poate folosi și operatorul `$and` dar practica dovedește că foarte rar. De regulă, se folosește `$and` pentru a compune mai multe filtre folosind operatori `$or`.

```javascript
const docs = await Character.find({
  $and: [
    {
      $or: [
        { age: { $gte: 29 } },
        { rank: 'Commander' }
      ]
    },
    {
      $or: [
        { name: { $lte: 'D' } },
        { name: { $gte: 'W' } }
      ]
    }
  ]
});
// ['William Riker']
docs.map(doc => doc.name).sort();
```

În exemplul de mai sus căutăm un personaj care să aibă vârsta peste 29 sau care să fie *Commander*. Al doilea criteriu este ca numele să înceapă cu o literă după *D* sau după *W*.

## Chaining

Atunci când faci un `find` poți folosi o mulțime de helperi specifici obiectelor de tip query.

```javascript
let docs = await Character.find().
  // `where()` specifies the name of the property
  where('name').
  // and then the query helper `in()` specifies that `name`
  // must be one of the 2 values in the array
  in(['Jean-Luc Picard', 'Will Riker']);

// Equivalent query, but with the filter expressed as an object rather
// than using chaining
docs = await Character.find({
  name: { $in: ['Jean-Luc Picard', 'Will Riker'] }
});
```

Pentru a obține informații privind toate filtrele înlănțuite, se poate folosi funcția `getFilter()`.

```javascript
const query = Character.find().
  where('name').in(['Jean-Luc Picard', 'Will Riker']);
// `{ name: { $in: ['Jean-Luc Picard', 'Will Riker'] } }`
query.getFilter();
```

Câțiva helperi utili:

- `lt(value)`, `gt(value)`: specifică faptul că o proprietate trebuie să fie mai puțin sau peste valoarea specificată. Valoarea poate fi un număr, un șir de caractere sau o dată calendaristică.
- `lte(value)`, `gte(value)`: specifică faptul că o proprietate trebuie să fie mai mare sau egală sau mai mică sau egală cu valoarea menționată.
- `in(arr)`: specifică faptul că o proprietate trebuie să fie egală cu una din valorile specificate în array.
- `nin(arr)`: specifică faptul că o proprietate nu trebuie să fie egală cu niciuna din valorile specificate în array
- `eq(val)`: specifică faptul că o proprietate trebuie să fie egală cu valoarea.
- `ne(val)`: specifică faptul că o proprietate nu trebuie să fie egală cu valoarea.
- `regex(re)`: specifică faptul că o proprietate trebuie să fie un șir de caractere care să se potrivească cu șablonul `re`.

Poți introduce mai multe `where` dacă este necesar.

```javascript
const docs = await Character.find().
  // `name` must match the regular expression
  where('name').regex(/picard/i).
  // `age` must be between 29 and 59
  where('age').gte(29).lte(59);
```

## Execuția query-ului

Query-ul nu este trimis serverului MongoDB până când nu este aplicată metoda `exec()`. Abia în momenul când se execută `exec()` este returnată un Promise nativ JavaScript.

```javascript
const promise = Character.find().exec();
promise instanceof Promise; // true
promise instanceof mongoose.Query; // false

const docs = await promise;
```

Există două modalități de a executa un query:
- aplicarea metodei `exec()` sau
- aplicarea metodei `then()`.

Metodele `Query#then()` și `Query#catch()` oferă un API similar celui pe care îl oferă promisiunile nativ pentru a putea face o interogare *thenable*:

```javascript
return Character.find().then(docs => {
  docs; // lista documentelor
});
```

## Referințe

- [Model.find()](https://mongoosejs.com/docs/api/model.html#model_Model.find)
- [Query Casting](https://mongoosejs.com/docs/tutorials/query_casting.html)
- [How find() Works in Mongoose](http://thecodebarbarian.com/how-find-works-in-mongoose.html)
- [Learn Mongoose find() by Example](https://masteringjs.io/tutorials/mongoose/find)
