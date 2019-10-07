# API-ul fs Promises

Acest API oferă o alternativă la metodele asicrone returnând obiecte `Promise`. Acest API este disponibil prin `require('fs').promises`.

## Metoda `fsPromises.access(path[, mode])`

Această metodă a fost adăugată odată cu versiunea 10.0.0.

Argumentul `path` poate fi `String`, `Buffer` sau `URL`.
Opțional, se poate pasa un al doilea argument care este un număr întreg. Acesta precizează care teste de accesibilitate să fie întreprinse conform `File Access Constants`. Valoarea din oficiu este `fs.constants.F_OK`. Combinând mai multe valori constante este posibilă crearea unei adevărare *măști*. De exemplu: `fs.constants.W_OK | fs.constants.R_OK`.

În cazul în care testul reușește, promisiunea va fi *rezolved* fără nicio valoare. În cazul în care verificările de accesibilitate eșuează, promisiunea este *rejected* cu un obiect de eroare.

```javascript
const fs = require('fs');
const fsPromises = fs.promises;

fsPromises.access('/etc/passwd', fs.constants.R_OK | fs.constants.W_OK)
  .then(() => console.log('can access'))
  .catch(() => console.error('cannot access'));
```

Nu este recomandată folosirea lui `fsPromises.access()` înaintea lui `fsPromises.open()` nu este recomandată pentru că se va introduce o stare de suprapunere a stărilor (*race condition*). Acest lucru se poate petrece deoarece alte procese în sistem ar putea modifica starea fișierului între cele două apeluri.

Codul utilizatorului trebuie să deschidă/citească/scrie fișierul direct și să trateze erorile în cazul în care fișierul nu este disponibil.

Cu ajutorul metodei poți testa dacă un director există sau nu.

```javascript
require('dotenv').config();
const fs = require(`fs`);
const fsPromises = require(`fs`).promises;
const path = require(`path`);

fsPromises.open(process.env.REPO_REL_PATH).then(() => {
    fsPromises.access('repo/nick', fs.constants.F_OK).then(() => {
        console.log('Există');
    }).catch(e => console.log(e.message));
}).catch(e => console.log(e.message));
```

## Metoda `fsPromises.appendFile(path, data[, options])`

## Metoda `fsPromises.chmod(path, mode)`

## Metoda `fsPromises.chown(path, uid, gid)`

## Metoda `fsPromises.copyFile(src, dest[, flags])`

## Metoda `fsPromises.lchmod(path, mode)`

## Metoda `fsPromises.lchown(path, uid, gid)`

## Metoda `fsPromises.link(existingPath, newPath)`

## Metoda `fsPromises.lstat(path[, options])`

## Metoda `fsPromises.mkdir(path[, options])`

## Metoda `fsPromises.mkdtemp(prefix[, options])`

## Metoda `fsPromises.open(path, flags[, mode])`

Metoda primește ca prim argument calea (*path*) către fișier. Acest argument poate fi o valoare `String`, `Buffer` sau `URL`. Drept al doilea argument, se pot preciza câteva flag-uri. Valoarea din oficiu este `r`. Altreilea parametru este modul în care va fi deschis un fișier. Valoarea din oficiu este una care oferă posibilitatea de a scrie și citi fișierul - `0o666`.

Metoda returnează o promisiune.

## Metoda `fsPromises.readdir(path[, options])`

## Metoda `fsPromises.readFile(path[, options])`

## Metoda `fsPromises.readlink(path[, options])`

## Metoda `fsPromises.realpath(path[, options])`

## Metoda `fsPromises.rename(oldPath, newPath)`

## Metoda `fsPromises.rmdir(path)`

## Metoda `fsPromises.stat(path[, options])`

## Metoda `fsPromises.symlink(target, path[, type])`

## Metoda `fsPromises.truncate(path[, len])`

## Metoda `fsPromises.unlink(path)`

## Metoda `fsPromises.utimes(path, atime, mtime)`

## Metoda `fsPromises.writeFile(file, data[, options])`