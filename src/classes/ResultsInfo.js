let fetch = require("node-fetch")
let Participant = require("./Participant")

module.exports = {
    /**
     * Get list of participants
     * @param {String} link
     * @returns {Promise}
     * 
     * @example
     * let participants = ResultsInfo.getParticipants
     */
    getParticipants: function (link) {
        return new Promise((resolve, reject) => {
            let url
            if (!link) url = "/soutez/vysledky.html"
            else url = link
            if (!url.startsWith("/")) url = "/" + url
            console.log("https://kasiopea.matfyz.cz" + url)
            fetch("https://kasiopea.matfyz.cz" + url, {
                method: "GET"
            }).then((res, err) => {

                res.text().then((r) => {
                    let participants = r.match(/<td class='name'>[a-zA-ZěščřžýáíéňťďĚŠČŘŽÝÁÍÉŇŤ ]*(<td class='task'>[0-9]{0,2})*<td class='penalty'>[0-9]*<td class='total_points'>[0-9]{1,2}/g)
                    let i = 0
                    let parArr = []
                    participants.forEach(e => {
                        i++
                        let partic = new Participant()
                        partic.name = e.match(/<td class='name'>[a-zA-ZěščřžýáíéňťďĚŠČŘŽÝÁÍÉŇŤ ]*/g)[0].replace("<td class='name'>", "")
                        let tasks = e.match(/<td class='task'>[0-9]{0,2}/g)

                        let j = 0
                        let taskObj = {}
                        tasks.forEach(t => {
                            let s = t.replace("<td class='task'>", "")
                            switch (j) {
                                case 0:
                                    taskObj.a = (s.length < 1) ? null : s
                                    break;
                                case 1:
                                    taskObj.b = (s.length < 1) ? null : s
                                    break;
                                case 2:
                                    taskObj.c = (s.length < 1) ? null : s
                                    break;
                                case 3:
                                    taskObj.d = (s.length < 1) ? null : s
                                    break;
                                case 4:
                                    taskObj.e = (s.length < 1) ? null : s
                                    break;
                                case 5:
                                    taskObj.f = (s.length < 1) ? null : s
                                    break;
                                case 6:
                                    taskObj.g = (s.length < 1) ? null : s
                                    break;
                                case 7:
                                    taskObj.h = (s.length < 1) ? null : s
                                    break;
                                default:
                                    break;
                            }
                            j++
                        })
                        partic.points = taskObj
                        partic.time = e.match(/<td class='penalty'>[0-9]*/g)[0].replace("<td class='penalty'>", "")
                        partic.place = i
                        partic.totalPoints = e.match(/<td class='total_points'>[0-9]{0,2}/g)[0].replace("<td class='total_points'>", "")
                        parArr.push(partic)
                    })
                    resolve(parArr)
                })

            })
        })
    }
}