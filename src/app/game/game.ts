import { Component, ElementRef, ViewChild, AfterViewInit, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { generateGrid, GridPosition } from './lib/utils';
import { createMouseHandlers } from './lib/event-handlers';
import { Wizard } from './agents/wizard';
import { loop } from './lib/loop';
import { Zombie } from './agents/zombie';
import { Fireball } from './components/spells/fireball';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { degToRad } from 'three/src/math/MathUtils.js';

@Component({
  selector: 'app-game',
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements AfterViewInit, OnDestroy {
  @ViewChild('canvasRef', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // BASE THREE STUFF
  public scene!: THREE.Scene;
  public camera!: THREE.OrthographicCamera;
  public canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private animationId = 0;

  // RAYCASTER STUFF
  public raycaster = new THREE.Raycaster();
  public mouse = new THREE.Vector2();
  public plane = new THREE.Plane();
  public planeNormal = new THREE.Vector3();
  public intersectionPoint = new THREE.Vector3();

  // SELECTION BOX STUFF
  public isSelecting = false;
  public selectStart = new THREE.Vector3();
  public selectEnd = new THREE.Vector3();
  public selectionBox: THREE.LineSegments | null = null;

  // ALL AGENT LISTS
  public allWizards: Wizard[] = [];
  public selectedWizards: Wizard[] = []
  public allZombies: Zombie[] = [];
  public allSpells: Fireball[] = [];

  // MAP STUFF
  public grid: GridPosition[][] = [];
  private gridSize = 32;
  private squareSize = 1;

  // TICK STUFF
  private clock = new THREE.Clock();
  private accumulator = 0;
  private fixedDelta = 1 / 10;
  private manaRegen = 0;
  public zombieSpeed = 0;

  // Stats
  private score = 0;
  private scoreMesh!: THREE.Mesh;
  private font!: Font;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.initThree();

    const { onMouseDown, onMouseMove, onMouseUp } = createMouseHandlers(this);
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    this.canvas.addEventListener('mousedown', onMouseDown);
    this.canvas.addEventListener('mousemove', onMouseMove);
    this.canvas.addEventListener('mouseup', onMouseUp);

    this.ngZone.runOutsideAngular(() => this.animate());
  }
  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
  
  private initThree(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.scene = new THREE.Scene();
 
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(width, height);

    // CAMERA STUFF    
    
    /*
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const camCenter = (this.gridSize * this.squareSize);
    const camHeight = 25;
    this.camera.position.set(camCenter, camHeight, camCenter);
    this.camera.lookAt(camCenter, 0, camCenter);
    */

    //const cameraHeight = Math.max(this.gridSize * this.squareSize, 20); 

    const gridCenterX = (this.gridSize * 2 * this.squareSize) / 2 - this.squareSize / 2;
    const gridCenterZ = (this.gridSize * this.squareSize) / 2 - this.squareSize / 2;

    const aspect = width / height;
    const viewSize = this.gridSize* 1.1 * this.squareSize / 2;
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect,
      viewSize * aspect,
      viewSize,
      -viewSize,
      0.1,
      1000
    );
    this.camera.position.set(gridCenterX, 150, gridCenterZ);
    this.camera.lookAt(gridCenterX, 0, gridCenterZ);
   
    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    this.scene.add(light);

    // Generate map 
    generateGrid(this.scene, this.gridSize, this.squareSize, this.grid);
    
    // score text
    const loader = new FontLoader();
    loader.load('fonts/StarJedi_Special_Edition_Regular.json', (font) => {
      this.font = font;
      const geometry = new TextGeometry('Score: 0', {
          font: font,
          size: 1,
          depth: 1,
          curveSegments: 10,
          bevelEnabled: false,
          bevelOffset: 0,
          bevelSegments: 1,
          bevelSize: 0.3,
          bevelThickness: 1
      });
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.scoreMesh = new THREE.Mesh(geometry, material);
      this.scoreMesh.rotateX(degToRad(-90))
      this.scene.add(this.scoreMesh);
  });
  

  

    // Test agents
    const texture = new THREE.TextureLoader().load('wvzfront/assets/wizinviz.png');
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    //const zombieTexture = new THREE.TextureLoader().load('/assets/zom.png')


    // Place 7 wizards starting at grid coords (10,10) .. (16,16)
    for (let i = 0; i < 7; i++) {
      const gx = i + 25;
      const gz = 16;
      if (gx < this.gridSize && gz < this.gridSize) {
        const cell = this.grid[gx][gz];
        const newWiz = new Wizard(texture, 3);
        newWiz.position.set(cell.x, 0.1, cell.z);    // use the grid cell's world position
        cell.occupant = newWiz;                      // mark the grid occupant
        newWiz.userData = { type: 'wizard'}
        this.scene.add(newWiz);
        this.allWizards.push(newWiz);
      }
    }

    // Place 10 zombies at grid coords (0,0)..(9,9)
   // for (let i = 0; i < 20; i++) {
   //   const gx = i;
   //   const gz = i;
   //   if (gx < this.gridSize && gz < this.gridSize) {
   //     const cell = this.grid[gx][0];
   //     const zombie = new Zombie(zombieTexture);
   //     zombie.position.set(cell.x, 0.1, cell.z);
   //     cell.occupant = zombie;
   //     this.scene.add(zombie);
   //     this.allZombies.push(zombie);
   //   }
   // }

  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    const deltaTime = this.clock.getDelta();
    this.accumulator += deltaTime;
    //this.zombieSpeed = this.zombieSpeed > 2 ? 0 : this.zombieSpeed + 1;
    //this.manaRegen = this.manaRegen > 5 ? 0 : this.manaRegen + 1;
    

    while (this.accumulator >= this.fixedDelta) {
      this.zombieSpeed = this.zombieSpeed > 2 ? 0 : this.zombieSpeed + 1;
      this.manaRegen = this.manaRegen > 100 ? 0 : this.manaRegen + 1;

      if(this.manaRegen < 1){
        this.allWizards.forEach(wiz => {
          wiz.ReplenishMana()
        })
      }

      for(let i = this.allSpells.length - 1; i >= 0; i--){
        const spell = this.allSpells[i];
        spell.Travel();
        const spellPosition = spell.position.clone();
        spellPosition.setY(0);
        if(spell.distanceTraveled > spell.MAX_RANGE || spellPosition.equals(spell.TARGET)){
          const fireballPosition = spell.TARGET.clone();
          this.scene.remove(spell);
          this.allSpells.splice(i, 1);

          const radius = 4;
          for (const row of this.grid) {
             for (const cell of row) {
                 if (!cell.occupant) continue;

                 if (cell.occupant instanceof Zombie) {
                     const dx = cell.x - fireballPosition.x;
                     const dz = cell.z - fireballPosition.z;

                     if (Math.abs(dx) <= radius && Math.abs(dz) <= radius) {
                         this.scene.remove(cell.occupant);

                         // Also remove from zombie list to avoid logic still targeting it
                         this.allZombies = this.allZombies.filter(z => z !== cell.occupant);

                         cell.occupant = null;
                         this.score++;
                         this.updateScoreDisplay()
                     }
                 }
             }
          }
        }
      }
      const rng = Math.random();
      if(rng < 0.1)
        {
          const randomSide = [
            this.grid[Math.floor(Math.random()*this.grid.length)][0],
            this.grid[Math.floor(Math.random()*this.grid.length)][this.gridSize-1],
            this.grid[0][Math.floor(Math.random() * this.gridSize)],
            this.grid[this.grid.length-1][Math.floor(Math.random() * this.gridSize)],
          ]
          const randomIndex = Math.floor(Math.random()* 4)
          const cell = randomSide[randomIndex] 
          if (!cell.occupant) {
            const zombieTexture = new THREE.TextureLoader().load('wvzfront/assets/zom.png')
            const zombie = new Zombie(zombieTexture, 10);
            zombie.position.set(cell.x, 0.1, cell.z);
            cell.occupant = zombie;
            zombie.sprite.material.color.setHex(Math.random()* 15_000_000)
            this.scene.add(zombie);
            this.allZombies.push(zombie);
          }
        }
      this.update();
      this.accumulator -= this.fixedDelta;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private update(): void {
    loop(this)
  }
  private updateScoreDisplay() {
    if (this.scoreMesh) {
        this.scoreMesh.geometry.dispose();
        this.scoreMesh.geometry = new TextGeometry(`Score: ${this.score}`, {
          font: this.font,
          size: 1,
          depth: 1,
          curveSegments: 10,
          bevelEnabled: false,
          bevelOffset: 0,
          bevelSegments: 1,
          bevelSize: 0.3,
          bevelThickness: 1
        });
    }
}
}
