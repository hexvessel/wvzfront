import * as THREE from 'three'
import { Spell } from './spell';


export class Fireball extends Spell {
    private direction: THREE.Vector3;
    TARGET: THREE.Vector3;
    MAX_RANGE = 10;
    distanceTraveled = 0;
    SPEED = 1;

    constructor(texture: THREE.Texture, dir: THREE.Vector3, startPosition: THREE.Vector3, target: THREE.Vector3){
        super(texture);
        this.position.copy(startPosition)
        this.direction = dir; 
        this.TARGET = target;
    }
    public Travel(){
        this.position.add(this.direction.clone().multiplyScalar(this.SPEED));
        this.distanceTraveled += this.SPEED;
    }

}