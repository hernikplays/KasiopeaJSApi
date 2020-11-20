# KasiopeaJSApi
 Neoficiální API [soutěže Kasiopea](https://kasiopea.matfyz.cz) pro NodeJS, těžce inspirováno [KasiopeaAPI](https://github.com/sorashi/KasiopeaApi/)
 
 ![npm](https://img.shields.io/npm/dy/kasiopeajsapi)
 
## Instalace
`npm i kasiopeajsapi`
 
 Měla by být podporována LTS verze Node.js

## Příklad použití
```js
const { Agent } = require("kasiopeajsapi")

Agent.login("email", "heslo").then(async (ag) => { // MÍSTO email A heslo NAPIŠTE VAŠE PŘIHL. ÚDAJE
    ag.eoh = 2; // NASTAVÍ, JESTLI SE MÁ STÁHNOUT LEHKÝ VSTUP (1) NEBO TĚŽKÝ (2), VÝCHOZÍ HODNOTA JE 1
    ag.url = "/archiv/2019/doma/A/" // ODKAZ NA ÚKOL = VŠE ZA "https://kasiopea.matfyz.cz"
    let taskInput = await l.getTask(); // ZÍSKÁ VSTUP A ULOŽÍ DO PROMĚNNÉ, ZE KTERÉ HO MŮŽETE VZÍT V KÓDU

    // SEM VLOŽTE VÁŠ KÓD
    
    let vysledek = await l.sendResult(reseni) // PROMĚNNOU "reseni" MUSÍTE VYTVOŘIT A MUSÍ BÝT STRING
    if (vysledek) console.log("Hurá! Úkol odevzdán") // KDYŽ SE VÝSLEDEK ÚSPĚŠNĚ ODEŠLE A JE SPRÁVNÝ, VRÁTÍ FUNKCE l.sendResult TRUE, POKUD BUDE NĚJAKÝ PROBLÉM PŘI ODESÍLÁNÍ NEBO JE VÝSLEDEK NESPRÁVNÝ, VRÁTI PromiseRejectionWarning
})
```

## [Funkční příklad](https://github.com/hernikplays/KasiopeaJSApi/blob/main/examples/archiv_2019_A.js)

Pokud máte nějaký dotaz/problém, můžete si [otevřít Issue](https://github.com/hernikplays/KasiopeaJSApi/issues) nebo mi napsat na [Twitter](https://twitter.com/hernikplays) nebo [Mastodon](https://makiroll.space/@hernik)
