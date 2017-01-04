const Tween = require("./Tween");

class TweenManager {

  constructor () {
    this.queue = [];
    this.toAdd = [];
  }

  add (obj, props, time = 1000, cb) {
    this.toAdd.push(new Tween(obj, props, time, cb));
  }

  update () {
    this.toAdd.forEach(a => this.queue.push(a));
    this.toAdd = [];

    // Update anything in the queue.
    this.queue = this.queue.filter(a => a.update());
  }

}

const tween = new TweenManager();

module.exports = tween;
