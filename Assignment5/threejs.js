/** @format */
import * as THREE from "three";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";
import { RenderPass } from "./node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "./node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from "./node_modules/three/examples/jsm/libs/lil-gui.module.min.js";

function main() {
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = (canvas.clientWidth * pixelRatio) | 0;
        const height = (canvas.clientHeight * pixelRatio) | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    function onClick(event) {
        raycaster.setFromCamera(pointer, camera);
    }

    function onPointerMove(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function updateCamera() {
        // update the light target's matrixWorld because it's needed by the helper
        light.target.updateMatrixWorld();
        helper.update();
        // update the light's shadow camera's projection matrix
        light.shadow.camera.updateProjectionMatrix();
        // and now update the camera helper we're using to show the light's shadow camera
        cameraHelper.update();
    }

    const canvas = document.querySelector("#c");
    if (!canvas) {
        console.log("Failed to retrieve <canvas> element");
        return;
    }
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        alpha: true,
    });
    renderer.shadowMap.enabled = true;
    const scene = new THREE.Scene();

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 250;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    scene.fog = new THREE.Fog(0xffffff, 75, 105);
    // camera.position.set(-13, 61, 12);

    const controls = new OrbitControls(camera, canvas);
    // controls.target.set(50, 70, 50);
    controls.update();

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.threshold = -10;
    bloomPass.strength = 0.25;
    bloomPass.radius = 0.01;

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("click", onClick);

    camera.position.z = 2;
    //camera.position.y = 5;

    let sunX = 0;
    let sunZ = -90;
    const color = "rgb(255, 255, 255)";
    const intensity = 0.01;
    const light = new THREE.PointLight(color, intensity);
    light.castShadow = true;
    //light.position.set(0, 2, -3);
    light.position.set(sunX, 35, sunZ);
    scene.add(light);

    const gui = new GUI();
    gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
    gui.add(light, "intensity", 0, 2, 0.01);
    {
        const folder = gui.addFolder("Shadow Camera");
        folder.open();
        folder
            .add(
                new DimensionGUIHelper(light.shadow.camera, "left", "right"),
                "value",
                1,
                20
            )
            .name("width")
            .onChange(updateCamera);
        folder
            .add(
                new DimensionGUIHelper(light.shadow.camera, "bottom", "top"),
                "value",
                1,
                20
            )
            .name("height")
            .onChange(updateCamera);
        const minMaxGUIHelper = new MinMaxGUIHelper(
            light.shadow.camera,
            "near",
            "far",
            0.1
        );
        folder
            .add(minMaxGUIHelper, "min", 0.1, 50, 0.1)
            .name("near")
            .onChange(updateCamera);
        folder
            .add(minMaxGUIHelper, "max", 0.1, 50, 0.1)
            .name("far")
            .onChange(updateCamera);
        folder
            .add(light.shadow.camera, "zoom", 0.01, 1.5, 0.01)
            .onChange(updateCamera);
    }

    const hemiLight = new THREE.HemisphereLight(0xf7db4d, 0x1e81eb, 0.6);
    scene.add(hemiLight);

    const loader = new THREE.TextureLoader();
    const texture = loader.load("textures/sky.jpg", () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt.texture;
    });

    const sunRad = 4;
    const sunWidth = 15;
    const sunHeight = 15;
    const sunGeo = new THREE.SphereGeometry(sunRad, sunWidth, sunHeight);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xf7db4d });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(sunX, 35, sunZ);
    scene.add(sun);

    const floorWidth = 75;
    const floorHeight = 0.01;
    const floorDepth = 75;
    const floorGeo = new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth);
    const floorMat = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    floor.position.set(0, -0.5, 0);
    scene.add(floor);

    const mountRad = 150;
    const mountHeight = 120;
    const mountSegs = 4;
    const mountGeo = new THREE.ConeGeometry(mountRad, mountHeight, mountSegs);
    const mountMat = new THREE.MeshPhongMaterial({ color: 0x8c8c8c });
    const mount = new THREE.Mesh(mountGeo, mountMat);
    mount.receiveShadow = true;
    mount.position.set(10, 50, 185);
    scene.add(mount);

    const mount1 = mount.clone();
    mount1.scale.set(0.6, 0.85, 0.6);
    mount1.position.set(-50, 50, 180);
    scene.add(mount1);
    const mount2 = mount.clone();
    mount2.scale.set(1.25, 0.7, 1.25);
    mount2.position.set(-105, 40, 165);
    mount2.rotateY(90);
    scene.add(mount2);
    const mount3 = mount.clone();
    mount3.scale.set(0.95, 0.75, 0.95);
    mount3.position.set(-135, 40, 75);
    mount3.rotateY(125);
    scene.add(mount3);
    const mount4 = mount.clone();
    mount4.scale.set(0.9, 0.65, 0.9);
    mount4.position.set(85, 30, 155);
    mount4.rotateY(-75);
    scene.add(mount4);
    const mount5 = mount.clone();
    mount5.scale.set(0.55, 0.8, 0.55);
    mount5.position.set(70, 30, 50);
    scene.add(mount5);

    const hillRad = 20;
    const hillWidth = 15;
    const hillHeight = 15;
    const hillGeo = new THREE.SphereGeometry(hillRad, hillWidth, hillHeight);
    // { color: 0x4c9441 }
    const hillMat = new THREE.MeshPhongMaterial({
        map: loader.load("./textures/grass.jfif"),
    });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.receiveShadow = true;
    hill.position.set(-5, 7, 65);
    scene.add(hill);

    const hill1 = hill.clone();
    hill1.position.set(-25, 7, 64);
    scene.add(hill1);
    const hill3 = hill.clone();
    hill3.position.set(15, 8, 57);
    scene.add(hill3);
    const hill4 = hill.clone();
    hill4.position.set(-42, 7, 60);
    scene.add(hill4);
    const hill5 = hill.clone();
    hill5.position.set(-45, 6, 45);
    scene.add(hill5);
    const hill6 = hill.clone();
    hill6.position.set(-40, 7, 32);
    scene.add(hill6);
    const hill7 = hill.clone();
    hill7.position.set(-46, 7, 19);
    scene.add(hill7);
    const hill8 = hill.clone();
    hill8.position.set(-43, 7, 5);
    scene.add(hill8);
    const hill9 = hill.clone();
    hill9.position.set(-44, 2, -8);
    scene.add(hill9);
    const hill10 = hill.clone();
    hill10.position.set(25, 6, 54);
    scene.add(hill10);
    const hill11 = hill.clone();
    hill11.position.set(34, 5, 43);
    scene.add(hill11);
    const hill12 = hill.clone();
    hill12.position.set(52, 6, 28);
    scene.add(hill12);
    const hill13 = hill.clone();
    hill13.position.set(-20, -2, 45);
    scene.add(hill13);

    // Credit: https://poly.pizza/m/6Yjt8nIwLsD
    let tree;
    const gltfLoader = new GLTFLoader();
    const url = "./objects/Tree.glb";
    gltfLoader.load(url, (gltf) => {
        tree = gltf.scene;
        tree.traverse((obj) => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
        tree.scale.set(10, 10, 10);
        tree.position.set(0, 18, 0);
        const tree1 = tree.clone();
        tree1.position.set(-6, 12, -17);
        scene.add(tree1);
        const tree2 = tree.clone();
        tree2.position.set(15, 12, 26);
        scene.add(tree2);
        const tree3 = tree.clone();
        tree3.position.set(-10, 12, 7);
        scene.add(tree3);
        tree.scale.set(15, 15, 15);
        const tree4 = tree.clone();
        tree4.position.set(-2, 18, -9);
        scene.add(tree4);
        const tree5 = tree.clone();
        tree5.position.set(6, 18, 1);
        scene.add(tree5);
        const tree6 = tree.clone();
        tree6.position.set(25, 18, 35);
        scene.add(tree6);
        const tree7 = tree.clone();
        tree7.position.set(-21, 18, 9);
        scene.add(tree7);
        const tree14 = tree.clone();
        tree14.position.set(-30, 18, 27);
        scene.add(tree14);
        tree.scale.set(25, 25, 25);
        const tree8 = tree.clone();
        tree8.position.set(-2, 30, 32);
        scene.add(tree8);
        const tree9 = tree.clone();
        tree9.position.set(17, 30, 2);
        scene.add(tree9);
        tree.scale.set(40, 40, 40);
        const tree10 = tree.clone();
        tree10.position.set(-24, 49, -27);
        scene.add(tree10);
        const tree11 = tree.clone();
        tree11.position.set(20, 49, -32);
        scene.add(tree11);
        const tree12 = tree.clone();
        tree12.position.set(-20, 49, -1);
        scene.add(tree12);
        const tree13 = tree.clone();
        tree13.position.set(31, 49, 16);
        scene.add(tree13);
    });

    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    let leaf;
    let leaves = [];
    let positions = [];
    //Credit: https://poly.pizza/m/4_FetA14dDV
    gltfLoader.load("./objects/Leaf.glb", (gltf) => {
        leaf = gltf.scene;
        leaf.traverse((obj) => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
        leaf.scale.set(0.45, 0.45, 0.45);
        leaf.rotateX(90);
        leaf.position.set(0, -0.45, 0);
        for (let i = 0; i < 2500; i++) {
            const leafCopy = leaf.clone();
            const xPos = getRandomIntInclusive(-36, 36);
            const yPos = getRandomIntInclusive(10, 120);
            const zPos = getRandomIntInclusive(-36, 36);
            leafCopy.position.set(xPos, yPos, zPos);
            leaf.rotateY(getRandomIntInclusive(0, 360));
            leaves.push(leafCopy);
            scene.add(leafCopy);
            positions.push({
                x: xPos,
                y: yPos,
                z: zPos,
                randx: getRandomIntInclusive(2, 10),
                randz: getRandomIntInclusive(2, 10),
            });
        }
    });

    const helper = new THREE.PointLightHelper(light);
    scene.add(helper);

    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(cameraHelper);

    function render(time) {
        time *= 0.001; // convert time to seconds

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        light.color.setRGB(
            255,
            Math.min(255, 120 * Math.cos(time / 2) + 100),
            Math.min(255, 120 * Math.cos(time / 2) + 100)
        );

        sunX = Math.min(80 * Math.cos(time / 2) + 0);
        sunZ = Math.min(30 * Math.cos(time / 2) - 90);
        sun.position.set(sunX, 35, sunZ);
        light.position.set(sunX, 35, sunZ);

        for (let i = 0; i < leaves.length; i++) {
            if (positions[i].y > -0.45) {
                positions[i].x +=
                    0.05 * Math.cos((time * 2) / positions[i].randz);
                positions[i].y -= 0.1;
                positions[i].z +=
                    0.05 * Math.cos((time * 2) / positions[i].randz);
                leaves[i].position.set(
                    positions[i].x,
                    positions[i].y,
                    positions[i].z
                );
            }
        }

        renderer.render(scene, camera);

        bloomComposer.render();

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

class DimensionGUIHelper {
    constructor(obj, minProp, maxProp) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
    }
    get value() {
        return this.obj[this.maxProp] * 2;
    }
    set value(v) {
        this.obj[this.maxProp] = v / 2;
        this.obj[this.minProp] = v / -2;
    }
}

class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() {
        return this.obj[this.minProp];
    }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(
            this.obj[this.maxProp],
            v + this.minDif
        );
    }
    get max() {
        return this.obj[this.maxProp];
    }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min; // this will call the min setter
    }
}

main();
