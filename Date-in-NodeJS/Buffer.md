# Buffer

NodeJS oferă posibilitatea de a lucra cu datele prin intermediul stream-urilor. Dar pentru a putea face acest lucru, a fost introdus un nou API specific. JavaScript a dobândit mecanisme specifice lucrului cu streamurile și datele binare abia odată cu noile versiuni ale standardului, care au introdus `TypedArray` și `ArrayBuffer`.

`Buffer` a fost intrudusă de NodeJS pentru a se asigura un nivel de interacțiune cu stream-urile de octeți din stream-urile TCP, operațiunile cu sistemul de fișiere al sistemului, etc. Această clasă implementează cu particularități de optimizare pentru API-ul `Uint8Array` din JavaScript.

Clasa este disponibilă la nivel global fără a mai fi nevoie să o ceri explicit.
