import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const BRAND_BLUE = "hsl(217, 91%, 50%)";

// Project a 3D point rotated around the Y axis onto 2D SVG space.
// cx, cy = center of projection in SVG units
// The cube is defined in local 3D coords, then rotated + projected.
function projectY(
  x: number,
  y: number,
  z: number,
  angleRad: number,
  cx: number,
  cy: number,
  scale: number
): [number, number] {
  // Rotate around Y axis
  const rx = x * Math.cos(angleRad) - z * Math.sin(angleRad);
  const rz = x * Math.sin(angleRad) + z * Math.cos(angleRad);
  // Simple isometric-style projection (no perspective distortion so it stays centered)
  const sx = cx + rx * scale;
  const sy = cy + y * scale + rz * scale * 0.3; // slight Z contribution for depth feel
  return [sx, sy];
}

// Cube half-size in local 3D units
const H = 4.5;

// 8 vertices of a cube centered at origin
const VERTS: [number, number, number][] = [
  [-H, -H, -H], // 0 back-top-left
  [ H, -H, -H], // 1 back-top-right
  [ H,  H, -H], // 2 back-bot-right
  [-H,  H, -H], // 3 back-bot-left
  [-H, -H,  H], // 4 front-top-left
  [ H, -H,  H], // 5 front-top-right
  [ H,  H,  H], // 6 front-bot-right
  [-H,  H,  H], // 7 front-bot-left
];

// 12 edges (pairs of vertex indices)
const EDGES: [number, number][] = [
  // front face
  [4,5],[5,6],[6,7],[7,4],
  // back face
  [0,1],[1,2],[2,3],[3,0],
  // connecting
  [0,4],[1,5],[2,6],[3,7],
];

export default function LoadingCube() {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    const duration = 3000; // ms per full rotation
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      setAngle(((elapsed % duration) / duration) * Math.PI * 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // SVG center & projection scale
  const CX = 12, CY = 12, SCALE = 0.95;

  // Project all vertices
  const pts = VERTS.map(([x, y, z]) => projectY(x, y, z, angle, CX, CY, SCALE));

  // Build edge path strings
  const edgePaths = EDGES.map(([a, b]) => {
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    return `M${ax.toFixed(3)} ${ay.toFixed(3)} L${bx.toFixed(3)} ${by.toFixed(3)}`;
  });

  // Corners: all animate in perfect sync (same transition, delay: 0)
  const cornerTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay: 0,
  };

  return (
    <div
      className="flex items-center justify-center relative"
      style={{ width: 64, height: 64 }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Top-left corner */}
        <motion.path
          d="M2 9V7C2 4.23858 4.23858 2 7 2H9"
          stroke={BRAND_BLUE} strokeWidth="2" strokeLinecap="round"
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
          transition={cornerTransition}
          style={{ originX: "5.5px", originY: "5.5px" }}
        />
        {/* Top-right corner */}
        <motion.path
          d="M15 2H17C19.7614 2 22 4.23858 22 7V9"
          stroke={BRAND_BLUE} strokeWidth="2" strokeLinecap="round"
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
          transition={cornerTransition}
          style={{ originX: "18.5px", originY: "5.5px" }}
        />
        {/* Bottom-right corner */}
        <motion.path
          d="M22 15V17C22 19.7614 19.7614 22 17 22H15"
          stroke={BRAND_BLUE} strokeWidth="2" strokeLinecap="round"
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
          transition={cornerTransition}
          style={{ originX: "18.5px", originY: "18.5px" }}
        />
        {/* Bottom-left corner */}
        <motion.path
          d="M9 22H7C4.23858 22 2 19.7614 2 17V15"
          stroke={BRAND_BLUE} strokeWidth="2" strokeLinecap="round"
          animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
          transition={cornerTransition}
          style={{ originX: "5.5px", originY: "18.5px" }}
        />

        {/* Wireframe cube — edges drawn from mathematically projected vertices */}
        {edgePaths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={BRAND_BLUE}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}