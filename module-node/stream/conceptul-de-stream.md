# Un concept central: stream-uri

Un *stream* este un flux de date dispuse secvențial, care sunt emise de o sursă fragment după fragment (caractere sau bytes) și se îndreaptă către o destinație. În sfera computerelor și în special în Node.js, streamurile sunt date care *curg* ca urmare a unui eveniment `EventEmitter` între diferitele părți funcționale ale unui program. Sursele unui stream pot fi multiple: un fișier, memoria computerului, dispozitive de input cum ar fi mouse-ul, de exemplu sau tastatura. Din momentul în care este deschis un stream, datele vor curge în fragmente către destinația care le și *consumă*.

Streamurile care citesc datele de la o sursă se numesc *readable*. La destinație, fragmentele de date sunt prelucrate cu ceea ce se numește *writable* stream, iar datele ajung într-un fișier, în memorie sau chiar în linia de comandă. Există și o problemă legată de modul cum sunt *consumate* datele dintr-un stream. În cazul Node.js, presiunea (*backpressure*) datelor din upstream este reglată în funcție de capacitatea de prelucrare a downstream-ului. Pentru a menține o balanță între capacitatea de prelucrare a datelor și viteza cu care acestea sunt furnizate spre prelucrare, ambele obiecte stream (*readable* și *writable*) folosesc un Buffer intern de date de 16384 bytes (16Kb) chiar în memorie. Stream-urile *writable* folosesc metoda `stream.write(data)` pentru a scrie în Bufferul intern, iar cele *readable* folosesc metoda `stream.push(data)`. Când Buffer-ul intern este saturat cu date, Node.js emite un eveniment `data` precum în `stream.on('data', (chunk) => {})`. Datele care se află în `chunk` sunt cele care au fost în Buffer-ul intern.

Pentru a exemplifica, putem lua o pagină web să o trimitem în terminal.

```javascript
const request = require('request');
request('https://europa.eu').pipe(process.stdout);
```

O procedură similară angajează un scraper de pagini web, de exemplu. Totuși, cel mai util lucru în cazul stream-urilor este că între sursă și destinație poți interpune software care să modifice într-un mod util datele.

Avantajul tratării datelor prin folosirea stream-urilor este superioară citirii și introducerii în memorie a unui întreg fișier. Pur și simplu este vorba despre posibilitatea de a prelucra date de dimensiuni foarte mari folosind memorie care este limitată. În cazul fișierelor de mari dimensiuni citirea urmată de introducerea lor în memorie este nefezabilă din punct de vedere al rezurselor de memorie. Astfel, stream-urile oferă metoda optimă. Ca să avem o dimensiune a limitării, un fișier CSV sau JSON poate ocupa o fereastră limitată de memorie de 536MB (limitare impusă de motorul V8 pe care Node.js îl folosește). Ce se întâmplă atunci când dorești să lucrezi cu fișiere de dimensiuni mai mari, de ordinul gigabiților, de exemplu.

Stream-urile emit evenimente pentru că implementează `EventEmitter`. Acestor evenimente li se pot atașa funcții care să gestioneze datele. Cele mai bune aspecte funcționale ale Node.js au la bază stream-urile.

Subiectul `stream`-urilor este legat intim de cel al funcționării sistemelor de operare UNIX. Una din cele mai apreciate facilități ale acestui sistem de operare este capacitatea de a folosi programe mai mici pentru a dezvolta programe mai elaborate. Dar așa cum rândurile de cărămizi sunt legate unele de celelalte prin mortar, așa există și în UNIX un liant foarte puternic numit `pipes` (vezi [Pipelines din manualul de Bash](http://www.gnu.org/software/bash/manual/bash.html#Pipelines)). În română ar putea fi tradus ca `racorduri`. În folosirea de zi cu zi, aceste *racorduri* sunt identificabile prin utilizarea caracterului *pipe* <code>&#124;</code>. Pentru a face utiliza racordurile în Node.js, vom folosi `.pipe()`. Urmând acest model, datele de input ale unui program sau componentă software pot fi datele de output ale alteia. În UNIX, două sau mai multe programe sunt conectate prin caracterul `|`, care în limba engleză se numește `pipe`. Am putea traduce în limba română ca *racord*.

Chiar dacă nu suntem programatori de UNIX, vom explora un exemplu de funcționare a mai multor progrămele mici folosite în mod curent într-un terminal, de data aceasta de GNU/Linux.

```bash
ls -l | grep "nicolaie" | sort -n
```

Secvența de mai sus listează numele de fișiere (`ls`) în a căror denumire se găsește fragmentul de text `nicolaie`, după care sortează ceea ce a găsit. Cele trei programe: `ls`, `grep` și `sort` au stabilit un flux de prelucrare, de fapt. Ceea ce a găsit comanda `ls` va fi pasat prin `pipe` (`|`) către următoarea comandă `grep`, care are misiunea de a detecta în toate denumirile tuturor fișierelor din directorul în care se execută fluxul de comenzi, fragmentul de text `nicolaie` și în final, rezultatul va fi pasat prin pipe din nou către ultima comandă `sort`, care va returna spre afișare rezultatul la care s-a ajuns.

Ceea ce merită remarcat este faptul că, fiecare componentă din lanțul de prelucrare, poate fi perceput ca un adevărat filtru.

Douglas McIlroy, unul dintre autorii UNIX-ului, a scris o notă în care surprinde cel mai exact rolul acestor **racorduri** (*pipes*):

> Ar trebui să avem modalități de a conecta programele precum furtunele din grădină - înfiletezi alt segment atunci când este necesar să masezi datele în alt fel. Aceasta este și calea IO. (Douglas McIlroy, 1964)

**IO** înseamnă In/Out - o paradigmă a intrărilor și a ieșirilor. Intrările și ieșirile în Node.js au un comportament **asincron**, ceea ce înseamnă că va trebui pasat un callback care va acționa asupra datelor.

## Stream-uri în JavaScript

De ceva vreme conceptul de stream-uri a pătruns și în ecosistemul limbajului de programare JavaScript, mai ales prin adoptarea de către browsere a [API-ului Streams](https://streams.spec.whatwg.org)). În acest moment, stream-urile sunt folosite pentru a prelua corpul unei cereri HTTP care a reușit (ca rezultat al unui `fetch`) și transformarea acestuia într-un stream pentru o prelucrare ulterioară.

Stream-urile lucrează cu fragmente, care în limba engleză se numesc **chunks**. Conform textului documentului are reglementează stream-urile în JavaScript ([2. Models](https://streams.spec.whatwg.org/#model)), un *chunk* este:

> un singur fragment de date care este scris sau care este citit dintr-un stream. Poate fi de orice tip; stream-urile pot conține chunks de tipuri diferite. Un chunk va fi cel mai adesea cea mai mică unitate de date pentru un anumit stream; de exemplu, un byte stream poate conține chunks ca `Uint8Array`-uri de 16KiB în loc de bytes unici.

Acestea sunt trimise între două puncte de comunicare. Stream-urile emit evenimente ceea ce înseamnă că se pot atașa funcții de callback pe acestea. În cazul Node.js, datele unui *chunk* sunt cele care au fost scrise în Buffer-ul instern al stream-ului.

## Tipuri de stream-uri în Node.js

În cazul lucrului cu fișierele de mari dimensiuni, trebuie să privim întregul ca un set de fragmente, care pot fi prelucrate. Uneori, în lucrările de specialitate veți găsi aceste fragmente numite ferestre (*windows*). În Node.js, acestea sunt numite *fragmente* (*chunks* în lb. engleză). Pentru a fi cât mai aproape de textul specificațiilor tehnice, vom folosi în continuare termenul de *chunks*.

Node.js oferă patru tipuri de stream-uri care pot fi folosite pentru a lucra cu datele:

- `Readable` sunt stream-uri care pot citi date;
- `Writable`, fiind stream-ul care permite scrierea datelor;
- `Duplex`, fiind stream-uri care sunt `Readable` și `Writable` în același timp;
- `Transform`, fiind stream-uri care pot modifica datele pe măsură ce acestea sunt citite și scrise.

Node.js pune la dispoziție două module care fac posibil lucrul cu stream-uri. Primul este modulul `fs` cu ajutorul căruia putem crea stream-uri care citesc date (`createReadStream`) și stream-uri care scriu date (`createWriteStream`). Cel de-al doilea modul este `stream`, care oferă trei metode de lucru: `stream.Readable`, `stream.Writable` și `stream.Transform`.

Un mic exemplu de folosire a stream-urilor indică și modul în care *curg* datele.

```javascript
const destinație = fs.createWriteStream(outFile);
const sursă = fs.createReadStream('fișier.csv');
source.pipe(destinație);
```

Ceea ce se petrece în acest caz este crearea unui stream *readable* cu care să citim datele din fișier. Odată stream-ul creat, datele vor fi citite din fișier și *încetul cu încetul* vor fi scrise în memoria internă a stream-ului *readable* care este un Buffer de 16384 de bytes. Când Buffer-ul intern este plin, Node.js emite un eveniment `data` care semnalizează faptul că aceste date din Buffer sunt disponibile prin identificatul `chunk` în cazul în care atașăm un listener precum `stream.on('data', (chunk) => {})`.

În cazul stream-urilor *transform*, acestea au două Buffere interne. Unul pentru a citi și altul pentru a scrie datele.

Un exemplu concret de utilizare a stream-urilor este cazul serverelor HTTP, care în cazul gestionării rutelor pe care vin cererile, vor folosi o funcție callback. Aceasta are drept argumente un stream *readable*, numit `request` și unul *writable* numit `response`.

```javascript
app.get('/resursa', function (req, res) {
  // fă ceva cu datele din request (req.body, req.params, etc).
  res.status(200).send('Îți trimit acest text!');
  // trimiți date clientului prin folosirea stream-ului re
});
```

## Stream-urile se bazează pe evenimente

Stream-urile în Node.js se bazează pe lucrul cu evenimente pentru că stream-urile implementează clasa `EventEmitter`. Pe cale de consecință, atunci când apar datele, poți atașa un *listener*, un callback care să facă ceva cu acele date.

|Streamuri Readable| Streamuri Writable|
| :--: | :--: |
|**evenimente**|**evenimente**|
|*data*|*drain*|
|*end*|*finish*|
|*error*|*error*|
|*close*|*close*|
|*readable*|*pipe/unpipe*|
|**metode**|**metode**|
|`pipe()`, `unpipe()`|`write()`|
|`read()`, `unshift()`, `resume()`|`write()`, `end()`|
|`pause()`, `isPaused()`|`cork()`, `uncork()`|
|`setEncoding()`|`setDefaultEncoding()`|

Pentru a exemplifica, cel mai bine ar fi să creăm un stream folosind metoda dedicată a modulului `fs` : `fs.createWriteStream()`. Mai întâi de a porni este necesar să trecem prin descrierea metodei `fs.createWriteStream()`. Această metodă primește următoarele argumente posibile:

- o **cale** care specifică resursa. Această cale poate fi un șir, un buffer sau un obiect url;
- o opțiune din mai multe posibile sau un obiect în cazul în care dorești mai multe opțiuni să influențeze crearea acestui stream.

Opțiunile posibile pe care le poți invoca au valori de start, care trebuie menționate pentru a înțelege configurarea stream-ului așa cum este el oferit de Node.js:

- *flags* (un șir de caractere), valoarea default: `w`;
- *encoding* - codarea caracterelor (un șir de caractere); valoarea din oficiu fiind `utf8`;
- *fd* - file descriptor (un număr întreg), valoarea default fiind `null`;
- *mode* (un număr întreg), valoarea default fiind `0o666`;
- *autoClose* (boolean), valoarea default fiind `true`;
- *start* (un număr întreg).

```javascript
let fs = require('fs');
let streamDeCitire = fs.createReadStream('ceva.txt', 'utf8');
let datele = '';

streamDeCitire.on('data', function (fragment) {
  datele += fragment;
});

streamDeCitire.on('end', () => {
  console.log(datele);
});
```

Întrebarea de bun început este următoarea: când încep datele să *curgă*? De îndată ce se atașează un eveniment `data` datele sunt citite din sursă, Bufferul intern al obiectului stream este completat până la limita indicată de valoarea lui `nume_stream.writableHighWaterMark`. Valoarea datelor care sunt scrise în Buffer-ul intern este ținută în evidență de proprietatea `nume_stream.writableLength`. Când `writableLength` are aceeași valoare cu limita expusă prin valoarea lui `writableHighWaterMark`, atunci se formează un `chunk`, care printr-un callback este prelucrat. Semnalul că `chunk`-ul este pregătit de prelucrare este dat prin apariția evenimentului `data`. Când Node.js emite evenimentul `data`, putem face ceva util cu acel fragment.

După acest moment inițial,fragmente de date sunt pasate rând pe rând cu o frecvență decisă de API-ul care implementează stream-ul (de exemplu, poate fi HTTP-ul). Atunci când nu mai sunt fragmente de date, stream-ul emite un eveniment `end`.
Folosind metoda `read()` pe stream-ul readable avem posibilitatea de a citi în calupuri datele stream-ului, dacă acest lucru este necesar.

```javascript
let fs = require('fs');
let streamDeCitire = fs.createReadStream('ceva.txt', 'utf8');
let datele = '';
let calup;

streamDeCitire.on('readable', function () {
  while ((calup = streamDeCitire.read()) != null) {
    datele += calup;
  };
});

streamDeCitire.on('end', function () {
  console.log(datele);
});
```

Metoda `read()` preia datele dintr-un buffer și le returnează. Datele pe care le citește un stream sunt cele din obiectul `Buffer`. Atunci când nu mai este nimic în Buffer, va returna `null`. Acesta este și motivul pentru care bucla din exemplu va testa după `null`. Mai trebuie adăugat că evenimentul `readable` va fi emis atunci când un fragment de date este citit din stream. În cazul în care datele sunt text, pentru a le putea folosi la fel, trebuie specificat standardul de codare.

## Transformarea stream-urilor

```javascript
let fs     = require('fs');
let path   = require('path');
let stream = require('stream');

let inFile = path.join(__dirname, 'dateprimare.txt'),
    outFile = path.join(__dirname, 'dateprelucrate.txt');

let transformare = new stream.Transform({
  transform: function (fragment) {
    this.push(fragment.toString().toUpperCase());
  }
});

let inStream = fs.createReadStream(inFile),
    outStream = fs.createWriteStream(outFile);
// inStream -> transformare -> outStream
inStream.pipe(transformare);
transformare.pipe(outStream);
```

## Piping

Piping-ul este un mecanism prin care citești date dintr-o sursă și le scriem în altă parte.

```javascript
let fs = require('fs');
let streamDeCitire = fs.createReadStream('ceva.txt');
let streamDeScriere = fs.createWriteStream('altceva.txt');
streamDeCitire.pipe(streamDeScriere);
```

Metoda `pipe()` returnează stream-ul destinație. Această metodă nu distruge automat sursa sau stream-urile destinație, iar acest lucru poate conduce în timp la apariția scurgerilor de memorie. Ceea ce se petrece este că stream-ul sursă nu va fi distrus automat dacă stream-ul destinație emite evenimentele `close` sau `error`.

Din acest motiv, pentru a ne asigura că nu sunt probleme, va trebui să atașăm listeneri pentru a verifica dacă s-au încheiat operațiunile cu stream-ul pentru a-l elimina.

```javascript
var fs = require('fs');
var streamDeCitire = fs.createReadStream('ceva.txt');
var streamDeScriere = fs.createWriteStream('altceva.txt');
streamDeCitire.pipe(streamDeScriere);

// când ai terminat de scris în destinație, distruge sursa
streamDeScriere.on('close', () => {
  streamDeCitire.destroy();
});
// aigură-te că în cazul apariției erorilor, distrugi sursa
streamDeScriere.on('error', () => {
  streamDeCitire.destroy();
});

/* Pe stream-ul de citire trebuie să gestionăm `error` și `end` */
streamDeScriere.on('error', () => {
  streamDeCitire.destroy();
});

streamDeScriere.on('end', () => {
  streamDeCitire.destroy();
});
```

Începând cu Node 10, pentru a evita scrierea de cod șablon care să gestioneze evenimentele necesare distrugerii stream-ului sursă, a fost introdus [pipeline](https://Node.js.org/dist/latest-v14.x/docs/api/stream.html#stream_stream_pipeline_source_transforms_destination_callback) în namespace-ul `stream`.

### Copierea unui fișier în altul

Pentru a copia conținutul unui fișier în altul, trebuie să creezi mai întâi un stream de citire și apoi unul de scriere. Acestea vor fi folosite de utilitarul `.pipe()`.

```javascript
const fs = require('fs');
const readAStream = fs.createReadStream('origine.txt');
var writeTheStream = fs.createWriteStream('destinatie.txt');

readAStream.pipe(writeTheStream);
```

### Prelucrări intermediare a datelor din fișiere

Streamurile permit și puncte de prelucrare ale datelor pentru cazul în care avem nevoie să facem prelucrări în anumite momente. De exemplu, este posibil să *citești* o arhivă, dar pentru a face ceva util cu datele compactate, ai nevoie să o dezarhivezi. Această operațiune poate fi realizată printr-un pipe către o funcție cu rol de dezarhivare.

```javascript
const fs = require('fs');
const zlib = require('zlib');

fs.createReadStream('original.txt.gz').pipe(zlib.createGunzip()).pipe(fs.createWriteStream('original.txt'));
```

### Trimite fișier de la server

Pentru a reduce încărcarea serverului și pentru a eficientiza trimiterea datagramelor pe rețea, se pot folosi din nou stream-urile în lucrul cu serverele web. Trebuie să ne amintim de faptul că stream-urile implementează clasa `EventEmitter`, ceea ce le face pretabile lucrului în paradigma evenimentelor.

```javascript
var http = require('http'),
    fs   = require('fs');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/fisier.json');
    stream.pipe(res);
});
server.listen(3000);
```

Ceea ce trebuie să înțelegi este faptul că `req` și `res` sunt niște obiecte, care au ca principiu de funcționare intern stream-urile. În cazul nostru, am creat un stream care citește (*Read*) stream-ul și apoi, l-am *racordat* folosind metoda `pipe()` la obiectul răspuns. Metoda `.pipe()` va avea grijă de evenimentele `date` și `end` care apar în momentul în care folosești `fs.createReadStream(__dirname + '/fisier.json');`.

O altă aplicație care oferă și o soluție funcțională, ne este propusă de Erick Wendel în *How to read 30GB+ data in the browser without blocking the screen - Webstreams 101*. Am ales acest exemplu pentru informația la zi și pentru eleganță.

```javascript
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import bytesize from 'byte-size';
import csv2json from 'csv2json';
import { Readable, Transform, Writable } from 'node:stream';

createServer(async (request, response) => {
    // response.end('OK');
    const filename = './data/SWIB-conference-data.csv';
    const {size} = await stat(filename);

    console.log('Processing ', `${bytesize(size)}`);

    // const fileStream = createReadStream(filename).pipe(response);

    // #1 transformă stream-ul după ce ai preluat fișierul în stream cu `createReadStream` într-unul web
    // #2 Fă-i `pipeThrough` către un stream de transformare, care preia stream-ul de CSV, îl parsează și îl transformă în JSON
    // #3 Finalizează prin trimiterea cu `pipeTo` către un stream pentru web
    await Readable
            .toWeb(createReadStream(filename))
            .pipeThrough(
                Transform.toWeb(csv2json())
            )
            .pipeTo(
                Writable.toWeb(response)
            );

    // Din Terminal, fă o cerere la server pentru a verifica rezultatul folosind comanda: curl -N localhost:3000

}).listen('3000').on('listening', () => {
    console.log('serverul e pe 3000');
});
```

Și o versiune ceva mai elaborată pentru a explora posibilitatea de a modifica stream-ul datelor în format CSV. Scriptul este o adaptare a celui pe care l-a oferit drept exemplu Erick Wendel mai sus. Fișierul CSV are o structură din care voi pune o mostră mai jos.

```csv
"TI","CT","DT","CY","AU","DE"
"Design of a linked data-based library portal","SWIB","paper",2009,"Hagenbruch,André","linked data,linked-data,web-of-data,web of data,bochum,project,infrastructure,university-alliance-metropolis-ruhr,portal,design,architecture,swib 2009"
"Free Data - The Road to Linked Data","SWIB","paper",2009,"Danowski,Patrick","cern,bibliographic data,MARCXML,libris,swib 2009"
"Integration of linked data into existing library applications","SWIB","paper",2009,"Neubert,Joachim;Borst,Timo","sparql,thesaurus,indexing,zbw,swib 2009,REST,indexing,retrieval,demo"
"Introduction to the Semantic Web","SWIB","paper",2009,"Voss,Jakob","introduction,swib 2009,semantic web,linked data,limitations"
"Linked applications using repository software as an example","SWIB","paper",2009,"Ostrowski,Felix","linked data,linked-data,dbpedia,repository,ontologies,oa-network,dfg,swib 2009"
"Linked data in the context of digital library systems","SWIB","paper",2009,"Haslhofer,Bernhard","dbpedia,swib 2009,digital-library,digital library,sweden,LOD,wikipedia,linked data,developments,trends"
"Metadata and the CIDOC Conceptual Reference Model (CRM) - An introduction with application examples","SWIB","paper",2009,"Teichmann,Katrin","cidoc-crm,conceptual-model,conceptual model,cultural heritage,entity,meta-ontology,meta ontology,cidoc,swib 2009"
"Ontologies from the perspective of information specialists. From theory to practice","SWIB","paper",2009,"Semanova,Elena","Ontology,conceptual-system,conceptual system,swib 2009,transporting content,information science,Protégé"
"Practical experiences from the linked data publication of the STW","SWIB","paper",2009,"Neubert,Joachim","zbw,skos,rdfa,rdfxml,rdf xml,sparql,swib 2009"
```

Codul JavaScript este după cum urmează. Scopul este de a folosi metoda `pipeThrough` pentru a crea posibilitatea modificării datelor folosind un obiect `TransformStream`.

```javascript
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import bytesize from 'byte-size';
import csv2json from 'csv2json';
import { Readable, Transform, Writable } from 'node:stream';
import {TransformStream} from 'node:stream/web';

createServer(async (request, response) => {
    // response.end('OK');
    const filename = './data/SWIB-conference-data.csv';
    const {size} = await stat(filename);

    console.log('Processing ', `${bytesize(size)}`);

    // #1 transformă stream-ul după ce ai preluat fișierul în stream cu `createReadStream` într-unul web
    // #2 Fă-i `pipeThrough` către un stream de transformare, care preia stream-ul de CSV, îl parsează și îl transformă în JSON
    // #3 Finalizează prin trimiterea cu `pipeTo` către un stream pentru web
    await Readable
            .toWeb(createReadStream(filename))
            .pipeThrough(
                Transform.toWeb(csv2json({
                    delimiter: ','
                }, {
                    objectMode: true
                }))
            )
            .pipeThrough(
                new TransformStream({
                    async transform(chunk, controller) {
                        // chunk va fi sub formă de bytes. Pentru a-l afișa, de exemplu, ar trebui să creăm un obiect Buffer din `jsonLine` care este un chunk
                        const data = Buffer.from(chunk).toString('utf-8');
                        // console.info(`Datele sunt chiar: ${data}`);
                        let arry = data.split('\n');
                        if (arry.includes('[') || arry.includes(']') || arry.includes(',')) {
                            controller.enqueue(data);
                        } else {
                            let dataParsed = JSON.parse(data);    
                            const mappedData = JSON.stringify({
                                title: dataParsed?.TI,
                                acronym: dataParsed?.CT,
                                authors: dataParsed?.AU,
                                keywords: dataParsed?.DE
                            });
                            // trimite fragmentul de date înapoi în stream după ce l-ai prelucrat                            
                            // este nevoie de separator pentru a menține ordinea în care sunt trimise fragmentele clientului pe care acestea le va consuma când poate. 
                            controller.enqueue(mappedData.concat('\n')); // vezi și http://ndjson.org/
                        }
                    }
                })
            )
            .pipeTo(
                Writable.toWeb(response)
            );

    // curl -N localhost:3000

}).listen('3000').on('listening', () => {
    console.log('serverul e pe 3000');
});
```

## Resurse

- [Easier Node.js streams via async iteration | Dr. Axel Rauschmayer](https://2ality.com/2019/11/Node.js-streams-async-iteration.html)
- [Bash | Pipelines](https://www.gnu.org/software/bash/manual/bash.html#Pipelines)
- [Streams API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [How to Use Buffers in Node.js](https://Node.js.org/en/knowledge/advanced/buffers/how-to-use-buffers/)
- [Understanding memory leaks in node.js part 1](https://www.alxolr.com/articles/understanding-memory-leaks-in-node-js-part-1)
- [Understanding memory leaks in node.js part 2](https://www.alxolr.com/articles/understanding-memory-leaks-in-node-js-part-2)
- [Understanding node's possible eventemitter leak error message](http://web.archive.org/web/20180315203155/http://www.jongleberry.com/understanding-possible-eventemitter-leaks.html)
- [Node.js Streams - NearForm bootcamp series | YouTube](https://youtu.be/mlNUxIUS-0Q)
- [Stream Into the Future (Node.js Streams) | YouTube](https://www.youtube.com/watch?v=aTEDCotcn20)
- [How to read 30GB+ data in the browser without blocking the screen - Webstreams 101 | Erick Wendel](https://www.youtube.com/watch?v=EexM7EL9Blk)
- [Node.js Streams - Part 2 (Beginner/Intermediate) - Pipe - Transform - Pipeline and Error management | Code Academia](https://www.youtube.com/watch?v=5w_nZnev3kk)