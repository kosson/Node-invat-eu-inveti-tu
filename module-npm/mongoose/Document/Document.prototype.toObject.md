# Document.prototype.toObject()

Această metodă convertește documentul la un obiect Javascript apt pentru a fi trimis în MongoDB. Bufferele sunt convertite în instanțe `mongodb.Binary` pentru a fi pregătite să fie stocate și ele.

Metoda returnează un obiect Javascript.

## Parametri

Metoda primește un obiect cu opțiuni pe care să-l numim generic **options**.

Proprietățile obiectului cu opțiuni:

- **options.getters** este un `Boolean` cu valoarea `false` din oficiu. Dacă este setat la valoarea `true`, ca efect va fi aplicarea tuturor metodelor `get`, fiind incluse și proprietățile virtuale aici.
- **options.virtuals** este un `Boolean` cu valoarea `false` din oficiu. Dacă este setat la valoarea `true`, ca efect va fi aplicarea tuturor virtualelor, find incluse aici și alias-urile. Pentru a aplica doar getter-ii, folosește următoarea combinație: `{getters: true, virtuals: false}`.
- **options.aliases** este un `Boolean` cu valoarea `true` din oficiu. Dacă nu mai dorețti ca alias-urile să se aplice, setează la valoarea `false`. Setată la `false`, operațiunea este no-op.
- **options.minimize** este un `Boolean` cu valoarea `true` din oficiu. Această opțiune implică faptul că orice obiect care nu are date, va fi omis în cel care va fi constituit ca rezultat.
- **options.transform** are valoarea `null` din oficiu. Alternativa este ca acesta este să primească drept valoare o funcție care să-ți permită modificarea obiectului returnat.
- **options.depopulate** este un `Boolean` cu valoarea `false` din oficiu. Dacă este setat la `true`, înlocuiește orice căi care au fost populate în mod obișnuit cu id-ul original din input. Setarea nu are niciun efect asupra căilor populate virtual.
- **options.versionKey** este o valoare `Boolean`, care dacă este setată la `false`, va exclude din rezultat cheia `_v` care este dedicată versiunii.
- **options.flattenMaps** este o valoare `Boolean`, care dacă este setată la `true`, va converti Map-urile la POJO-uri. Acest lucru se dovedește util atunci când ai nevoie să aplici `JSON.stringify` pe rezultatul lui `toObject`.

## Getteri și virtuale

Un simplu exemplu de aplicarea a unui getter pe o cale a unui document:

```javascript
doc.toObject({ getters: true, virtuals: false })
```

Exemplu de aplicare doar a getterilor pe virtuale

```javascript
doc.toObject({ virtuals: true })
```

Exemplu de aplicare deopotrivă a unui getter pe o cale, cât și pe un virtual.

```javascript
doc.toObject({ getters: true })
```

Pentru a aplica aceste opțiuni tuturor documentelor din oficiu, setează opțiunea `toObject` cu același argument direct în schemă.

```javascript
schema.set('toObject', { virtuals: true })
```

## Transformări

Atunci când ai nevoie să modifici obiectul rezultat în baza unor anumite criterii, se va apela funcția `transform`.

Acestă funcție primește trei argumente:

- `doc` care este documentul Mongoose care va fi supus conversiei,
- `ret` care este o reprezentare a unui obiect simplu rezultat din conversie,
- `options` care menționează opțiunile folosite, fie acestea opțiuni la nivel de schemă sau cele pasate online.

```javascript
// asigură-te că ai la dispoziție opțiunea toObject
if (!schema.options.toObject) schema.options.toObject = {};
schema.options.toObject.transform = function (doc, ret, options) {
  // șterge proprietatea _id a fiecărui document î
  delete ret._id;
  return ret;
}

// rezultatul fără a aplica transformarea
doc.toObject(); // { _id: 'anId', name: 'Ionuț' }

// cu transformare
doc.toObject(); // { name: 'Ionuț' }
```

Folosindu-ne de transformări, se pot returna chiar rezultate cu totul noi.

```javascript
if (!schema.options.toObject) schema.options.toObject = {};
schema.options.toObject.transform = function (doc, ret, options) {
  return { movie: ret.name }
}

// rezultatul fără a aplica transformarea
doc.toObject(); // { _id: 'anId', name: 'Wreck-it Ralph' }

// cu transformare
doc.toObject(); // { movie: 'Wreck-it Ralph' }
```

Dacă funcția de transformare returnează `undefined`, valoarea va fi ignorată în rezultat.
Transformările pot fi făcute și inline, fiind ignorat orice set de transformări ar fi în opțiuni.

```javascript
function xform (doc, ret, options) {
  return { inline: ret.name, custom: true }
}

// pasează transformarea ca opțiune inline
doc.toObject({ transform: xform }); // { inline: 'Wreck-it Ralph', custom: true }
```

## Resurse

- [Document.prototype.toObject()](https://mongoosejs.com/docs/api.html#document_Document-toObject)
