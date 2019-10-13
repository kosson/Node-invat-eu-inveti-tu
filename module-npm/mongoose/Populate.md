# Populate

Pentru a înțelege `populate()` trebuie să înțelegem că este răspunsul Mongoose la operatorul de agregare al MongoDB [$lookup](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/). Documentația MongoDB aduce câteva lămuriri necesare pentru a înțelege modul de operare a lui `populate()`.

> Face un **left outer join** pe o colecție `unsharded`, care este în *aceeași* bază de date pentru a căuta în documentele din colecția constituită (*joined*), care va fi supusă procesării. Pentru fiecare document care intră în faza de `$lookup` se adaugă un nou câmp de array al cărui elemente sunt documentele care s-au potrivit criteriilor aflate în colecția *joined*. Faza `$lookup` pasează aceste documente remodelate către etapa următoare (lookup | docs.mongodb.com)[https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/].

Definiția lui `populate()` din documentația originală:

> Populate este procesul prin care se înlocuiesc automat căile specificate în document cu documentele aflate în alte colecții.

Este posibilă popularea unui singur document, a mai multor documente, a unor simple obiecte, a mai multor obiecte simple sau a tuturor obiectelor care au fost returnate ca urmare a unei interogări.

Documentele returnate atunci când se face popularea, pot fi `remove`able, `save`able, cu singura mențiune că nu trebuie să fie specificată opțiune `lean`. Documentele returnate nu trebuie confundate niciun moment cu sub-documentele. Pentru că atunci când se face o operațiune de ștergere, aceasta se va răsfrânge direct asupra bazei de date, fii foate atentă cu `remove` în scenariul `populate`. Pentru mai multe detalii privind metoda în sine, citește și documentația de la `Query.prototype.populate()`.

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const persoanăSchema = Schema({
  _id: Schema.Types.ObjectId,
  nume: String,
  vârstă: Number,
  cărți: [{
    type: Schema.Types.ObjectId,
    ref: 'Carte'
  }]
});

const carteSchema = Schema({
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'Persoană'
  },
  titlu: String,
  fani: [{
    type: Schema.Types.ObjectId,
    ref: 'Persoană'
  }]
});

const Carte = mongoose.model('Carte', carteSchema);
const Persoană = mongoose.model('Persoană', persoanăSchema);
```

În exemplul dat, o persoană poate scrie mai multe povești. Opțiunea `ref` îi spune lui Mongoose, care este colecția din care vor proveni documentele la momentul populării. În cazul nostru este schema `persoanăSchema`.

![](img/PopulateCardinalitati.png)

Id-urile care vor fi culese, trebuie să fie id-uri de documente (`_id`) din modelul de `Carte`.

Atenție, `ref`-urile pot primi următoarele valori: `ObjectId`-uri, `Number`, `String` sau `Buffer`.

## Salvarea referințelor către celelalte documente

Atunci când este nevoie, poți salva `ref`-uri către alte documente. Pur și simplu trebuie să atribui valoarea `_id`-ul.

```javascript
const autor = new Persoană({
  _id:    new mongoose.Types.ObjectId(),
  nume:   'Ian Fleming',
  vârstă: 50
});

autor.save(function (err) {
  if (err) throw err;
  // salvează autorul cu o primă operă a sa:
  const carte1 = new Carte({
    titlu: 'Casino Royale',
    autor: autor._id    // atribuie _id din modelul Persoană
  });

  carte1.save(function (err) {
    if (err) throw err;
    // am salvat cartea si apoi autorul
  });
});
```

Ceea ce am realizat este salvarea unui autor cu o primă operă/carte a sa dintr-o-o singură mișcare.

## Popularea unui singur câmp cu date

Scenariul este următorul: ai nevoie să afișezi datele unei cărți. O carte poate fi scrisă de o singură persoană sau de mai multe. Pentru că anterior am introdus un singur autor cu o singură operă.

Să inițiem popularea câmpului `autor` cu datele ce reprezintă cărțile sale. Pentru că anterior am introdus doar una, datele acesteia vor popula câmpul `autor` al înregistrării de tip carte pentru un titlu ales.

```javascript
Carte.
  findOne({ titlu: 'Casino Royale' }).
  populate('autor').
  exec(function (err, carte) {
    if (err) throw err;
    console.log('Autorul este %s', carte.autor.nume);
    // afișează "Autorul este Ian Fleming"
  });
```

În baza de date, în câmpul `autor` avem un array de id-uri ale autorilor care au scris opera. În momentul în care facem interogarea, în cazul nostru o carte, acele id-uri ale autorilor vor fi înlocuite cu documentele ce reprezintă fiecare dintre autori.

În exemplul de mai sus a fost folosită metoda `exec()` pentru a afișa punctual datele.

## Popularea a mai multor câmpuri deodată

Pentru a popula mai multe câmpuri deodată, se va apela metoda `populate` pentru fiecare din câmpuri.

```javascript
Carte.
  findOne({ titlu: 'Casino Royale' }).
  populate('autor').
  populate('fani').
  exec(function (err, carte) {
    if (err) throw err;
    console.log('Fanii sunt %s', carte.fani.nume);
    // afișează toate înregistrările de persoane pentru care câmpul fani are id-uri.
  });
```

În cazul în care, din eroare, faci o populare de mai multe ori pe aceeași cale, doar ultima va fi luată în considerare.

```javascript
Carte.
  findOne({ titlu: 'Casino Royale' }).
  populate({path: 'fani', select: 'nume').
  populate({path: 'fani', select: 'vârstă').
  exec(function (err, carte) {
    if (err) throw err;
    console.log('Fanii sunt %s', carte.fani.nume);
    // afișează toate întregistrările de persoane pentru care câmpul fani are id-uri.
  });
  // Fiind echivalent cu:
  Carte.find().populate({ path: 'fani', select: 'vârstă' });
```

## Setarea explicită a câmpurilor pentru populare

O proprietate poate fi populată manual prin setarea sa unui document. Documentul trebuie să fie o instanță a modelului la care proprietatea `ref` se referă.

```javascript
Carte.findOne({ titlu: 'Casino Royale' }, function(error, carte) {
  if (error) {
    console.log(error);
  }
  carte.autor = autor;
  console.log(carte.autor.nume); // afișează "Ian Fleming"
});
```

## Setarea explicită a câmpului populat

În cazul în care un anumit scenariu o cere, se poate atribui explicit valoarea câmpului ce va fi populat.

```javascript
Carte.findOne({titlui: "Casino Royale"}, function (err, carte) {
  if (err) throw err;
  carte.autor = autor; // atribuirea într-o manieră explicită a valorii
  console.log(carte.autor.nume); // afișează "Ian Fleming"
});
```

## Documentul corespondent nu există

În cazul în care nu avem un document corespondent din care proprietatea `ref` să poată aduce date, rezultatul `ref` va fi `null`. Este același comportament ca al unui LEFT OUTER JOIN.

```javascript
await Persoană.deleteMany({ nume: 'Ian Fleming' });

const poveste = await Carte.findOne({ titlu: 'Casino Royale' }).populate('autor');
carte.autor; // `null`
```

În cazul în care în `carteSchema` ai avut un array de autori, `populate`, va returna un array gol.

## Selectarea câtorva câmpuri, nu a întregii întregistrări

În cazul în care dorești să aduci doar câteva câmpuri din întreaga întregistrare care va popula câmpul, acestea pot fi menționate ca argumente metodei `populate()`.

```javascript
Carte.
  findOne({ titlu: /casino royale/i }).
  populate('autor', 'nume'). // doar valoarea câmpului nume va fi adusă
  exec(function (err, carte) {
    if (err) throw err;

    console.log('Autorul este %s', carte.autor.nume);
    // afișează "Autorul este Ian Fleming"

    console.log('Vârsta autorului este %s', carte.autor.vârstă);
    // afișează "Vârsta autorului este null'
  });
```

## Popularea mai multor căi deodată

În cazul în care dorești popularea mai multor căi, acest lucru este posibil:

```javascript
Carte.
  find({ titlu: 'Casino Royale' }).
  populate('fans').
  populate('author').
  exec();
```

## Popularea cu anumite condiții - `match`

Uneori dorești să faci o alegere a unor date cu care se va face popularea în funcție de anumite criterii. În exemplul de mai jos, vom aduce toate cărțile ale căror fani au vârsta peste 21 de ani.

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

### Eliminarea înregistrărilor folosind `virtual()` și `match()`

Să presupunem că o anumită resursă are mai multe comentarii. Unele dintre acestea sunt șterse de administrator. Pentru a filtra documentele comentariu care au setat un boolean ce indică ștergerea, ne putem ajuta de un posibil model, care folosește o zonă de documente găsite ca tampon de date implicând `virtual()`.

```javascript
// Creează schema resursei
const resursaSchema = new mongoose.Schema({
  titlu:   String,
  autorId: Number
});
// creează virtualul
resursaSchema.virtual('comentarii', {
  ref:        'Comentariis',
  localField: '_id',
  foreignField: 'resursaId',
  // În momentul în care populezi comentariile, exclude-le pe cele care au fost șterse`; sters este setat la `true`
  options: { match: { sters: { $ne: true } } }
});

const comentariuSchema = new mongoose.Schema({
  _id:       Number,
  resursaId: mongoose.ObjectId,
  authrId:   Number,
  sters:     Boolean
});
```

În materialul dedicat metodei `match()` este detaliat modul în care poți combina `populate` cu `match` pentru a aduce rezultate.

```javascript
const authorId = 1
post = await BlogPost.find().populate({
  path: 'comments',
  match: doc => (doc.authorId === authorId ? {} : { deleted: { $ne: true } })
}); // după Valeri Karpov - vezi Aggregate.prototype.match
```

## Cum facem legăturile între colecții

Există posibilitatea ca atunci când folosim obiectul `autor`, să descoperim că nu se populează lista cărților. Acest lucru este pentru că încă nu au fost introduse obiecte `carte` în `autor.carti`.

Aici există două abordări:

- lași `autor`-ul să-și cunoască cărțile. De regulă schema ar trebui să rezolve relații de tipul one-to-many prin existența unui pointer către părinte în zona de many (în cazul nostru o înregistrare carte să aibă id-ul autorului).
- dacă există un motiv întemeiat să constitui un array de pointeri către documentele copil (carti), poți face `push()` documentelor în array precum în următorul exemplu:

```javascript
// mai întâi constitui schema autor
autor.carti.push(cartea1);
autor.save(callback);
```

Acest mod permite combinarea căutări cu popularea.

```javascript
Persoana.
  findOne({ nume: 'Ian Fleming' }).
  populate('carti'). // merge doar dacă am făcut push la ref-uri către copil
  exec(function (err, persoana) {
    if (err) return handleError(err);
    console.log(persoana);
  });
```

În cazul în care setăm pointeri și în `Persoana` către `Carte`, dar și în `Carte` către `Persoana`, fie o parte, fie cealaltă se va desincroniza, adică va trebui să găsim o cale prin care ambele colecții să fie actualizate. În loc de populare, mai eficient ar fi să se facă un `find()` pe cărți.

```javascript
Carte.
  find({ autor: autor._id }).
  exec(function (err, carti) {
    if (err) throw err;
    console.log('Cărțile sunt un array ce conține: ', carti);
  });
```

## Filtrarea după câmpuri referințe

```javascript
// Modelele Carte și Autor
const Carte = mongoose.model('Carte', Schema({
  titlu: String,
  autor: {
    type: mongoose.ObjectId,
    ref: 'Autor'
  }
}));
const Autor = mongoose.model('Autor', Schema({
  nume: String
}));

// Crearea unor cărți și a autorilor lor
const [autor1, autor2] = await Autor.create([
  { nume: 'Michael Crichton' },
  { nume: 'Ian Fleming' }
]);
const carti = await Carte.create([
  { titlu: 'Jurassic Park', autor: autor1._id },
  { titlu: 'Casino Royale', autor: autor2._id }
]);

// Populate carti și filtrează după numele autorului
const carti = Carte.find().populate({
  path: 'autor',
  match: { nume: 'Ian Fleming' }
});

carti.length; // 2
carti[0].autor; // null
carti[1].autor; // { nume: 'Ian Fleming' }
```

## Popularea unui document

În cazul în care deja au un document și dorești să populezi unele căi ale sale, vei folosi metoda `populate()`, pe care `Document` o pune la dispoziție. Pentru mai multe detalii utile, vezi documentația pentru `Document.prototype.populate()`.

## Resurse:

- [Mongoose Design Pattern: Store What You Query For | The Code Barbarian](http://thecodebarbarian.com/mongoose-schema-design-pattern-store-what-you-query-for.html)
- [LEFT JOIN vs. LEFT OUTER JOIN in SQL Server | stackoverflow](https://stackoverflow.com/questions/406294/left-join-vs-left-outer-join-in-sql-server)
