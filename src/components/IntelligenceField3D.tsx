import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './IntelligenceField3D.css';

export default function IntelligenceField3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [isReady, setIsReady] = useState(false);
  const [isHotspotActive, setIsHotspotActive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151514);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 15, 27);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.className = 'intel-three-canvas';

    // 3. Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xf3f0e8, 0.82);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffdfa, 1.25);
    dirLight.position.set(12, 24, 16);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x7a8061, 0.45);
    rimLight.position.set(-14, 10, -12);
    scene.add(rimLight);

    // Localized orange glow around the primary hotspot
    const hotspotLight = new THREE.PointLight(0xc65d3a, 1.4, 12);
    hotspotLight.position.set(-3.5, 3.2, 2.2);
    scene.add(hotspotLight);

    // 4. Main Intelligence Terrain Group
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // Coordinate Base Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x36342f, 0x22211e);
    gridHelper.position.y = -1.2;
    terrainGroup.add(gridHelper);

    // Procedural Elevation Topography (represents municipal zones & density)
    const planeWidth = 34;
    const planeDepth = 24;
    const segX = 36;
    const segY = 26;
    const terrainGeo = new THREE.PlaneGeometry(planeWidth, planeDepth, segX, segY);
    terrainGeo.rotateX(-Math.PI / 2);

    function getElevation(x: number, z: number): number {
      return (
        Math.sin(x * 0.22) * Math.cos(z * 0.26) * 1.55 +
        Math.sin(x * 0.45 + z * 0.35) * 0.6 -
        Math.exp(-((x * x + z * z) / 52)) * 0.45
      );
    }

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      pos.setY(i, getElevation(vx, vz));
    }
    terrainGeo.computeVertexNormals();

    // Solid faceted surface
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1d1d1b,
      roughness: 0.84,
      metalness: 0.16,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainGroup.add(terrainMesh);

    // Wireframe contour overlay
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x484640,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const wireframeMesh = new THREE.Mesh(terrainGeo, wireframeMat);
    wireframeMesh.position.y += 0.03;
    terrainGroup.add(wireframeMesh);

    // 5. Operational Nodes & Beacons
    const nodesGroup = new THREE.Group();
    terrainGroup.add(nodesGroup);

    interface OperationalNode {
      x: number;
      z: number;
      label: string;
      risk: number;
      color: number;
      beaconHeight: number;
      isHotspot?: boolean;
    }

    const operationalNodes: OperationalNode[] = [
      { x: -3.5, z: 2.2, label: 'ZONE Z-07', risk: 88, color: 0xc65d3a, beaconHeight: 2.6, isHotspot: true },
      { x: 5.2, z: -1.8, label: 'ZONE Z-12', risk: 72, color: 0xd4845a, beaconHeight: 1.9 },
      { x: -7.5, z: -4.2, label: 'ZONE Z-03', risk: 34, color: 0x7a8061, beaconHeight: 1.4 },
      { x: 1.8, z: 4.8, label: 'ZONE Z-18', risk: 45, color: 0x8c887e, beaconHeight: 1.2 },
      { x: -10.2, z: 3.5, label: 'ZONE Z-02', risk: 28, color: 0x6e6a62, beaconHeight: 0.9 },
      { x: 9.4, z: 3.2, label: 'ZONE Z-21', risk: 52, color: 0x8c887e, beaconHeight: 1.3 },
    ];

    // Pulsing ring around primary hotspot Z-07
    const ringGeo = new THREE.RingGeometry(0.55, 0.72, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc65d3a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const hotspotRing = new THREE.Mesh(ringGeo, ringMat);
    const z07Elevation = getElevation(-3.5, 2.2);
    hotspotRing.position.set(-3.5, z07Elevation + 0.05, 2.2);
    terrainGroup.add(hotspotRing);

    // Keep track of hotspot head mesh for periodic sequence
    let hotspotHeadMesh: THREE.Mesh | null = null;

    operationalNodes.forEach((node) => {
      const y = getElevation(node.x, node.z);

      // Vertical stem
      const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, node.beaconHeight, 8);
      stemGeo.translate(0, node.beaconHeight / 2, 0);
      const stemMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: node.isHotspot ? 0.85 : 0.5,
      });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.set(node.x, y, node.z);
      nodesGroup.add(stemMesh);

      // Sphere head
      const headGeo = new THREE.SphereGeometry(node.isHotspot ? 0.26 : 0.17, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: node.isHotspot ? 0.5 : 0.2,
        roughness: 0.35,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(node.x, y + node.beaconHeight, node.z);
      nodesGroup.add(headMesh);

      if (node.isHotspot) {
        hotspotHeadMesh = headMesh;
      }
    });

    // 6. Signal Connection Paths
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7.5, getElevation(-7.5, -4.2) + 1.4, -4.2),
      new THREE.Vector3(-1.0, getElevation(-1.0, -1.0) + 1.8, -1.0),
      new THREE.Vector3(1.8, getElevation(1.8, 4.8) + 1.2, 4.8),
      new THREE.Vector3(5.2, getElevation(5.2, -1.8) + 1.9, -1.8),
      new THREE.Vector3(-3.5, getElevation(-3.5, 2.2) + 2.6, 2.2),
    ]);

    const pathPoints = pathCurve.getPoints(70);
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMat = new THREE.LineBasicMaterial({
      color: 0x9e9a92,
      transparent: true,
      opacity: 0.35,
    });
    const pathLine = new THREE.Line(pathGeo, pathMat);
    terrainGroup.add(pathLine);

    // Traveling Signal Packet
    const signalPacketGeo = new THREE.SphereGeometry(0.13, 12, 12);
    const signalPacketMat = new THREE.MeshBasicMaterial({
      color: 0xe27b58,
      transparent: true,
      opacity: 0,
    });
    const signalPacket = new THREE.Mesh(signalPacketGeo, signalPacketMat);
    terrainGroup.add(signalPacket);

    // 7. Micro-Atmospheric Particles (Lightweight: 35 points)
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 30;
      particlePositions[i * 3 + 1] = Math.random() * 7 + 0.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd8d4ca,
      size: 0.1,
      transparent: true,
      opacity: 0.3,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    terrainGroup.add(particleCloud);

    // 8. Controlled Interaction & Parallax Variables (Max 2.8° / 0.048 rad)
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.04;
    let targetRotY = -0.12;
    let currentRotX = 0.04;
    let currentRotY = -0.12;
    const startTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = normX;
      mouseY = normY;
      // Controlled tilt: 1–2% response, never exceeding 0.048 rad (~2.8 degrees)
      targetRotX = 0.04 + mouseY * 0.035;
      targetRotY = -0.12 + mouseX * 0.045;
    };

    const handleMouseLeave = () => {
      targetRotX = 0.04;
      targetRotY = -0.12;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width || 600;
        height = entry.contentRect.height || 500;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 9. Main RAF Animation Loop with Periodic Prediction Sequence
    let lastActiveState = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) / 1000;

      if (!mediaQuery.matches) {
        // Damped smooth camera / terrain tilt (restrained, calm)
        currentRotX += (targetRotX - currentRotX) * 0.04;
        currentRotY += (targetRotY - currentRotY) * 0.04;

        // Very subtle organic depth breathing (0.008 rad, slow cadence)
        const breathe = Math.sin(elapsedTime * 0.5) * 0.008;
        terrainGroup.rotation.x = currentRotX + breathe;
        terrainGroup.rotation.y = currentRotY;

        // --- Periodic Prediction Sequence (10s cycle: 3.5s sequence, then 6.5s wait) ---
        const cycle = 10;
        const seqTime = elapsedTime % cycle;

        if (seqTime < 3.8) {
          // ACTIVE PREDICTION SEQUENCE
          if (!lastActiveState) {
            lastActiveState = true;
            setIsHotspotActive(true);
          }

          // 1. Path packet travels smoothly along spline
          const pathT = Math.min(seqTime / 2.6, 1);
          signalPacketMat.opacity = Math.sin((seqTime / 3.8) * Math.PI);
          const pt = pathCurve.getPointAt(pathT);
          signalPacket.position.copy(pt);

          // 2. Hotspot activation towards end of traversal (seqTime > 2.0)
          if (seqTime > 2.0) {
            const highlightIntensity = Math.sin(((seqTime - 2.0) / 1.8) * Math.PI);
            const ringScale = 1 + highlightIntensity * 0.35;
            hotspotRing.scale.set(ringScale, ringScale, ringScale);
            ringMat.opacity = 0.4 + highlightIntensity * 0.55;
            hotspotLight.intensity = 1.4 + highlightIntensity * 1.5;
            if (hotspotHeadMesh) {
              (hotspotHeadMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + highlightIntensity * 0.6;
            }
          } else {
            hotspotRing.scale.set(1, 1, 1);
            ringMat.opacity = 0.4;
            hotspotLight.intensity = 1.4;
          }
        } else {
          // CALM RESTING MONITORING INTERVAL
          if (lastActiveState) {
            lastActiveState = false;
            setIsHotspotActive(false);
          }
          signalPacketMat.opacity = 0;
          hotspotRing.scale.set(1, 1, 1);
          ringMat.opacity = 0.25;
          hotspotLight.intensity = 1.2;
          if (hotspotHeadMesh) {
            (hotspotHeadMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
          }
        }

        // Very slow ambient particle drift
        particleCloud.rotation.y = elapsedTime * 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      mediaQuery.removeEventListener('change', handleMotionChange);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();

      terrainGeo.dispose();
      terrainMat.dispose();
      wireframeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      signalPacketGeo.dispose();
      signalPacketMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="intel-field-frame">
      {/* 1. Header Bar: Pipeline Flow & Demo Telemetry Status */}
      <div className="intel-field-header">
        <div className="intel-pipeline-flow">
          <span className="intel-flow-step">CITY ZONES</span>
          <span className="intel-flow-arrow">→</span>
          <span className="intel-flow-step">SIGNALS</span>
          <span className="intel-flow-arrow">→</span>
          <span className="intel-flow-step">RISK PATTERNS</span>
          <span className="intel-flow-arrow">→</span>
          <span className={`intel-flow-step ${isHotspotActive ? 'active' : ''}`}>
            <span className="intel-flow-dot" />
            PREDICTIVE HOTSPOTS
          </span>
          <span className="intel-flow-arrow">→</span>
          <span className="intel-flow-step">PREVENTIVE ACTION</span>
        </div>

        <div className="intel-header-meta">
          <span className="intel-badge-demo">DEMO SIGNALS</span>
          <div className="intel-telemetry-status">
            <span className="intel-live-indicator" />
            <span>SIMULATED SIGNALS</span>
          </div>
        </div>
      </div>

      {/* 2. 3D WebGL Canvas Area */}
      <div className={`intel-canvas-wrap ${isReady ? 'is-ready' : 'is-loading'}`} ref={mountRef}>
        {reducedMotion && (
          <div className="intel-fallback-scene">
            <div className="intel-spec-caption">
              PREDICTIVE FIELD • REDUCED MOTION ACTIVE
            </div>
          </div>
        )}

        {/* DOM Overlay: Hotspot inspection tags */}
        <div className="intel-overlay-nodes">
          <div className={`intel-tag-hotspot ${isHotspotActive ? 'is-active-prediction' : ''}`}>
            <div className="intel-tag-header">
              <span className="intel-tag-zone">ZONE Z-07</span>
              <span className="intel-tag-score">88 RISK</span>
            </div>
            <span className="intel-tag-sub">
              {isHotspotActive ? 'PREDICTED CRITICAL HOTSPOT • DAY +2' : 'BASELINE TELEMETRY MONITORING'}
            </span>
          </div>

          <div className="intel-tag-secondary">
            <div className="intel-zone-row">
              <span className="intel-zone-label">ZONE Z-12</span>
              <span className="intel-zone-risk intel-risk-mod">72 RISK</span>
            </div>
            <div className="intel-zone-row">
              <span className="intel-zone-label">ZONE Z-03</span>
              <span className="intel-zone-risk intel-risk-low">34 RISK</span>
            </div>
          </div>

          <div className="intel-grid-watermark">
            COORD GRID: 33.8688° S, 151.2093° E<br />
            TERRAIN MESH: PROCEDURAL FACET
          </div>
        </div>
      </div>

      {/* 3. Footer Telemetry Bar */}
      <div className="intel-field-footer">
        <div className="intel-horizon-pill">
          <span>PREDICTION HORIZON:</span>
          <span className="intel-horizon-val">7 DAYS</span>
        </div>
        <div className="intel-spec-caption">
          <strong className="text-synthetic">SYNTHETIC</strong> OPERATIONAL TOPOGRAPHY
        </div>
      </div>
    </div>
  );
}
