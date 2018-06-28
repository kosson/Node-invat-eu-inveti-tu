# fs.createReadStream

Este o metodă a modului `fs` care *consumă* o resursă folosind bufferul. Metoda acceptă drept prim parametru o cale către resursă, care poate fi un șir de caractere, un obiect URL sau chiar un buffer.

Al doilea parametru poate fi un obiect care poate avea următorii membri pentru setarea stream-ului:

-   *flags* - default: `r`,
-   *encoding* - default: `null`,
-   *fd* - default: `null`,
-   *mode* - default: `0o666`,
-   *autoClose* - default: `true`,
-   *start* - default: număr întreg,
-   *end* - default: `Infinity`,
-   *highWaterMark*, fiind un număr întreg cu un default: 64 * 1024.

Dacă al doilea parametru este un șir, acesta va specifica schema de codare a caracterelor. Cel mai uzual este `utf8`.
