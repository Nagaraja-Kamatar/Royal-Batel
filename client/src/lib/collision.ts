import * as THREE from "three";

export interface CollisionResult {
  collided: boolean;
  normal?: THREE.Vector3;
  penetration?: number;
}

export function checkSphereCollision(
  pos1: THREE.Vector3,
  radius1: number,
  pos2: THREE.Vector3,
  radius2: number
): CollisionResult {
  const distance = pos1.distanceTo(pos2);
  const minDistance = radius1 + radius2;
  
  if (distance < minDistance) {
    const normal = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    const penetration = minDistance - distance;
    
    return {
      collided: true,
      normal,
      penetration
    };
  }
  
  return { collided: false };
}

export function keepInBounds(
  position: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
  objectRadius: number = 0.5
): { position: THREE.Vector3; outOfBounds: boolean } {
  const distance = position.distanceTo(center);
  const maxDistance = radius - objectRadius;
  
  if (distance > maxDistance) {
    const direction = new THREE.Vector3().subVectors(position, center).normalize();
    return {
      position: new THREE.Vector3().addVectors(center, direction.multiplyScalar(maxDistance)),
      outOfBounds: true
    };
  }
  
  return { position, outOfBounds: false };
}

export function keepInSquareBounds(
  position: THREE.Vector3,
  center: THREE.Vector3,
  size: number,
  objectRadius: number = 0.5
): { position: THREE.Vector3; outOfBounds: boolean } {
  const halfSize = size / 2 - objectRadius;
  let outOfBounds = false;
  const newPosition = position.clone();
  
  // Check X bounds
  if (newPosition.x > center.x + halfSize) {
    newPosition.x = center.x + halfSize;
    outOfBounds = true;
  } else if (newPosition.x < center.x - halfSize) {
    newPosition.x = center.x - halfSize;
    outOfBounds = true;
  }
  
  // Check Z bounds
  if (newPosition.z > center.z + halfSize) {
    newPosition.z = center.z + halfSize;
    outOfBounds = true;
  } else if (newPosition.z < center.z - halfSize) {
    newPosition.z = center.z - halfSize;
    outOfBounds = true;
  }
  
  return { position: newPosition, outOfBounds };
}

export function resolveCollision(
  pos1: THREE.Vector3,
  vel1: THREE.Vector3,
  mass1: number,
  pos2: THREE.Vector3,
  vel2: THREE.Vector3,
  mass2: number,
  restitution: number = 0.8
): { vel1: THREE.Vector3; vel2: THREE.Vector3 } {
  const normal = new THREE.Vector3().subVectors(pos2, pos1).normalize();
  
  // Relative velocity in collision normal direction
  const relativeVelocity = new THREE.Vector3().subVectors(vel1, vel2);
  const velocityAlongNormal = relativeVelocity.dot(normal);
  
  // Do not resolve if velocities are separating
  if (velocityAlongNormal > 0) {
    return { vel1: vel1.clone(), vel2: vel2.clone() };
  }
  
  // Calculate impulse scalar
  const impulse = -(1 + restitution) * velocityAlongNormal / (1/mass1 + 1/mass2);
  
  // Apply impulse
  const impulseVector = normal.clone().multiplyScalar(impulse);
  
  const newVel1 = vel1.clone().add(impulseVector.clone().multiplyScalar(1/mass1));
  const newVel2 = vel2.clone().sub(impulseVector.clone().multiplyScalar(1/mass2));
  
  return { vel1: newVel1, vel2: newVel2 };
}
