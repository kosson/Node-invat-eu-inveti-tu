# Subdocumente

Subdocumentele sunt documente care sunt introduse în alte documente. Acest lucru în mongoose este echivalent cu introducerea unei scheme în alta. Subdocumentele nu sunt cu nimic mai prejos decât documentele la care vor fi atașate. Și acestea vor putea avea middleware, vor putea beneficia de validare, ș.a.m.d.

Diferența dintre documente și subdocumente este aceea că subdocumentele nu vor fi salvate în bază individual pentru că sunt legate de documentul principal. Doar dacă documentul principal va fi salvat, și subdocumentele vor fi la rândul lor salvate.

Există două tipuri de subdocumente:

- array-uri de subdocumente și
- documente unice ca parte a documentului părinte.

Mai întâi instanțiezi schema sau schemele copiilor, apoi instanțiezi schema mare. În modelarea unei posibile aplicații de gestiune a conținuturilor, pentru fiecare articol introdus lăsăm posibilitatea să fie adăugate comentarii.

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

Începând cu Mongoose 4.2.0 dacă ai un singur subdocument, acesta poate fi atașat la cel mare prin menționarea directă.

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

## Introducerea unui nou subdocument

În momentul în care ai deja un document, care poate accepta subdocumente, poți introduce subdocumentele.

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
