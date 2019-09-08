# Constantele Sistemului de Fișiere

Contantele sunt exportate ca `fs.constants`. Aceste constante diferă în funcție de sistemul de fișiere.

## File Access Constants

| Constantă | Descriere                                                    |
| --------- | ------------------------------------------------------------ |
| `F_OK`    | Indică faptul că fișierul este disponibil procesului care are nevoie de el. Acesta indică că fișierul există, dar nu spune absolut nimic despre permisiuni `rwx`. Este modul din oficiu. |
| `R_OK`    | Indică faptul că fișierul poate fi citit de procesul care îl apelează. |
| `W_OK`    | Indică faptul că fișierul poate fi scris de procesul care îl apelează. |
| `X_OK`    | Indică faptul că fișierul poate fi executat de procesul care îl apelează. Nu are efect pe Windows (același comportament precum cel al lui `F_OK`). |

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