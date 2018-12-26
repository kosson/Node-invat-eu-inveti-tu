# Metoda fs.createWriteStream()

Această metodă oferă posibilitatea de a constitui un stream prin care să trimitem date într-o resursă.

```javascript
var fs = require('fs');
var date = 'aceste caractere vor fi scrise într-un fișier';
var wStr = fs.createWriteStream('ceva.txt');
wStr.write(date, (err) => {
    if (err) {throw err};
    console.log('datele au fost scrise');    
});
```

De fiecare dată când scriptul va fi rulat, dacă fișierul deja există, conținutul acestuia va fi suprascris. Dacă fișierul nu există, acesta va fi creat.