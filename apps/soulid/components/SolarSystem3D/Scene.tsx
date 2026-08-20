'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH, PLANETS, SATURN_RING_TEXTURE, type PlanetVisual } from './planetMeta';
import type { Chart, PlanetName } from '@/lib/types';

type Props = {
  chart: Chart;
  onSelect: (planetKey: string) => void;
  selected: string | null;
};

function lonToXZ(longitude: number, distance: number): [number, number, number] {
  // Ekliptik düzleminde (XZ), ASC sol uçta; 90° = ileri yön
  const a = ((longitude - 180) * Math.PI) / 180;
  return [Math.cos(a) * distance, 0, Math.sin(a) * distance];
}

function EarthMesh() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const earthMap = useLoader(THREE.TextureLoader, EARTH.texture);
  const cloudMap = useLoader(THREE.TextureLoader, EARTH.cloudTexture);

  useFrame((_, dt) => {
    if (earthRef.current) earthRef.current.rotation.y += dt * 0.06;
    if (cloudRef.current) cloudRef.current.rotation.y += dt * 0.08;
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH.size, 48, 48]} />
        <meshStandardMaterial map={earthMap} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh ref={cloudRef}>
        <sphereGeometry args={[EARTH.size * 1.01, 48, 48]} />
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      <Billboard>
        <Text
          position={[0, EARTH.size + 0.4, 0]}
          fontSize={0.22}
          color="#f5d061"
          anchorX="center"
          anchorY="bottom"
        >
          ⊕ Sen
        </Text>
      </Billboard>
    </group>
  );
}

function PlanetMesh({
  planet,
  longitude,
  onClick,
  isSelected,
}: {
  planet: PlanetVisual;
  longitude: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const map = useLoader(THREE.TextureLoader, planet.texture);
  const ringMap = useLoader(THREE.TextureLoader, SATURN_RING_TEXTURE);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.15;
  });

  const pos = lonToXZ(longitude, planet.distance);
  const isSun = planet.key === 'Sun';

  return (
    <group position={pos}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = '';
        }}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        {isSun ? (
          <meshBasicMaterial map={map} />
        ) : (
          <meshStandardMaterial map={map} roughness={0.7} metalness={0.05} />
        )}
      </mesh>

      {isSun ? <pointLight position={[0, 0, 0]} intensity={2.2} distance={40} color="#fff5d6" /> : null}

      {planet.hasRing ? (
        <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[planet.size * 1.4, planet.size * 2.2, 64]} />
          <meshStandardMaterial
            map={ringMap}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>
      ) : null}

      {isSelected ? (
        <mesh>
          <ringGeometry args={[planet.size * 1.5, planet.size * 1.6, 64]} />
          <meshBasicMaterial color="#f5d061" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      ) : null}

      <Billboard>
        <Text
          position={[0, planet.size + 0.35, 0]}
          fontSize={0.22}
          color={isSelected ? '#f5d061' : '#dadcff'}
          anchorX="center"
          anchorY="bottom"
        >
          {planet.glyph} {planet.tr}
        </Text>
      </Billboard>
    </group>
  );
}

function OrbitRing({ distance }: { distance: number }) {
  const geo = useMemo(() => {
    if (distance < 0.5) return null;
    const segs = 96;
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.cos(a) * distance, 0, Math.sin(a) * distance));
    }
    return new THREE.BufferGeometry().setFromPoints(arr);
  }, [distance]);
  if (!geo) return null;
  return (
    <primitive
      object={
        new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.18 }),
        )
      }
    />
  );
}

function PlanetWithFallback({
  planet,
  longitude,
  onClick,
  isSelected,
}: {
  planet: PlanetVisual;
  longitude: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  // Suspense fallback için her gezegeni ayrı sar — biri başarısız olursa diğerleri görünür
  return (
    <Suspense
      fallback={
        <FallbackSphere
          planet={planet}
          longitude={longitude}
          isSelected={isSelected}
          onClick={onClick}
        />
      }
    >
      <PlanetMesh planet={planet} longitude={longitude} onClick={onClick} isSelected={isSelected} />
    </Suspense>
  );
}

function FallbackSphere({
  planet,
  longitude,
  isSelected,
  onClick,
}: {
  planet: PlanetVisual;
  longitude: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const pos = lonToXZ(longitude, planet.distance);
  return (
    <group position={pos}>
      <mesh onClick={onClick}>
        <sphereGeometry args={[planet.size, 24, 24]} />
        <meshStandardMaterial color={planet.color} roughness={0.7} />
      </mesh>
      <Billboard>
        <Text
          position={[0, planet.size + 0.35, 0]}
          fontSize={0.22}
          color={isSelected ? '#f5d061' : '#dadcff'}
          anchorX="center"
          anchorY="bottom"
        >
          {planet.glyph} {planet.tr}
        </Text>
      </Billboard>
    </group>
  );
}

function FallbackEarth() {
  return (
    <mesh>
      <sphereGeometry args={[EARTH.size, 32, 32]} />
      <meshStandardMaterial color="#3b6ec7" roughness={0.7} />
    </mesh>
  );
}

export default function Scene({ chart, onSelect, selected }: Props) {
  const isCoarse =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const starCount = isCoarse ? 1500 : 3000;

  return (
    <Canvas
      camera={{ position: [0, 5, 16], fov: 55 }}
      gl={{ antialias: !isCoarse, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ background: 'transparent', touchAction: 'none' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} color="#fff" />

      <Stars radius={120} depth={50} count={starCount} factor={3} fade speed={0.5} />

      {/* Yörünge halkaları */}
      {PLANETS.map((p) =>
        p.distance > 0 ? <OrbitRing key={`o-${p.key}`} distance={p.distance} /> : null,
      )}

      {/* Sen — Dünya */}
      <Suspense fallback={<FallbackEarth />}>
        <EarthMesh />
      </Suspense>

      {/* Gezegenler */}
      {PLANETS.map((p) => {
        const planetPos = chart.planets.find((cp) => cp.name === (p.key as PlanetName));
        const lon = planetPos?.longitude ?? 0;
        return (
          <PlanetWithFallback
            key={p.key}
            planet={p}
            longitude={lon}
            onClick={() => onSelect(p.key)}
            isSelected={selected === p.key}
          />
        );
      })}

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={40}
        autoRotate={false}
        rotateSpeed={0.6}
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
