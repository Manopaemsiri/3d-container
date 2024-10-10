import React, { useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
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

  return (
    <mesh 
      position={[
        position[0] + size[0] / 2,
        position[1], 
        position[2]
    ]} 
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

function TruckModel({position, truckIndex} ) {

  const isSecondTruck = truckIndex === 1;
 
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <boxGeometry args={[5.5, 1, 2]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[0, 1, 0]} receiveShadow>
        <boxGeometry args={[3, 0.2, 2]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[1.5, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[1.5, 0, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      {isSecondTruck && (
        <>
          <mesh position={[.5, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
            <meshStandardMaterial color="black" />
          </mesh>
          <mesh position={[.5, 0, -1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </>
      )}
    </group>
  );
}


function GLTFModel({ url }) {
  const { scene } = useGLTF(url); 

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;  
      child.receiveShadow = true;  
    }
  });

  return <primitive object={scene} position={[-4.7, 1, -4.45]} scale={[.5, .5, .5]} rotation={[0, 3 * Math.PI / 2, 0]}/>;
}

function Scene() {
  const [orbitEnabled, setOrbitEnabled] = useState(true); 
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [formData, setFormData] = useState({
    name: '', x: -2.75, y: 3.35, z: 0, width: 5.5,
    height: 2, length: 2, numberOfBoxes: 1,    
  });
  const [trucks, setTrucks] = useState([]);


  // Load the brown box texture
  const topTexture = useLoader(THREE.TextureLoader, './texture/container.png');
  const leftTexture = useLoader(THREE.TextureLoader, './texture/container-closed.png');
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
   
    const numberOfTrucks = Math.ceil(updatedBoxes.length / 1);  
    if (numberOfTrucks > trucks.length) {
      setTrucks([...trucks, ...Array(numberOfTrucks - trucks.length).fill(null)]);
    }
  
    setBoxes(updatedBoxes);
    setSelectedBoxIndex(null);

    setFormData({
      name: '', x: -2.75, y: 3.35, z: 0,
      width: 5.5, height: 2, length: 2, numberOfBoxes: 1,  
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

        <ambientLight intensity={.8} />

        <pointLight position={[10, 10, 10]} />

        <GLTFModel url="/model/truck-04.glb" />

        {trucks.map((_, index) => (
          <TruckModel key={index} position={[index * 5.6, 1.35, 0]} truckIndex={index} />
        ))}
  
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