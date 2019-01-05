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
