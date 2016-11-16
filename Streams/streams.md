# Streams

Orice stream în Node.js este implementarea a patru clase abstracte:

- stream.Readable (este o sursă de date)
- stream.Writable ()
- stream.Duplex
- stream.Transform

## stream.Readable

Există două moduri de a primi date de la un stream Readable:
- flowing și
- non-flowing

### Modul non-flowing

Citirea unui stream Readable se face, de regulă atașând un listener pentru evenimentul `readable`, care semnalează faptul că există date care pot fi citite.

Pentru citirea datelor se folosește metoda `readable`, care citește datele din buffer și returnează un `Buffer` sau un obiect `String` reprezentând un fragment de date. `read()` este o metodă sincronă, iar fragmentul returnat este un obiect `Buffer` (condiția este ca streamul).
