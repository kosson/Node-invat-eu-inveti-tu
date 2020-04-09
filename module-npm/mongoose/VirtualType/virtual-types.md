# Virtual types

Sunt proprietăți ale unui document care nu sunt păstrate în bază, ci sunt constituite ad-hoc așa cum ar putea fi numărul de comentarii al unui articol de blog sau numărul articolelor scrise de un autor.

Atributele unui document virtual se vor seta prin metoda `virtual()` căreia îi vor fi pasate câmpurile documentului virtual (`Schema.prototype.virtual`).

```javascript
const fullname = schema.virtual('fullname');
fullname instanceof mongoose.VirtualType // true
```

În loc să creezi proprietăți în model, care să necesite aducerea înregistrării din bază, actualizarea sa și apoi salvarea înapoi, mai bine creezi un virtual type.

Proprietățile virtuale se adaugă aplicând metoda `virtual()` pe schema deja instanțiată. Metoda acceptă drept parametru un string care va fi numele proprietății noi pe care o adaugi documentului care va fi constituit mai târziu. Poți spune că o proprietate virtuală este o efemeridă.

```javascript
const mongoose = require('mongoose');

let CompetentaS = new mongoose.Schema({
    nume: {             // este chiar numele competenței specifice. Ex: 1.1. Identificarea semnificaţiei unui mesaj oral, pe teme accesibile, rostit cu claritate
        type: String,
        validate: {
            validator: (nume) => {
                return nume.length > 2; // este absolut necesar să returnaze true sau false
            },
            message: 'Numele resursei trebuie să fie mai mare de trei caractere'
        },
        required: [true, 'Fără numele resursei, nu se poate face înregistrarea']
    }
});

CompetentaS.virtual('nrREDuri').get(function () {
    return this.REDuri.length;
});

module.exports = new mongoose.model('competentaspecifica', CompetentaS);
```

Aceste declarații se comportă ca un getter. De fiecare dată când va fi cerută valoarea din model pentru o proprietate, care, de fapt este una virtuală necesitând computație suplimentară pentru a genera valoarea, se va apela o funcție callback definită folosind `function`. Ceea ce va returna funcția din `get()` este valoarea tipului virtual.

Pentru a lucra cu proprietățile schemei și astfel, mai târziu făcându-se calcule cu valorile care vor hidrata modelul, se vor apela folosind `this`.

De fiecare dată când se va istanția modelul și se va hidrata cu date, propritatea *virtuală* va fi disponibilă și va acea drept valoare evaluarea operațiunilor menționate atunci când a fost declarată.

## Modificarea datelor la nivel de schemă cu getteri

Există un truc pentru a putea modifica valorile care vor fi disponibile într-un document după ce a fost generat prin hidratarea cu date a unui model. Această operațiune implică aplicarea metodei `get()` cu un callback ce va face transformarea datelor pe calea unei scheme obținută în prealabil prin aplicarea metodei `path()`. Apoi se activează toți getterii pentru `toObject`.

```javascript
// creează schema
var schemă = new Schema({nume: String});

// aplică un getter pe calea pe care vrei să o transformi
schemă.path('nume').get(function (nume_plus_ceva) {
  return nume_plus_ceva + ', salut!'; // returnează rezultatul modificării datelor
});

// instanțiază un model
var Utilizator = mongoose.model('Utilizator', schemă);

// hidratează cu date
var utilizator = new Utilizator({nume: "Andreea"});

// rezultat utilizator.nume
console.log(utilizator.nume); // Andreea, salut!
```

Pentru mai multe opțiuni pe care le oferă `toObject`, citește și Document.prototype.toObject().
