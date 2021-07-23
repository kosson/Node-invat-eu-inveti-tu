# fsPromises.readdir

Semnătura: `fsPromises.readdir(path[, options])`.

Metoda citește conținutul unui director.

```javascript
import { readdir } from 'fs/promises';

try {
  const files = await readdir(path);
  for (const file of files)
    console.log(file);
} catch (err) {
  console.error(err);
}
```
