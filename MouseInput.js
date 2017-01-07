class MouseInput {
  constructor () {
    this.pos = {
      x: 0,
      y: 0
    };
    this.lastPos = {
      x: 0,
      y: 0
    };
    this.isDown = false;
    this.wasDown = false;
    this.pressed = false;
    this.wasReleased = false;

    document.addEventListener("mousedown", e => this.down(e), false);
    document.addEventListener("mousemove", e => this.move(e), false);
    document.addEventListener("mouseup", e => this.up(e), false);
  }

  update () {
    this.wasDown = this.isDown;
    this.lastPos.x = this.pos.x;
    this.lastPos.y = this.pos.y;

    this.wasReleased = false;
    this.pressed = false;
  }

  down ({clientX: x, clientY: y}) {
    this.isDown = false;
    this.pressed = true;
    this.pos.x = x;//(x / window.innerWidth) * 2 - 1;
    this.pos.y = y;//- (y / window.innerHeight) * 2 + 1;
  }

  move ({clientX: x, clientY: y}) {
    this.pos.x = x;//(x / window.innerWidth) * 2 - 1;
    this.pos.y = y;//- (y / window.innerHeight) * 2 + 1;
  }

  up () {
    if (this.isDown) {
      this.wasReleased = true;
    }
    this.isDown = false;
  }

}

module.exports = MouseInput;
