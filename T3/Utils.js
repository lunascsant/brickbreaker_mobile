// Functions to help 

import * as THREE from  'three';

// 1, -1 incidencia
// 0, 1 normal
// retorno 1, 1


function calculateReflection(direction, normal) {
    
    var ray = new THREE.Vector3();
    

    var dotResult = direction.dot(normal);

    ray.x = direction.x - (2 * dotResult * normal.x)
    ray.y = direction.y - (2 * dotResult * normal.y)
    ray.z = direction.z - (2 * dotResult * normal.z)

    return ray
}

function isCircleAABBCollision(ballPos, aabb) {
  
  // let circle= new THREE.Vector2(ballPos.x, ballPos.y)
  // let aabbMin= new THREE.Vector2((aabb.x -(33/2)), (aabb.y -7.5));
  // let aabbMax= new THREE.Vector2(aabb.x +(33/2), aabb.y + 7.5)

  // let closestPoint= new THREE.Vector2(
  // Math.max(aabbMin.x, Math.min(circle.x, aabbMax.x)), //x
  // Math.max(aabbMin.y, Math.min(circle.y, aabbMax.y))  //y
  // )

  let newVet= new THREE.Vector3();
  newVet.subVectors(aabb, ballPos)
  newVet.normalize();
  newVet.x=(newVet.x *8)+ballPos.x;
  newVet.y=(newVet.y *8)+ballPos.y;
  //subtrair Centro do Ret pelo centro do circulo
  //normalizar ele
  //produto escalar*r + circulo
  let distance = new THREE.Vector2((ballPos.x - newVet.x), (ballPos.y - newVet.y))
  let dValue = Math.sqrt(distance.x * distance.x + distance.y * distance.y);

  return dValue <= 8;
  
}



function calculateCollisionPoint(ballPos, aabb) {
  let halfWidth = 33/2;
  let halfHeight = 7.5;
  let circle= new THREE.Vector2(ballPos.x, ballPos.y)
  let aabbMin= new THREE.Vector2((aabb.x -(halfWidth)), (aabb.y -halfHeight));
  let aabbMax= new THREE.Vector2(aabb.x +(halfWidth), aabb.y + halfHeight)

  let closestPoint= new THREE.Vector2(
  Math.max(aabbMin.x, Math.min(circle.x, aabbMax.x)), //x
  Math.max(aabbMin.y, Math.min(circle.y, aabbMax.y))  //y
  )
  return closestPoint;
  // console.log("BALLPOS: ", ballPos)
  // console.log("AABB: ", aabb)
  // let newVet= new THREE.Vector3();
  // newVet.subVectors(aabb, ballPos)
  // newVet.normalize();
  // newVet.x=(newVet.x *8)+ballPos.x;
  // newVet.y=(newVet.y *8)+ballPos.y;

  // console.log("VETOR DO PONTO DE COLISÃO:", newVet)
  // return newVet
  
}



function checkFaceCollision(colisionPoint, retPosition, dirVet, tolerance = 0.5) {
  const halfWidth = 33 / 2;
  const halfHeight = 7.5;

  function approximatelyEqual(a, b, tolerance) {
    return Math.abs(a - b) <= tolerance;
  }

  if (approximatelyEqual(retPosition.y - halfHeight, colisionPoint.y, tolerance) && dirVet.y > 0) {
    return new THREE.Vector3(0, -1, 0);
  }
  if (approximatelyEqual(retPosition.y + halfHeight, colisionPoint.y, tolerance) && dirVet.y < 0) {
    return new THREE.Vector3(0, 1, 0);
  }
  if (approximatelyEqual(retPosition.x + halfWidth, colisionPoint.x, tolerance) && dirVet.x < 0) {
    return new THREE.Vector3(1, 0, 0);
  }
  if (approximatelyEqual(retPosition.x - halfWidth, colisionPoint.x, tolerance) && dirVet.x > 0) {
    return new THREE.Vector3(-1, 0, 0);
  }

  // If none of the conditions match, you might want to handle this case or return a default value.
  // For now, I'm returning an empty vector (0, 0, 0) when no collision occurs.
  return new THREE.Vector3(-dirVet.x, -dirVet.y, 0);
}



function switchFullScreen(isFullScreen) {
  if(isFullScreen) {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  } else {
    document.exitFullscreen()
  }
}

function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); // Available in 'utils.js'
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

function fixPosition(obj)
{
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
}

function getMaxSize(obj) {
  var maxSize;
  var box = new THREE.Box3().setFromObject(obj);
  var min = box.min;
  var max = box.max;

  var size = new THREE.Box3();
  size.x = max.x - min.x;
  size.y = max.y - min.y;
  size.z = max.z - min.z;

  if (size.x >= size.y && size.x >= size.z)
     maxSize = size.x;
  else {
     if (size.y >= size.z)
        maxSize = size.y;
     else {
        maxSize = size.z;
     }
  }
  return maxSize;
}


export{calculateReflection, checkFaceCollision, switchFullScreen, calculateCollisionPoint , isCircleAABBCollision,fixPosition,normalizeAndRescale,getMaxSize}
