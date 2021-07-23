# fsPromises.mkdtemp

Semnătura: `fsPromises.mkdtemp(prefix[, options])`.

Metoda creează un director temporar unic. Este generat un nume unic al directorului prin adăugarea de șase caractere aleatorii la finalul prefixului introdus.

```javascript
import { mkdtemp } from 'fs/promises';

try {
  await mkdtemp(path.join(os.tmpdir(), 'foo-'));
} catch (err) {
  console.error(err);
}
```
