# Modulul fs

Acest modul oferă un adevărat API prin care se realizează interacțiunea cu sistemul de fișiere al mașinii gazdă. Operațiunile de lucru cu sistemul de fișiere pot avea un aspect sincron și unul asincron, privind la modul în care se pot desfășura operațiunile. Ceea ce face Nodejs este un ambalaj al funcțiilor POSIX.

Pentru a folosi acest modul, trebuie să-l ceri cu `require('fs')`. Pentru a nu bloca `event loop`, este recomandată folosirea variantei asincrone întotdeauna. În cazul utilizării asincrone, va trebui introdus un callback, care să acompanieze acțiunea. Ca exemplu, avem o acțiune de ștergere a unui director.

```javascript
const fs = require('fs');

fs.unlink('/cale/director', (err) => {
  if (err) {
    return console.log(err);
  };
  console.log('am șters directorul indicat');
});
```

Pentru a ține evidența fișierelor de lucru, kernelul sistemelor POSIX ține evidența fișierelor și resurselor deschise. Fiecărui fișier deschis îi este asignat un identificator numit `file descriptor`.

Modulul `fs` pune la dispoziție și metodele necesare lucrului cu stream-uri. Pentru a dezvolta acest aspect foarte important, vezi materialele dedicate stream-urilor.

## Lucrul pe căile sistemului

Căile sistemului de operare sunt necesare pentru a accesa resursele. Acestea sunt oferite metodelor modulului `fs` drept parametru și pot fi un șir de caractere (secvențe de caractere codate UTF8), un obiect Buffer sau un obiect URL care folosește protocolul `file:`.

## Căi relative

Căile pe care le pasezi lui `fs` pot fi relative. Pentru simplificarea activităților, de cele mai multe ori vei întâlni situațiile în care se folosește în paralel modulul `path`.

```javascript
const fs = require(`fs`);
const path = require(`path`);

// clasic
fs.readFile(path.join(__dirname, `fisier.txt`), (err, data) => {
  // cod
});

// relativ
fs.readFile(`./calea/catre/fisier.txt`, (err, data) => {
  // cod
});
```

## Protocolul file:

Calea de acces la o resursă pe disc se poate face și utilizând un obiect url WHATWG. Suportul este oferit doar pentru obiectele care folosesc protocolul `file:`.

```javascript
const fs = require('fs');
const fileUrl = new URL('file:///tmp/hello');

fs.readFileSync(fileUrl);
```

Obiectele URL vor fi întotdeauna căi absolute.

## Deschiderea unui fișier

Metoda `fs.open()` este folosită pentru a aloca un nou `file descriptor`, care va fi folosit pentru a obține informații despre fișier.

```javascript
fs.open('/director/subdirector/fisier.txt', 'r', (err, fisierDescr) => {
    if (err) {throw err};
    fs.fstat(fisierDescr, (err, stare) => {
        if (err) {throw err};
        // fă interogările necesare despre starea fișierului

        // întotdeauna închide fișierul
        fs.close(fisierDescr, (err) => {
            if (err) {throw err};
        });
    });
});
```

Documentația Node spune că este absolut necesară închiderea fișierului pentru că orice sistem de operare permite un anumit număr să fie deschis și se pot întâmpla chiar scurgeri de memorie.

## Procesarea căilor pentru a extrage datele relevante

Procedura de a extrage informațiile utile despre fișiere.

```javascript
let caleaCatreFisier = `/director/fisier.json`;
path.parse(caleaCatreFisier).base === `fisier.json`; // true
path.parse(caleaCatreFisier).name === `fisier`; // true
path.parse(caleaCatreFisier).ext === `.json`; // true
```

Vezi documentația de la https://nodejs.org/api/path.html#path_path_parse_path.

## Adăugarea datelor într-un fișier

Atunci când deja ai un fișier la care dorești să adaugi date, vei folosi metoda `fs.appendFile`. Această metodă funcționează *asincron*. Dacă fișierul țintă nu există, acesta va fi creat. Datele pot fi un șir de caractere sau un obiect `Buffer`. Metoda primește patru argumente posibile, ultimul fiind un callback. Dacă nu este trimis un callback va fi ridicată o stare de eroare.

- calea către resursă care poate fi un șir de caractere, un buffer, un obiect URL sau un număr,
- datele care pot fi șir sau Buffer,
- un obiect cu opțiuni: encoding (Default: 'utf8'), mode (Default: 0o666), flag (Default: 'a', însemnând deschide fișierul pentru adăugare de date, iar dacă nu există, creează-l),
- un callback, care trebuie să-i fie pasat drept prim argument `err`.

```javascript
fs.appendFile('fisier.txt', 'datele de adăugat', (err) => {
    if (err) {throw err};
    console.log('Am terminat de adăugat datele');    
});
```

Calea poate fi și un `file descriptor`. În acest caz, adu-ți mereu aminte să-l închizi.

```javascript
fs.open('fisier.txt', 'a', (err, fd) => {
  if (err) {throw err};
  fs.appendFile(fd, 'date de adaugat', 'utf8', (err) => {
    fs.close(fd, (err) => {
      if (err) {throw err};
    });
    if (err) {throw err};
  });
});
```

## Modificarea permisiunilor unui fișier

Metoda `fs.chmod` modifică în mod asincron permisiunile unui fișier.
