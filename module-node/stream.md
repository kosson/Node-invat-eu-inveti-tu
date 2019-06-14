# Stream-uri

## Interfața Stream

În Node, interfața `Stream` este implementată de modulul `stream`. Acest modul oferă un API care poate fi implementat de mai multe obiecte în Node.js, care doresc să implementeze interfața `stream`. Exemple de `stream`-uri în NodeJS:

-   un apel HTTP,
-   o proprietate `process.stdout`.

Stream-urile pot fi folosite pentru a citi, pentru a scrie sau ambele operațiuni în același timp. Fii foarte atentă la memorie pentru că gestionând streamuri cu `fs`, nu vei putea manipula fișiere de mari dimensiuni.

Toate stream-urile în Node.js lucrează exclusiv cu șiruri de caractere și obiecte `Buffer` constituite cu ajutorul array-ului specializat `Uint8Array`.

### Legătura cu EventEmitter

**Toate stream-urile sunt instanțe ale clasei `EventEmitter`**.

Toate obiectele care sunt stream-uri expun o metodă `eventEmitter.on()`. Această metodă permite unei funcții sau mai multora să se atașeze pe evenimente emise de obiect. Funcțiile atașate evenimentelor vor fi executate sincron.

 ```javascript
const stream = require('stream');
// creezi un stream Readable
var unStrReadable = require('stream').Readable;
// instanțiezi obiectul Readable
var streamR = new unStrReadable;
streamR.push('salut');
streamR.push('Irimia!');
streamR.push(null); // trimiterea datelor s-a încheiat
// trimite datele în consolă
streamR.pipe(process.stdout);
// execută cu node numeFisier.js
 ```

### Concepte și clase

Streams lucrează cu trei concepte:

-   *source* (*sursă*), fiind obiectul de unde vin datele tale;
-   *pipeline* (*conductă*), fiind locul pe unde trec datele, fiind permise aici filtrarea și orice modificări ale datelor;
-   *sink* (*destinație*), fiind locul unde ajung datele.

### Tipuri de stream-uri

Node.js oferă patru tipuri de stream-uri:

-   `stream.Readable` (este o sursă de date, pate fi creat cu `fs.createReadableStream()`),
-   `stream.Writable` (creat cu `fs.createWriteStream()`),
-   `stream.Duplex` (streamuri care sunt `Readable` și `Writable`),
-   `stream.Transform` (streamuri duplex, care permit transformarea datelor).

Mai mult, acest modul include câteva funcții cu rol de utilitare: `pipeline`, `finished` și `Readable.from`.

### Object Mode

Unele implementări de stream pot folosi și `null`, care va avea o semnificație specială. Astfel de streamuri operează într-un mod special numit *object mode* (au opțiunea `objectMode` la momentul creării stream-ului).

Node.js poate ține în memorie doar 1.67Gb. Dacă ai o resursă dincolo de această limitare, o eroare `heap out of memory` va fi emisă. Această limitate poate fi depășită.

### Buffering

Streamurile `Readable` și cele `Writable` vor stoca datele într-un buffer (o zonă tampon) intern, care poate fi accesat folosind `writable.writableBuffer` sau cu `readable.readableBuffer`.

Dimensiunea datelor care sunt *prinse* în buffer depinde de opțiunea `highWaterMark` pasată constructorului de stream. Pentru stream-urile normale, opțiunea `highWaterMark` specifică numărul total de bytes.

Pentru stream-urile care operează în **object mode**, opțiunea `highWaterMark` specifică numărul total de obiecte.

Datele sunt introduse într-un stream `Readable` atunci când implementarea apelează `stream.push(chunk)`. În cazul în care consumatorul stream-ului nu apelează `stream.read()`, datele vor aștepta într-o coadă de așteptare internă de unde vor aștepta să fie consumate.

În momentul în care dimensiunea buffer-ului intern atinge pragul specificat prin `highWaterMark`, stream-ul va opri temporar citirea datelor din resursa internă până când toate datele pot fi consumate. Acest lucru înseamnă că `stream` se va opri în a mai apela metoda `readable._read()`, care este folosită pentru a umple buffer-ul read.

Datele vor alimenta stream-urile `Writable` în momentul în care metoda `writable.write(chunk)` este apelată în mod repetat. Câtă vreme dimensiunea buffer-ului intern de scriere este sub pragul impus de `highWaterMark`, toate apelurile la `writable.write()` vor returna valoarea `true`. În momentul în care buffer-ul intern va atinge sau chiar depăși pragul, va fi returnată valoarea `false`.

Una din caracteristicile API-ului `stream` și în special metoda `stream.pipe()` este necesitatea de a limita nivelul datelor din procesul de buffering la un nivel acceptabil pentru o bună funcționare atât al furnizorilor de date ca surse, cât și a consumatorilor fără a depăși limitele de memorie disponibile.

Deoarece stream-urile `Duplex` și `Transform` sunt deopotrivă `Readable` și `Writable`, fiecare păstrând separat buffere interne folosite pentru scriere și citire. Deci, cele două operează independent ceea ce permite o curgere eficientă a datelor.

### Streamuri care citesc - `stream.Readable`

Stream-urile `Readable` pot fi considerate a fi sursa datelor. Toate stream-urile care citesc implementează interfața pe care o definește clasa `stream.Readable`. Documentația oficială menționează câteva exemple:

- răspunsuri HTTP la client,
- cererile care ajung la server,
- streamuri read pentru `fs`,
- streamuri zlib,
- streamuri crypto,
- socketuri TCP,
- procese copil `stdout` și `stderr`,
- `process.stdin`.

Există două moduri de a primi date de la un stream `Readable`:

- flowing și
- pauză.

#### Modul flowing

Un stream care este în modul flowing va oferi date unei aplicații cât de repede este posibil folosind evenimentele pe care interfața `EventEmitter` le pune la dispoziție.

#### Modul pauză

În modul pauză, datele pot fi citite folosind metoda `read()`, care oferă posibilitatea de a citi bucată cu bucată ce există în obiectul buffer.

Toate stream-urile `Readable` pornesc în modul pauză. Curgerea datelor poate fi declanșată prin următoarele metode:

- atașarea unui eveniment `data` cu un receptor care să facă ceva cu datele,
- apelarea metodei `resume()` pe stream,
- apelarea metodei `pipe()` pentru a trimite datele unui stream `Writable`.

Dacă este necesar, stream-ul `Readable` poate fi pus în modul pauză folosind una din următoarele metode:

- apelarea metodei `pause()` dacă nu există pipe-uri,
- dacă există pipe-uri și sunt eliminate toate acestea prin folosirea metodei `unpipe()`.

### Streamurile Writable

Sunt o abstractizare a ceea ce putem înțelege a fi o *destinație*.

Posibilele stream-uri `Writable`:

- HTTP requests, pe partea de client,
- HTTP responses, pe partea de server,
- `fs` - stream-urile *write*,
- stream-uri `zlib`,
- stream-uri `crypto`,
- socket-uri TCP,
- procesele copil `stdin`
- `process.stdout`, `process.stderr`.

Unele dintre aceste stream-uri sunt `Duplex`.

```javascript
const unStream = obtineUnStream();
unStream.write('ceva date');
unStream.write('mai adug ceva date');
unStream.end('am terminat de scris datele');
```

#### Evenimentele stream-urilor writable

##### Evenimentul `close`

Acest eveniment este emis atunci când stream-ul și resursele sale interne (de exemplu un descriptor de fișier) au fost închise. Aceste eveniment odată emis, marchează faptul că nu vor mai fi emise alte evenimente pentru că alte operațiuni nu vor mai fi făcute.

Dacă un stream va fi creat având setată opțiunea `emitClose`, acesta va emite mereu evenimentul `close`.

##### Evenimentul `drain`

Dacă apelul la `stream.write(chunk)` returnează `false`, evenimentul `drain` va fi emis atunci când este posibilă reluarea scrierii datelor în stream.

##### Evenimentul `error`

Este un eveniment care este emis atunci când a apărut o eroare în timpul scrierii sau introducerii datelor într-un stream.

##### Evenimentul `finish`

Evenimentul este emis după apelarea metodei `stream.end()` și după ce toate datele au fost trimise în sistemele din subsidiar.

```javascript
const streamWriter = genereazaStreamul();
for (let i = 0; i < 100; i++) {
  streamWriter.write(`salut, #${i}!\n`);
}
streamWriter.end('Acesta este finalizarea\n');
streamWriter.on('finish', () => {
  console.log('Au fost scrise toate datele');
});
```

##### Evenimentul `pipe`

Acest eveniment este emis la apelarea metodei `stream.pipe()` pe un stream readable, adăugând prezentul writable în setul destinațiilor sale.

```javascript
const writer = genereazaStreamul();
const reader = genereazaStreamul();
writer.on('pipe', (src) => {
  console.log('Ceva este trimis prin piping în writer.');
  assert.equal(src, reader);
});
reader.pipe(writer);
```

##### Evenimentul `unpipe`

Acest eveniment este emis la apelarea metodei `stream.unpipe()` este apelat pe un stream `Readable` eliminând `Writeable`-ul prezent din destinații.

```javascript
const writer = genereazaStreamul();
const reader = genereazaStreamul();
writer.on('unpipe', (src) => {
  console.log('S-a oprit ceva în a mai trece spre writer prin piping.');
  assert.equal(src, reader);
});
reader.pipe(writer);
reader.unpipe(writer);
```

#### Metodele pentru stream-urile writable

##### `writable.cork()`

Această metodă forțează toate datele scrise să fie introduse într-o zonă tampon din memorie. Datele din tampon atunci când va fi apelată, fie `stream.uncork()`, fie `stream.end()`.

Intenția primară a metodei este de a evita situația în care scrierea a mai multor fragmente mici de date într-un stream nu conduce la constituirea unui backup în buffer-ul intern, fapt care conduce la penalizarea performanțelor. În aceste situații, implementările care oferă metoda `writable._writev()` poate executa scrieri buffered într-o manieră optimizată.

##### `writable.destroy([error])`

Metoda distruge stream-ul imediat. Opțional, va emite evenimentul `error` și apoi un eveniment `close` cu singura excepție a condiției setată de opțiunea `emitClose` prin `false`. După acest apel, alte apeluri la metodele `write()` sau `end()` vor rezulta într-o eroare `ERR_STREAM_DESTROYED`.

Dacă ai nevoie ca datele să fie epuizate (*flushed*) înainte de a închide stream-ul, mai bine se folosește metoda `end()` sau se va aștepta evenimentul `drain`.

Opțional, poate primi drept argument un obiect `Error`.

Metoda returnează legătura `this`.

##### `writable.end([chunk][, encoding][, callback])`

Apelarea metodei semnalează faptul că nu vor mai fi scrise date în `Writable`. Argumentele opționale `chunk` și `encoding` permit scrierea unui ultim fragment de date înaintea închiderii `stream`-ului.

Dacă este nevoie, opțional poate fi adăugat un callback, care să fie executat ca urmare a închiderii scrierii stream-ului. Încercarea de a mai scrie într-un stream după închiderea sa, va rezulta într-o eroare.

```javascript
const fs   = require('fs');
const file = fs.createWriteStream('exemplu.txt');
file.write('salutare, ');
file.end('popor!');// nu mai poți scrie nimic
```

### Clasa stream.Writable

Sunt stream-urile în care se pot scrie date.

### Clasa stream.Readable

### Clasa stream.Duplex

Sunt acele stream-uri în care se poate scrie și citi deopotrivă.

### Clasa stream.Transform

Stream-urile de transformare sunt acele stream-uri `Duplex` care implementează interfețele `Readable` și `Writable`. De exemplu, streamurile `zlib` și `crypto` sunt de tip `Transform`.

### Cazuistică

Majoritatea aplicațiilor Node.js folosesc `stream`-urile într-un fel sau altul. Totuși există excepții când dorești să lucrezi cu `Buffer`e, de exemplu. Să presupunem că faci un `Buffer` în care introduci o imagine codată base64. Pentru a o scrie pe hard disk, mai întâi ai nevoie să introduci conținutul `Buffer`-ului într-un stream care să poată fi citit.

```javascript
var unit = '' || `${process.env.BASE_UNIT}`;
var user = '' || `${process.env.BASE_USER}`;
function createRecord (data) {
    //TODO: urmeaza standardul BagIt
    var calea = `${__dirname}/${process.env.REPO}/${unit}/${user}/${uuidv1()}`; // numele directorului resurselor va fi un UUID v1
    var bag = bagit(calea, 'sha256', {'Contact-Name': `${user}`});
    // separă extensia
    // var ext = data.split(';')[0].match(/jpeg|png|gif/)[0];

    var b64data = data.replace(/^data:image\/\w+;base64,/, "");

    // creează un buffer specializat
    var buffy = Buffer.from(b64data, 'base64');
    // poți scrie datele pe hard direct
    // fs.writeFile('imagine.png', buffy, 'base64', () => {
    //     console.log('Am scris fișierul');
    // });

    // introdu Buffer-ul într-un stream
    var strm = new Readable();
    strm.push(buffy);
    strm.push(null);
    strm.pipe(bag.createWriteStream('cover.png'));

    bag.finalize(function () {
        console.log('Am creat bag-ul');
    });
}
```

De exemplu, serverele `http` folosesc stream-urile.

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // req este un http.IncomingMessage, care este un Readable Stream
  // res este un http.ServerResponse, care este un Writable Stream

  let body = '';
  // Setează ca datele să fie codate UTF8.
  // Dacă nu este specificată codarea, vor fi primite doar obiecte Buffer.
  req.setEncoding('utf8');

  // Stream-urile Readable emit evenimente de tip 'data' imediat de un receptor este atașat
  req.on('data', (chunk) => {
    body += chunk;
  });

  // evenimentul de tip 'end' indică primirea întregului corp
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      // trimite ceva util utilizatorului
      res.write(typeof data);
      res.end();
    } catch (er) {
      // nu a ajuns un JSON!!!
      res.statusCode = 400;
      return res.end(`eroare: ${er.message}`);
    }
  });
});

server.listen(8888);
```

Stream-ul `res` este un obiect `Writable`, care expune metode precum `write()` și `end()`. Aceste metode sunt folosite pentru a scrie date în stream. Stream-urile `Readable` folosesc clasa `EventEmitter` pentru a *anunța* aplicația cu privire la momentul în care datele sunt disponibile pentru a fi citite din stream.

## Referințe

- [Pipeline (Unix), Wikipedia](https://en.wikipedia.org/wiki/Pipeline_(Unix))
- [stream, Node.js v12.3.1 Documentation](https://nodejs.org/api/stream.html)
- [The UNIX Philosophy, Streams and Node.js. Posted on August 29, 2013 by Safari Books Online & filed under Content - Highlights and Reviews, Programming & Development.](https://www.safaribooksonline.com/blog/2013/08/29/the-unix-philosophy-streams-and-node-js/)
- [stream-handbook](https://github.com/substack/stream-handbook)
- [Stream Adventure](https://www.npmjs.com/package/stream-adventure)
