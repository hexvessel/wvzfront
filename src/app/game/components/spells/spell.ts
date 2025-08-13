import * as THREE from 'three'

export class Spell extends THREE.Group {
    public sprite: THREE.Sprite;
    constructor(texture: THREE.Texture){
        super();
        this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: texture}));
        this.add(this.sprite);
    }
}