# Obiectul request

Acest obiect reprezintă cererea HTTP. Obiectul are proprietăți corespondente *query string*, parametri, *body*, headere HTTP ș.a.m.d. Prin convenție acesta este denumit **req** (request), fiind primul parametru pasat unui middleware.

Acest obiect este o variantă îmbunătățită a propriului obiect request (vezi [Class: http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)). Urmând documentația Node, vom afla că `http.Server` va crea un obiect `IncomingMessage`. Acest obiect este pasat ca prim argument, fie unui eveniment `request`, fie unuia `response`. Acest obiect poate fi utilizat pentru a accesa starea răspunsului, headerele și datele. Acest obiect implementează interfața `Readable Stream`.

## req.app

Această proprietate a obiectului `req` este o referință către obiectul `app`, adică către instanța Express care este utilizată de funcția middleware.
