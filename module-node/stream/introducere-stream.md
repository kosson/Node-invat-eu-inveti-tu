# Stream-uri

Dacă am asemui *stream*-urile cu apa, am putea spune că locul de unde vine apa este *upstream* (*din deal*), iar unde ajunge *downstream* (*în vale*). Din punct de vedere a distribuției în timp, ne-am putea imagina că un *stream* este un array (bytes dispuși unul după alții) distribuit în timp, nu în memorie. Analogia cu array-ul servește să ne imaginăm că în locul indexului pe care îl folosim pentru a parcurge array-ul, de fapt avem o fereastră de date (*data buffer*) care își schimbă conținutul până la epuizarea respectivului stream. Un alt mod de a înțelege stream-urile ar fi utilitate dovedită prin posibilitatea unui sistem de a consuma o cantitate limitată de date dintr-un volum pentru care nu avem capacitate de prelucrare. Pot fi și alte cazuri în care avem nevoie să creăm un *buffer* de date între un emițător al respectivelor date și un consumator al lor. Un *buffer* poate fi perceput ca un recipient care se interpune între emițător și consumator cu scopul de a menține constant debitul consumatorului, dar și pe cel al emițătorului. Uneori consumatorul nu poate procesa atât de rapid datele pe cât de repede sunt emise ș.a.m.d. În acel moment bufferul începe să se umple până când ajunge la o limită pe care o numim *highWaterMark*. În cazul în care datele ating această limită și o depășesc unoeori, putem cere emițătorului din amonte (*upstream*) să se oprească din introducerea datelor până când acestea sunt consumate. Limita `highWaterMark` este un prag, nu o limitare peste care nu se poate trece.

## Interfața Stream

În Node.js, interfața `Stream` este implementată de modulul `stream`. Acest modul oferă un API care poate fi implementat de mai multe obiecte în Node.js. Stream-urile își găsesc utilitatea în multe dintre modulele Node.js chiar. Câteva exemple:

-   un apel HTTP,
-   o proprietate `process.stdout`.

Un experiment amuzant și util pentru înțelegere, ar fi să citim date de la consolă folosind `process.stdin`.

```javascript
process.stdin.on('data', date => console.log(`Datele primite sunt `, date));
```

Observă faptul că ceea ce este afișat este câte un caracter reprezentat ca un Buffer.

```text
cDatele primite sunt  <Buffer 63>
eDatele primite sunt  <Buffer 65>
```

Stream-urile pot fi folosite pentru a citi (*Readable streams*), pentru a scrie (*Writable streams*) sau ambele operațiuni în același timp (*Duplex streams* și *Transform streams*). Cel mai adesea vei întâlni modulul `fs` care folosește stream-urile. Fii foarte atent(ă) la memorie, pentru că gestionând streamuri folosindu-te de modulul `fs`, nu vei putea manipula fișiere de mari dimensiuni.

Toate stream-urile în Node.js lucrează exclusiv cu șiruri de caractere și obiecte `Buffer` constituite cu ajutorul array-ului specializat `Uint8Array`.

Să dezvoltăm exemplul de mai sus privind preluarea datelor din Terminal și să facem o transformare a acestora folosindu-ne de `pipe`.

```javascript
let stdin = process.stdin;
let stdout = process.stdout.on('data', data => process.stdout.write(data.toString().toUpperCase()));
stdin.pipe(stdout);
```

## Cum verifici dacă ai un stream

Mai întâi verifici dacă valoarea nu este `null` și este un obiect. Apoi testezi să aibă metoda `pipe()`.

```javascript
const isStream = val =>
  val !== null &&
  typeof val === 'object' &&
  typeof val.pipe === 'function';

const fs = require('fs');
isStream(fs.createReadStream('test.txt')); // true
```

### Legătura cu `EventEmitter`

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

## Detalii de API

Modulul `stream` a fost gândit să respecte modelul de moștenire prototipală din JavaScript. Acest lucru permite posibile extensii ale celor patru clase de bază: `stream.Writable`, `stream.Readable`, `stream.Duplex` și `stream.Transform`.

```javascript
const { Writable } = require('stream');

class MyWritable extends Writable {
  constructor(options) {
    super(options);
    // ...
  }
}
```

Pentru a face orice extensie a unei clase de bază, este nevoie ca noile clase să implementeze câteva metode specifice:

| Utilizare | Clasa de bază | Metodele care trebuie implementate|
|-|-|-|
| Citirea unui stream | `Readable` | `_read()`|
| Scrierea unui stream | `Writable` | `_write()`, `_writev()`, `_final()`|
| Scrierea și citirea | `Duplex` | `_read()`, `_write()`, `_writev()`, `_final()`|
| Lucru cu date scrise, urmată de citirea rezultatului | `Transform` | `_transform()`, `_flush()`, `_final()`|

O implementare solidă vei găsi în modulul `fs`:
- `fs.ReadStream()`,
- `fs.WriteStream`.

## Concepte centrale

Streams lucrează cu trei concepte:

-   *source* (*sursă*), fiind obiectul de unde vin datele tale;
-   *pipeline* (*conductă*), fiind locul pe unde trec datele, fiind permise aici filtrarea și orice modificări ale datelor;
-   *sink* (*destinație*), fiind locul unde ajung datele.

## Tipuri de stream-uri

Node.js oferă patru tipuri de stream-uri:

-   `stream.Readable` (este o sursă de date, poate fi creat cu `fs.createReadableStream()`),
-   `stream.Writable` (poate fi creat cu `fs.createWriteStream()`),
-   `stream.Duplex` (streamuri care sunt `Readable` și `Writable` deopotrivă),
-   `stream.Transform` (streamuri duplex, care permit transformarea datelor).

Mai mult, acest modul include câteva funcții cu rol de utilitare: `pipeline`, `finished` și `Readable.from`.

## Rularea în object mode

Stream-urile binare nu pot prelucra altceva decât string-uri și buffere. Stream-urile pot fi create în `objectMode` cu scopul de a transforma *chunk*-ul într-un obiect.

```javascript
let through2 = require('through2');
let unStream = through2({objectMode: true}, function (chunk, enc, callback) {
  console.log(chunk);
  console.log(typeof chunk); // va fi mereu object în loc de stream sau buffer
  this.push(chunk);
});
unStream.write({salutari: 'de la Mamaia'});
```

Unele implementări de `stream` pot folosi și `null`, care va avea o semnificație specială. Astfel de streamuri operează într-un mod special numit *object mode* (au opțiunea `objectMode` la momentul creării stream-ului).

Node.js poate ține în memorie doar 1.67Gb de date. Dacă ai o resursă dincolo de această limitare, o eroare `heap out of memory` va fi emisă. Această limitare poate fi modificată, dacă se dorește.

## Buffering-ul

Streamurile `Readable` și cele `Writable` vor stoca datele într-un **buffer** intern (o zonă tampon în memorie), care poate fi accesat folosind `writable.writableBuffer` sau cu `readable.readableBuffer`.

Dimensiunea datelor care sunt *prinse* în *buffer* depinde de valoarea opțiunii `highWaterMark` pasată constructorului de stream. Pentru stream-urile normale, opțiunea `highWaterMark` specifică numărul total de bytes.

Pentru stream-urile care operează în **object mode**, opțiunea `highWaterMark` specifică numărul total de obiecte.

Datele sunt introduse într-un stream `Readable` atunci când implementarea apelează `stream.push(chunk)`. În cazul în care consumatorul stream-ului nu apelează `stream.read()`, datele vor aștepta într-o coadă de așteptare internă.

În momentul în care dimensiunea buffer-ului intern atinge pragul specificat prin `highWaterMark`, stream-ul va opri temporar citirea datelor din resursa internă până când toate datele pot fi consumate. Acest lucru înseamnă că `stream` se va opri în a mai apela metoda `readable._read()`, care este folosită pentru a umple buffer-ul read.

Datele vor alimenta stream-urile `Writable` în momentul în care metoda `writable.write(chunk)` este apelată în mod repetat. Câtă vreme dimensiunea buffer-ului intern de scriere este sub pragul impus de `highWaterMark`, toate apelurile la `writable.write()` vor returna valoarea `true`. În momentul în care buffer-ul intern va atinge sau chiar depăși pragul, va fi returnată valoarea `false`.

Una din specificitățile API-ului `stream` și în special pentru metoda `stream.pipe()` este necesitatea de a limita nivelul datelor la momentul când se face buffering la unul acceptabil pentru o bună funcționare, atât al furnizorilor de date ca surse, cât și a consumatorilor, fără a depăși limitele de memorie disponibile.

Deoarece stream-urile `Duplex` și `Transform` sunt deopotrivă `Readable` și `Writable`, fiecare păstrează separat buffere interne folosite pentru scriere și citire. Deci, cele două operează independent ceea ce permite o curgere eficientă a datelor.

## Folosirea stream-urilor

În Node.js stream-urile constituie o parte importantă legată de prelucrarea datelor. Stream-urile stau la baza ciclurilor cerere-răspuns în cazul apelurilor HTTP, de exemplu. Modulul `fs` al Node.js este o altă zonă în care stream-urile sunt intens utilizate. De exemplu, `stream.Writable` este extinsă prin clasa `fs.WriteStream`, care este instanțiată prin `fs.createWriteStream()`.

### Servere web

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
- [The Definitive Guide to Object Streams in Node.js](https://community.risingstack.com/the-definitive-guide-to-object-streams-in-node-js/)
- [Node.js Streams - NearForm bootcamp series](https://youtu.be/mlNUxIUS-0Q)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Async Iterators: A New Future for Streams - Stephen Belanger](https://youtu.be/YVdw1MDHVZs)
- [isStream | 30secondsofcode.org](https://www.30secondsofcode.org/js/s/is-stream)
- [Use Streams to Build High-Performing Node.js Applications | Deepal Jayasekara | Feb 2, 2022](https://blog.appsignal.com/2022/02/02/use-streams-to-build-high-performing-nodejs-applications.html)
