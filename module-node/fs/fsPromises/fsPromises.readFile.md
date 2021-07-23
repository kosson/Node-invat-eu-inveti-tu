# fsPromises.readFile

Semnătura: `fsPromises.readFile(path[, options])`.

Metoda citește asincron conținutul unui fișier.

```javascript
import { readFile } from 'fs/promises';

try {
  const controller = new AbortController();
  const { signal } = controller;
  const promise = readFile(fileName, { signal });

  // Abort the request before the promise settles.
  controller.abort();

  await promise;
} catch (err) {
  // When a request is aborted - err is an AbortError
  console.error(err);
}
```
