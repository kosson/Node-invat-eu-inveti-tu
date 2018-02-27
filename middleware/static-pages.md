# Middleware-ul static

Express oferă posibilitatea de a servi pagini statice dintr-un director creat în acest scop în rădăcina aplicației. Reține faptul că acest middleware este singurul care a fost păstrat intern în Express.
Detalii suplimentare pot fi găsite la https://www.npmjs.org/package/serve-static.

Să presupunem că vom avea paginile noastre într-un director numit `static`. Pentru a *monta* acest director vom folosi o concatenare a căii absolute referențiată cu `__dirname` și calea de la care pornește `public`.

```javascript
app.use(express.static(__dirname + '/public'));
```

Pentru a avea acces la celelalte resurse necesare site-ului, putem monta rând pe rând subdirectoareale necesare.

```javascript
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/js', express.static(__dirname + '/public/js'));
```
