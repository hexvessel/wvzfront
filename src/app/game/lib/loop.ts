import * as THREE from 'three';
import { Wizard } from "../agents/wizard";
import { Game } from "../game";
import { GridPosition, gridToWorld, moveSquare, worldToGrid } from "./utils";
import { Zombie } from '../agents/zombie';




function findClosestUnoccupiedSquare(currentPosition: THREE.Vector3,lastOccupiedSquare: { gx: number, gz: number}, grid: GridPosition[][]) {
    const { gx, gz } = worldToGrid(currentPosition.x, currentPosition.z);
    const lastSquare = worldToGrid(lastOccupiedSquare.gx, lastOccupiedSquare.gz );
    const directions = [
        { x:  0, z: -1 },
        { x:  1, z: -1 },
        { x:  1, z:  0 },
        { x:  1, z:  1 },
        { x:  0, z:  1 },
        { x: -1, z:  1 },
        { x: -1, z:  0 },
        { x: -1, z: -1 },
    ];

    const xMax = grid.length;
    const zMax = grid[0].length;

    let closestDistance = Infinity;
    let freeSquare = null;

    for (let dir of directions) {
        const nx = gx + dir.x;
        const nz = gz + dir.z;

        if (nx < 0 || nx >= xMax || nz < 0 || nz >= zMax) continue;

        if (grid[nx][nz].occupant === null) {
            const dist = Math.abs(gx - nx) + Math.abs(gz - nz);
            if (dist < closestDistance) {
                closestDistance = dist;
                freeSquare = { gx: nx, gz: nz };
            }
        }
    }

    return lastSquare.gx !== freeSquare?.gx && lastSquare.gz !== freeSquare?.gz ? freeSquare : null;
}

export function loop(game: Game) {
    // WIZARDS
    for(let i = game.allWizards.length - 1; i >= 0; i-- ){
        const wizard = game.allWizards[i];
        if(wizard.healthComponent.hitpoints < 1) {
            game.scene.remove(wizard);
            game.allWizards.splice(i, 1);
            game.selectedWizards.splice(i, 1);
        }
    }
    game.allWizards.forEach((wizard: Wizard) => {
        if (!wizard.movementTarget) return;
        
        
        const newPositionWorld = moveSquare(wizard.movementTarget, wizard);
        let { gx: newGX, gz: newGZ } = worldToGrid(newPositionWorld.x, newPositionWorld.z);
        const { gx: oldGX, gz: oldGZ } = worldToGrid(wizard.position.x, wizard.position.z);
        
        // If target cell is occupied, find nearest empty one
        if (game.grid[newGX][newGZ].occupant !== null) {
            const emptySquare = findClosestUnoccupiedSquare(wizard.position, wizard.lastOccupiedSquare, game.grid);
            if (emptySquare) {
                newGX = emptySquare.gx;
                newGZ = emptySquare.gz;
            }
        }

        if (wizard.position.equals(newPositionWorld)) {
            wizard.movementTarget = null;
        } else if (game.grid[newGX][newGZ].occupant === null) {
            game.grid[newGX][newGZ].occupant = wizard;
            game.grid[oldGX][oldGZ].occupant = null;
            wizard.lastOccupiedSquare.gx = wizard.position.x;
            wizard.lastOccupiedSquare.gz = wizard.position.z;
            wizard.position.copy(gridToWorld(newGX, newGZ));
        }
        
    });

    if (game.zombieSpeed > 0) return;

    // ZOMBIES
    game.allZombies.forEach((zombie: Zombie) => {
        let closestDistance = Infinity;
        let closestWizard: Wizard | null = null;

        for (const curr of game.allWizards) {
            const dx = Math.abs(zombie.position.x - curr.position.x);
            const dz = Math.abs(zombie.position.z - curr.position.z);
            const manhattan = dx + dz;
            if (manhattan < closestDistance) {
                closestDistance = manhattan;
                closestWizard = curr;
            }
        }
        if(closestDistance < 2) closestWizard?.damage(1);

        zombie.target = closestWizard;
        if (!closestWizard) return;

        const newPositionWorld = moveSquare(closestWizard.position, zombie);
        let { gx: newGX, gz: newGZ } = worldToGrid(newPositionWorld.x, newPositionWorld.z);
        const { gx: oldGX, gz: oldGZ } = worldToGrid(zombie.position.x, zombie.position.z);

        if (game.grid[newGX][newGZ].occupant !== null) {
            const emptySquare = findClosestUnoccupiedSquare(zombie.position, zombie.lastOccupiedSquare, game.grid);
            if (emptySquare) {
                newGX = emptySquare.gx;
                newGZ = emptySquare.gz;
            }
        }

        if (zombie.position.equals(newPositionWorld)) {
            zombie.movementTarget = null;
        } else if (game.grid[newGX][newGZ].occupant === null) {
            game.grid[newGX][newGZ].occupant = zombie;
            game.grid[oldGX][oldGZ].occupant = null;
            zombie.lastOccupiedSquare.gx = zombie.position.x;
            zombie.lastOccupiedSquare.gz = zombie.position.z;
            zombie.position.copy(gridToWorld(newGX, newGZ));
        }
    });

}
