# Stilul de programare în Node.js

În Node.js, dacă o funcție acceptă ca argument un callback, acesta trebuie să fie pasat ultimul.

În *continuation-passing style* (CPS), caracteristic lucrului asincron, erorile sunt propagate ca un rezultat, ceea ce implică trimiterea lor ca argument unui callback.

```js
fs.readFile('test.csv', 'utf8', function (error, data) {
  if (error) {
    rezolvaEroarea(err);
  } else {
    proceseazaDatele(data);
  }
});
```

Obiectul `error` este primul argument pasat funcției callback. Doar prin inspectarea acestuia, vom ști dacă a apărut o eroare. În cazul în care valoarea sa este `null`, totul a decurs normal.

## Propagarea erorilor

În cazul funcțiilor sincrone propagarea se face folosind `throw`, care trimite eroarea prin întreaga stivă până când aceasta este „prinsă”.

În CPS, erorile sunt propagate prin pasarea lor următorului callback.

Un exemplu de propagare a erorilor:

```js
var fs = require('fs');

function readJSON(filename, callback) {
    fs.readFile(filename, 'utf8', function(err, data) { // citește fișierul
        var parsed;                                     // inițializează o variabilă care va conține JSON-ul parsat
        if (err)                                        // dacă deja am erori, adica fișierul nu a fost găsit sau nu poate fi citit, fiind un binar
            return callback(err);                       // propagă eroarea în callback și returnează evaluarea acestuia.
        try {                                           // dacă nu punem parsarea într-un try-catch, erorile nu se vor propaga la callback, nu au mecanismul
            parsed = JSON.parse(data);                  // parsează conținutul
        } catch (err) {
            return callback(err);                       // prinde erorile de la parsare, pasează-le callback-ului și returnează evaluarea acestuia
        }
        callback(null, parsed);                         // dacă nu sunt erori, trimite fișierul parsat callback-ului
    });
};
```

Exemplul a fost preluat din exemplele oferite de Mario Casciaro în lucrarea sa „Node.js Design Patterns”, o lectură obligatorie și care aduce multă claritate felului în care ar trebui scris cod pentru Node.js.

Pentru a propaga erorile în callback este nevoie de blocul `try..catch`, altfel, acestea ar rămâne doar la nivelul `readFile`.
