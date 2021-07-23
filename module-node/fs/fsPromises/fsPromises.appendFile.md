# fsPromises.appendFile

Semnătura: `fsPromises.appendFile(path, data[, options])`.

Metoda permite adăugarea de date unui fișier. Dacă fișierul nu există, acesta va fi creat.

## Argumentele

Metoda poate avea următoarele argumente:

- `path` care poate fi un string, un `Buffer`, un `URL`, numele unui fișier al unui `FileHandle` sau un `FileHandle`;
- `data` fiind șir de caractere sau `Buffer`;
- `options`, care poate fi un obiect sau un string. Dacă este un șir de caractere acesta menționează encoding-ul.

În cazul în care `options` este un obiect, acesta poate avea următorii membri:

- `encoding` care poate fi un șir de caractere sau `null`. Valoarea din oficiu este `utf8`;
- `mode`, care este un număr întreg. Valoarea din oficiu este `0o666`;
- `flag`, care este un string ce reprezintă un flag de fișier. Valoarea din oficiu este `a`.
