# Event loop

Event loop (bucla) din Node.js este mecanismul care permite execuția de operațiuni I/O astfel încât firul principal de execuție să nu fie blocat.

Adu-ți mereu aminte faptul că primul fragment de cod care este introdus în *callstack* este o funcție `main()` în care rulează întreaga aplicație. Apoi, rând pe rând vor intra în evaluare expresiile, iar funcțiile vor fi introduse în *callstack* pe măsură ce codul se execută.

Conform documentației Node.js, bucla parcurge așa-numite *faze*, unde va efectua operațiunile specifice acelei faze și apoi vor executa toate callback-urile din lista de așteptare a fazei până când acestea vor fi epuizate sau a fost atins numărul maxim de callback-uri. Imediat după, bucla avansează la următoarea fază.

Dacă este întâlnit apelul la un *timer* sau al unui API, Node.js va face ceea ce putem numi o adevărată *programare* a codului. În funcție de tipul apelului, callback-urile sunt introduse în cozi de așteptare specifice respectivului API de la care așteaptă un răspuns. Imediat ce apare răspunsul, funcția cu rol de callback așteaptă să intre în callstack, dacă acesta este gol pentru a fi executată. În acest scenariu, rolul buclei este acela de a trimite în *callstack* funcțiile cu rol de callback.

În Node.js spre deosebire de varianta rulată de browsere, există un mod diferit de a programa execuția unui callback. Putem să ne imaginăm bucla Node.js ca pe un `while` care nu-și termină niciodată execuția.

Funcțiile cu rol de callback care sunt programate datorită apelării unui API asincron, de exemplu, sunt gestionate un *strat* de cod scris în C++, care introduce aceste funcții în listele specifice API-urilor pentru care așteaptă. De îndată ce callstack-ul este gol, se vor executa callback-urile din listele de așteptare în funcție de prioritatea listei și încărcare. De fiecare dată când un callback va fi apelat în JavaScript, lista microtaskurilor și cea a callback-urilor, vor fi executate și golite. Abia după ce listele sunt golite, bucla poate continua pentru a procesa un alt callback sau funcție care a intrat în callstack.

Din perspectiva priorității execuției codului, primul care este executat, dacă este întâlnit în cod, este `process.nextTick(funcție)` căruia îi pasăm un callback cu tot codul care trebuie evaluat. Callback-ul este introdus într-o listă (*nextTick queue*) dedicată tratării funcțiilor callback din `process.nextTick`. Modulele interne ale Node.js folosesc această metodă.

O altă listă este cea a **microtask**-uri, în care sunt introduse callback-urile pasate metodelor specifice promisiunilor (*resolve*, *reject* și *finally*) sau când aceasta este rezolvată.

În cazul în care în codul nostru există un `setTimeout()`, `setInterval()` sau un `setImmediate()`, callback-ul acestora este introdus event loop (*buclă*). Mai sunt introduse în buclă apelurile de sistem (operating system tasks) cum ar fi cazul în care pe `http` vine o cerere care trebuie gestionată. În buclă mai pot intra procese care sunt legate de lucrul cu resursele sistemului de operare cum ar fi, de exemplu, citirea unui fișier de pe disc folosind `fs`.

Un alt amănunt foarte important care trebuie reținut este că bucla Node.js este firul de execuție unic. Există câteva componente ale bibliotecii standard de cod care nu sunt *single threaded*, fiind executate în afara buclei. Pentru executarea unor funcții care au nevoie de putere de calcul pentru a le duce la îndeplinire așa cum sunt cele criptografice, Node.js folosește modulul `libuv`, care face uz de mai multe fire de execuție (într-un *thread pool*). Acest *thread pool* beneficiază de patru fire de execuție.

## Anatomia unui tur de event loop

Mecanismul de funcționare al buclei se uită mai întâi dacă există timere care au callback-uri, mai exact pentru `setTimeout()` și `setInterval()`. Sunt executate callback-urile. Pe măsură ce acestea își termină execuția, bucla se va uita la operațiunile cu sistemul de operare și apoi la operațiunile cu resursele. Când toate callback-urile au fost executate, bucla se va uita dacă există vreun `setImmediate()` și va executa callback-urile acestora.

În cazul în care Node.js lucrează cu stream-uri, este rândul tuturor evenimentelor `close` să intre în execuție.

Dacă nu mai există nicio cerere din cele menționate, bucla intră într-o stare de așteptare și se va porni în momentul în care apar evenimente.

Pentru a recapitula, avem de-a face cu 5 operațiuni (*faze*) în succesiune care sunt luate în considerare de buclă în funcționarea sa în ordinea precizată:

1. executarea callback-urilor din timerele `setTimeout()` și `setInterval()`;
2. executarea operațiunilor legate de interacțiunea cu sistemul de operare (cereri pe `http`, de exemplu);
3. executarea operațiunilor aflate în desfășurare așa cum ar fi citirea de fișiere, scriere, citire/scriere stream-uri (orice ar fi în thread pool);
4. executarea callback-urilor din timerele `setImmediate()`;
5. executarea callback-urilor pentru evenimentele `close` sau `socket.destroy()` în cazul lucrului cu stream-uri.

Acești 5 pași constituie ceea ce se numește **o bătaie** - `tick`.

Dacă toate operațiunile sunt încheiate, Node.js va pune la dispoziție terminalul. Mai reține faptul că `https` folosește direct resursele sistemului, pe când `fs` va folosi thread pool-ul. Atenție, modulul `fs` are nevoie de mai multe runde de schimb de informații cu HDD-ul. Thread-ul care va lua acest job, va vedea că ia mult timp și în timp ce sistemul va comunica cu HDD-ul, va face altă muncă. Pur și simplu, nu va aștepta după schimbul greoi de date și informații cu HDD-ul. De aceea este posibil ca anumite rezolvări ale unor task-uri să nu apară în ordinea pe care pașii de mai sus ai unui `tick` îi presupune.

## Exemplu de cod combinat

```javascript
const {promisify} = require('util');
const sleep = promisify(setTimeout);

async function bar (n, s, t) {
  setImmediate(() => process.stdout.write(s));
  await sleep(n);
  return t;
};

async function foo () {
  process.stdout.write('L');
  for (let m of await Promise.all([ bar(20, 'N', 'R'), bar(10, 'T', 'E') ])) {
    process.stdout.write(m);
  };
};

sleep(50).then(() => {
  process.stdout.write('A');
});

new Promise((res) => {
  process.stdout.write('H');
  res('O');
}).then((m) => process.stdout.write(m)).finally(() => process.stdout.write('M'));

queueMicrotask(() => process.stdout.write(' '));
process.nextTick(() => process.stdout.write('L'));
setTimeout(() => process.stdout.write('L'), 100);
setImmediate(() => process.stdout.write('O'));
process.stdout.write('E');
foo();
```

Un mecanism interesant de investigare a ceea ce se petrece la rulare: `node --trace-event-categories v8,node.async_hooks nume_fisier.js` (https://nodejs.org/api/tracing.html#tracing_trace_events). Rulând astfel codul, vei afla când rulează codul JavaScript.

## Resurse

- [Workshop: Broken Promises, The Workshop Edition - Matteo Collina and James Snell, NearForm](https://www.youtube.com/watch?v=yRyfr1Qcf34)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Broken Promises - James Snell, NearForm | Youtube](https://youtu.be/XV-u_Ow47s0)
