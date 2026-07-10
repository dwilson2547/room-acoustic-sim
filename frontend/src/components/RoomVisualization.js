import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const RoomVisualization = ({ 
  roomDimensions, 
  speakerPosition, 
  listenerPosition,
  onSpeakerMove,
  onListenerMove 
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const speakerRef = useRef(null);
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(
      roomDimensions[0] * 1.5,
      roomDimensions[2] * 1.5,
      roomDimensions[1] * 1.5
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(Math.max(...roomDimensions), 10);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Create room
    const createRoom = () => {
      // Floor
      const floorGeometry = new THREE.PlaneGeometry(roomDimensions[0], roomDimensions[1]);
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d2d44,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(roomDimensions[0] / 2, 0, roomDimensions[1] / 2);
      scene.add(floor);

      // Ceiling
      const ceiling = floor.clone();
      ceiling.position.y = roomDimensions[2];
      scene.add(ceiling);

      // Walls - using edges for wireframe effect
      const wallMaterial = new THREE.LineBasicMaterial({ color: 0x4a90e2 });

      // Back wall
      const backWallGeometry = new THREE.EdgesGeometry(
        new THREE.PlaneGeometry(roomDimensions[0], roomDimensions[2])
      );
      const backWall = new THREE.LineSegments(backWallGeometry, wallMaterial);
      backWall.position.set(roomDimensions[0] / 2, roomDimensions[2] / 2, 0);
      scene.add(backWall);

      // Front wall
      const frontWall = backWall.clone();
      frontWall.position.z = roomDimensions[1];
      scene.add(frontWall);

      // Left wall
      const sideWallGeometry = new THREE.EdgesGeometry(
        new THREE.PlaneGeometry(roomDimensions[1], roomDimensions[2])
      );
      const leftWall = new THREE.LineSegments(sideWallGeometry, wallMaterial);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(0, roomDimensions[2] / 2, roomDimensions[1] / 2);
      scene.add(leftWall);

      // Right wall
      const rightWall = leftWall.clone();
      rightWall.position.x = roomDimensions[0];
      scene.add(rightWall);

      // Room outline box
      const boxGeometry = new THREE.BoxGeometry(
        roomDimensions[0],
        roomDimensions[2],
        roomDimensions[1]
      );
      const boxEdges = new THREE.EdgesGeometry(boxGeometry);
      const boxLine = new THREE.LineSegments(
        boxEdges,
        new THREE.LineBasicMaterial({ color: 0x4a90e2, linewidth: 2 })
      );
      boxLine.position.set(
        roomDimensions[0] / 2,
        roomDimensions[2] / 2,
        roomDimensions[1] / 2
      );
      scene.add(boxLine);
    };

    // Create speaker
    const createSpeaker = () => {
      const speakerGroup = new THREE.Group();

      // Speaker box
      const boxGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
      const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      speakerGroup.add(box);

      // Speaker cone
      const coneGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32);
      const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.rotation.x = Math.PI / 2;
      cone.position.z = 0.16;
      speakerGroup.add(cone);

      // Position
      speakerGroup.position.set(...speakerPosition);

      // Label
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('Speaker', 10, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.8, 0.2, 1);
      sprite.position.y = 0.5;
      speakerGroup.add(sprite);

      scene.add(speakerGroup);
      speakerRef.current = speakerGroup;
    };

    // Create listener
    const createListener = () => {
      const listenerGroup = new THREE.Group();

      // Head
      const headGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0x4ecdc4 });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      listenerGroup.add(head);

      // Ears
      const earGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const leftEar = new THREE.Mesh(earGeometry, headMaterial);
      leftEar.position.set(-0.15, 0, 0);
      listenerGroup.add(leftEar);

      const rightEar = new THREE.Mesh(earGeometry, headMaterial);
      rightEar.position.set(0.15, 0, 0);
      listenerGroup.add(rightEar);

      // Position
      listenerGroup.position.set(...listenerPosition);

      // Label
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('Listener', 10, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.8, 0.2, 1);
      sprite.position.y = 0.4;
      listenerGroup.add(sprite);

      scene.add(listenerGroup);
      listenerRef.current = listenerGroup;
    };

    // Initialize scene
    createRoom();
    createSpeaker();
    createListener();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [roomDimensions]);

  // Update speaker position
  useEffect(() => {
    if (speakerRef.current) {
      speakerRef.current.position.set(...speakerPosition);
    }
  }, [speakerPosition]);

  // Update listener position
  useEffect(() => {
    if (listenerRef.current) {
      listenerRef.current.position.set(...listenerPosition);
    }
  }, [listenerPosition]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '600px',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};

export default RoomVisualization;
