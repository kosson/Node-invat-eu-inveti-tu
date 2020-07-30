# Căutările (query) folosind Mongoose

Modelele generate în baza schemelor, folosesc câteva metode pentru a realiza CRUD-uri:

- Model.deleteMany()
- ModeldeleteOne()
- Modelfind()
- ModelfindById()
- ModelfindByIdAndDelete()
- ModelfindByIdAndRemove()
- ModelfindByIdAndUpdate()
- ModelfindOne()
- ModelfindOneAndDelete()
- ModelfindOneAndRemove()
- ModelfindOneAndReplace()
- ModelfindOneAndUpdate()
- ModelreplaceOne()
- ModelupdateMany()
- ModelupdateOne()

Toate aceste metode în momentul în care sunt executate, returnează câte un obiect `Query` generat de Mongoose. Acestor query-uri poți să le pasezi un callback semnalându-i lui Mongoose să execute asincron operațiunea și apoi să paseze rezultatul callback-ului când a terminat. Query-urile au și o metodă `then` care poate fi folosită pentru a le trata ca promisiuni.

Atunci când execuți un query folosind un callback, îi pasezi ca prim argument un obiect cu proprietăți care vor fi folosite pentru a face selecția, apoi un filtru, dacă se dorește și la final callback-ul care în Mongoose primește doi parametri: `err` și `rezultatul`.

```javascript
var UnModel = mongoose.model('UnModel', OSchemă);
// caută toți copiii cu vârsta de 9 ani.
UnModel.findOne({'profil.vârstă': '9'}, 'nume, localitate', function (err, persoană) {
  if (err) return handleError(err);
  console.log('%s %s din %s', persoană.nume, persoană.prenume, persoană.localitate);
});
```

Reține faptul că rezultatele aduse de metoda modelului care a fost aleasă, vor fi pasate callback-ului.

În cazul în care nu pasezi un callback pentru a trata interogarea, poți să *desfaci* în mai multe operațiuni. Mai întâi construiești obiectul `Query`. Acest lucru permite realizarea unui lanț de tratare a interogării în loc să precizezi direct obiectul JSON.

```javascript
var UnModel = mongoose.model('UnModel', OSchemă);
// caută toți copiii cu vârsta de 9 ani.
var query = UnModel.findOne({'profil.vârstă': '9'});
```

Apoi, folosind metoda `select` a obiectului `Query` vom specifica care sunt câmpurile de care suntem interesați din întreaga înregistrare.

```javascript
query.select('nume, localitate');
```

Având aceste două lucruri definite, putem iniția interogarea ulterior folosind metoda `exec` a obiectului `Query` pe care l-am definit deja.

```javascript
query.exec(function (err, persoană) {
  if (err) return handleError(err);
  console.log('%s %s din %s', persoană.nume, persoană.prenume, persoană.localitate);
});
```

Relevant este exemplul oferit în documentație pentru posibilele două lanțuri separate de prelucrare a unei interogări.

```javascript
// Prima folosind un JSON cu integrare de operatori ai MongoDB.
Person.
  find({
    occupation: /host/,
    'name.last': 'Ghost',
    age: { $gt: 17, $lt: 66 },
    likes: { $in: ['vaporizing', 'talking'] }
  }).
  limit(10).
  sort({ occupation: -1 }).
  select({ name: 1, occupation: 1 }).
  exec(callback);

// Iar a doua construiește prin înlănțuire un query
Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation').
  exec(callback);
```

Un `Query` nu va acționa asupra bazei de date în niciun fel. Abia când se aplică `exec()` sau `then()`, se va executa operațiunea în conjuncție cu baza. Metoda `exec()` va lua întregul obiect de interograre și îl va trimite lui MongoDB.

Documentația precizează faptul că indiferent de faptul că avem acces la o metodă `then()` pentru obiectul returnat din apelarea lui `exec()`, obiectul resultat nu este o [promisiune](https://mongoosejs.com/docs/queries.html#queries-are-not-promises). Această funcție este un utilitar necesar integrării în fluxuri de lucru folosind pachetul `co` sau în scenarii `async/await`. Spre deosebire de promisiuni, această metodă `then` poate fi aplicată de mai multe ori pe aceeași interogare. Exemplul oferit în documentație este concludent.

```javascript
const q = MyModel.updateMany({}, { isDeleted: true }, function() {
  console.log('Update 1');
});

q.then(() => console.log('Update 2'));
q.then(() => console.log('Update 3'));
```

Mai întâi este executată interogare ca urmare a aplicării modelului ce folosește callback, iar ulterior, același obiect la care încă există referință este folosit pentru a face prelucrări ulterioare. Este recomandabil să nu amestecați callback-urile cu promisiunile folosind același obiect query pentru că vei ajunge să dublezi operațiunile.

## Modificatori ai obiectului `Query`

Un modificator va sta între obiectul `Query` format de `User.findOne({email: data.email})` și metoda `then()` pe care o aplici promisiunii generate de obiectul `Query` - `User.findOne({email: data.email}).modificator.then()`. Misiunea modificatorilor este de a customiza `Query`-urile făcute.

Un exemplu pentru modificatori ar fi metoda `populate('numeProprietateDinModelulPeCareFaciCautarea1', 'numeProprietateDinModelulPeCareFaciCautarea2', 'șamd')`.

**Stringurile pe care le pasezi metodei `populate()` sunt colecții care au înregistrări ce conțin `ObjectId`-ul prezentei înregistrări adusă în baza obiectului `Query`**.

```javascript
// /modele/userModel.js
var User = new Schema({
  //...
  REDuriPers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'resursedu'
  }], // id-urile resurselor create de utilizator
  // ...
});
module.exports = mongoose.model('user', User);
// /modele/reduriModel.js
var Resursa = new mongoose.Schema({}
  //...
  creator: [{   // este ceea ce numim autor / autori ai resursei. Poate fi unul sau mai mulți. Este o colecție de id-uri de utilizatori.
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
  }],
  //...
);
// test_asocieri.js
User.findOne({email: 'cici@gob.ro'})
            .populate('REDuriPers')
            .then((utilizator) => {
                // console.log(utilizator);
                done();
            });
```

Fii foarte atent faptul că `populate` aduce toate documentele în rezultatul evaluării în loc de `ObjectId`-uri.

## Clasa Query

Clasa `Query` reprezintă operațiuni CRUD brute în relația cu MongoDB. Oferă o interfață care permite înlănțuirea. Această clasă nu se instanțiază direct, ci vei folosi un model, pe care aplicând metoda `find()`, de exemplu, va returna un obiect de tip `Query`.

```javascript
const query = Customer.find();
query instanceof mongoose.Query; // true
```

Metodele `find()` aplicate pe model, pot fi înlănțuite. Fiecare metodă aplicată, va face o modificare a obiectului `Query` pe care se aplică și după ce s-au executat modificările, obiectul este returnat următoarei metode, dacă mai este vreuna. Dacă nu mai este niciuna, obiectul `Query` este gata să-i fie aplicată metoda `exec()`, care va face operațiunile în relație cu Mongoose.

```javascript
// https://docs.mongodb.com/manual/reference/operator/query/
Customer.find({ email: /foo\.bar/, age: { $gte: 30 } });
// Echivalent cu:
Customer.find({ email: /foo\.bar/ }).find({ age: { $gte: 30 } });
```

Obiectele `Query` au mai multe helpere, care permit construirea unor operațiuni CRUD complexe (`sort()`, `limit()`, `skip()`).

```javascript
// Find the customer whose name comes first in alphabetical order, in
// this case 'A'. Use `{ name: -1 }` to sort by name in reverse order.
const res = await Customer.find({}).sort({ name: 1 }).limit(1);

// Find the customer whose name comes _second_ in alphabetical order, in
// this case 'B'
const res2 = await Customer.find({}).sort({ name: 1 }).skip(1).limit(1);
```

Unul din lucrurile importante pe care le face Mongoose este casting-ul valorilor la cele specificate în schema modelului. Acest lucru se face automat.

## Referințe

- [Queries|Mongoose](https://mongoosejs.com/docs/queries.html)
- [How find() Works in Mongoose](http://thecodebarbarian.com/how-find-works-in-mongoose.html)
- [Query on Embedded/Nested Documents, ](https://docs.mongodb.com/manual/tutorial/query-embedded-documents/).
- [Query on Nested Field](https://docs.mongodb.com/manual/tutorial/query-embedded-documents/#query-on-nested-field)
