# Mongoose.prototype.set()

Această metodă poate fi folosită pentru a seta valori în obiectul `mongoose`.

```javascript
mongoose.set('test', value) // sets the 'test' option to `value`
mongoose.set('debug', true) // enable logging collection methods + arguments to the console
mongoose.set('debug', function(collectionName, methodName, arg1, arg2...) {}); // use custom function to log collection methods + arguments
```

Opțiunile acceptate de set sunt următoarele:

#### `'debug'`

Afișează în consolă toate operațiunile pe care `mongoose` le trimite către MongoDB.

#### `'bufferCommands'`

Această opțiune activează / dezactivează mecanismul de buffering pentru toate conexiunile și modelele.

#### `'useCreateIndex'`

Această valoare este `false` din oficiu. Pentru a-l forța pe MongoDB să creeze din start indexul folosind `createIndex()` în loc de `ensureIndex()`. Acest lucru îl vei face pentru a evita mesajele *deprecate*, care ar putea apărea de la driverul MongoDB.

#### `'useFindAndModify'`

Are valoarea `true` din oficiu. În cazul setării la `false`, va forța ca metodele `findOneAndUpdate()` și `findOneAndremove()` să folosească varianta originală `findOneAndUpdate()` în locul lui `findAndModify()`. Această opțiune poate fi pasată și în obiectul de configure a conexiunii, dacă este mai ușor așa.

#### `'useNewUrlParser'`

Are valoarea `false` din oficiu. Setarea la valoarea `true` se va face cu intenția ca toate conexiunile să folosească din oficiu această opțiune.

#### `cloneSchemas`

Din oficiu, valoarea este `false`, dar în cazul în care se dorește clonarea tuturor schemelor înainte de a fi compilate în modele, se va seta la `true`.

####`'applyPluginsToDiscriminators'`

Are valoarea `false` din oficiu.

#### `'objectIdGetter'`

Are valoarea `true` din start. Mongoose adaugă un getter pentru *MongoDB ObjectId*-uri numit `_id`, care returnează `this` (poate folosind populate). Pentru a nu folosi getterul, setează-l la `false`.

#### `'runValidators'`

Are valoarea `false` din start. Pentru a activa validatorii la momentul actualizării unor informații din baza de date ( [*update validators*](https://mongoosejs.com/docs/validation.html#update-validators)), setează la `true`.

#### `'toObject'`

Valoarea sa din oficiu este `{ transform: true, flattenDecimals: true }`.

#### `'toJSON'`

Valoarea sa din oficiu este `{ transform: true, flattenDecimals: true }`.

#### `'strict'`

Setează schemele la strict.

#### `'selectPopulatedPaths'`

Are valoarea inițială setată la `true`. În acest caz, Mongoose va adăuga toate câmpurile pe care faci `populate()` în `select()`. Opțiunea `selectPopulatedPaths` pe care o poți seta la nivel de schemă o suprascrie pe aceasta.
