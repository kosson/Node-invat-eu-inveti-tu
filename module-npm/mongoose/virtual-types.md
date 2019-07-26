# Virtual types

Sunt proprietăți ale unui model care variază în timp așa cum ar putea fi numărul de comentarii al unui articol de blog sau numărul articolelor scrise de un autor.

În loc să creezi proprietăți în model, care să necesite aducerea înregistrării din bază, actualizarea sa și apoi salvarea înapoi, mai bine se va creea un virtual type.

Proprietățile virtuale se adaugă ca declarații separate de schemă.

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
    },
    ids:        [],     // În programă este codat cu 1.1. Aici se poate trece orice secvență alfanumerică care să ofere o adresă rapidă către competența specifică
    cod:        String, // cod intern agreat (parte a vocabularului controlat)
    token:      [],     // cunoștințe, abilități, atitudini: „utilizarea imaginilor pentru indicarea semnificaţiei unui mesaj audiat”, altul: „realizarea unui desen care corespunde subiectului textului audiat”
    disciplina: String, // COMUNICARE ÎN LIMBA ROMÂNĂ
    nivel:      [],     // toate acestea sunt cuvinte cheie. Sintagma în document este „Clasa pregătitoare, clasa I şi clasa a II-a”. Cheile: „clasa pregătitoare”, „clasa I”, „clasa a II-a”
    ref:        [],     // De ex: „Ordin al ministrului Nr. 3418/19.03.2013” sau poate fi link către ordin sau orice URI care poate identifica sursa informației sau orice asemenea
    parteA:     String, // Se introduce numele grupei de competențe specifice. De ex: „Receptarea de mesaje orale în contexte de comunicare cunoscute”
    din:        Date,
    REDfolos:   [],
    // nrREDuri:   Number  // numărul de resurse care vizează această competență
});

CompetentaS.virtual('nrREDuri').get(function () {
    return this.REDuri.length;
});

module.exports = new mongoose.model('competentaspecifica', CompetentaS);
```

Aceste declarații se comportă ca un getter. De fiecare dată când va fi cerută valoarea din model pentru o proprietate, care, de fapt este una virtuală necesitând computație suplimentară pentru a genera valoarea, se va apela o funcție callback definită folosind `function`. Ceea ce va returna funcția din `get()` este valoarea tipului virtual.
