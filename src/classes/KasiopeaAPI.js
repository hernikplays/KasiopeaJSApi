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
    this.cookie = null;

    /**
     * Obtížnost, 1 (lehká) nebo 2 (těžká)
     * @type {Number}
     * @default
     */
    this.eoh = 1;

    /**
     * URL k úkolu, např.: '/archiv/2019/doma/B/'
     * @type {String}
     */
    this.url = null;
  }

  /**
   * Získá uživatelovu autentikační sušenku
   * @param {String} email
   * @param {String} password
   * @returns {Promise}
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
        reject("You need to enter an e-mail and password.");

      let bodyFormData = new FormData();
      bodyFormData.append("email", email);
      bodyFormData.append("passwd", password);
      bodyFormData.append("redirect", "");
      bodyFormData.append("submit", "Přihlásit");

      bodyFormData.submit(
        "https://kasiopea.matfyz.cz/auth/login.cgi?done=1",
        (err, res) => {
          if (err) reject(err);
          if (res.headers["set-cookie"].length < 1)
            reject(
              "Neplatný e-mail nebo heslo, pokud si jste jistí, že vaše údaje jsou správné, otevřte si Issue v repozitáři."
            );
          this.cookie = res.headers["set-cookie"][0];
          if (this.cookie) {
            this.loggedIn = true;
            resolve(this);
          } else reject("Nepodařilo se získat sušenku.");
        }
      );
    });
  }
  /**
   * Získá vstup k úloze
   * @param {String} url
   * @returns {Promise}
   *
   * @example
   * let taskInput = await Agent.getTask()
   */
  getTask(link) {
    return new Promise((resolve, reject) => {
      if (!this.url && !link)
        reject(
          `Musíte nastavit URL k úloze pomocí vlastnosti url, např.: '.url = "/archiv/2019/doma/A/"' nebo nastavte URL jako parametr`
        );
      let url;
      if (!link) url = this.url;
      else url = link;
      if (!url.startsWith("/")) url = "/" + url;
      if (!url.endsWith("/")) url = url + "/";
      if (isNaN(this.eoh) || this.eoh > 2 || this.eoh < 1)
        reject(
          "easyOrHard není číslo, nebo není nastaveno na 1 (easy) ani 2 (hard), nastavte ho pomocí vlastnosti 'eoh', např.: '.eoh = 1'"
        );

      if (!this.cookie)
        reject("Musíte se přihlásit pomocí metody .login('e-mail,'heslo')");
      // vygeneruje úlohu
      axios(
        "https://kasiopea.matfyz.cz" + url + "?do=gen&subtask=" + this.eoh,
        {
          method: "GET",
          headers: {
            Cookie: this.cookie,
          },
        }
      )
        .catch((e) => {
          reject(`getTask CHYBA:\n${e.message}`);
        })
        .then(() => {
          // stáhne úlohu
          axios(
            "https://kasiopea.matfyz.cz" + url + "?do=get&subtask=" + this.eoh,
            {
              method: "GET",
              headers: {
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
              reject(`getTask CHYBA:\n${e.message}`);
            });
        });
    });
  }

  /**
   * Send result
   * @param {String} output
   * @param {String} url
   * @returns {Promise}
   *
   * @example
   * let send = "your result of task here"
   * let result = await Agent.sendResult(send)
   */
  sendResult(output, link) {
    return new Promise((resolve, reject) => {
      if (!output) reject("Musíte uvést výstup jako argument.");
      if (isNaN(this.eoh) || this.eoh > 2 || this.eoh < 1)
        reject(
          "easyOrHard není číslo, nebo není nastaveno na 1 (easy) ani 2 (hard), nastavte ho pomocí vlastnosti 'eoh', např.: '.eoh = 1'"
        );
      if (!this.url && !link)
        reject(
          `Musíte nastavit URL k úloze pomocí vlastnosti url, např.: '.url = "/archiv/2019/doma/A/"' nebo nastavte URL jako parametr`
        );

      let url;

      if (!link) url = this.url;
      else url = link;
      if (!url.startsWith("/")) url = "/" + url;
      if (!url.endsWith("/")) url = url + "/";

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
        "f",
        fs.createReadStream(os.tmpdir() + tmp + "/result.txt")
      );
      sendData.append("do", "send");
      sendData.append("subtask", this.eoh);
      axios("https://kasiopea.matfyz.cz" + url, {
        method: "POST",
        headers: {
          Cookie: this.cookie,
        },
        data: sendData,
      })
        .then(async (r) => {
          let error = r.data.match(/<p class='error'>.*(<?\/p>)/);
          if (
            error != null &&
            error[0].replace("<p class='error'>", "").replace("</p>", "") !=
              "Soutež skončila. Získané body již nejdou do výsledků." &&
            error[0].replace("<p class='error'>", "").replace("</p>", "") !=
              "Nejsi finalista, takže se neobjevíš ve výsledcích."
          )
            reject(
              error[0].replace("<p class='error'>", "").replace("</p>", "")
            );
          else resolve(true);
        })
        .catch((e) => {
          reject(`sendResult CHYBA:\n${e.message}`);
        });
    });
  }
}

module.exports = KasiopeaAPI;
