# Încărcarea scripturilor

Acesta este exemplul unei rute care folosește Handlebars pentru a compila un template ce va fi trimis clientului.

```javascript
const resurse = require('./resurse');
app.get('/resursepublice', resurse);

// resurse.js
/* ========== GET - Pe această rută se obține formularul de adăugare a resurselor doar dacă ești logat, având rolurile menționate */
// Cere helperul `checkRole`
router.get('/resurse/adauga', function (req, res) {
    let scripts = [{script: '/js/json2form.js'}]; // PAS 1
    let roles = ["user", "inproj", "validator"];
    let confirmedRoles = checkRole(req.session.passport.user.roles.rolInProj, roles);

    /* ====== VERIFICAREA CREDENȚIALELOR ====== */
    if(req.session.passport.user.roles.admin){
        // Dacă avem un admin, atunci oferă acces neîngrădit
        res.render('adauga-res', {
            title: "Adauga",
            logoimg: "/img/logo192.png",
            scripts
        });
    } else if (confirmedRoles.length > 0) { // când ai cel puțin unul din rolurile menționate în roles, ai acces la formularul de trimitere a resursei.
        res.render('adauga-res', {
            title: "Adauga",
            logoimg: "/img/logo192.png",
            scripts
        });
    } else {
        res.redirect('/401');
    }
});
module.exports = router;
```

Apoi în template-ul Handlebars, introdu secvența care iterează array-ul de scripturi.

```javascript
{{#each scripts}}
    <script src="{{script}}"></script>
{{/each}}
```

## Resurse

- [Add scripts in express handlebars](https://stackoverflow.com/questions/40386257/add-scripts-in-express-handlebars-from-view)
