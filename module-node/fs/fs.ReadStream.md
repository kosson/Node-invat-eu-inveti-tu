# Clasa `fs.ReadStream`

Apelarea metodei `fs.createReadStream()` va returna un obiect `fs.ReadStream`. Obiecte instanțiate sunt stream-uri `Readable`.

## Evenimentul `close`

Acest eveniment este emis atunci când descriptorul de fișier a fost închis.

## Evenimentul `open`

Este un număr intreg care este atribuit descriptorului de fișier folosit de `ReadStream`. Aceste eveniment este emis atunci când este deschis un nou file descriptor.

## Eveniment `ready`

Aceste eveniment este emis atunci când `fs.ReadStream` este gata să fie utilizat. Acest eveniment este emis imediat după evenimentul `open`.

## Proprietatea `readStream.bytesRead`

Această proprietate este un număr care reprezintă numărul de bytes care au fost citiți până la momentul citirii proprietății.

## Proprietatea `readStream.path`

Această proprietate poate fi string sau un `Buffer`. Calea către fișierul pe care îl citește stream-ul este specificat ca prim argument al metodei `fs.createReadStream()`. Dacă este pasat un string, valoarea acestei proprietăți va fi un string, iar dacă este un `Buffer`, valoarea va fi `Buffer`.

## Proprietatea `readStream.pending`

Aceasta este o valoare `Boolean` care este `true` dacă fișierul nu a fost deschis deja înainte ca evenimentul `ready` să fie emis.
