# Precompilarea șabloanelor

Metoda `Handlebars.compile(template, options)` compilează un template cu scopul de a fi executat imediat.

```javascript
const template = Handlebars.compile("{{foo}}");
template({});
```

Compilarea se petrece în doi pași. Mai întâi este pasat metodei `compile` șablonul care conține sintaxa specifică Handlebars. Această metodă returnează o funcție căreia îi pasăm obiectul cu datele necesare interpolării.

```javascript
const appDir = path.dirname(require.main.filename); // obții calea pe care rulează aplicația
let template = fs.readFileSync(appDir + '/views/devnull_k1.hbs', { encoding: 'utf8' }); // încarci template-ul
let compileFn = hb.compile(template);
let strCompiled = compileFn({
    title:        "Profil",
    user:         req.user,
    csrfToken:    req.csrfToken(),
    activePrfLnk: true
});
// fs.writeFileSync(appDir + '/routes/devnull/template.html', strCompiled);
res.send(strCompiled);
```

## Resurse

- [API-ul Handlebars](https://handlebarsjs.com/api-reference/)
- [Compilarea șabloanelor](https://handlebarsjs.com/api-reference/compilation.html)