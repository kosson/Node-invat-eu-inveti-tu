# fsPromises.access

Această metodă a fost adăugată odată cu versiunea 10.0.0.
Semnătura: `fsPromises.access(path[, mode])`.

Metoda testează permisiunile pe care le are un utilizator asupra unui fișier sau director. Argumentul `mode` indică care aspect al permisiunilor se dorește a fi testat (vezi constantele sistemului de fișiere). Se poate crea o mască la nivel de biți combinați OR pentru două sau mai multe valori. De exemplu: `fs.constants.W_OK | fs.constants.R_OK` pentru a vedea dacă fișierul sau directorul poate fi citit și scris.

Metoda returnează o promisiune care este soluționată cu valoarea `undefined` în caz de succes.

```javascript
import { access } from 'fs/promises';
import { constants } from 'fs';

try {
  await access('/etc/passwd', constants.R_OK | constants.W_OK);
  console.log('can access');
} catch {
  console.error('cannot access');
}
```

Folosirea metodei `access` pentru verificarea permisiunilor înainte de a apela metoda `open` nu este recomandată pentru că introduce o stare de concurență (*race condition*). Este posibil ca între cele două apeluri vreun proces să modifice fișierul/directorul. Codul aplicației ar trebui să deschidă/citească/modifice fișierul și să gestioneze erorile apărute în cazul în care fișierul nu este disponibil.

## Argumente

Argumentele metodei sunt:

- `path` care poate fi un string, un `Buffer` sau un `URL`;
- `mode` care este un număr întreg. Valoarea din oficiu este `fs.constants.F_OK`;

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

Codul utilizatorului trebuie să deschidă/citească/scrie fișierul direct și să trateze erorile în cazul în care fișierul nu este disponibil.

## Testarea existenței unui director

Cu ajutorul metodei poți testa dacă un director există sau nu.

```javascript
require('dotenv').config();
const fsPromises = require(`fs`).promises;
const path = require(`path`);

fsPromises.open(process.env.REPO_REL_PATH).then(() => {
    fsPromises.access('repo/nick', fs.constants.F_OK).then(() => {
        console.log('Există');
    }).catch(e => console.log(e.message));
}).catch(e => console.log(e.message));
```
