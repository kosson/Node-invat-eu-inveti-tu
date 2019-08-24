# Modulul `fs`

Acest modul oferă un adevărat API prin care se realizează interacțiunea cu sistemul de fișiere al mașinii gazdă. Operațiunile de lucru cu sistemul de fișiere pot avea un aspect sincron și unul asincron, privind la modul în care se pot desfășura operațiunile. Ceea ce face Node.js este un ambalaj al funcțiilor POSIX.

Pentru a folosi acest modul, trebuie să-l ceri cu `require('fs')`.

Node.js oferă două variante pentru majoritatea operațiunilor cu sistemul de operare. Una este sincronă și alternativa fiind asincronă. Pentru a nu bloca *event loop*, este recomandată folosirea variantei asincrone întotdeauna. În cazul utilizării asincrone, va trebui introdus un callback, care să acompanieze acțiunea. Ca exemplu, avem o acțiune de ștergere a unui director.

```javascript
const fs = require('fs');

fs.unlink('/cale/director', (err) => {
  if (err) {
    return console.log(err);
  };
  console.log('am șters directorul indicat');
});
```

În cazul operațiunilor asinrone, primul argument pasat funcțiilor cu rol de callback, este unul rezervat semnalării cazurilor de excepție. Dacă operațiunea s-a încheiat cu succes, valoarea primului argument va fi `null` sau `undefined`. Aceasta este chiar o marcă a modului în care lucrează Node.js.

În cazul operațiunilor sincrone, pentru a *prinde* erorile, se poate folosi constructul `try...catch`.

```javascript
const fs = require('fs');

try {
  fs.unlinkSync('/tmp/hello');
  console.log('Gata, l-am șters!');
} catch (err) {
  // handle the error
}
```

Documentația atrage atenția asupra ordinii operațiunilor asicrone în cazul în care am avea situații în care ar trebui să fie urmat un algoritm de lucru. Prin natura operațiunilor asincrone, nu poți ști care operațiune se va încheia mai repede decât alta. Pentru a putea fi asigurat un anumit nivel de predictibilitate, se recomandă ca operațiunile care urmează uneia, să fie puse în callback-ul primei.

```javascript
fs.rename('/tmp/hello', '/tmp/world', (err) => {
  if (err) throw err;
  fs.stat('/tmp/world', (err, stats) => {
    if (err) throw err;
    console.log(`stats: ${JSON.stringify(stats)}`);
  });
});
```

## Lucrul pe căile sistemului

Căile sistemului de operare sunt necesare pentru a accesa resursele. Acestea sunt oferite metodelor modulului `fs` drept parametru și pot fi un șir de caractere (secvențe de caractere codate UTF8), un obiect `Buffer` sau un obiect URL care folosește protocolul `file:`.

### Procesarea căilor pentru a extrage datele relevante

Procedura de a extrage informațiile utile despre fișiere.

```javascript
let caleaCatreFisier = `/director/fisier.json`;
path.parse(caleaCatreFisier).base === `fisier.json`; // true
path.parse(caleaCatreFisier).name === `fisier`; // true
path.parse(caleaCatreFisier).ext === `.json`; // true
```

Vezi documentația de la https://nodejs.org/api/path.html#path_path_parse_path.

### Căi relative

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

## Fișiere

În cazul sistemelor de operare care respectă standardul POSIX, pentru fiecare proces, sistemul ține o tabelă cu toate fișierele deschise și toate resursele accesate. Fiecărui fișier deschis îi este atribuit un identificator numit **file descriptor**. Pentru a rezolva problemele de compatibilitate între sistemele POSIX și Windows, Node.js abstractizează operațiunile cu resursele atribuind tuturor fișierelor deschise câte un descriptor numeric. Acest lucru se petrece ori de câte ori este folosită metoda `fs.open()`. Din momentul în care un fișier este deschis cu `fs.open()`, vom putea citi fișierul, vom putea scrie date în el și vom avea acces la informații despre acesta.

```javascript
fs.open('/open/some/fisier.txt', 'r', (err, fd) => {
  if (err) throw err;
  fs.fstat(fd, (err, stat) => {
    if (err) throw err;
    // operațiuni

    // Închide întotdeauna file descriptor-ul
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });
});
```

Modulul `fs` pune la dispoziție și metodele necesare lucrului cu stream-uri. Pentru a dezvolta acest aspect foarte important, vezi materialele dedicate stream-urilor.

### Protocolul file

Calea de acces la o resursă pe disc se poate face și utilizând un obiect URL de tipul WHATWG. Suportul este oferit doar pentru obiectele care folosesc protocolul `file:`.

```javascript
const fs = require('fs');
const fileUrl = new URL('file:///tmp/hello');

fs.readFileSync(fileUrl);
```

Obiectele URL vor fi întotdeauna căi absolute.

## Citirea unui fișier cu `fs.readFile(path[, options], callback)`

A lucra cu un fișier în Node.js folosind modulul `fs`, implică crearea automată a unui obiect `Buffer` în care este trimis conținutul fișierului. Ferește-te de citirea unor fișiere în mod sincron (`fs.readFileSync(__dirname + '/nume_fisier.txt', 'utf8')`) pentru că acest lucru va bloca firul de execuție. Un argument în plus pentru a nu lucra cu varianta sincronă este acela că se vor crea obiecte `Buffer` de mari dimensiuni.

```javascript
var resursă = fs.readFile(__dirname + 'fisier.txt', function (error, date) {
  // facem ceva cu fișierul
});
```

Datele de lucru în cazul funcțiilor de citire asincrone, vor returna un `Buffer`. Dacă menționezi standardul de codare al caracterelor, ceea ce va trimite ca date în callback va fi chiar textul resursei.

Folosirea acestei metode de a citi datele unui fișier, va încărca întreg fișierul în memorie. În cazul în care se va lucra cu fișiere de mari dimensiuni, este indicat să se folosească `fs.createReadStream`.

### Promisificare `fs.readFile`

Promisiunile au fost introduse de ES6 în anul 2015, dar nu toate API-urile Node.js implementează pe deplin promisiunile. Mare parte din operațiunile asincrone se desfășoară folosind callback-uri. Acest lucru nu ne împiedică totuși să implementăm promisiunile, care sunt compatibile cu mecanismele callback ale Node.js.
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
readFilePromise('/biblioteci-judetene.json').then( biblioteci => {
  console.log(biblioteci.nume);
}).catch(eroare => {
  throw new Error('A apărut: ', eroare.message);
});
```

Funcția creată este un ambalaj pentru fișierul care se va încărca asincron în promisiune. Ceea ce s-a realizat este constituirea unei promisiuni prin evaluarea expresiei `readFilePromise('/biblioteci-judetene.json')`. Astfel, se vor putea înlănțui metodele specifice.

În cazul în care este necesară o soluție de-a gata, există un pachet în depozitul `npm` numit `fs-extra`.

## Obținerea datelor despre un fișier cu `fs.open(cale[,options],cb)`

Pentru a proiecta o succesiune de oprațiuni cu un anumit fișier, mai întâi trebuie să culegem îndeajuns de multe informații despre acesta.

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

## Adăugarea datelor într-un fișier cu `fs.appendFile(path, data[, options], callback)[src]`

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

## Modificarea permisiunilor unui fișier `fs.watch(filename[, options][, listener])`

Metoda `fs.chmod` modifică în mod asincron permisiunile unui fișier.

În anumite scenarii este necesară urmărirea unui fișier pentru a detecta modificări care pot apărea. În acest sens, `fs` are metoda `watch()`, care are drept sarcină semnalarea oricărei modificări care apare.

```javascript
const​ fs = require(​'fs'​);
​fs.watch(​'fisier.txt'​, () => console.log(​'S-a modificat!'​));
```

## Lucru cu streamuri

## `fs.createReadStream()`

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

## `fs.createWriteStream(path[,options])`

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

## Lucrul cu file descriptorii

### Flashing a datelor pe disc cu `fs.fdatasync(fd, callback)`

Această metodă este un wrapper pentru comanda corespondentă din sistemele UNIX. Scopul folosirii acesteia este de a reduce activitatea discului pentru aplicațiile care nu au nevoie de toate metadatele sincronizate cu discul.

Referința și datele care prezintă modul de funcționare, pot fi accesate de la manualul funcției cu rol similar [`fdatasync()`](http://man7.org/linux/man-pages/man2/fdatasync.2.html) a sistemelor de operare UNIX. Această comandă va transfera *flushing* toate datele care au fost modificate *in-core* (adică cele în cache-urile bufferelor) în fișierul referit de fd (file descriptor) de pe mediul de stocare. Acest lucru se face în situațiile în care informația trebuie salvată în caz că sistemul suferă o întrerupere sau o stare de eroare, care ar conduce la pierderea lor. În fapt este un flushing al cache-ului discului, dacă acesta există. În cazul operațiunii `fsync()` în cazul sistemelor UNIX, la momentul în care se face flushing-ul, se vor trimite pe disc și metadatele actualizate. În cazul lui `fdatasync()`, nu trimite metadatele modificate cu excepția cazului în care acestea sunt necesare unei accesări subsecvente a datelor pentru a asigura corecta gestionare a acestora.

### Obținerea de informații despre un fișier cu `fs.fstat(fd[, options], callback)`

Această metodă oferă informații despre un fișier în baza file descriptorului acestuia. Funcția cu rol de callback primește un al doilea argument, care este un obiect `fs.Stats`.  Pentru mai multe detalii, consultă și informațiile despre comanda UNIX [`fstat()`](http://man7.org/linux/man-pages/man2/fstat.2.html).

Obiectul la care are acces callback-ul are proprietăți explicate în informațiile privind clasa `fs.Stats`.

### Trunchierea dimensiunii unui fișier la o anumită dimensiune cu `fs.ftruncate(fd[, len], callback)`

Această metodă este un wrapper pentru funcția UNIX [`ftruncate()`](http://man7.org/linux/man-pages/man2/ftruncate.2.html). Dimensiunea `len` este precizată ca număr întreg și valoarea sa din oficiu este `0`.

Dacă fișierul referit de `fd` este mai mare de numărul bytes-ilor specificați prin `len`, doar cei specificați prin `len` vor fi reținuți și astfel se va redimensiona fișierul.

```javascript
console.log(fs.readFileSync('temp.txt', 'utf8'));
// Conținutul fișierului text este: „Node.js”

// Obține file descriptor pentru fișierul care va fi trunchiat
const fd = fs.openSync('temp.txt', 'r+');

// Trunchiezi fișierul să conțină doar primii 4 bytes ai celui original
fs.ftruncate(fd, 4, (err) => {
  assert.ifError(err);
  console.log(fs.readFileSync('temp.txt', 'utf8'));
});
// Conținutul fișierului text va fi acum „Node”
```

În cazul în care fișierul este mai scurt decât dimensiunea în bytes specificată, conținutului existent în bytes i se va adăuga  null bytes `\0`.

### Modificarea timestamp-ului prin `fs.futimes(fd, atime, mtime, callback)`

Această metodă va schimba timestamp-urile fișierului referit prin obiectul referit de file descriptor. Vezi și metoda `fs.utimes()`. 

## Cazuistică

### Utilitar de transformare imagini base64

```javascript
var fs = require('fs');

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

// convert image to base64 encoded string
var base64str = base64_encode('kitten.jpg');
console.log(base64str);
// convert base64 string back to image
base64_decode(base64str, 'copy.jpg');
```

Exemplul a fost preluat de la Stackoverflow - https://stackoverflow.com/questions/28834835/readfile-in-base64-nodejs, care este http://www.hacksparrow.com/base64-encoding-decoding-in-node-js.html.


## Resurse

- [fs, Node.js v12.3.1 Documentation](https://nodejs.org/api/fs.html)
- [Using Node.js to Read Really, Really Large Datasets & Files (Pt 1)](https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33)
