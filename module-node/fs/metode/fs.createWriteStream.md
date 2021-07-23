# fs.createWriteStream

Semnătura: `fs.createWriteStream(path[, options])`.

Această metodă oferă posibilitatea de a constitui un `stream` prin care să trimitem date într-o resursă.

```javascript
var fs   = require('fs');
var date = 'aceste caractere vor fi scrise într-un fișier';
var wStr = fs.createWriteStream('ceva.txt');
wStr.write(date, (err) => {
    if (err) {throw err};
    console.log('datele au fost scrise');
});
```

De fiecare dată când scriptul va fi rulat, dacă fișierul deja există, conținutul acestuia va fi suprascris. Dacă fișierul nu există, acesta va fi creat.

## Argumente

Metoda primește două argumente:
- calea fișierului (*path*) și
- opțiuni

### argumentul path

Drept prim parametru trebuie să indicăm o *cale* care poate fi un `string`, un `Buffer` sau un URL.

### argumentul opțiunilor

Al doilea parametru poate fi un obiect sau un `string` cu opțiuni. Membrii obiectului care parametrizează metoda pot fi următorii:

- `flags` a cărui valoare este un string. Aceste valori pot fi unul din [flag-urile de sistem](https://nodejs.org/api/fs.html#fs_file_system_flags) pentru fișiere. Valoarea din oficiu este `w`,
- `encoding`, fiind tot un string a cărui valoare din oficiu este `utf8`,
- `fd` (*file descriptor*) care poate fi un număr întreg sau un *FileHandle*. Valoarea din oficiu este `null`,
- `mode` fiind un număr întreg a cărui valoare din oficiu este `0o666`,
- `autoClose`, un `Boolean` a cărui valoare din oficiu este `true`,
- `emitClose`, un `Boolean` a cărui valoare din oficiu este `true`,
- `start`, fiind un număr întreg,
- `fs`, fiind ori un `Object`, ori `null`. Din oficiu, valoarea este `null`,
- `start` fiind o valoare între 0 și `Number.MAX_SAFE_INTEGER`. Aceasta permite scrierea datelor în fișier dincolo de începutul fișierului, la o poziție arbitrară în plaja `[0, Number.MAX_SAFE_INTEGER]`.

Modificarea unui fișier necesită setarea valorii lui `flags` la `r+` pentru a evita înlocuirea întregului conținut.

Valoarea lui `autoClose` este setată din oficiu pe `true` ceea ce oferă următoarele avantaje:
- când apare un eveniment `error` descriptorul fișierului va fi închis automat;
- când apare evenimentul `close`, la fel, descriptorul fișierului va fi închis automat.
Dacă valoarea lui `autoClose` este setată la `false`, descriptorul fișierului nu va fi închis chiar dacă apare și o eroare. În acest caz este responsabilitatea aplicației să închidă descriptorul pentru a nu se crea o *scurgere*.

După ce stream-ul a fost *distrus*, acesta va emite automat un eveniment `close` așa cum fac majoritatea stream-urilor `Writable`. Dacă nu dorești acest lucru, va trebui să modifici valoarea lui `emitClose`.

În cazul în care `options` este un șir de caractere, acesta va indica encoding-ul.

## File System Flags

Flag-urile disponibile, care pot fi pasate ca string:

- `a` - deschide fișierul pentru a-i fi adăugate date. Fișierul este creat dacă nu există;
- `ax` - are același comportament precum `a`, dar eșuează dacă acea cale există;
- `a+` - deschide fișierul pentru citire și appending. Acest fișier este creat dacă nu există;
- `ax+` - are același comportament precum `a+`, dar eșuează dacă acea cale există;
- `as` - deschide fișierul pentru a i se adăuga date în mod sincron. Fișierul este creat dacă nu există;
- `as+` - deschide fișierul pentru a se citi și adăuga date în mod sincron. Fișierul este creat dacă nu există;
- `r` - deschide fișierul pentru a fi citit. Apare o excepție dacă fișierul nu există;
- `r+` - deschide fișierul pentru a citi și a scrie în el. Apare o excepție dacă fișierul nu există;
- `rs+` - deschide fișierul pentru citire și scriere în mod sincron. Instruiește sistemul de operare să treacă peste sistemul de caching local. Este folositor pentru sisteme NFS și are un impact privind performanțele I/O. Se va folosi doar dacă este neapărată nevoie.
- `w` - deschide fișierul pentru a se putea scrie. Fișierul poate fi creat (dacă nu există) sau poate fi trunchiat (dacă există).
- `wx` - același comportament precum `w`, dar nu va acționa dacă deja calea există;
- `w+` - deschide un fișier pentru citire/scriere. Fișierul este creat dacă nu există sau trunchiat dacă există.
- `wx+` - același comportament precum `w+`, dar eșuează dacă există calea.
