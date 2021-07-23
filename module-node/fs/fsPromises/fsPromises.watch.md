# fsPromises.watch

Semnătura: `fsPromises.watch(filename[, options])`.

Returnează un async iterator care ține sub observație modificări privind `filename`, unde `filename` poate fi un fișier sau un director.

```javascript
const { watch } = require('fs/promises');

const ac = new AbortController();
const { signal } = ac;
setTimeout(() => ac.abort(), 10000);

(async () => {
  try {
    const watcher = watch(__filename, { signal });
    for await (const event of watcher)
      console.log(event);
  } catch (err) {
    if (err.name === 'AbortError')
      return;
    throw err;
  }
})();
```

## Argumentele

Metoda poate avea următoarele argumente:

- `filename`, care poate fi un string, un `Buffer` sau un `URL`;
- `options`, care poate fi un string sau un `Object`.

În cazul în care `options` este un obiect, acesta poate avea următorii membri:

- `persistent`, un `Boolean` care indică dacă procesul ar trebui să continue să ruleze câtă vreme fișierele sunt observate. Valoarea din oficiu este `true`,
- `recursive`, un `Boolean` care indică faptul că toate subdirectoarele ar trebui să fie observate sau numai cel curent. Valoarea din oficiu este `false`,
- `encoding`, este valoarea encoding-ului. Valoarea din oficiu este `utf8`,
- `signal` este un [AbortSignal](https://nodejs.org/api/globals.html#globals_class_abortsignal) folosit pentru a semnala când să fie întreruptă observarea.

Metoda va returna un obiect async iterator al obiectelor având următoarele proprietăți:
- `eventType` fiind un string care reprezintă tipul modificării,
- `filename` care este un string sau un `Buffer` reprezentând numele fișierului modificat.
