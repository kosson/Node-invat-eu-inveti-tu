# Subdocumente

Subdocumentele sunt documente care sunt introduse în alte documente. Acest lucru în Mongoose este echivalent cu introducerea unei scheme în alta - *nested schema*. Subdocumentele nu sunt cu nimic mai prejos decât documentele la care vor fi atașate. Și acestea vor putea avea middleware, vor putea beneficia de validare, ș.a.m.d.

Avantajele sub-documentelor:

- reutilizarea codului în sensul creării schemelor și re-utilizarea acestora în diferite combinații;
- sub-schemele care sunt incluse în alte scheme beneficiază și ele de mecanismele de validare, middleware, virtuals, tot ce o schemă normală permite;
- sub-schemele sunt de fapt scheme și acest lucru înseamnă că vor avea `_id` cu singura condiție să nu fie setat la `false` crearea sa.

Diferența dintre documente și subdocumente este aceea că subdocumentele nu vor fi salvate în bază individual pentru că sunt legate de documentul principal. Doar dacă documentul principal va fi salvat, și subdocumentele vor fi la rândul lor salvate.

Subdocumentele au la rândul lor în dotare middleware-urile `save` și `validate`. Apelarea lui `save()` pe documentul părinte, va declanșa aplicarea lui `save()` pe toate subdocumentele. Același lucru se va petrece și în cazul aplicării middleware-ului `validate()`.

```javascript
childSchema.pre('save', function (next) {
  if ('invalid' == this.name) {
    return next(new Error('Nu este un user valid'));
  }
  next();
});

const parent = new Parent({
  children: [{name: 'invalid'}]
});

parent.save(function (err) {
  console.log(err.message) // Nu este un user valid
});
```

Middleware-ul `pre('save')` și `pre('validate')` se execută înainte de `pre('save')` la nivelul părintelui și abia după ce s-a rulat `pre('validate')` pe acesta. Această ordine este dictată de faptul că middleware-ul de validare rulează automat înaintea celui de `save()`.

## Diferența dintre sub-documente și căi în adâncime

Mongoose face o diferență între căile în adâncime (*nested paths*) și sub-documentele. În exemplul de mai jos, avem această diferență evidențiată.

```javascript
// Subdocument
const subdocumentSchema = new mongoose.Schema({
  child: new mongoose.Schema({ name: String, age: Number })
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

// Nested path
const nestedSchema = new mongoose.Schema({
  child: { name: String, age: Number }
});
const Nested = mongoose.model('Nested', nestedSchema);
```

Cele două abordări par similare. Documentele care vor fi introduse în MongoDB vor avea aceeași structură. Există diferențe specifice. Folosind exemplul de mai sus, putem explora aceste diferențe.

```javascript
const doc1 = new Subdoc({});
doc1.child === undefined; // true
doc1.child.name = 'test'; // Afișează un TypeError: cannot read property...

const doc2 = new Nested({});
doc2.child === undefined; // false
console.log(doc2.child); // Afișează 'MongooseDocument { undefined }'
doc2.child.name = 'test'; // Funcționează!!!
```

În cazul subdocumentelor, proprietatea `.child` a documentului, va avea valoarea `undefined`. În cazul documentelor *nested* proprietatea `.child` va indica un *MongooseDocument*. Aici devine interesat pentru că indiferent dacă documentul *nested* are sau nu proprietăți, le poți introduce folosind chiar obiectul `child` drept referință.

Odată cu versiunea 5 a lui Mongoose avem următorul comportament al metodei `set()` aplicată documentului:

- în cazul documentelor *nested*, modificările fuzionează cu datele existente,
- iar în cazul sub-documentelor, pur și simplu înlocuiește datele.

```javascript
const doc1 = new Subdoc({ child: { name: 'Luke', age: 19 } });
doc1.set({ child: { age: 21 } });
doc1.child; // { age: 21 }

const doc2 = new Nested({ child: { name: 'Luke', age: 19 } });
doc2.set({ child: { age: 21 } });
doc2.child; // { name: Luke, age: 21 }
```

## Setări din oficiu ale sub-documentelor

Căile unui sub-document sunt setate din start la valoarea `undefined`. Acest lucru înseamnă că Mongoose nu va proceda la completarea valorilor precizate la proprietățile `default`, până când calea sub-documentului este completată cu date.

```javascript
const subdocumentSchema = new mongoose.Schema({
  child: new mongoose.Schema({
    name: String,
    age: {
      type: Number,
      default: 0
    }
  })
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

// Observă faptul că valoarea lui `age` trecută ca default nu conduce la completarea datelor documentului
// pentru că `child` are valoarea `undefined`.
const doc = new Subdoc();
doc.child; // undefined
```

În momentul în care setezi `child` cu un obiect, Mongoose va aplica valorile default.

```javascript
doc.child = {};
// Mongoose aplică valoarea default pentru `age`
doc.child.age; // 0
```

Mongoose aplică valorile default într-o manieră recursivă, ceea ce înseamnă că poți aplica un mic tertip pentru a completa valorile default. Acesta constă din setarea căii sub-documentului la un obiect gol.

```javascript
const childSchema = new mongoose.Schema({
  name: String,
  age: {
    type: Number,
    default: 0
  }
});
const subdocumentSchema = new mongoose.Schema({
  child: {
    type: childSchema,
    default: () => ({})
  }
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

// Note that Mongoose sets `age` to its default value 0, because
// `child` defaults to an empty object and Mongoose applies
// defaults to that empty object.
const doc = new Subdoc();
doc.child; // { age: 0 }
```

## Tipuri de sub-documente

Există două tipuri de sub-documente:

- array-uri de subdocumente și
- documente unice ca parte a documentului părinte.

```javascript
const copilSchema = new Schema({nume: String});

const părinteSchema = new Schema({
  // Subdocument unic
  copil: copilSchema,
  // Array de subdocumente
  copii: [ copilSchema ]
});
```

Mai întâi instanțiezi schema sau schemele copiilor, apoi instanțiezi schema mare.

## Id-urile sub-documentelor

Fiecare sub-document are un `_id` din oficiu. Array-urile de document din Mongoose au o metodă specială numită `id` cu ajutorul căreia poți face o căutare a unui document dintr-un array al acestora (*MongooseArray*) constituit pentru fiecare document părinte pentru a găsi unul după id-ul oferit drept argument.

```javascript
const doc = parent.children.id(_id);
```

Trebuie precizat faptul că subdocumentele vor avea `_id` propriu. Dacă nu dorești acest lucru, poți să precizezi explicit.

```javascript
const EntitateCopilSchema = mongoose.Schema({
  superputere: String
}, {_id : false});
const EntitatePărinteSchema = mongoose.Schema({
  nume: String,
  superputeri: [EntitateCopilSchema]
});
```

O altă metodă de a preciza explicit că nu dorești atribuirea de `_id` unui subdocument este să precizezi explicit în sub-schemă.

```javascript
const EntitatePărinteSchema = mongoose.Schema({
  nume: String,
  superputeri: [{
    _id: false,
    superputere: {type: String}
  }]
});
```

## Adăugarea de sub-documente în array-uri

Metode ale `MongooseArray` așa cum sunt `push()`, `unshift()`, `addToSet`


## Exemplu exploratoriu

Să explorăm un exemplu. În modelarea unei posibile aplicații de gestiune a conținuturilor, pentru fiecare articol introdus lăsăm posibilitatea să fie adăugate comentarii.

```javascript
var mongoose = require('mongoose'),
    mongoose.connect('mongodb://localhost/test'),
    db = mongoose.connection,
    Schema = mongoose.Schema;

// mai întâi instanțiem un obiect schemă
// pentru comentarii, pentru SUBDOCUMENT
var schemaComentarii = new Schema({
  comentariu: String
});
// apoi instanțiem un obiect schemă
// pentru documentul principal
var schemaArticol = new Schema({
  titlu: String,
  text: String,
  comentarii: [schemaComentarii]
});

// este generat un obiect model
var Articol = mongoose.model('Articol', schemaArticol);

var articolNou = new schemaArticol({
  titlu: "Primul blog post",
  text: "Acesta este un text de test.",
  comentarii: [{comentariu: "Articol bun!"}, {comentariu: "Îmi place!"}]
});
// dacă dorești poți modifica un comentariu
articolNou.comentarii[0].comentariu = 'Fain!';
// după ce am terminat și cu posibile modificări, vom salva
articolNou.save(function () {
  // fă ceva în momentul în care faci salvarea
});
```

Începând cu Mongoose 4.2.0 dacă ai un singur sub-document, acesta poate fi atașat la cel mare prin menționarea directă.

```javascript
var ancilare = new Schema({
  detalii: String,
  miscelanee: String
});
var articol = new Schema({
  nume: String,
  adresa: String,
  diverse: ancilare
});
```

## La ce sunt utile subdocumentele



## Introducerea unui nou subdocument

În momentul în care ai deja un document, care poate accepta sub-documente, poți introduce sub-documentele.

```javascript
// resursa-red.js

const mongoose = require('mongoose');

var softwareSchema = new mongoose.Schema({
    nume: String,
    versiune: String,
    homepage: String,
    logoUri: String
});

var Resursa = new mongoose.Schema({
    language: {
        context: ['http://purl.org/dc/elements/1.1/language', 'https://schema.org/Language'],
        value: String,
        i18n: {
            value: [],
            label: []
        }
    }
});

// test_subdocumente.js
const resursa = new Resursa({
            title: {value: 'Teorema lui Pitagora'},
            description: {value: 'Este o resursă pentru Matematică.'}
        });

        // INTRODUCEREA UNUI NOU SUBDOCUMENT
        resursa.save()
                .then(() => Resursa.findOne({'title.value': 'Teorema lui Pitagora'}))
                .then((res) => {
                    res.dependinte.push({
                        nume:     'GeoGebra',
                        versiune: '6',
                        homepage: 'https://www.geogebra.org',
                        logoUri:  'https://www.geogebra.org/user/5743822/l7VDZjRWVSdno5Nf/avatar.png'
                    });
                    return res.save();
                })
                .then(() => Resursa.findOne({'title.value': 'Teorema lui Pitagora'}))
                .then((doc) => {
                    assert(doc.dependinte[0].nume == 'GeoGebra');
                    done();
                });
```

## Eliminarea unui subdocument - `remove()`

Atunci când este nevoie să elimini unul din subdocumente, Mongoose pune la dispoziție metoda `remove()`, care este mult mai concisă decât dacă am porni să facem slice() sau pop() folosind tehnicile clasice.

```javascript
it('stergerea unui subdocument', (done) => {
        const resursa = new Resursa({
            title: {value: 'Teorema lui Pitagora'},
            description: {value: 'Este o resursă pentru Matematică.'},
            dependinte: [
                {
                    nume:     'GeoGebra',
                    versiune: '6',
                    homepage: 'https://www.geogebra.org',
                    logoUri:  'https://www.geogebra.org/user/5743822/l7VDZjRWVSdno5Nf/avatar.png'
                }
            ]
        });
        resursa.save()
                .then(() => Resursa.findOne({'title.value': 'Teorema lui Pitagora'}))
                .then((res) => {
                    res.dependinte[0].remove();
                    return res.save();
                })
                .then(() => Resursa.findOne({'title.value': 'Teorema lui Pitagora'}))
                .then((res) => {
                    assert(res.dependinte.length === 0);
                    done();
                });
    });
```
