# Caching cu Redis

Redis este un pachet software folosit pentru a realiza un cache în memorie. Este ca o mică bază de date care rulează direct în RAM. Pentru a interacționa cu acest server, va trebui să instalăm modulul `redis`.

Obiectele de interogare în mongoose sunt doar niște obiecte, care sunt executate doar când se apelează metoda `exec`.

```javascript
// With a JSON doc
var queryPers = Person.
  find({
    occupation: /host/,
    'name.last': 'Ghost',
    age: { $gt: 17, $lt: 66 },
    likes: { $in: ['vaporizing', 'talking'] }
  }).
  limit(10).
  sort({ occupation: -1 }).
  select({ name: 1, occupation: 1 });
// Înainte de a trimite interogarea, verifică în Redis
queryPers.exec(function (err, rezultat) {
    console.log(rezultat);
}); // trimite interogarea către MongoDB

// Using query builder
var queryPers = Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation');
// locul în care faci interogarea în Redis.
queryPers.exec(function (err, rezultat) {
    console.log(rezultat);
}); // trimite interogarea către MongoDB
```

## Funcția `exec()`

Această funcție trebuie să declanțeze trimiterea interogării către MongoDB. Dar expresia este perfect echivalentă cu un `then` al unei promisiuni.

```javascript
queryPers.exec(function (err, rezultat) {
    console.log(rezultat);
});
// fiind echivalent cu
queryPers.then(queryPers.exec(function (err, rezultat) {
    console.log(rezultat);
}); // .then va chema .exec în spate
// echivalent cu
var rezultat = await queryPers;
// în cazul în care dorești să ai acces la rezultat.
```

Pentru a face interceptările necesare, este sugerată rescrierea funcției exec.

```javascript
queryPers.exec(function (err, rezultat) {
    console.log(rezultat);
});
// rescrie

queryPers.exec = function () {
    // mai întâi verifici dacă query-ul a fost executat deja și dacă a returnat rezultatul din cache
    var rezultat = client.get('cheia de verificare din cache');
    if (rezultat) {
        return rezultat;
    }
    // altfel, execută normal query-ul la care faci și o referința
    var rezultat = executaVersiuneaOriginalaDeExec(); // la evaluare va trimite query-ul către Mongo.
    // pe care apoi îl salveazi în Redis.
    client.set('nume cheie', rezultat);
};
```

O variantă mai elaborată de patching sau hooking-in funcția `exec` pentru a realiza și mecanismul de caching.

```javascript
/* fișier dedicat de cache manager cache.js */
var mongoose = require('mongoose');
var redis    = require('redis');
var util     = require('util');
var redisUrl = 'redis://127.0.0.1:6379';
var client   = redis.createClient(redisUrl);    // creează clientul
client.get   = util.promisify(client.get);      // promisifică funcția

// fă o referință la funcția originală
var exec = mongoose.Query.prototype.exec;

// și acum să rescriem funcția pentru a permite caching-ul
mongoose.Query.prototype.exec = async function () {
    // FII FOARTE ATENT, CA APLICAND ACEST MODEL, TOATE QUERY-URILE VOR FI CACHED!!!
    // introduci zona de logică proprie

    console.log(this.getQuery()); // afisează obiectul (proiectia) de căutare către MongoDB
    console.log(this.mongooseCollection.name); // returnează numele colecției în care se face căutarea
    // combinarea informațiilor privind obiectul query împreună cu numele colecției, oferă o cheie solidă pentru Redis.
    const cheieCacheRedis = JSON.stringify(Object.asign({}, this.getQuery(), {collection: this.mongooseCollection.name}));
    // faci acest mixin pentru a proteja datele pe care proprietățile originale le obțin
    // și realizarea unui nu obiect care va fi folosit pentru a seta o cheie în cache.
    // în cazul lui this.getQuery, există pericolul de modificare chiar a obiectului de query, ceea ce ar avea repercusiuni asupra interogării.

    /* Pas1 - vezi dacă există cheieCacheRedis în cache deja */
    var cacheValue = await client.get(cheieCacheRedis);
    /* Pas2 - dacă avem cheia, returnează datele corespondente din cache */
    if (cacheValue) {
        // return JSON.parse(cacheValue); // nu va funcționa pentru că nu este un obiect document mongoose

        // în acest moment, trebuie să returnezi un model mongoose, nu un obiect JavaScript
        // const documentMongoose = new this.model(JSON.parse(cacheValue)); // this.model este o referință către modelul pe care îl reprezintă acest query.
        // return documentMongoose;

        // this.model poate aduce un array de documente, caz în care va trebui să tratăm această eventualitate
        // tratarea ambelor cazuri: soluția finală
        const documentM = JSON.parse(cacheValue);
        return Array.isArray(documentM) 
            ? documentM.map(doc => this.model(doc))
            : new this.model(documentM);        
    }
    /* Pas3 - Dacă nu există acea cheie, dă drumul la query către MongoDB și stochează rezultatele în Redis */

    // apoi execuți funcția originală returnând obiectul rezultat după ce se va fi făcut query-ul la MonoDB
    const rezultat = await exec.apply(this, arguments); // argumnents pasate ca funcții
    // se va executa query-ul pe MongoDB, iar ceea ce se întoarce va fi asignat lui rezultat
    // ceea ce este returnat din MongoDB este un document mongoose, o instanță a modelului.

    // înainte de a returna, este nevoie să introduci în Redis rezultatul interogării MongoDB
    client.set(cheieCacheRedis, JSON.stringify(rezultat));

    return rezultat; // astfel se răspunde așteptărilor lui mongoose (vezi documentatia)
};
```

Funcția `exec` returnează instanțe ale modelelor de mongoose - documente mongoose. Aceste nu sunt obiecte care pot fi exploatate direct. Servesc doar lui `mongoose`.

În modelul prezentat mai sus, toate cererile către MongoDB, la întoarcere vor fi cached, fără excepție. Totuși, în practică cel mai bine este să avem posibilitatea de a face cache doar pe anumite rute.

```javascript
// fișierul de rute.js

module.exports = app => {
    app.get('/api/resurse/:id', cereLogin, async (req, res) => {
        var resursa = await Resursă.findOne({
            _user: req.user.id, _id: req.params.id
        });
        res.send(resursa);
    });
    app.get('/api/resurse', cereLogin, async (req, res) => {
        var resurse = await Resursă.find({ _user: req.user.id}).cache(); // incdică clar preferința pentru caching!!!
        res.send(resurse);
    });
}

// fisierul controlerCache.js
var mongoose = require('mongoose');
var redis    = require('redis');
var util     = require('util');
var redisUrl = 'redis://127.0.0.1:6379';
var client   = redis.createClient(redisUrl);    // creează clientul
client.get   = util.promisify(client.get);      // promisifică funcția

// adăugăm în prototype o metodă nouă cache
mogoose.Query.prototype.cache = function deCaching () {
    // ideea este de a putea apela funcția cache în cazul în care dorin cachinul activat pe o rută imediat după execuția lui exec
    // faci un flag care să semnaleze
    this.foloseșteCache = true; // this este instanța de Query. Nu uita!
    return this; // pentru a face metoda chainable
};
mongoose.Query.prototype.exec = async function () {
    // dacă this.foloseșteCache este true, execută codul. Dacă false, execută funcția originală exec.
    if (!this.foloseșteCache) {
        return exec.apply(this, arguments);
    }
    // pentru restul cazurilor, logica creată mai sus
};
```

Funcția de caching trebuie creată în obiectul prototype al lui Query pentru ca aceasta să fie disponibilă întregului cod din controlerul de cache.

Valorile din cache trebuie să expire, fie automat fie împine de anumite cerințe în dinamica conținutului, cum ar fi actualizarea resurselor sau creșterea numărului acestora.

```javascript
// același cacheController.js de mai sus
//...
    // înainte de a returna, este nevoie să introduci în Redis rezultatul interogării MongoDB
    // mecanism de expirare a conținutului cache-ului
    client.set(cheieCacheRedis, JSON.stringify(rezultat), 'EX', 10);
```

## Crearea de chei specifice

Pentru că pentru a avea drept reper de cheie în Redis de cele mai multe ori sunt necesare mai multe date, pentru un obiect de interogare avem o metodă pe care mongoose o pune la dispoziție în scopul obținerii opțiunilor.

```javascript
queryPers.getOptions();
```

Documentația privind [getOptions](https://mongoosejs.com/docs/api.html#query_Query-getOptions) indică faptul că metoda returnează un obiect JavaScript cu toate opțiunile.

```javascript
var query = new Query();
query.limit(10);
query.setOptions({ maxTimeMS: 1000 })
query.getOptions(); // { limit: 10, maxTimeMS: 1000 }
```

Dacă se face din obiectul rezultat un șir de caractere prin serializare, acesta poate fi utilizat de Redis drept cheie unică pentru un set de înregistrări care vor fi aduse din MongoDB.

## Limitarea în timp a rezultatelor

Redis-ul prermite setarea unei perioade în care vor expira resursele din cache.

```javascript
client.set('ceva','valoarea', 'EX', 5); // 5 reprezinta numărul de secunde.
```