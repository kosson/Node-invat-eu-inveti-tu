# Modulul fs

Pentru a folosi acest modul, trebuie să-l ceri cu `require('fs')`.

Pentru a nu bloca `event loop`, este recomandată folosirea întotdeauna a variantei asincrone.

```javascript
const fs = require('fs');

fs.unlink('/cale/director', (err) => {
  if (err) {
    return console.log(err);
  };
  console.log('am șters directorul indicat');
});
```

## Căi relative

Căile pe care le pasezi lui `fs` pot fi relative.

```javascript
const fs = require(`fs`);
const path = require(`path`);

// clasic
fs.readFile(path.join(__dirname, `fisier.txt`), (err, data) => {
  // cod
});

// relativ
fs.readFile(`./calea/catre/fisier.txt`, (err, data) => {
  // cod
});
```

## Procesarea căilor pentru a extrage datele relevante

Procedura de a extrage informațiile utile despre fișiere.

```javascript
caleaCatreFisier = `/director/fisier.json`;
path.parse(caleaCatreFisier).base === `fisier.json`; // true
path.parse(caleaCatreFisier).name === `fisier`; // true
path.parse(caleaCatreFisier).ext === `.json`; // true
```

Vezi documentația de la https://nodejs.org/api/path.html#path_path_parse_path

## Lucrul cu streamurile

Modulul `fs` este modulul cu ajutorul căruia putem lucra cu streamurile în Nodejs. Streamurile în Nodejs se bazează pe lucrul cu evenimente pentru că streamurile implementează clasa `EventEmitter`. Pe cale de consecință, atunci când apar datele, poți atașa un listener, un callback care să facă ceva cu acele date.

```javascript
var fs = require('fs');
var streamDeCitire = fs.createReadStream('ceva.txt');
var datele = '';

streamDeCitire.on('data', function (fragment) {
  datele += fragment;
});

streamDeCitire.on('end', function () {
  console.log(datele);
});
```

Întrebarea de bun început este următoarea: când încep datele să *curgă*? De îndată ce se atașează un eveniment `data` apar și datele în stream. După acest moment inițial,fragmente de date sunt pasate rând pe rând cu o frecvență decisă de API-ul care implementează stream-ul (de exemplu, poate fi HTTP-ul). Atunci când nu mai sunt fragmente de date, stream-ul emite un eveniment `end`.
Folosind metoda `read()` pe streamul readable avem posibilitatea de a citi în calupuri datele stream-ului.

```javascript
var fs = require('fs');
var streamDeCitire = fs.createReadStream('ceva.txt');
var datele = '';
var calup;

streamDeCitire.on('readable', function () {
  while ((calup = readableStream.read()) != null) {
    datele += calup;
  };
});

streamDeCitire.on('end', function () {
  console.log(datele);
});
```

Metoda `read()` preia datele dintr-un buffer și le returnează. Datele pe care le citește un strim sunt cele dintr-un obiect `Buffer`. Atunci când nu mai este nimic în buffer, va returna `null`. Acesta este și motivul pentru care bucla din exemplu va testa după `null`. Mai trebuie adăugat că evenimentul `readable` va fi emis atunci când un fragment de date este citit din stream. În cazul în care datele sunt text, pentru a le putea folosi la fel, trebuie specificat standardul de codare.

## Piping

Pipingul este un mecanism prin care citești date dintr-o sursă și le scriem în altă parte.

```javascript
var fs = require('fs');
var streamDeCitire = fs.createReadStream('ceva.txt');
var streamDeScriere = fs.createWriteStream('altceva.txt');
streamDeCitire.pipe(streamDeScriere);
```

Metoda `pipe()` returnează stream-ul destinație.

### Copierea unui fișier în altul

Pentru a copia conținutul unui fișier în altul, trebuie să creezi mai întâi un stream de citire și apoi unul de scriere. Acestea vor fi folosite de utilitarul `pipe`.

```javascript
const fs = require('fs');
const readAStream = fs.createReadStream('origine.txt');
var writeTheStream = fs.createWriteStream('destinatie.txt');

readAStream.pipe(writeTheStream);
```

### Prelucrări intermediare a datelor din fișiere

```javascript
const fs = require('fs');
const zlib = require('zlib');

fs.createReadStream('original.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('original.txt'));
```

## Verificarea accesului pe o anumită cale

```javascript
fs.acces('/cale/director', fs.constants.R_OK | fs.constants.W_OK, (err) => {
  if (err) {
    return console.error('nu poți accesa');
  };
  console.log('ai acces pentru a citi și scrie');
}); // este folosit bitwise operator
```

Explicarea constantelor:

- `fs.constants.F_OK` - verifică dacă calea este accesibilă pentru procesul în desfășurare.
- `fs.constants.R_OK` - verifică dacă poate fi citit
- `fs.constants.W_OK` - verifică dacă poate fi scris
- `fs.constants.X_OK` - verifică dacă poate fi executat

Nu fă verificări cu `fs.access` după `fs.open`, `fs.readFile` sau `fs.writeFile`. Motivul este că la momentul la care faci verificarea disponibilității, fișierul a fost deja modificat cumva.

## Sesizarea modificărilor fișierelor și directoarelor
