# Query.prototype.findOneAndReplace

Metoda aplică o comandă `findOneAndReplace` în MongoDB.

```javascript
A.where().findOneAndReplace(filter, replacement, options, callback); // executes
A.where().findOneAndReplace(filter, replacement, options); // return Query
A.where().findOneAndReplace(filter, replacement, callback); // executes
A.where().findOneAndReplace(filter); // returns Query
A.where().findOneAndReplace(callback); // executes
A.where().findOneAndReplace(); // returns Query
```

Metoda găsește documentul, îl șterge și apoi pasează documentul găsit callback-ului. În cazul în care este găsit callback-ul, această metodă se execută. Callback-ul trebuie să aibă următoarea semnătură:

```javascript
function(error, doc) {
  // error: any errors that occurred
  // doc: este documentul înainte ca actualizările să-i fie aplicate if `new: false`, or after updates if `new = true`
}
```

## Parametrii

- filtrul, care este un `Object`;
- înlocuitor - `Object`;
- opțiuni, un obiect.

Obiectul opțiunilor poate avea următoarele proprietăți:
- `rawResult` «Boolean» - dacă este `true`, va returna rezultatul brut așa cum îl aduce driverul de MongoDB.
- `session` cu valoarea din oficiu `null`. Este chiar obiectul de sesiune lucru a clientului.
- `strict` «Boolean | String» suprascrie opțiunea de strict mode a schemei.
- `new` cu valoarea din oficiu `false`. Din oficiu ceea ce returnează `findOneAndUpdate()` este documentul așa cum era acesta înainte să se facă actualizarea. Dacă setezi `new` la valoarea `true`, documentul care va fi returnat de metodă este cel care a fost deja modificat.
- `lean` este un obiect, care dacă este truthy, metoda va returna ca obiect JavaScript simplu, nu un document mongoose. Vezi și `Query.lean` - https://mongoosejs.com/docs/tutorials/lean.html
- `session` «ClientSession» cu valoarea din oficiu `null`. Este sesiunea asociată acestui query.
- `timestamps` cu valoarea din oficiu `null`. Dacă este setat la `false` iar timestamp-urile sunt activate la nivel de schemă, se va sări peste timestamp-urile pentru update-ul curent. Nu are niciun efect dacă timestamp-urile de la nivelul schemei nu sunt setate.
- `returnOriginal` cu valoarea din oficiu `null`. Este un alias pentru opțiunea `new` - `returnOriginal: false` este echivalent cu `new: true`.

Metoda declanșează middleware-ul `findOneAndReplace()`.

Opțiuni disponibile:
- `sort`: în cazul în care sunt găsite mai multe documente, setează ordinea de sortare pentru a alege care document să-l actualizeze;
- `maxTimeMS`: impune o limită de timp pentru interogare;
- `rawResult`: dacă este setat la `true`, vei obține rezultatul brut așa cum îl oferă driverul Mongo.
