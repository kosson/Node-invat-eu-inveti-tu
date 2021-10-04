# crypto.randomUUID

Este o metodă introdusă în versiunea 15.6.0.
Semnătura: `crypto.randomUUID([options])`.

Primește drept parametru un obiect (`options`) cu următoarele proprietăți:

- `disableEntropyCache` (Boolean); Node.js pentru a îmbunătăți performanța, generează și înmagazinează (*cache*) date random îndeajuns cât să genereze 128 de UUID-uri. Pentru a genera un UUID fără a folosi caching-ul, setează această proprietate la true. Valoarea din oficiu este `false`.

Metoda returnează un șir de caractere, care reprezintă un UUID versiunea 4 care respectă [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.txt).

UUID-ul este generat folosind un generator de numere criptografic pseudoaleatoriu.

## Resurse

- [crypto.randomUUID | nodejs.org/api](https://nodejs.org/api/crypto.html#crypto_crypto_randomuuid_options)
