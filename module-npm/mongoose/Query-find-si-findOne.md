# Metodele `find` și `findOne`

De îndată ce va fi instanțiat obiectul model, ai acces la mai multe metode printre care de mare folos atunci când ai nevoie să cauți înregistrări în baza de date sunt `find(criteriiDeCăutare)` și `findOne(criteriiDeCăutare)`.

Metoda `find()` va aduce un `Array` de înregistrări din baza de date, în vreme ce `findOne()` va aduce doar una singură.

```javascript
// TODO: verifica dacă utilizatorul este în baza de date
var User = require('./app/models/users'),
    user = new User();

user.name     = data.name;
user.email    = data.email;
user.password = data.password;

// METODA DE CĂUTARE CU CALLBACK
User.findOne({email: data.email}, 'name email', function(err, user) {
          if (err) throw err;
          if (user) {
            // console.log(`${user.email} există deja`);
            // console.log('$s există și are emailul $s', user.name, user.email);
            socket.emit('mesaje', `${user.email} există deja`);
            return;
          }
        });

// METODA DE EXECUȚIE ÎNTÂRZIATĂ - LA CERERE
// selectează persoana din bază care are mailul specificat
var query =  User.findOne({email: data.email});
// selectează câmpurile pe care vrei să le aduci în rezultat
query.select('name email');
// execută interogarea la un moment viitor când este nevoie
query.exec(function(err, user) {
          if (err) throw err;
          if (user) {
            // console.log(`${user.email} există deja`);
            // console.log('$s există și are emailul $s', user.name, user.email);
            socket.emit('mesaje', `${user.email} există deja`);
            return;
          }
        });

// MOTODA CARE FOLOSESTE UN CURSOR
User.findOne({email: data.email})
    .cursor()
    .on('data', function(user){
      // console.log(user);
      // socket.emit('mesaje', `${user.email} există deja`);
      socket.emit('mesaje', {mesaj: 'Un user cu același email există deja. Alege alt email.'});
    })
    .on('end', function(){console.log('am terminat cautarea')});
```

În fragmentul de mai sus `query` este de tip `Query`, ceea ce permite elaborarea interogării și trimiterea către MongoDB folosind chainingul. Ceea ce construiește Mongoose este un obiect de interogare - `User.findOne({email: data.email})`. Un `Query` nu va acționa asupra bazei de date în niciun fel. Abia când se aplică `exec()` sau `then()`, se va executa operațiunea în conjuncție cu baza.

```javascript
// With a JSON doc
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

// Using query builder
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

Metoda `exec()` va lua întregul obiect de interograre și îl va trimite lui MongoDB.

## `findOne` și obiecte imbricate

În momentul în care ai de-a face cu o înregistrare complexă, a cărui câmp este un alt obiect, la momentul formării obiectului `Query`, dacă facem o căutare după o anumită informație internă, va trebui să precizăm calea de regăsire în adâncimea obiectului, după tipicul `'element.subelement': 'valoarea'`.

```javascript
// resursa-red.js
var Resursa = new mongoose.Schema({
    language: {
        context: ['http://purl.org/dc/elements/1.1/language', 'https://schema.org/Language'],
        value: String,
        i18n: {
            value: [],
            label: []
        }
    }
}
// subdocument_test.js
const resursa = new Resursa({
    title: {value: 'Teorema lui Pitagora'},
    description: {value: 'Este o resursă pentru Matematică.'}
});
Resursa.findOne({'title.value': 'Teorema lui Pitagora'}, function existaRed (err, record) {
  if (err) throw err;
  console.log(record);
});
```

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

## Resurse

- [Query on Embedded/Nested Documents, ](https://docs.mongodb.com/manual/tutorial/query-embedded-documents/).
- [Query on Nested Field](https://docs.mongodb.com/manual/tutorial/query-embedded-documents/#query-on-nested-field)
