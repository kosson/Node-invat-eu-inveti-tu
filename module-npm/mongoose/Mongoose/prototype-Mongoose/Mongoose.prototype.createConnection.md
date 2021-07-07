# Mongoose.prototype.createConnection()

## Parametri

Această metodă acceptă doi parametri.

### `uri`

Este un șir de caractere care indică adresa la care se face conectarea pe MongoDB. Pentru a se conecta la o bază de date MongoDB, mongoose folosește [driverul](http://mongodb.github.io/node-mongodb-native/) pentru Node.js pus la dispoziție de creatorii Mongo.

### `obiect`

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
