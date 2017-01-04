const bounceOut = t => {
  if (t < 1/2.75) {
    return (7.5625*t*t);
  } else if (t < 2/2.75) {
    return (7.5625*(t-=1.5/2.75)*t+0.75);
  } else if (t < 2.5/2.75) {
    return (7.5625*(t-=2.25/2.75)*t+0.9375);
  } else {
    return (7.5625*(t-=2.625/2.75)*t +0.984375);
  }
};
const getPowInOut = pow => t => {
  if ((t*=2)<1) return 0.5*Math.pow(t,pow);
  return 1-0.5*Math.abs(Math.pow(2-t,pow));
};
const cubicInOut = getPowInOut(3);
const linear = t => t;

class Tween {
  constructor (obj, props, time = 1000, cb) {
    this.obj = obj;
    this.props = props;
    this.time = time;
    this.cb = cb;

    this.initProps ={};
    for (let p in props) {
      this.initProps[p] = obj[p];
      this.initProps[p + "_dt"] = (props[p] - obj[p]) / time;
    }

    this.startTime = Date.now();
  }

  update () {
    const now = Date.now();
    const dt = now - this.startTime;
    const t = Math.min(1, Math.max(0, dt / this.time));
    if (dt > this.time) {
      for (let p in this.props) {
        // Set to end values
        this.obj[p] = this.props[p];
      }
      this.cb && this.cb(this.obj);
      return false;
    }

    for (let p in this.props) {
      this.obj[p] = this.initProps[p] + (this.initProps[p + "_dt"] * cubicInOut(t) * dt);
    }
    return true;
  }
}

module.exports = Tween;
