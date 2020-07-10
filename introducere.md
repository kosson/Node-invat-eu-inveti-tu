# Introducere

Node.js este un model de programare în JavaScript bazat pe evenimente, fiind folosit un model asincron. Node.js este un pachet software care rulează în consolă. Împreună cu un manager de pachete software, fie acesta `npm`, fie `yarn`, are capacitatea de a oferi modularitatea necesară construirii de aplicații foarte complexe și diverse.

Pentru a verifica dacă `node` este instalat pe sistem, vom deschide un terminal în care apelând comanda `node --version`, vom obține numărul versiunii instalate curent.

Node.js este o platformă de comunicare IN / OUT cu orice tip de sursă, fie un fișier, un stream, etc. Ceea ce permite Node.js este scrierea aplicațiilor care folosesc protocoalele web-ului, dar și aplicații care folosesc resurse locale. Mai mult, NodeJS poate interacționa cu baze de date, API-uri și conexiuni WebSocket.

Proiectul Node.js reflectă legăturile care se stabilesc între codul JavaScript scris de noi, motorul V8, care asigură interpretarea codului și biblioteca de cod `libuv`, care asigură puntea de acces către sistemul de operare și resursele sale. Node este folosit pentru a construi o interacțiune asincronă care economisește timp, fiind permise și alte interacțiuni în timp ce sunt aduse resurse de pe web sau hard disk. Node.js prezintă o structură modularizată având în nucleu câteva module peste care se poate construi și extinde nelimitat.

Node.js este o aplicație la rândul său care comunică cu sistemul de operare pe care este găzduită prin intermediul unor stream-uri standard: `stdin` (*standard input*), `stdout` (*standard output*) și `stderr` (*standard error*). În momentul rulării unei aplicații Node.js, acestea sunt canalele de comunicare dintre aplicație și terminal. Sunt chiar disponibile direct ca proprietăți ale obiectului `process`.

Câteva module nucleu ar fi `fs`, `http`, `net`, `dgram`, `dns`, `os`, `buffer`, `events`, `stream` și alte câteva care vin să completeze un context bogat și expresiv cum ar fi `url`, `querystring`, `path` sau `crypto`.

Responsabil de conectarea JS-ului cu funcțiile C++ este `process.binding()` parte a motorului V8. Pentru fiecare metodă a API-ului NodeJS există un corespondent în C++. Legătura cu C++ poate fi investigată prin resursele din directorul `/lib` al proiectului NodeJS. Motorul V8 face o traducere a valorilor din JavaScript în C++, care mai apoi sunt procesate de `libuv` pentru a manipula resursele sistemului.

## Date de lucru în Node.js

În afară de datele pe care le cunoaștem din JavaScript, datele primare de lucru în NodeJS sunt de tip `Buffer` cu un echivalent în JavaScript `Uint8Array`, un TypedArray. Datele brute în NodeJS sunt numite *octet streams*. Octeții sunt secvențe de 8 biți numite și **bytes**. NodeJS alocă memorie pentru buffere în afara heap memory-ului V8.

**Moment Zen**: Bufferele odată diensionate nu mai pot fi modificate.

Bufferele joacă un rol central în operațiunile de scriere și citire. Datele fișierelor vor fi citite și scrise folosind un buffer.

```javascript
let buf = new Buffer(24);
```

Buffer-ele din NodeJS sunt diferite de ArrayBuffer-ele din JavaScript pentru că în Node, `Buffer`-ul nu va încărca și conținutul. Inițializarea buffer-ului se face cu ajutorul metodei `fill()`.

```javascript
buf.fill(1); // încarcă buffer-ul cu valoarea 1
```

## Resurse

- [The Art of Node](https://github.com/maxogden/art-of-node)
- [Learn You The Node.js For Much Win!](https://github.com/workshopper/learnyounode#learn-you-the-nodejs-for-much-win)
- [Mixu's Node book](http://book.mixu.net/node/single.html)
- [Fundamental Node.js Design Patterns](https://blog.risingstack.com/fundamental-node-js-design-patterns/)
- [Design patterns in Node.js: A practical guide](https://blog.logrocket.com/design-patterns-in-node-js/)
