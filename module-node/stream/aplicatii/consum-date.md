# Consum al datelor

Presupunem că avem server.js

```javascript
import http from 'node:http';
import {Readable} from 'node:stream';
import { readFileSync, createReadStream } from 'fs';

http.createServer((req, res) => {
  // createReadStream('../DATA/JCDL2015.csv').pipe(res);

  const readableStream = Readable({
    read() {
      // createReadStream('DATA/JCDL2015.csv').pipe(res);
      this.push('Salutări ');
      this.push('din campus.');
      this.push(null);
    }
  });

  readableStream.pipe(res);

}).listen(3000).on('listening', () => console.log(`rulez pe 3000`));
```

și client

```javascript
import { createWriteStream } from 'node:fs';
import {get} from 'node:http';
import {Transform, Writable} from 'node:stream';

const getHttpStream = () => new Promise(resolve => get('http://localhost:3000', response => resolve(response)));

const stream = await getHttpStream();

stream.pipe(
  Transform({
    objectMode: true,
    transform (chunk, encoding, cb) {
      let item = chunk.toString();
      cb(null, item);
    }
  }))
  .filter(chunk => chunk.includes('Salutări'))
  .map(chunk => chunk.toUpperCase() + 'acum \n')
  .pipe(
    createWriteStream('rezultat.txt', {flags: 'a'})
  )
  // .pipe(
  //   Writable({
  //     objectMode: true,
  //     write (chunk, encoding, cb) {
  //       console.log('chunk', chunk);
  //       return cb(null);
  //     }
  //   })
  // );
  ```