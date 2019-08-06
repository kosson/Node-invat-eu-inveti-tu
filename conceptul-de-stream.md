# Un concept central: stream-uri

Streamurile sunt date care *curg* ca urmare a unui eveniment `EventEmitter` între diferitele părți funcționale ale unui program.

Subiectul `stream`-urilor este legat intim de cel al funcționării sistemelor de operare UNIX. Una din cele mai apreciate facilități ale acestui sistem de operare este capacitatea de a folosi programe mai mici pentru a dezvolta programe mai elaborate. Dar așa cum rândurile de cărămizi sunt legate unele de celelalte prin mortar, așa există și în UNIX un liant foarte puternic numit `pipes`. În română ar fi tradus ca `racorduri`. În folosirea de zi cu zi, aceste racorduri sunt identificabile prin utilizarea caracterului *pipe* <code>&#124;</code>. Pentru a face utiliza racordurile în Node.js, vom folosi `.pipe()`. Datele de input ale unui program sau componentă software sunt datele de output ale alteia. În UNIX, două sau mai multe programe sunt conectate prin caracterul `|`, care în limba engleză se numește `pipe`, iar în română *țeavă*.

Chiar dacă nu suntem programatori de UNIX, vom explora un exemplu de funcționare a mai multor progrămele mici folosite în mod curent într-un terminal, de data aceasta de GNU/Linux.

```bash
ls -l | grep "nicolaie" | sort -n
```

Secvența de mai sus listează numele de fișiere (`ls`) în a căror denumire se găsește fragmentul de text `nicolaie`, după care sortează ceea ce a găsit. Cele trei programe: `ls`, `grep` și `sort` au stabilit un flux de prelucrare, de fapt. Ceea ce a găsit comanda `ls` va fi pasat prin `pipe` (`|`) către următoarea comandă `grep`, care are misiunea de a detecta în toate denumirile tuturor fișierelor din directorul în care se execută fluxul de comenzi, fragmentul de text `nicolaie` și în final, rezultatul va fi pasat prin pipe din nou către ultima comandă `sort`, care va returna spre afișare rezultatul la care s-a ajuns.

Ceea ce merită remarcat este faptul că, fiecare componentă din lanțul de prelucrare, poate fi perceput ca un adevărat filtru.

Douglas McIlroy, unul dintre autorii UNIX-ului, a scris o notă în care surprinde cel mai exact rolul acestor „racorduri” (pipes):

> Ar trebui să avem modalități de a conecta programele precum furtunele din grădină - înfiletezi alt segment atunci când este necesar să masezi datele în alt fel. Aceasta este și calea IO. (Douglas McIlroy, 1964)

**IO** înseamnă In/Out - o paradigmă a intrărilor și a ieșirilor. Intrările și ieșirile în NodeJS au un comportament asincron, ceea ce înseamnă că va trebui pasat un callback care va acționa asupra datelor.

Stream-urile lucrează cu fragmente - **chunks**. Acestea sunt trimise între două puncte de comunicare. Streamurile sunt emitere de evenimente. Acest lucru înseamnă că se poate gestiona lucrul cu acestea atașându-se callback-uri pe diferitele evenimente.

## Lucrul cu streamurile

NodeJS pune la dispoziție două module care fac posibil lucrul cu stream-uri. Primul este modulul `fs` cu ajutorul căruia putem crea stream-uri care citesc date (`createReadStream`) și stream-uri care scriu date (`createWriteStream`). Cel de-al doilea modul este `stream`, care oferă trei metode de lucru: `stream.Readable`, `stream.Writable` și `stream.Transform`.

Stream-urile își dovedesc utilitatea în cazul în care se lucrează cu fișiere de mari dimensiuni, care nu pot fi încărcate în memorie în întregime. Ca să avem o dimensiune a limitării, un fișier CSV sau JSON, care sunt text simplu, pot ocupa o fereastră limitată de memorie de 536MB (limitare impusă de motorul V8 pe care NodeJS îl folosește). Ce se întâmplă atunci când dorești să lucrezi cu fișiere de dimensiuni mai mari, de ordinul gigabiților, de exemplu.

În cazul lucrului cu fișierele de mari dimensiuni, trebuie să privim întregul ca un set de fragmente, care pot fi prelucrate. Uneori, în lucrările de specialitate veți găsri aceste fragmente numite ferestre (*windows*). În NodeJS, acestea sunt numite *bucăți* (*chunks* în lb. engleză).

## Stream-urile se bazează pe evenimente

Stream-urile în Node.js se bazează pe lucrul cu evenimente pentru că stream-urile implementează clasa `EventEmitter`. Pe cale de consecință, atunci când apar datele, poți atașa un listener, un callback care să facă ceva cu acele date. Pentru a exemplifica, cel mai bine ar fi să creăm un stream folosind metoda dedicată a modulului `fs` : `fs.createWriteStream`. Mai întâi de a porni este necesar să trecem prin descrierea metodei `fs.createWriteStream`. Această metodă primește următoarele argumente posibile:

- o **cale** care specifică resursa. Această cale poate fi un șir, un buffer sau un obiect url;
- o opțiune din mai multe posibile sau un obiect în cazul în care dorești mai multe opțiuni să influențeze crearea acestui stream.

Opțiunile posibile pe care le poți invoca au valori de start, care trebuie menționate pentru a înțelege configurarea stream-ului așa cum este el oferit de Node:

- *flags* (un șir de caractere), valoarea default: `w`;
- *encoding* - codarea caracterelor (un șir de caractere); valoarea din oficiu fiind `utf8`;
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