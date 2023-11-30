import * as THREE from  'three';
export class Block{

    Body = null;
    isCollisionActive = false;

    collider = null;

    margin = null;
    
    collided = false;

    BLOCK_H = 15;
    BLOCK_W = 33;


    health = 1; //number of hits to destroy

    isInvincible = false;

    

    //Talvez seja legal passar a cor como parametro do construtor
    constructor(color = null,health = 1){
        //console.log("Block created ")
        let colorRand = color;
        if(color == null){
        let r = Math.floor(Math.random()*256);
        let g = Math.floor(Math.random()*256);
        let b = Math.floor(Math.random()*256);
            

        let colorRand = 'rgb(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ')';
        
        }
        //console.log("Block Color = " + colorRand);
        this.Body = new THREE.Mesh(new THREE.BoxGeometry(this.BLOCK_W,this.BLOCK_H,30),
        new THREE.MeshLambertMaterial({ color:colorRand}));


        this.Body.castShadow = true;

        this.collider = new THREE.Box3();

        this.Body.geometry.computeBoundingBox();
        this.collider.copy(this.Body.geometry.boundingBox);
        this.health = health;

        this.margin = new THREE.BoxHelper(this.Body, 0x00000)
    }

    getHeight(){
        return this.BLOCK_H;
    }
    getWidth(){
        return this.BLOCK_W;
    }

    setColor(color){
            this.Body.material.color = new THREE.Color(color);
    }
    getColor(){
        return this.color;
    }

    decreaseHealth(){
        if(this.health != 0){
            this.health--;
        }
    }

    getHealth(){
        return this.health;
    }
    setInvincibility(inv){
        this.isInvincible = inv;
    }

    getInvincibility(){
        return this.isInvincible;
    }

    setHealth(newHealth){
        this.health = newHealth;
    }

    //returns the collidr;
    getCollider(){

        


        return this.collider;
    }

    updateCollider(){
        this.collider.setFromObject(this.Body,true);

    }
    changeMaterial(newMaterial){
        this.material= newMaterial
    }

    isCollided(){
        return this.collided;
    }

    getGameObject(){

        return this.Body;
    }

    getObjectMargin(){
        return this.margin;
    }

    setPosition(newPosition){

        this.Body.position.set(newPosition.x,newPosition.y,newPosition.z);
    }

    getPosition(){
        return this.Body.position;
    }

}