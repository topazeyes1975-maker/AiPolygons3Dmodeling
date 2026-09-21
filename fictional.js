// ==========================================
// FILE: mythical.js
// Mythological & Hybrid Creature Generators
// (Human Upper Body, Dragon, Centaur, Lamia, Chimera)
// ==========================================

// ==========================================
// SHARED DETAILED HUMAN UPPER BODY BUILDER
// ==========================================
function buildHumanUpperBody(promptText, skinMaterial, clothingMaterial, bodyRadSegs, bodyHSegs, legSegs, targetBudget = 6000) {
  const humanGroup = new THREE.Group();
  const text = promptText ? promptText.toLowerCase() : '';
  
  const isDefaultCentaur = text.includes('centaur') && !text.includes('female') && !text.includes('woman') && !text.includes('girl');
  const isDefaultLamia = (text.includes('lamia') || text.includes('snake')) && !text.includes('male') && !text.includes('man');

  const isFemale = text.includes('female') || text.includes('woman') || text.includes('girl') || text.includes('doll') || isDefaultLamia;
  const isBaby = text.includes('baby') || text.includes('child') || text.includes('infant');
  const isMale = !isFemale && !isBaby && (text.includes('male') || text.includes('man') || text.includes('guy') || text.includes('manikin') || text === '' || isDefaultCentaur);

  let headSize = isBaby ? 1.15 : 1.0;
  let shoulderX = isFemale ? 0.15 : (isMale ? 0.125 : (isBaby ? 0.11 : 0.075));
  const baseShift = isBaby ? -0.60 : (isMale ? -0.88 : -0.95);

  const jointMat = new THREE.MeshStandardMaterial({ color: 0xebd2be, roughness: 0.4, flatShading: true });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.6, flatShading: true });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const eyePupilMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
  const browMat = new THREE.MeshStandardMaterial({ color: 0x3a2518, roughness: 0.8 });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xd96b75, roughness: 0.3 });

  function applyQuadrantUVs(geom, uMin, vMin, uMax, vMax) {
    if (typeof remapUVs === 'function') {
      remapUVs(geom, uMin, vMin, uMax, vMax);
    }
  }

  function addSegment(geom, mat, pos, rot = [0, 0, 0], name = "", uMin = 0.0, vMin = 0.5, uMax = 0.5, vMax = 1.0) {
    applyQuadrantUVs(geom, uMin, vMin, uMax, vMax);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos[0], pos[1] + baseShift, pos[2]);
    mesh.rotation.set(...rot);
    if (name) mesh.name = name;
    humanGroup.add(mesh);
    return mesh;
  }

  // 1. Head Position
  const headY = isBaby ? 0.98 : (isFemale ? 1.55 : 1.37);
  const headGeom = new THREE.SphereGeometry(0.14 * headSize, bodyRadSegs, bodyRadSegs);
  headGeom.scale(0.85, 1.1, 0.9);

  const pos = headGeom.attributes.position;
  if (pos) {
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if (z > 0.05 && y > -0.02 && y < 0.06) {
        const distL = Math.hypot(x - (-0.045 * headSize), y - (0.015 * headSize));
        const distR = Math.hypot(x - (0.045 * headSize), y - (0.015 * headSize));
        const minDist = Math.min(distL, distR);
        const socketRadius = 0.04 * headSize;
        if (minDist < socketRadius) {
          pos.setZ(i, z - (1 - minDist / socketRadius) * 0.025 * headSize);
        }
      }
    }
    headGeom.computeVertexNormals();
  }
  addSegment(headGeom, skinMaterial, [0, headY, 0], [0, 0, 0], "Human_Head", 0.5, 0.5, 1.0, 1.0);

  // Facial Features
  const eyeRadius = 0.02 * headSize;
  const faceYOffset = headY - (isBaby ? 0.98 : (isFemale ? 1.55 : 1.37));

  [-1, 1].forEach(side => {
    const xBase = side * 0.045 * headSize;
    const yBase = (isBaby ? 0.995 : (isFemale ? 1.565 : 1.385)) + faceYOffset;
    const zBase = 0.114 * headSize;
    const rotY = side * 0.12;

    const eyeWhiteGeom = new THREE.SphereGeometry(eyeRadius, 16, 16);
    eyeWhiteGeom.scale(1.2, 0.65, 0.3);
    addSegment(eyeWhiteGeom, eyeWhiteMat, [xBase, yBase, zBase], [0, rotY, 0], "", 0.5, 0.5, 1.0, 1.0);

    const pupilGeom = new THREE.SphereGeometry(eyeRadius * 0.5, 12, 12);
    pupilGeom.scale(0.8, 0.95, 0.2);
    addSegment(pupilGeom, eyePupilMat, [xBase, yBase, zBase + 0.005], [0, rotY, 0], "", 0.5, 0.5, 1.0, 1.0);

    const eyelidGeom = new THREE.TorusGeometry(0.026 * headSize, 0.003 * headSize, 8, bodyRadSegs, Math.PI * 0.7);
    addSegment(eyelidGeom, skinMaterial, [xBase, yBase - 0.01 * headSize, zBase + 0.006], [0, rotY, 0.5], "", 0.5, 0.5, 1.0, 1.0);

    const botEyelidGeom = new THREE.TorusGeometry(0.026 * headSize, 0.003 * headSize, 8, bodyRadSegs, Math.PI * 0.7);
    addSegment(botEyelidGeom, skinMaterial, [xBase, yBase + 0.013 * headSize, zBase + 0.006], [0, rotY, -2.7], "", 0.5, 0.5, 1.0, 1.0);

    const browGeom = new THREE.RingGeometry(0.018 * headSize, 0.022 * headSize, 8, 1, 0, Math.PI);
    addSegment(browGeom, browMat, [xBase, yBase + 0.012 * headSize, zBase + 0.003], [0.15, rotY, side * 0.25], "", 0.5, 0.5, 1.0, 1.0);

    const earGeom = new THREE.SphereGeometry(0.02 * headSize, bodyRadSegs, bodyRadSegs);
    earGeom.scale(0.35, 1.2, 0.85);
    addSegment(earGeom, skinMaterial, [side * 0.118 * headSize, (isBaby ? 0.97 : (isFemale ? 1.54 : 1.36)) + faceYOffset, -0.005 * headSize], [0.1, 0, 0], "", 0.5, 0.5, 1.0, 1.0);
  });
  
  addSegment(new THREE.ConeGeometry(0.012 * headSize, 0.03 * headSize, bodyRadSegs), skinMaterial, [0, (isBaby ? 0.96 : (isFemale ? 1.53 : 1.35)) + faceYOffset, 0.122 * headSize], [0.3, 0, 0], "", 0.3, 0.5, 1.0, 1.0);
  addSegment(new THREE.TorusGeometry(0.015 * headSize, 0.003 * headSize, 8, bodyRadSegs, Math.PI), lipMat, [0, (isBaby ? 0.922 : (isFemale ? 1.492 : 1.312)) + faceYOffset, 0.116 * headSize], [Math.PI * 0.55, 0, 0], "", 0.5, 0.5, 1.0, 1.0);
  addSegment(new THREE.TorusGeometry(0.014 * headSize, 0.0032 * headSize, 8, bodyRadSegs, Math.PI), lipMat, [0, (isBaby ? 0.914 : (isFemale ? 1.484 : 1.304)) + faceYOffset, 0.116 * headSize], [Math.PI * 0.45, 0, 0], "", 0.5, 0.5, 1.0, 1.0);

  if (isFemale || isBaby) {
    const topHairGeom = new THREE.SphereGeometry(0.144 * headSize, bodyRadSegs, bodyRadSegs, 0, Math.PI * 2, 0, Math.PI * 0.45);
    topHairGeom.scale(0.86, 1.02, 0.91);
    addSegment(topHairGeom, hairMat, [0, (isBaby ? 1.00 : 1.57) + faceYOffset, -0.005], [0,0,0], "", 0.5, 0.5, 1.0, 1.0);

    if (isFemale) {
      const backHairGeom = new THREE.CylinderGeometry(0.125 * headSize, 0.145 * headSize, 0.20, bodyRadSegs, bodyHSegs, true, Math.PI * 0.25, Math.PI * 1.5);
      addSegment(backHairGeom, hairMat, [0, 1.53 + faceYOffset, -0.01], [0.05, 0, 0], "", 0.5, 0.5, 1.0, 1.0);

      addSegment(new THREE.CylinderGeometry(0.035 * headSize, 0.01 * headSize, 0.20, bodyRadSegs), hairMat, [-0.095 * headSize, 1.50 + faceYOffset, 0.04 * headSize], [0.1, 0, -0.18], "", 0.5, 0.5, 1.0, 1.0);
      addSegment(new THREE.CylinderGeometry(0.035 * headSize, 0.01 * headSize, 0.20, bodyRadSegs), hairMat, [0.095 * headSize, 1.50 + faceYOffset, 0.04 * headSize], [0.1, 0, 0.18], "", 0.5, 0.5, 1.0, 1.0);
    }
  }

  // 2. Neck
  const neckY = isBaby ? 0.87 : (isFemale ? 1.42 : 1.20);
  const neckHeight = isBaby ? 0.24 : 0.14;
  addSegment(new THREE.CylinderGeometry(isBaby ? 0.032 : 0.035, isBaby ? 0.035 : 0.04, neckHeight, bodyRadSegs), skinMaterial, [0, neckY, 0], [0, 0, 0], "Human_Neck", 0.0, 0.5, 0.5, 1.0);

  // 3. Torso
  if (isBaby) {
    addSegment(new THREE.SphereGeometry(0.095, bodyRadSegs, bodyRadSegs).scale(1.1, 0.9, 1.15), skinMaterial, [0, 0.70, 0], [0,0,0], "Baby_UpperChest", 0.0, 0.5, 0.5, 1.0);
  } else if (isMale) {
    const chestGeom = new THREE.CylinderGeometry(0.12, 0.098, 0.14, bodyRadSegs, bodyHSegs);
    chestGeom.scale(1.15, 1.0, 0.9);
    addSegment(chestGeom, skinMaterial, [0, 1.12, 0], [0, 0, 0], "Male_Chest_Base", 0.0, 0.5, 0.5, 1.0);

    const pecGeom = new THREE.SphereGeometry(0.052, bodyRadSegs, bodyRadSegs);
    pecGeom.scale(1.3, 0.75, 1.15);
    addSegment(pecGeom, skinMaterial, [-0.052, 1.14, 0.062], [0.25, -0.15, 0.05], "Male_Pec_L", 0.0, 0.5, 0.5, 1.0);
    addSegment(pecGeom, skinMaterial, [0.052, 1.14, 0.062], [0.25, 0.15, -0.05], "Male_Pec_R", 0.0, 0.5, 0.5, 1.0);
  } else {
    addSegment(new THREE.CylinderGeometry(shoulderX * 0.85, 0.085, 0.20, bodyRadSegs, bodyHSegs).scale(1.15, 1.0, 0.9), skinMaterial, [0, 1.25, 0], [0,0,0], "Human_Chest", 0.0, 0.5, 0.5, 1.0);

    const bustGeom = new THREE.SphereGeometry(0.06, bodyRadSegs, bodyRadSegs);
    bustGeom.scale(1.1, 0.9, 1.1);
    addSegment(bustGeom, skinMaterial, [-0.055, 1.26, 0.07], [0.15, -0.08, 0], "Human_Bust_L", 0.0, 0.5, 0.5, 1.0);
    addSegment(bustGeom, skinMaterial, [0.055, 1.26, 0.07], [0.15, 0.08, 0], "Human_Bust_R", 0.0, 0.5, 0.5, 1.0);
  }

  // 4. Midsection
  if (!isBaby) {
    const midY = isMale ? 0.95 : 1.04;
    const midGeom = new THREE.CylinderGeometry(0.085, 0.082, 0.22, bodyRadSegs, bodyHSegs);
    midGeom.scale(1.1, 1.0, 0.9);
    addSegment(midGeom, skinMaterial, [0, midY, 0], [0, 0, 0], "Human_Midsection", 0.0, 0.5, 0.5, 1.0);

    if (isMale) {
      const absRows = 3;
      for (let r = 0; r < absRows; r++) {
        const absGeom = new THREE.SphereGeometry(0.022, 8, 8);
        absGeom.scale(1.1, 0.6, 0.8);
        const rowY = midY + 0.06 - (r * 0.055);
        [-1, 1].forEach(side => {
          addSegment(absGeom, skinMaterial, [side * 0.025, rowY, 0.068], [0.1, 0, 0], `Ab_Muscle_${r}_${side}`, 0.0, 0.5, 0.5, 1.0);
        });
      }
    }
  }

  // 5. Arms & Hands
  const armAngle = 0.75;
  [-1, 1].forEach(side => {
    const xJoint = side * shoulderX;
    const yJoint = isBaby ? 0.71 : (isMale ? 1.12 : 1.32);

    addSegment(new THREE.SphereGeometry(isBaby ? 0.038 : 0.046, bodyRadSegs, bodyRadSegs).scale(0.9, 1.1, 0.9), skinMaterial, [xJoint, yJoint + 0.01, 0], [0, 0, side * -0.15], "", 0.0, 0.0, 0.5, 0.5);
    addSegment(new THREE.SphereGeometry(isBaby ? 0.028 : 0.034, bodyRadSegs, bodyRadSegs), jointMat, [xJoint, yJoint, 0], [0,0,0], "", 0.0, 0.0, 0.5, 0.5);

    const armLen = isBaby ? 0.14 : 0.25;
    const dxUpper = Math.sin(armAngle) * (armLen / 2) * side;
    const dyUpper = Math.cos(armAngle) * (armLen / 2);
    addSegment(new THREE.CylinderGeometry(isBaby ? 0.032 : 0.032, isBaby ? 0.026 : 0.026, armLen, bodyRadSegs, bodyHSegs), skinMaterial, [xJoint + dxUpper, yJoint - dyUpper, 0], [0, 0, side * armAngle], "", 0.0, 0.0, 0.5, 0.5);

    const elbowX = xJoint + Math.sin(armAngle) * armLen * side;
    const elbowY = yJoint - Math.cos(armAngle) * armLen;
    addSegment(new THREE.SphereGeometry(isBaby ? 0.022 : 0.026, bodyRadSegs, bodyRadSegs), jointMat, [elbowX, elbowY, 0], [0,0,0], "", 0.0, 0.0, 0.5, 0.5);

    const forearmLen = isBaby ? 0.13 : 0.24;
    const dxLower = Math.sin(armAngle) * (forearmLen / 2) * side;
    const dyLower = Math.cos(armAngle) * (forearmLen / 2);
    addSegment(new THREE.CylinderGeometry(isBaby ? 0.026 : 0.026, isBaby ? 0.02 : 0.02, forearmLen, bodyRadSegs, bodyHSegs), skinMaterial, [elbowX + dxLower, elbowY - dyLower, 0], [0, 0, side * armAngle], "", 0.0, 0.0, 0.5, 0.5);

    const handX = elbowX + Math.sin(armAngle) * forearmLen * side;
    const handY = elbowY - Math.cos(armAngle) * forearmLen;
    addSegment(new THREE.BoxGeometry(0.022, 0.045, 0.014), skinMaterial, [handX, handY, 0], [0, 0, side * armAngle], "", 0.0, 0.0, 0.5, 0.5);
  });

  return humanGroup;
}


// ==========================================
// DRAGON MODEL FUNCTION (ORGANIC VERTEX SCULPTING)
// ==========================================
function buildDragonModel(promptText, parentGroup, targetBudget = 6000) {
  const targetGroup = parentGroup || (typeof modelGroup !== 'undefined' ? modelGroup : null);
  if (!targetGroup) return;

  // Dynamic Polygon Scaling across any user target budget
  const budgetScale = Math.sqrt(Math.max(300, targetBudget) / 6000);
  const bodyRadSegs = Math.max(8, Math.round(24 * budgetScale));
  const bodyHSegs = Math.max(6, Math.round(18 * budgetScale));
  const legSegs = Math.max(6, Math.round(12 * budgetScale));

  // Solid, clean materials using flatShading to force crisp low-poly polygon facets
  const dragonMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.5, flatShading: true });
  const bellyMaterial = new THREE.MeshStandardMaterial({ color: 0xc2b280, roughness: 0.6, flatShading: true });
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.4, side: THREE.DoubleSide, flatShading: true });
  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.3, flatShading: true });

  // --- 1. ORGANIC SCULPTED DRAGON TORSO ---
  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.32, 1.4, bodyRadSegs, bodyHSegs);
  bodyGeo.rotateX(Math.PI / 2);

  // Deform vertices to sculpt chest, belly, and spine directly inside polygon boundary
  const bodyPos = bodyGeo.attributes.position;
  for (let i = 0; i < bodyPos.count; i++) {
    let x = bodyPos.getX(i);
    let y = bodyPos.getY(i);
    let z = bodyPos.getZ(i);

    // Taper near neck/tail, widen chest
    const progress = (z + 0.7) / 1.4; // 0 to 1 along length
    const ribExpansion = Math.sin(progress * Math.PI) * 0.25;
    x *= (1 + ribExpansion);

    // Expand chest downward (Belly ridge)
    if (y < 0 && z > 0) {
      y *= 1.35;
    }
    // Spinal ridge along top
    if (y > 0.15) {
      y += Math.sin(z * 12) * 0.02;
    }

    bodyPos.setXYZ(i, x, y, z);
  }
  bodyGeo.computeVertexNormals();
  if (typeof remapUVs === 'function') remapUVs(bodyGeo, 0.0, 0.5, 0.5, 1.0);

  const bodyMesh = new THREE.Mesh(bodyGeo, dragonMaterial);
  bodyMesh.position.set(0, 0.5, 0);
  targetGroup.add(bodyMesh);

  // --- 2. SCULPTED HEAD & SNAUT ---
  const headGroup = new THREE.Group();
  
  const craniumGeo = new THREE.SphereGeometry(0.18, bodyRadSegs, bodyRadSegs);
  craniumGeo.scale(0.85, 0.9, 1.2);
  const craniumMesh = new THREE.Mesh(craniumGeo, dragonMaterial);
  headGroup.add(craniumMesh);

  // Snout deforms into realistic reptilian jaw
  const snoutGeo = new THREE.ConeGeometry(0.14, 0.45, bodyRadSegs);
  snoutGeo.rotateX(Math.PI / 2);
  const snoutPos = snoutGeo.attributes.position;
  for (let i = 0; i < snoutPos.count; i++) {
    let y = snoutPos.getY(i);
    if (y < 0) snoutPos.setY(i, y * 0.6); // Flatten bottom jaw
  }
  snoutGeo.computeVertexNormals();
  
  const snoutMesh = new THREE.Mesh(snoutGeo, dragonMaterial);
  snoutMesh.position.set(0, -0.03, 0.35);
  headGroup.add(snoutMesh);

  // Horns
  [-0.09, 0.09].forEach(xOffset => {
    const hornGeo = new THREE.ConeGeometry(0.04, 0.38, 8);
    hornGeo.rotateX(-0.3);
    const horn = new THREE.Mesh(hornGeo, hornMaterial);
    horn.position.set(xOffset, 0.22, -0.05);
    headGroup.add(horn);
  });

  headGroup.position.set(0, 0.88, 0.65);
  targetGroup.add(headGroup);

  // --- 3. SCULPTED LEGS ---
  [[-0.24, 0.18, 0.42], [0.24, 0.18, 0.42], [-0.24, 0.18, -0.42], [0.24, 0.18, -0.42]].forEach(pos => {
    const legGeo = new THREE.CylinderGeometry(0.11, 0.06, 0.55, legSegs);
    const legMesh = new THREE.Mesh(legGeo, dragonMaterial);
    legMesh.position.set(pos[0], pos[1], pos[2]);
    targetGroup.add(legMesh);
  });

  // --- 4. WINGS ---
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.35, 1.0);
  wingShape.lineTo(0.90, 0.75);
  wingShape.lineTo(0.55, 0.20);
  wingShape.lineTo(1.0, 0.0);
  wingShape.closePath();

  const leftWingGeo = new THREE.ShapeGeometry(wingShape);
  const leftWing = new THREE.Mesh(leftWingGeo, wingMaterial);
  leftWing.position.set(0.15, 0.70, 0.15);
  leftWing.rotation.set(0.0, 0.5, -0.5);

  const rightWingGeo = new THREE.ShapeGeometry(wingShape);
  const rightWing = new THREE.Mesh(rightWingGeo, wingMaterial);
  rightWing.position.set(-0.15, 0.70, 0.15);
  rightWing.rotation.set(0.0, -0.5, 0.5);
  rightWing.scale.set(-1, 1, 1);

  targetGroup.add(leftWing, rightWing);

  // --- 5. TAPERED TAIL ---
  const tailSegments = Math.max(6, Math.round(10 * budgetScale));
  let currentZ = -0.68; 
  let currentY = 0.52;

  for (let i = 0; i < tailSegments; i++) {
    const t = 1 - (i / tailSegments);
    const dragonTailGeo = new THREE.ConeGeometry(0.22 * t, 0.22, bodyRadSegs);
    dragonTailGeo.rotateX(-Math.PI / 2);

    const tailMesh = new THREE.Mesh(dragonTailGeo, dragonMaterial);
    tailMesh.position.set(0, currentY, currentZ);
    targetGroup.add(tailMesh);
    currentZ -= (0.18 * (1 / budgetScale));
    currentY -= 0.015;
  }
}


// ==========================================
// CENTAUR MODEL FUNCTION
// ==========================================
function buildCentaurModel(promptText, parentGroup, targetBudget = 6000) {
  const targetGroup = parentGroup || (typeof modelGroup !== 'undefined' ? modelGroup : null);
  if (!targetGroup) return;

  const budgetScale = Math.sqrt(Math.max(300, targetBudget) / 6000);
  const bodyRadSegs = Math.max(8, Math.round(16 * budgetScale));
  const bodyHSegs = Math.max(4, Math.round(10 * budgetScale));
  const legSegs = Math.max(6, Math.round(12 * budgetScale));

  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.5, flatShading: true }); 
  const horseBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.4, flatShading: true }); 
  const clothingMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.5, flatShading: true }); 

  const horseBodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.4, bodyRadSegs, bodyHSegs);
  horseBodyGeo.rotateX(Math.PI / 2);
  const horseBodyMesh = new THREE.Mesh(horseBodyGeo, horseBodyMaterial);
  horseBodyMesh.position.set(0, 0.0, 0);
  targetGroup.add(horseBodyMesh);

  [[-0.18, -0.45, 0.45], [0.18, -0.45, 0.45], [-0.18, -0.45, -0.45], [0.18, -0.45, -0.45]].forEach(pos => {
    const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.65, legSegs);
    const legMesh = new THREE.Mesh(legGeo, horseBodyMaterial);
    legMesh.position.set(pos[0], pos[1], pos[2]);
    targetGroup.add(legMesh);
  });

  const centaurTailGeo = new THREE.ConeGeometry(0.07, 0.45, legSegs);
  centaurTailGeo.rotateX(Math.PI / 3);
  const centaurTailMesh = new THREE.Mesh(centaurTailGeo, horseBodyMaterial);
  centaurTailMesh.position.set(0, 0.20, -0.84); 
  targetGroup.add(centaurTailMesh);

  const humanGroup = buildHumanUpperBody(promptText, skinMaterial, clothingMaterial, bodyRadSegs, bodyHSegs, legSegs, targetBudget);
  humanGroup.position.set(0, 0.33, 0.64);
  targetGroup.add(humanGroup);
}

// ==========================================
// LAMIA / SNAKE-HUMAN MODEL FUNCTION
// ==========================================
function buildSnakeHumanModel(promptText, parentGroup, targetBudget = 6000) {
  const targetGroup = parentGroup || (typeof modelGroup !== 'undefined' ? modelGroup : null);
  if (!targetGroup) return;

  const budgetScale = Math.sqrt(Math.max(300, targetBudget) / 6000);
  const bodyRadSegs = Math.max(8, Math.round(16 * budgetScale));
  const bodyHSegs = Math.max(4, Math.round(10 * budgetScale));
  const legSegs = Math.max(6, Math.round(12 * budgetScale));

  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.5, flatShading: true });
  const snakeMaterial = new THREE.MeshStandardMaterial({ color: 0x1e4d2b, roughness: 0.4, flatShading: true });
  const clothingMaterial = new THREE.MeshStandardMaterial({ color: 0x483d8b, roughness: 0.5, flatShading: true });

  const totalSegments = Math.max(12, Math.round(20 * budgetScale));
  let currentY = -0.7;
  let topOfTailY = currentY;

  for (let i = 0; i < totalSegments; i++) {
    const progress = i / (totalSegments - 1);
    let radius = progress < 0.3 ? (0.02 + (progress / 0.3) * 0.16) : (0.18 - ((progress - 0.3) / 0.7) * 0.098);
    const segmentHeight = 0.12;
    const tailSegGeo = new THREE.CylinderGeometry(radius * 0.98, radius, segmentHeight, bodyRadSegs);
    const tailSegMesh = new THREE.Mesh(tailSegGeo, snakeMaterial);
    const curveFactor = Math.sin(progress * Math.PI);
    tailSegMesh.position.set(curveFactor * 0.28, currentY, curveFactor * 0.1);
    targetGroup.add(tailSegMesh);

    currentY += segmentHeight * 0.85; 
    topOfTailY = currentY;
  }

  const humanGroup = buildHumanUpperBody(promptText, skinMaterial, clothingMaterial, bodyRadSegs, bodyHSegs, legSegs, targetBudget);
  humanGroup.position.set(0, topOfTailY - 0.02, 0);
  targetGroup.add(humanGroup);
}

// ==========================================
// CHIMERA MODEL FUNCTION
// ==========================================
function buildChimeraModel(promptText, parentGroup, targetBudget = 6000) {
  const targetGroup = parentGroup || (typeof modelGroup !== 'undefined' ? modelGroup : null);
  if (!targetGroup) return;

  const budgetScale = Math.sqrt(Math.max(300, targetBudget) / 6000);
  const bodyRadSegs = Math.max(8, Math.round(16 * budgetScale));
  const bodyHSegs = Math.max(4, Math.round(10 * budgetScale));
  const legSegs = Math.max(6, Math.round(12 * budgetScale));

  const lionMaterial = new THREE.MeshStandardMaterial({ color: 0xc19a6b, roughness: 0.5, flatShading: true });
  const maneMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7, flatShading: true });
  const goatMaterial = new THREE.MeshStandardMaterial({ color: 0xd3d3d3, roughness: 0.6, flatShading: true });
  const hornMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, flatShading: true });
  const snakeMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.4, flatShading: true });

  const bodyGeo = new THREE.CylinderGeometry(0.26, 0.28, 1.2, bodyRadSegs, bodyHSegs);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMesh = new THREE.Mesh(bodyGeo, lionMaterial);
  bodyMesh.position.set(0, 0.1, 0);
  targetGroup.add(bodyMesh);

  [[-0.18, -0.35, 0.4], [0.18, -0.35, 0.4], [-0.18, -0.35, -0.4], [0.18, -0.35, -0.4]].forEach(pos => {
    const legGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.6, legSegs);
    const legMesh = new THREE.Mesh(legGeo, lionMaterial);
    legMesh.position.set(pos[0], pos[1], pos[2]);
    targetGroup.add(legMesh);
  });

  // Lion Head
  const lionHeadGroup = new THREE.Group();
  const lionSkullGeo = new THREE.SphereGeometry(0.13, bodyRadSegs, bodyRadSegs);
  lionSkullGeo.scale(1.0, 1.0, 1.3);
  const lionSkullMesh = new THREE.Mesh(lionSkullGeo, lionMaterial);
  lionHeadGroup.add(lionSkullMesh);

  const maneGeo = new THREE.SphereGeometry(0.16, bodyRadSegs, bodyRadSegs);
  maneGeo.scale(1.1, 1.1, 0.9);
  const maneMesh = new THREE.Mesh(maneGeo, maneMaterial);
  maneMesh.position.set(0, 0.02, -0.04);
  lionHeadGroup.add(maneMesh);

  [-1, 1].forEach(side => {
    const lionEarGeo = new THREE.ConeGeometry(0.04, 0.07, 8);
    lionEarGeo.rotateZ(Math.PI);
    const ear = new THREE.Mesh(lionEarGeo, lionMaterial);
    ear.position.set(side * 0.12, 0.12, -0.05);
    ear.rotation.z = side * 0.3;
    lionHeadGroup.add(ear);
  });

  lionHeadGroup.position.set(0, 0.45, 0.65);
  targetGroup.add(lionHeadGroup);

  // Goat Head
  const goatHeadGroup = new THREE.Group();
  const goatSkullGeo = new THREE.SphereGeometry(0.10, bodyRadSegs, bodyRadSegs);
  goatSkullGeo.scale(0.85, 0.9, 1.2);
  const goatSkullMesh = new THREE.Mesh(goatSkullGeo, goatMaterial);
  goatHeadGroup.add(goatSkullMesh);

  const goatMuzzleGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.15, bodyRadSegs);
  goatMuzzleGeo.rotateX(Math.PI / 2);
  const goatMuzzleMesh = new THREE.Mesh(goatMuzzleGeo, goatMaterial);
  goatMuzzleMesh.position.set(0, -0.02, 0.12);
  goatHeadGroup.add(goatMuzzleMesh);

  [-1, 1].forEach(side => {
    const hornGeo = new THREE.ConeGeometry(0.025, 0.20, 8);
    const horn = new THREE.Mesh(hornGeo, hornMaterial);
    horn.position.set(side * 0.05, 0.08, -0.02);
    horn.rotation.z = side * -0.2;
    horn.rotation.x = 0.3;
    goatHeadGroup.add(horn);
  });

  goatHeadGroup.position.set(0, 0.38, -0.1);
  targetGroup.add(goatHeadGroup);

  // Snake Tail
  const curvePoints = [
    new THREE.Vector3(0, 0.33, -0.5),
    new THREE.Vector3(0.08, 0.2, -0.85),
    new THREE.Vector3(-0.08, 0.1, -1.05),
    new THREE.Vector3(0.0, 0.15, -1.25)
  ];
  const snakeCurve = new THREE.CatmullRomCurve3(curvePoints);
  const snakeTailGeo = new THREE.TubeGeometry(snakeCurve, 32, 0.05, bodyRadSegs, false);
  const snakeTailMesh = new THREE.Mesh(snakeTailGeo, snakeMaterial);
  targetGroup.add(snakeTailMesh);
}

// Global window assignments
window.buildHumanUpperBody = buildHumanUpperBody;
window.buildDragonModel = buildDragonModel;
window.buildCentaurModel = buildCentaurModel;
window.buildSnakeHumanModel = buildSnakeHumanModel;
window.buildChimeraModel = buildChimeraModel;

if (typeof CREATURE_REGISTRY !== 'undefined') {
  CREATURE_REGISTRY.dragon = window.buildDragonModel;
  CREATURE_REGISTRY.wyrm = window.buildDragonModel;
  CREATURE_REGISTRY.drake = window.buildDragonModel;
  CREATURE_REGISTRY.centaur = window.buildCentaurModel;
  CREATURE_REGISTRY.lamia = window.buildSnakeHumanModel;
  CREATURE_REGISTRY.snakehuman = window.buildSnakeHumanModel;
  CREATURE_REGISTRY.naga = window.buildSnakeHumanModel;
  CREATURE_REGISTRY.chimera = window.buildChimeraModel;
}
    
