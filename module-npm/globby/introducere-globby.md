# Introducere globby

Glob-ul sau „shell globing” este o modalitate de a scrie șabloane glob care să potrivească fișierele dintr-un sistem de fișiere.

De fapt aceste glob pattern-uri specifică seturi de fișiere care sunt găsite prin potrivirea cu șabloane construite folosind caractere speciale. Aceste șabloane sunt folosite cu precădere în lucrul în Terminal. Un exemplu ar fi eliminarea tuturor fișierelor care au extensia `.txt` folosind următoarea comandă `rm -rf director/*.txt`. Caracterul steluță care are rol de *wildcard* este combinat cu șirul de caractere care precizează extensia. Împreună formează `*.txt` care este un *glob pattern*.

Suplimentar căutării de fișiere cu anumită extensie, *șabloanele glob* pot fi utilizate și pentru a căuta după anumite fragmente de caractere. De exemplu, semnul întrebării, care ține locul unui singur caracter.

Un caracter `*` ține locul oricărui caracter incluzând chiar și caractere goale. Precum în exemplul de mai sus, caracterul steluță înlocuiește toate caracterele folosite în denumirea unui fișier: `director/*.txt`.

Combinația de două caractere steluță `**` se numește *globstar* care vor regăsi toate fișierele și zero sau mai multe directoare și subdirectoare. În cazul în care combinația este urmată de caracterul `/`, va potrivi doar directoare și subdirectoare. Dar ca să lucreze în modul așteptat, combinația trebuie să fie sigurul lucru atunci când specifici calea.

## Exemple

- `/myapp/config/*` - toate fișierele din directorul *config*;
- `**/*.png` - toate fișierele cu extensia png din toate directoarele;
- `**/*.{png,ico,md}` - toate fișierele `png`, `ico`, și `md` din toate directoarele;
- `/myapp/src/**/*.ts` - toate fișierele cu extensia `ts` din subdirectorul src și oricare alte posibilele subdirectoare care ar putea fi;
- `**/!(*.module).ts` - toate fișierele cu extensia ts din toate directoarele, dar nu și cele de forma **numefișier.module.ts**.

## Resurse

- https://www.npmjs.com/package/globby
- https://deepsource.io/blog/glob-file-patterns/
- https://globster.xyz/
