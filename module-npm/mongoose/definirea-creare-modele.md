# Definirea și crearea de modele

Modelele de date sunt construite folosind interfața `Schema`. Ceea ce permite această interfață este să definești câmpurile ce vor fi adăugate fiecărui document, valorile implicite, precum și regulile de validare a datelor ce vor fi introduse.

Schemele vor fi compilate în modele. Fiecarui **model** îi corespunde o colecție din baza de date.

## Realizarea schemelor

Construirea unei Scheme constă în instanțierea unui nou obiect `Schema`, care este, de fapt, o metodă a obiectului **mongoose**.

```javascript
// instanțiază biblioteca de cod (obiectul) mongoose
var mongoose = require('mongoose');
// instanțiază un obiect Schema căruia
// îi pasezi obiectul de configurare
var ResursaSchema = new mongoose.Schema({
  nume: String
});
```

Următorul pas este crearea unui model. Un model este o clasă, care pune la dispoziție multiple metode în lucrul cu datele care vor ajunge în MongoDB sau care vin de acolo.

Un amănunt foarte important este acela că toate operațiunile de lucru cu MongoDB sunt asincrone. Astfel că utilizarea metodelor clasei, vor returna o promisiune.

Primul argument este numele colecției care va fi creată în baza de date pentru modelul nostru. Cel de-al doilea parametru va fi chiar schema datelor care vor fi conținute de fiecare înregistrare.

```javascript
var Resursa = mongoose.model('resursa', ResursaSchema);
// acesta poate fi exportat pentru consumul din altă parte a programului
```

Ceea ce se întâmplă în culise este faptul că Mongoose va întreba MongoDB dacă are colecția `resursa`. Dacă MongoDB răspunde că nu o are, aceasta va fi creată.

Identificatorul `Resursa` nu reprezintă o singură înregistrare din colecție, ci chiar întreaga colecție cu toate înregistrările sale.

Se mai practică ca modelele constituite să fie puse la dispoziția întregului proiect prin exportul dintr-un modul separat constituit ca fișier distinct.

```javascript
module.exports = Resursa;
```

Astfel, vom putea cere modulul `Resursa` de oriunde din aplicație folosind `require(/modele/resursa)`.

Înainte de a salva în baza de date, în momentul constituirii obiectului model, Mongoose va atașa un flag `numeObiect.isNew = true`.

```javascript
const assert = require('assert');
var mongoose = require('mongoose');

var Resursa = require('/models/resursa');
var ResObi = new Resursa({
  nume: 'Ciprian'
});
// în acest moment, înainte de salvare, ResObi.isNew = true
ResObi.save().then(() => {
  // în momentul în care s-a făcut save-ul ResObi.isNew = false
  assert(ResObi.isNew);
});
```

## Toate obiectele model primesc id

Spre deosebire de alte ORM-uri, Mongoose, atribuie un **id** fiecărui obiect instanțiat în baza unui model înainte ca acesta să fie trimis către baza de date.

```javascript
var înregistrare = new NumeModel({});
```

Fii foarte atentă la faptul că atunci când lucrezi cu id-urile înregistrărilor, de fapt nu lucrezi cu niște simple șiruri, ci cu niște obiecte scpeciale numite de MongoDB `ObjectID`. Pentru a putea lucra cu ele în formă șir, va trebui să le serializăm folosind un `toString()`.

```javascript
const assert = require('assert');
const Comp = require('../models/competenta-specifica');

describe('Citește competențe din baza de date', () => {
    let comp; // este instanță de competență
    beforeEach((done) => {
        comp = new Comp({
            nume: 'Identificarea unor informaţii variate dintr-un mesaj rostit cu claritate',
            ids: '1.2',
            token: [
                'identificarea personajelor/ personajului unui text audiat',
                'oferirea unor răspunsuri la întrebări de genul: „Cine? Ce? Când? Unde? Cum? De ce?”'
            ],
            disciplina: 'comunicare în limba română',
            nivel: [
                'clasa I'
            ],
            ref: 'Ordin al ministrului Nr. 3418/19.03.2013'
        });
        comp.save().then(() => {
            done();
        });
    });
    it('Caută toate competențele pentru clasa I', (done) => {
        Comp.find({
            nivel: 'clasa I'
        }).then((competente) => {
            assert(competente[0]._id.toString() === comp._id.toString());
            done();
        });
    });
});
```

Pentru a compara șirurile în assert, a trebuit să apelăm la serializarea `ObjectID`-urilor.
