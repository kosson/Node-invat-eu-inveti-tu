# JSON Web Token (JWT)

JSON Web Token (JWT) este un format folosit pentru a reprezenta date folosite în autorizare precum headerele `Authorization` și parametrii URI folosiți în mod curent la interogări.
Datele de autentificare sunt transmise ca un obiect JSON care este folosit ca payload pentru o Semnătură Web JSON. Această semnătură poate fi criptată.

Un JWT este constituit din trei secvențe care nu intră în coliziune cu restul părților ce formează URL-ul. Aceste fragmente sunt separate prin puncte și sunt codate în Base64.

- header;
- payload;
- signature.

## Header

Headerul poate avea următoarea semnătură.

```javascript
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Ceea ce putem observa este mențiunea unui algoritm care va fi folosit pentru a face hashing și tipul token-ului care este JWT.

## Payload

În payload-ul JWT, putem introduce un set de claim-uri (afirmații structurate în cheie: valoare). Unul din claim-uri trebuie să fie o data la care JWT-ul să expire. Restul, vor fi informații de identificare. Mai multe claim-uri vor forma un set.

```javascript
{
  "iss":"OrgEmitentă",
  "exp":1300819380,
  "name":"Nico",
  "administrator":true,
  "masterOfSpace":true
}
```

În claim-uri pot fi folosiți câțiva descriptori care sunt deja standardizați [Initial Registry Contents](https://tools.ietf.org/html/rfc7519#section-10.1.2).

### "iss" (Issuer) Claim

Identifică pe cel ce a emis JWT-ul. Acest claim este specific unei anumite aplicații, de regulă. Folosirea sa este opțională și poate fi chiar și un URI drept valoare.

### "sub" (Subject) Claim

Identifică subiectul în cauză al resursei. Este opțională și poate fi și un URI.

### "aud" (Audience) Claim

Identifică cui i se adresează. Este opțională și poate fi și un URI.

### "exp" (Expiration Time) Claim

Identifică timpul după care JWT-ul va expira. Acest lucru va indica serverului limita de la care nu va mai permite accesul la resurse pe baza JWT-ului. Este opțional.

### "nbf" (Not Before) Claim

Indică timpul de la care serverul trebuie să permită accesul la resurse. Este opțional.

### "iat" (Issued At) Claim

Indică momentul când a fost emis JWT-ul. Este opțional.

### "jti" (JWT ID) Claim

Este un identificator unic pentru JWT. Este opțional.

## Signature

Semnătura este folosită pentru a ne asigura că mesajul nostru nu a fost alterat înainte de a ajunge la server. De regulă acest lucru se face folosind chei private.

## Resurse

[JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
