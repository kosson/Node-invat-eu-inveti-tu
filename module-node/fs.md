# Modulul fs

Acest modul oferă un adevărat API prin care se realizează interacțiunea cu sistemul de fișiere al mașinii gazdă. Operațiunile de lucru cu sistemul de fișiere pot avea un aspect sincron și unul asincron, privind la modul în care se pot desfășura operațiunile. Ceea ce face NodeJS este un ambalaj al funcțiilor POSIX.

Pentru a folosi acest modul, trebuie să-l ceri cu `require('fs')`. Pentru a nu bloca *event loop*, este recomandată folosirea variantei asincrone întotdeauna. În cazul utilizării asincrone, va trebui introdus un callback, care să acompanieze acțiunea. Ca exemplu, avem o acțiune de ștergere a unui director.

```javascript
const fs = require('fs');

fs.unlink('/cale/director', (err) => {
  if (err) {
    return console.log(err);
  };
  console.log('am șters directorul indicat');
});
```

Pentru a ține evidența fișierelor de lucru, kernelul sistemelor POSIX ține evidența fișierelor și resurselor deschise. Fiecărui fișier deschis îi este asignat un identificator numit `file descriptor`.

Modulul `fs` pune la dispoziție și metodele necesare lucrului cu stream-uri. Pentru a dezvolta acest aspect foarte important, vezi materialele dedicate stream-urilor.

## Lucrul pe căile sistemului

Căile sistemului de operare sunt necesare pentru a accesa resursele. Acestea sunt oferite metodelor modulului `fs` drept parametru și pot fi un șir de caractere (secvențe de caractere codate UTF8), un obiect `Buffer` sau un obiect URL care folosește protocolul `file:`.

## Căi relative

Căile pe care le pasezi lui `fs` pot fi relative. Pentru simplificarea activităților, de cele mai multe ori vei întâlni situațiile în care se folosește în paralel modulul `path`.

```javascript
const fs = require(`fs`);
const path = require(`path`);

// pentru compatibilitatate cu alte sisteme
fs.readFile(path.join(__dirname, `fisier.txt`), (err, data) => {
  // cod
});

// relativ pe sisteme NIX
fs.readFile(`./calea/catre/fisier.txt`, (err, data) => {
  // cod
});
```

Prin funcția cu rol de callback care este pasată metodei `readFile` avem acces la un obiect `Buffer` care ține conținutul fișierului.

## Protocolul file

Calea de acces la o resursă pe disc se poate face și utilizând un obiect url WHATWG. Suportul este oferit doar pentru obiectele care folosesc protocolul `file:`.

```javascript
const fs = require('fs');
const fileUrl = new URL('file:///tmp/hello');

fs.readFileSync(fileUrl);
```

Obiectele URL vor fi întotdeauna căi absolute.

## Deschiderea unui fișier

Metoda `fs.open()` este folosită pentru a aloca un nou `file descriptor`, care va fi folosit pentru a obține informații despre fișier.

```javascript
fs.open('/director/subdirector/fisier.txt', 'r', (err, fisierDescr) => {
    if (err) {throw err};
    fs.fstat(fisierDescr, (err, stare) => {
        if (err) {throw err};
        // fă interogările necesare despre starea fișierului

        // întotdeauna închide fișierul
        fs.close(fisierDescr, (err) => {
            if (err) {throw err};
        });
    });
});
```

Documentația Node.js spune că este absolut necesară închiderea fișierului pentru că orice sistem de operare permite un anumit număr să fie deschis și se pot întâmpla chiar scurgeri de memorie.

## Procesarea căilor pentru a extrage datele relevante

Procedura de a extrage informațiile utile despre fișiere.

```javascript
let caleaCatreFisier = `/director/fisier.json`;
path.parse(caleaCatreFisier).base === `fisier.json`; // true
path.parse(caleaCatreFisier).name === `fisier`; // true
path.parse(caleaCatreFisier).ext === `.json`; // true
```

Vezi documentația de la https://nodejs.org/api/path.html#path_path_parse_path.

## fs.readFile(path[, options], callback)

A lucra cu un fișier în Node.js folosind modulul `fs`, implică crearea automată a unui obiect `Buffer` în care este trimis conținutul fișierului. Ferește-te de citirea unor fișiere în mod sincron (`fs.readFileSync(__dirname + '/nume_fisier.txt', 'utf8')`) pentru că acest lucru va bloca firul de execuție. Făcând același lucru, vei creaa obiecte `Buffer` de mari dimensiuni.

```javascript
var resursă = fs.readFile(__dirname + 'fisier.txt', function (error, date) {
  // facem ceva cu fișierul
});
```

Datele de lucru în cazul funcțiilor de citire asincrone, vor returna un `Buffer`. Dacă menționezi standardul de codare al caracterelor, ceea ce va trimite ca date în callback va fi chiar textul resursei.

Folosirea acestei metode de a citi datele unui fișier, va încărca întreg fișierul în memorie. În cazul în care se va lucra cu fișiere de mari dimensiuni, este indicat să se folosească `fs.createReadStream`.

### Promisificare fs.readFile

În cazul în care ai nevoie să trasformi metoda într-o promisiune, pur și simplu va trebui să creezi o funcție care să fie respectiva promisiune.

```javascript
function readFilePromise (caleFisier) {
  // creează și returnează un obiect promisiune
  return new Promise( function (resolve, reject) {         // funcția anonimă inițiază operațiunea asincronă
    fs.readFile(caleFisier, "utf8", function (err, data) { // operațiunea de încărcare este gestionată de un callback
      if (err) {
        reject(err);
        return;
      }
      resolve(data); // promisiunea este rezolvată cu succes și este apelat automat următorul then din lant
    });
  });
};
```

Funcția creată este un ambalaj pentru fișierul care se va încărca asincron în promisiune.

## Adăugarea datelor într-un fișier

Atunci când deja ai un fișier la care dorești să adaugi date, vei folosi metoda `fs.appendFile`. Această metodă funcționează *asincron*. Dacă fișierul țintă nu există, acesta va fi creat. Datele pot fi un șir de caractere sau un obiect `Buffer`. Metoda primește patru argumente posibile, ultimul fiind un callback. Dacă nu este trimis un callback va fi ridicată o stare de eroare.

- calea către resursă care poate fi un șir de caractere, un buffer, un obiect URL sau un număr,
- datele care pot fi șir sau `Buffer`,
- un obiect cu opțiuni: `encoding (Default: 'utf8'), mode (Default: 0o666), flag (Default: 'a'`, însemnând deschide fișierul pentru adăugare de date, iar dacă nu există, creează-l),
- un callback, care trebuie să-i fie pasat drept prim argument `err`.

```javascript
fs.appendFile('fisier.txt', 'datele de adăugat', (err) => {
    if (err) {throw err};
    console.log('Am terminat de adăugat datele');
});
```

Calea poate fi și un `file descriptor`. În acest caz, adu-ți mereu aminte să-l închizi.

```javascript
fs.open('fisier.txt', 'a', (err, fd) => {
  if (err) {throw err};
  fs.appendFile(fd, 'date de adaugat', 'utf8', (err) => {
    fs.close(fd, (err) => {
      if (err) {throw err};
    });
    if (err) {throw err};
  });
});
```

## Modificarea permisiunilor unui fișier

Metoda `fs.chmod` modifică în mod asincron permisiunile unui fișier.

## fs.watch

În anumite scenarii este necesară urmărirea unui fișier pentru a detecta modificări care pot apărea. În acest sens, `fs` are metoda `watch()`, care are drept sarcină semnalarea oricărei modificări care apare.

```javascript
const​ fs = require(​'fs'​);
​fs.watch(​'fisier.txt'​, () => console.log(​'S-a modificat!'​));
```

## Lucrul cu streamurile

Modulul `fs` este modulul cu ajutorul căruia putem lucra cu stream-urile în NodeJS. Stream-urile în NodeJS se bazează pe lucrul cu evenimente pentru că stream-urile implementează clasa `EventEmitter`. Pe cale de consecință, atunci când apar datele, poți atașa un listener, un callback care să facă ceva cu acele date. Pentru a exemplifica, cel mai bine ar fi să creăm un stream folosind metoda dedicată a modulului `fs` : `fs.createWriteStream`. Mai întâi de a porni este necesar să trecem prin descrierea metodei `fs.createWriteStream`. Această metodă primește următoarele argumente posibile:

- o **cale** care specifică resursa. Această cale poate fi un șir, un buffer sau un obiect url;
- o opțiune din mai multe posibile sau un obiect în cazul în care dorești mai multe opțiuni să influențeze crearea acestui stream.

Opțiunile posibile pe care le poți invoca au valori de start, care trebuie menționate pentru a înțelege configurarea stream-ului așa cum este el oferit de Node:

- *flags* (un șir de caractere), valoarea default: `w`;
- *encoding* - codarea caracterelor (un șir de caractere), valoare default fiind `utf8`;
- *fd* - file descriptor (un număr întreg), valoarea default fiind `null`;
- *mode* (un număr întreg), valoarea default fiind `0o666`;
- *autoClose* (boolean), valoarea default fiind `true`;
- *start* (un număr întreg).

```javascript
var fs = require('fs');
var streamDeCitire = fs.createReadStream('ceva.txt', 'utf8');
var datele = '';

streamDeCitire.on('data', function (fragment) {
  datele += fragment;
});

streamDeCitire.on('end', function () {
  console.log(datele);
});
```

Întrebarea de bun început este următoarea: când încep datele să *curgă*? De îndată ce se atașează un eveniment `data` apar și datele în stream. După acest moment inițial,fragmente de date sunt pasate rând pe rând cu o frecvență decisă de API-ul care implementează stream-ul (de exemplu, poate fi HTTP-ul). Atunci când nu mai sunt fragmente de date, stream-ul emite un eveniment `end`.
Folosind metoda `read()` pe stream-ul readable avem posibilitatea de a citi în calupuri datele stream-ului, dacă acest lucru este necesar.

```javascript
var fs = require('fs');
var streamDeCitire = fs.createReadStream('ceva.txt', 'utf8');
var datele = '';
var calup;

streamDeCitire.on('readable', function () {
  while ((calup = streamDeCitire.read()) != null) {
    datele += calup;
  };
});

streamDeCitire.on('end', function () {
  console.log(datele);
});
```

Metoda `read()` preia datele dintr-un buffer și le returnează. Datele pe care le citește un stream sunt cele dintr-un obiect `Buffer`. Atunci când nu mai este nimic în buffer, va returna `null`. Acesta este și motivul pentru care bucla din exemplu va testa după `null`. Mai trebuie adăugat că evenimentul `readable` va fi emis atunci când un fragment de date este citit din stream. În cazul în care datele sunt text, pentru a le putea folosi la fel, trebuie specificat standardul de codare.

## Transformarea stream-urilor

```javascript
var fs     = require('fs');
var path   = require('path');
var stream = require('stream');

var inFile = path.join(__dirname, 'dateprimare.txt'),
    outFile = path.join(__dirname, 'dateprelucrate.txt');

var transformare = new stream.Transform({
  transform: function (fragment) {
    this.push(fragment.toString().toUpperCase());
  }
});

var inStream = fs.createReadStream(inFile),
    outStream = fs.createWriteStream(outFile);
// inStream -> transformare -> outStream
inStream.pipe(transformare);
transformare.pipe(outStream);
```

## Piping

Piping-ul este un mecanism prin care citești date dintr-o sursă și le scriem în altă parte.

```javascript
var fs = require('fs');
var streamDeCitire = fs.createReadStream('ceva.txt');
var streamDeScriere = fs.createWriteStream('altceva.txt');
streamDeCitire.pipe(streamDeScriere);
```

Metoda `pipe()` returnează stream-ul destinație.

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

Pentru a reduce încărcarea serverului și pentru a eficientiza trimiterea datagramelor pe rețea, se pot folosi din nou stream-urile în lucrul cu serverele web. Trebuie să ne amintim de faptul că stream-urile implementează clasa `EventEmitter`, ceea ce le face pretabile lucrului în paradigma evenimentelor.

```javascript
var http = require('http'),
    fs   = require('fs');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/fisier.json');
    stream.pipe(res);
});
server.listen(3000);
```

Ceea ce trebuie să înțelegi este faptul că `req` și `res` sunt niște obiecte, care au ca principiu de funcționare intern stream-urile. În cazul nostru, am creat un stream care citește (*Read*) stream-ul și apoi, l-am *racordat* folosind metoda `pipe()` la obiectul răspuns. Metoda `.pipe()` va avea grijă de evenimentele `date` și `end` care apar în momentul în care folosești `fs.createReadStream(__dirname + '/fisier.json');`.

### fs.createReadStream

Este o metodă a modului `fs` care *consumă* o resursă folosind bufferul. Metoda acceptă drept prim parametru o cale către resursă, care poate fi un șir de caractere, un obiect URL sau chiar un buffer.

Al doilea parametru poate fi un obiect care poate avea următorii membri pentru setarea stream-ului:

-   *flags* - default: `r`,
-   *encoding* - default: `null`,
-   *fd* - default: `null`,
-   *mode* - default: `0o666`,
-   *autoClose* - default: `true`,
-   *start* - default: număr întreg,
-   *end* - default: `Infinity`,
-   *highWaterMark*, fiind un număr întreg cu un default: 64 * 1024.

Dacă al doilea parametru este un șir, acesta va specifica schema de codare a caracterelor. Cel mai uzual este `utf8`.

Metoda `fs.createReadStream()` oferă posibilitatea de a citi un stream de date.

```javascript
var fs = require('fs');
var unStreamReadable = fs.createReadStream(__dirname + '/fisier.csv', 'utf8');
```

Pentru că toate stream-urile sunt instanțe ale clasei `EventEmitter`, va trebui să avem o funcție pe care să o folosim pe post de receptor, care va asculta dacă au venit date pe stream sau nu. Dacă standardul de codare al caracterelor nu este menționat, atunci, ceea ce vei citi din buffer sunt reprezentarea a datelor așa cum sunt ele stocate în buffer. Odată menționat, de exemplu, `utf8`, poți vedea în clar textul din fișier.

```javascript
unStreamReadable.on('data', function (fragment) {
  // fragment reprezintă date acumulate în buffer.
  // fă ceva cu fragmentul de date
});
```

Întreaga resursă de date va fi consumată de `stream`-ul nostru *readable*. De fiecare dată când un fragment din `Buffer` este trimis, se declanșează execuția callback-ului. După prelucrarea fragmentului anterior, se va primi un alt fragment, care va fi prelucrat și tot așa până la consumarea întregii resurse.

### fs.createWriteStream(path[,options])

Această metodă oferă posibilitatea de a constitui un `stream` prin care să trimitem date într-o resursă.

Drept prim parametru trebuie să indicăm o *cale* care poate fi un `string`, un `Buffer` sau un URL. Al doilea parametru poate fi un obiect sau un `string` cu opțiuni.

```javascript
var fs   = require('fs');
var date = 'aceste caractere vor fi scrise într-un fișier';
var wStr = fs.createWriteStream('ceva.txt');
wStr.write(date, (err) => {
    if (err) {throw err};
    console.log('datele au fost scrise');
});
```

De fiecare dată când scriptul va fi rulat, dacă fișierul deja există, conținutul acestuia va fi suprascris. Dacă fișierul nu există, acesta va fi creat.

## Resurse

- [fs, Node.js v12.3.1 Documentation](https://nodejs.org/api/fs.html)
- [Using Node.js to Read Really, Really Large Datasets & Files (Pt 1)](https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33)
