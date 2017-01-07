const THREE = require("three");

class HUD {
  constructor () {
    const width = 100;
    const height = 100;

    this.cameraHUD = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 30 );
    this.sceneHUD = new THREE.Scene();

    this.addIcon(10, 10, "Stack");
    this.addIcon(10, 170, "Build");

    //renderer.render(sceneHUD, cameraHUD);
  }

  addIcon (x, y, label) {
    const w = 150;
    const h = 150;
    const hudCanvas = document.createElement("canvas");
    hudCanvas.width = w;
    hudCanvas.height = h;

    const hudTexture = new THREE.Texture(hudCanvas);
    const hud = hudCanvas.getContext("2d");
    hud.clearRect(0, 0, w, h);
    hud.font = "Normal 14px Arial";
    hud.textAlign = "center";
    hud.fillStyle = "white";
    hud.fillText(label, x, y);
    hudTexture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({map: hudTexture});
    material.transparent = true;
    const planeGeometry = new THREE.PlaneBufferGeometry(w, h);
    const plane = new THREE.Mesh(planeGeometry, material);
    this.sceneHUD.add(plane);
  }
}

module.exports = HUD;
