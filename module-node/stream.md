# Stream-uri

Subiectul `stream`-urilor este legat intim de cel al funcționării sistemelor de operare UNIX. Una din cele mai apreciate facilități ale acestui sistem de operare este capacitatea de a folosi programe mai mici pentru a dezvolta programe mai elaborate. Dar așa cum rândurile de cărămizi sunt legate unele de celelalte prin mortar, așa există și în UNIX un liant foarte puternic numit `pipes`. În română ar fi tradus ca `racorduri`. În folosirea de zi cu zi în aceste racorduri sunt identificabile prin utilizarea caracterului *pipe* <code>&#124;</code>. Pentru a face utiliza racordurile în NodeJS, vom folosi `.pipe()`.

Douglas McIlroy, unul dintre autorii UNIX-ului, a scris o notă în care surprinde cel mai exact rolul acestor „racorduri” (pipes):

> Ar trebui să avem modalități de a conecta programele precum furtunele din grădină - înfiletezi alt segment atunci când este necesar să masezi datele în alt fel. Aceasta este și calea IO. (Douglas McIlroy, 1964)

**IO** înseamnă In/Out - o paradigmă a intrărilor și a ieșirilor. Întrările și ieșirile în NodeJS au un comportament asincron, ceea ce înseamnă că va trebui pasat un callback care va acționa asupra datelor.

Stream-urile lucrează cu fragmente - **chunks**. Acestea sunt trimise între două puncte de comunicare. Streamurile sunt emitere de evenimente. Acest lucru înseamnă că se poate gestiona lucrul cu acestea atașându-se callback-uri pe diferitele evenimente.

## Interfața Stream

În Node, interfața Stream este implementată de modulul `stream`. Acest modul oferă un API care poate fi implementat de mai multe obiecte în Node care doresc să implementeze interfața `stream`. Exemple de `stream`-uri în NodeJS:

-   un apel HTTP,
-   o proprietate `process.stdout`.

Stream-urile pot fi folosite pentru a citi, pentru a scrie sau ambele operațiuni în același timp. Fii foarte atentă la memorie pentru că gestionând streamuri cu `fs`, nu vei putea manipula fișiere de mairi dimensiuni. NodeJS poate ține în memorie doar 1.67Gb. Dacă ai o resursă dincolo de această limitare, o eroare `heap out of memory` va fi emisă. Această limitate poate fi depășită.

Toate stream-urile sunt instanțe ale clasei `EventEmitter` și pot fi accesate direct instanțiind modulul `stream`. Toate obiectele care sunt stream-uri expun o metodă `eventEmitter.on()`. Această metodă permite unei funcții sau mai multora să se atașeze pe evenimente emise de obiect. Funcțiile atașate evenimentelor vor fi executate sincron.

 ```javascript
const stream = require('stream');
// creezi un stream Readable
var unStrReadable = require('stream').Readable;
// instanțiezi obiectul Readable
var streamR = new unStrReadable;
streamR.push('salut');
streamR.push('Irimia!');
streamR.push(null); // trimiterea datelor s-a încheiat
// trimite datele în consolă
streamR.pipe(process.stdout);
// execută cu node numeFisier.js
 ```

Majoritatea aplicațiilor Node folosesc `stream`-urile într-un fel sau altul. Totuși există excepții când dorești să lucrezi cu `Buffer`e, de exemplu. Să presupunem că faci un `Buffer` în care introduci o imagine codată base64. Pentru a o scrie pe hard disk, mai întâi ai nevoie să introduci conținutul `Buffer`-ului într-un stream care să poată fi citit.

```javascript
var unit = '' || `${process.env.BASE_UNIT}`;
var user = '' || `${process.env.BASE_USER}`;
function createRecord (data) {
    //TODO: urmeaza standardul BagIt
    var calea = `${__dirname}/${process.env.REPO}/${unit}/${user}/${uuidv1()}`; // numele directorului resurselor va fi un UUID v1
    var bag = bagit(calea, 'sha256', {'Contact-Name': `${user}`});
    // separă extensia
    // var ext = data.split(';')[0].match(/jpeg|png|gif/)[0];

    var b64data = data.replace(/^data:image\/\w+;base64,/, "");

    // creează un buffer specializat
    var buffy = Buffer.from(b64data, 'base64');
    // poți scrie datele pe hard direct
    // fs.writeFile('imagine.png', buffy, 'base64', () => {
    //     console.log('Am scris fișierul');
    // });

    // introdu Buffer-ul într-un stream
    var strm = new Readable();
    strm.push(buffy);
    strm.push(null);
    strm.pipe(bag.createWriteStream('cover.png'));

    bag.finalize(function () {
        console.log('Am creat bag-ul');
    });
}
```

De exemplu, serverele `http` folosesc stream-urile.

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // req este un http.IncomingMessage, care este un Readable Stream
  // res este un http.ServerResponse, care este un Writable Stream

  let body = '';
  // Setează ca datele să fie codate UTF8.
  // Dacă nu este specificată codarea, vor fi primite doar obiecte Buffer.
  req.setEncoding('utf8');

  // Stream-urile Readable emit evenimente de tip 'data' imediat de un receptor este atașat
  req.on('data', (chunk) => {
    body += chunk;
  });

  // evenimentul de tip 'end' indică primirea întregului corp
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      // trimite ceva util utilizatorului
      res.write(typeof data);
      res.end();
    } catch (er) {
      // nu a ajuns un JSON!!!
      res.statusCode = 400;
      return res.end(`eroare: ${er.message}`);
    }
  });
});

server.listen(8888);
```

Stream-ul `res` este un obiect `Writable`, care expune metode precum `write()` și `end()`. Aceste metode sunt folosite pentru a scrie date în stream. Stream-urile `Readable` folosesc clasa `EventEmitter` pentru a *anunța* aplicația cu privire la momentul în care datele sunt disponibile pentru a fi citite din stream.

## Concepte și clase

Streams lucrează cu trei concepte:

-   *source* (*sursă*), fiind obiectul de unde vin datele tale;
-   *pipeline* (*conductă*), fiind locul pe unde trec datele, fiind permise aici filtrarea și orice modificări ale datelor;
-   *sink* (*destinație*), fiind locul unde ajung datele.

Orice stream în NodeJS este implementarea a patru clase abstracte:

-   `stream.Readable` (este o sursă de date, pate fi creat cu `fs.createReadableStream()`),
-   `stream.Writable` (creat cu `fs.createWriteStream()`),
-   `stream.Duplex` (streamuri care sunt `Readable` și `Writable`),
-   `stream.Transform` (streamuri duplex, care permit transformarea datelor).

## Streamuri care citesc - stream.Readable

Stream-urile `Readable` pot fi considerate a fi sursa datelor. Toate stream-urile care citesc implementează interfața pe care o definește clasa `stream.Readable`. Documentația oficială menționează câteva exemple:

- răspunsuri HTTP la client,
- cererile care ajung la server,
- streamuri read pentru `fs`,
- streamuri zlib,
- streamuri crypto,
- socketuri TCP,
- procese copil `stdout` și `stderr`,
- `process.stdin`.

Există două moduri de a primi date de la un stream `Readable`:

- flowing și
- pauză.

### Modul flowing

Un stream care este în modul flowing va oferi date unei aplicații cât de repede este posibil folosind evenimentele pe care interfața `EventEmitter` le pune la dispoziție.

### Modul pauză

În modul pauză, datele pot fi citite folosind metoda `read()`, care oferă posibilitatea de a citi bucată cu bucată ce există în obiectul buffer.

Toate stream-urile `Readable` pornesc în modul pauză. Curgerea datelor poate fi declanșată prin următoarele metode:

- atașarea unui eveniment `data` cu un receptor care să facă ceva cu datele,
- apelarea metodei `resume()` pe stream,
- apelarea metodei `pipe()` pentru a trimite datele unui stream `Writable`.

Dacă este necesar, stream-ul `Readable` poate fi pus în modul pauză folosind una din următoarele metode:

- apelarea metodei `pause()` dacă nu există pipe-uri,
- dacă există pipe-uri și sunt eliminate toate acestea prin folosirea metodei `unpipe()`.


## Clasa stream.Writable

Sunt stream-urile în care se pot scrie date.

## Clasa stream.Readable

## Clasa stream.Duplex

Sunt acele stream-uri în care se poate scrie și citi deopotrivă.

## Clasa stream.Transform

Stream-urile de transformare sunt acele stream-uri `Duplex` care implementează interfețele `Readable` și `Writable`. De exemplu, streamurile `zlib` și `crypto` sunt de tip `Transform`.

## Referințe

- [stream, Node.js v12.3.1 Documentation](https://nodejs.org/api/stream.html)
- [The UNIX Philosophy, Streams and Node.js. Posted on August 29, 2013 by Safari Books Online & filed under Content - Highlights and Reviews, Programming & Development.](https://www.safaribooksonline.com/blog/2013/08/29/the-unix-philosophy-streams-and-node-js/)
- [stream-handbook](https://github.com/substack/stream-handbook)
- [Stream Adventure](https://www.npmjs.com/package/stream-adventure)
