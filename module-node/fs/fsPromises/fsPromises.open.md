# fsPromises.open

Metoda primește ca prim argument calea (*path*) către fișier. Acest argument poate fi o valoare `String`, `Buffer` sau `URL`. Drept al doilea argument, se pot preciza câteva flag-uri. Valoarea din oficiu este `r`. Altreilea parametru este modul în care va fi deschis un fișier. Valoarea din oficiu este una care oferă posibilitatea de a scrie și citi fișierul - `0o666`.

Metoda returnează o promisiune.

Semnătura: `fsPromises.open(path, flags[, mode])`.

Vezi documentația POSIX pentru [open](https://man7.org/linux/man-pages/man2/open.2.html) pentru mai multe detalii.
