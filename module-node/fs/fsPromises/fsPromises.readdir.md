# fsPromises.readdir

Semnătura: `fsPromises.readdir(path[, options])`.

Metoda citește conținutul unui director și returnează un obiect `<Promise>`.

Promisiunea se rezolvă prin obținerea unui array cu numele fișierele din director excluzând `'.'` și `'..'`.

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

În cazul în care `options.withFileTypes` este setat la valoarea `true`, array-ul rezultat va conține obiecte `<fs.Dirent>`. Aceste obiecte sunt reprezentarea unei intrări pentru un director, care poate fi un fișier sau un subdirector în funcție de ce este returnat la citire dintr-un obiect `<fs.Dir>`. Intrarea privind directorul este o combinație a numelui fișierului și tipul acestuia.

Clasa `<fs.Dir>` reprezintă stream-ul unui director și este folosită pentru a face citirea.
