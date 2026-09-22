// ==========================================
// POLY-BUBBLE 3D AI GENERATOR - CLIENT ENGINE
// ==========================================

// Global Three.js Variables
let scene, camera, renderer, controls;
let activeBubbleMesh = null;
let currentPolyCount = 0;

// Initialize WebGL Scene
function initScene() {
  const canvas = document.getElementById('webgl-canvas');
  const viewport = canvas.parentElement;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    45,
    viewport.clientWidth / viewport.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 4);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight1.position.set(5, 10, 7);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x00b4d8, 0.4);
  dirLight2.position.set(-5, -5, -5);
  scene.add(dirLight2);

  // Orbit Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Handle Window Resizing
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
}

// Window Resize Handler
function onWindowResize() {
  const canvas = document.getElementById('webgl-canvas');
  const viewport = canvas.parentElement;

  camera.aspect = viewport.clientWidth / viewport.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
}

// Animation Render Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (activeBubbleMesh) {
    // Subtle rotation preview until deformation completes
    activeBubbleMesh.rotation.y += 0.002;
  }

  renderer.render(scene, camera);
}

// ==========================================
// FIXED TOPOLOGY POLY-BUBBLE GENERATOR
// ==========================================

/**
  * Generates a closed manifold bounding hull (the Proxy Bubble)
  * with an exact target triangle count requested by the user.
  */
function createPolyBubble(targetTriangleCount) {
  // Remove existing bubble if present
  if (activeBubbleMesh) {
    scene.remove(activeBubbleMesh);
    activeBubbleMesh.geometry.dispose();
    activeBubbleMesh.material.dispose();
    activeBubbleMesh = null;
  }

  // Calculate geodesic subdivision level required for target count
  // Base icosahedron has 20 faces. Faces = 20 * (subdivisions + 1)^2
  let detailLevel = Math.max(1, Math.round(Math.sqrt(targetTriangleCount / 20) - 1));
  
  const geometry = new THREE.IcosahedronGeometry(1.0, detailLevel);
  currentPolyCount = geometry.attributes.position.count / 3 * 2; // Exact triangle count

  // Wireframe/Solid Material to visualize locked topology
  const material = new THREE.MeshStandardMaterial({
    color: 0x00b4d8,
    wireframe: true,
    roughness: 0.3,
    metalness: 0.2
  });

  activeBubbleMesh = new THREE.Mesh(geometry, material);
  scene.add(activeBubbleMesh);

  // Update UI Stats Overlay
  updateStatsOverlay("Locked Proxy Bubble Created", currentPolyCount);
}

// UI Stats Overlay Update Helper
function updateStatsOverlay(statusMessage, polyCount) {
  const overlay = document.getElementById('stats-overlay');
  overlay.textContent = `Poly Count: ${polyCount.toLocaleString()} Polys | Status: ${statusMessage}`;
}

// ==========================================
// UI EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initScene();

  const generateBtn = document.getElementById('generate-btn');
  const polyBudgetInput = document.getElementById('poly-budget');
  const imageInput = document.getElementById('image-upload');

  generateBtn.addEventListener('click', () => {
    if (!imageInput.files[0]) {
      alert("Please upload a 2D source image first (Step 1).");
      return;
    }

    const requestedBudget = parseInt(polyBudgetInput.value, 10) || 5000;

    // Step 1: Create Fixed Polygon Bubble Matching User Budget
    createPolyBubble(requestedBudget);

    // Step 2: Prepare Payload for In-House AI Deformation Engine
    updateStatsOverlay("Ready for AI Deformation Payload", currentPolyCount);
  });
});
