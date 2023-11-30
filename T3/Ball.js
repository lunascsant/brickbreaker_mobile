import * as THREE from  'three';
export class Ball{

    DirectionVet =  new THREE.Vector3(0,0,0);

    speed = 5.0;
    radius =8.0;

    Body = null
    collider = null;

    // constructor(){

    //     this.Body = new THREE.Mesh(new THREE.CircleGeometry(this.radius,64),
    //     new THREE.MeshPhongMaterial({color:'rgb(0,0,0)',shininess:"250",specular:"rgb(255,255,255)"}))
    //     this.collider = new THREE.Box3();
    //     this.Body.geometry.computeBoundingBox();
    //     this.collider.copy(this.Body.geometry.boundingBox);

    // }
    constructor() {
        this.Body = new THREE.Mesh(new THREE.SphereGeometry(8),
        new THREE.MeshPhongMaterial({ color: 'rgb(64, 64, 64)' , shininess:"200"}));
        this.Body.castShadow = true;

        // this.collider = new THREE.Box3();
        // this.Body.geometry.computeBoundingBox();
        // this.collider.copy(this.Body.geometry.boundingBox);
        // Create a bounding sphere manually
        this.collider = new THREE.Sphere();
        this.collider.center = this.Body.position; // Set the center of the sphere
        this.collider.radius = 8; // Set the radius of the sphere
    
        // Compute the bounding sphere manually
        this.Body.geometry.computeBoundingSphere();
        this.collider.radius = this.Body.geometry.boundingSphere.radius;
    }

    getGameObject(){

        return this.Body;
    }

    setPosition(newPosition){
        this.Body.position.set(newPosition.x,newPosition.y,newPosition.z);
    }

    getPosition(){
        return this.Body.position;
    }

    setDirection(newDir){
        this.DirectionVet = newDir;
    }   
    getDirection(){
        return this.DirectionVet;
    }

    getRadius(){
        return this.radius;
    }
    getSpeed(){
        return this.speed;
    }
    setSpeed(newSpeed){
        this.speed= newSpeed
    }

    increaseSpeed(amount){
        this.speed += amount;
    }
    resetSpeed(){
        this.speed = 5.0;
    }

    //Return the collider
    getCollider(){
        return this.collider;

    }
    //NO lerp movment 4 the ball -> we need full control
    update(){

        this.Body.position.set(this.Body.position.x + this.DirectionVet.x*this.speed,this.Body.position.y + this.DirectionVet.y*this.speed,0)
        // this.collider.setFromObject(this.Body,true);
        this.collider.center.copy(this.Body.position);
        //Update position based on vel and ir
    }
}