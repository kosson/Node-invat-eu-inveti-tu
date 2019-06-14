# Introducere `process`

Este un obiect care este specific NodeJS. Acesta oferă informații despre mediul NodeJS și mediul de rulare NodeJS (*runtime*).

Atunci când aplicațiile NodeJS sunt scrise, un lucru foarte important este locul de unde se execută și mai ales căile de acces către fișiere și directoare care se formează. Alte lucruri interesante care pot constitui contextul de execuție pot fi variabilele de sistem, identificatorul de proces pentru aplicația pornită ș.a.m.d. Obiectul specializat `process` oferă toate aceste informații utile.

Pentru a-l accesa direct vei iniția o sesiune `node` și de acolo, apelezi metodele care returnează informația necesară.

```javascript
process.env
```

De exemplu, `process.env` va oferi toate detaliile de mediu a sistemului de operare în care rulează procesul `node`. Poate că unul din cele mai utile metode ale lui `process` este cea prin care determini locul de unde a fost lansată execuția lui node: `process.cwd()`. Acest aspect este important pentru că locul din care este pornit procesul și locul în care se află resursele pot să difere.

## Informații despre mediu

Atunci când sunt necesare informațiile care caracterizează mediul de lucru Node, obiectul `process` oferă câteva proprietăți foarte utile.

### process.versions

Putem afla informații despre toate componentele NodeJS.

```bash
node -p "process.versions"
{
  node: '12.4.0',
  v8: '7.4.288.27-node.18',
  uv: '1.29.1',
  zlib: '1.2.11',
  brotli: '1.0.7',
  ares: '1.15.0',
  modules: '72',
  nghttp2: '1.38.0',
  napi: '4',
  llhttp: '1.1.3',
  http_parser: '2.8.0',
  openssl: '1.1.1b',
  cldr: '35.1',
  icu: '64.2',
  tz: '2019a',
  unicode: '12.1'
}
```

### process.env

Pentru a afla informații despre mediul NodeJS, poate fi consultată proprietatea `env`.

```bash
node -p "process.env"
{
  TERM_PROGRAM: 'Apple_Terminal',
  SHELL: '/bin/bash',
  TERM: 'xterm-256color',
  TMPDIR: '/var/folders/mp/b4l1cp1n4l30w1gcwcb52d000000gn/T/',
  Apple_PubSub_Socket_Render: '/private/tmp/com.apple.launchd.7OLTrYMftW/Render',
  TERM_PROGRAM_VERSION: '404.1',
  TERM_SESSION_ID: '37CC75EC-9BE7-4C4D-A4BA-4AEF2E542E25',
  USER: 'kosson',
  SSH_AUTH_SOCK: '/private/tmp/com.apple.launchd.B2S0XIvYix/Listeners',
  PATH: '/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/opt/X11/bin',
  PWD: '/Users/kosson',
  LANG: 'en_US.UTF-8',
  XPC_FLAGS: '0x0',
  XPC_SERVICE_NAME: '0',
  SHLVL: '1',
  HOME: '/Users/kosson',
  LOGNAME: 'kosson',
  DISPLAY: '/private/tmp/com.apple.launchd.RhbuDlF9p8/org.macports:0',
  _: '/usr/local/bin/node',
  __CF_USER_TEXT_ENCODING: '0x1F5:0x0:0x0'
}
```

### process.release

```bash
node -p "process.release"
{
  name: 'node',
  sourceUrl: 'https://nodejs.org/download/release/v12.4.0/node-v12.4.0.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v12.4.0/node-v12.4.0-headers.tar.gz'
}
```

Pentru a verifica dacă în utilizare avem o versiune lts, putem verifica valoarea de la `node -p "process.release.lts"`. În cazul în care nu este utilizată o versiune *long term*, valoarea va fi `undefined`.

## Lucrul cu stream-urile

Node folosește `stdin`, `stdout` și `stderr` pentru a asigura un canal de comunicare a datelor între aplicație și terminal și sistemul de operare. Aceste stream-uri sunt disponibile și ca proprietăți a obiectului `process`, ceea ce permite realizarea de miniaplicații de comunicare a căror interactivitate este asigurată de modelul bazat pe evenimente al Node (`EventEmitter`).

- `process.stdin`: este un stream readable pentru `stdin` 
- `process.stdout`: este un stream writable pentru `stdout` 
- `process.stderr`: este un stream writable pentru `stderr`

Aceste obiecte I/O sunt implementări ale interfeței `Stream`.

```javascript
process.stdin.setEncoding('utf8');
process.stdin.on('readable', function() {
  var input = process.stdin.read();
if (input !== null) {
  process.stdout.write(input);
  var command = input.trim(); 
  if (command == 'exit') process.exit(0);
} });
```