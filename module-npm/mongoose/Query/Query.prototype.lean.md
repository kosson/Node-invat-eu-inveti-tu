# Query.prototype.lean()

Metoda setează opțiunea `lean`.
Documentele care sunt returnate din interogări în care s-a folosit opțiunea `lean` sunt obiecte JavaScript simple, nu Documente Mongoose. Acestea nu au metoda `save`, nu au virtuals, nu au getteri/setteri sau alte caracteristici ale lui Mongoose.

```javascript
new Query().lean() // true
new Query().lean(true)
new Query().lean(false)

const docs = await Model.find().lean();
docs[0] instanceof mongoose.Document; // false
```

Această opțiune este luată în considerare în cazurile în care este necesară realizarea unor performanțe sporite dar pe documente read-only, mai ales atunci când sunt implicate și cursoarele.

În momentul în care faci o interogare, rezultatul care va fi întors este un Document Mongoose, nu un simplu obiect. Ceea ce se petrece este o *hidratare* a datelor înregistrării din bază cu multe alte proprietăți care mențin starea și oferă interacțiunea cu aceste date.

Ce se pierde prin `lean`:
- change tracking;
- casting și validare;
- getteri și setteri;
- virtuals;
- `save()`.

Populate funcționează cu `lean()`. În cazul în care folosești împreună `populate()` cu `lean()`, opțiunea `lean` se va propaga la documentele populate.

```javascript
// Creează modelele
const Group = mongoose.model('Group', new mongoose.Schema({
  name: String,
  members: [{ type: mongoose.ObjectId, ref: 'Person' }]
}));
const Person = mongoose.model('Person', new mongoose.Schema({
  name: String
}));

// Inițializează datele
const people = await Person.create([
  { name: 'Benjamin Sisko' },
  { name: 'Kira Nerys' }
]);
await Group.create({
  name: 'Star Trek: Deep Space Nine Characters',
  members: people.map(p => p._id)
});

// Execută un lean query
const group = await Group.findOne().lean().populate('members');
group.members[0].name; // 'Benjamin Sisko'
group.members[1].name; // 'Kira Nerys'

// `group`, precum și `members` care au fost populați, sunt lean.
group instanceof mongoose.Document; // false
group.members[0] instanceof mongoose.Document; // false
group.members[1] instanceof mongoose.Document; // false
```

Același lucru funcționează și pentru virtual populate.

```javascript
// Crearea modelelor
const groupSchema = new mongoose.Schema({ name: String });
groupSchema.virtual('members', {
  ref: 'Person',
  localField: '_id',
  foreignField: 'groupId'
});
const Group = mongoose.model('Group', groupSchema);
const Person = mongoose.model('Person', new mongoose.Schema({
  name: String,
  groupId: mongoose.ObjectId
}));

// Inițializare cu date
const g = await Group.create({ name: 'DS9 Characters' });
const people = await Person.create([
  { name: 'Benjamin Sisko', groupId: g._id },
  { name: 'Kira Nerys', groupId: g._id }
]);

// Execută un lean query
const group = await Group.findOne().lean().populate({
  path: 'members',
  options: { sort: { name: 1 } }
});
group.members[0].name; // 'Benjamin Sisko'
group.members[1].name; // 'Kira Nerys'

// `group`, precum și `members` care au fost populați, sunt lean.
group instanceof mongoose.Document; // false
group.members[0] instanceof mongoose.Document; // false
group.members[1] instanceof mongoose.Document; // false
```

## Când folosești lean

Atunci când faci o interogare și trimiți rezultatele fără modificare unui răspuns Express, ar trebui să folosești `lean`. În general, dacă nu modifici rezultatele unei interogări sau nu folosești getteri custom, ar trebui să folosești `lean`.

```javascript
// As long as you don't need any of the Person model's virtuals or getters,
// you can use `lean()`.
app.get('/person/:id', function(req, res) {
  Person.findOne({ _id: req.params.id }).lean().
    then(person => res.json({ person })).
    catch(error => res.json({ error: error.message }));
});
```

Mai jos este un exemplu al unei rute Express în care nu ar trebui să folosești `lean`. Este cazul unui RESTful API. De altfel, rute precum PUT sau POST nu ar trebui să folosească `lean`.

```javascript
// This route should **not** use `lean()`, because lean means no `save()`.
app.put('/person/:id', function(req, res) {
  Person.findOne({ _id: req.params.id }).
    then(person => {
      assert.ok(person);
      Object.assign(person, req.body);
      return person.save();
    }).
    then(person => res.json({ person })).
    catch(error => res.json({ error: error.message }));
});
```

Adu-ți mereu aminte că virtualele (*virtuals*) nu ajung în rezultatele query-ului. Pentru a adăuga și virtuals în rezultatele lean finale, folosește plugingul specializat [mongoose-lean-virtuals plugin](http://plugins.mongoosejs.io/plugins/lean-virtuals).

## Resurse

- [Faster Mongoose Queries With Lean](https://mongoosejs.com/docs/tutorials/lean.html)
