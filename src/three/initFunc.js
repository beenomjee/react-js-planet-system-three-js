import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { gsap } from "gsap";
import {
  starsTexture,
  sunTexture,
  mercuryTexture,
  venusTexture,
  earthTexture,
  marsTexture,
  jupiterTexture,
  saturnTexture,
  saturnRingTexture,
  uranusTexture,
  uranusRingTexture,
  neptuneTexture,
  plutoTexture,
} from "../assets";

const loadNotes = () => {
  let old = localStorage.getItem("notes");
  if (old) old = JSON.parse(old);
  else old = [];
  return old;
};

const addToLocalStorage = (newNote) => {
  const old = loadNotes();
  old.push(newNote);
  window.localStorage.setItem("notes", JSON.stringify(old));
};

const initFunc = ({ canvaContainer }) => {
  // creating renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvaContainer.current.appendChild(renderer.domElement);

  // loaders
  const textureLoader = new THREE.TextureLoader();
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const fontLoader = new FontLoader();

  // creating scene and setting background
  const scene = new THREE.Scene();
  scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
  ]);

  // creating camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // new orbit control
  const orbitControl = new OrbitControls(camera, renderer.domElement);

  // set camera position and update orbit controls
  camera.position.set(0, 0, 0);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  orbitControl.update();

  // light
  const ambientLight = new THREE.AmbientLight(0x333333);
  ambientLight.position.set(0, 10, 0);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 2.5, 400);
  scene.add(pointLight);

  // sun
  const sunGeometry = new THREE.SphereGeometry(20, 50, 50);
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture),
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  const createPlanet = (
    radius,
    defaltXPos,
    texture,
    ringsTexture = null,
    ringRadius
  ) => {
    const obj = new THREE.Object3D();
    const geo = new THREE.SphereGeometry(radius, 50, 50);
    const material = new THREE.MeshStandardMaterial({
      map: textureLoader.load(texture),
    });
    const planet = new THREE.Mesh(geo, material);
    planet.position.set(defaltXPos, 0, 0);

    if (ringsTexture) {
      const geo = new THREE.RingGeometry(radius + 3, radius + ringRadius, 50);
      const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(ringsTexture),
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(geo, material);
      ring.position.set(defaltXPos, 0, 0);
      ring.rotation.x = Math.PI / 2;
      obj.add(ring);
    }

    const imaginaryRingsGeo = new THREE.RingGeometry(
      defaltXPos,
      defaltXPos + 0.2,
      50
    );
    const imaginaryRingsMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const imaginaryRings = new THREE.Mesh(imaginaryRingsGeo, imaginaryRingsMat);
    imaginaryRings.rotation.x = Math.PI / 2;

    obj.add(planet);
    scene.add(imaginaryRings);
    scene.add(obj);
    return [obj, planet];
  };

  const planetsData = {
    mercury: {
      radius: 3.2,
      defaultXPos: 28,
      axisRotateSpeed: 0.004,
      arounSunRotationSpeed: 0.04,
      texture: mercuryTexture,
    },
    venus: {
      radius: 5.8,
      defaultXPos: 44,
      axisRotateSpeed: 0.002,
      arounSunRotationSpeed: 0.015,
      texture: venusTexture,
    },
    earth: {
      radius: 6,
      defaultXPos: 62,
      axisRotateSpeed: 0.02,
      arounSunRotationSpeed: 0.01,
      texture: earthTexture,
    },
    mars: {
      radius: 4,
      defaultXPos: 78,
      axisRotateSpeed: 0.018,
      arounSunRotationSpeed: 0.008,
      texture: marsTexture,
    },
    jupiter: {
      radius: 12,
      defaultXPos: 100,
      axisRotateSpeed: 0.04,
      arounSunRotationSpeed: 0.002,
      texture: jupiterTexture,
    },
    saturn: {
      radius: 10,
      defaultXPos: 138,
      axisRotateSpeed: 0.038,
      arounSunRotationSpeed: 0.0009,
      texture: saturnTexture,
      ringsTexture: saturnRingTexture,
      ringRadius: 10,
    },
    uranus: {
      radius: 7,
      defaultXPos: 176,
      axisRotateSpeed: 0.03,
      arounSunRotationSpeed: 0.0004,
      texture: uranusTexture,
      ringsTexture: uranusRingTexture,
      ringRadius: 7,
    },
    neptune: {
      radius: 7,
      defaultXPos: 200,
      axisRotateSpeed: 0.032,
      arounSunRotationSpeed: 0.0001,
      texture: neptuneTexture,
    },
    pluto: {
      radius: 2.8,
      defaultXPos: 216,
      axisRotateSpeed: 0.008,
      arounSunRotationSpeed: 0.00007,
      texture: plutoTexture,
    },
  };

  const planetsMeshWithObjects = {};
  for (let planetName in planetsData) {
    const { radius, defaultXPos, texture, ringsTexture, ringRadius } =
      planetsData[planetName];
    const [obj, planet] = createPlanet(
      radius,
      defaultXPos,
      texture,
      ringsTexture,
      ringRadius
    );
    planetsMeshWithObjects[planetName] = { obj, planet };
  }

  let cameraPos = {
    x: 0,
    y: 300,
    z: 0,
  };
  let isNewPos = true;

  const animate = () => {
    requestAnimationFrame(animate);

    // animationg camera
    if (isNewPos) {
      isNewPos = false;
      gsap.to(camera.position, {
        x: cameraPos.x,
        y: cameraPos.y,
        z: cameraPos.z,
        duration: 3,
        onUpdate: () => {
          camera.lookAt(new THREE.Vector3(0, 0, 0));
          orbitControl.update();
        },
      });
    }

    sun.rotation.y += 0.004;
    // rotating all planets on axis and around sun
    for (const planetName in planetsMeshWithObjects) {
      const { obj, planet } = planetsMeshWithObjects[planetName];
      const { axisRotateSpeed, arounSunRotationSpeed } =
        planetsData[planetName];
      obj.rotation.y += arounSunRotationSpeed;
      planet.rotation.y += axisRotateSpeed;
    }

    // rendering scene here
    renderer.render(scene, camera);
  };

  animate();

  // changeing view
  const changeView = (e) => {
    console.log("biba");
    if (e.target.id === "front")
      cameraPos = {
        x: 0,
        y: 140,
        z: 300,
      };
    else if (e.target.id === "top")
      cameraPos = {
        x: 0,
        y: 300,
        z: 0,
      };
    else
      cameraPos = {
        x: 300,
        y: 70,
        z: 0,
      };
    isNewPos = true;
  };

  //   add note to scene
  const addNote = ({ note, addTo, x, y, z, color, size, height }) => {
    const createMeshAndAddNote = (meshToAdded, x, y, z) => {
      fontLoader.load("/font/poppins-regular.json", (font) => {
        const geo = new TextGeometry(note, {
          font: font,
          size,
          height,
        });
        const mat = new THREE.MeshBasicMaterial({ color });
        const text = new THREE.Mesh(geo, mat);

        // setting width of text
        const box = new THREE.Box3().setFromObject(text);
        const width = box.max.x - box.min.x;

        text.position.set(x - width / 2, y, z);
        meshToAdded.add(text);

        // saving to local storage
        addToLocalStorage({ note, addTo, x, y, z, color, size, height });
      });
    };

    if (addTo === "sun") {
      createMeshAndAddNote(
        sun,
        sun.position.x,
        sun.position.y + 20 + 1,
        sun.position.z
      );
    } else if (addTo === "custom") {
      createMeshAndAddNote(scene, x, y, z);
    } else {
      const { obj, planet } = planetsMeshWithObjects[addTo];
      const planetData = planetsData[addTo];
      createMeshAndAddNote(
        obj,
        planet.position.x,
        planet.position.y + planetData.radius + 1,
        planet.position.z
      );
    }
  };

  //   loading and adding to scene old notes
  for (const note of loadNotes()) addNote(note);

  return { changeView, addNote };
};

export default initFunc;
