# Helperul `each`

Atunci când dorești afișarea unor date într-un fragment repetitiv de HTML5, se va folosi `{{#each numeArrayCuObiecte}}`.

```handlebars
{{#each resurse}}
    <div class="card" style="width: 18rem;">
        <img class="coperta" src="{{this.coperta}}" class="card-img-top" alt="{{this.title}}">
        <div class="card-body">
            <h5 class="card-title">{{this.title}}</h5>
            <p class="card-text">{{this.description}}</p>
            <a href="#" class="btn btn-primary">Afișează</a>
        </div>
    </div>
{{/each}}
```
