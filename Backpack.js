class Backpack {
  constructor () {
    this.items = [0, 0, 0, 0];
    this.current = 0;
  }

  setItem (idx) {
    this.current = idx;
  }
}

module.exports = Backpack;
