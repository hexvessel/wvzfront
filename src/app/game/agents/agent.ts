import * as THREE from 'three';
import { GridPosition } from '../lib/utils';
import { Health } from '../components/health';


export class Agent extends THREE.Group {
    public sprite: THREE.Sprite;
    public target: Agent | null = null;
    public movementTarget: THREE.Vector3 | null = null;
    public lastOccupiedSquare: { gx: number, gz: number};
    public healthComponent: Health;

    constructor(texture: THREE.Texture, hp: number){
        super()
        this.healthComponent = new Health(hp);
        const material = new THREE.SpriteMaterial({map: texture, });
        this.sprite = new THREE.Sprite(material);
        this.lastOccupiedSquare = { gx: this.position.x, gz: this.position.z };
        this.add(this.sprite);
    }

}