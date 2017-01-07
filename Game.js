const THREE = require("three");
const makeChunkGeom = require("./geom/makeChunkGeom");
const World = require("./world/World");
const Physics = require("./Physics");
const OBJLoader = require("./vendor/OBJLoader");
const MTLLoader = require("./vendor/MTLLoader");
const MouseInput = require("./MouseInput");
const Backpack = require("./Backpack");
const tween = require("./TweenManager");

class Game {

  constructor () {
    this.dist = 35;
    this.rechunkIdx = 0;

    this.mouse = new MouseInput();
    this.raycaster = new THREE.Raycaster();
    this.backpack = new Backpack();

    this.scene = null;
    this.geom = {};

    this.init();

    this.world = new World();
    this.physics = new Physics();

    this.addGeom();
    this.addSomeTrees();

    this.lightScene();

    this.update = this.update.bind(this);
    requestAnimationFrame(this.update);

  }

  init () {
    this.scene = new THREE.Scene();

    const camera = this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
    const renderer = this.renderer = new THREE.WebGLRenderer({antialias: true});
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize, false);
    resize();
    document.body.appendChild(renderer.domElement);
  }

  lightScene () {
    const {scene} = this;
    scene.background = new THREE.Color(0xc0e9FD);
    scene.fog = new THREE.Fog(0xc0e9FD, this.dist / 2, this.dist * 2);

    const amb = new THREE.AmbientLight(0x555555);
    scene.add(amb);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(-1, 0.5, 1).normalize();
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight2.position.set(1, 0.5, 1).normalize();
    scene.add(dirLight2);
  }

  addSomeTrees () {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();
    mtlLoader.setPath("res/");
    objLoader.setPath("res/");

    const load = (name, cb) => mtlLoader.load(name + ".mtl", materials => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(name + ".obj", mesh => cb(mesh));
    });

    load("Tree1", mesh => {
      mesh.position.set(-8, -2, -8);
      mesh.scale.set(4, 4, 4);
      this.scene.add(mesh);
      tween.add(mesh.rotation, {y: Math.PI * 2}, 10000);

      load("Tree4", mesh => {
        mesh.position.set(28, 2, 24);
        mesh.scale.set(3, 3, 3);
        this.scene.add(mesh);
      });
    });
  }

  addGeom () {
    for (let c in this.world.chunks) {
      this.addChunkGeom(c);
    }
  }

  addChunkGeom (ch) {
    const {scene} = this;
    this.geom[ch] = makeChunkGeom(this.world.chunks[ch]);
    scene.add(this.geom[ch]);
  }

  rechunk (ch) {
    if (!this.world.chunks[ch].isDirty) {
      return;
    }
    setTimeout(()=> {
      this.scene.remove(this.geom[ch]);
      this.geom[ch].geometry.dispose();
      this.geom[ch] = null;
      this.geom[ch] = makeChunkGeom(this.world.chunks[ch]);
      this.scene.add(this.geom[ch]);
      this.world.chunks[ch].isDirty = false;
    }, 0);
  }

  update () {
    const {camera, mouse, raycaster, scene, renderer, world} = this;
    const spd = Date.now() / 10000;

    if (world.newEntities.length) {
      world.newEntities.forEach(e => {
        world.entities.push(e);
        scene.add(e);
      });
      world.newEntities = [];
    }

    if (mouse.pressed) {
      if (mouse.pos.x < 100) {
        if (mouse.pos.y < 50) {
          this.backpack.setItem(0);
        }
        else {
          this.backpack.setItem(1);
        }
      }
      else {
        raycaster.setFromCamera({
          x: (mouse.pos.x / window.innerWidth) * 2 - 1,
          y: - (mouse.pos.y / window.innerHeight) * 2 + 1
        }, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length) {
          const o = intersects[0].object;
          if (o && o.parent && o.parent.parent) {
            const blerb = o.parent.parent;
            if (blerb.state === "walking") {
              //blerb.setState(Math.random() < 0.2 ? "stacking" : "building");
              blerb.setState(["stacking", "building"][this.backpack.current]);
            } else {
              blerb.setState("walking");
            }
          }
        }
      }
    }

    /*
      for (let c in world.chunks) {
      const chunk = world.chunks[c];
      const ents = world.entities[c];
      this.physics.update(chunk, ents, world.chunks);
      ents.forEach(e => e.update(chunk));
    }*/
    world.entities.forEach(e => {
      const chunk = this.physics.update(e, world.chunks, world.cw, world.ch);
      e.update(chunk);
    });

    this.rechunk(world.chunkArr[this.rechunkIdx++ % world.size]);

    renderer.render(scene, camera);

    camera.position.y = 12 + Math.cos(spd*5);
    camera.position.x = Math.cos(spd) * this.dist;
    camera.position.z = Math.sin(spd) * this.dist;
    camera.lookAt(new THREE.Vector3(8, 12, 8));

    tween.update();
    mouse.update();

    requestAnimationFrame(this.update);
  }

}

module.exports = Game;
