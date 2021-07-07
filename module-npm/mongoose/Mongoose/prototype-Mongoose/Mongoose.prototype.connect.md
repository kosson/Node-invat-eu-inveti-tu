# Mongoose.prototype.connect()

Deschide o conexiune cu MongoDB. Această metodă primește trei parametri.

## Parametrii

### `uri`

Este un șir de caractere care indică adresa la care se face conectarea pe MongoDB. Pentru a se conecta la o bază de date MongoDB, mongoose folosește [driverul](http://mongodb.github.io/node-mongodb-native/) pentru Node.js pus la dispoziție de creatorii Mongo.

### `obiect`

Acest obiect este pasat funcției [`connect`](http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html) a driverului MongoDB, care acceptă un [string de conectare](https://docs.mongodb.com/manual/reference/connection-string/).

- `dbName` (String), fiind numele bazei de date pe care dorim să o folosim. Dacă nu este menționat nimic, va fi utilizată baza menționată la `mongoose.connect `( de exemplu:`mongoose.connect('mongodb://localhost:27017/spatiu-resurse', {useNewUrlParser: true});`).
- `user`(String), fiind utilizatorul necesar autentificării la MongoDB. Acesta este fix cel de la `options.auth.user`. Opțiunea este menținută din rațiuni de compatibilitate cu versiunile aterioare.
- `pass`(String), fiind parola. Este echivalent cu `options.auth.password`. Opțiunea este menținută din rațiuni de compatibilitate cu versiunile aterioare.
- `autoIndex=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `false`, se va dezactiva crearea automată a indexurilor pentru toate modelele asociate cu această conexiune.
- `bufferCommands=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `false`, buffering-ul va fi deazctivat pentru toate modelele asociate cu prezenta conexiune.
- `useCreateIndex=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `true`, această conexiune va folosi `createIndex()` în loc de `ensureIndex` în cazurile în care se construiesc automat indexuri folosind `Model.init()`.
- `useFindAndModify=true` (Boolean), fiind o opțiune, care în cazul setării la `false`, va forța ca metodele `findOneAndUpdate()` și `findOneAndremove()` să folosească varianta originală `findOneAndUpdate()` în locul lui `findAndModify()`.
- `useNewUrlParser=false` (Boolean), fiind o opțiune, care în cazul setării la `true`, va forța toate conexiunile să-și seteze opțiunea `useNewUrlParser` din oficiu.

### `callback`

Funcția declanșată ca răspuns.

Metoda fiind o promisiune va rezolva la `this`, dacă are succes, având ca efect deschiderea unei conexiuni.

```javascript
mongoose.connect('mongodb://user:pass@localhost:port/database');

// replica sets
var uri = 'mongodb://user:pass@localhost:port,anotherhost:port,yetanother:port/mydatabase';
mongoose.connect(uri);

// with options
mongoose.connect(uri, options);

// optional callback that gets fired when initial connection completed
var uri = 'mongodb://nonexistent.domain:27000';
mongoose.connect(uri, function(error) {
  // if error is truthy, the initial connection failed.
})
```
