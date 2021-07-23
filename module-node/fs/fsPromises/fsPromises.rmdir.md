# fsPromises.rmdir

Semnătura: `fsPromises.rmdir(path[, options])`.

Metoda șterge directorul identificat de `path`. Folosirea pe un fișier conduce la reject-ul promisiunii. Pentru a obține o un comportament similar lui `rm -rf`, se va folosi `fsPromises.rm()` cu opțiunile `{recursive: true, force: true}`. 
