'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ModelMetrics, PrintConfig } from '@/lib/types';
import { calculateVolumeAndMetrics } from '@/lib/stl-utils';
import {
  RotateCcw,
  Maximize2,
  Box,
  Layers,
  Eye,
  Sliders,
  Sparkles,
  Scissors,
} from 'lucide-react';

interface Props {
  file: File | null;
  fileUrl?: string;
  config: PrintConfig;
  onMetricsCalculated?: (metrics: ModelMetrics) => void;
  onSliceLayerChange?: (currentLayer: number, totalLayers: number) => void;
}

export const Viewer3D: React.FC<Props> = ({
  file,
  fileUrl,
  config,
  onMetricsCalculated,
  onSliceLayerChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [slicerMode, setSlicerMode] = useState<boolean>(false);
  const [sliceProgress, setSliceProgress] = useState<number>(100); // 0 to 100%
  const [totalLayers, setTotalLayers] = useState<number>(100);
  const [currentLayer, setCurrentLayer] = useState<number>(100);
  const [modelHeightMm, setModelHeightMm] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const clippingPlaneRef = useRef<THREE.Plane | null>(null);
  const bboxHelperRef = useRef<THREE.Box3Helper | null>(null);
  const infillLinesRef = useRef<THREE.LineSegments | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Clean Palantir light grey-white
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(160, 160, 200);
    cameraRef.current = camera;

    // Renderer with shadow & local clipping enabled
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't dip beneath print bed
    controls.minDistance = 20;
    controls.maxDistance = 800;
    controlsRef.current = controls;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(150, 250, 150);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 0.4);
    dirLight2.position.set(-150, 100, -150);
    scene.add(dirLight2);

    // 3D Print Bed Plate (256mm x 256mm Bambu / Prusa MK4 build plate)
    const bedSize = 256;
    const gridHelper = new THREE.GridHelper(bedSize, 25.6, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Bed surface disc/plane
    const bedGeo = new THREE.BoxGeometry(bedSize, 1, bedSize);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.1,
    });
    const bedMesh = new THREE.Mesh(bedGeo, bedMat);
    bedMesh.position.y = -0.5;
    bedMesh.receiveShadow = true;
    scene.add(bedMesh);

    // Clipping plane for Slicer simulation (cuts downwards from top)
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 200);
    clippingPlaneRef.current = clippingPlane;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update auto-rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Load and parse STL model
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean up previous mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current = null;
    }
    if (bboxHelperRef.current) {
      scene.remove(bboxHelperRef.current);
      bboxHelperRef.current = null;
    }
    if (infillLinesRef.current) {
      scene.remove(infillLinesRef.current);
      infillLinesRef.current = null;
    }

    if (!file && !fileUrl) return;

    setLoading(true);
    const loader = new STLLoader();

    const processGeometry = (geometry: THREE.BufferGeometry) => {
      geometry.computeVertexNormals();

      // Center geometry horizontally and place bottom on ground (Z=0)
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox!;
      const center = new THREE.Vector3();
      bbox.getCenter(center);

      const heightMm = bbox.max.z - bbox.min.z;
      // In Three.js, Y is typically Up. Many STLs are modeled with Z Up.
      // We orient so the model rests naturally flat on the print bed Y=0
      geometry.center();
      geometry.computeBoundingBox();
      const centeredBbox = geometry.boundingBox!;
      const offsetY = -centeredBbox.min.y;
      geometry.translate(0, offsetY, 0);

      // Re-calculate after orientation
      const metrics = calculateVolumeAndMetrics(geometry);
      setModelHeightMm(metrics.dimensionsMm.z);

      // Total layer calculation based on selected layer height (default 0.2mm)
      const layerH = 0.2;
      const calculatedLayers = Math.max(1, Math.ceil(metrics.dimensionsMm.z / layerH));
      setTotalLayers(calculatedLayers);
      setCurrentLayer(calculatedLayers);
      setSliceProgress(100);

      if (onMetricsCalculated) {
        onMetricsCalculated(metrics);
      }
      if (onSliceLayerChange) {
        onSliceLayerChange(calculatedLayers, calculatedLayers);
      }

      // Material for 3D model
      const materialColor = getColorHex(config.color);
      const material = new THREE.MeshStandardMaterial({
        color: materialColor,
        roughness: 0.35,
        metalness: 0.1,
        wireframe: wireframe,
        clippingPlanes: slicerMode && clippingPlaneRef.current ? [clippingPlaneRef.current] : [],
        clipShadows: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshRef.current = mesh;

      // Adjust camera to fit model nicely
      if (cameraRef.current && controlsRef.current) {
        const maxDim = Math.max(
          metrics.dimensionsMm.x,
          metrics.dimensionsMm.y,
          metrics.dimensionsMm.z
        );
        const fov = cameraRef.current.fov * (Math.PI / 180);
        let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.9;
        cameraDistance = Math.max(80, Math.min(cameraDistance, 500));

        cameraRef.current.position.set(cameraDistance * 0.8, cameraDistance * 0.7, cameraDistance * 0.8);
        controlsRef.current.target.set(0, metrics.dimensionsMm.z / 2, 0);
        controlsRef.current.update();
      }

      // Initial clipping plane setting at top of model
      if (clippingPlaneRef.current) {
        clippingPlaneRef.current.constant = metrics.dimensionsMm.z + 10;
      }

      setLoading(false);
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const geometry = loader.parse(buffer);
          processGeometry(geometry);
        } catch (err) {
          console.error('Error parsing STL file:', err);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileUrl) {
      loader.load(
        fileUrl,
        (geometry) => {
          processGeometry(geometry);
        },
        undefined,
        (err) => {
          console.error('Error loading STL from URL:', err);
          setLoading(false);
        }
      );
    }
  }, [file, fileUrl]);

  // Update material color and wireframe dynamically
  useEffect(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.set(getColorHex(config.color));
    mat.wireframe = wireframe;
    mat.needsUpdate = true;
  }, [config.color, wireframe]);

  // Update Slicer Clipping Plane and Layer slider
  useEffect(() => {
    if (!meshRef.current || !clippingPlaneRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;

    if (slicerMode) {
      mat.clippingPlanes = [clippingPlaneRef.current];
      // Calculate Z height of the cut
      const zCut = (modelHeightMm * sliceProgress) / 100;
      clippingPlaneRef.current.constant = Math.max(0.1, zCut);

      const layer = Math.max(1, Math.round((totalLayers * sliceProgress) / 100));
      setCurrentLayer(layer);
      if (onSliceLayerChange) {
        onSliceLayerChange(layer, totalLayers);
      }
    } else {
      mat.clippingPlanes = [];
      clippingPlaneRef.current.constant = modelHeightMm + 50;
      setCurrentLayer(totalLayers);
    }
    mat.needsUpdate = true;
  }, [slicerMode, sliceProgress, modelHeightMm, totalLayers]);

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(160, 160, 200);
      controlsRef.current.target.set(0, modelHeightMm / 2, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-mono font-semibold text-slate-800 tracking-wider">
            ANALYZING 3D GEOMETRY...
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1">
            Calculating volumetric mesh & dimensions
          </span>
        </div>
      )}

      {/* No model loaded placeholder */}
      {!file && !fileUrl && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <div className="w-14 h-14 rounded border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 mb-3 shadow-technical">
            <Box className="w-7 h-7 stroke-[1.5]" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Awaiting 3D Model Input
          </p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Drag & drop an STL file or choose one of our verified sample models to view, slice, and quote.
          </p>
        </div>
      )}

      {/* Top Floating Control Bar (Palantir White Technical HUD) */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Left: View Modes */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur border border-slate-200 p-1 rounded shadow-technical pointer-events-auto">
          <button
            onClick={() => setSlicerMode(!slicerMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
              slicerMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle Slicer Layer Cutting Simulator"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>SLICER VIEW</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded transition-colors ${
              wireframe ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle Wireframe Mesh"
          >
            <Box className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded transition-colors ${
              autoRotate ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Auto Rotate 360"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetCamera}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="Reset Camera Center"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Technical Stats Badge */}
        {modelHeightMm > 0 && (
          <div className="hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur border border-slate-200 px-3 py-1.5 rounded shadow-technical text-[11px] font-mono text-slate-700">
            <div>
              <span className="text-slate-400">BED:</span> 256×256 mm
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div>
              <span className="text-slate-400">HEIGHT:</span> {modelHeightMm.toFixed(1)} mm
            </div>
          </div>
        )}
      </div>

      {/* Slicer Layer Preview Slider (Bottom Bar) */}
      {slicerMode && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-slate-300 p-3 rounded-lg shadow-lg z-10 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-900 tracking-wider">
                LAYER SLICER SIMULATION
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Layer {currentLayer} of {totalLayers}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-600">
              Z = {((modelHeightMm * sliceProgress) / 100).toFixed(2)} mm
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400">LAYER 1</span>
            <input
              type="range"
              min="1"
              max="100"
              value={sliceProgress}
              onChange={(e) => setSliceProgress(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] font-mono text-slate-400">TOP</span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            <span>Pattern: {config.infillPattern.toUpperCase()} ({config.infillPercent}%)</span>
            <span>Layer Resolution: {config.quality}</span>
            <span className="text-blue-600">Cut-Plane Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

function getColorHex(colorName: string): number {
  const map: Record<string, number> = {
    'Pure White': 0xf8fafc,
    'White': 0xf1f5f9,
    'Matte Black': 0x1e293b,
    'Black': 0x0f172a,
    'Jet Black': 0x020617,
    'Industrial Grey': 0x64748b,
    'Steel Grey': 0x475569,
    'Matte Grey': 0x64748b,
    'Galaxy Blue': 0x2563eb,
    'Translucent Blue': 0x38bdf8,
    'Forest Green': 0x059669,
    'Fire Red': 0xdc2626,
    'Vibrant Red': 0xef4444,
    'Sunset Orange': 0xea580c,
    'Safety Orange': 0xf97316,
    'Translucent Clear': 0xe2e8f0,
    'Translucent White': 0xe0e7ff,
    'Dental Beige': 0xfef3c7,
    'Clear Amber': 0xd97706,
    'Onyx Black': 0x111827,
  };
  return map[colorName] || 0x3b82f6;
}
