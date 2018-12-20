# Middleware-ul .param()

Creează un middleware care trebuie pus înaintea soluționării cererii

```js
//exemplu de middleware pentru validarea lui :name
adminRouter.param('name', function(req, res, next, name){
  //validarea va fi făcută aici
  console.log('se fac validări pentru ' + name);

  //imediat ce validările au fost făcute, introdu item în req
  req.name = name;

  //mergi la următorul middleware
  next();
});

//și o rută cu parametri acum (http://localhost:1337/admin/hello/:name)
adminRouter.get('/hello/:name', function(req, res){
  res.send('hello' + req.name + '!');
  });
```

Middleware-ul folosit pentru parametri poate fi utilizat pentru a valida datele care vin spre aplicație. Dacă ai construit un API RESTfull și dorești să validezi un token folosești `.param()`.

Pentru a defini mai multe rute deodată folosești `app.route();`.
