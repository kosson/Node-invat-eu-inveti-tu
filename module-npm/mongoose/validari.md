# Validări

Validările sunt definite atunci când elaborezi **Schema**.
Mecanismul de validare este în sine un alt middleware, care este aplicat la momentul în care se face o salvare. Intern, mongoose, de fapt, folosește cârligul `pre('save')`.

Validarea nu se va face pe valorile `undefined` cu excepția câmpurilor pentru care avem fanionul `required` menționat.
Validările se vor face recursiv și pentru subdocumente la momentul salvării.
