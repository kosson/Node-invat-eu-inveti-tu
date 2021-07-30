# Metoda pipe pe readable

Semnătura: `readable.pipe(destination[, options])`.

Metoda returnează o referință la `stream.Writable`-ul, permite chaining-ul dacă este un `Duplex` sau un `Transform`.

Argumente:
- `destination` este o instanță de `stream.Writable` în care sunt scrise datele,
- `options` este un `Object` care are următoarele opțiuni:
- - `end` un `Boolean` care indică închiderea writer-ului când reader-ul se încheie. Valoarea din oficiu este `true`.

Această metodă este utilizată pentru a atașa stream-urile între ele, un stream writable la unul readable. Drept urmare, se va declanșa automat modul flowing ceea ce se va solda cu un push al datelor în writeable-ul atașat. Curgerea datelor (*backpressure*-ul) va fi gestionată automat astfel ca stream-ul destinație `Writable` să nu fie inundat de un stream `Readable` mai rapid.

```text
Fișier --Readable stream--> | Buffer | --> pipe --> Writable stream | Buffer | --> Destinație
```

Exemplul cel mai simplu ar fi copierea unui fișier (*fs.createReadStream()*) dintr-o parte în alta (*fs.createWriteStream()*) folosind `pipe`.

Operațiunea *pipe* se poate aplica de mai multe ori aceluiași stream.

```javascript
const fs = require('fs');

const original = fs.createReadStream('./sursa.txt');
const copie1 = fs.createWriteStream('./copie1.txt');
const copie2 = fs.createWriteStream('./copie2.txt');

original.pipe(copie1).on('error', console.error);
original.pipe(copie2).on('error', console.error);
```

Poți face pipe la conținutul pe care îl scrii sau îl citești folosind terminalul.

```javascript
const destinatie = fs.createWriteStream('./ceva.txt');
process.stdin.pipe(destinatie);
```

Pentru că metoda returnează o referință a stream-ului writable, se poate continua un lanț de `pipe`-uri.

```javascript
const fs = require('fs');
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
```

Atunci când sursa, adică stream-ul `Readable` emite evenimentul `end`, metoda `stream.end()` este apelată din oficiu. Acest lucru va face ca destinația să nu mai fie writable. Pentru a dezactiva acest comportament, opțiunea `end` poate fi seatată cu valoarea `false`, fapt care conduce la menținerea destinației ca writable.

```javascript
reader.pipe(writer, { end: false });
reader.on('end', () => {
  writer.end('Am terminat!\n');
});
```

Există o problemă totuși. În cazul în care stream-ul `Readable` emite o eroare în timpul procesului, destinația `Writable` nu este închisă automat. Va trebui ca stream-ul destinație să fie închis de logica programului pentru că altfel se produc scurgeri de memorie.

Totuși, stream-urile `Writable` `process.stderr` și `process.stdout` nu sunt niciodată închise până când nu se închide procesul Node.js indiferent de opțiunile precizate.

## Resurse

- [How to use stream.pipe](https://nodejs.org/en/knowledge/advanced/streams/how-to-use-stream-pipe/)
- [readable.pipe](https://nodejs.org/api/stream.html#stream_readable_pipe_destination_options)
