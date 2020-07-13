# Stream-uri

Dacă am asemui stream-urile cu apa, am putea spune că locul de unde vine apa este *upstream* (*din deal*), iar unde ajunge *downstream* (*în vale*). Din punct de vedere al distribuției în timp, ne-am putea imagina că un stream este un array (bytes dispuși unul după alții) distribuit în timp, nu în memorie. Analogia cu array-ul servește să ne imaginăm că în locul indexului pe care îl folosim pentru a parcurge array-ul, de fapt avem o fereastră de date (*data buffer*) care își schimbă conținutul până la epuizarea datelor acelui stream.

## Interfața Stream

În Node, interfața `Stream` este implementată de modulul `stream`. Acest modul oferă un API care poate fi implementat de mai multe obiecte în Node.js, care doresc să implementeze interfața `stream`. Exemple de `stream`-uri în NodeJS:

-   un apel HTTP,
-   o proprietate `process.stdout`.

Stream-urile pot fi folosite pentru a citi, pentru a scrie sau ambele operațiuni în același timp. Fii foarte atentă la memorie pentru că gestionând streamuri cu `fs`, nu vei putea manipula fișiere de mari dimensiuni.

Toate stream-urile în Node.js lucrează exclusiv cu șiruri de caractere și obiecte `Buffer` constituite cu ajutorul array-ului specializat `Uint8Array`.

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

Modulul `stream` a fost gândit să respecte modelul de moștenire prototipal din JavaScript. Acest lucru permite posibile extensii ale celor patru clase de bază: `stream.Writable`, `stream.Readable`, `stream.Duplex` și `stream.Transform`.

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

## Concepte și clase

Streams lucrează cu trei concepte:

-   *source* (*sursă*), fiind obiectul de unde vin datele tale;
-   *pipeline* (*conductă*), fiind locul pe unde trec datele, fiind permise aici filtrarea și orice modificări ale datelor;
-   *sink* (*destinație*), fiind locul unde ajung datele.

## Tipuri de stream-uri

Node.js oferă patru tipuri de stream-uri:

-   `stream.Readable` (este o sursă de date, pate fi creat cu `fs.createReadableStream()`),
-   `stream.Writable` (creat cu `fs.createWriteStream()`),
-   `stream.Duplex` (streamuri care sunt `Readable` și `Writable`),
-   `stream.Transform` (streamuri duplex, care permit transformarea datelor).

Mai mult, acest modul include câteva funcții cu rol de utilitare: `pipeline`, `finished` și `Readable.from`.

### Object Mode

Stream-urile binare nu pot prelucra altceva decât stringuri și buffere. Streamurile pot fi create în `objectMode` cu scopul de a transforma *chunk*-ul într-un obiect.

```javascript
var through2 = require('through2');
var unStream = through2({objectMode: true}, function (chunk, enc, callback) {
  console.log(chunk);
  console.log(typeof chunk); // va fi mereu object în loc de stream sau buffer
  this.push(chunk);
});
unStream.write({salutari: 'de la Mamaia'});
```

Unele implementări de `stream` pot folosi și `null`, care va avea o semnificație specială. Astfel de streamuri operează într-un mod special numit *object mode* (au opțiunea `objectMode` la momentul creării stream-ului).

Node.js poate ține în memorie doar 1.67Gb. Dacă ai o resursă dincolo de această limitare, o eroare `heap out of memory` va fi emisă. Această limitate poate fi depășită.

### Buffering

Streamurile `Readable` și cele `Writable` vor stoca datele într-un **buffer** intern (o zonă tampon în memorie), care poate fi accesat folosind `writable.writableBuffer` sau cu `readable.readableBuffer`.

Dimensiunea datelor care sunt *prinse* în buffer depinde de opțiunea `highWaterMark` pasată constructorului de stream. Pentru stream-urile normale, opțiunea `highWaterMark` specifică numărul total de bytes.

Pentru stream-urile care operează în **object mode**, opțiunea `highWaterMark` specifică numărul total de obiecte.

Datele sunt introduse într-un stream `Readable` atunci când implementarea apelează `stream.push(chunk)`. În cazul în care consumatorul stream-ului nu apelează `stream.read()`, datele vor aștepta într-o coadă de așteptare internă.

În momentul în care dimensiunea buffer-ului intern atinge pragul specificat prin `highWaterMark`, stream-ul va opri temporar citirea datelor din resursa internă până când toate datele pot fi consumate. Acest lucru înseamnă că `stream` se va opri în a mai apela metoda `readable._read()`, care este folosită pentru a umple buffer-ul read.

Datele vor alimenta stream-urile `Writable` în momentul în care metoda `writable.write(chunk)` este apelată în mod repetat. Câtă vreme dimensiunea buffer-ului intern de scriere este sub pragul impus de `highWaterMark`, toate apelurile la `writable.write()` vor returna valoarea `true`. În momentul în care buffer-ul intern va atinge sau chiar depăși pragul, va fi returnată valoarea `false`.

Una din specificitățile API-ului `stream` și în special metoda `stream.pipe()` este necesitatea de a limita nivelul datelor din procesul de buffering la unul acceptabil pentru o bună funcționare, atât al furnizorilor de date ca surse, cât și a consumatorilor, fără a depăși limitele de memorie disponibile.

Deoarece stream-urile `Duplex` și `Transform` sunt deopotrivă `Readable` și `Writable`, fiecare păstează separat buffere interne folosite pentru scriere și citire. Deci, cele două operează independent ceea ce permite o curgere eficientă a datelor.

#### Servere web

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

## Async iterators

În acest moment, poți itera un stream, fapt care este posibil datorită compatibilității stream-urilor cu protocolul de iterare. Un exemplu rapid ar fi prelucrarea unui fișier de mari dimensiuni folosid protocolul de iterare.

```javascript
const {createReadStream} = require('fs');
async function prelucreaza () {
  const streamDate = createReadStream('/fisier_mare.csv'),
        chunk;
  for (chunk of streamDate) {
    // prelucrează fiecare linie de csv aici.
  }
  // încheierea lui for produce end pentru stream
}
prelucreaza();
```

În cazul în care vei aplica un `brake` în `for`, stream-ul va fi distrus automat.

Un alt exemplu, indică modul în care poți folosi generatoarele, de fapt async iteratoarele pentru a procesa un stream. Async iteratoarele permit await-uri, dar și yield-uri și pot fi parcurse folosind `for...await`.

```javascript
const {promisify} = require('util');
const intarziere = promisify(setTimeout);

async function* genereaza () {
  yield 'salut';
  await intarzie(100);
  yield ' '
  await intarzie(100);
  yield 'popor';
}

async function consumator (iterator) {
  let fragmente = '',
      chunk;
  for await (chunk of iterator) {
    fragmente += chunk;
  }
  return fragmente;
};

consumator(genereaza()).then(console.log);
```

Ceea ce mai permit async iteratoarele este să transformi elementele dintr-un iterator. Următorul exemplu poți să-l introduci într-un `pipeline`.

Un exemplu interesant este propus de Stephen Belanger în prezentarea sa „Async Iterators: A New Future for Streams” de la Node+JS Interactive 2019.

```javascript
const pipe = require('async-iterator-pipe');

// sparge fișierul pe linii
async function* lineSplit (iterator) {
  let buffer = Buffer.alloc(0); // creează un buffer intermediar

  // adaugă chunk-uri în bufferul intermediar până când apare newline char - 0x0a
  for await (let chunk of iterator) {
    buffer = Buffer.concat([buffer, chunk]),

    let position = buffer.indexOf(0x0a); // lucrează cu, codul de caracter pentru a evita transformarea bufferului intermediar în string

    // câtî vreme va fi găsit un caracter newline, va tăia până la acest caracter și va face yield.
    while (position >= 0) {
      yield buffer.slice(0, position); // fă yield la fragmentul până în newline

      buffer = buffer.slice(position + 1); // mută pointerul imedit după newline
      position = buffer.indexOf(0x0a);
    };
  };
  if (buffer) {
    yield buffer;
  }
};

// fă parsing pe liniile de CSV
async function* csv (iterator) {
  let keys;
  for await (let line of iterator) {
    const values = line.toString().split(',');
    if(!keys){
      keys = values;
      continue;
    }
    const data = {};
    for (let i = 0; i < values.length; i++) {
      data[keys[i]] = values[i];
    };
    yield data;
  };
};

// transformă fiecare obiect generat dintr-o linie CSV într-un JSON
async function* toJSON (iterator) {
  for await (let item of iterator) {
    yield JSON.stringify(item);
  };
};

async function* upperCaseTransform (iterator) {
  for await (let element of iterator) {
    yield element.toString().toUpperCase();
  }
};

const fs = require('fs');
pipe(
  fs.createReadStream('/fisier_mare.csv'),
  lineSplit,
  csv,
  toJSON,
  process.stdout
);

```

Începând cu Node.js 12 poți crea un stream dintr-un generator. Magia rezidă în folosirea lui `Readable.from` căruia îi pasezi un iterator sau un async iterator ori un array și îl va converti automat într-un stream.

```javascript
const {Readable, pipeline} = require('stream');
const {createWriteStream} = require('fs');

function* genereaza () {
  yield 'salut';
  yield 'popor';
}

const streamDate = Readable.from(genereaza()); // MAGIC!
pipeline(streamDate, createWriteStream('/fisier_imens.csv'), (err) => {
  if (err) console.log(err);
});
```

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
