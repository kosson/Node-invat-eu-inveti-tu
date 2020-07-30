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

În fragmentul de mai sus `query` este de tip `Query`, ceea ce permite elaborarea interogării și trimiterea către MongoDB folosind chainingul. Ceea ce construiește Mongoose este un obiect de interogare - `User.findOne({email: data.email})`.

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
};
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
