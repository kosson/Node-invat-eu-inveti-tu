# Modulul `readline`

Modulul oferă o interfață pentru a citi date dintr-un stream `Readable` așa cum este `process.stdin`.

```javascript
const readline = require('readline');
```

Pentru a instanția clasa `readline.Interface` va trebui să apelăm: `readline.Interface()`. Fiecare instanță este asociată cu un unic stream `Readable` și un unic steam `Writable`.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Foarte interesant?', (raspuns) => {
  // TODO: Log the answer in a database
  console.log(`acest răspuns merge către un mecanism de stocare: ${raspuns}`);
  rl.close();
});
```

## Evenimente

### Evenimentul `close`

Acest eveniment este emis în următoarele condiții:

- când este apelat `rl.close()` ceea ce înseamnă că instanța `readline.Interface` nu mai controlează stream-urile `input` și `output`;
- când stream-ul de `input` primește un eveniment `end`;
- când stream-ul de `input` primește `<ctrl>-D` care semnalează un *end-of-transmission* (EOT);
- când stream-ul de `input` primelte `<ctrl>-C` pentru a semnala `SIGINT` câtă vreme nu există un `SIGINT` înregistrat în instanța `readline.Interface`;

De îndată ce evenimentul `close` este emis, instanța `readline.Interface` este terminată.

### Evenimentul `line`

Evenimentul `line` este emis ori de câte ori stream-ul de input primește un input end-of-line (`\n`, `\r` sau `\r\n`). Acest eveniment apare atunci când utilizatorul apasă tasta <Enter> sau <Return>.

Funcția cu rol de listener este apelată cu un string care conține o singură linie sau inputul primit.

```javascript
rl.on('line', (input) => {
  console.log(`Am primit: ${input}`);
});
```

### Evenimentul `pause`

Acest eveniment este emis în următoarele condiții:

- stream-ul de input este oprit;
- stream-ul de input nu este oprit și primește un eveniment `SIGCONT` (vezi evenimentele `SIGTSTP` și `SIGCONT`).

```javascript
rl.on('pause', () => {
  console.log('Am făcut o pauză.');
});
```

### Evenimentul `resume`

Evenimentul este emis atunci când stream-ul de input este reluat.
Funcția listener este apelată fără a pasa niciun argument.

```javascript
rl.on('resume', () => {
  console.log('Citirea liniei a fost reluată.');
});
```

### Evenimentul `SIGCONT`

Acest eveniment este emis atunci când un proces Node.js a fost trimis în background folosind <ctrl>-Z (i.e. SIGTSTP) și apoi este adus înapoi în prim plan folosind fg(1p).

Dacă stream-ul de input a fost oprit înainte de inițierea cererii SIGTSTP, evenimentul nu va fi emis. Funcția listener este invocată fără a pasa vreun argument.

```javascript
rl.on('SIGCONT', () => {
  // `prompt` will automatically resume the stream
  rl.prompt();
});
```

Acest eveniment nu are suport în Windows.

### Evenimente `SIGINT`

Acest eveniment este emis de câte ori un stream primește un input <ctrl>-C input cunoscut drept SIGINT. Dacă nu există niciun listener pentru evenimentul `SIGINT`, când stream-ul de input primește un `SIGINT`, evenimentul `pause` va fi emis.

Funcția cu rol de listener este invocată fără a pasa niciun argument.

```javascript
rl.on('SIGINT', () => {
  rl.question('Vrei să ieși? ', (answer) => {
    if (answer.match(/^y(es)?$/i)) rl.pause();
  });
});
```

### Evenimente `SIGTSTP`

Evenimentul `SIGTSTP` este emis atunci când stream-ul primește un input <ctrl>-Z, cunoscut ca `SIGTSTP`. Dacă nu există niciun listener pentru un stream de inoput care primește acest eveniment, procesul Node.js va fi trimis în background.

Funcția listener este invocată fără a pasa vreun argument.

```javascript
rl.on('SIGTSTP', () => {
  // Va suprascrie SIGTSTP și va preîntâmpina programul să meargă în background
  console.log('Am prevenit SIGTSTP.');
});
```

Acest eveniment nu are suport în Windows.

## Metode

### Metoda `rl.close()`

Această metodă închide instanța `readline.Interface` și oprește constrolul asupra streamurilor de input și output. Atunci când această metodă este apelată, se va emite evenimentul `close`. Atunci când este emis evenimentul `close`, nu se vor opri imediat toate celelalte evenimente să mai fie emise de `readline.Interface`.

### Metoda `rl.pause()`

Această metodă pune stream-ul de input în pauză fiind posibilă reluarea sa dacă acest lucru este necesar.

Apelul metodei nu va avea ca efect oprirea imediată a altor evenimente în a mai fi emise de instanța `readline.Interface`.

### Metoda `rl.prompt([preserveCursor])`

Argumentul `preserveCursor` este un <boolean>. Dacă are valoarea `true`, cursorul va fi resetat la `0`.

Această metodă scrie în instanțele `readline.Interface` un prompt pe o nouă linie în output pentru a oferi unui utilizator o nouă locație la care să fie inserat input-ul.

Atunci când va fi apelat `rl.prompt()`, se va relua stream-ul de input dacă acesta a fost întrerupt. Dacă `readline.Interface` a fost creat având output-ul setat la `null` sau `undefined`, prompt-ul nu a fost scris.

### Metoda `rl.question(query, callback)`

#### Argumente

- `query` <string> Este o expresie sau un query pentru a scrie în `output` adăugat la prompt.
- `callback` <function> Este un callback care este invocat cu inputul utilizatorului ca răspuns la query.

### Metoda `rl.resume()`

### Metoda `rl.setPrompt(prompt)`

### Metoda `rl.write(data[, key])`

### Metoda `rl[Symbol.asyncIterator]()`

### Metoda `readline.clearLine(stream, dir[, callback])`

### Metoda `readline.clearScreenDown(stream[, callback])`

### Metoda `readline.createInterface(options)`

### Metoda `completer`

### Metoda `readline.cursorTo(stream, x, y[, callback])`

### Metoda `readline.emitKeypressEvents(stream[, interface])`

### Metoda `readline.moveCursor(stream, dx, dy[, callback])`



