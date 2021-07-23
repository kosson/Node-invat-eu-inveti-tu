# fsPromises.opendir

Semnătura: `fsPromises.opendir(path[, options])`.

Este deschis un director pentru a fi scanat iterativ.

```javascript
import { opendir } from 'fs/promises';

try {
  const dir = await opendir('./');
  for await (const dirent of dir)
    console.log(dirent.name);
} catch (err) {
  console.error(err);
}
```
