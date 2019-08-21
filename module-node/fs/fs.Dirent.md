# Clasa `fs.Dirent`

În momentul în care sunt apelate metodele `fs.readdir()` sau `fs.readFileSync()` având setată opțiunea `withFileTypes` la valoarea `true`, array-ul care rezultă va fi încărcat cu obiecte `fs.Dirent`, nu cu string-uri sau alori `Buffer`.

## `dirent.isBlockDevice()`

Returnează `true` dacă obiectul `fs.Dirent` descrie un *block device*.

## `dirent.isCharacterDevice()`

## `dirent.isDirectory()`

## `dirent.isFIFO()`

## `dirent.isFile()`

## `dirent.isSocket()`

## `dirent.isSymbolicLink()`

## `dirent.name`
