// build the collision index
let collisions: string[] = [];

// left top walls, coner points (0, 0), (0, 176), (176, 368), (368, 0)
for (let i = 0; i < 368; i += 4) {
  for (let j = 0; j < 176; j += 4) {
    collisions.push([i, j].toString());
  }
}

//right top walls, coner points (468, 0), (468, 112), (640, 112), (640, 0)
for (let i = 468; i < 640; i += 4) {
  for (let j = 0; j < 112; j += 4) {
    collisions.push([i, j].toString());
  }
}

// between that two wall, (368, 0), (368, 32), (468, 32), (468, 0)
for (let i = 368; i < 468; i += 4) {
  for (let j = 0; j < 32; j += 4) {
    collisions.push([i, j].toString());
  }
}

// right walls, coner points (612, 112), (612, 336), (640, 336), (640, 112)
for (let i = 612; i < 640; i += 4) {
  for (let j = 112; j < 336; j += 4) {
    collisions.push([i, j].toString());
  }
}

// left walls, coner points (0, 176), (0, 384), (16, 384), (16, 176)
for (let i = 0; i < 16; i += 4) {
  for (let j = 176; j < 384; j += 4) {
    collisions.push([i, j].toString());
  }
}

// right mid room, coner points (468, 208), (468, 304), (612, 304), (612, 208)
for (let i = 468; i < 612; i += 4) {
  for (let j = 208; j < 304; j += 4) {
    collisions.push([i, j].toString());
  }
}

// right mid room part 2, coner points (468, 304), (468, 336), (544, 336), (544, 304)
for (let i = 468; i < 544; i += 4) {
  for (let j = 304; j < 336; j += 4) {
    collisions.push([i, j].toString());
  }
}

// tree near washroom, coner points (436, 112), (436, 176), (496, 176), (496, 112)
for (let i = 436; i < 496; i += 4) {
  for (let j = 112; j < 176; j += 4) {
    collisions.push([i, j].toString());
  }
}

//washroom left wall, coner points (496, 144), (496, 176), (544, 176), (544, 144)
for (let i = 496; i < 544; i += 4) {
  for (let j = 144; j < 176; j += 4) {
    collisions.push([i, j].toString());
  }
}

//washroom right wall, coner points (664, 144), (564, 176), (612, 176), (612, 144)
for (let i = 564; i < 612; i += 4) {
  for (let j = 144; j < 176; j += 4) {
    collisions.push([i, j].toString());
  }
}

// seller machine, coner points (368, 112), (368, 144), (416, 144), (416, 112)
for (let i = 368; i < 416; i += 4) {
  for (let j = 112; j < 144; j += 4) {
    collisions.push([i, j].toString());
  }
}

// coffee machine, coner points (436, 72), (439, 96), (464, 96), (464, 72)
for (let i = 436; i < 464; i += 4) {
  for (let j = 72; j < 96; j += 4) {
    collisions.push([i, j].toString());
  }
}

// left table coffee machine, coner points (368, 64), (368, 92), (416, 92), (416, 64)
for (let i = 368; i < 416; i += 4) {
  for (let j = 64; j < 92; j += 4) {
    collisions.push([i, j].toString());
  }
}

export const COLLISIONS = collisions;
