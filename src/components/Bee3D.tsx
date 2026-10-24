"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

const Y = "#FFC400", HEAD = "#FFD43B", K = "#14100a";

function Bee() {
  const root = useRef<Group>(null!), wl = useRef<Group>(null!), wr = useRef<Group>(null!), arm = useRef<Group>(null!);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime, k = Math.min(1, dt * 4);
    root.current.position.y = -0.2 + Math.sin(t * 1.6) * 0.09;
    root.current.rotation.y += (s.pointer.x * 0.55 - root.current.rotation.y) * k;   // looks at your cursor
    root.current.rotation.x += (-s.pointer.y * 0.25 - root.current.rotation.x) * k;
    const f = Math.sin(t * 38) * 0.28;
    wl.current.rotation.z = 0.55 + f; wr.current.rotation.z = -0.55 - f;
    arm.current.rotation.z = 2.4 + Math.sin(t * 3) * 0.25;                          // friendly wave
  });
  const rings: [number, number][] = [[-0.95, 0.66], [-0.67, 0.742], [-0.39, 0.736]];
  return (
    <group ref={root}>
      {/* body */}
      <mesh position={[0, -0.55, -0.05]} scale={[1, 1.1, 0.95]}><sphereGeometry args={[0.75, 40, 32]} /><meshStandardMaterial color={Y} roughness={0.4} /></mesh>
      {rings.map(([y, r], i) => (<group key={i} scale={[1, 1, 0.95]} position={[0, y, -0.05]}><mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[r + 0.02, 0.09, 14, 56]} /><meshStandardMaterial color={K} roughness={0.5} /></mesh></group>))}
      <mesh position={[0, -1.42, -0.1]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.12, 0.3, 16]} /><meshStandardMaterial color={K} /></mesh>
      {/* backpack */}
      <mesh position={[0, -0.5, -0.82]}><boxGeometry args={[0.72, 0.9, 0.36]} /><meshStandardMaterial color="#5b3a22" roughness={0.7} /></mesh>
      <mesh position={[0, -0.62, -1.02]}><boxGeometry args={[0.5, 0.3, 0.06]} /><meshStandardMaterial color="#7a5233" roughness={0.7} /></mesh>
      {/* head */}
      <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.8, 40, 32]} /><meshStandardMaterial color={HEAD} roughness={0.35} /></mesh>
      {[-1, 1].map((s) => (<group key={s}>
        <mesh position={[s * 0.33, 0.78, 0.7]} scale={[1, 0.72, 0.4]}><sphereGeometry args={[0.3, 24, 20]} /><meshPhysicalMaterial color="#0b0b12" roughness={0.1} clearcoat={1} /></mesh>
        <mesh position={[s * 0.5, 0.48, 0.58]} scale={[1, 0.7, 0.4]}><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#ff8f6b" transparent opacity={0.6} /></mesh>
        <mesh position={[s * 0.26, 1.55, 0]} rotation={[0, 0, -s * 0.35]}><cylinderGeometry args={[0.025, 0.025, 0.5, 8]} /><meshStandardMaterial color={K} /></mesh>
        <mesh position={[s * 0.34, 1.82, 0]}><sphereGeometry args={[0.085, 14, 12]} /><meshStandardMaterial color={Y} /></mesh>
      </group>))}
      <mesh position={[0, 0.78, 0.78]}><boxGeometry args={[0.22, 0.05, 0.05]} /><meshStandardMaterial color="#0b0b12" /></mesh>
      <mesh position={[0, 0.44, 0.74]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.2, 0.03, 8, 24, Math.PI]} /><meshStandardMaterial color="#8a3d00" /></mesh>
      {/* wings */}
      <group ref={wl} position={[-0.3, 0.0, -0.5]}><mesh position={[-0.55, 0.2, 0]} scale={[1, 0.05, 0.5]}><sphereGeometry args={[0.6, 20, 16]} /><meshStandardMaterial color="#d9eeff" transparent opacity={0.65} /></mesh></group>
      <group ref={wr} position={[0.3, 0.0, -0.5]}><mesh position={[0.55, 0.2, 0]} scale={[1, 0.05, 0.5]}><sphereGeometry args={[0.6, 20, 16]} /><meshStandardMaterial color="#d9eeff" transparent opacity={0.65} /></mesh></group>
      {/* arms */}
      <group ref={arm} position={[0.66, -0.25, 0.25]}><mesh position={[0, -0.3, 0]}><capsuleGeometry args={[0.1, 0.4, 4, 10]} /><meshStandardMaterial color={Y} roughness={0.4} /></mesh></group>
      <group position={[-0.66, -0.25, 0.25]} rotation={[0, 0, -0.3]}><mesh position={[0, -0.3, 0]}><capsuleGeometry args={[0.1, 0.4, 4, 10]} /><meshStandardMaterial color={Y} roughness={0.4} /></mesh></group>
    </group>
  );
}

export default function Bee3D({ onReady }: { onReady: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => { // pause rendering when scrolled away or the tab is hidden
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <div ref={box} className="pointer-events-none absolute inset-0">
      <Canvas dpr={[1, 1.6]} frameloop={visible ? "always" : "never"} camera={{ position: [0, 0.1, 7.4], fov: 30 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined} eventPrefix="client" onCreated={onReady}>
        <ambientLight intensity={1.15} /><directionalLight position={[3, 4, 5]} intensity={2.4} /><pointLight position={[-4, 1, 3]} color="#7aa8ff" intensity={35} /><pointLight position={[3, -2, 3]} color="#ff9a3c" intensity={20} />
        <Bee />
      </Canvas>
    </div>
  );
}
