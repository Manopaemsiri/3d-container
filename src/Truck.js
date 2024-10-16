import React, { useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

{/* Container */}
function Box({ 
  position, 
  size = [1, 1, 1],  
  color = 'lightblue', 
  isSelected, 
  onClick, 
  topTexture, 
  leftTexture, 
  rightTexture, 
  texture, 
  fronTexture, 
  backTexture,
  logoTexture
 }) {

  logoTexture.wrapS = logoTexture.wrapT = THREE.RepeatWrapping;
  logoTexture.repeat.set(0.8, 0.8);
  logoTexture.offset.set(0.1, 0.1); 

  const materials = [
    new THREE.MeshStandardMaterial({ map: leftTexture }), // Left side
    new THREE.MeshStandardMaterial({ map: rightTexture }), // Right side
    new THREE.MeshStandardMaterial({ map: topTexture }), // Top side 
    new THREE.MeshStandardMaterial({ map: texture }), // Bottom side
    new THREE.MeshStandardMaterial({ map: fronTexture }), // Front side
    new THREE.MeshStandardMaterial({ map: backTexture }), // Back side
  ];

  return (
    <group position={[
      position[0] + size[0] / 2,
      position[1],
      position[2],
    ]}>
      <mesh 
        onClick={onClick}
        scale={isSelected ? [1, 1, 1] : [1, 1, 1]}
      >
        <boxGeometry args={size} />
        {materials.map((material, i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} {...material} color={isSelected ? 'orange' : color} />
        ))}
      </mesh>
      
      {/* Logo - Front Side */}
      <mesh 
        position={[0, 0, size[2] / 2 + 0.01]} 
      >
        <planeGeometry args={[size[0] * 0.7, size[1] * 0.7]} />
        <meshStandardMaterial map={logoTexture} transparent={true} />
      </mesh>

      {/*Logo - Back Side */}
      <mesh 
        position={[0, 0, -size[2] / 2 - 0.01]}
        rotation={[0, 0, 0]} 
      >
        <planeGeometry args={[size[0] * 0.7, size[1] * 0.7]} />
        <meshStandardMaterial 
          map={logoTexture} 
          transparent={true} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}


/* Truck Header Model */
function GLTFModel({ url, boxLenght }) {
  const { scene } = useGLTF(url); 

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;  
      child.receiveShadow = true;  
    }
  });

  const scale = [0.5, 0.5, 0.5];

  return (
    <primitive 
        object={scene} 
        position={[-4.7, 1, -4.45]} 
        scale={scale} 
        rotation={[0, 3 * Math.PI / 2, 0]}
    />
  )
}

/* Whell Model */
function TrailerPart02Model({ box, url, offsetZ = 0, offsetX = 0, offsetY = 0, isFlipped = false }){
  const { scene } = useGLTF(url);

  scene.traverse((child) => {
    if(child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const xPosition = box.position[0] + box.size[0] - 4.05 + offsetX;

  const zPosition = isFlipped
  ? box.position[2] - box.size[2] / 2 + 2 - offsetZ 
  : box.position[2] + box.size[2] / 2 - 2 + offsetZ; 

  const yPosition = box.position[1] - box.size[1] + 1 / 2 + offsetY;

  const scale = isFlipped ? [0.5, 0.5, -0.5] : [0.5, 0.5, 0.5];

  return (
    <primitive 
      object={scene} 
      position={[xPosition, yPosition, zPosition,]}
      scale={scale} 
      rotation={[0, Math.PI, 0]} />
  )
}

function Base({position, length}){
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[length, 0.2, 0.2]} />
      <meshStandardMaterial color="black" />
    </mesh>
  )
}

function Scene() {
  const [orbitEnabled, setOrbitEnabled] = useState(true); 
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [formData, setFormData] = useState({
    name: '', x: -2.75, y: 2.95, z: 0, width: 8.45,
    height: 2, length: 2, numberOfBoxes: 1,    
  });
  const trailerPart02Url = "/model/trailer-part-02.glb";
  const trailerPart03Url = "/model/trailer-part-03.glb";


  // Load the brown box texture
  const topTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const leftTexture = useLoader(THREE.TextureLoader, './texture/container-closed.png');
  const rightTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const texture = useLoader(THREE.TextureLoader, './texture/container.png');
  const frontTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const backTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const logoTexture = useLoader(THREE.TextureLoader, './texture/truck-logo.png');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const numberOfBoxes = parseInt(formData.numberOfBoxes, 10);

    if (selectedBoxIndex === null && boxes.length >= 2) {
      alert('You cannot add more than 2 boxes.');
      return;
    }

    const newBox1 = {
      name: formData.name,
      position: [
        parseFloat(formData.x),
        parseFloat(formData.y), 
        parseFloat(formData.z)
      ],
      size: [
        parseFloat(formData.width),
        parseFloat(formData.height),
        parseFloat(formData.length)
      ],
    };

    let updatedBoxes = [...boxes];

    if (selectedBoxIndex === null) {
      if(updatedBoxes.length < 1){
        updatedBoxes.push(newBox1);
      }else{
        const newBox2Position = [
          updatedBoxes[0].position[0] + updatedBoxes[0].size[0] + 0.1,
          updatedBoxes[0].position[1],
          updatedBoxes[0].position[2]
        ];

        const newBox2 = {
          ...newBox1,
          name: `Box 2`,
          position: newBox2Position,
        };
        updatedBoxes.push(newBox2); 
      }

      if (numberOfBoxes === 2) {
        const newBox2 = {
          ...newBox1,
          name: `Box 2`,
          position: [
            newBox1.position[0] + newBox1.size[0] + 0.1,
            newBox1.position[1],
            newBox1.position[2]
          ]
        };
        updatedBoxes.push(newBox2);
      }
    } else {
      updatedBoxes[selectedBoxIndex] = newBox1;
      if (selectedBoxIndex === 0 && updatedBoxes.length > 1) {
        const updatedBox2 = {
          ...updatedBoxes[1], 
          position: [
            newBox1.position[0] + newBox1.size[0] + 0.1, 
            newBox1.position[1],
            newBox1.position[2]
          ]
        };
        updatedBoxes[1] = updatedBox2; 
      } 
    }
   
    setBoxes(updatedBoxes);
    setSelectedBoxIndex(null);

    setFormData({
      name: '', x: -2.75, y: 2.95, z: 0,
      width: 8.45, height: 2, length: 2, numberOfBoxes: 1,  
    });
  };

  const handleBoxClick = (index) => {
    const selectedBox = boxes[index];
    setFormData({
      name: selectedBox.name ,
      x: selectedBox.position[0],
      y: selectedBox.position[1],
      z: selectedBox.position[2],
      width: selectedBox.size[0],
      height: selectedBox.size[1],
      length: selectedBox.size[2],
      numberOfBoxes: 1,
    });
    setSelectedBoxIndex(index); 
  };

  return (
    <>
      {/* Form */}
      <form className="form" onSubmit={handleSubmit}>
        <h2>{selectedBoxIndex === null ? 'Create Box' : 'Edit Box'}</h2>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Number of Boxes:</label>
          <input type="number" name="numberOfBoxes" value={formData.numberOfBoxes} onChange={handleInputChange} min="1" max="2" required />
        </div>
        <div>
          <label>X-axis:</label>
          <input type="number" name="x" value={formData.x} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Y-axis:</label>
          <input type="number" name="y" value={formData.y} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Z-axis:</label>
          <input type="number" name="z" value={formData.z} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Width:</label>
          <input type="number" name="width" value={formData.width} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Height:</label>
          <input type="number" name="height" value={formData.height} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Length:</label>
          <input type="number" name="length" value={formData.length} onChange={handleInputChange} required />
        </div>
        <button type="submit">
          {selectedBoxIndex === null ? 'Create Box' : 'Update Box'}
        </button>
      </form>

      <Canvas style={{ height: '100vh', width: '100%' }} >
        <directionalLight
          intensity={2} 
          position={[5, 10, 5]} 
          castShadow
        />
        <ambientLight intensity={.8} />
        <pointLight position={[10, 10, 10]} />

        {boxes.map((box, index) => {
          return (
            <React.Fragment key={index}>
              <Box 
                key={index} 
                position={box.position} 
                size={box.size} 
                color={box.color} 
                topTexture={topTexture}
                leftTexture={leftTexture}
                rightTexture={rightTexture}
                fronTexture={frontTexture}
                backTexture={backTexture}
                texture={texture}
                logoTexture={logoTexture}
                setOrbitEnabled={setOrbitEnabled}
                isSelected={selectedBoxIndex === index}
                onClick={() => handleBoxClick(index)} 
              />
              <Base
                position={[
                  box.position[0] + box.size[0] / 2, 
                  box.position[1] - box.size[1] / 2 - .095, 
                  box.position[2] + box.size[2] / 2 - .095,
                ]}
                length={box.size[0]} 
              />
              <Base
                position={[
                  box.position[0] + box.size[0] / 2, 
                  box.position[1] - box.size[1] / 2 - .095, 
                  box.position[2] - box.size[2] / 2 + .095,
                ]}
                length={box.size[0]} 
              />
                {/* Truck Header */}
                <GLTFModel url="/model/truck-04.glb" />
                {/* Trailer */}
                <TrailerPart02Model url={trailerPart02Url} box={box} isFlipped={false} offsetZ={-0.5}/>
                <TrailerPart02Model url={trailerPart03Url} box={box} isFlipped={true} offsetZ={-0.5} />
            </React.Fragment>
          );
        })}

        {/* Grid Helper */}
        <gridHelper args={[10, 10]} position={[0, 1, 0]} />
          
        <OrbitControls enabled />
      </Canvas>
    </>
  );
}

export default function Truck() {
  return <Scene />;
}