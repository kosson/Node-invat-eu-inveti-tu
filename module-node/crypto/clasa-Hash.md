# Clasa Hash

Această clasă este folosită pentru a crea digest-uri din date. Extinde `<stream.Transform>`.

Poate fi utilizată în două feluri:

- din postura de *stream* care este în același timp *readable* și *writable*. Datele sunt scrise pentru a produce un digest în readable;
- folosind metodele `hash.update()` și `hash.digest()` pentru a calcula un hash.

Metoda `crypto.createHash()` este folosită pentru a crea instanțe `Hash`. Obiectele `Hash` nu pot fi instanțiate direct folosind `new`.

```javascript
const {
  createHash,
} = require('crypto');

const hash = createHash('sha256');

hash.on('readable', () => {
  // Only one element is going to be produced by the
  // hash stream.
  const data = hash.read();
  if (data) {
    console.log(data.toString('hex'));
    // Prints:
    //   6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
  }
});

hash.write('some data to hash');
hash.end();
```

Folosirea lui `Hash` în pipe-uri.

```javascript
const { createReadStream } = require('fs');
const { createHash } = require('crypto');
const { stdout } = require('process');

const hash = createHash('sha256');

const input = createReadStream('fișier.txt');
input.pipe(hash).setEncoding('hex').pipe(stdout);
```

Actualizarea unui hash și afișarea rezultatului.

```javascript
const {
  createHash,
} = require('crypto');

const hash = createHash('sha256');

hash.update('some data to hash');
console.log(hash.digest('hex'));
```
