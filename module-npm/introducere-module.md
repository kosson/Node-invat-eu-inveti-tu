# Introducere module

În exemplul următor, expunem o funcție numită `adaugă`. Chiar dacă acest modul este importat în mai multe alte module ale programului, obiectul va fi instanțiat o singură dată.

```javascript
let ceva = 10;
module.exports = {
  adaugă: function adaugă (număr) {
    return număt + ceva;
  }
}
```

Acest lucru este posibil pentru că Node.js face un caching al modului cerut de îndată ce a fost instanțiat prima dată. Faptul că ai la îndemână un Singleton, implică posibilitate modificării stării acestuia din mai multe puncte ale programului. Acest comportament nu se va întâmpla dacă folosești funcții cu rol de constructori sau clase. În acest caz ori de câte ori faci `require`, vei instanția un obiect nou.

```javascript
class Ceva {
  constructor (prima) {
    let a = prima;
  }
  aduna () {
    return a++;
  }
}
module.exports = Ceva;
```

În modulul în care faci require, va trebui să instanțiezi obiectul. Atenție, instanțierea obiectului în alt modul face ca acest obiect să fie disponibil doar celui care a făcut `require`.

```javascript
const Ceva = require('./Ceva');
const Chestii = new Ceva();
```

Dacă dorești să beneficiezi de un obiect unic, de un Singleton, vei exporta un obiect instanțiat: `module.exports = new Ceva()`. Există o problemă legată de această abordare. Pe sistemele care nu onorează numele case-sensitive, modulul nu se va comporta ca un Singleton pentru că va fi cache-uit ca instanțe separate. Reține faptul că în cazul în care instanțiezi o clasă înainte să o exporți într-un modul, va rezulta în generarea unui Singleton.

## Node Package Management - npm

Pachetele software scrise de programatorii care contribuie la ecosistemul Node.js, se pot instala folosind `npm install nume_pachet`. Aceste pachete se găsesc într-un depozit pe Internet la http://npmjs.com.

### Căutarea unui pachet

Dacă ai nevoie de un anume pachet sau funcționalitate, poți iniția o căutare folosind comanda `npm search nume_pachet`.

### Informații despre un pachet

Poți afla mai multe detalii despre un pachet, dacă după instalarea sa lansezi comanda `npm view nume_pachet`. Informațiile pe care le poți obține pot urma următorul tipar pe care îl punem drept exemplu pentru express.

```text
express@4.16.4 | MIT | deps: 30 | versions: 261
Fast, unopinionated, minimalist web framework
http://expressjs.com/

keywords: express, framework, sinatra, web, rest, restful, router, app, api

dist
.tarball: https://registry.npmjs.org/express/-/express-4.16.4.tgz
.shasum: fddef61926109e24c515ea97fd2f1bdbf62df12e
.integrity: sha512-j12Uuyb4FMrd/qQAm6uCHAkPtO8FDTRJZBDd5D2KOL2eLaz1yUNdUB/NOIyq0iU4q4cFarsUCrnFDPBcnksuOg==
.unpackedSize: 206.1 kB

dependencies:
accepts: ~1.3.5            content-disposition: 0.5.2 cookie: 0.3.1              encodeurl: ~1.0.2          finalhandler: 1.1.1        methods: ~1.1.2            path-to-regexp: 0.1.7      range-parser: ~1.2.0
array-flatten: 1.1.1       content-type: ~1.0.4       debug: 2.6.9               escape-html: ~1.0.3        fresh: 0.5.2               on-finished: ~2.3.0        proxy-addr: ~2.0.4         safe-buffer: 5.1.2
body-parser: 1.18.3        cookie-signature: 1.0.6    depd: ~1.1.2               etag: ~1.8.1               merge-descriptors: 1.0.1   parseurl: ~1.3.2           qs: 6.5.2                  send: 0.16.2
(...and 6 more.)

maintainers:
- dougwilson <doug@somethingdoug.com>
- hacksparrow <captain@hacksparrow.com>
- jasnell <jasnell@gmail.com>
- mikeal <mikeal.rogers@gmail.com>

dist-tags:
latest: 4.16.4       next: 5.0.0-alpha.7

published 3 months ago by dougwilson <doug@somethingdoug.com>
```

Aceste informații afișate sunt datele din `package.json`.

### Informații despre dependințe

Pentru a investiga dependințele, poți lansa comanda `npm view express dependencies`. Aceasta va returna un obiect care le va prezenta pe acestea.

```javascript
{ accepts: '~1.3.5',
  'array-flatten': '1.1.1',
  'body-parser': '1.18.3',
  'content-disposition': '0.5.2',
  'content-type': '~1.0.4',
  cookie: '0.3.1',
  'cookie-signature': '1.0.6',
  debug: '2.6.9',
  depd: '~1.1.2',
  encodeurl: '~1.0.2',
  'escape-html': '~1.0.3',
  etag: '~1.8.1',
  finalhandler: '1.1.1',
  fresh: '0.5.2',
  'merge-descriptors': '1.0.1',
  methods: '~1.1.2',
  'on-finished': '~2.3.0',
  parseurl: '~1.3.2',
  'path-to-regexp': '0.1.7',
  'proxy-addr': '~2.0.4',
  qs: '6.5.2',
  'range-parser': '~1.2.0',
  'safe-buffer': '5.1.2',
  send: '0.16.2',
  'serve-static': '1.13.2',
  setprototypeof: '1.1.0',
  statuses: '~1.4.0',
  'type-is': '~1.6.16',
  'utils-merge': '1.0.1',
  vary: '~1.1.2'
}
```

De fapt, toate cheile informației returnate cu `npm view nume_pachet` pot fi folosite pentru a obține fragmente separate.

## Instalarea unei versiuni

Utilitarul `npm` permite și instalarea unei anumite versiuni specifice în cazul în care un anumit proiect are nevoie de astfel de precizări pentru a funcționa.

Variantele ar fi următoarele.

```bash
npm install package-name@tag
npm install package-name@version
npm install package-name@version-range
```

De exemplu, ai nevoie de versiunea 4.0.0 a pachetului `express`: `npm install express@4.0.0`. Dacă ai nevoie de oricare versiune într-o plajă: `npm install express@">4.0.0 < 4.1.2"`. Această opțiune s-ar traduce instalează cel puțin versiunea 4.0.0 sau oricare versiune până la 4.1.2.

Atunci când ai nevoie de versiuni după categoria de dezvoltare, poți folosi tagurile `latest`, care va instala ultima versiune, `stable` sau `canary`.
