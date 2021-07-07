# Buffer

Pentru ca o mașină să înțeleagă datele pe care le primește în scopul procesării sau al stocării, mai întâi trebuie să le convertească în cod binar. Node.js poate manipula date binare sub forma de stream-uri binare. Datorită dimensiunilor potenția mari, aceste date sunt segmentate în părți de mai mici dimensiuni. Acest lucru este foarte util pentru că atunci când unitatea de procesare a datelor nu mai poate accepta date aflându-se în prelucrarea celor pe care deja le are, restul sunt introduse într-un *tampon* de date până când procesarea se poate relua.

În scenariile de comunicare cu un client la distanță, Node.js folosește stream-uri TCP pentru a primi și trimite date binare în fragmente de mici dimensiuni. Aceste stream-uri de date care sunt trimise clientului trebuie stocate undeva până când clientul are posibilitatea să le primească sau să primească mai multe. Acest *tampon* de date este un *buffer*.

Obiectele `Buffer` sunt folosite pentru a reprezenta o secvență de bytes de o dimensiune fixă. Multe API-uri din Node.js pot folosi buffere.

Clasa `Buffer` este o subclasă a lui `Uint8Array` din JavaScript, dar care este este extinsă.


## Resurse

- [Buffer | nodejs.org/api](https://nodejs.org/api/buffer.html#buffer_buffer)
