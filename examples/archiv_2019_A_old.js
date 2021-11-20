const { Agent } = require("../src/main"); // samozřejmě pokud používáme mimo tuto složku, musíme require změnit na `kasiopeajsapi`
/*
     To the extent possible under law, Matyáš Caras has waived all copyright 
     and related or neighboring rights to the code contained in file "archiv_2019_A.js".
*/
Agent.login("email", "heslo")
  .then(async (l) => {
    l.eoh = 1; // funguje pro obě obtížnosti
    l.url = "/archiv/2019/doma/A/"; // nastaví odkaz
    let taskInput = await l.getTask(); // získá vstup

    let split = taskInput.split("\n");
    let pocetProblemu = split.shift();
    let i = 0;
    let j = 1;
    let reseni = "";
    while (i < pocetProblemu) {
      // dokud je i menší než počet příkladů
      let problem = split[j].split(" ");

      let loop = 0;
      let nulaIndex = [];

      problem.forEach((el) => {
        if (el == 0) nulaIndex.push(loop); // uloží indexy všech 0 ve vstupu do arraye
        loop++;
      });

      nulaIndex.forEach((el) => {
        if (el == 0) {
          // pokud je nula na začátku, nastaví na 1
          problem[el] = (1).toString();
        } else {
          // jinak nastaví na předchozí hodnotu + 1
          problem[el] = (parseInt(problem[el - 1]) + 1).toString();
        }
      });

      let finale = 0;
      let jeTamChyba = false;
      while (finale < problem.length) {
        // zkontroluje, jestli jdou čísla po sobě, pokud ne, nastaví 'jeTamChyba' na true
        if (finale == problem.length - 1) break;
        if (parseInt(problem[finale]) + 1 !== parseInt(problem[finale + 1]))
          jeTamChyba = true;
        finale++;
      }

      if (jeTamChyba) {
        // pokud je chyba, vloží do proměnné výsledku 'NE'
        if (i == pocetProblemu - 1) {
          reseni += "NE"; // pokud je na konci, nevkládat nový řádek
        } else {
          reseni += "NE\n";
        }
      } else {
        // jinak 'ANO'
        if (i == pocetProblemu - 1) {
          reseni += "ANO";
        } else {
          reseni += "ANO\n";
        }
      }
      i++;
      j += 2;
    }
    let vysledek = await l.sendResult(reseni); // odešle proměnnou 'reseni' jako vysledek
    if (vysledek) console.log("Hurá! Úkol odevzdán"); // když je správně, vypíše do konzole
  })
  .catch((e) => {
    // ! Vždy chytejte
    console.log(e);
  });
