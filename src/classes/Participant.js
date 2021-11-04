class Participant {
  constructor() {
    /**
     * Name of the participant
     * @type {String}
     */
    this.name = null;

    /**
     * Participant's placement
     * @type {Number}
     */
    this.place = null;

    /**
     * Points for each task
     * @type {Object}
     */
    this.points = {
      a: null,
      b: null,
      c: null,
      d: null,
      e: null,
      f: null,
      g: null,
      h: null,
    };

    /**
     * Total number of points
     * @type {Number}
     */
    this.totalPoints = null;

    /**
     * Completion time (in minutes)
     * @type {Number}
     */
    this.time = null;
  }
}

module.exports = Participant;
