# Async iterators

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

## Crearea de readable cu async generators

Începând cu Node.js 12 poți crea un stream dintr-un generator. Magia rezidă în folosirea lui `Readable.from()` căruia îi pasezi un iterator sau un async iterator ori un array și îl va converti automat într-un stream.

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

```javascript
const {Readable} = require('stream');
const {promisify} = require('util');
const intarzie = promisify(setTimeout);

async function* genereaza () {
  yield 'salut';
  await intarzie(4000);
  yield ' '
  await intarzie(4000);
  yield 'popor';
}

const readable = Readable.from(genereaza());
readable.on('data', (chunk) => {
  console.log(chunk);
});
```

## Piping în writable streams din async iterators

Atunci când scrii într-un stream writable dintr-un iterator async, asigură o gestionare corectă a erorilor legate de backpressure. Metoda `stream.pipeline()` abstractizează gestionarea backpressure-ului și a erorilor legate de acesta.

```javascript
const fs = require('fs');
const { pipeline } = require('stream');
const { pipeline: pipelinePromise } = require('stream/promises');

const writable = fs.createWriteStream('./file');

// Callback Pattern
pipeline(iterator, writable, (err, value) => {
  if (err) {
    console.error(err);
  } else {
    console.log(value, 'value returned');
  }
});

// Promise Pattern
pipelinePromise(iterator, writable)
  .then((value) => {
    console.log(value, 'value returned');
  })
  .catch(console.error);
```

## Exemple

Un alt exemplu, indică modul în care poți folosi generatoarele, de fapt *async iteratoarele* pentru a procesa un stream. Async iteratoarele permit *await*-uri, dar și *yield*-uri și pot fi parcurse folosind `for...await`.

```javascript
const {promisify} = require('util');
const intarzie = promisify(setTimeout);

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

### Transformarea datelor din iterator

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

    // câtă vreme va fi găsit un caracter newline, va tăia până la acest caracter și va face yield.
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

## Referințe

- [Async Iterators: A New Future for Streams - Stephen Belanger](https://youtu.be/YVdw1MDHVZs)
