# Process Manager 2

PM2 este un manager de procese pentru aplicații Node.js care are și un load balancer.

## Rularea instanțelor

Pentru a porni o instanță a aplicației, se poate rula comanda `pm2 start nume_fișier.js`. În cazul în care dorești să dai un nume aplicației rulate, vei executa comanda cu opțiunea `--name`, precum în `pm2 start --name nume-app nume_fișier.js`.

În cazul în care programul are nevoie de argumente pe care să le lansezi la momentul rulării, pm2 permite specificarea acestora la finalul comenzii de `start`, fiecare valoare fiind precedată de două liniuțe: `pm2 start --name serveruno nume_fișier.js -- --nume serveruno --port 8080`.

Este o practică solidă să numești instanțele care rulează în pm2 pentru a putea opera pe fiecare în parte.

Poți lansa oricâte instanțe dorești în limita suportată de procesor folosind nume diferite dacă dorești să le diferențiezi. În momentul în care ai lansat instanțele, pentru a reveni la rularea tuturor după un restart, este util să rulezi comanda `pm2 save`.

### Pornește un număr prestabilit de instanțe

Folosind opțiunea `-i` poți stabili numărul de instanțe care vor rula pentru o aplicație Node.js.

```bash
pm2 start nume_fișier.js -i 3
```

### Pornește toate instanțele

Atunci când dorești să rulezi un număr de instanțe maxim cât poate suporta procesorul, vei rula comanda `pm2 start nume_fișier -i -1`. Dând `-1` opțiunii `-i`, va avea drept efect calcularea numărului maxim de instanțe care pot fi create.

## Oprirea instanțelor

Pentru a opri rularea instanțelor, se va rula comanda `pm2 stop nume_aplicație_din_pm2` sau `pm2 stop all` când ai mai multe instanțe care rulează.

## Ștergerea tuturor instanțelor

Atunci când ai nevoie să ștergi toate instanțele pentru a crea un set nou, se va folosi comanda `pm2 delete nume_aplicație` sau `pm2 delete all` când ai mai multe instanțe care rulează.

## Logging

Pentru a vedea mesajele log-ului, se va folosi comanda `pm2 logs`.

## Monitorizare

### Vezi numărul de instanțe

Pentru a vedea numărul instațelor care rulează, vom folosi comanda `pm2 list` sau `pm2 ls`.

### Panoul de monitorizare

Pentru a afla infomații importante despre rularea instanțelor, poți folosi `pm2 monit`.

## Modificare și reload

După ce faci o modificare în cod, vei avea nevoie să reîncarci codul aplicației pentru ca runtime-ul să reflecte modificările. În acest scop avem comanda `pm2 reload nume_aplicație`.
