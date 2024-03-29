# Buffer

Node.js oferă posibilitatea de a lucra cu datele prin intermediul stream-urilor. Dar pentru a putea face acest lucru, a fost introdus un nou API specific. JavaScript a dobândit mecanisme specifice lucrului cu streamurile și datele binare abia odată cu noile versiuni ale standardului, care au introdus obiectele `TypedArray` și `ArrayBuffer`.

Clasa `Buffer` a fost introdusă de Node.js pentru a se asigura un nivel de interacțiune cu stream-urile de octeți din stream-urile TCP, operațiunile cu sistemul de fișiere al sistemului, etc. Această clasă implementează  API-ul `Uint8Array` din JavaScript cu anumite optimizări.

Clasa este disponibilă la nivel global fără a mai fi nevoie să o ceri explicit. Instanțele clasei `Buffer` sunt similare array-urilor de numere întregi de la `0` la `255`. Aceste alocări fixe de memorie stau în afara heap-ului V8. Dimensiunea unui `Buffer` este stabilită de la bun început și nu poate fi schimbată ulterior.

```javascript
// Creează un Buffer cu dimnsiunea de 10 având doar valoarea 0.
const buf1 = Buffer.alloc(10);
// Creează un Buffer cu dimnsiunea de 10 având doar valoarea 0x1.
const buf2 = Buffer.alloc(10, 1);
```

Un `Buffer` se poate crea prin pasarea în constructor:

- a unui array de octeți,
- a unui alt buffer,
- a unui string.

## Metode și proprietăți

Instanțierea unui `Buffer` se face folosind trei metode `Buffer.from()`, `Buffer.alloc()` și `Buffer.allocUnsafe()`.

### `Buffer.from()`

Există câteva variante ale metodei, fiecare diferind prin argumentele pe care le primește constructorul.

#### `Buffer.from(array)`

Motoda a fost adăugată în versiunea 5.10.0 a lui NodeJS. Cu ajutorul metodei poți aloca un nou `Buffer` folosind un array de octeți.

```javascript
// crearea unui Buffer cu octeți UTF-8 ai șirului de caractere „buffer”
const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
console.log(buf); // <Buffer 62 75 66 66 65 72>
```

Propriu-zis ceea ce se petrece este o copiere a conținutului din array-ul pasat.

```javascript
var arr = [1, 2, 3, 4];
var buff = Buffer.from(arr);
console.log(buff); // <Buffer 01 02 03 04>
```

În cazul în care folosim un TyppedArray așa cum este `Uint8Array`, se va petrece același lucru.

```javascript
var arr = new Uint8Array([1, 2, 3, 4]);
var buff = Buffer.from(arr);
console.log(buff);  // <Buffer 01 02 03 04>
```

#### `Buffer.from(arrayBuffer[, byteOffset[, length]])`

Această metodă va crea o *fereastră* prin care sunt expuse datele din buffer, fără a face o copie a datelor din blocurile de memorie pe care acestea le ocupă. Pur și simplu, se comportă ca o fereastră deschisă către datele care există deja într-o locație de memorie.

```javascript
const arr = new Uint16Array(2); // se crează un array de date în memorie
arr[0] = 200;
arr[1] = 300;
const buf = Buffer.from(arr.buffer); // face o referință către memoria unde se află arr
console.log(buf); // <Buffer c8 00 2c 01>
```

##### `arrayBuffer`

Este chiar un `ArrayBuffer` sau după caz un `SharedArrayBuffer` de JavaScript. Poate fi chiar proprietatea `.buffer` a unui `TypedArray`.

##### `byteOffset`

Este un număr care menționează indexul de la care să pornească expunerea datelor din buffer. Valoarea din oficiu este `0`. Este limita inferioară de la care se pornește construcția ferestrei către datele din buffer.

##### `length`

Este un număr care indică câți bytes vor fi expuși. Valoarea din oficiu este `arrayBuffer.length - byteOffset`. Este limita superioară a ferestrei de date.

```javascript
const ab = new ArrayBuffer(10); // creează un buffer cu 10 elemente (bytes)
const buf = Buffer.from(ab, 0, 2); // este referit un segment de la 0 conținând 2 elemente (bytes)
console.log(buf.length); // 2
```

#### `Buffer.from(buffer)`

Această metodă copiază bufferul pe care-l primește drept argument într-o nouă instanță de `Buffer`.

```javascript
const buf1 = Buffer.from('buffer');
const buf2 = Buffer.from(buf1);

buf1[0] = 0x61; // modică locația din memorie pentru byte-ul de la 0

console.log(buf1.toString()); // auffer
console.log(buf2.toString()); // buffer
```

Argumentul pasat trebuie să fie un buffer care există deja sau un `Uint8Array` din care să fie copiate datele.

#### `Buffer.from(object[, offsetOrEncoding[, length]])`

##### `object`

Este un `Object` din JavaScript, care se poate supune unei operațiuni `Symbol.toPrimitive` sau `valueOf()`.

##### `offsetOrEncoding`

Argumentul poate fi un număr sau un șir de caractere și reprezintă o limită (*offset*) sau o mențiune de codare în funcție de valoarea returnată, fie de `object.valueOf()`, fie `object[Symbol.toPrimitive]()`.

##### `length`

Este un număr care măsoară dimensiunea rezultatelor returnate prin aplicarea `object.valueOf()` sau `object[Symbol.toPrimitive]()`.

În cazul în care avem obiecte pe care aplicăm `valueOf()`, iar rezultatul returnează o valoare care nu este egală cu `object`, va fi returnat rezultatul operațiunii `Buffer.from(object[Symbol.toPrimitive](), offsetOrEncoding, length)`.

```javascript
const buf = Buffer.from(new String('ceva'));
console.log(buf) // <Buffer 63 65 76 61>
```

În cazul în care avem obiecte care suportă `Symbol.toPrimitive`, va fi returnată valoarea în urma evaluării `Buffer.from(object[Symbol.toPrimitive](), offsetOrEncoding, length)`.

```javascript
class Ceva {
  [Symbol.toPrimitive](){
    return 'test';
  }
}
var buf = Buffer.from(new Ceva(), 'utf8');
console.log(buf); // <Buffer 74 65 73 74>
```

#### `Buffer.from(string[, encoding])`

Metoda creează un nou `Buffer` care conține un șir (string). Al doilea parametru opțional specifică standardul în care se codează string-ul.

##### `string`

Este un șir de caractere gata de a fi codat.

##### `encoding`

Este un șir care menționează standardul de codare. Valoarea din oficiu este `utf8`.

```javascript
const buf1 = Buffer.from('șir de test');
console.log(buf1); //<Buffer c8 99 69 72 20 64 65 20 74 65 73 74>
console.log(buf1.toString()); // șir de test
console.log(buf1.toString('ascii'));  // Șir de test
const buf2 = Buffer.from('yJlpciBkZSB0ZXN0', 'base64');
console.log(buf2); //<Buffer c8 99 69 72 20 64 65 20 74 65 73 74>
console.log(buf2.toString()); // șir de test
```

### `Buffer.alloc()`

Metoda alocă un container pentru date de o anumită dimensiune în bytes pe care o specifici direct.

```javascript
const {Buffer} = require('buffer');
const buff = Buffer.alloc(8); // container de 8 bytes
buff.write("a", "utf-8"); // <Buffer 61 00 00 00 00 00 00 00>
```

O privire asupra Buffer-ului creat va aduce 8 numere hexazecimale. Din moment ce l-ai creat, poți scrie date în el.
Dacă dorești, poți reprezenta Buffer-ul ca JSON.

```javascript
console.log(buff.toJSON()); // returnează o reprezentare, dar valorile sunt zecimale
console.log(buff.length); // obții dimensiunea, care în cazul nostru va fi 8
// poți obține valoarea unei anumite poziții din Buffer
console.log(buff[2]);
``` 

### `Buffer.isBuffer(obj)`

Este o metodă prin care se interoghează un obiect pentru a afla dacă este un `Buffer` sau nu. Obiectul este primit drept argument și după evaluare va fi returnat `true` sau `false`.

### `Buffer.isEncoding(encoding)`

Metoda va cerifica dacă bufferul a fost codat după o anumită schemă menționată drept string în argument. Returnează `true` sau `false`.

### `Buffer.poolSize`

Este dimensiunea în bytes a instanțelor interne pre-alocate `Buffer`-ului, care sunt folosite pentru pooling. Valoarea din oficiu este 8192.

## Lucrul cu buffere

### `buf[index]`

Folosind această sintaxă, poți seta și obține valoarea octetului de la poziția indexului menționat drept parametru. Pentru că vorbim de bytes luați la nivel individual, indexul nu poate fi mai mare de `255` (`0xFF` în hexa).
Acest operator este preluat de la `Uint8Array`.

```javascript
// Copy an ASCII string into a `Buffer` one byte at a time.
const str = 'Node.js';
const buf = Buffer.allocUnsafe(str.length);

for (let i = 0; i < str.length; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf.toString('ascii')); // afișează Node.js
```

### `buff.buffer`

Este o referință către obiectul `ArrayBuffer` în baza căruia obiectul `Buffer` este creat.

```javascript
const arrayBuffer = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer);

console.log(buffer.buffer === arrayBuffer); // true
```

## Resurse

 - [Understanding Buffers | Understanding Node.js Core Concepts](https://www.youtube.com/watch?v=QZIeZM-yXXU)