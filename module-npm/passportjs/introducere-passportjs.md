# Passport

Passport este un middleware care oferă autentificare pentru aplicațiile construite folosind Express.js.
Primul pas este instalarea pachetului central:

```bash
npm install passport
```

După ce a fost instalat, cere `passport` pentru ca mai apoi să-l inițializezi. Această inițializare trebuie făcută după ce s-a instanțiat mecanismul sesiunilor pentru cazul în care autentificarea este menținută prin folosirea unei sesiuni.

```javascript
const passport = require('passport');

app.use(express.session({secret: '#catForeverNot!!!'}));
app.use(passport.initialize()); // inițializare
app.use(passport.session()); // folosește și middleware-ul sesiunilor după `express.session`
```

Într-o aplicație web credențialele folosite pentru a autentifica un utilizator vor fi transmise în timpul cererii de autentificare. Dacă autentificarea reușește, se va stabili o sesiune care va fi menținută utilizându-se un cookie setat în browserul clientului. Apoi, fiecare cerere va fi însoțită de cookie-ul care indentifică sesiunea de lucru. Pentru a oferi suport pentru sesiunile de lucru a unui client care este deja logat, Passport trebuie să procedeze la serializarea și deserializarea din obiectul sesiunii a obiectului user.

```javascript
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  // User este un document Mongoose
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
```

În exemplul de mai sus, doar id-ul utilizatorului este serializat în sesiune cu scopul de a ține dimensiunea datelor care trebuie stocate la o dimensiune redusă. Apoi, ori de câte ori este primită o cerere, va fi folosit acest id pentru a căuta userul, care va introdus în `req.user`. Logica de serializare/deserializare aparține aplicației, care alege baza de date și ORM-ul aferent, fără ca acestea să fie impuse de layerul de autentificare.

Autentificarea se face în baza unor strategii, fiecare dintre acestea având propriul pachet npm (de ex. `passport-google-oauth20`).

## Strategiile

O strategie este un middleware. O cerere pe o anumită rută va intra în prelucrările middleware-ului unei strategii Passport, iar dacă utilizatorul este verificat și autentificat, cererea va fi prelucrată mai departe de logica rutei aferente din Express.js. Dacă utilizatorul nu poate fi autentificat, Passport va emite o eroare `401 Unauthorized Error`.

### Crearea unei strategii

Pentru a crea o strategie, mai întâi trebuie instanțiat `passport` și modulul strategiei dorite, de exemplu `passport-local`.

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
```

### Configurarea unei strategii

Înainte de a autentifica o cerere, o strategie trebuie mai întâi [configurată](http://www.passportjs.org/docs/configure/). Pentru a procesa o strategie, se va folosi metoda `use()`, care primește drept prim argument o instanță a obiectului strategie.

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy());
```

La instanțierea obiectului, se va pasa clasei strategiei o funcție de verificare cu rol de callback.

```javascript
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy( function verifyClbk (username, password, done) {
  // Cauți în baza de date utilizatorul după username. `User` este un document Mongoose
  User.findOne({username: username}, (err, user) => {
    // Prima dată, tratează cazul erorii la căutare în bază, fiind probleme cu baza
    if (err) {
      return done(err);
    }
    // în cazul în care utilizatorul nu există
    if (!user) {
      // returnează rezultatul callback-ului `done`.
      return done(null, false, {mesaj: 'Userul nu a fost scris corect.'});
    }
    // în cazul în care utilizatorul a fost găsit, dar parola nu se potrivește
    if (!user.validPassword(password)) {
      // returnează rezultatul callback-ului `done`.
      return done(null, false, {mesaj: 'E o problemă cu parola.'});
    }
    // dacă userul și prola sunt corecte
    done(null, user);
  });
}));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  // User este un document Mongoose
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
```

Funcția de verificare a parolei, `validPassword` poate fi o implementare similară cu următorul fragment de cod.

```javascript
const crypto = require('crypto');
/**
 * Funcția are rolul de a valida o parolă care vine de la userul care este la etapa de logare
 * @param {String} password Este parola în clar care vine de la clientul care face logarea
 * @param {String} hash Este hashul parolei din baza de date - user rec
 * @param {String} salt Este hash-ul salt-ului care este tot din baza de date - user rec
 */
function validPassword (password, hash, salt) {
    let hashVerify = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex');
    return hash === hashVerify;
}
```

Trebuie menționat faptul că numele primilor doi parametrui pasați funcției de verificare trebuie să fie neschimbați: `username` și `password`. În cazul în care numele câmpurilor din formular nu sunt aceleași, avem o problemă care poate fi rezolvată printr-un obiect suplimentar.

```javascript
// Posibila cale a fișierului: ./routes/authL.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const customFields = {
    usernameField = "email",
    passportFiels = "password"
};

function verifyClbk (username, password, done) {
  //... implementarea de verificare
};

passport.use(new LocalStrategy(customFields, verifyClbk));
```

La final, tot ce mai trebuie să faci este să faci un simplu `require('./routes/authL')` pe fișierul care definește strategia locală în fișierul unde se constituie aplicația Express.js, de regulă `app.js` din rădăcina proiectului. Ceea ce se petrece în spate este că `passport.use(new LocalStrategy(customFields, verifyClbk))` este inclusă în `app.js`.

Request-ul trebuie făcut înainte de `app.use(passport.initialize())`.

```javascript
// ./app.js
require('./routes/authL');
app.use(passport.initialize());
app.use(passport.session());
```

Aceste două middleware-uri vor fi executate pentru fiecare cerere care vine pe aplicație de fiecare dată.

În ceea ce privește inițializarea Passport, `express-session` creează sesiunea de lucru, ceea ce înseamnă că vom avea disponibil un obiect `request.session` în callback-ul care tratează ruta. În acesta vei găsi un obiect `cookie`. De îndată ce ești autentificat, ai la îndemână un obiect suplimentar numit `passport` în `req.session`, care are următorul posibil conținut: `passport: {user: '5br332543klhj5h34'}`. Acest obiect este obținut prin funcția `serializeUser()` care ia userul din baza de date, îi ia id-ul și îl inserează în `passport.user` a obiectului din `session`. Pentru a obține userul din sesiunea existentă pentru a introduce datele în obiectul `req.user`, Passport apelează la funcția `deserializeUser` care ia datele din baza de date în baza id-ului care deja există în `req.session` și creează un obiect cu posibila semnătură: `{_id: '5kejrewk34j3k43', username: 'nick', hash: 'dsad9isida', salt: '9i9fd0fsd9fs', _v: 0}`.

Middleware-ul pe care îl creează Passport introduce obiectul `request.user`.

Funcțiile `initialize` și `session` verifică dacă `req.session.passport.user` este `null` și dacă nu, înseamnă că un user este deja logat și astfel prin intermediul funcției `deserializeUser` va popula `req.user`.

## Autentificarea

Toate stategiile vor folosi metoda [authenticate](http://www.passportjs.org/docs/authenticate/) căreia îi pasezi drept prim parametru numele strategiei pe care o folosești. Pentru a face autentificarea pe ruta dorită, se va poziționa middleware-ul `passport.authenticate()` înainte ca cererea să ajungă în logica care tratează ruta.

```javascript
app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
  });
```

Când cererea ajunge pe `passport.authenticate()`, funcția callback de verificare iî vor fi populați parametrii `username` și `password` cu valori, se va face verificarea și în funcție de rezultatul returnat, va trece mai departe în rută sau nu.

Pe middleware ar mai trebui adăugat un parametru care să indice ceea ce se va petrece dacă autentificarea a reușit sau din contră.

```javascript
app.post('/login', passport.authenticate('local', {failureRedirect: '/login', successRedirect: '/'}), function (req, res) {
  // ...
});
```

Pentru că altceva nu mai este nevoie să fie făcut dincolo de verificarea autentificării, nu mai este nevoie de funcția care să trateze cererea. Lucrurile se simplifică.

```javascript
app.post('/login', passport.authenticate('local', {failureRedirect: '/login', successRedirect: '/'}));
```

Pentru a face logout, pur și simplu, se va apela metoda `logout()` disponibilă din obiectul `req`.

```javascript
app.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

### Metoda isAuthenticated

Această metodă pote fi folosită într-o rută pentru a verifica dacă `req.session.passport.user` este și nu este `null` pentru a lua decizii cu privire la ceea ce este afișat clientului. Meoda este disponibilă din obiectul `request` (`req`).

```javascript
router.get('/pathsecurizat', (req, res, next) => {
  if (req.isAuthenticated()) {
    res.send('<p>Ești logat și vezi asta!</p>');
  } else {
    res.send('<p>Nu ești logat și vezi doar asta</p>');
  }
});
```

Cel mai adesea vei vedea metoda atașată unei rute ca middleware.
