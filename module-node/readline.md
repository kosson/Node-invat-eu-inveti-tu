# Modulul readline

Acesta oferă o interfață pentru citirea datelor dintr-un stream Readable cum este `process.stdin`, de exemplu și accesarea linie cu linie a acestora.
Pentru a-l accesa ai nevoie să-l apelezi `const readline = require('readline');`.

Pentru a instanția o interfață care va putea citi rând cu rând, este nevoie de a invoca metoda specifică a obiectului constituit.

```javascript
const readline = require('readline');
var citescLinie = readline.createInterface();
```

Fiecare o astfel de instanțiere a interfeței va fi legată de un singur stream `Readable` de input și unul singur `Writable` de output.

Fiind o interfață bazată pe evenimente, la momentul când se termină de lucru cu un stream `Readable`, de regulă se va emite un eveniment `close`.

## Evenimentul close

Acest eveniment este emis atunci când este invocată metoda `citescLinie.close()`, dacă ar fi să urmăm exemplul de mai sus. Mai este emis un astfel de eveniment atunci când streamul de `input` primește un eveniment `end`, când stream-ul de `input` primește codul pentru combinația de <ctrl>-D, ceea ce indică EOT - End of Transmission sau când stream-ul `input` primește combinația <ctrl>-C pentru a semnala `SIGINT`.


## Evenimentul line

Acesta este emis atunci când streamul de `input` este semnalat că în stream a apărut un caracter end-of-line `\n`, `\r`  sau `\r\n`.

```javascript
const readline = require('readline');
var citescLinie = readline.createInterface();
citescLinie.on('line', (input) => {
  console.log(`Am primit linia: ${input}`);
});
```

## Evenimentul pause

Acest eveniment este emis atunci când apar două situații: streamul de `input` este pe `pause` sau acest stream primește evenimentul SIGCONT.

```javascript
citescLinie.on('pause' () => {
  console.log('S-a oprit citirea liniilor');
});
```

## Evenimentul resume

Este evenimentul care va reporni citirea liniilor.

```javascript
citescLinie.on('resume', () => {
  console.log('S-a reluat citirea liniilor');
});
```

## Eveniment SIGCONT

Acest eveniment este emis atunci când un proces Node este adus din background. În background este trimis un proces atunci când apare combinația <ctrl>-Z, adică `SIGTSTP`. Dacă streamul a fost pus pe pauză înainte ca acest eveniment să apară, SIGCONT nu va mai fi emis.

```javascript
citescLinie.on('SIGCONT', () => {
  // folosește metoda prompt() pentru a reanima
  citescLinie.prompt();
});
```

## Eveniment SIGINT

Este emis atunci când un stream `input` sesizează combinația <ctrl>-C, ceea ce înseamnă `SIGINT`. Dacă nu sunt event listeners pentru acest caz, va fi emis un eveniment `pause`.

```javascript
citescLinie.on('SIGINT' () => {
  citescLinie.question('Chiar vrei să întrerupi?', (answer) => {
    if (answer.match(/^Da?$/i)) citescLinie.pause();
  });
});
```

## citescLinie.close()

Această metodă oprește instanța interfaței `readline.Interface` și nu va mai controla streamurile `input` și `output`.

## citescLinie.pause()

Această metodă permite oprirea unui stream care poate fi reluată ulterior.

## citescLinie.prompt([preserveCursor])

Dacă `preserveCursor` este `true` cursorul nu va fi resetat la `0`. Dacă un stream este oprit, vei putea să-l repornești cu `citescLinie.prompt()`.

## citescLinie.question(întrebare, calllback)

Stringul menționat la `întrebare` va fi prezentat în prompt. Callback-ul va fi o funcție care se va executa ca răspuns la întrebarea pusă în prompt. Dacă streamul `input` se afla în stare de pauză, `citescLinie.question` poate relua.

## citescLinie.resume()

Dacă streamul este în pauză, această metodă îl poate relua.

## citescLinie.setPrompt(prompt)

Această metodă setează promptul care va fi scris în `output` de fiecare dată când este apelat `citescLinie.prompt()`.

## citescLinie.write(data[,key])

Data poate fi un string. Key reprezintă ceea ce ar trebui să fie un caracter în combinațiile cu posibilele taste speciale.

```javascript
citescLinie.write('Acesta este un test');
citescLinie.write(null, {ctrl: true, name: 'u'});
// este enulată apăsarea CTRL+U care șterge linia anterioară.
```

Argumentul obiect poate fi folosit doar dacă se folosește un TTY text. Dacă este menționat obiectul, data nu va mai fi luată în considerare. Dacă streamul a fost întrerupt, se poate relua prin apelul acestei metode.

## readline.clearLine(stream, dir)

Valoarea `stream` poate fi un `stream.Writable`. La `dir` poți avea următoarele opțiuni: `-1` va șterge tot ce este la stânga cursorului, `1` va șterge tot de la dreapta cursorului și `0`, care va șterge toată linia.

## readline.clearScreenDown(stream)

TODO: termină de completat!!!