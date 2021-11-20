# KasiopeaJSApi
 Neoficiální API [soutěže Kasiopea](https://kasiopea.matfyz.cz) pro NodeJS, těžce inspirováno [KasiopeaAPI](https://github.com/sorashi/KasiopeaApi/)
 
 ![npm](https://img.shields.io/npm/dy/kasiopeajsapi)
 
## Instalace
`npm i kasiopeajsapi`
 
 Testováno na NodeJS v16.11.1
## API zvládne
- [x] Přihlásit se pod vaším jménem
- [x] Stáhnout vstup a odeslat výsledek
- [ ] Získat informace o úkolu (Jméno, popis)
- [x] Číst tabulku výsledků (i z archivu :)

## Breaking changes ve verzi 2.0.0
Kasiopea se hodně změnila, verze `2.0.0` je dělaná hodně narychlo, lepší řešení zkusím dodat později

- úkoly se neidentifikují podle URL, ale podle jejich čísla, to lze zjistit otevřením `nástrojů pro vývojáře > Síť`, kde naleznete požadavek typu `https://kasiopea.matfyz.cz/api/tasks/2`, kde `2` je číslo úkolu.
```diff
- l.url = "/archiv/2019/doma/A/"
+ l.task = 101
```
- přihlašování již není pomocí form-data, ale JSONu
- požadavky používají `X-KASIOPEA-AUTH-TOKEN`

Jinak by vše mělo fungovat jako předtím :)

## [Funkční příklad (Verze 1.4.0)](https://github.com/hernikplays/KasiopeaJSApi/blob/main/examples/archiv_2019_A_old.js)
## [Funkční příklad (Verze 2.0.0)](https://github.com/hernikplays/KasiopeaJSApi/blob/main/examples/archiv_2019_A_old.js)


**Pokud máte nějaký dotaz/problém, můžete si [otevřít Issue](https://github.com/hernikplays/KasiopeaJSApi/issues) nebo mi napsat na [Twitter](https://twitter.com/hernikplays)**
