# Model.findById()

Metoda este folosită pentru a găsi o unică înregistrare, căutarea făcându-se în baza unui șir de caractere care reprezintă id-ul acesteia în MongoDB. Această metodă este preferabilă lui `findOne({ _id: id })`.

Metoda folosește findOne() ca middleware cu o singură diferență față de acesta. În vreme ce `findOne(undefined)` și `findOne({_id: undefined})` sunt tratate ca `findOne({})`, fiind aduse înregistrări arbitrare, `findById(undefined)` va fi tradus ca `findOne({ _id: null })`.

Metoda returnează un obiect de tipul `Query`.

## Parametri

### id

Este o valoare care trebuie să reprezinte un `_id` pe care îl va folosi pentru a căuta în MongoDB. Valoarea pentru id este transformată într-un ObjectID conform schemei - casting.

### [projection]

Poate fi `Object` sau `String` pentru a menționa ce câmpuri să fie aduse din întreaga înregistrare. Vezi și *Query.prototype.select()*.

### [options]

Acesta este un `Object` în care sunt menționate opțiunile necesare interogării. Vezi și `Query.prototype.setOptions()`.

### [callback]

Este o funcție a cărui al doilea argument este chiar array-ul cu rezultatul în cazul în care căutarea are unul.

## Exemple

```javascript
// caută o înregistrare aventură după id și execută callback-ul
Aventura.findById(id, function (err, aventură) {});

// la fel ca mai sus
Aventura.findById(id).exec(callback);

// selectează doar câmpurile nume și distanță
Aventura.findById(id, 'nume distanță', function (err, aventură) {});

// la fel ca mai sus
Aventura.findById(id, 'nume distanță').exec(callback);

// include toate proprietățile dar fără `distanță`
Aventura.findById(id, '-distanță').exec(function (err, aventură) {});

// pasarea unor opțiuni ca obiect JavaScript
// passing options (in this case return the raw js objects, not mongoose documents by passing `lean`
Aventura.findById(id, 'nume', { lean: true }, function (err, doc) {});

// same as above
Aventura.findById(id, 'nume').lean().exec(function (err, doc) {});
```
