# Introducere Handlebars

Handlebars este o bibliotecă de cod JavaScript pe care o incluzi într-o pagină HTML. Acest lucru permite adăugarea unor template-uri în pagină. Aceste template-uri (șabloane) vor fi citite de bibliotecă și unde găsește sintaxă specifică, va interpola valorile asociate pe care le-ai pasat metodelor Handlebars.

Handlebars.js poate fi privit ca un compilator care ia cod de HTML și expresii handlebars pe care le compilează într-o funcție JavaScript. Această funcție ia drept unic argument un obiect care conține datele ce vor fi interpolate. Ceea ce returnează este un șir de caractere care este codul paginii ce are valorile fiecare la locul lor.