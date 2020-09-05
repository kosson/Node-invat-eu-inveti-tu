# Ordinea de execuție a codului în Node.js

Node.js rulează un singur fir de execuție pentru codul JavaScript și controlează execuția codului asincron folosind un mecanism de tratare a evenimentelor numit *bucla evenimentelor*, în limba engleză *event loop*. Această buclă este ca o roată de bâlci care nu se oprește până când ultimul client nu s-a dat jos. Acesta este și avantajul pe care îl oferă un *event loop* chiar dacă avem cod care se execută într-un singur fir de execuție. Acest lucru permite tratarea a mai multor apeluri HTTP odată, de exemplu.

> Bucla evenimentelor este ceea ce permite lui Node.js să performeze operațiuni I/O — în ciuda faptului că JavaScript are un singur fir de execuție — prin delegarea operațiunilor kernelului sistemului ori de câte ori acest lucru este posibil ( [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/) ).

Această roată/buclă deleagă toată activitatea de evaluare a codului (aducerea unei resurse la distanță, citirea de pe hard, etc.) sistemului de operare prin intermediul componentei software [libuv](http://docs.libuv.org/en/v1.x/), o bibliotecă de cod specializată pe I/O asincron scrisă în C. Nucleul bibliotecii de cod este realizarea unui *loop* pentru I/O sau pentru tratarea evenimentelor. Documentația privind arhitectura `libuv` face următoarele precizări.

> Bucla I/O (sau a evenimentelor) este partea centrală a libuv. Stabilește conținutul pentru toate operațiunile I/O și este gândită să fie legată de un singur fir.

Pentru a ține evidența fiecărei sarcini plasate *kernel*-ului sistemului de operare prin utilizarea mecanismului de *polling* al fiecărui sistem de operare. Polling-ul este un mecanism de interfațare și tratare a evenimentelor legare de intrările și ieșirile de date (*I/O*) ale unui sistem de operare. De exemplu, pentru Linux, `libuv` folosește [epoll](https://en.wikipedia.org/wiki/Epoll) care este gestionarul apelurilor de sistem specializate pe I/O. Pentru executarea unor funcții care au nevoie de putere de calcul așa cum sunt cele criptografice, Node.js folosește `libuv`, care face uz de mai multe fire de execuție (într-un *thread pool*). Acest *thread pool* beneficiază de patru fire de execuție.

Bucla va procesa întreaga stivă a apelurilor și va trimite treburile care trebuie făcute sistemului de operare. Pentru a trata callback-urile, *bucla* le va pune într-o *listă de așteptare*. Acum, că a făcut acest lucru, va trece la următorul apel către un API, care este provenit din *stiva apelurilor* și tot așa până când stiva apelurilor este goală. Concret, în momentul în care o sarcină a fost îndeplinită de sistemul de operare (*kernel*), va trimite rezultatul callback-ului corespondent, care aștepta cuminte într-o *listă de așteptare* (*job queue*) și apoi, va plasa callback-ul în stiva de apeluri, dacă aceasta este goală.

Comportamentul descris mai sus, gestionat de un singur fir de execuție are avantajul conservării resurselor sistemului de operare pentru că fiecărui fir pentru un anumit proces i se alocă resurse separate. Numim astfel de comportament/model *rulare asincronă* și de cele mai multe ori este observat la apelarea unei funcții aparținând unui API, care după rezolvare, se va concluziona prin apelarea unui callback. În Node.js, callback-urile trebuie să fie pasate ca ultim argument. Dacă s-ar aplica un astfel de model pentru câteva sute de conexiuni HTTP, să zicem, taxarea resurselor de server ar fi pe măsură. Este observabilă interdependența dintre mecanismul *buclei* (*event loop*) și cel al *stivei apelurilor* (*callstack*). Întrebarea este cine așteaptă după cine. Pentru a oferi un răspuns, trebuie investigat cum se pornește bucla. Înainte de a începe investigația, trebuie spus că o buclă nu este perpetuă. Acest mecanism devine inactiv de îndată ce *lista de așteptare a callback-urilor* este goală și *stiva apelurilor* este goală.

Așa cum se vede din exemplul propus de Camilo Reyes în articolul său *The Node.js Event Loop: A Developer's Guide to Concepts & Code* publicat la Sitepoint, activitatea buclei poate fi blocată, dar deja API-ul `setTimeout` se află deja în coada de așteptare.

```javascript
setTimeout(
  () => console.log('Am fost în lista de așteptare și acum m-am executat din stivă'),
  5000); // Durata de viață a buclei

const blochezBuclaPentru = Date.now() + 2000;
while (Date.now() < blochezBuclaPentru) {}
```

Ceea ce se petrece este că întreg codul sincron este executat ceea ce va conduce la formarea stivei care va fi procesată. În exemplul de mai sus, callback-ul apucă să fie plasat în lista de așteptare a callback-urilor - *job queue* prin acțiunea API-ului `setTimeout`, care deleagă sistemul de operare să calculeze cinci secunde. Apoi, imediat, se blochează firul execuției pentru două secunde, dar între timp sistemul de operare încă cronometrează chiar dacă bucla este blocată. În două secunde se deblochează bucla, ceea ce este mai puțin decât numărul de secunde cronometrat de sistem. Acest lucru face ca la momentul în care cronometrul sistemului ajunge la cinci, bucla să fie disponibilă pentru a plasa callback-ul în stiva apelurilor pentru a fi executat. Chiar dacă firul principal este blocat, bucla nu este dezactivată, ci este activă.

În cazul în care am bloca firul de execuție și după am programa un callback, cât timp este blocat firul de execuție, nu se va putea face acest lucru. După deblocare, sistemul de operare va începe cronometrarea, după care callback-ul va fi pus în stiva care este goală și va fi executat. Deci, timpului cronometrat este din momentul în care firul de execuție este liber.

Există un lucru foarte interesant care trebuie reținut de fiecare dată când pornești execuția unui program în Node.js. Fișierul de JavaScript pe care îl execuți cu Node.js pentru prima dată, va face parte din secvența de bootstrapping a lui Node.js. Acest lucru înseamnă că event loop-ul nu este pornit decât după ce codul acestui prim fișier este executat. În cazul în care avem callback-uri în cod, acestea vor beneficia de apelarea în *event loop*.

Astfel, în următorul exemplu, abia `// al_doilea.js` va rula promisiunea în *event loop*.

```javascript
// primul.js
new Promise(function (resolve, reject) {
  console.log('o promisiune nou-nouță');
  resolve();
}).then(() => {
  console.log('primul then apare mai târziu');
})
async function ceva () {
  console.log('interesant este când apare');
}
ceva().then(() => {
  console.log('când apare primul then?');
});
process.nextTick(() => {
  console.log('apar imediat după rularea codului JavaScript');
});
queueMicrotask(() => {
  console.log('eu apar ceva mai târziu...');
});
```

În acest exemplu, funcția din promisiune este executată imediat, dar `then` va fi executat de *event loop*. Ca o regulă generală, funcțiile sunt executate la momentul bootstrapping-ului, indiferent că sunt pasate unui constructor ori sunt declarate direct. Apoi vor fi executate în ordine oricare `process.nextTick(() => {console.log('ceva')})` declarat. Din motive istorice, `process.nextTick()` nu înseamnă chiar următorul *tick* de buclă. De fapt înseamnă „rulează codul la finalul executării codului JavaScript”. Trebuie menționat faptul că `nextTick` are cea mai înaltă prioritate. Acest cod va rula înaintea codului aflat în *microtask queue*.

Atunci și numai atunci, va fi apelat codul. Din acest motiv orice `process.nextTick` am avea în codul executat la momentul bootstrapping-ului, va fi executat după ce întregul cod JavaScript va fi executat. Putem spune că `process.nextTick()` și `queueMicrotask()` nu sunt executate în *event loop*. Restul, `setImmediate`, `setTimeout` și `setInterval` rulează în *event loop*.

Ca importanță, urmează prelucrarea codului din *microtask queue*, care sunt codul din `then`-uri. Atenție mare aici, codul `then`-urilor este executat înaintea oricărui `queueMicrotask` (introdus recent pentru a oferi un mecanism similar lui promise.resolve -> rularea a unui fragment de cod ca și cum ai avea au un `then` al unei promisiuni) doar dacă promisiunea se rezolvă pe loc, adică dacă are o parte de execuție asincronă codată. Dacă pui un `resolve()` și rezolvi instant, atunci `then`-urile vor avea precedență. Pur și simplu, codul `then`-urilor se execută sincron pentru că nu au codată partea de asincron.

Modulele ES6 sunt încărcate abia după ce event loop-ul a pornit. Modulele (`.mjs`) sunt de fapt promisiuni, care sunt executate dintr-o promisiune.

Și `al_doilea.js`:

```javascript
const {readFile} = require('fs');
readFile(nume_fisier, () => {
  new Promise(function (resolve, reject) {
    console.log('o promisiune nou-nouță')
    resolve()
  }).then(() => {
    console.log('primul then')
  })
})
```

Adu-ți mereu aminte faptul că primul fragment de cod care este introdus în *callstack* este o funcție `main()` în care rulează întreaga aplicație. Apoi, rând pe rând vor intra în evaluare expresiile, iar funcțiile vor fi introduse în *callstack* pe măsură ce codul se execută.

Conform documentației Node.js, bucla parcurge așa-numite *faze*, unde va efectua operațiunile specifice acelei faze și apoi vor executa toate callback-urile din lista de așteptare a fazei până când acestea vor fi epuizate sau a fost atins numărul maxim de callback-uri. Imediat după, bucla avansează la următoarea fază.

Dacă este întâlnit apelul la un *timer* sau al unui API, Node.js va face ceea ce putem numi o adevărată *programare* a codului. În funcție de tipul apelului, callback-urile sunt introduse în *cozi de așteptare* specifice respectivului API de la care așteaptă un răspuns. Imediat ce apare răspunsul, funcția cu rol de callback așteaptă să intre în callstack, dacă acesta este gol pentru a fi executată. În acest scenariu, rolul buclei este acela de a trimite în *callstack* funcțiile cu rol de callback.

## Anatomia unui tur de event loop

Pentru înțelegerea modului corect de funcționare a unui singur ciclu al buclei, vom consulta două surse de o egală importanță:

- [Design overview | libuv 1.39.1-dev documentation](http://docs.libuv.org/en/v1.x/design.html) și
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

Ambele oferă o imagine clară a parcursului etapelor prin care trece tratarea unui eveniment I/O, cerere HTTP sau apel API din codul aflat în execuție.

Înainte de a intra în parcurgerea operațiunilor specifice buclei (*faze*), există câteva etape pregătitoare:

1. Este actualizată baza de timp pentru ciclul curent pentru a evita problemele care ar putea apărea chiar în cazul apelurilor legate de gestionarea timpului.
2. O buclă nu rulează la infinit. Biblioteca de cod `libuv` verifică dacă bucla este activă (sunt gestionate apeluri, cereri care sunt active sau apeluri care sunt pe puncul de a fi încheiate). Existența unor callback-uri în lista de așteptare ține bucla vie.

Succesiunea fazelor de funcționare a buclei:

1. executarea callback-urilor din timerele `setTimeout()` și `setInterval()`;
2. executarea callback-urilor I/O în așteptare (*pending callbacks*), care au fost amânate dintr-un ciclu anterior;
3. o fază de pregătire necesară la nivel intern (*idle/prepare*) în care sunt rulate callback-uri ce țin de mecanismul buclei;
4. [*faza poll*](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#poll) care implică procesarea evenimentelor I/O în relație cu sistemul de operare cum ar fi citirea de fișiere, scriere, citire/scriere stream-uri (orice ar fi în thread pool);
5. *faza check* - executarea callback-urilor pentru `setImmediate()`;
6. executarea callback-urilor pentru evenimentele `close` sau `socket.destroy()` în cazul lucrului cu stream-uri.

Aceste faze constituie ceea ce se numește **o bătaie** - `tick`. Bucla își începe activitatea odată cu evaluarea codului. Fiecare fază are propria *listă de așteptare* tip FIFO pentru callback-urile pe care trebuie să le execute. Fiecare fază are propriile operațiuni specifice pe care trebuie să le împlinească și abia după acestea, va trimite spre execuție în stiva apelurilor callback-urile din *lista de așteptare*, dacă aceasta este disponibilă. Callback-urile vor fi trimise spre execuție până la epuizarea întregii liste de așteptare sau până când se depășește numărul posibil de callback-uri. Când se va încheia execuția fazei, se va trece la următoarea.

Dacă toate operațiunile sunt încheiate, Node.js va pune la dispoziție terminalul. Mai reține faptul că `https` folosește direct resursele sistemului, pe când `fs` va folosi thread pool-ul. Atenție, modulul `fs` are nevoie de mai multe runde de schimb de informații cu HDD-ul. Thread-ul care va lua acest job, va vedea că ia mult timp și în timp ce sistemul va comunica cu HDD-ul, va face altă muncă. Pur și simplu, nu va aștepta după schimbul greoi de date și informații cu HDD-ul. De aceea este posibil ca anumite rezolvări ale unor task-uri să nu apară în ordinea pe care pașii de mai sus ai unui `tick` îi presupune.

### Faza 1 - Timere

În cazul în care în codul nostru există un `setTimeout()`, `setInterval()`, callback-urile acestora sunt introdus event loop (*buclă*). Timerele specifică o perioadă de timp după care să fi executat un callback. Totuși acea perioadă de timp poate fi prelungită în cazul în care sunt apeluri de sistem care implică o execuție îndelungată sau dacă execuția altor callback-uri prelungește perioada după care va fi executat și cel al timer-ului. Putem spune că timerele indică o perioadă minim garantată. Se poate afirma fără tăgadă că faza de *polling* controlează timpul după care va fi trimis spre execuție callback-ul unui timer datorită posibilelor întârzieri care pot apărea.

### Faza 2 - Callback-urile în așteptare

În această fază sunt executate toate callback-urile pentru anumite operațiuni legate de sistemul de operare cum ar fi erorile TCP care au apărut în stabilirea unei conexiuni la o buclă anterioară. Sau pur și simplu sunt executate callback-uri care au fost *amânate* dintr-o buclă anterioară.

### Faza 3 - Callback-urile idle

Aceste callback-uri țin de aspectele interne ale mecaniului buclei și sunt rulate de fiecare *buclă*.

### Faza 4 - Poll

Înainte de rularea acestei faze sunt apelate callback-uri specifice mecanismului buclei care pregătesc blocarea buclei pentru realizarea operațiunilor I/O cu sistemul de operare. *Poll*, adică *baza firelor de execuție* (*thread poll*) este folosită pentru a opera asicron operațiunile I/O cu sistemul de operare. Există o excepție notabilă legată de I/O de rețea care este întotdeauna realizat pe un singur fir de execuție. Blocarea buclei se va face doar în condițiile în care nu există callback-uri care așteaptă și stiva apelurilor este goală.

Această fază se subîmparte la rândul ei în două etape:

- calcularea timpului cât va bloca *bucla* pentru a realiza operațiunile I/O urmată de
- procesarea evenimentelor din *lista* specifică.

Intrarea în această fază dacă nu sunt programate timere, va avea drept consecință una din următoarele posibile:

- verifică dacă *lista de așteptare* a lui poll este goală. Dacă nu, sunt executate sicron toate callback-urile.
- dacă lista este goală, faza este declarată încheiată și se va intra în faza *check* pentru posibilele `setImmediate` programate. Dacă există callback-uri programate de `setImmediate`, se va intra în faza *check*. Dacă nu există astfel de callback-uri, *bucla* așteaptă ca toatea callback-urile să fie adăugate și apoi vor fi executate imediat.

Când lista de așteptare a fazei *poll* a fost executată, *bucla* verifică dacă există timeri a căror prag programat a expirat, iar dacă există, va executa callback-urile acestora, dacă stiva este goală.

### Faza 5 - Check

Imediat ce s-a încheiat faza *poll*, se vor executa callback-urile pentru toate `setImmediate`.

### Faza 6 - close

Dacă un socket sau o funcție callback sunt oprite brutal (evenimentul `close` sau `socket.destroy`), va fi emis evenimentul `close`. Dacă nu se reușește, va fi emis pe `process.nextTick()`.
În acest moment se încheie un ciclu complet al *buclei*.

### Funcționarea lui process.nextTick()

Diferența dintre `setImmediate()` și `process.nextTick()` este că ultimul rulează înaintea tuturor evenimentelor I/O, pe când `setImmediate()` rulează după ultimul eveniment I/O, care este deja în task queue (*callback queue*). Din perspectiva priorității execuției codului, primul care este executat, dacă este întâlnit în cod, este `process.nextTick(funcție)` căruia îi pasăm un callback cu tot codul care trebuie evaluat. Callback-ul este introdus într-o listă (*nextTick queue*) dedicată tratării funcțiilor callback din `process.nextTick`. Modulele interne ale Node.js folosesc această metodă.

Se folosește API-ul `process.nextTick()`, care amână execuția unei funcții până la următorul ciclu al buclei I/O. Poți considera `process.nextTick()` ca pe un punct de intrare în buclă. Funcționează astfel: se ia un callback ca argument și se introduce în capul *listei de execuție* (task queue) înaintea oricărui eveniment I/O care așteaptă, iar funcția gazdă va returna imediat. Funcția callback va fi invocată de îndată ce bucla începe un nou ciclu (adică când stiva este goală și poate fi trimis spre execuție callback-ul).

### Microtask-uri

O altă listă este cea a **microtask**-uri, în care sunt introduse callback-urile pasate metodelor specifice promisiunilor (*resolve*, *reject* și *finally*) sau când aceasta este rezolvată.

În cazul în care Node.js lucrează cu stream-uri, este rândul tuturor evenimentelor `close` să intre în execuție.

Dacă nu mai există nicio cerere din cele menționate, bucla intră într-o stare de așteptare și se va porni în momentul în care apar evenimente.

### Callback-urile în general

În Node.js spre deosebire de varianta rulată de browsere, există un mod diferit de a programa execuția unui callback. Funcțiile cu rol de callback care sunt programate datorită apelării unui API asincron, de exemplu, sunt gestionate un *strat* de cod scris în C++, care introduce aceste funcții în listele specifice API-urilor pentru care așteaptă. De îndată ce callstack-ul este gol, se vor executa callback-urile din listele de așteptare în funcție de prioritatea listei și încărcare. De fiecare dată când un callback va fi apelat în JavaScript, lista microtaskurilor și cea a callback-urilor, vor fi executate și golite. Abia după ce listele sunt golite, bucla poate continua pentru a procesa un alt callback sau funcție care a intrat în callstack.

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
- [The Node.js Event Loop: A Developer's Guide to Concepts & Code](https://www.sitepoint.com/node-js-event-loop-guide)
