import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCadStore } from '../../store/useCadStore';

export const LaserCutEffect: React.FC = () => {
  const {
    length,
    outerRadius,
    cuts,
    selectedCutId,
    isLaserAnimating,
  } = useCadStore();

  const laserHeadRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const sparkPointsRef = useRef<THREE.Points>(null);

  const activeCut = cuts.find((c) => c.id === selectedCutId) || cuts[0];
  const tubeRadiusInCanvas = outerRadius / 100;
  const targetZ = activeCut ? (activeCut.positionZ - length / 2) / 100 : 0;
  const targetAngleRad = activeCut ? (activeCut.polarAngle * Math.PI) / 180 : 0;
  const hoverHeight = tubeRadiusInCanvas + 0.35;

  // Generate 50 Plasma Spark Particles
  const sparkParticles = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.05;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

      velocities[i * 3] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 1] = Math.random() * 0.6;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }

    return { count, positions, velocities };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (laserHeadRef.current && activeCut) {
      const posX = Math.sin(targetAngleRad) * hoverHeight;
      const posY = Math.cos(targetAngleRad) * hoverHeight;

      if (isLaserAnimating) {
        const oscZ = targetZ + Math.sin(t * 4) * 0.08;
        laserHeadRef.current.position.set(posX, posY, oscZ);
      } else {
        laserHeadRef.current.position.set(posX, posY, targetZ);
      }

      laserHeadRef.current.rotation.set(0, 0, -targetAngleRad);

      if (beamRef.current) {
        (beamRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.75 + Math.sin(t * 24) * 0.2;
      }
    }

    // Spark Particles Animation
    if (sparkPointsRef.current && isLaserAnimating) {
      const geom = sparkPointsRef.current.geometry;
      const posAttr = geom.attributes.position;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < sparkParticles.count; i++) {
        posArray[i * 3] += sparkParticles.velocities[i * 3] * 0.02;
        posArray[i * 3 + 1] += sparkParticles.velocities[i * 3 + 1] * 0.02;
        posArray[i * 3 + 2] += sparkParticles.velocities[i * 3 + 2] * 0.02;

        // Reset particle position when it travels too far
        if (Math.abs(posArray[i * 3 + 1]) > 0.3) {
          posArray[i * 3] = (Math.random() - 0.5) * 0.02;
          posArray[i * 3 + 1] = -0.32;
          posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }
      }

      posAttr.needsUpdate = true;
    }
  });

  if (!activeCut || !activeCut.enabled) return null;

  return (
    <group ref={laserHeadRef} position={[0, hoverHeight, targetZ]}>
      {/* Fiber Laser Nozzle Head */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.03, 0.25, 32]} />
        <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.06, 0]}>
        <coneGeometry args={[0.03, 0.08, 32]} />
        <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Primary Fiber Laser Beam */}
      <mesh ref={beamRef} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.004, 0.008, 0.35, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
      </mesh>

      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.04, 0.35, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} />
      </mesh>

      {/* Plasma Spark Particles FX */}
      {isLaserAnimating && (
        <points ref={sparkPointsRef} position={[0, 0, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparkParticles.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.035}
            color="#f59e0b"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      <pointLight
        position={[0, -0.35, 0]}
        color="#38bdf8"
        intensity={9}
        distance={1.8}
        decay={2}
      />
    </group>
  );
};
