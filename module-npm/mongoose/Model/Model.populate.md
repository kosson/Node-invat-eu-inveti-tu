# Model.populate()

Această metodă permite referirea altor documente din alte colecții. Prin această metodă, se va înlocui căile specificate cu documente din alte colecții. Putem popula un singur document, mai multe documente, un simplu obiect, mai multe obiecte simple sau chiar toate obiectele returnate din query.

Metoda returnează un `Promise`. Vom urmări exemplul oferit de documentație.

```javascript
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
// creez prima schemă
const personSchema = Schema({
  _id:     Schema.Types.ObjectId,
  name:    String,
  age:     Number,
  stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});
// creez a doua schemă
const storySchema = Schema({
  title:  String,
  author: {  type: Schema.Types.ObjectId, ref: 'Person' },
  fans:   [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

const Story  = mongoose.model('Story',  storySchema);  // generez primul model
const Person = mongoose.model('Person', personSchema); // generez cel de-al doilea model
```

Schema `personSchema` are un câmp care face referință către modelul `Story` și care va fi populat cu id-uri de documente `Story`. Câmpul `ref` indică modelul care trebuie folosit pentru populare. Array-ul de identificatori `_id` vor fi id-uri ale documentelor din `Story`.

## Parametri

### `docs`

Poate fi un obiect de tip `Document` sau un `Array`. Poate fi un singur document sau un array de documente pentru a fi populate.

### `options`

Este un `Object`, care, de fapt este un hash cheie/valoare (cale, opțiuni) folosit pentru a realiza popularea.

#### `[options.retainNullValues=false]`

Din oficiu, Mongoose elimină înregistrările care au valoarea `null` sau `undefined` din array-urile în care s-a făcut popularea. Această opțiune se va seta la `true` atunci când se dorește includerea înregistrărilor cu valoarea `null` sau `undefined`.

#### `[options.getters=false]`

Este o valoare `Boolean` care în cazul `true`, va apela orice getteri au fost setați pe câmpul care trebuie să fie populat - `localField`. Din oficiu, Mongoose obține valoarea neprelucrată pentru `localField`. De exemplu, dacă vrei să folosețti niște [getteri așa cum sunt cei definiți în opțiunile tipului de schemă](https://mongoosejs.com/docs/schematypes.html#schematype-options), se va seta opțiune cu valoarea `true`.

#### `[options.clone=false]`

Când lansezi o comandă precum `Carte.find().populate('autor')`, toate cărțile care au același autor vor folosi aceeași înregistrare adusă de populate; același document `autor`. Pentru a beneficia de acest mecanism de copiere, se va seta opțiunea la `true`.

#### `[options.match=null]`

Valoarea lui `match` poate fi un `Obiect` sau un `Function`. Acesta este un filtru suplimentar care influiențează rezultatele aduse de interogarea populate. Poate fi un obiect de tip filtru ce conține [sintaxă MongoDB](https://docs.mongodb.com/manual/tutorial/query-documents/) sau o funcție care returnează un obiect de filtrare.

#### `[options.skipInvalidIds=false]`

Este o valoare `Boolean`. Din oficiu, Mongoose indică o eroare de casting dacă schemele `localField` și `foreignField` nu sunt aliniate. Dacă această se face această opțiune, Mongoose va filtra proprietățile `localField` pentru care nu se poate face casting conform tipului din `foreignField`.

### `[callback(err,doc)]`

Este un `Function` - un callback opțional, care va fi executat la încheierea operațiunii.

## Opțiuni top-level

- `path`, fiind căile care trebuie populate separate fiecare prin spațiu
- `select`, fiind câmpurile opționale care vor fi selectate
- `match`, fiind condițiile de interogare a bazei
- `model`, fiind modelul care va fi utilizat
- `options`, fiind o opțiune de interogare suplimentară așa cum este *sort*, *limit*, etc.
- `justOne`, fiind un boolean opțional, care dacă este true, va seta calea la un array. În rest, acesta va fi dedus din schemă.

## Exemple

```javascript
// populează un singur obiect
User.findById(id, function (err, user) {
  var opts = [
    { path: 'company', match: { x: 1 }, select: 'name' },
    { path: 'notes', options: { limit: 10 }, model: 'override' }
  ];

  User.populate(user, opts, function (err, user) {
    console.log(user);
  });
});

// populează un array de obiecte
User.find(match, function (err, users) {
  var opts = [{ path: 'company', match: { x: 1 }, select: 'name' }];

  var promise = User.populate(users, opts);
  promise.then(console.log).end();
})

// imagine a Weapon model exists with two saved documents:
//   { _id: 389, name: 'whip' }
//   { _id: 8921, name: 'boomerang' }
// and this schema:
// new Schema({
//   name: String,
//   weapon: { type: ObjectId, ref: 'Weapon' }
// });

var user = { name: 'Indiana Jones', weapon: 389 };
Weapon.populate(user, { path: 'weapon', model: 'Weapon' }, function (err, user) {
  console.log(user.weapon.name); // whip
})

// populate many plain objects
var users = [{ name: 'Indiana Jones', weapon: 389 }]
users.push({ name: 'Batman', weapon: 8921 })
Weapon.populate(users, { path: 'weapon' }, function (err, users) {
  users.forEach(function (user) {
    console.log('%s uses a %s', users.name, user.weapon.name)
    // Indiana Jones uses a whip
    // Batman uses a boomerang
  });
});
// Note that we didn't need to specify the Weapon model because
// it is in the schema's ref
```

## Referințe

- [Model.populate()](https://mongoosejs.com/docs/api.html#model_Model.populate)
- https://thecodebarbarian.com/whats-new-in-mongoose-5-12-populate-transform.html
- https://thecodebarbarian.com/mongoose-schema-design-pattern-store-what-you-query-for.html
