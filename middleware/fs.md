# Modulul `fs`

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

## Copierea unui fișier în altul

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
