import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, CubeCamera, Environment } from '@react-three/drei';
import './App.css';

function Box({ position, size = [1, 1, 1], color = 'lightblue', setOrbitEnabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);
  const meshRef = useRef();

  const handlePointerDown = (event) => {
    setIsDragging(true);
    setOrbitEnabled(false);
    event.stopPropagation(); 
  };

  const handlePointerMove = (event) => {
    if (isDragging) {
      const [x, y, z] = currentPosition;
      const { point } = event; 
      setCurrentPosition([point.x, point.y, z]); 
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setOrbitEnabled(true);
  };

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...currentPosition);
    }
  });

  return (
    <mesh 
      position={currentPosition} 
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function StackingBoxes({ setOrbitEnabled }) {
  return (
    <>
      <Box position={[1.25, 3.5, -2.5]} size={[2, 2, 1]} color="#e4e1f2" setOrbitEnabled={setOrbitEnabled}/> 
      <Box position={[1.25, 1.75, -2]} size={[2, 1.5 , 2]} color="hotpink" setOrbitEnabled={setOrbitEnabled}/>
      <Box position={[1.25, 2.25, 0]} size={[2, 2.5, 2]} color="yellow" setOrbitEnabled={setOrbitEnabled}/> 
      <Box position={[1.25, 1.5, 2]} size={[2, 1, 2]} color="red" setOrbitEnabled={setOrbitEnabled}/>
      <Box position={[-.75, 1.5, -1.5]} size={[2, 1, 3]} color="#e4e1f2" setOrbitEnabled={setOrbitEnabled}/>
    </>
  );
}

function Model({ path, position, scale }) {
  const { scene } = useGLTF(path);
  return <primitive object={scene} position={position} scale={scale} />;
}

function Scene() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [boxes, setBoxes] = useState([]);
  const [formData, setFormData] = useState({
    name: '', x: 0, y: 1.5, z: 0, width: 1,
    height: 1, length: 1,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newBox = {
      name: formData.name,
      position: [parseFloat(formData.x), parseFloat(formData.y), parseFloat(formData.z)],
      size: [parseFloat(formData.width), parseFloat(formData.height), parseFloat(formData.length)],
      color: 'lightblue', 
    };

    setBoxes([...boxes, newBox]);
    console.log(newBox);

    setFormData({
      name: '', x: 0, y: 1.5, z: 0,
      width: 1, height: 1, length: 1,
    });
  };

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <h2>Box Data Form</h2>
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
        <button type="submit">Submit</button>
      </form>

      <Canvas style={{ height: '100vh', width: '100%' }}>

      <directionalLight
          intensity={1} 
          position={[-10, 10, 5]} // Light from the left side
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        <pointLight position={[10, 10, 10]} />

        <gridHelper args={[10, 10]} position={[-2.75, 1, 2]} />

        <CubeCamera resolution={256} frames={Infinity}>
          {(texture) => (
            <>
              <Environment map={texture} background={false} />
              <StackingBoxes setOrbitEnabled={setOrbitEnabled} />
              {boxes.map((box, index) => (
                <Box key={index} position={box.position} size={box.size} color={box.color} setOrbitEnabled={setOrbitEnabled} />
              ))}
              <Model path="./model/01.glb" color='lightblue' position={[-5.75, .875, -1]} scale={[1.75, 1.75, 1.75]} />
            </>
          )}
          </CubeCamera>
              
        <OrbitControls enabled={orbitEnabled}/>
      </Canvas>
    </>
  );
}

export default function App() {
  return <Scene />;
}
