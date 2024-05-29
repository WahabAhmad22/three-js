import * as dat from 'dat.gui';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mod } from 'three/examples/jsm/nodes/Nodes.js';
// canvas
let canvas = document.querySelector('#canvas');
let ob = canvas.getAttribute('ob');
// scene
const scene = new THREE.Scene();

// Texture Loader
// const textureLoader = new THREE.TextureLoader();
// const texture = textureLoader.load('/texture/Abstract_Organic_003_basecolor.jpg');
// console.log(texture);

// object
// const mesh = new THREE.Mesh(
//     new THREE.SphereGeometry(1, 32, 32),
//     new THREE.MeshBasicMaterial({ map: texture })
// );
// // mesh.position.set(2, 0.5, 1)
// scene.add(mesh);

// Loading Manager
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function (url, item, total) {
  console.log(`Started loading: ${url}`);
};

loadingManager.onProgress = function (url, loaded, total) {
  console.log((loaded / total) * 100);
};

// GLTFLoader
const glTFLoader = new GLTFLoader(loadingManager);
let mixture;
let model;
glTFLoader.load(ob, (glb) => {
  // glb.animations[0].play()
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  model = glb.scene;
  model.position.set(0, -0.05, 0);
  model.scale.copy(new THREE.Vector3(0.2, 0.2, 0.2));
  // model.scale.copy(new THREE.Vector3(1, 1, 1))
  model.material = material;
  scene.add(model);
  // gsap.to(model.rotation, { duration: 1, y: "+=0.01" })
  const clip = glb.animations[0];
  mixture = new THREE.AnimationMixer(model);
  const clipAction = mixture.clipAction(clip);
  let clipActionDuration = clip.duration;
  // console.log(clipActionDuration)

  let btn = document.querySelector('.btn');

  btn.addEventListener('click', () => {
    clipAction.play();
    clipAction.reset();
    btn.classList.add('disabled');
    setTimeout(() => {
      btn.classList.remove('disabled');
    }, clipActionDuration * 1000);
  });
  clipAction.loop = THREE.LoopOnce;
});

const clock = new THREE.Clock();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  renderer.setSize(sizes.width, sizes.height);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Lights
const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
keyLight.position.set(-5, 5, 5);
scene.add(keyLight);

// Control
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.shadowMap.enabled = true;
const backgroundColor = new THREE.Color(0xb3e0ff); // Sky blue color
renderer.setClearColor(backgroundColor);
renderer.render(scene, camera);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  if (model) {
    gsap.to(model.rotation, {
      duration: 100, // Rotation duration in seconds
      y: model.rotation.y + Math.PI * 2, // Rotate 360 degrees
      ease: 'none', // Linear easing for smooth rotation
      repeat: -1, // Infinite repeat
    });
  }
  if (mixture) {
    mixture.update(clock.getDelta());
  }
}
animate();
