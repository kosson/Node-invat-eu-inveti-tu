# Populate

Permite referirea unor documente care se află în alte colecții.

Popularea este procesul prin care se înlocuiesc automat căile specificate în document cu documentele aflate în alte colecții.

Este posibilă popularea unui singur document, a mai multor documente, a unor simple obiecte, a mai multor obiecte simple sau a tuturor obiectelor care au fost returnate ca urmare a unei interogări.


```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const persoanăSchema = Schema({
  _id: Schema.Types.ObjectId,
  nume: String,
  vârstă: Number,
  cărți: [{
    type: Schema.Types.ObjectId,
    ref: 'Poveste'
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

const Poveste = mongoose.model('Carte', carteSchema);
const Persoană = mongoose.model('Persoană', persoanăSchema);
```

În exemplul dat, o persoană poate scrie mai multe povești. Opțiunea `ref` îi spune lui Mongoose, care este colecția care va fi folosită la momentul populării. În cazul nostru este schema `Carte`.

Id-urile care vor fi culese, trebuie să fie id-uri de documente (`_id`) din modelul de `Carte`.

Atenție, `ref`-urile pot primi următoarele valori: `ObjectId`-uri, `Number`, `String` sau `Buffer`.

## Salvarea `ref`-urilor

Atunci când este nevoie, poți salva ref-uri către alte documente. Pur și simplu trebuie să atribui valoarea `_id`-ul.

```javascript
const autor = new Persoană({
  _id:    new mongoose.Types.ObjectId(),
  nume:   'Ian Fleming',
  vârstă: 50
});

autor.save(function (err) {
  if (err) throw err;

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

Ceea ce am realizat este salvarea unui autor cu o primă carte a sa deodată.

## Popularea

Să inițiem popularea autorului pentru o carte a sa.

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

Căile populate nu mai sunt setate la `_id`-ul lor original, valoarea lor fiind înlocuită chiar de documentul returnat din baza de date. Ceea ce se întâmplă în spate, este un alt query înainte de a returna rezultatele.

În cazul array-urilor se petrece același lucru. Pur și simplu apelezi metoda `populate` pe query, și va fi adus un array de documente *în loc de* `_id`-urile originale.

## Setarea câmpurilor de populare

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

## Documentul corespondent nu există

În cazul în care nu avem un document corespondent din care proprietatea `ref` să poată aduce date, rezultatul `ref` va fi `null`.

```javascript
await Persoană.deleteMany({ nume: 'Ian Fleming' });

const poveste = await Carte.findOne({ titlu: 'Casino Royale' }).populate('autor');
carte.autor; // `null`
```

În cazul în care în `carteSchema` ai avut un array de autori, `populate`, va returna un array gol.

## Selectarea câtorva câmpuri

În cazul în care din rezultatele care vor popula proprietatea populate, dorești să aduci doar câteva dintre câmpuri, acestea pot fi menționate ca argumente metodei.

```javascript
Carte.
  findOne({ titlu: /casino royale/i }).
  populate('autor', 'nume'). // only return the Persons name
  exec(function (err, carte) {
    if (err) throw err;

    console.log('Autorul este %s', carte.autor.nume);
    // afișează "Autorul este Ian Fleming"

    console.log('Vârsta autorului este %s', carte.autor.vârsta);
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

În cazul în care soliciți popularea pe aceeași cale de mai multe ori, doar ultima solicitare va fi luată în considerare.

```javascript
Carte.
  find().
  populate({ path: 'fani', select: 'nume' }).
  populate({ path: 'fani', select: 'email' });
// Fiind echivalent cu:
Carte.find().populate({ path: 'fani', select: 'email' });
```

## Popularea cu anumite condiții

Uneori dorești să faci o alegere a unor date cu care se va face popularea în funcție de anumite criterii.

```javascript
Carte.
  find().
  populate({
    path: 'fani',
    match: { vârsta: { $gte: 21 }},
    // Excluzi `_id` în mod explicit, vezi http://bit.ly/2aEfTdB
    select: 'nume -_id',
    options: { limit: 5 }
  }).
  exec();
```

## `Ref`-uri către copii

Dacă folosim obiectul `autor` vom descoperi că nu putem găsi o listă a cărților. Acest lucru este pentru că încă nu au fost introduse obiecte `carte` în `autor.carti`.

Aici există două abordări:

- lași `autor`-ul să-și cunoască cărțile. De regulă schema ar trebui să rezolve relații de tipul one-to-many prin existența unui pointer către părinte în zoma de many.
- dacă există un motiv întemeiat să dorești un array de pointeri copil, poți face `push()` documentelor în array precum în:

```javascript
autor.carti.push(cartea1);
autor.save(callback);
```

Acest mod permite un combo de căutare și populare în tandem.

```javascript
Persoana.
  findOne({ nume: 'Ian Fleming' }).
  populate('carti'). // merge doar dacă am făcut push la ref-uri către copil
  exec(function (err, persoana) {
    if (err) return handleError(err);
    console.log(persoana);
  });
```

Setarea unor astfel de pointeri este discutabilă pentru că pot să nu mai fie în sincron la un moment dat. În loc de populare, mai util ar fi să se facă un `find()` pe cărți.

```javascript
Carte.
  find({ autor: autor._id }).
  exec(function (err, carti) {
    if (err) throw err;
    console.log('Cărțile sunt un array: ', carti);
  });
```
