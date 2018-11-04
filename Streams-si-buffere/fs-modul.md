## Modulul fs

Pentru a lucra cu streamuri, vom avea nevoie de modulul `fs`, care oferă metodele necesare.

### Crearea unui stream readable

Metoda `fs.createReadStream()` oferă posibilitatea de a citi un stream de date.

```javascript
var fs = require('fs');
var unStreamReadable = fs.createReadStream(__dirname + '/fisier.csv', 'utf8');
```

Pentru că toate streamurile sunt instanțe ale clasei `EventEmitter`, va trebui să avem o funcție pe care să o folosim pe post de receptor, care va asculta dacă au venit date pe stream sau nu. Dacă standardul de codare al caracterelor nu este menționat, atunci, ceea ce vei citi din buffer sunt reprezentarea a datelor așa cun sunt ele stocate în buffer. Odată menționat, de exemplu, `utf8`, poți vedea în clar textul din fișier.

```javascript
unStreamReadable.on('data', function (fragment) {
  // fragment reprezintă date acumulate în buffer.
  // fă ceva cu fragmentul de date
});
```

Întreaga resursă de date va fi consumată de streamul nostru readable. De fiecare dată când un fragment din buffer este trimis, se declanșează execuția callback-ului. După prelucrarea fragmentului anterior, se va primi un alt fragment, care va fi prelucrat și tot așa până la consumarea întregii resurse.

Pentru a continua, te invit să citești despre modului `fs` al acestei documentații.
