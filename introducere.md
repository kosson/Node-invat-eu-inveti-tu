# Introducere

Node.js este un model de programare în JavaScript bazat pe evenimente, fiind folosit un model asincron. NodeJS este un pachet software care rulează în consolă. Împreună cu un manager de pachete software, fie acesta `npm`, fie `yarn`, are capacitatea de a oferi modularitatea necesară construirii de aplicații foarte complexe și diverse.

Pentru a verifica dacă `node` este instalat pe sistem, vom deschide un terminal în care apelând comanda `node --version`, vom obține numărul versiunii instalate curent.

Node.js este o platformă de comunicare IN / OUT cu orice tip de sursă, fie un fișier, un stream, etc. Ceea ce permite Node.js este scrierea aplicațiilor care folosesc protocoalele web-ului, dar și aplicații care folosesc resurse locale. Mai mult, NodeJS poate interacționa cu baze de date, API-uri și conexiuni WebSocket.

Proiectul Node reflectă legăturile care se stabilesc între codul JavaScript scris de noi, motorul V8, care asigură interpretarea codului și biblioteca de cod `libuv`, care asigură puntea de acces către sistemul de operare și resursele sale. Node este folosit pentru a construi o interacțiune asincronă care economisește timp, fiind permise și alte interacțiuni în timp ce sunt aduse resurse de pe web sau hard disk. Node prezintă o structură modularizată având în nucleu câteva module peste care se poate construi și extinde nelimitat.

NodeJS este o aplicație la rândul său care comunică cu sistemul de operare pe care este găzduită prin intermediul unor stream-uri standard: `stdin` (*standard input*), `stdout` (*standard output*) și `stderr` (*standard error*). În momentul rulării unei aplicații NodeJS, acestea sunt canalele de comunicare dintre aplicație și terminal. Sunt chiar disponibile direct ca proprietăți ale obiectului `process`.

Câteva module nucleu ar fi `fs`, `http`, `net`, `dgram`, `dns`, `os`, `buffer`, `events`, `stream` și alte câteva care vin să completeze un context bogat și expresiv cum ar fi `url`, `querystring`, `path` sau `crypto`.

Responsabil de conectarea JS-ului cu funcțiile C++ este `process.binding()` parte a motorului V8. Pentru fiecare metodă a API-ului NodeJS există un corespondent în C++. Legătura cu C++ poate fi investigată prin resursele din directorul `/lib` al proiectului NodeJS. Motorul V8 face o traducere a valorilor din JavaScript în C++, care mai apoi sunt procesate de `libuv` pentru a manipula resursele sistemului.

NodeJS rulează un singur fir de execuție pentru codul JavaScript și controlează execuția folosind un event loop. Pentru orice altceva Node nu va ezita să folosească multiple fire de execuție.

## Un concept central: stream-uri

Streamurile sunt date care *curg* ca urmare a unui eveniment `EventEmitter` între diferitele părți funcționale ale unui program.

Subiectul `stream`-urilor este legat intim de cel al funcționării sistemelor de operare UNIX. Una din cele mai apreciate facilități ale acestui sistem de operare este capacitatea de a folosi programe mai mici pentru a dezvolta programe mai elaborate. Dar așa cum rândurile de cărămizi sunt legate unele de celelalte prin mortar, așa există și în UNIX un liant foarte puternic numit `pipes`. În română ar fi tradus ca `racorduri`. În folosirea de zi cu zi, aceste racorduri sunt identificabile prin utilizarea caracterului *pipe* <code>&#124;</code>. Pentru a face utiliza racordurile în Node.js, vom folosi `.pipe()`. Datele de input ale unui program sau componentă software sunt datele de output ale alteia. În UNIX, două sau mai multe programe sunt conectate prin caracterul `|`, care în limba engleză se numește `pipe`, iar în română *țeavă*.

Chiar dacă nu suntem programatori de UNIX, vom explora un exemplu de funcționare a mai multor progrămele mici folosite în mod curent într-un terminal, de data aceasta de GNU/Linux.

```bash
ls -l | grep "nicolaie" | sort -n
```

Secvența de mai sus listează numele de fișiere (`ls`) în a căror denumire se găsește fragmentul de text `nicolaie`, după care sortează ceea ce a găsit. Cele trei programe: `ls`, `grep` și `sort` au stabilit un flux de prelucrare, de fapt. Ceea ce a găsit comanda `ls` va fi pasat prin `pipe` (`|`) către următoarea comandă `grep`, care are misiunea de a detecta în toate denumirile tuturor fișierelor din directorul în care se execută fluxul de comenzi, fragmentul de text `nicolaie` și în final, rezultatul va fi pasat prin pipe din nou către ultima comandă `sort`, care va returna spre afișare rezultatul la care s-a ajuns.

Ceea ce merită remarcat este faptul că, fiecare componentă din lanțul de prelucrare, poate fi perceput ca un adevărat filtru.

Douglas McIlroy, unul dintre autorii UNIX-ului, a scris o notă în care surprinde cel mai exact rolul acestor „racorduri” (pipes):

> Ar trebui să avem modalități de a conecta programele precum furtunele din grădină - înfiletezi alt segment atunci când este necesar să masezi datele în alt fel. Aceasta este și calea IO. (Douglas McIlroy, 1964)

**IO** înseamnă In/Out - o paradigmă a intrărilor și a ieșirilor. Întrările și ieșirile în NodeJS au un comportament asincron, ceea ce înseamnă că va trebui pasat un callback care va acționa asupra datelor.

Stream-urile lucrează cu fragmente - **chunks**. Acestea sunt trimise între două puncte de comunicare. Streamurile sunt emitere de evenimente. Acest lucru înseamnă că se poate gestiona lucrul cu acestea atașându-se callback-uri pe diferitele evenimente.

## Date de lucru în Node

În afară de datele pe care le cunoaștem din JavaScript, datele primare de lucru în NodeJS sunt de tip `Buffer` cu un echivalent în JavaScript `Uint8Array`, un TypedArray. Datele brute în NodeJS sunt numite *octet streams*. Octeții sunt secvențe de 8 biți numite și **bytes**. NodeJS alocă memorie pentru buffere în afara heap memory-ului V8.

**Moment Zen**: Bufferele odată diensionate nu mai pot fi modificate.

Bufferele joacă un rol central în operațiunile de scriere și citire. Datele fișierelor vor fi citite și scrise folosind un buffer.

```javascript
let buf = new Buffer(24);
```

Buffer-ele din NodeJS sunt diferite de ArrayBuffer-ele din JavaScript pentru că în Node, Buffer-ul nu va încărca și conținutul. Inițializarea buffer-ului se face cu ajutorul metodei `fill()`.

```javascript
buf.fill(1); // încarcă buffer-ul cu valoarea 1
```

## Resurse

- [The Art of Node](https://github.com/maxogden/art-of-node)
- [Learn You The Node.js For Much Win!](https://github.com/workshopper/learnyounode#learn-you-the-nodejs-for-much-win)
