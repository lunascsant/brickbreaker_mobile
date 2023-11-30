import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)





import { CSG } from '../libs/other/CSGMesh.js'        
import { Vector3 } from '../build/three.module.js';



//Classe usada no jogo
export class Player{

    parent = null; //Gameobject, the position is the center of the CSG object that was cut

    radius = 90;
    offset = -20;
    //normals = [];
    //blocks = [];

    //colliders = [];


    debug = null;

    targetPos = new THREE.Vector3(0,-250,0); //Position to move to





    constructor(){
        console.log("Player Constructor triggered");
        this.parent = new THREE.Object3D();
        this.parent.position.set(0,-300,0);

        //Create CSG 

        //define player radius
        let CylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(this.radius,this.radius,40))
        CylinderMesh.material = new THREE.MeshLambertMaterial({color:'rgb(255,50,50)'})
        CylinderMesh.rotateX(3.1415/2);
        CylinderMesh.position.set(0,0,0) //center of new player//use



        let CutMesh = new THREE.Mesh(new THREE.BoxGeometry(this.radius*2,this.radius*2,50))
        CutMesh.material = new THREE.MeshLambertMaterial({color:'rgb(50,250,50)'})
        CutMesh.position.set(0,this.offset,0);

        CylinderMesh.matrixAutoUpdate = false;
        CylinderMesh.updateMatrix();

        CutMesh.matrixAutoUpdate = false;
        CutMesh.updateMatrix();
        

        let cyCSG = CSG.fromMesh(CylinderMesh);
        let cutCSG = CSG.fromMesh(CutMesh);
        let result = cyCSG.subtract(cutCSG);
        let newMesh = CSG.toMesh(result,new THREE.Matrix4())
        newMesh.material = new THREE.MeshLambertMaterial({color:'rgb(255,50,50)'});
        this.debug = newMesh;


        this.parent = newMesh;





        


        /*

        for(let i = 0;i<5;i++){
            this.blocks.push(new THREE.Mesh(new THREE.BoxGeometry(20,20,40),
            new THREE.MeshLambertMaterial({ color:'rgb(255,50,50)'})));
            this.parent.add(this.blocks[i]);
            this.blocks[i].position.set(-40+(i*20),0,0);
            this.blocks[i].castShadow = true

            //Normals init

            this.normals.push(new THREE.Vector3(0,1,0));
            this.colliders.push(new THREE.Box3());
            this.blocks[i].geometry.computeBoundingBox();
            this.colliders[i].copy(this.blocks[i].geometry.boundingBox);
        
        }

        this.normals[0] = new THREE.Vector3(-0.866025,0.5,0); //30 grau
        this.normals[1] = new THREE.Vector3(-1,1,0); //45 grau

        this.normals[3] = new THREE.Vector3(1,1,0);
        this.normals[4] = new THREE.Vector3(0.866025,0.5,0);

        this.normals[0].normalize();
        this.normals[1].normalize();
        this.normals[3].normalize();
        this.normals[4].normalize();
        */

        
        

        

    }


    PlayerInit(){

    console.log("Player has been initialized");
}
    getGameObject(){
        return this.parent;
    }

    getDebug(){
        return this.debug;
    }

    getOffset(){
        return this.offset;
    }

    //Snaps the player to position
    setPosition(newPosition){
        this.parent.position.set(newPosition.x,newPosition.y,newPosition.z);
    }

    getPosition(){
        return this.parent.position;
    }

    //sets the targetPosition as newPosition to player go
    move(newPosition){

        this.targetPos.x = newPosition.x;
    }


    //Returns all of the box colliders
    getColliders(){

        return this.colliders;
    }
    getNormals(){
        return this.normals;
    }

    getRadius(){
        return this.radius;
    }

    update(){
        this.targetPos.y = -250 - this.radius;

        this.parent.position.set(this.targetPos.x,this.targetPos.y,0);
        if(this.parent.position.x>150){
            this.parent.position.set(150, -250 - this.radius, 0);
        }
        if(this.parent.position.x<-150){
            this.parent.position.set(-150, -250 - this.radius, 0);
        }
        //Update colliders for each box
        /*
        for(let i = 0;i<5;i++){
            this.colliders[i].setFromObject(this.blocks[i],true);
        }
        */



        return;
    }



}




// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();



  
let player = new Player();
scene.add(player.getGameObject());
player.setPosition(new Vector3(0,-90,0)) // player position é o centro do cilindro
render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}