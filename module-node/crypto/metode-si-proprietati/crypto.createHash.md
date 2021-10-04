# crypto.createHash()

Crearea unui hash pentru o valoare folosind un algoritm SHA-256 cu implementare  `Promise`.

```javascript
const crypto = require('crypto');

const hashNode = val =>
  new Promise(resolve =>
    setTimeout(
      () => resolve(crypto.createHash('sha256').update(val).digest('hex')), 0
    )
  );
hashNode(JSON.stringify({ a: 'a', b: [1, 2, 3, 4], foo: { c: 'bar' } })).then(
  console.log
);
```

Implementarea pentru browser beneficiază de API-ul [SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto).

(1) Creezi un `TextEncoder` pe care-l folosești pentru a coda `val`;
(2) Pasezi `val` lui `SubtleCrypto.digest()`;
(3) Folosești `DataView.prototype.getUint32()` pentru a citi datele rezolvate care sunt într-un `ArrayBuffer`;
(4) Convertești datele într-o reprezentare hexazecimală folosind `Number.prototype.toString(16)`;
(5) Apoi le bagi într-un `Array` pe care faci `join`.

```javascript
const hashBrowser = val =>
  crypto.subtle
    .digest(
      'SHA-256',
      new TextEncoder('utf-8').encode(val))
        .then(h => {
          let hexes = [],
              view  = new DataView(h),
              i;
          for (i = 0; i < view.byteLength; i += 4)
            hexes.push(('00000000' + view.getUint32(i).toString(16)).slice(-8));
          return hexes.join('');
        }
      );

hashBrowser(
  JSON.stringify({ a: 'a', b: [1, 2, 3, 4], foo: { c: 'bar' } })
).then(console.log);
// '04aa106279f5977f59f9067fa9712afc4aedc6f5862a8defc34552d8c7206393'
```

## Resurse

- [hashNode | 30secondsofcode.org/js](https://www.30secondsofcode.org/js/s/hash-node)
- [hashBrowser | ](https://www.30secondsofcode.org/js/s/hash-browser)
