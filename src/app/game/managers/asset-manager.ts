import * as THREE from 'three'

export class AssetManager {
    textureLoader: THREE.TextureLoader;

    constructor(){
        this.textureLoader = new THREE.TextureLoader()
    }
    public LoadTexture(path: string){
        return this.textureLoader.load(path);
    }
}