# API-ul fs Promises

Acest API oferă o alternativă la metodele asicrone returnând obiecte `Promise`. Acest API este disponibil prin `require('fs').promises`.

Pentru a încărca biblioteca de cod se poate precum în exemplul următor:

```javascript
// punctual
import { access } from 'fs/promises';
import { constants } from 'fs';
// sau toată biblioteca de cod
const fs = require('fs');
const fsPromises = fs.promises;
```

Metodele disponibile:

- `fsPromises.access(path[, mode])`;
- `fsPromises.appendFile(path, data[, options])`
- `fsPromises.chmod(path, mode)`
- `fsPromises.chown(path, uid, gid)`
- `fsPromises.copyFile(src, dest[, flags])`
- `fsPromises.lchmod(path, mode)`
- `fsPromises.lchown(path, uid, gid)`
- `fsPromises.link(existingPath, newPath)`
- `fsPromises.lstat(path[, options])`
- `fsPromises.mkdir(path[, options])`
- `fsPromises.mkdtemp(prefix[, options])`
- `fsPromises.open(path, flags[, mode])`
- `fsPromises.readdir(path[, options])`
- `fsPromises.readFile(path[, options])`
- `fsPromises.readlink(path[, options])`
- `fsPromises.realpath(path[, options])`
- `fsPromises.rename(oldPath, newPath)`
- `fsPromises.rmdir(path)`
- `fsPromises.stat(path[, options])`
- `fsPromises.symlink(target, path[, type])`
- `fsPromises.truncate(path[, len])`
- `fsPromises.unlink(path)`
- `fsPromises.utimes(path, atime, mtime)`
- `fsPromises.writeFile(file, data[, options])`.
