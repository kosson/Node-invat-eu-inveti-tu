```js
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
    .on('end', function(){console.log('am terminat cautarea');});
```

În codul de mai sus `query` este de tip `Query`, ceea ce permite construirea interogării și trimiterea către sistemul de interogări al MongoDB folosind chainingul.

```js
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
