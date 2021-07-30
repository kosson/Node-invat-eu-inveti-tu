# fs.createReadStream

Este o metodă a modului `fs` care *consumă* o resursă folosind buffer-ul. Metoda acceptă drept prim parametru o cale către un fișier (string), un obiect *URL* sau chiar un *buffer*.

Al doilea parametru poate fi un string sau un obiect care poate avea următorii membri pentru setarea stream-ului:

-   *flags* (string) - default: `r`,
-   *encoding* (string) - default: `null`,
-   *fd* (număr întreg) - default: `null`,
-   *mode* (număr întreg) - default: `0o666`,
-   *autoClose* (boolean) - default: `true`,
-   *start* (număr întreg),
-   *end* (număr întreg) - default: `Infinity`,
-   *highWaterMark*, fiind un număr întreg cu un default: 64 * 1024.

Dacă al doilea parametru este un șir, acesta va specifica schema de codare a caracterelor. Cel mai uzual este `utf8`. Spre deosebire de un stream clasic, cel returnat de această metodă are un `hightWaterMark` de 64 de kb.

Dacă în opțiuni sunt menționate limitele de bytes de la care să pornească citirea și la care să se oprească (`start` și `end`). Ambele limite includ valoarea de la care pornesc și încep numărătoarea de la `0`.
În cazul în care este menționat în opțiuni un file descriptor (`fd`), dar este omisă valoarea `start` sau are valoarea `undefined`, se va citi secvențial de la poziția curentă în care se află fișierul.

În cazul în care este prezent un file descriptor, metoda va ignora argumentul `path` folosind file descriptorul. Acest lucru implică faptul că nu va fi emis niciun eveniment `open`, iar `fd` ar trebui să fie blocking (de ex. tastatură sau placa de sunet). Cele non blocking ar trebui pasate lui `net.Socket`.

Metoda `fs.createReadStream()` oferă posibilitatea de a citi un stream de date dintr-un fișier.

```javascript
var fs = require('fs');
var unStreamReadable = fs.createReadStream(__dirname + '/fisier.csv', 'utf8');
```

Pentru că toate stream-urile sunt instanțe ale clasei `EventEmitter`, va trebui să avem o funcție pe care să o folosim pe post de receptor, care va asculta dacă au venit date pe stream sau nu. Dacă standardul de codare al caracterelor nu este menționat, atunci, ceea ce vei citi din buffer sunt reprezentarea datelor așa cum sunt ele stocate în buffer. Odată menționat, de exemplu, `utf8`, poți vedea în clar textul din fișier.

```javascript
unStreamReadable.on('data', function (fragment) {
  // fragment reprezintă date acumulate în buffer.
  // fă ceva cu fragmentul de date
});
```

Întreaga resursă de date va fi consumată de `stream`-ul nostru *readable*. De fiecare dată când un fragment din `Buffer` este trimis, se declanșează execuția callback-ului. După prelucrarea fragmentului anterior, se va primi un alt fragment, care va fi prelucrat și tot așa până la consumarea întregii resurse.
