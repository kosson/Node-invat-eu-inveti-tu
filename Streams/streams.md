# Streams

Subiectul `stream`-urilor este legat intim de cel al funcționării sistemelor de operare UNIX. Una din cele mai apreciate facilități ale acestui sistem de operare este capacitatea de a folosi programe mai mici pentru a dezvolta programe mai elaborate. Dar așa cum rândurile de cărămizi sunt legate unele de celelalte prin mortar, așa există și în UNIX un liant foarte puternit numit `pipes`. În română ar fi tradus ca `racorduri` iar în folosirea de zi cu zi în aceste racorduri sunt identificabile prin utilizarea caracterului „pipe” <code>&#124;</code>.

Douglas McIlroy, unul dintre autorii UNIX-ului, a scris o notă în care surprinde cel mai exact rolul acestor „racorduri” (pipes):
> Ar trebui să avem modalități de a conecta programele precum furtunele din grădină - înfiletezi alt segment atunci când este necesar să masezi datele în alt fel. Aceasta este și calea IO. (Douglas McIlroy, 1964)

**IO** înseamnă In/Out - o pradigmă a intrărilor și a ieșirilor. Întrările și ieșirile în Node.js au un comportament asyncron, ceea ce înseamnă că va trebui pasat un callback care va acționa asupra datelor.

Exemple de stream-uri în Node.js:

- un apel HTTP
- o proprietate `process.stdout`

Toate streamurile sunt instanțe ale clasei `EventEmitter` și poate fi accesat direct instanțiind modulul `stream`.

 ```javascript
const stream = require('stream');
 ```

În zona practică, se va folosi rar acest modul pentru că deja există aplicații care implementează deja o vastă tipologie. Majoritatea aplicațiilor Node folosesc stream-urile într-un mod sau altul. De exemplu, serverele http folosesc stream-urile.

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

Streamul Writable `res` este un obiect, care expune metode precum `write()` și `end()`. Aceste metode sunt folosite pentru a scrie date în stream. Streamurile Readable folosesc clasa `EventEmitter` pentru a *anunța* aplicația cu privire la momentul în care datele sunt disponibile pentru a fi citite din stream.

## Aspecte practice

Streams lucrează cu trei concepte:

- *source* - este obiectul de unde vin datele tale;
- *pipeline* - este locul pe unde trec datele, fiind permis aici filtrarea și orice modificări;
- *sink* - este locul unde ajung datele.

Orice stream în Node.js este implementarea a patru clase abstracte:

- `stream.Readable` (este o sursă de date)
- `stream.Writable`
- `stream.Duplex`
- `stream.Transform`

## `stream.Readable`

Există două moduri de a primi date de la un stream Readable:

- flowing și
- non-flowing

### Modul non-flowing

Citirea unui stream Readable se face, de regulă atașând un listener pentru evenimentul `readable`, care semnalează faptul că există date care pot fi citite.

Pentru citirea datelor se folosește metoda `readable`, care citește datele din buffer și returnează un `Buffer` sau un obiect `String` reprezentând un fragment de date. `read()` este o metodă sincronă, iar fragmentul returnat este un obiect `Buffer` (condiția este ca streamul).

## Referințe

[The UNIX Philosophy, Streams and Node.js. Posted on August 29, 2013 by Safari Books Online & filed under Content - Highlights and Reviews, Programming & Development. ](https://www.safaribooksonline.com/blog/2013/08/29/the-unix-philosophy-streams-and-node-js/)
