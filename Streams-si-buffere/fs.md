# Modulul fs

Acest modul oferă un adevărat API prin care se realizează interacțiunea cu sistemul de fișiere al mașinii gazdă. Operațiunile de lucru cu sistemul de fișiere pot avea un aspect sincron și unul asincron, privind la modul în care se pot desfășura operațiunile. Ceea ce face Nodejs este un ambalaj al funcțiilor POSIX.

Pentru a folosi acest modul, trebuie să-l ceri cu `require('fs')`. Pentru a nu bloca `event loop`, este recomandată folosirea variantei asincrone întotdeauna. În cazul utilizării asincrone, va trebui introdus un callback, care să acompanieze acțiunea.

```javascript
const fs = require('fs');

fs.unlink('/cale/director', (err) => {
  if (err) {
    return console.log(err);
  };
  console.log('am șters directorul indicat');
});
```

Modulul `fs` pune la dispoziție și metodele necesare lucrului cu streamuri.

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
let caleaCatreFisier = `/director/fisier.json`;
path.parse(caleaCatreFisier).base === `fisier.json`; // true
path.parse(caleaCatreFisier).name === `fisier`; // true
path.parse(caleaCatreFisier).ext === `.json`; // true
```

Vezi documentația de la https://nodejs.org/api/path.html#path_path_parse_path

<<<<<<< HEAD:Streams-si-buffere/fs.md
### Verificarea accesului pe o anumită cale

```javascript
fs.acces('/cale/director', fs.constants.R_OK | fs.constants.W_OK, (err) => {
  if (err) {
    return console.error('nu poți accesa');
  };
  console.log('ai acces pentru a citi și scrie');
}); // este folosit bitwise operator
```

Explicarea constantelor:

-   `fs.constants.F_OK` - verifică dacă calea este accesibilă pentru procesul în desfășurare.
-   `fs.constants.R_OK` - verifică dacă poate fi citit
-   `fs.constants.W_OK` - verifică dacă poate fi scris
-   `fs.constants.X_OK` - verifică dacă poate fi executat

Nu fă verificări cu `fs.access` după `fs.open`, `fs.readFile` sau `fs.writeFile`. Motivul este că la momentul la care faci verificarea disponibilității, fișierul a fost deja modificat cumva.

## Piping

Pentru a *compune* stream-urile, este nevoie să folosești metoda `.pipe()`, care are același rol precum caracterul „pipe” <code>&#124;</code> din UNIX. Modul în care aplici `pipe()` este legat de stream-ul sursă și cel destinație într-o înlănțuire de forma: `streamSursa.pipe(destinație)`. Pipe va returna obiectul destinație pentru a se putea chaining pe un alt stream dacă acest lucru este necesar: `x.pipe(y).pipe(z).pipe(w)`, fiind similar cu `x.pipe(y); y.pipe(z); z.pipe(w)`. Un astfel de chaining este similar UNIX-ului: `x | y | z | w`.
=======
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
>>>>>>> master:middleware/fs.md

### Copierea unui fișier în altul

Pentru a copia conținutul unui fișier în altul, trebuie să creezi mai întâi un stream de citire și apoi unul de scriere. Acestea vor fi folosite de utilitarul `.pipe()`.

```javascript
const fs = require('fs');
const readAStream = fs.createReadStream('origine.txt');
var writeTheStream = fs.createWriteStream('destinatie.txt');

readAStream.pipe(writeTheStream);
```

### Prelucrări intermediare a datelor din fișiere

Streamurile permit și puncte de prelucrare ale datelor pentru cazul în care avem nevoie să facem prelucrări în anumite momente. De exemplu, este posibil să *citești* o arhivă, dar pentru a face ceva util cu datele compactate, ai nevoie să o dezarhivezi. Această operațiune poate fi realizată printr-un pipe către o funcție cu rol de dezarhivare.

```javascript
const fs = require('fs');
const zlib = require('zlib');

fs.createReadStream('original.txt.gz').pipe(zlib.createGunzip()).pipe(fs.createWriteStream('original.txt'));
```

### Trimite fișier de la server

Pentru a reduce încărcarea serverului și pentru a eficientiza trimiterea datagramelor pe rețea, se pot folosi din nou stream-urile în lucrul cu serverele web. Trebuie să ne amintim de faptul că streamurile implementează clasa `EventEmitter`, ceea ce le face pretabile lucrului în paradigma evenimentelor.

```javascript
var http = require('http'),
    fs = require('fs');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/fisier.json');
    stream.pipe(res);
});
server.listen(3000);
```

Ceea ce trebuie să înțelegi este faptul că `req` și `res` sunt niște obiecte, care au ca principiu de funcționare intern stream-urile. În cazul nostru, am creat un stream care citește (*Read*) stream-ul și apoi, l-am *racordat* folosind metoda `pipe()` la obiectul răspuns. Metoda `.pipe()` va avea grijă de evenimentele `date` și `end` care apar în momentul în care folosești `fs.createReadStream(__dirname + '/fisier.json');`.
