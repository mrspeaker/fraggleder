class Physics {
  update (e, chunks, cw, ch) {
    //const h = chunk[0].h;

    const {dir, position, tx, ty, tz, state} = e;
    let {x, y, z} = position;
    const id = Math.floor(x / cw) + "_" + Math.floor(y / ch) + "_" + Math.floor(z / cw);
    let chunk = chunks[id];
    if (state === "bashing") {
      return;
    }

    e.lastTx = tx;
    e.lastTy = ty;
    e.lastTz = tz;

    position[dir] += e.speed;
    x = position.x;
    z = position.z;
    //if (position[dir] < chunk[dir] * chunk.w) {
      //position[dir] = chunk[dir] * chunk.w;
      //e.speed *= -1;
    //}

    //if (position[dir] > (chunk[dir] * chunk.w) + chunk.w - 1) {
      //position[dir] = (chunk[dir] * chunk.w) + chunk.w - 1;
      //e.speed *= -1;
    //}

    const newId = Math.floor(x / cw) + "_" + Math.floor(y / ch) + "_" + Math.floor(z / cw);
    if (id !== newId) {
      chunk = chunks[newId];
      if (!chunk) {
        position[dir] -= e.speed;
        e.speed *= -1;
        return;
      }
    }

    e.tx = (Math.round(position.x - (chunk.x * (chunk.w))) + cw) % chunk.w;
    e.tz = (Math.round(position.z - (chunk.z * (chunk.w))) + cw) % chunk.w;

    //const newBlock = e.tx === e.lastTx || e.tz !== e.lastTz;

    // Hit a block
    if (chunk.data[e.ty][e.tx][e.tz] !== 0) {
      if (chunk.data[e.ty + 1][e.tx][e.tz] !== 0) {
        // Brick wall
        e.tx = tx;
        e.tz = tz;
        position.x = e.tx + (chunk.x * chunk.w);
        position.z = e.tz + (chunk.z * chunk.w);
        e.dir = Math.random() < 0.5 ? "x" : "z";
        e.speed *= -1;
      }
      else {
        // Step
        if (e.ty <= ch - 1) {
          e.ty += 1;
        }
      }
    }
    else if (e.ty > 0) {
      // Falling
      if (e.canFall && !chunk.data[e.ty - 1][e.tx][e.tz]) {
        e.ty -= 1;
        if (e.ty === 0) e.ty = ch - 1;
      }
    }
    if (chunk.data[e.ty][e.tx][e.tz] !== 0) {
      // Stuck in wall
      if (e.ty < ch - 1) {
        e.ty += 1;
      }
    }
    position.y = e.ty;// + (e.h / 2);
    if (!e.canFall) {
      position.y += Math.sin(Date.now() / 200) * 0.2;
    }

    return chunk;
  }
}

module.exports = Physics;
