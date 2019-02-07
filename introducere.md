# Introducere

Node.js este o platformă de comunicare IN / OUT cu orice tip de sursă, fie un fișier, un stream, etc. Ceea ce permite Node.js este scrierea aplicațiilor care folosesc protocoalele web-ului, dar și aplicații care folosesc resurse locale. Mai mult, Node.js poate interacționa cu baze de date, API-uri și conexiuni WebSocket.

Proiectul Node reflectă legăturile care se stabilesc între codul JavaScript scris de noi, motorul V8, care asigură interpretarea codului și biblioteca de cod `libuv`, care asigură puntea de acces către sistemul de operare și resursele sale. Node este folosit pentru a construi o interacțiune asincronă care economisește timp, fiind permise și alte interacțiuni în timp ce sunt aduse resurse de pe web sau hard disk. Node prezintă o structură modularizată având în nucleu câteva module peste care se poate construi și extinde nelimitat.

Câteva module nucleu ar fi `fs`, `http`, `net`, `dgram`, `dns`, `os`, `buffer`, `events`, `stream` și alte câteva care vin să completeze un context bogat și expresiv cum ar fi `url`, `querystring`, `path` sau `crypto`.

Responsabil de conectarea JS-ului cu funcțiile C++ este `process.binding()` parte a motorului V8. Pentru fiecare metodă a API-ului NodeJS există un corespondent în C++. Legătura cu C++-ul poate fi investigată prin resursele din directorul `/lib` al proiectului NodeJS. Motorul V8 face o traducere a valorilor din JavaScript în C++, care mai apoi sunt procesate de libuv pentru a manipula resursele sistemului.

Nodejs rulează un singur fir de execuție pentru codul JavaScript și controlează execuția folosind un event loop. Pentru orice altceva Node nu va ezita să folosească multiple fire de execuție.

## process

Atunci când aplicațiile NodeJS sunt scrise, un lucru foarte important este locul de unde se execută și mai ales căile de acces către fișiere și directoare care se formează. Alte lucruri interesante care pot constitui contextul de execuție pot fi variabilele de sistem, identificatorul de proces pentru aplicația pornită ș.a.m.d. Obiectul specializat `process` oferă toate aceste informații utile.

Pentru a-l accesa direct vei iniția o sesiune `node` și de acolo, apelezi metodele care returnează informația necesară.

```javascript
process.env
```

De exemplu, `process.env` va oferi toate detaliile de mediu a sistemului de operare în care rulează procesul `node`. Poate că unul din cele mai utile metode ale lui `process` este cea prin care determini locul de unde a fost lansată execuția lui node: `process.cwd()`. Acest aspect este important pentru că locul din care este pornit procesul și locul în care se află resursele pot să difere.

## Resurse

- [The Art of Node](https://github.com/maxogden/art-of-node)
- [Learn You The Node.js For Much Win!](https://github.com/workshopper/learnyounode#learn-you-the-nodejs-for-much-win)
