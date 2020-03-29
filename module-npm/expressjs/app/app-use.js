# Metoda app.use()

Este metoda cu ajutorul căruia precizăm middleware-ul pe care cererile vor trebui să-l străbată în ordinea în care aceste middleware-uri au fost precizate. Fii foarte atentă cum introduci middleware-ul pentru că în cazul în care la final nu ai unul care să trateze cererea corespunzător, va apărea o eroare.

Problema pe care o ridică folosirea lui `use()` este legată de faptul că impune un traseu foarte rigid al cererii.

Pentru rutele pentru care nu dorești folosirea unui middleware, poți folosi metoda `route()`.

```javascript
resurseSpecialeRouter.route('/ceva').get(rutaGetUneiResurseSpeciale).post(rutaPostResSpeciala).patch(jsonBodyParser, actualizeaza).delete(rutaStergeResursa);
