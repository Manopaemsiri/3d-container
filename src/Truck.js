import React, { useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

function Box({ position, size = [1, 1, 1],  color = 'lightblue', isSelected, onClick, topTexture, leftTexture, rightTexture, texture, fronTexture, backTexture }) {

  const materials = [
    new THREE.MeshStandardMaterial({ map: leftTexture }), // Left side
    new THREE.MeshStandardMaterial({ map: rightTexture }), // Right side
    new THREE.MeshStandardMaterial({ map: topTexture }), // Top side 
    new THREE.MeshStandardMaterial({ map: texture }), // Bottom side
    new THREE.MeshStandardMaterial({ map: fronTexture }), // Front side
    new THREE.MeshStandardMaterial({ map: backTexture }), // Back side
  ];

  console.log(position)
  return (
    <mesh 
      position={position} 
      onClick={onClick}
      scale={isSelected ? [1, 1, 1] : [1, 1, 1]}
    >
      <boxGeometry args={size} />
      {materials.map((material, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} {...material} color={isSelected ? 'orange' : color} />
      ))}
    </mesh>
  );
}

function TruckModel({boxes, addBox, truckIndex}) {
  return (
    <group position={[0, 1.35, 0]}>
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <boxGeometry args={[5.5, 1, 2]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[0, 1, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 2]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[-1.5, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[1.5, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-1.5, 0, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[1.5, 0, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

function Scene() {
  const [orbitEnabled, setOrbitEnabled] = useState(true); 
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [formData, setFormData] = useState({
    name: '', x: 0, y: 3.35, z: 0, width: 6,
    height: 2, length: 2, numberOfBoxes: 1,    
  });
  const [truckAdded, setTruckAdded] = useState(false);


  // Load the brown box texture
  const topTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const leftTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const rightTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const texture = useLoader(THREE.TextureLoader, './texture/container.png');
  const frontTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const backTexture = useLoader(THREE.TextureLoader, './texture/container.png');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();

    const numberOfBoxes = parseInt(formData.numberOfBoxes, 10);

    const newBox1 = {
      name: formData.name,
      position: [
        -Math.abs(parseFloat(formData.x)),
        parseFloat(formData.y) , 
        parseFloat(formData.z)
      ],
      size: [
        parseFloat(formData.width),
        parseFloat(formData.height),
        parseFloat(formData.length)
      ],
    };

    if (!truckAdded) {
      setTruckAdded(true);  
    }

    let updatedBoxes = [...boxes];

    if (selectedBoxIndex === null) {
      updatedBoxes.push(newBox1);
      if (numberOfBoxes === 2) {
        const newBox2 = {
          ...newBox1,
          name: `Box 2`,
          position: [newBox1.position[0] + newBox1.size[0], newBox1.position[1], newBox1.position[2]]
        };
        updatedBoxes.push(newBox2);
      }
    } else {
      updatedBoxes[selectedBoxIndex] = newBox1;
    }
   
    let _anchorX = 0;
    updatedBoxes = updatedBoxes.map(d => {
      let _pos = d.position;
      // _pos[0] = _anchorX;
      // _anchorX += d.size[0] + 0.1;
      return { ...d, position: _pos };
    });
    setBoxes(updatedBoxes);
    setSelectedBoxIndex(null);

    setFormData({
      name: '', x: 0, y: 3.35, z: 0,
      width: 6, height: 2, length: 2, numberOfBoxes: 1,  
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

        <ambientLight intensity={0.5} />

        <pointLight position={[10, 10, 10]} />

        {truckAdded && <TruckModel />}
  
        {boxes.map((box, index) => {
          return (
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
              setOrbitEnabled={setOrbitEnabled}
              isSelected={selectedBoxIndex === index}
              onClick={() => handleBoxClick(index)} 
            />
          );
        })}

        <gridHelper args={[10, 10]} position={[-2.75, 1, 2]} />
          
        <OrbitControls enabled />
      </Canvas>
    </>
  );
}

export default function Truck() {
  return <Scene />;
}
