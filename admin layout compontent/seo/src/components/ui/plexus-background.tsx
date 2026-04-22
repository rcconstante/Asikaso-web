import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/components/theme-provider';

// Node component - a single sphere in the network
function NetworkNode({
    position,
    color,
    size,
    mousePosition,
    baseOpacity
}: {
    position: [number, number, number];
    color: string;
    size: number;
    mousePosition: THREE.Vector3;
    baseOpacity: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (!meshRef.current) return;

        // Calculate distance from mouse in 3D space
        const dist = meshRef.current.position.distanceTo(mousePosition);
        const maxDist = 3;

        // Scale nodes based on mouse proximity
        const scale = dist < maxDist
            ? 1 + (1 - dist / maxDist) * 0.5
            : 1;

        meshRef.current.scale.setScalar(scale);

        // Update material opacity based on proximity
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        if (material) {
            material.opacity = dist < maxDist
                ? baseOpacity + (1 - dist / maxDist) * 0.3
                : baseOpacity;
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={position}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={baseOpacity}
            />
        </mesh>
    );
}

// Lines connecting nodes
function NetworkLines({
    nodes,
    lineColor,
    mousePosition
}: {
    nodes: [number, number, number][];
    lineColor: string;
    mousePosition: THREE.Vector3;
}) {
    const linesRef = useRef<THREE.LineSegments>(null);

    const { positions, colors } = useMemo(() => {
        const positions: number[] = [];
        const colors: number[] = [];
        const maxDist = 2.5; // Maximum distance to draw a line

        const color = new THREE.Color(lineColor);

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i][0] - nodes[j][0];
                const dy = nodes[i][1] - nodes[j][1];
                const dz = nodes[i][2] - nodes[j][2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDist) {
                    positions.push(...nodes[i], ...nodes[j]);
                    // Fade lines based on distance
                    const opacity = 1 - dist / maxDist;
                    colors.push(color.r, color.g, color.b, opacity * 0.3);
                    colors.push(color.r, color.g, color.b, opacity * 0.3);
                }
            }
        }

        return { positions, colors };
    }, [nodes, lineColor]);

    useFrame(() => {
        if (!linesRef.current) return;

        // Subtle rotation of entire network
        linesRef.current.rotation.y += 0.0003;
        linesRef.current.rotation.x += 0.0001;
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={new Float32Array(positions)}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial
                color={lineColor}
                transparent
                opacity={0.15}
                linewidth={1}
            />
        </lineSegments>
    );
}

// Main network scene
function PlexusNetwork({ isDark }: { isDark: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const mousePosition = useRef(new THREE.Vector3(0, 0, 0));
    const { camera, size, gl } = useThree();

    // Generate random node positions - memoized with a stable seed
    const nodes = useMemo(() => {
        const nodeArray: [number, number, number][] = [];
        const count = 80; // Number of nodes

        // Use stable random seed for consistent positions
        const seed = 12345;
        const random = (i: number) => {
            const x = Math.sin(seed + i * 0.1) * 10000;
            return x - Math.floor(x);
        };

        for (let i = 0; i < count; i++) {
            nodeArray.push([
                (random(i * 3) - 0.5) * 10,
                (random(i * 3 + 1) - 0.5) * 6,
                (random(i * 3 + 2) - 0.5) * 8,
            ]);
        }
        return nodeArray;
    }, []);

    // Colors based on theme
    const nodeColor = isDark ? '#FF7A59' : '#FF7A59';
    const lineColor = isDark ? '#ffffff' : '#9ca3af';
    const baseOpacity = isDark ? 0.8 : 0.9;

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Convert screen coordinates to normalized device coordinates
            const x = (event.clientX / size.width) * 2 - 1;
            const y = -(event.clientY / size.height) * 2 + 1;

            // Project to 3D space
            mousePosition.current.set(x * 5, y * 3, 0);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [size]);

    // Cleanup on unmount to prevent WebGL context issues
    useEffect(() => {
        return () => {
            // Dispose of WebGL resources when component unmounts
            if (groupRef.current) {
                groupRef.current.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(m => m.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                    if (object instanceof THREE.LineSegments) {
                        if (object.geometry) object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) {
                                object.material.forEach(m => m.dispose());
                            } else {
                                object.material.dispose();
                            }
                        }
                    }
                });
            }
        };
    }, []);

    useFrame(() => {
        if (groupRef.current) {
            // Slow ambient rotation
            groupRef.current.rotation.y += 0.0005;
            groupRef.current.rotation.x += 0.0002;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Render lines */}
            <NetworkLines
                nodes={nodes}
                lineColor={lineColor}
                mousePosition={mousePosition.current}
            />

            {/* Render nodes */}
            {nodes.map((pos, i) => (
                <NetworkNode
                    key={i}
                    position={pos}
                    color={nodeColor}
                    size={0.05 + Math.random() * 0.03}
                    mousePosition={mousePosition.current}
                    baseOpacity={baseOpacity}
                />
            ))}
        </group>
    );
}

// Component to handle WebGL context loss/restore
function ContextHandler({ onContextLost }: { onContextLost: () => void }) {
    const { gl } = useThree();

    useEffect(() => {
        const canvas = gl.domElement;

        const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.log('[PlexusBackground] WebGL context lost, triggering cleanup');
            onContextLost();
        };

        const handleContextRestored = () => {
            console.log('[PlexusBackground] WebGL context restored');
        };

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);

        return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, [gl, onContextLost]);

    return null;
}

// Main exported component
export function PlexusBackground({ className }: { className?: string }) {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(true);
    const [key, setKey] = useState(0); // Key to force remount on context loss
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Handle context loss by hiding the canvas
    const handleContextLost = useCallback(() => {
        setIsVisible(false);
        // Attempt to recreate after a short delay
        setTimeout(() => {
            setKey(k => k + 1);
            setIsVisible(true);
        }, 100);
    }, []);

    // Use CSS variable for consistent background color
    const bgStyle = isDark
        ? 'hsl(0 0% 0%)' // Match pure black from index.css --background
        : 'hsl(0 0% 100%)';

    // Don't render if visibility is false (during context recovery)
    if (!isVisible) {
        return (
            <div
                className={`absolute inset-0 ${className || ''}`}
                style={{ background: bgStyle }}
            />
        );
    }

    return (
        <div
            className={`absolute inset-0 ${className || ''}`}
            style={{ background: bgStyle }}
        >
            <Canvas
                key={key}
                camera={{ position: [0, 0, 5], fov: 60 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                }}
                dpr={[1, 2]} // Responsive DPI
                onCreated={({ gl }) => {
                    // Configure renderer for better context management
                    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                }}
                // Ensure proper disposal on unmount with lower power settings
                gl={{ 
                    powerPreference: 'low-power',
                    antialias: true,
                    alpha: true,
                }}
            >
                <ContextHandler onContextLost={handleContextLost} />
                <PlexusNetwork isDark={isDark} />
            </Canvas>
        </div>
    );
}

export default PlexusBackground;
