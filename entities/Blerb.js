const THREE = require("three");
const OBJLoader = require("../vendor/OBJLoader");
const MTLLoader = require("../vendor/MTLLoader");

const tween = require("../TweenManager");

class Blerb extends THREE.Object3D {
  constructor(x, y, z, cw, ch) {
    super();

    // NOTE: tx/ty/tz relative to chunk, not world
    this.tx = (x % cw) | 0;
    this.ty = (y % ch) | 0;
    this.tz = (z % cw) | 0;
    this.lastTx = this.tx;
    this.lastTy = this.ty;
    this.lastTz = this.tz;

    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.setPath("res/");
    objLoader.setPath("res/");

    const load = (name, cb) => mtlLoader.load(name + ".mtl", materials => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(name + ".obj", mesh => {
        cb(mesh);
      });
    });

    load("chess", mesh => {
      //mesh.position.set(-8, -2, -8);
      //mesh.scale.set(4, 4, 4);
      mesh.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.computeBoundingBox();
        }
      });
      this.add(mesh);

    });

    this.name = "blerb";
    this.userData.entity = this;

    //const blerbGeom = geom.blerb;
    this.h = 1.4; //blerbGeom.parameters.height - 0.4;
    this.w = 0.7; //blerbGeom.parameters.width;

    this.canFall = true;

    this.position.set(x, y + 1 + (this.h / 2), z);
    this.dir = Math.random() < 0.5 ? "x" : "z";
    this.speed = (Math.random() * 0.03 + 0.01) * (Math.random() < 0 ? -1 : 1);

    this.state = "walking";
    this.stateTime = 0;
  }

  setState (state) {
    this.state = state;
    this.stateTime = 0;
  }

  update (chunk) {
    let {state, stateTime, tx, ty, tz, lastTx, lastTy, lastTz} = this;
    const isStateFirst = stateTime === 0;
    stateTime = this.stateTime++;

    if (Math.random() < 0.01) {
      this.canFall = !this.canFall;
    }

    switch (state) {
    case "walking":
      /*if (Math.random() < 0.01) {
        this.setState(Math.random() < 0.2 ? "stacking" : "building");
      }
      if (Math.random() < 0.002) {
        this.setState("bashing");
      }*/
      break;
    case "building":
      if (tx !== lastTx || tz !== lastTz || this.stateTime > 1000) {
        if (this.ty < chunk.h - 1) {
          chunk.setBlock(this.tx, this.ty, this.tz, 1);
          this.stateTime = 0;
        }
        if (Math.random() < 0.2) {
          this.setState("walking");
        }
      }
      // if (Math.random() < 0.01) {
      //   this.setState("walking");
      // }
      break;
    case "stacking":
      if (this.stateTime > 5) {
        if (this.ty < chunk.h - 1) {
          chunk.setBlock(this.tx, this.ty, this.tz, 2);
          this.stateTime = 0;
        }
        if (Math.random() < 0.2) {
          this.setState("walking");
        }
      }
      break;
    case "bashing":
      if (isStateFirst) {
        const initp = this.rotation.y;
        tween.add(this.rotation, {y: initp + (Math.PI * 2)}, 350, o => tween.add(o, {y: initp}, 350));
      }
      if (this.stateTime > 100) {
        [
          [ 0, 1, 0],
          [ 0, 0, 0],
          [ 1, 0, 0],
          [ 0, 0, 1],
          [-1, 0, 0],
          [ 0, 0,-1],
          [ 1, 0, 1],
          [ 1, 0,-1],
          [-1, 0, 1],
          [-1, 0,-1],
          [ 0,-1, 0],
        ]
        .forEach(([x, y, z]) => chunk.setBlock(this.tx + x, this.ty + y, this.tz + z, 0));

        this.setState("walking");
      }
      break;

    }
  }
}

module.exports = Blerb;
