# Mongoose - constructor

Obiectul generat prin `exports` este o instanță a acestei clase.

## Obiectul prototipal

### Mongoose.prototype.Mongoose()

Este constructorul în baza căruia este instanțiat obiectul.

```javascript
var mongoose = require('mongoose');
var mongoose2 = new mongoose.Mongoose();
```



### Mongoose.prototype.Document()

Acesta este constructorul pentru generarea documentelor.

### Mongoose.prototype.Model()

Constructor pentru crearea modelelor.

### Mongoose.prototype.Number

Este o proprietate folosită pentru a defini tipuri de date în Schemă. Este folosit pentru căile pentru care ar trebui făcut casting la number.

```javascript
const schema = new Schema({ num: mongoose.Number });
// echivalent cu:
const schema = new Schema({ num: 'number' });
```

### Mongoose.prototype.ObjectId

Este o proprietate care este folosită pentru a marca corespondentul [`ObjectId`](https://docs.mongodb.com/manual/reference/method/ObjectId/) din MongoDB. Nu folosi această proprietate pentru a instanția un nou `ObjectID`. Pentru a face aceasta, te vei folosi de `mongoose.Types.ObjectID`.

### Mongoose.prototype.Schema()

Acesta este constructorul folosit pentru a cerea schemele cu ajutorul cărora instanțiezi modelele.

```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var NouaSchema = new Schema({
    _id: mongoose.Types.ObjectID
})
```

### Mongoose.prototype.connect()

Deschide o conexiune cu MongoDB. Această metodă primește trei parametri.

#### uri

Este un șir de caractere care indică adresa la care se face conectarea pe MongoDB. Pentru a se conecta la o bază de date MongoDB, mongoose folosește [driverul](http://mongodb.github.io/node-mongodb-native/) pentru Node.js pus la dispoziție de creatorii Mongo.

#### obiect

Acest obiect este pasat funcției [`connect`](http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html) a driverului MongoDB, care acceptă un [string de conectare](https://docs.mongodb.com/manual/reference/connection-string/).

- `dbName` (String), fiind numele bazei de date pe care dorim să o folosim. Dacă nu este menționat nimic, va fi utilizată baza menționată la `mongoose.connect `( de exemplu:`mongoose.connect('mongodb://localhost:27017/spatiu-resurse', {useNewUrlParser: true});`).
- `user`(String), fiind utilizatorul necesar autentificării la MongoDB. Acesta este fix cel de la `options.auth.user`. Opțiunea este menținută din rațiuni de compatibilitate cu versiunile aterioare.
- `pass`(String), fiind parola. Este echivalent cu `options.auth.password`. Opțiunea este menținută din rațiuni de compatibilitate cu versiunile aterioare.
- `autoIndex=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `false`, se va dezactiva crearea automată a indexurilor pentru toate modelele asociate cu această conexiune.
- `bufferCommands=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `false`, buffering-ul va fi deazctivat pentru toate modelele asociate cu prezenta conexiune.
- `useCreateIndex=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `true`, această conexiune va folosi `createIndex()` în loc de `ensureIndex` în cazurile în care se construiesc automat indexuri folosind `Model.init()`.
- `useFindAndModify=true` (Boolean), fiind o opțiune, care în cazul setării la `false`, va forța ca metodele `findOneAndUpdate()` și `findOneAndremove()` să folosească varianta originară `findOneAndUpdate()` în locul lui `findAndModify()`.
- `useNewUrlParser=false` (Boolean), fiind o opțiune, care în cazul setării la `true`, va forța toate conexiunile să-și seteze opțiunea `useNewUrlParser` din oficiu.

#### callback

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

### Mongoose.prototype.connection

Este un obiect de conexiune, care reprezintă conexiunea primară a lui mongoose la MongoDB. Acest obiect este folosit de toate modelele create.

```javascript
var mongoose = require('mongoose');
mongoose.connect(...);
mongoose.connection.on('error', cb);
```

### Mongoose.prototype.connections

Este un array în care sunt toate obiectele conexiune asociate instanței de mongoose. Din start vei avea cel puțin o conexiune.

```javascript
const mongoose = require('mongoose');
mongoose.connections.length; // 1, just the default connection
mongoose.connections[0] === mongoose.connection; // true

mongoose.createConnection('mongodb://localhost:27017/test');
mongoose.connections.length; // 2
```

### Mongoose.prototype.createConnection()

Această metodă acceptă doi parametri:

#### uri

Este un șir de caractere care indică adresa la care se face conectarea pe MongoDB. Pentru a se conecta la o bază de date MongoDB, mongoose folosește [driverul](http://mongodb.github.io/node-mongodb-native/) pentru Node.js pus la dispoziție de creatorii Mongo.

#### obiect

Acest obiect este pasat funcției [`connect`](http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html) a driverului MongoDB, care acceptă un [string de conectare](https://docs.mongodb.com/manual/reference/connection-string/).

- `user`(String), fiind utilizatorul necesar autentificării la MongoDB. Acesta este fix cel de la `options.auth.user`. Opțiunea este menținută din rațiuni de compatibilitate cu versiunile aterioare.
- `pass`(String), fiind parola. Este echivalent cu `options.auth.password`. Opțiunea este menținută din rațiuni de compatibilitate cu versiunile aterioare.
- `autoIndex=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `false`, se va dezactiva crearea automată a indexurilor pentru toate modelele asociate cu această conexiune.
- `bufferCommands=true` (Boolean), fiind o opțiune specifică Mongoose. Dacă este setată la `false`, buffering-ul va fi deazctivat pentru toate modelele asociate cu prezenta conexiune.

Metoda va returna un obiect conexiune, care este o promisiune. Poți folosi cu `await`

```javascript
await mongoose.createConnection(uri, options);
```

Mai corect, ceea ce este returnat e o instanță de conexiune. Fiecare instanță de conexiune, va trimite către o singură bază de date.

Metoda se docedește foarte utilă atunci când se lucrează cu mai multe baze de date deodată.

Fii foarte atent că opțiunile pasate acestei metode vor avea precedență față de opțiunile introduse în șirul de conexiune (*connection string*).

```javascript
// with mongodb:// URI
db = mongoose.createConnection('mongodb://user:pass@localhost:port/database');

// cu obiect de opțiuni
var opts = { db: { native_parser: true }}
db = mongoose.createConnection('mongodb://user:pass@localhost:port/database', opts);

// replica sets
db = mongoose.createConnection('mongodb://user:pass@localhost:port,anotherhost:port,yetanother:port/database');

// și cu opțiuni
var opts = { replset: { strategy: 'ping', rs_name: 'testSet' }}
db = mongoose.createConnection('mongodb://user:pass@localhost:port,anotherhost:port,yetanother:port/database', opts);

// și opțiuni
var opts = { server: { auto_reconnect: false }, user: 'username', pass: 'mypassword' }
db = mongoose.createConnection('localhost', 'database', port, opts)

// inițializează acum, fă conectarea mai târziu
db = mongoose.createConnection();
db.openUri('localhost', 'database', port, [opts]);
```







###Mongoose.prototype.model()

