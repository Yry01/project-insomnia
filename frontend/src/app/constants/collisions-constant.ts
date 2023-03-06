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

// coffee machine, coner points (436, 68), (439, 96), (480, 96), (480, 68)
for (let i = 436; i < 480; i += 4) {
  for (let j = 68; j < 96; j += 4) {
    collisions.push([i, j].toString());
  }
}

// left table coffee machine, coner points (368, 64), (368, 92), (416, 92), (416, 64)
for (let i = 368; i < 416; i += 4) {
  for (let j = 64; j < 92; j += 4) {
    collisions.push([i, j].toString());
  }
}

// table before coffee machine, coner points (404, 32), (404, 48), (464, 48), (464, 32)
for (let i = 404; i < 464; i += 4) {
  for (let j = 32; j < 48; j += 4) {
    collisions.push([i, j].toString());
  }
}

// trunk, coner points (452, 32), (452, 64), (480, 64), (480, 32)
for (let i = 452; i < 480; i += 4) {
  for (let j = 32; j < 64; j += 4) {
    collisions.push([i, j].toString());
  }
}

// dining room food place and wall, coner points (16, 176), (16, 208), (208, 208), (208, 176)
for (let i = 16; i < 208; i += 4) {
  for (let j = 176; j < 208; j += 4) {
    collisions.push([i, j].toString());
  }
}

//dinning room right wall, coner points (164, 208), (164, 272), (208, 272), (208, 208)
for (let i = 164; i < 208; i += 4) {
  for (let j = 208; j < 272; j += 4) {
    collisions.push([i, j].toString());
  }
}

// dinning room left bot wall, coner points (16, 272), (16, 304), (80, 304), (80, 272)
for (let i = 16; i < 80; i += 4) {
  for (let j = 272; j < 304; j += 4) {
    collisions.push([i, j].toString());
  }
}

// dinning room right bot wall, coner points (100, 272), (100, 304), (304, 304), (304, 272)
for (let i = 100; i < 304; i += 4) {
  for (let j = 272; j < 304; j += 4) {
    collisions.push([i, j].toString());
  }
}

// dinning room table 1, coner points (24, 224), (24, 256), (48, 256), (48, 224)
for (let i = 24; i < 48; i += 4) {
  for (let j = 224; j < 256; j += 4) {
    collisions.push([i, j].toString());
  }
}

// dinning room table 2, coner points (132, 224), (132, 256), (160, 256), (160, 224)
for (let i = 132; i < 160; i += 4) {
  for (let j = 224; j < 256; j += 4) {
    collisions.push([i, j].toString());
  }
}

export const COLLISIONS = collisions;
