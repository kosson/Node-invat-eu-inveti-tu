# Passport

Passport este un middleware care oferă autentificare pentru aplicațiile construite folosind Express.js.

Autentificarea se face în baza unor strategii, fiecare dintre acestea având propriul pachet npm (de ex. `passport-google-oauth20`). Reține faptul că o strategie este un middleware. O cerere pe o anumită rută va intra în prelucrările middleware-ului unei strategii passport, iar dacă utilizatorul este verificat și autentificat, cererea va fi trimisă mai departe în lanțul de prelucrare al lui Express.js. Dacă utilizatorul nu poate fi autentificat, Passport va emite o eroare `401 Unauthorized Error`.

Înainte de a fi folosită, o strategie trebuie mai întâi configurată.

Primul pas este instalarea pachetului central:

```bash
npm install passport
```

Urmează să alegi dintre strategiile de autentificare pe care pachetul le pune la îndemână.
