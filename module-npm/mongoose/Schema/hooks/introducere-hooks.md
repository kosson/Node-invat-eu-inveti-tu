# Hooks

Mongoose respectă paradigma Node.js care este cea a gestionării de evenimente. Ceea ce ne este oferit cu aceste *hooks* (am putea traduce *cârlige*), este posibilitatea de a adăuga funcții (middleware), care să fie executate înainte sau după un event pe care *cârligul* îl ascultă, iar când apare, execută callback-ul.

Când apare evenimentul, funcțiile cu rol de callback preiau controlul în timpul execuției asincrone.
Middleware-ul este specificat la nivel de schemă și este util pentru a scrie [pluginuri](http://mongoosejs.com/docs/plugins.html), care au capacitatea de a extinde schema. Imediat ce declari schema, trebuie să declari și middleware-ul. Apelarea `pre()` și `post()` după compilarea unui model, nu funcționează.

```javascript
const schema = new mongoose.Schema({ name: String });

// Compilarea modelului folosind schema
const User = mongoose.model('User', schema);

// Mongoose nu va apela middleware-ul pentru că a fost declarat după compilarea modelului
schema.pre('save', () => console.log('Facem ceva înainte de save?!'));

new User({ name: 'test' }).save();
```

Declară tot middleware-ul și plugin-urile înainte de a executa `mongoose.model()`. Din acest motiv există o problemă în momentul în care decizi să creezi o schemă și să exporți modelul compilat din interiorul aceluiași fișier.

```javascript
const schema = new mongoose.Schema({ name: String });

// În momentul în care faci `require()` pe acest fișier,
// nu mai poți adăuga vreun middleware la prezenta schemă.
module.exports = mongoose.model('User', schema);
```

În cazul în care folosești acest șablon de structurare a codului, trebuie să declari un plugin la nivel global, care să fie apelat pentru a fi executat pe toate schemele. Este echivalentul apelării lui `.plugin(fn)` pe fiecare schemă pe care o creezi.

## Evenimente

Un eveniment poate fi căutarea în bază sau ștergerea unei înregistrări, ori actualizarea unei înregistrări. De cele mai multe ori vei avea un scenariu de tip *one-to-many* în care dorești să ștergi înregistrarea unui utilizator din baza de date, dar în același timp dorești să ștergi și toate înregistrările asociate cu acesta. În acest scenariu, vei folosi un hook `pre`, care înainte de a șterge utilizatorul, va căuta toate înregistrările asociate cu acesta și le va șterge mai întâi de toate.

Dacă dorim să introducem middleware (funcții) care să facă ceva înainte de a declanșa un eveniment, vom folosi hook-ul `pre`. Dacă dorim executarea unor funcții (middleware) după ce s-a petrecut un eveniment, vom folosi hook-ul `post`.

De exemplu poți defini un **pre hook** pentru document. Pe scurt, fă ceva înainte de a salva cu metoda `save`.

```js
UserSchema.pre('save', function(next){});
```

Metoda pre face parte din biblioteca de cod [hooks](https://github.com/bnoguchi/hooks-js/tree/31ec571cef0332e21121ee7157e0cf9728572cc3), care menționează: dacă folosiți un obiect cu o metodă *save*, *hooks* permite rularea de cod înainte de `save` și după `save`. De exemplu, vrei să faci validări înainte de `save` sau vrei să faci o acțiune după ce s-a făcut `save`.

Atașarea funcționalităților se face prin intermediul apelurilor la *pre* și *post*.

Biblioteca de cod hooks face parte din pachetul de instalare al lui `mongoose`.

Posibile evenimente în Mongoose:

- `init` - care apare la inițializarea unui model;
- `validate` - care apare la momentul în care se dorește validarea datelor;
- `save` - care este folosit pentru salvarea în baza de date;
- `remove` - pentru ștergerea unei înregistrări din bază.

De regulă, middleware-ul folosit, fie în `pre`, fie în `post` va fi declarat chiar în fișierul modelului.
Pentru a introduce un middleware într-un hook, mai întâi trebuie pasat hook-ului un argument care menționează chiar evenimentul pentru care acesta trebuie să intre în execuție. Și apoi, așa cum ne-a obișnuit modul de lucru al NodeJS, vom introduce un callback. Acest callback, această funcție va fi apelată ori de câte ori apare evenimentul specificat la primul parametru. De exemplu, atunci când dorim să facem un *save* în baza de date, acesta callback este cel care va fi apelat înainte de a se face salvarea. Mai jos avem exemplul unui scenariu în care executăm middleware atunci când ștergem ceva din baza da date.

```javascript
Resursa.pre('remove', function hRemoveCb(next) {
    const Coment = monoose.model('coment'); // acces direct la model fără require
    Coment.remove({ // -> Parcurge întreaga colecție a comentariilor
        // -> iar dacă un `_id`  din întreaga colecție de comentarii se potrivește cu id-urile de comentariu din întregistrarea resursei (`$in: this.Coment`), șterge-le.
        _id: {$in: this.Coment} // se va folosi operatorul de query `in` pentru a șterge înregistrările asociate
    }).then(() => next()); // -> acesta este momentul în care putem spune că înregistrarea a fost eliminată complet.
});
```

Evită scenariile în care un model are nevoie de un altul, iar acela la rândul său pe primul. Aceasta este o circularitate care trebuie evitată. Pentru a o evita, în cazul hook-urilor, se poate referi un model folosind metoda `mongoose.model('numeModelCerut')`. Acest helper `mongoose.model` oferă acces direct la un model fără să-l mai ceri cu *require*.

Fii foarte atent ca în declararea hook-urilor să declari funcția cu rol de callback folosind cuvântul cheie `function` și să nu folosești fat arrow. Acest lucru este necesar pentru că accesul la model sau mai bine spus reprezentarea modelului este accesibilă doar prin `this`.

După cum se observă în exemplu, funcția cu rol de callback la momentul executării trebuie să semnaleze cumva lui mongoose faptul că și-a încheiat execuția. În acest sens, callback-ul va primi drept argument referința către o funcție pe care o vom apela după ce toate operațiunile se vor fi încheiat. Acest `next()` va reda controlul lui mongoose, care, în funcție de caz, va executa următorul middleware sau mai departe alte operațiuni dacă un altul nu mai există.

## Hookuri save/validate

Hookurile save declanșează pe cele validate deoarece mongoose are un hook `pre('save')` care apelează `validate()`. Acest lucru înseamnă că toate hookurile `pre('validate')` și `post('validate')` sunt apelate înainte de oricare `pre('save')`.

```javascript
schema.pre('validate', function() {
  console.log('apare prima dată');
});
schema.post('validate', function() {
  console.log('apare după prima');
});
schema.pre('save', function() {
  console.log('apare după a doua');
});
schema.post('save', function() {
  console.log('apare ultima');
});
```

## Cazul `remove()`

Mongoose oferă hook-uri la nivel de document, cât și la nivel de query.

```javascript
schema.pre('remove', function() { console.log('Șterg documentul!'); });

doc.remove(); // Apare 'Șterg documentul!'

Model.remove(); // nu apare mesajul pentru că middleware-ul Query nu ese executat din oficiu
```

## Cazul `findAndUpdate()`

Hook-urile `save()` la nivel `pre` și `post` nu se execută pe `update()` și `findOneAndUpdate()`.

```javascript
schema.pre('find', function() {
  console.log(this instanceof mongoose.Query); // true
  this.start = Date.now();
});

schema.post('find', function(result) {
  console.log(this instanceof mongoose.Query); // true
  // afișează documentele returnate
  console.log('find() returnează ' + JSON.stringify(result));
  // afișează numărul de milliseconde în care s-a făcut query-ul
  console.log('find() a luat ' + (Date.now() - this.start) + ' millsecunde');
});
```

Middleware-ul aplicat unui `Query` diferă de middleware-ul documentelor în sensul că legătura `this` în cazul middleware-ului de documente, se referă la documentul care este actualizat. În cazul query-urilor, `this` se referă la obiectul query.

Exemplul dat în documentație este foarte util pentru a înțelege. Să presupunem că dorim să adăugăm o marcă de timp pentru fiecre operațiune `updateOne()`. Poți face acest lucru folosind un hook `pre`.

```javascript
schema.pre('updateOne', function() {
  this.set({ actualizatLa: new Date() });
});
```

În această operațiune nu vei putea atinge obiectul document așa cum nici în `pre('findOneAndUpdate')` nu vei putea. În cazul în care ai nevoie să accesezi documentul care va fi actualizat, trebuie să execuți un query explicit pentru document.

```javascript
schema.pre('findOneAndUpdate', async function() {
  const docToUpdate = await this.model.findOne(this.getQuery());
  console.log(docToUpdate); // Este chiar documentul pe care `findOneAndUpdate()` îl va modifica
});
```

Totuși, dacă vei defini un hook `pre('updateOne')` ca middleware de document, legătura  `this` va fi stabilită la documentul care este actualizat. Acest lucru se întâmplă pentru că middleware-ul de document `pre('updateOne')` face hook în `Document.updateOne()`, nu în `Query.updateOne`.

```javascript
schema.pre('updateOne', { document: true, query: false }, function() {
  console.log('Actualizez...');
});
const Model = mongoose.model('Test', schema);

const doc = new Model();
await doc.updateOne({ $set: { nume: 'test' } }); // Afișează 'Actualizez...'

//Nu afișează mesajul pentru că `Query#updateOne()`
// nu declanșează middleware-ul la nivel de document.
await Model.updateOne({}, { $set: { nume: 'test' } });
```

## Middleware pentru tratarea erorilor

Executarea middleware-ului se petrece atunci când un fragment de middleware apelează `next()` cu o eroare. Totuși poți scrie middleware pe care să-l folosești chiar pentru a trata erorile. Acest middleware se dovedește util în raportarea erorilor, dar mai ales în a face mesajele de eroare ceva mai lizibile. Pentru a avea acces la aceste caracteristici specifice tratării erorilor, vom pasa middleware-ului ca prim parametru obiectul `error`, atât de cunoscut ca marcă a Node, de fapt.

```javascript
var schema = new Schema({
  name: {
    type: String,
    // Va ridica o eroare MongoError având codul 11000
    // atunci când salvezi un duplicat
    unique: true
  }
});

// Primul parametru este `error`!
schema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('A a părut o eroare care indică o cheie duplicată.'));
  } else {
    next();
  }
});

// Următorul fragment va conduce la afișarea mesajului de eroare din `post('save')`
Person.create([{ name: 'Axl Rose' }, { name: 'Axl Rose' }]);
```

Erorile pot fi detectate și la nivel de middleware aplicat query-urilor. Poți defini un hook `update()` care va capta erorile.

```javascript
schema.post('update', function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('A a părut o eroare care indică o cheie duplicată.'));
  } else {
    next(); // Apleul la `update()` va genera o eroare în continuare.
  }
});

var people = [{ name: 'Axl Rose' }, { name: 'Slash' }];
Person.create(people, function(error) {
  Person.update({ name: 'Slash' }, { $set: { name: 'Axl Rose' } }, function(error) {
    // `error.message` va avea mesajul "A a părut o eroare care indică o cheie duplicată."
  });
});
```

Atenție, middleware-ul poate transforma o eroare, dar nu poate să o elimine. Și aici este un aspect interesant. Chiar dacă apelezi `next()` fără erori, modul în care este scris codul mai sus în exemplu, va genera totuși o eroare.

## Resurse

- [Define Middleware Before Compiling Models](https://mongoosejs.com/docs/middleware.html#defining)
- [Plugins](https://mongoosejs.com/docs/plugins.html)
- [Error Handling Middleware](https://mongoosejs.com/docs/middleware.html#error-handling-middleware)
