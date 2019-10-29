# Căutarea documentelor

Metoda primară pentru a salva un document este `Model.find()`.

## Transformarea Query-urilor

Primul parametru al metodelor `Model.find()`, `Query.find()` și `Model.findOne()` este un obiect numit generic `filter`.

```javascript
const interogare = Personaj.find({ nume: 'Jean-Luc Picard' });
interogare.getFilter(); // `{ nume: 'Jean-Luc Picard' }`

// Dacă există apeluri înlănțuite, proprietățile vor fi fuzionate în filtru
query.find({ vârstă: { $gt: 50 } }); // vârsta mai mare de 50
query.getFilter(); // `{ nume: 'Jean-Luc Picard', vârstă: { $gt: 50 } }
```

Atunci când se execută query-ul folosind `Query.exec()` sau `Query.then()`, Mongoose operează ceea ce se numește *cast* (transformarea) al valorilor în tipurile corespondente stabilite prin schemă. Transformarea valorilor se face în momentul în care se trimite comanda de interogare.

```javascript
// Chiar dacă valorile de la _id și de la vârstă sunt de tip String,
// acestea vor fi transformate, prima în ObjectId, iar a doua în număr
const query = Character.findOne({
  _id: '5cdc267dd56b5662b7b7cc0c',
  vârstă: { $gt: '50' }
});
// în acest moment nu s-a făcut nicio transformare, un getFilter()
// va returna același obiect neschimbat
const document = query.exec(); // în acest moment avem un document.
// Abia acum s-a făcut castingul.
query.getFilter()._id instanceof mongoose.Types.ObjectId; // true
typeof query.getFilter().vârstă.$gt === 'number'; // true
```

În cazul în care Mongose nu reușește să facă castingul, va fi emisă o eroare `CastError`.
