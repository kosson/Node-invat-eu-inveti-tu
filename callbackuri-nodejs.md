# Callbackurile și stilul de programare în Node.js

În Node.js, callback-urile sunt funcții care sunt invocate pentru a trimite mai departe rezultatele unei operațiuni jucând rolului lui `return` dacă ar fi să comparăm cu execuția funcțiilor. Combinat cu, closure-ul pe care-l realizează funcțiile, callback-urile reprezintă un instrument de lucru primar în Node.js. În JavaScript, callback-urile sunt funcții pasate drept argument, care sunt invocate cu rezultatul evaluării funcției în care sunt invocate. Acest procedeu se numește *continuation-passing style* (CPS) pentru că în loc să returnezi rezultatul, îl trimiți drept input altei funcții. În Node.js, dacă o funcție acceptă ca argument un callback, acesta trebuie să fie pasat ultimul. Obiectul de eroare trebuie poziționat primul în lista argumentelor. Erorile sunt pasate și ele ca oricare rezultat. Dacă nu sunt erori, valoarea acestuia este `null` sau `undefined`.

În cazul Node.js, callback-urile sunt asincrone ceea ce înseamnă că sunt trimise spre execuție folosind event loop-ul. Avantajul major este faptul că de îndată ce callback-ul este „programat” spre procesarea cu event loop-ul, funcția care l-a programat își încheie execuția eliberând resursele în firul de execuție. Spunem că o funcție este asicronă dacă deleagă execuția unui callback. Ca să te asiguri că un callback va fi executat asincron în Node.js, folosește `process.nextTick(() => nume_callback(datele))`.

## Error first callback

Modulele Node.js ar trebui să expună o interfață *error first callback*. Acest lucru înseamnă crearea unor module, care să expună ca prim argument o posibilă eroare.

```javascript
module.exports = function (date, callback) {
  console.log(date); // prelucrează datele cumva
  const prelucrate = date + 1;
  // dacă apar erori în timpul prelucrării datelor, acestea ar trebui pasate
  // ca prim argument al funcției cu rol de callback
  return callback(null, prelucrate); // dacă nu apare nicio eroare, pasează null
}
```

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

Exemplul a fost preluat din exemplele oferite de Mario Casciaro în lucrarea sa *Node.js Design Patterns*, o lectură obligatorie și care aduce multă claritate felului în care ar trebui scris cod pentru Node.js.

Pentru a propaga erorile în callback este nevoie de blocul `try...catch`, altfel, acestea ar rămâne doar la nivelul `readFile`.

## Principii de lucru

Nu crea structuri de apeluri callback imbricate creând un așa-numit *callback hell*.

A. Returnează cât mai reprede din callbacks

Este vorba despre așa-numitul *early return priciple*. De exemplu, atunci când evaluezi o eroare, returnează.

```javascript
// webminer.js
import fs                from 'fs'
import path              from 'path'
import superagent        from 'superagent'
import mkdirp            from 'mkdirp'
import { urlToFilename } from './utils.js'

export function webminer (url, cb) {
  const filename = urlToFilename(url);

  // dacă fișierul nu există
  fs.access(filename, err => {
    if (err && err.code === 'ENOENT') {

      // poți purcede la crearea structurii
      console.log(`Downloading ${url} into ${filename}`);

      // descarcă pagina
      superagent.get(url).end((err, res) => {
        if (err) {
          // cb(err);
          return cb(err); // early return principle
        } else {

          // construiește un director al cărui nume va fi numele fișierului
          mkdirp(path.dirname(filename), err => {
            if (err) {
              // cb(err);
              return cb(err);
            } else {

              // scrie fișierul
              fs.writeFile(filename, res.text, err => {
                  if (err) {
                    // cb(err);
                    return cb(err);
                  } else {
                    // apelează callback-ul final
                    cb(null, filename, true);
                  }
              });
            }
          });
        }
      });
    } else {
      // apelează callback-ul final
      cb(null, filename, false);
    }
  });
}

// webminecli.js
import { spider } from './webminer.js'
webminer(process.argv[2], (err, filename, downloaded) => {
  if (err) {
    console.error(err)
  } else if (downloaded) {
    console.log(`Completed the download of "${filename}"`)
  } else {
    console.log(`"${filename}" was already downloaded`)
  }
});
```

B. Abstractizează funcționalitățile

```javascript
// abstractizarea funcționalității pentru crearea directorului
function saveFile (filename, contents, cb) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) return cb(err);
    fs.writeFile(filename, contents, cb);
  });
};

// abstractizarea funcționalității necesare descărcării paginii
function download (url, filename, cb) {
  // descarcă pagina
  superagent.get(url).end((err, res) => {
    if (err) return cb(err); // early return principle
    saveFile(filename, res.text, (err) => {
      if (err) return cb(err);
      cb(null, res.text);
    });
  });
};

export function webminer (url, cb) {
  const filename = urlToFilename(url);

  // dacă fișierul nu există
  fs.access(filename, (err) => {
    if (!err || err.code !== 'ENOENT') {
      return cb(null, filename, false);
    }
    download(url, filename, (err) => {
      if (err) return cb(err);
      cb(null, filename, true);
    });
  });
}
