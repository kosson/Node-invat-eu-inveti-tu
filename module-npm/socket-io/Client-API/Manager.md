## Obiectul Manager

Este un constructor: `new Manager(url[, options])`. Acest constructor returnează un obiect tip `Manager`. Proprietățile acestui obiect sunt chiar opțiunile pe care le poți pasa la mometul construirii socketului în client.

Instanțierea de mai multe ori a obiectului socket, va crea obiecte socket distincte.

```javascript
const socket = io();
const socket2 = io();
```

### Parametrul `url`

Este un String care indică calea de conectarea.

### Parametrul `options`

 Acesta este un obiect de configurare.

#### `path`

Este un element a cărui valoare din oficiu este `/socket.io`, aceasta fiind calea pe care clientul trimite serverului datele. Este ceea ce vede serverul.

#### reconnection

Valoarea din oficiu este `true` și indică dacă un client se va reconecta automat la server în cazul pierderii conexiunii.

#### reconnectionAttempts

Valoarea din oficiu este `Infinity`. Această opțiune indică de câte ori ar trebui ca un client să încerce să se reconecteze la server.

#### reconnectionDelay

Valoarea din oficiu este o secundă (`1000` milisecunde). Această valoare indică clientului cât timp ar trebui să aștepte înainte de a încerca o reconectare. Această valoare va fi afectată prin scădere sau adunare de cea pe care o are setată proprietatea `randomizationFactor`.

#### reconnectionDelayMax

Este timpul pe care clientul trebuie să-l aștepte înainte de a încerca o reconectare. Valoarea din oficiu este de `5000`. Fiecare încercare va mări timpul de întârziere cu 2, fiind totuși influiențat de factorul de randomizare `randomizationFactor`.

#### randomizationFactor

Valoarea din oficiu este de `0.5`. Factorul de randomizarea poate fi definit într-o plajă de la `0`, la `1`.

#### timeout

Este timpul pe care îl va aștepra clientul până când va emite evenimentele `connect_error` și `connect_timeout`. Valoarea din oficiu este `20000`.

#### autoConnect

Este valoarea care în cazul setării inițiale este `true` și menționează faptul că un client se poate reconecta. Dacă într-un anumit caz este nevoie să fie setat la `false`, va trebui să apelezi `manager.open` ori de câte ori crezi că este oportun.

#### query

Este o proprietate a cărei valoare este un obiect. Obiectul va fi compus din parametrii care vor fi trimiși la momentul conectării clientului pe un nameserver. În partea de server, acest obiect poate fi accesat din `socket.handshake.query`.

#### parser

Această proprietate menționează parserul care trebuie folosit pentru datele trimise/primite. Valoarea din oficiu este un obiect `Parser` care vine în pachetul inițial al lui socket.io (`socket.io-parser`).

### Metodele obiectului `Manager`

Managerul este un obiect care gestionează conexiune clientului cu serverul.

#### manager.reconnection([value])

Metoda setează opțiunea `reconnection`. Dacă nu sunt pasați parametru, pur și simplu returnează valoarea existentă a opțiunii. Opțiunea `value` poate fi un `Boolean`.

#### manager.reconnectionAttempts([value])

Metoda setează opțiunea `reconnectionAttempts`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.reconnectionDelay([value])

Metoda setează opțiunea `reconnectionDelay`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.reconnectionDelayMax([value])

Metoda setează opțiunea `reconnectionDelayMax`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.timeout([value])

Metoda setează opțiunea `timeout`, iar dacă nu este pasată vreo valoare, pur și simplu returnează valoarea existentă. Drept parametru acceptă o valoare de tip `Number`.

#### manager.open([callback])

Dacă managerul de conexiune are setarea `autoConnect` cu valoarea `false`, va fi lansată o nouă tentativă de conectare. Argumentul acceptat poate fi o funcție care joacă rol de callback. Acest callback este executat dacă încercarea de conectare reușește/eșuează.

#### manager.connect([callback])

Este un sinonim la `manager.open([callback])`.

#### manager.socket(nsp, options)

Această metodă creează un nou obiect `Socket` pentru namespace-ul curent specificat prin primul argument, care este de tipul `String`. Al doilea parametru este un `Object` de configurare a socketului. Metoda returnează un obiect `Socket`.
