let FormData = require('form-data');
let fetch = require("node-fetch").default
let fs = require("fs")
let os = require("os")
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

        /**
         * Easy or hard task, 1 (easy) or 2 (hard), defaults to 1
         */
        this.eoh = 1

        /**
         * URL to the task, ex: '/archiv/2019/doma/B/'
         */
        this.url = null
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
                if(!res.headers["set-cookie"][0]) reject("Wrong e-mail or password, if you are sure, that your e-mail/password combination is correct, please open an issue.")
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
     * @param {String} url
     * @returns {Promise}
     */
    getTask(link) {
        return new Promise(async(resolve, reject) => {
            if(!this.url&&!link) reject(`You need to set the URL using .url, ex: '.url = "/archiv/2019/doma/A/"' or set the URL manually as a parameter`)
            let url
            if(!link) url = this.url
            else url = link
            if (!url.startsWith("/")) url = "/" + url
            if (!url.endsWith("/")) url = url + "/"
            if (isNaN(this.eoh) || this.eoh > 2 || this.eoh < 1) reject("easyOrHard is not a number or is not 1 (easy) nor 2 (hard), set it with '.eoh = 1'")

            if (!this.cookie) reject("You need to login using .login('e-mail,'password')")
            // generates task
            let req = await fetch("https://kasiopea.matfyz.cz" + url + "?do=gen&subtask=" + this.eoh, {
                method: 'GET',
                headers: {
                    Cookie: this.cookie
                }
            }).catch((e) => {
                reject(e.message)
            })
            //downloads task
            req = fetch("https://kasiopea.matfyz.cz" + url + "?do=get&subtask=" + this.eoh, {
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

    /**
     * Send result
     * @param {String} output 
     * @param {String} url
     * @returns {Promise}
     */
    sendResult(output,link){
        return new Promise((resolve,reject)=>{
            if(!output) reject("You need to pass the output of the program to send.")
            if (isNaN(this.eoh) || this.eoh > 2 || this.eoh < 1) reject("easyOrHard is not a number or is not 1 (easy) nor 2 (hard), set it with '.eoh = 1'")
            if(!this.url&&!link) reject(`You need to set the URL using .url, ex: '.url = "/archiv/2019/doma/A/"' or set the URL manually as a parameter`)
            
            let url

            if(!link)url = this.url
            else url = link
            if (!url.startsWith("/")) url = "/" + url
            if (!url.endsWith("/")) url = url + "/"

            if (!this.cookie) reject("You need to login using .login('e-mail,'password')")
            let tmp = "/kasiotmp"
            if(!fs.existsSync(os.tmpdir()+tmp)) {
                try {
                    fs.mkdirSync(os.tmpdir()+tmp)
                } catch (error) {
                    reject(error)
                }
            }
            fs.writeFileSync(os.tmpdir()+tmp+"/result.txt",output)
            let sendData = new FormData()
            sendData.append("f",fs.createReadStream(os.tmpdir()+tmp+"/result.txt"))
            sendData.append("do","send")
            sendData.append("subtask",this.eoh)
            fetch("https://kasiopea.matfyz.cz"+url,{
                method:"POST",
                headers:{
                    Cookie:this.cookie,
                },
                body:sendData
            }).then(async (r)=>{
                let resp = await r.text()
                fs.writeFileSync("./kek.txt",resp)
                let error = resp.match(/<p class='error'>.*(<?\/p>)/)
                if(error != null && error[0].replace("<p class='error'>",'').replace("</p>","")!="Soutež skončila. Získané body již nejdou do výsledků." && error[0].replace("<p class='error'>",'').replace("</p>","")!="Nejsi finalista, takže se neobjevíš ve výsledcích.") reject(error[0].replace("<p class='error'>",'').replace("</p>",""))
                else resolve(true)
            }).catch((e)=>{
                reject(e)
            })
        })
    }
}


module.exports = KasiopeaAPI;