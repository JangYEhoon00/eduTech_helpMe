
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GraphData } from '../utils/types';
import { COLORS } from '../utils/constants';

interface ThreeGraphProps {
  data: GraphData;
  onNodeClick: (nodeId: string) => void;
  selectedNodeId?: string | null;
  hiddenCategories: string[];
}

export const ThreeGraph: React.FC<ThreeGraphProps> = ({ data, onNodeClick, selectedNodeId, hiddenCategories }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<any[]>([]);
  const linksRef = useRef<any[]>([]);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>({ target: new THREE.Vector3(0, 0, 0) });
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-999, -999));
  const animationFrameRef = useRef<number>(0);
  
  // Controls State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const groupRef = useRef<THREE.Group | null>(null);

  const getHexColor = (status: string) => {
    // @ts-ignore
    return COLORS[status] || COLORS.default;
  };

  const getGlowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  };

  // Effect to handle selection change (Camera Fly-to)
  useEffect(() => {
    if (selectedNodeId && cameraRef.current && nodesRef.current.length > 0) {
      const targetNode = nodesRef.current.find(n => n.id === selectedNodeId);
      if (targetNode && targetNode.mesh.visible) {
        controlsRef.current.target.copy(targetNode.mesh.position);
      }
    }
  }, [selectedNodeId]);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && rendererRef.current && cameraRef.current) {
            const w = entry.contentRect.width;
            const h = entry.contentRect.height;
            rendererRef.current.setSize(w, h);
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.0025); 

    // Auto-Zoom Calculation based on Node Count
    const nodeCount = data.nodes.length;
    // Heuristic: Base distance + factor of node count. 
    // 10 nodes -> ~60 distance, 50 nodes -> ~100 distance
    const autoDistance = 50 + (nodeCount * 1.5); 
    const initialZ = Math.min(Math.max(autoDistance, 60), 300);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
    camera.position.set(0, 20, initialZ);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.innerHTML = ''; 
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);
    groupRef.current = graphGroup;

    // Stars
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        starPos[i] = (Math.random() - 0.5) * 800; 
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.7, color: 0x64748b, transparent: true, opacity: 0.4 });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // Data Processing
    nodesRef.current = [];
    linksRef.current = [];
    const glowTex = getGlowTexture();

    // Pre-calculate category centers
    const categories = Array.from(new Set(data.nodes.map(n => n.category)));
    const categoryCenters: Record<string, THREE.Vector3> = {};
    categories.forEach((cat: string, i) => {
      const phi = Math.acos(-1 + (2 * i) / categories.length);
      const theta = Math.sqrt(categories.length * Math.PI) * phi;
      categoryCenters[cat] = new THREE.Vector3(
        25 * Math.cos(theta) * Math.sin(phi),
        25 * Math.sin(theta) * Math.sin(phi),
        25 * Math.cos(phi)
      );
    });

    data.nodes.forEach((node) => {
      const color = getHexColor(node.status);

      // 1. Core Sphere
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);
      
      const center = categoryCenters[node.category] || new THREE.Vector3(0,0,0);
      mesh.position.set(
        center.x + (Math.random() - 0.5) * 10,
        center.y + (Math.random() - 0.5) * 10,
        center.z + (Math.random() - 0.5) * 10
      );
      mesh.userData = { id: node.id };
      graphGroup.add(mesh);

      // 2. Glow Sprite
      const glowMat = new THREE.SpriteMaterial({ 
          map: glowTex, 
          color: color, 
          transparent: true, 
          opacity: 0.8,
          blending: THREE.AdditiveBlending
      });
      const glowSprite = new THREE.Sprite(glowMat);
      const glowSize = 5 + (node.val || 0) * 0.1; 
      glowSprite.scale.set(glowSize, glowSize, 1);
      mesh.add(glowSprite);

      // 3. Text Label
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 512; canvas.height = 128;
        ctx.font = '300 28px "Inter", sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(node.label.toUpperCase(), 256, 64);
      }
      const labelTex = new THREE.CanvasTexture(canvas);
      labelTex.minFilter = THREE.LinearFilter;
      const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true, opacity: 0.6 });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.scale.set(20, 5, 1);
      labelSprite.position.set(0, 2.5, 0);
      mesh.add(labelSprite);

      nodesRef.current.push({ 
          ...node, mesh, glowSprite, labelSprite, baseGlowSize: glowSize,
          vx: 0, vy: 0, vz: 0 
      });
    });

    data.links.forEach((link) => {
      const material = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.1 });
      const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const line = new THREE.Line(geom, material);
      graphGroup.add(line);
      linksRef.current.push({
        source: typeof link.source === 'object' ? (link.source as any).id : link.source, 
        target: typeof link.target === 'object' ? (link.target as any).id : link.target, 
        line
      });
    });

    // Animation Loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // --- Visibility Filter ---
      // Update visibility based on props. This is efficient enough for this size.
      nodesRef.current.forEach(n => {
        const isHidden = hiddenCategories.includes(n.category);
        n.mesh.visible = !isHidden;
      });

      // --- Interaction Logic ---
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
      // Only raycast visible nodes
      const visibleNodes = nodesRef.current.filter(n => n.mesh.visible);
      const intersects = raycasterRef.current.intersectObjects(
          visibleNodes.map(n => n.glowSprite)
      );
      const hoveredId = intersects.length > 0 ? intersects[0].object.parent?.userData.id : null;
      const activeId = selectedNodeId || hoveredId;

      // --- Visual Updates ---
      const time = Date.now() * 0.001;
      nodesRef.current.forEach(n => {
        if (!n.mesh.visible) return;

        const isActive = n.id === activeId;
        
        // Opacity & Scale
        const targetOpacity = isActive ? 1.0 : (selectedNodeId ? 0.2 : 0.5); 
        const targetScale = isActive ? 1.5 : 0.8;
        
        n.labelSprite.material.opacity += (targetOpacity - n.labelSprite.material.opacity) * 0.1;
        n.labelSprite.scale.lerp(new THREE.Vector3(20 * targetScale, 5 * targetScale, 1), 0.1);
        
        // Glow Pulse
        const pulse = Math.sin(time * 2 + n.id.charCodeAt(0)) * 0.1;
        const glowS = n.baseGlowSize * (1 + pulse) * (isActive ? 1.8 : 1.0);
        n.glowSprite.scale.set(glowS, glowS, 1);

        n.labelSprite.renderOrder = isActive ? 999 : 1;
        n.glowSprite.renderOrder = isActive ? 998 : 0;
      });

      // --- Physics (Force Directed) ---
      const repulsion = 80; 
      const centerGravity = 0.01;
      const clusterStrength = 0.03;

      nodesRef.current.forEach((n1, i) => {
          if (!n1.mesh.visible) return;

          // Repulsion (Only against visible nodes for cleaner layout)
          for(let j=i+1; j<nodesRef.current.length; j++) {
              const n2 = nodesRef.current[j];
              if (!n2.mesh.visible) continue;

              const dx = n1.mesh.position.x - n2.mesh.position.x;
              const dy = n1.mesh.position.y - n2.mesh.position.y;
              const dz = n1.mesh.position.z - n2.mesh.position.z;
              const distSq = dx*dx + dy*dy + dz*dz + 0.05;
              const f = repulsion / distSq;
              
              const fx = (dx/distSq)*f;
              const fy = (dy/distSq)*f;
              const fz = (dz/distSq)*f;

              n1.vx += fx; n1.vy += fy; n1.vz += fz;
              n2.vx -= fx; n2.vy -= fy; n2.vz -= fz;
          }
          
          // Clustering
          const center = categoryCenters[n1.category] || new THREE.Vector3(0,0,0);
          n1.vx += (center.x - n1.mesh.position.x) * clusterStrength;
          n1.vy += (center.y - n1.mesh.position.y) * clusterStrength;
          n1.vz += (center.z - n1.mesh.position.z) * clusterStrength;

          // Global Center Gravity
          n1.vx -= n1.mesh.position.x * centerGravity;
          n1.vy -= n1.mesh.position.y * centerGravity;
          n1.vz -= n1.mesh.position.z * centerGravity;

          // Update Position
          n1.mesh.position.x += n1.vx;
          n1.mesh.position.y += n1.vy;
          n1.mesh.position.z += n1.vz;
          
          // Damping
          n1.vx *= 0.90; n1.vy *= 0.90; n1.vz *= 0.90;
      });

      // Links Update
      linksRef.current.forEach(l => {
         const s = nodesRef.current.find(n => n.id === l.source);
         const t = nodesRef.current.find(n => n.id === l.target);
         
         if(s && t) {
             // Hide link if either source or target is invisible
             if (!s.mesh.visible || !t.mesh.visible) {
                l.line.visible = false;
             } else {
                l.line.visible = true;
                const pos = l.line.geometry.attributes.position.array;
                pos[0] = s.mesh.position.x; pos[1] = s.mesh.position.y; pos[2] = s.mesh.position.z;
                pos[3] = t.mesh.position.x; pos[4] = t.mesh.position.y; pos[5] = t.mesh.position.z;
                l.line.geometry.attributes.position.needsUpdate = true;
                
                const isConnected = (l.source === activeId || l.target === activeId);
                l.line.material.opacity = isConnected ? 0.6 : 0.05; 
             }
         }
      });
      
      // Camera Movement logic
      if (camera && groupRef.current) {
          groupRef.current.rotation.y += 0.0005;
          groupRef.current.rotation.y += rotationRef.current.x;
          groupRef.current.rotation.x += rotationRef.current.y;
          rotationRef.current.x *= 0.95;
          rotationRef.current.y *= 0.95;

          if (selectedNodeId) {
              const targetNode = nodesRef.current.find(n => n.id === selectedNodeId);
              if (targetNode && targetNode.mesh.visible) {
                  const currentLookAt = new THREE.Vector3(0,0,0).applyMatrix4(camera.matrixWorld).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10));
                  currentLookAt.lerp(targetNode.mesh.position, 0.05);
                  camera.lookAt(currentLookAt);
                  
                  // Reduced distance from 40 to 14 for a much closer "zoomed in" feel
                  const targetPos = targetNode.mesh.position.clone().add(new THREE.Vector3(0, 0, 14)); 
                  camera.position.lerp(targetPos, 0.02);
              }
          } else {
              const center = new THREE.Vector3(0,0,0);
              const currentLookAt = new THREE.Vector3(0,0,0).applyMatrix4(camera.matrixWorld).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10));
              currentLookAt.lerp(center, 0.05);
              camera.lookAt(currentLookAt);
          }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(animationFrameRef.current);
        if(rendererRef.current && mountRef.current) {
            mountRef.current.innerHTML = '';
        }
        rendererRef.current?.dispose();
    };
  }, [data, selectedNodeId]); 

  // --- Interaction Handlers ---

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDraggingRef.current) {
      const deltaMove = {
        x: e.clientX - previousMousePositionRef.current.x,
        y: e.clientY - previousMousePositionRef.current.y
      };
      rotationRef.current.x += deltaMove.x * 0.005;
      rotationRef.current.y += deltaMove.y * 0.005;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    isDraggingRef.current = false;
    if (Math.abs(e.movementX) < 5 && Math.abs(e.movementY) < 5) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
        const visibleNodes = nodesRef.current.filter(n => n.mesh.visible);
        const intersects = raycasterRef.current.intersectObjects(
            visibleNodes.map(n => n.glowSprite)
        );
        if (intersects.length > 0) {
            const id = intersects[0].object.parent?.userData.id;
            if (id) onNodeClick(id);
        } else {
            onNodeClick(""); 
        }
    }
  };

  const onWheel = (e: React.WheelEvent) => {
      if (cameraRef.current) {
          const newZ = cameraRef.current.position.z + e.deltaY * 0.05;
          cameraRef.current.position.z = Math.max(20, Math.min(newZ, 400));
      }
  };

  return (
    <div 
      ref={mountRef} 
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { isDraggingRef.current = false; }}
      onWheel={onWheel}
      className="w-full h-full cursor-move bg-[#020617]"
    />
  );
};