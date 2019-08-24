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

<<<<<<< HEAD
## Obținerea datelor despre un fișier cu `fs.open(cale[,options],cb)`

Pentru a proiecta o succesiune de oprațiuni cu un anumit fișier, mai întâi trebuie să culegem îndeajuns de multe informații despre acesta.

=======
## Obținerea datelor despre un fișier folosind un descriptor

Pentru a proiecta o succesiune de oprațiuni cu un anumit fișier, mai întâi trebuie să culegem îndeajuns de multe informații despre acesta.

### Crearea unui descriptor folosind `fs.open(cale[,options],cb)`

>>>>>>> master
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

<<<<<<< HEAD
## Adăugarea datelor într-un fișier cu `fs.appendFile(path, data[, options], callback)[src]`
=======
### Închiderea unui descriptor `fs.close(fd, callback)`

După lucrul cu file descriptorul trebuie neapărat să-l închizi.

## Adăugarea datelor într-un fișier
>>>>>>> master

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

<<<<<<< HEAD
## Modificarea permisiunilor unui fișier `fs.watch(filename[, options][, listener])`
=======
## Supravegherea unui fișier cu `fs.watch()`
>>>>>>> master

Metoda `fs.chmod` modifică în mod asincron permisiunile unui fișier.

În anumite scenarii este necesară urmărirea unui fișier pentru a detecta modificări care pot apărea. În acest sens, `fs` are metoda `watch()`, care are drept sarcină semnalarea oricărei modificări care apare.

```javascript
const​ fs = require(​'fs'​);
​fs.watch(​'fisier.txt'​, () => console.log(​'S-a modificat!'​));
```

<<<<<<< HEAD
## Lucru cu streamuri

## `fs.createReadStream()`
=======
## Testarea permisiunii de acces - `fs.access(path[, mode], callback)`

Metoda va testa dacă utilizatorul are permisiunea de a accesa fișierul sau directorul specificat de cale.

Această metodă primește drept argumente:
- calea către fișier (string, Buffer sau URL),
- modul (număr întreg) în care se face accesul. Valoarea din oficiu este `fs.constants.F_OK`
- o funcție cu rol de callback care primește un obiect de eroare.

Modul specifică care verificări vor trebui făcute pentru a evalua nivelul de accesibilitate. Aceste valori sunt specificate în secțiunea dedicată constantelor, mai jos *File Access Constants*. Folosindu-te de aceste constate, vei putea crea adevărate măști de acces folosind bitwise OR-ul pe două sau mai multe valori (`fs.constants.W_OK | fs.constants.R_OK`).

### Verifică dacă fișierul există în directorul curent

```javascript
const file = 'package.json';
fs.access(file, fs.constants.F_OK, (err) => {
  console.log(`${file} ${err ? 'Fișierul nu există' : 'există'}`);
});
```

### Verifică dacă fișierul poate fi citit

```javascript
fs.access(file, fs.constants.R_OK, (err) => {
  console.log(`${file} ${err ? 'Nu poate fi citit' : 'poate fi citit'}`);
});
```

### Verifică dacă fișierul poate fi scris

```javascript
fs.access(file, fs.constants.W_OK, (err) => {
  console.log(`${file} ${err ? 'nu poate fi scris' : 'poate fi scris'}`);
});
```

### Verifică dacă fișierul folosind o mască

Folosind constantele poți crea un adevărat filtru - o *mască* - după care poți investiga un fișier.

```javascript
fs.access(file, fs.constants.F_OK | fs.constants.W_OK, (err) => {
  if (err) {
    console.error(
      `${file} ${err.code === 'ENOENT' ? 'nu există' : 'este doar read-only'}`);
  } else {
    console.log(`${file} există și poate fi scris.`);
  }
});
```

### Precizări la folosirea lui `fs.access()`

Folosirea metodei `fs.access()` înaintea apelării metodelor `fs.open()`, `fs.readFile` sau `fs.writeFile()` nu este recomandată pentru că introduce condiții de concurență cu alte procese ale sistemului de operare, care ar avea nevoie să lucreze cu acel fișier. Algoritmul de lucrul cu fișierele pe care documentația îl recomandă este cel al deschiderii, citirii și scrierii fișierului în mod direct. Erorile se vor trata în funcție de cele apărute în aceste etape.

#### Model de scriere recomandat

```javascript
fs.open('fișierul', 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('fișierul există deja');
      return;
    }

    throw err;
  }

  scrieDatele(fd);
});
```

#### Model de citire recomandat

```javascript
fs.open('fișierul', 'r', (err, fd) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('fișierul nu există');
      return;
    }

    throw err;
  }

  citeșteDatele(fd);
});
```

Este recomandată folosirea directă a fișierelor și tratarea erorilor provenite din aceste operațiuni.

Verificarea accesibilității unui fișier se va face dacă nu se va lucra cu acesta în aceiași pași algoritmici.

### Varianta sincronă este `fs.accessSync(path[, mode])`

```javascript
try {
  fs.accessSync('etc/passwd', fs.constants.R_OK | fs.constants.W_OK);
  console.log('pot citi/scrie');
} catch (err) {
  console.error('nu am acces');
}
```

## Adăugarea datelor într-un fișier - `fs.appendFile(path, data[, options], callback)`

Această metodă permite adăugarea asincronă a datelor într-un fișier. În cazul în care fișierul nu există, acesta va fi creat. Datele pot fi string sau Buffer.

```javascript
fs.appendFile('datele.csv', '1, nume, prenume', 'utf8', (err) => {
  if (err) throw err;
  console.log('Am adăugat în fișier următoarea linie: "1, nume, prenume"');
});
```

### Analiza argumentelor

#### `path`

Calea poate fi un *șir de caractere*, poate fi un *Buffer*, un *URL* sau un *număr* al unui file descriptor. În cazul în care folosești un file descriptor, acesta poate fi generat folosind metoda `fs.open()`. Fii foarte atentă pentru că acest file descriptor va trebui închis manual.

```javascript
fs.open('date.csv', 'a', (err, fd) => {
  if (err) throw err;
  fs.appendFile(fd, '1, nume, prenume', 'utf8', (err) => {
  	// faci operațiunile necesare și apoi închizi file descriptorul (fd)
    fs.close(fd, (err) => {
      if (err) throw err;
    });
    if (err) throw err;
  });
});
```

#### `data`

Sunt datele care vor fi scrise în fișier. Aceste pot fi string sau Buffer.

#### `options`

Acestea sunt câteva posibile opțiuni, care pot fi specificate ca obiect sau ca string.

- `encoding` este menționat ca string, iar valoarea din oficiu este `utf8`. Poți introduce și `null`, dacă nu vrei să precizezi encoding-ul;
- `mode` este o valoare de număr întreg. Valoarea din oficiu find `0o666`.
- `flag` este de tip string, având valoarea din oficiu `a`.

#### funcția callback

Această funcție primește obiectul de eroare ca prim argument.

## Modificarea permisiunilor cu `fs.chmod(path, mode, callback)`

Această metodă poate schimba în mod asincron permisiunile unui fișier.

Drept argumente primește:
- o cale, care poate fi string, Buffer sau URL;
- modul, care este un număr întreg - masca de permisiuni;
- o funcție callback, care primește primul argument un obiect de eroare.

```javascript
fs.chmod('datele.csv', 0o775, (err) => {
  if (err) throw err;
  console.log('Permisiunile pentru fișierul "datele.csv" au fost schimbate');
});
```

### Modurile în care se poate afla un fișier

Modul este o mască care indică permisiunile unui fișier.

| Constantă              | Reprezentare octală | Descriere                                                    |
| ---------------------- | ------------------- | ------------------------------------------------------------ |
| `fs.constants.S_IRUSR` | `0o400`             | poate fi citit de posesor                                    |
| `fs.constants.S_IWUSR` | `0o200`             | poate fi scris de posesor                                    |
| `fs.constants.S_IXUSR` | `0o100`             | poate fi executat sau se poate face o căutare în el de către posesor. |
| `fs.constants.S_IRGRP` | `0o40`              | poate fi citit de grup                                       |
| `fs.constants.S_IWGRP` | `0o20`              | poate fi scris de grup                                       |
| `fs.constants.S_IXGRP` | `0o10`              | poate fi executat sau se poate face o căutare în el de către grup. |
| `fs.constants.S_IROTH` | `0o4`               | poate fi citit de alții                                      |
| `fs.constants.S_IWOTH` | `0o2`               | poate fi scris de alții                                      |
| `fs.constants.S_IXOTH` | `0o1`               | poate fi executat sau se poate face o căutare în el de alții. |

Mai simplu, se poate folosi trei digiți cu valori octale. Cel mai din stânga digit indică permisiunile celui care posedă fișierul. Cel din mijloc specifică permisiunile pentru grup, iar cel mai din dreapta indică permisiunile tuturor celorlalți.

| Număr | Descriere              |
| ----- | ---------------------- |
| 7     | read, write și execute |
| 6     | read și write          |
| 5     | read și execute        |
| 4     | read only              |
| 3     | write și execute       |
| 2     | write only             |
| 1     | execute only           |
| 0     | fără permisiuni        |

De exemplu, prin valoarea octală `0o765`:

- posesorul fișierului poate scrie, citi și executa;
- grupul poate citi și scrie;
- ceilalți pot citi și executa fișierul.

În cazul sistemelor Windows, se poate modifica doar permisiunea de scriere.

### `fs.fchmod(fd, mode, callback)`

Este o metodă care modifică permisiuni în cazul în care este folosit un file descriptor.

## Modificarea celui care deține fișierele prin `fs.chown(path, uid, gid, callback)`

Această metodă este folosită pentru a modifica cine deține fișierele și grupul.

Calea - `path` poate fi un `string`, un `Buffer` sau un `URL`.

`uid` - ul este un număr întreg și la fel este și `gid`-ul.

### `fs.fchown(fd, uid, gid, callback)`

Este o metodă care modifică owneship-ul în cazul în care este folosit un file descriptor.

## Crearea unui director cu `fs.mkdir(path[, options], callback)[src]`

Această metodă creează un director într-o manieră asincronă. Apelarea metodei atunci când ai un `path` care indică un director care există, rezultă într-o eroare doar atunci când `recursive` este `false`.

```javascript
// Crearea unui director /tmp/a/apple indiferent dacă `/tmp` sau /tmp/a există.
fs.mkdir('/tmp/a/apple', { recursive: true }, (err) => {
  if (err) throw err;
});
```

Executarea acestei operațiuni pe sistemul de operare Windows folosind `/` la cale, va rezulta într-o eroare.

## Crearea unui director temporar cu `fs.mkdtemp(prefix[, options], callback)`

Metoda creează un director temporar unic. Metoda generează șase caractere aleatorii care să fie adăugate prefixului specificat pentru a crea un director temporar. Calea formată este pasată ca al doilea parametru funcției cu rol de callback. 

## Copierea fișierelor cu `fs.copyFile(src, dest[, flags], callback)`

Această metodă copiază într-un mod asincron un fișier sursă. Dacă fișierul destinație deja există, acesta va fi suprascris.

```javascript
const fs = require('fs');
// destinație.txt va fi creat sau suprascris din oficiu.
fs.copyFile('sursă.txt', 'destinație.txt', (err) => {
  if (err) throw err;
  console.log('sursă.txta fost copiat în destinație.txt');
});
```

Argumentele pe care metoda le acceptă sunt:

- `src` fiind numele fișierului sursă care va fi copiat. Acesta poate fi un string, un Buffer sau un URL;
- `dest` fiind numele fișierului destinație. Acesta poate fi un string, un Buffer sau un URL;
- `flags` este un număr care modifică regimul drepturilor în caz că acest lucru este necesar. Valoarea din oficiu, fiind `0`.
- funcția cu rol de callback.

În cazul în care a apărut o eroare după ce a fost deschis pentru scriere fișierul destinație, Node.js va șterge destinația.

Pentru flags se mai pot folosi câteva valori opționale cu ajutorul cărora poți modela comportamentul la momentul copierii:

- `fs.constants.COPYFILE_EXCL` indică faptul că operațiunea de copiere va eșua dacă fișierul destinație deja există;
- `fs.constants.COPYFILE_FICLONE` indică încercarea de a implementa un mecanism *copy-on-write reflink*. Dacă platforma nu are suport pentru *copy-on-write*, va fi folosit un subsistem.
- `fs.constants.COPYFILE_FICLONE_FORCE` indică încercarea de a implementa un mecanism *copy-on-write reflink*. Dacă platforma nu are suport pentru *copy-on-write*, operațiunea de copiere va eșua.

```javascript
const fs = require('fs');
const { COPYFILE_EXCL } = fs.constants;

// Prin folosirea COPYFILE_EXCL, operațiunea va eșua dacă destinație.txt există
fs.copyFile('sursă.txt', 'destinație.txt', COPYFILE_EXCL, callback);
```

## Streamuri cu `fs`

Modulul `fs` oferă posibilitatea de a lucra cu stream-uri. Astfel, pot fi create streamuri read și write.

### Crearea unui stream dintr-un fișier cu `fs.createReadStream()`
>>>>>>> master

Este o metodă a modului `fs` care *consumă* o resursă folosind bufferul. Metoda acceptă drept prim parametru o cale către resursă, care poate fi un șir de caractere, un obiect URL sau chiar un buffer.

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
În cazul în care este menționat în opțiuni un file descriptor (`fd`), dar este omisă valorarea `start` sau are valoarea `undefined`, se va citi secvențial de la poziția curentă în care se află fișierul.

În cazul în care este prezent un file descriptor, metoda va ignora argumentul `path` folosind file descriptorul. Acest lucru implică faptul că nu va fi emis niciun eveniment `open`, iar `fd` ar trebui să fie blocking (de ex. tastatură sau placa de sunet). Cele non blocking ar trebui pasate lui `net.Socket`.

Metoda `fs.createReadStream()` oferă posibilitatea de a citi un stream de date dintr-un fișier.

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

### Stream către un fișier - `fs.createWriteStream(path[,options])`

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

<<<<<<< HEAD
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
=======
## Constantele Sistemului de Fișiere

Contantele sunt exportate ca `fs.constants`. Aceste constante diferă în funcție de sistemul de fișiere.

### File Access Constants

| Constantă | Descriere                                                    |
| --------- | ------------------------------------------------------------ |
| `F_OK`    | Indică faptul că fișierul este disponibil procesului care are nevoie de el. Acesta indică că fișierul există, dar nu spune absolut nimic despre permisiuni `rwx`. Este modul din oficiu. |
| `R_OK`    | Indică faptul că fișierul poate fi citit de procesul care îl apelează. |
| `W_OK`    | Indică faptul că fișierul poate fi scris de procesul care îl apelează. |
| `X_OK`    | Indică faptul că fișierul poate fi executat de procesul care îl apelează. Nu are efect pe Windows (același comportament precum cel al lui `F_OK`). |

### File System Flags

Flag-urile disponibile, care pot fi pasate ca string:

- `a` - deschide fișierul pentru a-i fi adăugate date. Fișierul este creat dacă nu există;
- `ax` - are același comportament precum `a`, dar eșuează dacă acea cale există;
- `a+` - deschide fișierul pentru citire și appending. Acest fișier este creat dacă nu există;
- `ax+` - are același comportament precum `a+`, dar eșuează dacă acea cale există;
- `as` - deschide fișierul pentru a i se adăuga date în mod sincron. Fișierul este creat dacă nu există;
- `as+` - deschide fișierul pentru a se citi și adăuga date în mod sincron. Fișierul este creat dacă nu există;
- `r` - deschide fișierul pentru a fi citit. Apare o excepție dacă fișierul nu există;
- `r+` - deschide fișierul pentru a citi și a scrie în el. Apare o excepție dacă fișierul nu există;
- `rs+` - deschide fișierul pentru citire și scriere în mod sincron. Instruiește sistemul de operare să treacă peste sistemul de caching local. Este folositor pentru sisteme NFS și are un impact privind performanțele I/O. Se va folosi doar dacă este neapărată nevoie.
- `w` - deschide fișierul pentru a se putea scrie. Fișierul poate fi creat (dacă nu există) sau poate fi trunchiat (dacă există).
- `wx` - același comportament precum `w`, dar nu va acționa dacă deja calea există;
- `w+` - deschide un fișier pentru citire/scriere. Fișierul este creat dacă nu există sau trunchiat dacă există.
- `wx+` - același comportament precum `w+`, dar eșuează dacă există calea.

>>>>>>> master

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
