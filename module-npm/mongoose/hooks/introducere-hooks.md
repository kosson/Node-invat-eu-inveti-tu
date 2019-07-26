# Hooks

Mongoose respectă paradigma Node.js care este cea a gestionării de evenimente. Ceea ce ne este oferit cu aceste *hooks* este posibilitatea de a adăuga funcții (middleware), care să fie executate înainte sau după un event.

Un eveniment poate fi căutarea în bază sau ștergerea unei înregistrări, ori actualizarea unei înregistrări. De cele mai multe ori vei avea un scenariu de tip *one-to-many* în care dorești să ștergi înregistrarea unui utilizator din baza de date, dar în același timp dorești să ștergi și toate înregistrările asociate cu acesta. În acest scenariu, vei folosi un hook `pre`, care înainte de a șterge utilizatorul, va căuta toate înregistrările asociate cu acesta și le va șterge mai întâi de toate.

Dacă dorim să introducem middleware (funcții) care să facă ceva înainte de a declanșa un eveniment, vom folosi hook-ul `pre`. Dacă dorim executarea unor funcții (middleware) după ce s-a petrecut un eveniment, vom folosi hook-ul `post`.

Posibile evenimente în Mongoose:

- `init` - care apare la inițializarea unui model;
- `validate` - care apare la momentul în care se dorește validarea datelor;
- `save` - care este folosit pentru salvarea în baza de date;
- `remove` - pentru ștergerea unei înregistrări din bază.

De regulă, middleware-ul folosit, fie în `pre`, fie în `post` va fi declarat chiar în fișierul modelului.
Pentru a introduce un middleware într-un hook, mai întâi trebuie pasat hook-ului un argument care menționează chiar evenimentul pentru care acesta trebuie să intre în execuție. Și apoi, așa cum ne-a obișnuit modul de lucru al Node,js, vom introduce un callback. Acest callback, această funcție va fi apelată ori de câte ori apare evenimentul specificat la primul parametru. De exemplu, atunci când dorim să facem un *save* în baza de date, acesta callback este cel care va fi apelat înainte de a se face salvarea.

```javascript
Resursa.pre('remove', function hRemoveCb(next) {
    const Coment = monoose.model('coment'); // acces direct la model fără require
    Coment.remove({ // -> Parcurge întreaga colecție a comentariilor
        // -> iar dacă un `_id`  din întreaga colecție de comentarii se potrivește cu id-urile de comentariu din întregistrarea resursei (`$in: this.Coment`), șterge-le.
        _id: {$in: this.Coment} // se va folosi operatorul de query `in` pentru a șterge înregistrările asociate
    }).then(() => next()); // -> acesta este momentul în care putem spune că înregistrarea a fost eliminată complet.
});
```

Evită scenariile în care se un model are nevoie de un altul, iar acela la rândul său pe primul. Aceasta este o circularitate care trebuie evitată. Pentru a o evita, în cazul hook-urilor, se poate referi un model folosind metoda `mongoose.model('numeModelCerut')`. Acest helper `mongoose.model` oferă acces direct la un model fără să-l mai ceri cu *require*.

Fii foarte atent ca în declararea callback-urilor hook-urilor să declari callback-ul cu `function` și să nu folosești fat arrow. Acest lucru este necesar pentru că accesul la model sau mai bine spus reprezentarea modelului este accesibilă doar prin `this`.

După cum se observă în exemplu, funcția cu rol de callback la momentul executării trebuie să semnaleze cumva lui mongoose faptul că și-a încheiat execuția. În acest sens, callback-ul va primi drept argument referința către o funcție pe care o vom apela după ce toate operațiunile se vor fi încheiat. Acest `next()` va reda controlul lui mongoose, care, în funcție de caz, va executa următorul middleware sau mai departe alte operațiuni dacă un altul nu mai există.
