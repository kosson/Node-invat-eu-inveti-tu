# Clasa `fs.Stats`

Acesta este un obiect care oferă informații despre un fișier.

Obiectele instanțiate prin apelarea metodei `fs.stat()`, `fs.lstat()` și `fs.fstat()` și corespondentele sincrone sunt de acest tip. Dacă este pasat în opțiuni (`options`) `bigint` ca `true`, valorile numerice vor fi `bigint`, nu `number`.

## Metoda `stats.isBlockDevice()`

Returnează valoarea `true`, dacă obiectul `fs.Stats` descrie un block device.

## Metoda `stats.isCharacterDevice()`

Returnează valoarea `true`, dacă obiectul `fs.Stats` descrie un character device.

## Metoda `stats.isDirectory()`

Returnează valoarea `true`, dacă obiectul `fs.Stats` descrie un file system directory.

## Metoda `stats.isFIFO()`

Returnează valoarea `true`, dacă obiectul `fs.Stats` descrie un pipe first-in-first-out (FIFO).

## Metoda `stats.isFile()`

Returnează valoarea `true`, dacă obiectul `fs.Stats` descrie un regular file.

## Metoda `stats.isSocket()`

Returnează valoarea `true`, dacă obiectul `fs.Stats` descrie un socket.

## Metoda `stats.isSymbolicLink()`

Returnează valoarea `true`, dacă obiectul `fs.Stats` descrie un symbolic link.

## Proprietatea `stats.dev`

Această proprietate este un identificator numeric a device-ului care conține fișierul. Poate fi un număr sau un bigint.

## Proprietatea `stats.ino`

Este numărul „Inode” a fișierului pentru un anumit sistem de operare.

## Proprietatea `stats.mode`

Este un bit-field care descrie tipul și modul de fișier.

## Proprietatea `stats.nlink`

Este numărul de hard-link-uri pentru un fișier.

## Proprietatea `stats.uid`

Este un număr al utilizatorului care deține fișierul (POSIX).

## Proprietatea `stats.rdev`

Este identificatorul numeric în cazul în care fișierul este considerat „special”.

## Proprietatea `stats.size`

Dimensiunea în bytes a fișierului.

## Proprietatea `stats.blksize`

Dimensiunea blocului corespondent fișierului de sistem pentru operațiunile I/O.

## Proprietatea `stats.blocks`

Este numărul de blocuri alocat fișierului.

## Proprietatea `stats.atimeMs`

Este timestamp-ul ultimei accesări a fișierului exprimat în milisecunde (POSIX Epoch).

## Proprietatea `stats.mtimeMs`

Este timestamp-ul care indică ultima dată când a fost modificat fișierul în milisecunde (POSIX Epoch).

## Proprietatea `stats.ctimeMs`

Este timestamp-ul care indică ultima dată când a fost schimbat fișierul în milisecunde (POSIX Epoch).

## Proprietatea `stats.birthtimeMs`

Este un timestamp care indică momentul în care a fost creat fișierul în milisecunde (POSIX Epoch).

## Proprietatea `stats.atime`

Este timestamp-ul care indică când a fost accesat ultima dată fișierul. Sintagma `atime` înseamnă „Access Time”.

## Proprietatea `stats.mtime`

Este timestamp-ul care indică când a fost modificat ultima dată fișierul. Sintagma `mtime` înseamnă „Modified Time”.

## Proprietatea `stats.ctime`

Este timestamp-ul care indică când a fost schimbat ultima dată fișierul. Sintagma `ctime` înseamnă „Change Time”.

## Proprietatea `stats.birthtime`

Este timestamp-ul care indică când a fost creat fișierul.
