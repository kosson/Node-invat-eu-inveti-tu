# Metoda pipe

Această metodă este utilizată pentru a conecta stream-urile între ele, de exemplu un stream readable cu unui writable.

```text
Fișier --Readable stream--> | Buffer | --> pipe --> Writable stream | Buffer | --> Destinație
```

Exemplul cel mai simplu ar fi copierea unui fișier (*fs.createReadStream()*) dintr-o parte în alta (*fs.createWriteStream()*) folosind pipe.

Operațiunea *pipe* se poate aplica de mai multe ori aceluiași stream.

```javascript
const fs = require('fs');

const original = fs.createReadStream('./sursa.txt');
const copie1 = fs.createWriteStream('./copie1.txt');
const copie2 = fs.createWriteStream('./copie2.txt');

original.pipe(copie1);
original.pipe(copie2);
```

## Resurse

- [How to use stream.pipe](https://nodejs.org/en/knowledge/advanced/streams/how-to-use-stream-pipe/)
