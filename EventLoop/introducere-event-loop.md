# Event loop

În Node.js spre deosebire de JS curat, există un mod diferit de a programa execuția unui callback.

Putem să ne imaginăm bucla Node.js ca pe un `while` care nu-și termină niciodată execuția. De fiecare dată când închide o buclă, numim acel ciclu un `tick` (precum o *bătaie* a secundarului unui ceas).

În cazul în care în codul nostru există un `setTimeout`, `setInterval` sau un `setImmediate`, callback-ul acestora este introdus în buclă. Mai sunt introduse în buclă apelurile de sistem (operating system tasks) cum ar fi cazul în care pe `http` vine o cerere care trebuie gestionată. În buclă mai pot intra procese care sunt legate de lucrul cu resursele sistemului de operare cum ar fi, de exemplu, citirea unui fișier de pe disc folosind `fs`.

Un alt amănunt foarte important care trebuie reținut este că bucla Node.js are la dispoziție un singur fir de execuție. Există câteva componente ale bibliotecii standard de cod care nu sunt single threaded, fiind executate în afara buclei. Pentru executarea unor funcții care au nevoie de putere de calcul pentru a le duce la îndeplinire așa cum sunt cele criptografice, Node.js folosește modulul `libuv`, care face uz de mai multe fire de execuție (într-un *thread pool*). Acest *thread pool* beneficiază de patru fire de execuție.

## Anatomia unui tick

Mecanismul de funcționare al buclei se uită mai întâi dacă există timere care au callback-uri, mai exact pentru `setTimeout` și `setInterval`. Sunt executate callback-urile. Pe măsură ce acestea își termină execuția, bucla se va uita la operațiunile cu sistemul de operare și apoi la operațiunile cu resursele. Când toate callback-urile au fost executate, bucla se va uita dacă există vreun `setImmediate` și va executa callback-urile acestora.

În cazul în care Node.js lucrează cu stream-uri, este rândul tuturor evenimentelor `close` să intre în execuție.

Dacă nu mai există nicio cerere din cele menționate, bucla întră într-o stare de așteptare și se va porni în momentul în care apar evenimente.

Pentru a recapitula, avem de-a face cu 5 operațiuni în succesiune care sunt luate în considerare de buclă în funcționarea sa în ordinea precizată:

1. executarea callback-urilor din timerele `setTimeout` și `setInterval`;
2. executarea operațiunilor legate de interacțiunea cu sistemul de operare (cereri pe `http`, de exemplu);
3. executarea operațiunilor aflate în desfășurare așa cum ar fi citirea de fișiere, scriere, citire/scriere streamuri (orice ar fi în thread pool);
4. executarea callback-urilor din timerele `setImmediate`;
5. executarea callback-urilor pentru evenimentele `close` în cazul lucrului cu stream-uri.

Acești 5 pași constituie ceea ce se numește **o bătaie**: `tick`.

Dacă toate operațiunile sunt încheiate, Node.js va pune la dispoziție terminalul. Mai reține faptul că `https` folosește direct resursele sistemului, pe când `fs` va folosi thread pool-ul. Atenție, modulul `fs` are nevoie de mai multe runde de schimb de informații cu HDD-ul. Thread-ul care va lua acest job, va vedea că ia mult timp și în timp ce sistemul va comunica cu HDD-ul, va face altă muncă. Pur și simplu, nu va aștepta după schimbul greoi de date și informații cu HDD-ul. De aceea este posibil ca anumite rezolvări ale unor task-uri să nu apară în ordinea pe care pașii de mai sus ai unui `tick` îi presupune.
