# Query.prototype.update()

Aceasta este o metodă pe care o poți folosi pentru a actualiza o înregistrare.
Toate căile pasate care nu sunt operațiuni atomice vor deveni operațiuni `$set`.

Metoda returnează obiectul `Query`.

Metoda declanșează executarea middleware-ului `update()`.

```javascript
Model.where({ _id: id }).update({ title: 'words' })

// devine
Model.where({ _id: id }).update({ $set: { title: 'words' }})
```

## Parametrii

- `[filtru]` «Object»
- `[doc]` «Object» comanda de actualizare
- `[opțiunile]` «Object»
- - `multipleCastError` «Boolean»; în mod curent mongoose returnează doar prima eroare apărută atunci când se face interogarea. Pentru a agrega toate erorile, activează această opțiune.
- - `strict` «Boolean | String» suprascrie opțiunea pentru [strict mode a schemei](https://mongoosejs.com/docs/guide.html#strict)
- - `upsert` cu valoarea din oficiu `false`. Setarea la valoare `true` comunică lui mongoose ca în cazul în care nu este găsit un document, acesta să fie inserat.
- - `writeConcern` cu valoarea din oficiu `null` - setează [write concern](https://docs.mongodb.com/manual/reference/write-concern/) pentru replica pe care se lucrează. Suprascrie [schema-level write concern](https://mongoosejs.com/docs/guide.html#writeConcern).
- - `timestamps` cu valoarea din oficiu `null`. Dacă se setează la `false` și sunt active [schema-level timestamps](https://mongoosejs.com/docs/guide.html#timestamps) sari peste timestamp-urile pentru acest update. Nu se întâmplă nimic sacă nu sunt setate la nivel de schemă.
- `callback` «Function»

Pasarea unui obiect gol `{}` nu are ca efect nicio operațiune. Update-ul este ignorat și este executată funcția callback.

Operațiunea este efectuată doar dacă este pasat un callback. Dacă nu este pasat, poți executa folosind metoda `exec()`.

```javascript
const q = Model.where({ _id: id });
q.update({ $set: { name: 'bob' }}).update(); // not executed

q.update({ $set: { name: 'bob' }}).exec(); // executed

// keys that are not [atomic](https://docs.mongodb.com/manual/tutorial/model-data-for-atomic-operations/#pattern) ops become `$set`.
// this executes the same command as the previous example.
q.update({ name: 'bob' }).exec();

// multi updates
Model.where()
     .update({ name: /^match/ }, { $set: { arr: [] }}, { multi: true }, callback)

// more multi updates
Model.where()
     .setOptions({ multi: true })
     .update({ $set: { arr: [] }}, callback)

// single update by default
Model.where({ email: 'address@example.com' })
     .update({ $inc: { counter: 1 }}, callback)
```

Sumar API

```javascript
update(filter, doc, options, cb) // executes
update(filter, doc, options)
update(filter, doc, cb) // executes
update(filter, doc)
update(doc, cb) // executes
update(doc)
update(cb) // executes
update(true) // executes
update()
```
