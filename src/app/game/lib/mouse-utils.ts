import * as THREE from 'three';

/** Convert mouse pixel coords to normalized device coordinates (-1..1) */
export function getNormalizedMouse(event: MouseEvent, canvas: HTMLCanvasElement, out: THREE.Vector2) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  out.x = (event.clientX / width) * 2 - 1;
  out.y = -(event.clientY / height) * 2 + 1;
}

/**
 * Casts a ray from the camera through the mouse and finds
 * the intersection point with a horizontal plane at y=0.
 * 
 * @param camera - the scene's camera
 * @param raycaster - the THREE.Raycaster instance
 * @param mouse - normalized mouse coords (-1..1)
 * @param outVector3 - where to store the intersection point
 * @returns true if hit found, false if not
 */
export function getPlaneIntersection(
  camera: THREE.Camera,
  raycaster: THREE.Raycaster,
  mouse: THREE.Vector2,
  outVector3: THREE.Vector3
): boolean {
  // Horizontal plane at y=0
  const planeNormal = new THREE.Vector3(0, 1, 0);
  const plane = new THREE.Plane(planeNormal, 0);

  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.ray.intersectPlane(plane, outVector3);

  return hit !== null;
}