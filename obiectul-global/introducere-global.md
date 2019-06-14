# Obiectul `global`

Dacă pentru browser avem la dispoziție `window`, în cazul lui Nodejs avem `global`. Toate declarațiile de variabile sau funcții nu au comportamentul din browser. Declarațiile se fac la nivel de modul sau aplicație. Chiar dacă ai declarat o variabilă cu același identificator în `global`, dar și într-un modul, aceste variabile nu vor intra în conflict pentru că ambele variabile vor exista în două obiecte globale separate.
