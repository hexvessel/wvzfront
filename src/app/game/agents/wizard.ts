import * as THREE from 'three'
import { Agent } from './agent'
import { degToRad } from 'three/src/math/MathUtils.js';
import { Mana } from '../components/mana';

export class Wizard extends Agent {
    protected ringMesh: THREE.Mesh;
    protected healthBar: THREE.Mesh;
    protected manaBar: THREE.Mesh;
    public manaComponent: Mana;

    constructor(texture: THREE.Texture, hp: number){
        super(texture, hp);
        this.userData = {type: "wizard"}
        this.manaComponent = new Mana(3);
        const geometryRing = new THREE.RingGeometry(0.53, 0.5, 32);
        const materialRing = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this.ringMesh = new THREE.Mesh(geometryRing, materialRing);
        this.ringMesh.rotateX(degToRad(90));
        this.ringMesh.visible = false;
        this.add(this.ringMesh);
        const geometryHealth = new THREE.BoxGeometry(1,0.2,0);
        const materialHealth = new THREE.MeshBasicMaterial({color: 0x00ff00})
        this.healthBar = new THREE.Mesh(geometryHealth, materialHealth);
        this.healthBar.rotateX(degToRad(90))
        this.add(this.healthBar)
        this.healthBar.position.set(0,0,-0.6)
        const geometryMana = new THREE.BoxGeometry(1,0.2,0);
        const materialMana = new THREE.MeshBasicMaterial({color: 0x0000ff});
        this.manaBar = new THREE.Mesh(geometryMana, materialMana);
        this.manaBar.rotateX(degToRad(90));
        this.manaBar.position.set(0,0,-0.9);
        this.add(this.manaBar)
    }
    Select()
    {
        this.ringMesh.visible = true;
    }
    DeSelect(){
        this.ringMesh.visible = false;
    }
    public damage(damageAmount: number){
        this.healthComponent.damage(damageAmount);
        this.healthBar.scale.set(this.healthComponent.hitpoints / this.healthComponent.MAX_HP, 1, 1);
    }
    public heal(healAmount: number){
        this.healthComponent.heal(healAmount);
    }
    public useMana(){
        this.manaComponent.UseMana();
        this.manaBar.scale.set(this.manaComponent.mana / this.manaComponent.MAX_MANA, 1, 1)
    }
    public ReplenishMana(){
        this.manaComponent.ReplenishMana();
        this.manaBar.scale.set(this.manaComponent.mana / this.manaComponent.MAX_MANA, 1, 1)
    }
}