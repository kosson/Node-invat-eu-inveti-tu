### Clasa `stream.Transform`

În cazul în care ai nevoie de un stream cu ajutorul căruia să transformi datele primite, vei apela la `Transform`.

Stream-urile de transformare sunt acele stream-uri `Duplex` care implementează interfețele `Readable` și `Writable`. Ceea ce le face deosebite este faptul că partea `Readable` este conectată de `Writable`.

```text
                          Transform stream
          ↗- scrie   --→|Buffer write------|----↓
aplicație               |------------------|  crypto
          ↖-- citește --|-------Buffer read|----⤶
```

De exemplu, streamurile `zlib` și `crypto` sunt de tip `Transform`. Un alt exemplu este `stream.PassThrough` care permite pasarea biților fără nicio modificare.
Rezultatul este obținut din input-ul supus unei prelucrări. Aceste stream-uri implementează clasele `Readable` și `Writable`.

Manualul oferă drept exemplu modulele `zlib` și `crypto`.

Clasa `stream.Transform` moștenește din `stream.Duplex`, dar are propriile implementări pentru metodele `writable._write()` și `readable._read()`.

## Instanțierea clasei

Pentru a lucra cu un stream `Transform` este nevoie să instanțiezi clasa cu `new`. Pentru a extinde clasa de bază cu scopul de a realiza propria implementare, se poate angaja sintaxa ES6 pentru concizie.

```javascript
const { Transform } = require('stream');

class ImplementareaMeaTransform extends Transform {
  constructor(char) {
    super();
    this.replaceChar = char;
  }

  _transform (chunk, encoding, cb) {
    const transformedChunk = chunk.toString().replace(/[a-z]|[A-Z]/g, this.replaceChar); // înlocuirea caracterelor cu cel trimis ca argument.
    this.push(transformedChunk);
    cb();
  }

  _flush (cb) {
    this.push('Ceva care să fie adăugat la final');
    cb();
  }
}

const replacingCharsStream = new ImplementareaMeaTransform('X');

process.stdin.pipe(replacingCharsStream).pipe(process.stdout).on('error', console.error);
```

Pentru a face o punte cu practicile anterioare ES6, vom menționa exemplul oferit de manual pentru a înțelege mai adânc, de fapt ceea ce se petrece.

```javascript
const { Transform } = require('stream');
const util = require('util');

function ImplementareaMeaTransform(options) {
  if (!(this instanceof ImplementareaMeaTransform)) {
      return new ImplementareaMeaTransform(options);
  }
  Transform.call(this, options);
}
util.inherits(ImplementareaMeaTransform, Transform);
```

De cele mai multe ori, veți vedea o implementare simplă în care se instanțiază clasa prin constructor.

```javascript
const { Transform } = require('stream');

const unTransformSimplu = new Transform({
  transform(chunk, encoding, callback) {
    // ...
  }
});
```

## Evenimente

### `finish` și `end`

Aceste evenimente sunt caracteristice claselor `stream.Writable` și `stream.Readable`. Evenimentul `finish` este emis după ce `stream.end()` este apelată și toate fragmnetele de date (*chunks*) au fost procesate prin apelarea metodei `stream._transform()`. Evenimentul `end` este emis după ce toate datele au ieșit, apărând după ce a fost apelată funcția callback la momentul execuției metodei `stream._flush()`.

## Metode

### `transform.destroy([error])`

Va *distruge* stream-ul și în cazul în care apare o eroare, va emite un eveniment `error`. În cazul în care se face apel la această metodă, stream-ul va elibera toate resursele angajate în execuție.
La momentul în care se face `destroy`, se va emite și un eveniment `close` pentru că implementarea lui `_destroy()` este moștenită de la `readable._destroy()`, care emite evenimentul `close` cu mențiunea ca opțiunea `emitClose` să nu fie setată la `false`.

### `transform._flush(callback)`

Funcția callback va avea argumentele `error` și `data`. Acest callback va fi apelat atunci când datele vor fi `flushed`.

Atenție, această metodă nu trebuie apelată direct de aplicație.

### `transform._transform(chunk, encoding, callback)`

Orice implementare a clasei `Transform`, trebuie să ofere o metodă internă `_transform`. Aceasta va fi folosită pentru a se putea prelua date de input și pentru a se trimite mai departe datele în lanțul de prelucrare.

Sarcina metodei este aceea de a gestiona secvența de bytes care a fost scrisă (*written*), de a computa un rezultat și apoi de a pasa acel rezultat unei metode `readable.push()`.

Această metodă nu trebuie apelată direct de aplicație, fiind necesară o implementare în clase copil. Metoda este apelată doar de metodele interne ale clasei `Readable`.

```javascript
const fs = require('fs');
const { Transform } = require('stream');

let caleInputFile = './data/ceva.csv';
let caleOutputFile = './data/altceva.csv';

const streamDeInput = fs.createReadStream(caleInputFile);
const streamDeOutput = fs.createWriteStream(caleOutputFile);

function implementareDePrelucrareTransform () {
  const transformStream = new Transform(); // instanțiezi stream-ul de transformare
  // faci o implementare proprie a metodei de transformare vizând o anumită transformare specifică
  transformStream._transform = (chunk, encoding, callback) => {
    let transformat = chunk.toLowerCase(); // transformă textul din fiecare chunk în lower case
    transformStream.push(transformat);     // trimite rezultatul transformării unui stream de output
    callback(); // este invocat de fiecare dată după ce transformarea și trimiterea s-au efectuat
  };
  return transformStream;
}
streamDeInput.pipe(implementareDePrelucrareTransform()).pipe(streamDeOutput).on('error', err => {console.error(err)});
```

Metoda `push` poate fi apelată de zero sau mai multe ori pentru a genera mai multe rezultate diferite pentru fiecare *chunk* individual.
Reține faptul că la prelucrarea unui *chunk* este posibil să nu avem rezultate, care să fie împinse mai departe.

Funcția callback va fi apelată după ce fragmentul de date curent va fi consumat complet. Apelarea metodei `_transform()` nu poate fi făcută în paralel pentru că stream-urile implementează un mecanism de prelucrare secvențială - o coadă de așteptare. În schimb, funcția callback poate fi apelată sincron sau asyncron.

#### Argumentele

##### `chunk`

Acesta reprezintă referința către fragmentul de date care va intra în transformare. Tipurile de date pot fi: `Buffer`, `string` sau orice primitive.
Acest *chunk* va fi pasat lui `stream.write()`.

Dacă opțiunea `decodeStrings` a lui `stream.write()` este setată la `false`, ori stream-ul operează în modul object, fragmentul nostru de date nu va fi convertit, fiind exact ceea ce a fost pasat lui `stream.write()`.

##### `encoding`

Argumentul `encoding` este un șir de caractere care denumește care standard de codare a caracterelor este folosit pentru datele de prelucrat, dacă acestea sunt string.

În cazul în care datele sunt de tip `buffer`, atunci această opțiune poate fi omisă sau setată la `buffer`.

##### `callback`

Este o funcție care primește drept argumente două obiecte. Unul de eroare de tip `Error` și al doilea datele aflate în prelucrare. În cazul în care nu avem erori în fluxul de prelucrare, obiectul de eroare va avea valoarea `null`. Dacă cel de-al doilea argument este pasat callback-ului, adică obiectul de date, acesta va fi pasat metodei `readable.push()`.

```javascript
transform.prototype._transform = function(data, encoding, callback) {
  this.push(data);
  callback();
};
// fiind perfect echivalent cu
transform.prototype._transform = function(data, encoding, callback) {
  callback(null, data);
};
```

Această funcție este apelată după ce fragmentul de date a fost prelucrat.

### Cazuistică

#### Preluare de imagine

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

## Resurse

- [Implementing a transform stream](https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream)
