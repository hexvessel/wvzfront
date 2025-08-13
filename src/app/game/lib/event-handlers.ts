import * as THREE from 'three';
import type { Game } from '../game';
import { getNormalizedMouse, getPlaneIntersection } from './mouse-utils';
import { CheckIfClickIsInsideGrid, createSelectionBox, removeSelectionBox, SelectWizardsInBox } from './selectionbox-utils';
import { Wizard } from '../agents/wizard';
import { Zombie } from '../agents/zombie';
import { Fireball } from '../components/spells/fireball';

export function createMouseHandlers(game: Game) {
  const { camera, scene, canvas, raycaster, mouse, plane, planeNormal, intersectionPoint, selectedWizards } = game;

  const onMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    getNormalizedMouse(event, canvas, mouse);

    if (event.button === 0) {
      game.isSelecting = true;
      getPlaneIntersection(camera, raycaster, mouse, intersectionPoint);
      game.selectStart.copy(intersectionPoint);
      game.selectEnd.copy(intersectionPoint);
    } else if (event.button === 2) {
      if(!CheckIfClickIsInsideGrid(raycaster, mouse, camera, scene)) return;
      getPlaneIntersection(camera, raycaster, mouse, intersectionPoint);
      selectedWizards.forEach((wizard: Wizard) => {
        wizard.movementTarget = intersectionPoint.clone().sub(new THREE.Vector3(-0.5,0,-0.5));
      })
    } else if (event.button === 1){
      getPlaneIntersection(camera, raycaster, mouse, intersectionPoint);
      const fireballTarget = intersectionPoint.clone();
      let wiz: Wizard | null = null;
      const wizards = game.selectedWizards;
      for(let i = 0; i < wizards.length; i++)
      {
        if(wizards[i].manaComponent.mana > 0){
          wiz = wizards[i];
        }
      }
      if(wiz){
        const origin = new THREE.Vector3();
        wiz.getWorldPosition(origin);

        const direction = new THREE.Vector3();
        direction.subVectors(fireballTarget, origin).normalize();

        const texture = new THREE.TextureLoader().load('assets/fireball.png')
        const fireball = new Fireball(texture, direction, origin, fireballTarget )
        scene.add(fireball)
        game.allSpells.push(fireball)
        wiz.useMana()
      } 
    }

  };

  const onMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    if (!game.isSelecting) return;

    getNormalizedMouse(event, canvas, mouse);
    getPlaneIntersection(camera, raycaster, mouse, intersectionPoint);
    game.selectEnd.copy(intersectionPoint);

    removeSelectionBox(game.selectionBox, scene);

    const boxWidth = Math.abs(game.selectEnd.x - game.selectStart.x);
    const boxDepth = Math.abs(game.selectEnd.z - game.selectStart.z);
    if (boxWidth >= 0.01 && boxDepth >= 0.01) {
      game.selectionBox = createSelectionBox(game.selectStart, game.selectEnd);
      scene.add(game.selectionBox);
    }
  };

  const onMouseUp = (event: MouseEvent) => {
    if (event.button === 0) {
      game.isSelecting = false;
      removeSelectionBox(game.selectionBox, scene);
      game.selectionBox = null;
      SelectWizardsInBox(game.selectedWizards, game.selectStart, game.selectEnd, scene, raycaster, mouse, camera);
    }
  };

  return { onMouseDown, onMouseMove, onMouseUp };
}
