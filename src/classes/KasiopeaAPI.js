let FormData = require('form-data');
let fetch = require("node-fetch").default
class KasiopeaAPI {
    constructor() {
        /**
         * Is user logged in?
         */
        this.loggedIn = false
        /**
         * User's auth cookie
         */
        this.cookie = null
    }

    /**
     * Get user's cookie
     * @param {String} email 
     * @param {String} password 
     * @returns {Promise}
     */
    login(email, password) {
        return new Promise((resolve, reject) => {
            if (!email || !password) reject("You need to enter an e-mail and password.")

            let bodyFormData = new FormData();
            bodyFormData.append("email", email)
            bodyFormData.append("passwd", password)
            bodyFormData.append("redirect", "")
            bodyFormData.append("submit", "Přihlásit")

            bodyFormData.submit("https://kasiopea.matfyz.cz/auth/login.cgi?done=1", (err, res) => {
                if (err) reject(err)
                this.cookie = res.headers["set-cookie"][0]
                if (this.cookie) {
                    this.loggedIn = true
                    resolve(this)
                } else reject("Failed to get cookie")
            })

        })
    }
    /**
     * Get task input
     * @param {String} pathToTask
     * @param {Number} easyOrHard 
     * @returns {String}
     */
    getTask(url, eoh) {
        return new Promise(async(resolve, reject) => {
            if (!url) reject("You need to enter a URL to a task, ex.: '/archiv/2019/doma/A/'")
            if (!url.startsWith("/")) url = "/" + url
            if (!url.endsWith("/")) url = url + "/"
            if (isNaN(eoh) || eoh > 2 || eoh < 1) reject("easyOrHard is not a number or is not 1 (easy) nor 2 (hard)")

            if (!this.cookie) reject("You need to login using .login('e-mail,'password')")
            console.log(eoh)
            // generates task
            let req = await fetch("https://kasiopea.matfyz.cz" + url + "?do=gen&subtask=" + eoh, {
                method: 'GET',
                headers: {
                    Cookie: this.cookie
                }
            }).catch((e) => {
                reject(e.message)
            })
            //downloads task
            req = fetch("https://kasiopea.matfyz.cz" + url + "?do=get&subtask=" + eoh, {
                    method: 'GET',
                    headers: {
                        Cookie: this.cookie,
                        'Accept-Encoding': 'gzip,deflate'
                    },
                    encoding: null
                }).then(async (res) => {
                    if (res.status > 303) reject(res.status + " " + res.statusText)
                    let text = await res.text()
                    resolve(text)
                })
                .catch((e) => {
                    reject(e.message)
                })
        })
    }
}


module.exports = KasiopeaAPI;