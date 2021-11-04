module.exports = {};

let KasiopeaAPI = require("./classes/KasiopeaAPI");
let instance = new KasiopeaAPI();

module.exports = {
  Agent: instance,
  ResultsInfo: require("./classes/ResultsInfo"),
};
