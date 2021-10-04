# fsPromises.writeFile

Semnătura: `fsPromises.writeFile(file, data[, options])`.

Această metodă este folosită pentru a scrie datele într-un fișier într-o manieră asincronă. Dacă fișierul deja există, acesta va fi înlocuit. În cazul în care ai nevoie de performanțe mai mari la un volum de date mai mare, folosește `fs.createWriteStream()`.

## Argumentele

Metoda poate avea următoarele argumente:

- `file` care poate fi un string, un Buffer, un URL sau un FileHandle,
- `data` care poate avea următoarele reprezentări: string, Buffer, TypedArray, DataView, Object, AsyncIterable, Iterable, Stream,
- `options` care poate fi un șir de caractere sau un `Object`.

În cazul în care `options` este un `Object`, acesta poate avea următorii membri:

- `encoding` care poate fi un string sau `null`. Valoarea din oficiu este `utf8`,
- `mode` care este un număr întreg. Valoarea din oficiu este `0o666`,
- `flag` care este un string. Valoarea din oficiu este `w`,
- `signal` care este un `AbortSignal` care permite întreruperea scrierii fișierului.

```javascript
import { writeFile } from 'fs/promises';
import { Buffer } from 'buffer';

try {
  const controller = new AbortController();
  const { signal } = controller;
  const data = new Uint8Array(Buffer.from('Hello Node.js'));
  const promise = writeFile('message.txt', data, { signal });

  // Abort the request before the promise settles.
  controller.abort();

  await promise;
} catch (err) {
  // When a request is aborted - err is an AbortError
  console.error(err);
}
```

## Scrierea unui JSON

```javascript
import { writeFile } from 'fs/promises';
const JSONToFile = (obj, filename) => writeFile(`${filename}.json`, JSON.stringify(obj, null, 2));
JSONToFile({ test: 'ceva aici' }, 'numeFisier');
```
