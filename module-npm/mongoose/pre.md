# pre()

```js
UserSchema.pre();
```

[Schema#pre(method, callback)](http://mongoosejs.com/docs/api.html#schema_Schema-pre)

Definește un pre hook pentru document. Pe scurt, fă ceva înainte de a salva cu metoda `save`.

```js
UserSchema.pre('save', function(next){});
```

Metoda pre face parte din biblioteca de cod [hooks](https://github.com/bnoguchi/hooks-js/tree/31ec571cef0332e21121ee7157e0cf9728572cc3), care menționează: dacă folosiți un obiect cu o metodă *save*, hooks permite rularea de cod înainte de save și după save. De exemplu, vrei să faci validări înainte de `save` sau vrei să faci o acțiune după ce s-a făcut `save`.

Atașarea funcționalităților se face prin intermediul apelurilor la *pre* și *post*.

Biblioteca de cod hooks face parte din pachetul de instalare al mongoose.

## Ce sunt și care sunt middleware-urile în mongoose.

> Mai sunt numite și hooks pre și post.

Sunt funcții care preiau controlul în timpul execuției asincrone.
Middleare-ul este specificat la nivel de schemă și este util pentru a scrie [pluginuri](http://mongoosejs.com/docs/plugins.html), care au capacitatea de a extinde schema.

Mongoose 4.0 are două tipuri de middleware:

- document middleware și
- query middleware.
