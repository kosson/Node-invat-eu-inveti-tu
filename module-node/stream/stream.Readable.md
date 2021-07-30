# Clasa `stream.Readable`

Stream-urile `Readable` pot fi considerate a fi sursa datelor. Un stream *Readable* poate fi folosit pentru a citi datele dintr-o sursă așa cum este un descriptor de fișier, de exemplu. Datele care încep să fie citite pot fi stocate într-un `Buffer` în stream-ul `Readable` dacă aplicația care consumă datele o face mai greu.

```text
Fișier --Readable stream--> | Buffer | -> aplicație
```

Câteva exemple de utilizare a stream-urilor `Readable`:

- `fs.createReadStream`,
- `http.IncomingMessage`

Toate stream-urile care citesc implementează interfața pe care o definește clasa `stream.Readable`. Documentația oficială menționează câteva exemple:

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

#### Modul flowing

Un stream care este în modul flowing va oferi date unei aplicații cât de repede este posibil folosind evenimentele pe care interfața `EventEmitter` le pune la dispoziție.

#### Modul pauză

În modul pauză, datele pot fi citite folosind metoda `read()`, care oferă posibilitatea de a citi bucată cu bucată ce există în obiectul buffer.

Toate stream-urile `Readable` pornesc în modul pauză. Curgerea datelor poate fi declanșată prin următoarele metode:

- atașarea unui eveniment `data` cu un receptor care să facă ceva cu datele,
- apelarea metodei `resume()` pe stream,
- apelarea metodei `pipe()` pentru a trimite datele unui stream `Writable`.

```javascript
const fs = requite('fs');
const fisierDinCareCitesti = fs.createReadStream('./numeFisier.txt');
fisierDinCareCitesti.on('data', (chunk) => {
  console.log(chunk.toString()); // sau orice alte transformări
});
```

Dacă este necesar, stream-ul `Readable` poate fi pus în modul pauză folosind una din următoarele metode:

- apelarea metodei `pause()` dacă nu există pipe-uri,
- dacă există pipe-uri și sunt eliminate toate acestea prin folosirea metodei `unpipe()`.

#### Evenimentul `close`

Acest eveniment este emis în momentul în care stream-ul sau oricare dintre resursele pe care le-a angajat (un *file descriptor*) au fost *închise*. Evenimentul indică faptul  posibilăcă nu vor mai fi emise alte evenimente și nu se vor face alte calcule. Un stream `Readable` va emite întotdeauna acest eveniment, dacă au fost setate cu opțiunea `emitClose`.

#### Evenimentul `data`

Funcția care gestionează acest eveniment (callback-ul) primește un argument numit prin convenție *chunk*, care poate fi de tip `Buffer`, string sau orice alt tip de date. Pentru stream-urile care nu operează în *object mode*, fragmentul de date (*chunk*) poate fi, ori un string, ori un `Buffer`. Pentru stream-urile care operează în *object mode*, fragmentul poate fi orice valoare JavaScript, mai puțin `null`.

Acest eveniment este emis ori de câte ori stream-ul nu mai deține fragmentul care a plecat la consumator. Acesta poate apărea ori de câte ori stream-ul este setat în *flowing mode* prin apelarea metodelor `readable.pipe()`, `readable.resume()` sau atunci când este atașată o funcție callback la evenimentul `data`.

Acest eveniment va mai fi emis ori de câte ori metoda `readable.read()` este apelată și astfel, un fragment de date este disponibil pentru a fi returnat.

Atașarea unui eveniment `data` pe un stream care nu a fost pus pe pauză în mod explicit, va conduce la setarea acelui stream în *flowing mode*.

```javascript
const readable = constituiUnStreamReadable();
readable.on('data', (chunk) => {
  console.log(`Am primit ${chunk.length} bytes de date.`);
});
```

Callback-ul acestui eveniment va primi datele ca string, dacă a fost setat *encoding*-ul folosind metoda `readable.setEncoding()`. Dacă nu a fost făcută o astfel de setare, datele vor fi pasate ca `Buffer`.

#### Evenimentul `end`

Este emis ori de câte ori nu vor mai fi date care să fie consumate din stream.

```javascript
const readable = constituiUnStreamReadable();
readable.on('data', (chunk) => {
  console.log(`Am primit ${chunk.length} bytes de date.`);
});
readable.on('end', () => {
  console.log('Nu mai sunt date');
})
```

#### Evenimentul `error`

Acest eveniment poate fi emis în orice moment. Callback-ului îi va fi pasat un obiect `Error`.

#### Evenimentul `pause`

Acest eveniment este emis atunci când este apelată metoda `stream.pause()` și când `readableFlowing` nu este setat la `false`.
