# fsPromises.access

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

Folosirea metodei `access` pentru verificarea permisiunilor înainte de a apela metoda `open` nu este recomandată pentru că introduce o stare de concurență. Este posibil ca între cele două apeluri vreun proces să modifice fișierul/directorul. Codul aplicației ar trebui să deschidă/citească/modifice fișierul și să gestioneze erorile apărute în cazul în care fișierul nu este disponibil.

## Argumente

Argumentele metodei sunt:

- `path` care poate fi un string, un `Buffer` sau un `URL`;
- `mode` care este un număr întreg. Valoarea din oficiu este `fs.constants.F_OK`;
