# Clasa `fs.WriteStream`

Această clasă extinde `stream.Writable`. Pentru a crea o instanță `fs.WriteStream`, vei folosi metoda `fs.createWriteStream()`.

## Evenimentul `close`

Acest eveniment este emis atunci când file descriptorul este închis.

## Evenimentul `open`

Este emis atunci când este deschis fișierul și este un număr al file descriptorul.

## Evenimentul `ready`

Este emis atunci când `fs.WriteStream` este gata să fie folosit.

## `writeStream.bytesWritten`

Este numărul de bytes scriși până la momentul accesăriu proprietății.

## `writeStream.path`

Este calea către fișierul citit de string.

## `writeStream.pending`

Proprietatea este un `true` dacă nu a fost deschis încă fișierul.
