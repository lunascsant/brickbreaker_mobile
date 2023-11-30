//Imports from THREE and Utils

import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {DragControls} from '../build/jsm/controls/DragControls.js'
import {initRenderer, initCamera,initDefaultBasicLight,setDefaultMaterial,SecondaryBox,InfoBox,onWindowResize,createGroundPlaneXZ} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js'
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';

import { normalizeAndRescale,fixPosition,getMaxSize } from './Utils.js';     




//Imports of our classes, dont know why it needs the whole dir


import * as Player from "./Player.js";
import * as Block from './Block.js'
import * as Ball from './Ball.js';  
import * as PowerUp from './PowerUp.js';
import { Scene, Vector3 } from '../build/three.module.js';

import { calculateReflection, checkFaceCollision, switchFullScreen, calculateCollisionPoint, isCircleAABBCollision} from './Utils.js';
import { color } from '../libs/util/dat.gui.module.js';

import { Buttons } from "../libs/other/buttons.js";

//botões e novo raycaster

var dragOn = true;

var buttons = new Buttons(onButtonDown, onButtonUp);

var pressedA = false;              

const materialTransparente = new THREE.MeshBasicMaterial({
    color: 0x00ff00, // green color
    opacity: 0.5, // set opacity to 50%
  });


var dragGuide = new THREE.Mesh(
    new THREE.BoxGeometry(50, 50, 50), 
    new THREE.MeshPhongMaterial({ opacity: 0.1, transparent: true }));

dragGuide.castShadow = true;
dragGuide.receiveShadow = true;

dragGuide.position.set(0,-250,0);

var objects = [];

//Input defs

const pointer = new THREE.Vector2();


//Global defs
let scene = null 
let renderer = null;
let camera = null;
let material = null;
let light = null;
var keyboard = new KeyboardState();

let leftWall = null;
let rightWall = null;
let topWall = null;


//Game defs

const WORLD_H = 800;
const WORLD_W = 400;
let ball = null;
let powerupball = null;
let player = null;
var dragControl = null;
let pShip = null;
let BG = null;
let bg4Ray= null;
let retPosition;
let ballPos;
let blockCol = null;
let ballCol = null;
let colPoint= null;
let blockNormal = null;
let powerupballCol = null;
let powerupballPos = null;
let blockNormal4Power= null;
let newColPoint= null;
let levelPoints= [66, 112];
let GAME_BOARD = Array(16).fill().map(() => Array(16).fill(null)); //EU não sei o que é isso
let DELTA_TIME = 1/60; //Assuming the game runs at 60fps at all times 

let POWER_UP_OBJECT = null;

//Game control defs

let isPlayerWithBall = true
let isFullScreen = false
let simulationOn = true
let win = 0;

let POINTS = 0;

let powerupcount = 0;
let powerupcooldown = false;
let poweruptimer = 0;
let CURRENT_LEVEL = 0;

let GAME_BOARD_HEIGHT = 8;
let GAME_BOARD_WIDTH = 8;

let SPEED_CLOCK = 0;
let SPEED_CLOCKPU=0;



function onWindowResizeOrt() {
  
  console.log("Resizing Camera");
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  let targetWidth = newWidth;
  let targetHeight = targetWidth / 0.5;

  if (targetHeight > newHeight) {
    targetHeight = newHeight;
    targetWidth = targetHeight * 0.5;
  }

  const offsetX = (newWidth - targetWidth) / 2;
  const offsetY = (newHeight - targetHeight) / 2;

  camera.left = -WORLD_W / 2;
  camera.right = WORLD_W / 2;
  camera.top = WORLD_H / 2;
  camera.bottom = -WORLD_H / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
  renderer.setViewport(offsetX, offsetY, targetWidth, targetHeight);
  
}

//Calcula pos do mouse na tela em cords normalizada
function onPointerMove( event ) {


	pointer.x =  (event.clientX / window.innerWidth) * 2 - 1;

  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;


}

function setupRenderAndCamera(){
    //  Camera Init
    let viewWidth =  WORLD_W;
    let viewHeight = WORLD_H;
    
    camera = new THREE.PerspectiveCamera(50,0.5,1,2000)


    window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
    // window.addEventListener( 'resize', onWindowResizeOrt, false );
    window.addEventListener('pointermove',onPointerMove);
    
  
    camera.position.set(0, -650, 650);
    camera.lookAt(new THREE.Vector3(0,0,0));


  //Renderer Init
    renderer = initMyRenderer();    // Init a basic renderer, alreaday has a shadowmap
    renderer.setSize(viewWidth,viewHeight);

  //onWindowResizeOrt(); //SO por precaução
  onWindowResize(camera, renderer)



  const textureLoader = new THREE.TextureLoader();
  let textureEquirec = textureLoader.load( 'Textures/skybox2.jpg');
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping; // Reflection as default
	textureEquirec.encoding = THREE.sRGBEncoding;
  scene.background = textureEquirec;

}
function initMyRenderer(){
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(new THREE.Color("rgb(0, 0, 0)"));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.getElementById("webgl-output").appendChild(renderer.domElement);
  return renderer
}


function setupMaterialAndLights(){


  material = setDefaultMaterial(); // create a basic material


  //Ambient light

  let ambientLight = new THREE.AmbientLight("rgb(255,255,255)",0.2);


  let dirLight =  new THREE.DirectionalLight("rgb(235,235,235)",0.6);


  dirLight.shadow.camera.near = -1000;
  dirLight.shadow.camera.far = 1000;
  dirLight.shadow.camera.left = -1000;
  dirLight.shadow.camera.right = 1000;
  dirLight.shadow.camera.bottom = -1000;
  dirLight.shadow.camera.top = 1000;
  dirLight.castShadow = true;
  dirLight.position.set(100,200,500);


  dirLight.target.position.set(-100,-100,0);
  dirLight.target.updateMatrixWorld()

  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.mapSize.width = 2048;

  //scene.add(intersectionSphere);
  scene.add(ambientLight);
  scene.add(dirLight);

  //light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
}




function setupScene(){
  scene = new THREE.Scene();
  
  
}


function createBoard(level =  1){

  //Mexer aqui para criar tabuleiros foda, ajustar valores max de 8 e 16 baseado no tamanho do bloco

  //Cores legais

  if(level == 1){

  let cores = [];



  //let grey = "rgb(128,128,128)" //grey;
  //cores.push(grey);


  cores.push("rgb(30,255,30)"); //green
  //cores.push("rgb(255,255,100)"); //yellow
  cores.push("rgb(255,8,127)"); //pink
  cores.push("rgb(255,180,0)") //organge;
  cores.push("rgb(30,30,255)") //blue
  cores.push("rgb(255,30,30)"); //red

  let grey = "rgb(160,160,160)" //grey;
  cores.push(grey);
  let GAME_BOARD_HEIGHT = 6;
  let GAME_BOARD_WIDTH = 11;

  var textureLoader = new THREE.TextureLoader();
  var rust = textureLoader.load('Textures/rustTex.jpeg');
  

  for(let i = 0;i<GAME_BOARD_HEIGHT;i++){
    for(let j = 0;j<GAME_BOARD_WIDTH;j++){

      let colorIndex =  i;

      GAME_BOARD[i][j] = new Block.Block(cores[colorIndex]);
      GAME_BOARD[i][j].setPosition(new THREE.Vector3((20+j*GAME_BOARD[i][j].getWidth()) -(WORLD_W/2)  + (GAME_BOARD[i][j].getWidth())/2 ,
      (i*15) + (WORLD_H/2) - (15*(GAME_BOARD[i][j].getHeight()/2)), //cuidado com esse offset estranho aqui
      0));
      scene.add(GAME_BOARD[i][j].getGameObject());
      scene.add(GAME_BOARD[i][j].getObjectMargin());
      GAME_BOARD[i][j].updateCollider();
      
      GAME_BOARD[i][j].getObjectMargin().update();

      if(i == 5){
        GAME_BOARD[i][j].setHealth(2);
        GAME_BOARD[i][j].setColor("rgb(255,255,255)");
        GAME_BOARD[i][j].getGameObject().material.map = rust;

      }

    }
  }
}
  

  

  if(level == 2){
    console.log("Level 2");


      let cores = [];
    
    
    
      //let grey = "rgb(128,128,128)" //grey;
      //cores.push(grey);
    
    
      cores.push("rgb(30,255,30)"); //green
      //cores.push("rgb(255,255,100)"); //yellow
      cores.push("rgb(255,30,255)"); //pink
      cores.push("rgb(255,180,0)") //organge;
      cores.push("rgb(30,30,255)") //blue
      cores.push("rgb(255,30,30)"); //red
    
      let grey = "rgb(160,160,160)" //grey;
      cores.push(grey);
      let GAME_BOARD_HEIGHT = 14;
      let GAME_BOARD_WIDTH = 9;
      
    
      for(let i = 0;i<GAME_BOARD_HEIGHT;i++){
        for(let j = 0;j<GAME_BOARD_WIDTH;j++){
          if(j == 4){
            continue;
          }
    
          GAME_BOARD[i][j] = new Block.Block("rgb(160,160,160)");
          GAME_BOARD[i][j].setPosition(new THREE.Vector3(( 70 + -GAME_BOARD[i][j].getWidth()/2+ j*GAME_BOARD[i][j].getWidth()) -(WORLD_W/2)  + (GAME_BOARD[i][j].getWidth())/2 ,
          -120 + (i*15) + (WORLD_H/2) - (15*(GAME_BOARD[i][j].getHeight()/2)), //cuidado com esse offset estranho aqui
          0));
          scene.add(GAME_BOARD[i][j].getGameObject());
          scene.add(GAME_BOARD[i][j].getObjectMargin());
          GAME_BOARD[i][j].updateCollider();
          GAME_BOARD[i][j].getObjectMargin().update();
          GAME_BOARD[i][j].setHealth(2);

          //Setting up the crazy color pallet and block health

          //green diag
          if(i == j-1 || i == j+3 || i == j+7  || i == j+11 || i == j-5){
            GAME_BOARD[i][j].setColor(cores[0]);
            GAME_BOARD[i][j].setHealth(1);
          }
          //red diag
          if(i == j+1 || i == j + 9 || i == j-7){
            GAME_BOARD[i][j].setColor(cores[4]);
            GAME_BOARD[i][j].setHealth(1);
          }

          //pink then orange diag
          if(j == i || j == i-8 || j == i-4 || j == i+8){
            if(j%2 == 0){
            GAME_BOARD[i][j].setColor(cores[1]);
            GAME_BOARD[i][j].setHealth(1);
            }
            else{
              GAME_BOARD[i][j].setColor(cores[2]);
              GAME_BOARD[i][j].setHealth(1);


            }
          }

          //orange than pink diag
          if(j == i-2 || j == i-6 || j==i-2|| j == i+2 || j == i-10 || j == i+6){
            if(j%2 == 0){
            GAME_BOARD[i][j].setColor(cores[2]);
            GAME_BOARD[i][j].setHealth(1);
            }
            else{
              GAME_BOARD[i][j].setColor(cores[1]);
              GAME_BOARD[i][j].setHealth(1);


            }
          }

          //blue than orange diag
          if(j == i-4 || j == i-12 || j == i+4){
            if(j%2 == 0){
            GAME_BOARD[i][j].setColor(cores[3]);
            GAME_BOARD[i][j].setHealth(1);
            }
            else{
              GAME_BOARD[i][j].setColor(cores[2]);
              GAME_BOARD[i][j].setHealth(1);


            }
          }
    
        }
      }
  }
  if(level == 3){
    let GAME_BOARD_HEIGHT = 11; 
    let GAME_BOARD_WIDTH = 12;
    let cores = [];
    cores.push("rgb(30,255,30)"); //green
    //cores.push("rgb(255,255,100)"); //yellow
    cores.push("rgb(30,30,255)") //blue
    cores.push("rgb(255,30,30)"); //red
  
    let grey = "rgb(160,160,160)" //grey;
    //level 3
    var c = 0;
      for(let i = 0;i<GAME_BOARD_HEIGHT;i++){
        for(let j = 0;j<GAME_BOARD_WIDTH;j+=2){
          GAME_BOARD[i][j] = new Block.Block(cores[0]);
          GAME_BOARD[i][j].setPosition(new THREE.Vector3(( 70 + -GAME_BOARD[i][j].getWidth()/2+ j*GAME_BOARD[i][j].getWidth()) -(WORLD_W/2)  + (GAME_BOARD[i][j].getWidth())/2 - 40 ,
          -120 + (i*15) + (WORLD_H/2) - (15*(GAME_BOARD[i][j].getHeight()/2)), //cuidado com esse offset estranho aqui
          0));
          scene.add(GAME_BOARD[i][j].getGameObject());
          scene.add(GAME_BOARD[i][j].getObjectMargin());
          GAME_BOARD[i][j].updateCollider();
          GAME_BOARD[i][j].getObjectMargin().update();



        }

      }

      //Invencible blocks and colors irregulars

      for(var i = 0;i<GAME_BOARD_HEIGHT;i++){
        GAME_BOARD[i][0].setColor(cores[1]);
        GAME_BOARD[i][2].setColor(cores[2]);
        GAME_BOARD[i][4].setColor(cores[0]);

        GAME_BOARD[i][6].setColor(cores[0]);
        GAME_BOARD[i][8].setColor(cores[2]);
        GAME_BOARD[i][10].setColor(cores[1]);
        

      }

      //GAME_BOARD[7][0].setColor("rgb(230,120,0)")
      //GAME_BOARD[7][2].setColor("rgb(230,120,0)")
      //GAME_BOARD[7][4].setColor("rgb(230,120,0)")
      //GAME_BOARD[7][6].setColor("rgb(230,120,0)")
      //GAME_BOARD[7][8].setColor("rgb(230,120,0)")
      GAME_BOARD[7][8].setColor("rgb(230,230,0)")
      GAME_BOARD[7][8].setInvincibility(true);

      GAME_BOARD[7][6].setColor("rgb(230,230,0)")
      GAME_BOARD[7][6].setInvincibility(true);

      GAME_BOARD[7][4].setColor("rgb(230,230,0)")
      GAME_BOARD[7][4].setInvincibility(true);


      GAME_BOARD[7][2].setColor("rgb(230,230,0)")
      GAME_BOARD[7][2].setInvincibility(true);



      GAME_BOARD[1][2].setColor("rgb(230,230,0)")
      GAME_BOARD[1][2].setInvincibility(true);
      GAME_BOARD[1][8].setColor("rgb(230,230,0)")
      GAME_BOARD[1][8].setInvincibility(true);
      GAME_BOARD[1][6].setColor("rgb(230,230,0)")
      GAME_BOARD[1][6].setInvincibility(true);
      GAME_BOARD[1][4].setColor("rgb(230,230,0)")
      GAME_BOARD[1][4].setInvincibility(true);

      GAME_BOARD[1][0].setColor("rgb(230,120,0)")
      GAME_BOARD[1][0].setInvincibility(false);
      GAME_BOARD[1][10].setColor("rgb(230,120,0)")
      GAME_BOARD[1][10].setInvincibility(false);




      var i = 7;
      for(var j = 3;j<9;j+=2){
        GAME_BOARD[i][j] = new Block.Block("rgb(230,120,0)");

        GAME_BOARD[i][j].setPosition(new THREE.Vector3(( 70 + -GAME_BOARD[i][j].getWidth()/2+ j*GAME_BOARD[i][j].getWidth()) -(WORLD_W/2)  + (GAME_BOARD[i][j].getWidth())/2 - 40 ,
        -120 + (i*15) + (WORLD_H/2) - (15*(GAME_BOARD[i][j].getHeight()/2)), //cuidado com esse offset estranho aqui
        0));

        scene.add(GAME_BOARD[i][j].getGameObject());
        scene.add(GAME_BOARD[i][j].getObjectMargin());
        GAME_BOARD[i][j].setInvincibility(false);
        GAME_BOARD[i][j].updateCollider();
        GAME_BOARD[i][j].getObjectMargin().update();

        

      }




    
  }
}

function createBackGround(){

  const planeWidth = 10000;
  const planeHeight = 10000;
  const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  BG = new THREE.Mesh(planeGeometry, setDefaultMaterial('rgb(255,255,255)'));
  BG.material.transparent = true;
  BG.material.opacity = 0;
  
  BG.position.set(0,0,-10)
  BG.receiveShadow = true;
  // Position the plane at the XY plane
  
  scene.add(BG);
  const specialMat= setDefaultMaterial('rgb(60,60,180)');
  specialMat.transparent=true;
  specialMat.opacity=0
  bg4Ray= new THREE.Mesh(planeGeometry, specialMat);
  bg4Ray.position.set(0,0,0);
  scene.add(bg4Ray);

  //Walls

  const boxGeo = new THREE.BoxGeometry(200,1000,100);
  leftWall = new THREE.Mesh(boxGeo, setDefaultMaterial('rgb(255,255,255)'));
  rightWall = new THREE.Mesh(boxGeo, setDefaultMaterial('rgb(255,255,255)'));

  topWall = new THREE.Mesh(boxGeo, setDefaultMaterial('rgb(255,255,255)'));
  topWall.rotateZ(3.1415/2);
  topWall.position.set(0,500,0);

  leftWall.position.set(-310,0,0);
  rightWall.position.set(310,0,0);

  scene.add(leftWall);
  scene.add(rightWall);
scene.add(topWall);






}

function checkCollisionBoard(){
  win = 0; 

  for(let i = 0;i<16;i++){
    for(let j = 0;j<16;j++){
      if(GAME_BOARD[i][j] == null){
        continue;
      }
      if(GAME_BOARD[i][j].collided){
        win = win + 1
        continue;
      }
      try{
      blockCol = GAME_BOARD[i][j].getCollider();
      ballCol = ball.getCollider();
      colPoint= null;
      blockNormal = null; //new THREE.Vector3(0,-1,0); // need to change if it is a side collision or down ou, you know
      retPosition = GAME_BOARD[i][j].getPosition();
      ballPos= ball.getPosition();
      if(ballCol.intersectsBox(blockCol)){
        GAME_BOARD[i][j].setHealth((GAME_BOARD[i][j].getHealth() - 1 ))

        colPoint= calculateCollisionPoint(ballPos, retPosition);
        
        blockNormal= checkFaceCollision(colPoint, retPosition, ball.getDirection());
        if(blockNormal!=null){
          ball.setDirection(calculateReflection(ball.getDirection(),blockNormal))
        }
        
        
        if(GAME_BOARD[i][j].getHealth()==0){
          scene.remove(GAME_BOARD[i][j].getGameObject());
          scene.remove(GAME_BOARD[i][j].getObjectMargin());
          if(powerupball == null && POWER_UP_OBJECT == null){
            powerupcount++;
          }
          //Power up creating
          if(powerupcount >= 10 && powerupball == null && POWER_UP_OBJECT == null){

          console.log("Power Up Instantiated");
          POWER_UP_OBJECT = new PowerUp.PowerUpObject(GAME_BOARD[i][j].getPosition());
          scene.add(POWER_UP_OBJECT.getGameObject());
          powerupcount = 0;

          }
          GAME_BOARD[i][j].collided = true;
          GAME_BOARD[i][j] = null;
          POINTS++;
          return;

        }
        
        else{

          //BLOCK COLOR LOGIC
          
          GAME_BOARD[i][j].setColor("rgb(80,80,80)");
          GAME_BOARD[i][j].getGameObject().material.map = null; 

        }
      }
      if(powerupball != null){
        powerupballCol = powerupball.getCollider();
        powerupballPos = powerupball.getPosition();
        blockNormal4Power= null;
        if(powerupballCol.intersectsBox(blockCol)){
          GAME_BOARD[i][j].setHealth((GAME_BOARD[i][j].getHealth() - 1 ))

          //start collision
          newColPoint= calculateCollisionPoint(powerupballPos, retPosition)
          blockNormal4Power= checkFaceCollision(newColPoint, retPosition, powerupball.getDirection());
          powerupball.setDirection(calculateReflection(powerupball.getDirection(), blockNormal4Power))
          //end
        
        if(GAME_BOARD[i][j].getHealth()==0){

          scene.remove(GAME_BOARD[i][j].getGameObject());
          scene.remove(GAME_BOARD[i][j].getObjectMargin());
          if(powerupball == null && POWER_UP_OBJECT == null){
          powerupcount++;
          }
          if(powerupcount >= 10 && powerupball == null && POWER_UP_OBJECT == null){

            console.log("Power Up Instantiated");
            POWER_UP_OBJECT = new PowerUp.PowerUpObject(GAME_BOARD[i][j].getPosition());
            scene.add(POWER_UP_OBJECT.getGameObject());
            powerupcount = 0;
  
  
            }
          GAME_BOARD[i][j].collided = true;
          GAME_BOARD[i][j] = null;
          POINTS++;
          return;


        }
        
        
        else{
          //BLOCK COLOR LOGIC
          
          GAME_BOARD[i][j].setColor("rgb(80,80,80)");
          GAME_BOARD[i][j].getGameObject().material.map = null; 

        }
        }
      }
      }
    catch{
      //catched
      return;
    }
    }




    
  }

  // se todos estiverem colididos
  if(POINTS >= 66 && CURRENT_LEVEL==0) {
    simulationOn = false; //set flag to next level
    CURRENT_LEVEL+=1;
    resetGame();
    createBoard(2);
    simulationOn = true;
    POINTS = 0;
  }
  if(POINTS >= 112 && CURRENT_LEVEL==1){
    simulationOn = false; //set flag to next level
    //CURRENT_LEVEL+=1;
    resetGame();
    createBoard(2);
    simulationOn = true;
    POINTS = 0;
  }

  if(POINTS >= 52 && CURRENT_LEVEL==3){
    simulationOn = false; //set flag to next level
    //CURRENT_LEVEL+=1;
    resetGame();
    createBoard(1);
    simulationOn = true;
    POINTS = 0;
  }


  
}

function powerUp(){


  
  powerupball = new Ball.Ball();
  powerupball.setPosition(ball.getPosition());
  powerupball.setDirection(new Vector3(-ball.getDirection().x,ball.getDirection().y));
  scene.add(powerupball.getGameObject());


  

}

function checkCollisionPlayer(){

  //console.log("Ppos = " + player.getPosition().x + "," + player.getPosition().y)
  //console.log("Bpos = " + ball.getPosition().x + "," + ball.getPosition().y)

  //No need to check if going down or on top of player and if is on the side
  //Little trig trick here to avoid detection when passed on the offset
  if( !(ball.getDirection().y >= 0 || ball.getPosition().y < player.getPosition().y + player.getRadius()+ player.getOffset()) ){
    
  

  //Distance

  const playerX = player.getPosition().x;
  const playerY = player.getPosition().y;
  const ballX = ball.getPosition().x;
  const ballY = ball.getPosition().y;

  const dx = ballX - playerX;
  const dy = ballY - playerY;
  
  const distance = Math.sqrt(dx * dx + dy * dy);



  let radiusSum = player.getRadius() + ball.getRadius();
 
  if(radiusSum >= distance){
    //console.log("Collision Detected");

    let normal = new Vector3(dx,dy);
    normal.normalize();


        //Minimum angle of reflection here
    ball.setDirection(calculateReflection(ball.getDirection(),normal));

    let minimumVet = ball.getDirection();


        if(ball.getDirection().y < 0.5){
          minimumVet.y = 0.5;
          if(ball.getDirection().x < (-Math.sqrt(3)/2)){
            minimumVet.x =  -(Math.sqrt(3)/2);
          }

          if(ball.getDirection().x > Math.sqrt(3)/2){
            minimumVet.x =  Math.sqrt(3)/2;


        };
      }
      minimumVet.normalize();
      ball.setDirection(minimumVet);


  }
}

  if(powerupball != null){



    if(powerupball.getDirection().y >= 0 || powerupball.getPosition().y < player.getPosition().y + player.getRadius()+ player.getOffset() ){
      return;
    }
  
    //Distance
  
    const playerX = player.getPosition().x;
    const playerY = player.getPosition().y;
    const ballX = powerupball.getPosition().x;
    const ballY = powerupball.getPosition().y;
  
    const dx = ballX - playerX;
    const dy = ballY - playerY;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
  
  
  
    let radiusSum = player.getRadius() + powerupball.getRadius();
   
    if(radiusSum >= distance){
      console.log("Collision Detected");
  
      let normal = new Vector3(dx,dy);
      normal.normalize();
  
  
          //Minimum angle of reflection here
      powerupball.setDirection(calculateReflection(powerupball.getDirection(),normal));
  
      let minimumVet = powerupball.getDirection();
  
  
          if(powerupball.getDirection().y < 0.5){
            minimumVet.y = 0.5;
            if(powerupball.getDirection().x < (-Math.sqrt(3)/2)){
              minimumVet.x =  -(Math.sqrt(3)/2);
            }
  
            if(powerupball.getDirection().x > Math.sqrt(3)/2){
              minimumVet.x =  Math.sqrt(3)/2;
  
  
          };
        }
        minimumVet.normalize();
        powerupball.setDirection(minimumVet);
  
  
    }
  }

  //same thing but for extra ball





}

function checkCollisionWall(){

  if(ball.getPosition().x > (WORLD_W/2)){
    ball.setDirection(calculateReflection(ball.getDirection(),new THREE.Vector3(-1,0,0)));
    
  }
  if(ball.getPosition().x < -(WORLD_W/2)){
    ball.setDirection(calculateReflection(ball.getDirection(),new THREE.Vector3(1,0,0)));
  }

  if(ball.getPosition().y > (WORLD_H/2)){
    ball.setDirection(calculateReflection(ball.getDirection(),new THREE.Vector3(0,-1,0)));

  }

  if(powerupball!= null){

    if(powerupball.getPosition().x > (WORLD_W/2)){
      powerupball.setDirection(calculateReflection(powerupball.getDirection(),new THREE.Vector3(-1,0,0)));
      
    }
    if(powerupball.getPosition().x < -(WORLD_W/2)){
      powerupball.setDirection(calculateReflection(powerupball.getDirection(),new THREE.Vector3(1,0,0)));
    }
  
    if(powerupball.getPosition().y > (WORLD_H/2)){
      powerupball.setDirection(calculateReflection(powerupball.getDirection(),new THREE.Vector3(0,-1,0)));
  
    }




  }
}

// Check defeat
function checkDefeat(){
  if(ball.getPosition().y < -500) {
    let ballPos = new THREE.Vector3(player.getPosition().x,player.getPosition().y+player.getRadius() + 5,0);
    ball.setDirection(new Vector3(0,0,0))
    ball.setPosition(ballPos);
    isPlayerWithBall = true;

    //Resting speed
    ball.resetSpeed();
  }
  if(powerupball!=null)
    if(powerupball.getPosition().y < -500) {
      powerupball = null;
      SPEED_CLOCKPU=0;

      
    }
}

let releaseBall = () => {
  if(simulationOn) {
      if(isPlayerWithBall) {
        // esse if é necessário porque se não sempre que apertar space a bola sobe
        isPlayerWithBall = false;
        ball.setDirection(new THREE.Vector3(0,1,0));
        console.log("Ball is Released");
      }
  }
}


function checkKeyboard(){
  if ( keyboard.down("space") ){
    simulationOn = !simulationOn;
  }

  if(simulationOn) {
    if ( keyboard.down("R") ){
      resetGame();
      createBoard(CURRENT_LEVEL%2 + 1)
    }
  
    if ( keyboard.down("enter") ){
      isFullScreen = !isFullScreen
      switchFullScreen(isFullScreen);
    }
  }

  if(keyboard.down("G")){
    resetGame();
    CURRENT_LEVEL = (CURRENT_LEVEL%3) + 1;
    createBoard((CURRENT_LEVEL%3 )+ 1);
  }
  
}

function resetGame(){

  for(let i = 0;i<16;i++){
    for(let j = 0;j<16;j++){
      if(GAME_BOARD[i][j] != null){
      scene.remove(GAME_BOARD[i][j].getGameObject())
      scene.remove(GAME_BOARD[i][j].getObjectMargin())
      GAME_BOARD[i][j]=null;
      }
      
    }
  }

  //resetting player
  player.setPosition(new THREE.Vector3(0,-250,0));
  ball.setPosition(new THREE.Vector3(0,-0,0));
  isPlayerWithBall = true;

  if(powerupball != null){

    scene.remove(powerupball.getGameObject());
  } 

  powerupcount = 0;
  poweruptimer = 0;
  
  powerupball = null;
  powerupcooldown = false;

  SPEED_CLOCKPU=0;

  POINTS = 0;
  
  ball.resetSpeed();
  win = 0;
  



}

  

//Init function
function initGame(){


  setupScene();
  setupRenderAndCamera();
  setupMaterialAndLights();


  //Init of player
  player = new Player.Player()
  scene.add(player.getGameObject());
  

  //creating ship


  var loader = new GLTFLoader( );
  loader.load("./Models/ship.gltf", function ( gltf ) {
     var obj = gltf.scene;
     obj.visible = true;
     obj.name = "ship";

     

     obj.traverse( function (child)
     {
     if( child.isMesh ) child.castShadow = true;
     if( child.material ) child.material.side = THREE.DoubleSide; 
     });

     var obj = normalizeAndRescale(obj, 150);
     var obj = fixPosition(obj);
     obj.rotateY(THREE.MathUtils.degToRad(270));

     obj.position.set(0,0,0);
     pShip = obj;
     scene.add(pShip);
     console.log(obj);
     
   
  });









  player.setPosition(new THREE.Vector3(0,-250,0));




  //Init board

  createBoard(1);
  createBackGround();

  //Init ball
  ball = new Ball.Ball();
  ball.setPosition(new THREE.Vector3(0,-0,0));
  scene.add(ball.getGameObject());

  win = 0;

}


function checkCollisionPowerUp(){

  if(POWER_UP_OBJECT == null){
    return;
  }
  if(POWER_UP_OBJECT.getPosition().y <= -500){
    scene.remove(POWER_UP_OBJECT.getGameObject());
    POWER_UP_OBJECT = null;
    return;
  }

  const playerX = player.getPosition().x;
  const playerY = player.getPosition().y;
  const ballX = POWER_UP_OBJECT.getPosition().x;
  const ballY = POWER_UP_OBJECT.getPosition().y;

  const dx = ballX - playerX;
  const dy = ballY - playerY;
  
  const distance = Math.sqrt(dx * dx + dy * dy);



  let radiusSum = player.getRadius() + POWER_UP_OBJECT.getRadius();
 
  if(radiusSum >= distance){
    scene.remove(POWER_UP_OBJECT.getGameObject());
    //create ball
    POWER_UP_OBJECT = null;
    powerUp();
    console.log("Power Up Aquired");    
  
  }


  



}

function updateShipPosition(){

  if(pShip != null){

  pShip.position.set(player.getPosition().x,player.getPosition().y-90,player.getPosition().z);
  }
}

function onButtonDown(event) {
    switch(event.target.id)
    {
      case "A":
        pressedA = true;
       break;
      case "B":
        pressedB = true;
      break;    
      case "full":
        buttons.setFullScreen();
      break;    
    }
  }
  
  function onButtonUp(event) {
    pressedA = false;
  }
  
  function executeIfKeyPressed()
  {
    if(pressedA)
    {
      releaseBall();
    }
  }

//Game loop
function gameLoop(){
  var positionDragGuide = new THREE.Vector3();
  positionDragGuide.setFromMatrixPosition( dragGuide.matrixWorld );

  dragGuide.position.setZ(0);
  dragGuide.position.setY(-250);

  keyboard.update();
  let pTarget = new THREE.Vector3(positionDragGuide.x,0,0);

  executeIfKeyPressed();

  if(win < 64) checkKeyboard();

  if (dragOn) {
    dragControl.activate(); //    
  }
  else {
    dragControl.deactivate();            
  }

  //Process Game logic (Check colision/Reflection,Check death and collision culling,move player to target position)
  

  if(isPlayerWithBall){

    //Little offset so it should right above the player
    let ballPos = new THREE.Vector3(player.getPosition().x,player.getPosition().y+player.getRadius() + 5+8,0);

    ball.setPosition(ballPos);
    ball.resetSpeed();
    SPEED_CLOCK = 0;
  }

  if(simulationOn) {
    player.move(pTarget);
    player.update();

    //Ball speed increase
    //SPEED_CLOCK+= DELTA_TIME;
    if(SPEED_CLOCK <=16){
      if(ball.getSpeed()>=10){
        ball.setSpeed(10);
      }
      //console.log("Increasing ball speed...");
      //console.log(ball.getSpeed())
      ball.increaseSpeed(0.0055);
      SPEED_CLOCK+= DELTA_TIME;
    }
    
    if(powerupball!=null){
      if(SPEED_CLOCKPU <=16){
        if(powerupball.getSpeed()>=10){
          powerupball.setSpeed(10);
        }
        //console.log("Increasing ball speed...");
        console.log(powerupball.getSpeed())
        powerupball.increaseSpeed(0.0055);
        SPEED_CLOCKPU+= DELTA_TIME;
      }
    }

    ball.update();

    //Checking for double ball powerup, define the lenght on the powerup function
    if(powerupball != null){
      //console.log("Updating power up");
      powerupball.update();
      //poweruptimer -= DELTA_TIME;
    }

    if(POWER_UP_OBJECT != null){
      POWER_UP_OBJECT.update();
    }

    //Cooldown for new powerup


  }
  
  checkCollisionBoard();
  checkCollisionWall();
  checkCollisionPlayer();
  checkCollisionPowerUp();
  checkDefeat();

  updateShipPosition();



  console.log("Score: " + POINTS);



  //= = = = RAY CAST TEST RAY CAST TEST = = = =



  //Render (Self explanatory)
  requestAnimationFrame(gameLoop);
  renderer.render(scene,camera);
}




initGame();

// CREATE DRAG OBJECT
scene.add(dragGuide);
objects.push(dragGuide);
dragControl = new DragControls(objects, camera, renderer.domElement);

gameLoop();


