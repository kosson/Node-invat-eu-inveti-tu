# Schema()

Acesta este constructorul pentru clasa `Schema`. Obiectele schemă se instanțiază cu `new`. Constuctorul moștenește clasa [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) din NodeJS.

## Parametri

Constructorul poate primi drept prim parametru un `Object`, care descrie *căile* schemei, o altă schemă care este copiată sau chiar un alt obiect schemă deja instanțiat sau un `Array` de scheme sau obiecte.

## Exemplu

```javascript
var schemăCopil = new Schema({ name: String });
var schema = new Schema({ nume: String, vârstă: Number, schemeCopii: [schemăCopil] });
var Arbore = mongoose.model('Arbore', schema);

// setarea opțiunilor unei scheme
new Schema({ nume: String }, { _id: false, autoIndex: false })
```

## Opțiunile

### [autoIndex](https://mongoosejs.com/docs/guide.html#autoIndex)

Poate avea o valoare `Boolean`. Valoarea din oficiu este `null`.

## [autoCreate](https://mongoosejs.com/docs/guide.html#autoCreate)

Poate avea o valoare `Boolean`. Valoarea din oficiu este `null`.

## [bufferCommands](https://mongoosejs.com/docs/guide.html#bufferCommands)

## [capped](https://mongoosejs.com/docs/guide.html#capped)

## [collection](https://mongoosejs.com/docs/guide.html#collection)

## [id](https://mongoosejs.com/docs/guide.html#id)

## [_id](https://mongoosejs.com/docs/guide.html#_id)

## [minimize](https://mongoosejs.com/docs/guide.html#minimize)

## [read](https://mongoosejs.com/docs/guide.html#read)

## [writeConcern](https://mongoosejs.com/docs/guide.html#writeConcern)

## [shardKey](https://mongoosejs.com/docs/guide.html#shardKey)

## [strict](https://mongoosejs.com/docs/guide.html#strict)

## [strictQuery](https://mongoosejs.com/docs/guide.html#strictQuery)

## [toJSON](https://mongoosejs.com/docs/guide.html#toJSON)

## [toObject](https://mongoosejs.com/docs/guide.html#toObject)

Documentele pun la dispoziție această metodă pentru a converti documentele Mongoose în simple obiecte Javascript. Metoda acceptă câteva opțiuni. În loc de a aplica aceste opțiuni la nivel de document, se pot declara la nivel de schemă.

Există un truc pentru a putea modifica valorile care vor fi disponibile într-un document după ce a fost generat prin hidratarea cu date a unui model. Această operațiune implică aplicarea metodei `get()` cu un callback ce va face transformarea datelor pe calea unei scheme obținută în prealabil prin aplicarea metodei `path()`. Apoi se activează toți getterii pentru `toObject`.

```javascript
// creează schema
var schemă = new Schema({nume: String});

// aplică un getter pe calea pe care vrei să o transformi
schemă.path('nume').get(function (nume_plus_ceva) {
  return nume_plus_ceva + ', salut!'; // returnează rezultatul modificării datelor
});

// instanțiază un model
var Utilizator = mongoose.model('Utilizator', schemă);

// hidratează cu date
var utilizator = new Utilizator({nume: "Andreea"});

// rezultat utilizator.nume
console.log(utilizator.nume); // Andreea, salut!
```

## [typeKey](https://mongoosejs.com/docs/guide.html#typeKey)

## [typePojoToMixed](https://mongoosejs.com/docs/schematypes.html)

## [useNestedStrict](https://mongoosejs.com/docs/guide.html#useNestedStrict)

## [validateBeforeSave](https://mongoosejs.com/docs/guide.html#validateBeforeSave)

## [versionKey](https://mongoosejs.com/docs/guide.html#versionKey)

## [collation](https://mongoosejs.com/docs/guide.html#collation)

## [selectPopulatedPaths](https://mongoosejs.com/docs/guide.html#selectPopulatedPaths)

## [skipVersioning](https://mongoosejs.com/docs/guide.html#skipVersioning)

## [timestamps](https://mongoosejs.com/docs/guide.html#timestamps)

## [storeSubdocValidationError](https://mongoosejs.com/docs/guide.html#storeSubdocValidationError)
