# Clasa FileHandle

Un obiect `FileHandle` este un wrapper pentru un file descriptor numeric. Aceste obiecte sunt distincte de file descriptori. Pentru a instanția un obiect `FileHandle`, se va folosi metoda `open` a lui `fsPromises` - `fsPromises.open()`. Toate obiectele `FileHandle` sunt `EventEmitter`-e.

Dacă un FileHandle nu este închis folosind `filehandle.close()`, va închide automat file descriptorul și va emite un warning de proces, fiind astfel prevenite scurgerile de memorie.

Aceste obiecte sunt create intern de metoda `fsPromise.open()`. API-ul `fs/promises` oferă metode asincrone pentru gestionarea fișierelor sistemului de operare. Acestea returnează promisiuni.

## Metoda `filehandle.appendFile(data, options)`

Această metodă adaugă date într-un fișier. Dacă fișierul nu există, acesta va fi creat. Metoda returnează o promisiune care în caz de succes va fi rezolvată fără argumente.

Argumentul `data` poate fi un string sau un Buffer. Al doilea argument poate fi un obiect sau un string.
În cazul în care `options` este un obiect care poate avea următorii membri:

- `encoding` care poate fi un șir de caractere sau poate fi `null`. Valoarea din oficiu este `utf8`.
- `mode`, care este un număr intreg ce specifică masca. Valoarea din oficiu este `0o666`.
- `flag` ce poate fi un șir de caractere ce indică permisiuni asupra fișierului. Vezi system flags. Valoarea din oficiu este `a`.

Pentru a face un append, `FileHandle`-ul trebuie să fi fost deja deschis.

## Metoda `filehandle.chmod(mode)`

Metoda returnează o promisiune care în caz de succes va fi rezolvată fără argumente. Scopul este de a modifica permisiunile unui fișier.

Argumentul `mode` este o valoare de număr întreg.

## Metoda `filehandle.chown(uid, gid)`

Metoda returnează o promisiune care în caz de succes va fi rezolvată fără argumente. Scopul este de a modifica owneship-ul unui fișier.

## Metoda `filehandle.close()`

Returnează o promisiune care va fi rezolvată atunci când file descriptorul va fi închis. Dacă apare vreo eroare la închidere, promisiunea va fi rejected.

```javascript
const fsPromises = require('fs').promises; // versiunea 10.1.0
async function openAndClose() {
  let filehandle;
  try {
    filehandle = await fsPromises.open('thefile.txt', 'r');
  } finally {
    if (filehandle !== undefined)
      await filehandle.close();
  }
}
// sau noua sintaxă
import { open } from 'fs/promises'; // versiune 14.0.0

let filehandle;
try {
  filehandle = await open('thefile.txt', 'r');
} finally {
  await filehandle?.close();
}
```

## Metoda `filehandle.datasync()`

Metoda returnează o promisiune care în caz de succes va fi rezolvată fără argumente.

## Proprietatea `filehandle.fd`

Aceasta este un file descriptor gestionat de un obiect FileHandle.

## Metoda `filehandle.read(buffer, offset, length, position)`

Metoda poate fi folosită pentru citirea datelor dintr-un fișier. În cazul rezolvării cu succes, promisiunea oferă un obiect care are o proprietate `bytesRead` care specifică numărul de bytes care au fost citiți și o proprietate `buffer`, care este o referință către argumentul `buffer` care a fost pasat.

Argumentul `buffer` poate fi un `Buffer` sau un `UintInt8Array`, fiind bufferul în care vor fi scrise datele.
Argumentul `offset` este locul din buffer de la care se va porni scrierea datelor.
Argumentul `length` este un număr întreg care specifică numărul de bytes care va fi citit.
Argumentul `position` indică locul de unde să pornească citirea datelor dintr-un fișier. Dacă poziția are valoarea `null`, datele vor fi citite de la poziția curentă, iar poziția va începe să fie actualizată. În cazul în care valoarea lui `position` este un număr întreg, poziția va rămâne neschimbată.

## Metoda `filehandle.readFile(path, options)`

Metoda citește întregul conținut al unui fișier. Promisiunea este rezolvată fiind oferit conținutul fișierului. Dacă în obiectul opțiunilor, nu este setată proprietatea `encoding`, conținutul fișierului va fi oferit ca `Buffer`. În caz contrar, va fi obținută ca string.

```javascript
import fs from 'fs';
async function main() {
  const s = await fs.promises.readFile('x', 'utf8');
}
```

Argumentul `options` este un string sau un obiect. În caz că este obiect, prezintă două proprietăți:

- `encoding`, care poate fi string sau `null`, având valoarea din oficiu `null`
- `flag`, care este un string ce indică regimul în care se va face citirea.

Atunci când argumentul `path` este un director, comportamentul metodei este unul conform specificațiilor fiecărei platforme. Pe macOS, Windows și Linux, promisiunea va fi rejected cu o eroare. Pe FreeBSD, va fi returnată o reprezentare a conținutului directorului.

În cazul în care s-au făcut mai multe citiri ale unui file handle folosindu-se metoda `filehandle.read()`, datele vor fi citite de la poziția curentă până la finalul fișierului. Nu se va face mereu o citire de la începutul fișierului.

## Metoda `filehandle.stat([options])`

Returnează un `fs.Stats` pentru fișier. Poate primi un argument `options` ce poate avea o proprietate `bigint`, care odată setată la `true` specifică ca `fs.Stats` să aducă o valoare `bigint`. Valoarea din oficiu este `false`.

## Metoda `filehandle.sync()`

Returnează o promisiune. Pentru descriere, vezi versiunea asincronă.

## Metoda `filehandle.truncate(len)`

Metoda trunchiază fișierul și apoi rezolvă promisiunea fără argumente în caz de succes.
Argumentul `len` este dimeniunea specificată ca număr întreg. Valoarea sa din oficiu este `0`. În cazul în care fișierul este mai mare decât dimensiunea specificată de `len`, doar dimensiunea acestuia va fi reținută în rezultat.

```javascript
const fs = require('fs');
const fsPromises = fs.promises;

console.log(fs.readFileSync('temp.txt', 'utf8'));
// Prints: Node.js

async function doTruncate() {
  let filehandle = null;
  try {
    filehandle = await fsPromises.open('temp.txt', 'r+');
    await filehandle.truncate(4);
  } finally {
    if (filehandle) {
      // Close the file if it is opened.
      await filehandle.close();
    }
  }
  console.log(fs.readFileSync('temp.txt', 'utf8'));  // Prints: Node
}

doTruncate().catch(console.error);
```

## Metoda `filehandle.utimes(atime, mtime)`

## Metoda `filehandle.write(buffer, offset, length, position)`

## Metoda `filehandle.write(string[, position[, encoding]])`

## Metoda `filehandle.writeFile(data, options)`

## Metoda `filehandle.writev(buffers[, position])`
