import React, { useState, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

function Box({ position, size = [1, 1, 1], color = 'lightblue', isSelected, onClick, topTexture, leftTexture, rightTexture, texture, fronTexture }) {

  const materials = [
    new THREE.MeshStandardMaterial({ map: leftTexture }), // Left side
    new THREE.MeshStandardMaterial({ map: rightTexture }), // Right side
    new THREE.MeshStandardMaterial({ map: topTexture }), // Top side 
    new THREE.MeshStandardMaterial({ map: texture }), // Bottom side
    new THREE.MeshStandardMaterial({ map: fronTexture }), // Front side
    new THREE.MeshStandardMaterial({ map: texture }), // Back side
  ];

  return (
    <mesh 
      position={[
        position[0] + size[0] / 2,
        position[1], 
        position[2]
      ]} 
      onClick={onClick}
      scale={isSelected ? [1.1, 1.1, 1.1] : [1, 1, 1]}
    >
      <boxGeometry args={size} />
      {materials.map((material, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} {...material} color={isSelected ? 'orange' : color} />
      ))}
    </mesh>
  );
}


function Lamp({position}){
  const [isLightOn, setIsLightOn] = useState(false);
  return(
    <>
      <mesh position={position}>
      <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      <mesh position={[position[0], position[1] + 0.3, position[2]]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={isLightOn ? 'yellow' : 'black'} /> 
      </mesh>

      {isLightOn && (
        <pointLight 
          position={[position[0], position[1] + 0.5, position[2]]} 
          intensity={1} 
          distance={5} 
          decay={2}
        />
      )}

      <Html position={[position[0], position[1] + 5, position[2]]} center>
        <button
          className="btn-lamp" style={{ padding: '10px', fontSize: '15px' }}
          onClick={() => setIsLightOn(!isLightOn)}
        >
          {isLightOn ? 'Turn off Lamp' : 'Turn on Lamp'}
        </button>
      </Html>
    </>
  )
}

function StackingBoxes({ setOrbitEnabled }) {
  return (
    <>
      <Box position={[1.25, 3.5, -2.5]} size={[2, 2, 1]} color="#e4e1f2" setOrbitEnabled={setOrbitEnabled} /> 
      <Box position={[1.25, 1.75, -2]} size={[2, 1.5 , 2]} color="hotpink" setOrbitEnabled={setOrbitEnabled} />
      <Box position={[1.25, 2.25, 0]} size={[2, 2.5, 2]} color="yellow" setOrbitEnabled={setOrbitEnabled} /> 
      <Box position={[1.25, 1.5, 2]} size={[2, 1, 2]} color="red" setOrbitEnabled={setOrbitEnabled} />
      <Box position={[-.75, 1.5, -1.5]} size={[2, 1, 3]} color="#e4e1f2" setOrbitEnabled={setOrbitEnabled} />
    </>
  );
}


function Scene() {
  const [orbitEnabled, setOrbitEnabled] = useState(true); 
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [formData, setFormData] = useState({
    name: '', x: 0, y: 2, z: 0, width: 2,
    height: 2, length: 2,
  });


  // Load the brown box texture
  const topTexture = useLoader(THREE.TextureLoader, './texture/04.jpg');
  const leftTexture = useLoader(THREE.TextureLoader, './texture/03.jpg');
  const rightTexture = useLoader(THREE.TextureLoader, './texture/03.jpg');
  const texture = useLoader(THREE.TextureLoader, './texture/01.jpg');
  const frontTexture = useLoader(THREE.TextureLoader, './texture/06.jpg');


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newBox = {
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

    if (selectedBoxIndex !== null) {
      const updatedBoxes = [...boxes];
      updatedBoxes[selectedBoxIndex] = newBox;
      setBoxes(updatedBoxes);
      setSelectedBoxIndex(null); 
      console.log(newBox);
    } else {
      setBoxes([...boxes, newBox]);
      console.log(newBox);
    }
  
    setFormData({
      name: '', x: 0, y: 2, z: 0,
      width:2, height:2, length:2,
    });
  };

  const handleBoxClick = (index) => {
    setSelectedBoxIndex(index);
    const selectedBox = boxes[index];
    setFormData({
      name: selectedBox.name,
      x: selectedBox.position[0],
      y: selectedBox.position[1],
      z: selectedBox.position[2],
      width: selectedBox.size[0],
      height: selectedBox.size[1],
      length: selectedBox.size[2],
    });
  }

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <h2>{selectedBoxIndex === null ? 'Create Box' : 'Edit Box'}</h2>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
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


        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, 1.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="white" transparent opacity={0} />
        </mesh>
  
        {/* <StackingBoxes setOrbitEnabled={setOrbitEnabled} /> */}

        {boxes.map((box, index) => (
          <Box 
            key={index} 
            position={box.position} 
            size={box.size} 
            color={box.color} 
            topTexture={topTexture}
            leftTexture={leftTexture}
            rightTexture={rightTexture}
            fronTexture={frontTexture}
            texture={texture}
            setOrbitEnabled={setOrbitEnabled}
            isSelected={selectedBoxIndex === index}
            onClick={() => handleBoxClick(index)} 
          />
        ))}

        <gridHelper args={[10, 10]} position={[-2.75, 1, 2]} />
          
        <OrbitControls enabled={orbitEnabled} />
      </Canvas>
    </>
  );
}

export default function App() {
  return <Scene />;
}
