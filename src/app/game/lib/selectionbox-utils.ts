import * as THREE from 'three';
import { Wizard } from '../agents/wizard';

/** Remove selection box from scene and dispose resources */
export function removeSelectionBox(box: THREE.LineSegments | null, scene: THREE.Scene) {
  if (!box) return;
  if (Array.isArray(box.material)) {
    box.material.forEach(mat => mat.dispose());
  } else {
    box.material.dispose();
  }
  box.geometry.dispose();
  scene.remove(box);
}

/** Create selection box geometry (only edges, no diagonals) */
export function createSelectionBox(
  start: THREE.Vector3,
  end: THREE.Vector3
): THREE.LineSegments {
  const boxWidth = Math.abs(end.x - start.x);
  const boxDepth = Math.abs(end.z - start.z);
  const geometry = new THREE.BoxGeometry(boxWidth, 0.01, boxDepth);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({
    color: 0x00ff00,
    depthTest: false,
    transparent: true,
    opacity: 0.5
  });
  const box = new THREE.LineSegments(edges, material);
  box.position.set((start.x + end.x) / 2, 0.01, (start.z + end.z) / 2);
  return box;
}

export function SelectWizardsInBox(
  selectedWizards: Wizard[],
  selectStart: THREE.Vector3,
  selectEnd: THREE.Vector3,
  scene: THREE.Scene,
  raycaster: THREE.Raycaster,
  mouse: THREE.Vector2,
  camera: THREE.Camera){
  
  selectedWizards.forEach((wiz) => wiz.DeSelect());
  selectedWizards.length = 0;

  if(IsSelectionBoxTooSmall(selectStart, selectEnd)){
    SelectSingleAgent(raycaster, mouse, camera, scene, selectedWizards)
  }

  const xMin = Math.min(selectStart.x, selectEnd.x);
  const xMax = Math.max(selectStart.x, selectEnd.x);
  const zMin = Math.min(selectStart.z, selectEnd.z);
  const zMax = Math.max(selectStart.z, selectEnd.z);
  
  scene.children.forEach(child => {
    if(
      child instanceof Wizard &&
      child.position.x > xMin &&
      child.position.x < xMax &&
      child.position.z > zMin &&
      child.position.z < zMax 
    ){
      child.Select();
      selectedWizards.push(child);
    }
  })
}

function IsSelectionBoxTooSmall(
  selectStart: THREE.Vector3,
  selectEnd: THREE.Vector3){
  const dx = Math.abs(selectStart.x - selectEnd.x);
  const dz = Math.abs(selectStart.z - selectEnd.z);
  return dx < 0.05 && dz < 0.05;
}

function SelectSingleAgent(
  raycaster: THREE.Raycaster,
  mouse: THREE.Vector2,
  camera: THREE.Camera,
  scene: THREE.Scene,
  selectedWizards: Wizard[]){
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  for(const intersect of intersects){
    const agent = findWizardInIntersects(intersect.object)
    if(agent)
    {
      agent.Select();
      selectedWizards.push(agent);
      break;
    }
  }
}
function findWizardInIntersects(obj: THREE.Object3D): Wizard | null {
  while (obj) {
    if (obj instanceof Wizard) return obj;
    obj = obj.parent!;
  }
  return null;
}

export function CheckIfClickIsInsideGrid(raycaster: THREE.Raycaster, mouse: THREE.Vector2, camera: THREE.Camera, scene: THREE.Scene){
  raycaster.setFromCamera(mouse, camera); 
  return raycaster.intersectObjects(scene.children).length > 0;
}