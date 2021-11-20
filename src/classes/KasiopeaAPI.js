const FormData = require("form-data");
const axios = require("axios").default;
const fs = require("fs");
const os = require("os");
/*
    Copyright (c) 2020 hernikplays

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
class KasiopeaAPI {
  constructor() {
    /**
     * Je uživatel přihlášen?
     * @type {Boolean}
     */
    this.loggedIn = false;
    /**
     * Autentikační sušenka uživatele
     * @type {String}
     */
    this.auth = null;

    /**
     * Sušenky
     * @type {String}
     */
    this.cookie

    /**
     * Datum, kdy sušenka vyprší
     * @type {Date}
     */
    this.expires = null

    /**
     * Obtížnost, 1 (lehká) nebo 2 (těžká)
     * @type {Number}
     * @default
     */
    this.eoh = 1;

    /**
     * ČÍSLO úkolu, jak získat zjistítě {@link https://github.com/hernikplays/KasiopeaJSApi/ zde}
     * @type {Number}
     */
    this.task = null;

    /**
     * ID vstupu, který byl právě vygenerován
     * @type {String}
     * 
     */
    this.inputId = null;
  }

  /**
   * Získá uživatelovu autentikační sušenku
   * @param {String} email
   * @param {String} password
   * @returns {Promise<Agent>}
   *
   * @example
   *
   * Agent.login("email", "password").then(async (l) => {
   * // your code
   * })
   */
  login(email, password) {
    return new Promise((resolve, reject) => {
      if (!email || !password)
        reject("Musíte zadat e-mail a heslo");

      axios.post("https://kasiopea.matfyz.cz/api/auth", {email,password}).then(async (res) => {
        if (res.status < 300 && res.status > 199) {
          this.loggedIn = true;
          this.auth = res.data.access_token;
          this.cookie = res.headers["set-cookie"][0];
          this.expires = new Date(res.data.access_token_expiry);
          resolve(this);
        } else {
          reject("Chyba při získávání údajů");
        }
      }).catch(() => {
        reject("Něco se pokazilo při přihlašování");
      });
    });
  }
  /**
   * Získá vstup k úloze
   * @param {Number} taskNumber Číslo úkolu
   * @returns {Promise}
   *
   * @example
   * let taskInput = await Agent.getTask()
   */
  getTask(taskNumber) {
    return new Promise((resolve, reject) => {
      if ((!this.task && !taskNumber))
        reject(
          `Musíte nastavit číslo úlohy pomocí vlastnosti task, např.: '.task = 2' nebo nastavte číslo úlohy jako parametr`
        );
      let url;
      if (!taskNumber) url = this.task;
      else url = taskNumber;
      if(isNaN(url)) reject("Číslo úlohy není číslo");
      if (isNaN(this.eoh) || this.eoh > 2 || this.eoh < 1)
        reject(
          "easyOrHard není číslo, nebo není nastaveno na 1 (easy) ani 2 (hard), nastavte ho pomocí vlastnosti 'eoh', např.: '.eoh = 1'"
        );

      if (!this.cookie)
        reject("Musíte se přihlásit pomocí metody .login('e-mail,'heslo')");
      // vygeneruje úlohu
      axios(
        "https://kasiopea.matfyz.cz/api/tasks/" + url + "/" + (this.eoh == 1 ? "easy" : "hard"),
        {
          method: "POST",
          headers: {
            "X-KASIOPEA-AUTH-TOKEN": "Bearer "+this.auth,
            Cookie: this.cookie,
            "Accept-Encoding": "gzip,deflate",
          },
        }
      )
      .then((r) => {
        // stáhne úlohu
        if(r.status == 429) reject("Překročen limit generování úloh, zkuste to znovu později");
        this.inputId = r.data.id;
        axios(
          "https://kasiopea.matfyz.cz/api/attempts/" + this.inputId + "/input",
          {
            method: "GET",
            headers: {
              "X-KASIOPEA-AUTH-TOKEN": "Bearer "+this.auth,
          Cookie: this.cookie,
          "Accept-Encoding": "gzip,deflate",
            },
            encoding: null,
          }
        )
          .then(async (res) => {
            if (res.status > 303) reject(res.status + " " + res.statusText);

            resolve(res.data);
          })
          .catch((e) => {
            reject(`getTask CHYBA2:\n${e.message}`);
          });
      })
        .catch((e) => {
          reject(`getTask CHYBA:\n${e.message}`);
        })
        
    });
  }

  /**
   * Send result
   * @param {String} output
   * @param {String} url
   * @returns {Promise<boolean>}
   *
   * @example
   * let send = "your result of task here"
   * let result = await Agent.sendResult(send)
   */
  sendResult(output) {
    return new Promise((resolve, reject) => {
      if (!output) reject("Musíte uvést výstup jako argument.");
      if (isNaN(this.eoh) || this.eoh > 2 || this.eoh < 1)
        reject(
          "easyOrHard není číslo, nebo není nastaveno na 1 (easy) ani 2 (hard), nastavte ho pomocí vlastnosti 'eoh', např.: '.eoh = 1'"
        );
        if ((!this.task))
        reject(
          `Musíte nastavit číslo úlohy pomocí vlastnosti task, např.: '.task = 2' A získat vstup pomocí metody getTask`
        );

      if (!this.cookie)
        reject("Musíte se přihlásit pomocí metody .login('e-mail,'password')");
      let tmp = "/kasiotmp";
      if (!fs.existsSync(os.tmpdir() + tmp)) {
        try {
          fs.mkdirSync(os.tmpdir() + tmp);
        } catch (error) {
          reject(error);
        }
      }
      fs.writeFileSync(os.tmpdir() + tmp + "/result.txt", output);
      let sendData = new FormData();
      sendData.append(
        "output",
        fs.createReadStream(os.tmpdir() + tmp + "/result.txt")
      );
      let h = sendData.getHeaders()['content-type'];
      axios("https://kasiopea.matfyz.cz/api/attempts/" + this.inputId + "/submit", {
        method: "POST",
        headers: {
          "X-KASIOPEA-AUTH-TOKEN": "Bearer "+this.auth,
            Cookie: this.cookie,
            'content-type':h
        },
        data: sendData,
      })
        .then(async (r) => {
          if(r.status == 429) reject("Překročen limit odesílání výstupu, zkuste to znovu později");
          if(r.data.state == "success"){
            resolve(true)
          }
          else{
            reject("Úloha nebyla vyřešena správně")
          }
        })
        .catch((e) => {
          reject(`sendResult CHYBA:\n${e.message}`);
        });
    });
  }
}

module.exports = KasiopeaAPI;
