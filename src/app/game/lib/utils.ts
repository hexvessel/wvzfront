import * as THREE from 'three';
import { Agent } from '../agents/agent';

export interface GridPosition {
  gx: number; // grid x index
  gz: number; // grid z index
  x: number;  // world x
  z: number;  // world z
  occupant: THREE.Object3D | null;
}

export function moveSquare(target: THREE.Vector3, agent: THREE.Group): THREE.Vector3 {
  const currentX = Math.round(agent.position.x);
  const currentZ = Math.round(agent.position.z);
  const targetX = Math.round(target.x);
  const targetZ = Math.round(target.z);

  if (currentX === targetX && currentZ === targetZ) {
    return agent.position.clone(); // Already at target
  }

  let nextX = currentX;
  let nextZ = currentZ;

  // Step toward target
  if (currentX < targetX) nextX++;
  else if (currentX > targetX) nextX--;
  if (currentZ < targetZ) nextZ++;
  else if (currentZ > targetZ) nextZ--;

  return new THREE.Vector3(nextX - 0.5, agent.position.y, nextZ - 0.5);
}

export function generateGrid(
  scene: THREE.Scene,
  gridSize: number,
  squareSize: number,
  grid: GridPosition[][]
) {
// const black = new THREE.MeshPhongMaterial({ color: 0x000000 });
// const white = new THREE.MeshPhongMaterial({ color: 0xffffff });
  
  const terrain = [
    new THREE.SpriteMaterial({map:new THREE.TextureLoader().load('assets/terrain/terrain1.png')}),
    new THREE.SpriteMaterial({map:new THREE.TextureLoader().load('assets/terrain/terrain2.png')}),
    new THREE.SpriteMaterial({map:new THREE.TextureLoader().load('assets/terrain/terrain3.png')}),
    new THREE.SpriteMaterial({map:new THREE.TextureLoader().load('assets/terrain/terrain4.png')}),
    new THREE.SpriteMaterial({map:new THREE.TextureLoader().load('assets/terrain/terrain5.png')}),
  ]
  for (let x = 0; x < gridSize * 2; x++) {
    const gridRow: GridPosition[] = [];
    for (let z = 0; z < gridSize; z++) {
     // const material = (x + z) % 2 === 0 ? black : white;
     // const geometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
     // const square = new THREE.Mesh(geometry, material);
      const material = terrain[Math.round((Math.random() * 4))]
      const square = new THREE.Sprite(material);
      square.material.color.setHex(0x555555)
      square.position.set(
        x * squareSize + squareSize / 2,
        0,
        z * squareSize + squareSize / 2
      );
      square.userData = { type: 'grid_square' };
      scene.add(square);
      gridRow.push({
        gx: x,
        gz: z,
        x: square.position.x,
        z: square.position.z,
        occupant: null
      });
    }
    grid.push(gridRow);
  }
}
export function worldToGrid(x: number, z: number, squareSize: number = 1) {
    return {
        gx: Math.floor(x / squareSize),
        gz: Math.floor(z / squareSize)
    };
}

export function gridToWorld(gx: number, gz: number, squareSize: number = 1) {
    return new THREE.Vector3(
        gx * squareSize + squareSize / 2,
        0.1,
        gz * squareSize + squareSize / 2
    );
}