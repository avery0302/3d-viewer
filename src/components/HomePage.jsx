import { useEffect, useRef, useState } from "react";
import styles from "./HomePage.module.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function HomePage() {
  const [state, setState] = useState({});
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  let controls = null;
  let camera = null;
  let renderer = null;
  let scene = null;
  let loader = null;
  let light = null;

  function initScene() {
    // Create scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 8);

    // Create renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio);

    // Add lighting
    light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(light);

    initControls();
    loadModel();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // required for OrbitControls
      renderer.render(scene, camera);
    };
    animate();
  }

  function handleDrop(e) {
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith(".glb")) {
      alert("Please drop a .glb file");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const arrayBuffer = event.target.result;

      loader.parse(arrayBuffer, "", (gltf) => {
        scene.clear();
        scene.add(light);
        controls.autoRotate = false;
        camera.position.set(0, 0, 8);
        camera.lookAt(0, 0, 0);

        scene.add(gltf.scene);
      });
    };
    reader.readAsArrayBuffer(file);
  }

  function initControls() {
    // Enable mouse controls + auto-rotate
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 8.0;
    controls.target.set(0, 0, 0);
  }

  function loadModel() {
    // Load .glb model
    loader = new GLTFLoader();
    loader.load(
      new URL("../assets/planet.glb", import.meta.url).href,
      (gltf) => {
        gltf.scene.rotation.z = Math.PI / 5;
        gltf.scene.rotation.x = -Math.PI / 10;
        scene.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("Failed to load model:", error);
      },
    );
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleResize() {
    const newWidth = containerRef.current.clientWidth;
    const newHeight = containerRef.current.clientHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  useEffect(() => {
    initScene();

    // stop default drag behavior
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      window.addEventListener(eventName, preventDefaults, false);
    });

    // listen to window resize
    window.addEventListener("resize", handleResize);

    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        window.removeEventListener(eventName, preventDefaults, false);
      });
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className={styles["home-page"]}>
      <div ref={containerRef} className={styles["container"]}>
        <canvas
          ref={canvasRef}
          className={styles["canvas"]}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        ></canvas>
      </div>

      <div className={styles["tips"]}>Drag glb file to view it</div>
      <div className={styles["header"]}>3D viewer</div>
    </div>
  );
}

export default HomePage;
