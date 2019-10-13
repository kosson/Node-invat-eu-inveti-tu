# Query.prototype.populate()

Această metodă returnează un obiect de tip `Query`, care va fi și valoarea legăturii `this`.
Căile sunt populate cu date după ce este executat query-ul și este primit un răspuns. Dacă există mai multe căi care trebuie populate, se va executa câte un query pentru fiecare.
Pentru fiecare interogare, rezultatele vor fi pasate callback-ului.

## Parametrii

### path

Poate fi un `Object` sau un `String`. Reprezintă calea menționată literal care trebuie populată cu date sau un obiect de configurare cu toți parametrii.

```javascript
Carte.
  find().
  populate({
    path: 'fani',
    match: { vârstă: { $gte: 18 }},
    // Excluzi `_id` în mod explicit, vezi http://bit.ly/2aEfTdB
    select: 'nume -_id',
    options: { limit: 5 }
  }).
  exec();
```

### [select]

Poate fi un `Object` sau un `String`. Reprezintă calea din documentul care va popula un câmp atunci când se va face popularea.

### [model]

Este un obiect de tip `Model`. Reprezintă modelul pe care dorești să-l folosești pentru a face popularea. În cazul în care nu este specificat, `populate()` se va uita la valoarea câmpului `ref` din Schema.

### [match]

Este un `Object` care indică condițiile la care trebuie să se supună documentele care vor fi găsite.

### [options]

Este un `Object` care indică criterii de sortare a documentelor care s-au potrivit criteriilor de căutare.

#### [options.path=null]

Este un `String` care indică calea documentului care va primi rezultatele lui `populate()`.

#### [options.retainNullValues=false]

Din oficiu, Mongoose elimină înregistrările care au valoarea `null` sau `undefined` din array-urile în care s-a făcut popularea. Această opțiune se va seta la `true` atunci când se dorește includerea înregistrărilor cu valoarea `null` sau `undefined`.

#### [options.getters=false]

Este o valoare `Boolean` care în cazul `true`, va apela orice getteri au fost setați pe câmpul care trebuie să fie populat - `localField`. Din oficiu, Mongoose obține valoarea neprelucrată pentru `localField`. De exemplu, dacă vrei să folosețti niște [getteri așa cum sunt cei definiți în opțiunile tipului de schemă](https://mongoosejs.com/docs/schematypes.html#schematype-options), se va seta opțiune cu valoarea `true`.

#### [options.clone=false]

Când lansezi o comandă precum `Carte.find().populate('autor')`, toate cărțile care au același autor vor folosi aceeași înregistrare adusă de populate; același document `autor`. Pentru a beneficia de acest mecanism de copiere, se va seta opțiunea la `true`.

#### [options.match=null]

Valoarea lui `match` poate fi un `Obiect` sau un `Function`. Acesta este un filtru suplimentar care influiențează rezultatele aduse de interogarea populate. Poate fi un obiect de tip filtru ce conține [sintaxă MongoDB](https://docs.mongodb.com/manual/tutorial/query-documents/) sau o funcție care returnează un obiect de filtrare.

## Exemplu

```javascript
Kitten.findOne().populate('owner').exec(function (err, kitten) {
  console.log(kitten.owner.name) // Max
})

Kitten.find().populate({
  path: 'owner',
  select: 'name',
  match: { color: 'black' },
  options: { sort: { name: -1 } }
}).exec(function (err, kittens) {
  console.log(kittens[0].owner.name) // Zoopa
})

// alternatively
Kitten.find().populate('owner', 'name', null, {sort: { name: -1 }}).exec(function (err, kittens) {
  console.log(kittens[0].owner.name) // Zoopa
})
```
