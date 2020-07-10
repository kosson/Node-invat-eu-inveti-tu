# Event loop

Event loop (bucla) din Node.js este mecanismul care permite execuția de operațiuni I/O astfel încât să nu blocheze firul principal de execuție.

În Node.js spre deosebire de varianta rulată de browsere, există un mod diferit de a programa execuția unui callback.

Putem să ne imaginăm bucla NodeJS ca pe un `while` care nu-și termină niciodată execuția. Un ciclu al buclei evenimentelor este un `tick` (precum o *bătaie* a secundarului unui ceas). Punctul de intrare în bucla evenimentelor este `process.nextTick()` căruia îi pasăm un callback cu tot codul care trebuie evaluat. Modulele interne ale Node.js folosesc această metodă.

În cazul în care în codul nostru există un `setTimeout()`, `setInterval()` sau un `setImmediate()`, callback-ul acestora este introdus event loop (*buclă*). Mai sunt introduse în buclă apelurile de sistem (operating system tasks) cum ar fi cazul în care pe `http` vine o cerere care trebuie gestionată. În buclă mai pot intra procese care sunt legate de lucrul cu resursele sistemului de operare cum ar fi, de exemplu, citirea unui fișier de pe disc folosind `fs`.

Un alt amănunt foarte important care trebuie reținut este că bucla NodeJS are la dispoziție un singur fir de execuție. Există câteva componente ale bibliotecii standard de cod care nu sunt single threaded, fiind executate în afara buclei. Pentru executarea unor funcții care au nevoie de putere de calcul pentru a le duce la îndeplinire așa cum sunt cele criptografice, NodeJS folosește modulul `libuv`, care face uz de mai multe fire de execuție (într-un *thread pool*). Acest *thread pool* beneficiază de patru fire de execuție.

## Anatomia unui tick

Mecanismul de funcționare al buclei se uită mai întâi dacă există timere care au callback-uri, mai exact pentru `setTimeout()` și `setInterval()`. Sunt executate callback-urile. Pe măsură ce acestea își termină execuția, bucla se va uita la operațiunile cu sistemul de operare și apoi la operațiunile cu resursele. Când toate callback-urile au fost executate, bucla se va uita dacă există vreun `setImmediate()` și va executa callback-urile acestora.

În cazul în care NodeJS lucrează cu stream-uri, este rândul tuturor evenimentelor `close` să intre în execuție.

Dacă nu mai există nicio cerere din cele menționate, bucla intră într-o stare de așteptare și se va porni în momentul în care apar evenimente.

Pentru a recapitula, avem de-a face cu 5 operațiuni în succesiune care sunt luate în considerare de buclă în funcționarea sa în ordinea precizată:

1. executarea callback-urilor din timerele `setTimeout()` și `setInterval()`;
2. executarea operațiunilor legate de interacțiunea cu sistemul de operare (cereri pe `http`, de exemplu);
3. executarea operațiunilor aflate în desfășurare așa cum ar fi citirea de fișiere, scriere, citire/scriere stream-uri (orice ar fi în thread pool);
4. executarea callback-urilor din timerele `setImmediate()`;
5. executarea callback-urilor pentru evenimentele `close` în cazul lucrului cu stream-uri.

Acești 5 pași constituie ceea ce se numește **o bătaie**: `tick`.

Dacă toate operațiunile sunt încheiate, Node.js va pune la dispoziție terminalul. Mai reține faptul că `https` folosește direct resursele sistemului, pe când `fs` va folosi thread pool-ul. Atenție, modulul `fs` are nevoie de mai multe runde de schimb de informații cu HDD-ul. Thread-ul care va lua acest job, va vedea că ia mult timp și în timp ce sistemul va comunica cu HDD-ul, va face altă muncă. Pur și simplu, nu va aștepta după schimbul greoi de date și informații cu HDD-ul. De aceea este posibil ca anumite rezolvări ale unor task-uri să nu apară în ordinea pe care pașii de mai sus ai unui `tick` îi presupune.

## Resurse

- [Workshop: Broken Promises, The Workshop Edition - Matteo Collina and James Snell, NearForm](https://www.youtube.com/watch?v=yRyfr1Qcf34)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
