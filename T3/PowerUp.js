import * as THREE from  'three';
export class PowerUpObject{


    radius =8.0;

    Body = null
    position = null;
    color = 0
    side = 5;

    // constructor(){

    //     this.Body = new THREE.Mesh(new THREE.CircleGeometry(this.radius,64),
    //     new THREE.MeshPhongMaterial({color:'rgb(0,0,0)',shininess:"250",specular:"rgb(255,255,255)"}))
    //     this.collider = new THREE.Box3();
    //     this.Body.geometry.computeBoundingBox();
    //     this.collider.copy(this.Body.geometry.boundingBox);

    // }
    constructor(position) {
        this.Body = new THREE.Mesh(new THREE.SphereGeometry(8),new THREE.MeshPhongMaterial({ color: 'rgb(0, 0, 0)' , shininess:"200"}));
        // this.collider = new THREE.Box3();
        // this.Body.geometry.computeBoundingBox();
        // this.collider.copy(this.Body.geometry.boundingBox);
        // Create a bounding sphere manually
        this.position = position;
        this.Body.position.set( position.x,position.y,position.z);



    }
    getPosition(){
        return this.position;
    }
    getRadius(){
        return this.radius;
    }

    getGameObject(){

        return this.Body;
    }

    //NO lerp movment 4 the ball -> we need full control
    update(){

        this.position.y -= 3;
        this.color+=this.side;
        if(this.color == 255){
            this.side = -this.side;
        }
        if(this.color == 0){
            this.side = -this.side;
        }
        
        this.Body.material.color = new THREE.Color("rgb(255,0,0)")

        
        
        
        this.Body.position.set(this.position.x,this.position.y,this.position.z);
        //Update position based on vel and ir
    }
}