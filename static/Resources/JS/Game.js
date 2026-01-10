import * as THREE from "three"; // Import Three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import Stats from 'https://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

let stats; //create stats

stats = new Stats(); // Declare a new Stats object 

//document.body.appendChild( stats.dom ); // add the Stats object to the canvas

const scene = new THREE.Scene(); // Initialise 3D scene

const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 11000 ); // Create Camera object

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Initialise 3D renderer + anti-aliasing

renderer.setSize( window.innerWidth, window.innerHeight ); // Set Render Size

renderer.setAnimationLoop( animate ); // Start animation
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

document.body.appendChild( renderer.domElement ); // add the renderer to the HTML

// AUDIO MANAGER

let music = null;

let audioUnlocked = false; // browsers block autoplay, audio can only start after a user interaction.

function unlockAudio() 
{
    if (audioUnlocked) return;

    audioUnlocked = true;
}

window.addEventListener("keydown", unlockAudio, { once: true });
window.addEventListener("mousedown", unlockAudio, { once: true });

function playMusic(src, volume = 0.5, loop = true) 
{
    if (music) 
    {
        music.pause();
        music.currentTime = 0;
    }

    music = new Audio(src);
    music.loop = loop;
    music.volume = volume;
    music.play();
}

let sfx = {};


function loadSFX(name, src, volume = 1.0) {
    const audio = new Audio(src);
    audio.volume = volume;
    sfx[name] = audio;
}

function playSFX(name) {
    if (!sfx[name]) return;

    // clone so multiple sounds can overlap
    const sound = sfx[name].cloneNode();
    sound.volume = sfx[name].volume;
    sound.play();
}

loadSFX("pickup", "./Resources/Music/juancamiloorjuela__pick-up-health.wav", 0.7);
loadSFX("damage", "./Resources/Music/sieuamthanh__no-4.wav", 0.8);

// GAME STATE
let gameStarted = false;
let gamePaused = false;

let DebugStat = false;
 
let CurrentLevel = null;

const grounds = [];

const Bombs = [];

const Items = [];

let score = 0;

let lives = 100;

let FpsMode = 144;
let Delta = 60 / FpsMode;

let SkyTex;

const uvAnimatedTextures = [];
let uvAnimationSpeed = 0.02;

const envLoader = new THREE.TextureLoader();

const environmentMap = envLoader.load(SkyTex, (tex) => //Convert Sky Texture to Enviroment Map
{
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
});

const material5 = new THREE.MeshPhongMaterial // Material that can simulate shiny surfaces with specular highlights
( { 
    
    color: 0xfcc200  , // Base Colour
    specular: 0xffffff, //Specular colour
    shininess: 100, // How shiny the material is
    emissive: 0x422c00, // Emissive colour

    envMap: environmentMap,        // reflection source
    reflectivity: 0.5, // reflection strength
    refractionRatio: 1.0,
    needsUpdate: true

} );


const loader = new GLTFLoader();

function loadLevel(path, CollisionType, uvANIM) 
{
    loader.load(path, (gltf) => 
    {

        const envLoader = new THREE.TextureLoader();

        const environmentMap = envLoader.load(SkyTex, (tex) => //Convert Sky Texture to Enviroment Map
        {
            tex.mapping = THREE.EquirectangularReflectionMapping;
            tex.colorSpace = THREE.SRGBColorSpace;
        });

        const model = gltf.scene;
        model.traverse((child) => 
        {
            if (child.isMesh)
                { 
                    child.material.envMap = environmentMap; //Enviroment Map
                    child.material.envMapIntensity = 1; // Enviroment Map strength
                    child.material.needsUpdate = true;

                    child.castShadow = true;
                    child.receiveShadow = true;

                    const tex = child.material.map;

                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;

                    switch(uvANIM)
                    {
                        case 0: // 0 = no animation
                            break;

                        case 1: // 1 = scroll X
                            collectUvMaps(child.material, uvANIM);
                            break;

                        case 2: // 2 = scroll Y
                            collectUvMaps(child.material, uvANIM);
                            break;
                    }
                }
        });
        scene.add(model);



        switch(CollisionType)
        {
            case 0:
                break;

            case 1:
                grounds.push(new THREE.Box3().setFromObject(model));
                break;
        }
    });
}

function loadBomb(X, Y, Z) 
{
    loader.load('Resources/Models/Bomb.glb', (gltf) => 
    {

        const envLoader = new THREE.TextureLoader();

        const environmentMap = envLoader.load(SkyTex, (tex) => //Convert Sky Texture to Enviroment Map
        {
            tex.mapping = THREE.EquirectangularReflectionMapping;
            tex.colorSpace = THREE.SRGBColorSpace;
        });

        const model = gltf.scene;
        model.traverse((child) => 
        {
            if (child.isMesh)
                { 
                    child.material.envMap = environmentMap; //Enviroment Map
                    child.material.envMapIntensity = 1; // Enviroment Map strength
                    child.material.needsUpdate = true;

                    child.castShadow = true;
                    child.receiveShadow = true;

                    const tex = child.material.map;

                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                }
        });
        model.position.x = X;
        model.position.y = Y;
        model.position.z = Z;
        scene.add(model);

        Bombs.push(
            {
                mesh: model,
                box: new THREE.Box3().setFromObject(model)
            });

    });
}



function loadItem(X, Y, Z) 
{

    loader.load('Resources/Models/Item.glb', (gltf) => 
    {

        const envLoader = new THREE.TextureLoader();

        const environmentMap = envLoader.load(SkyTex, (tex) => //Convert Sky Texture to Enviroment Map
        {
            tex.mapping = THREE.EquirectangularReflectionMapping;
            tex.colorSpace = THREE.SRGBColorSpace;
        });

        const model = gltf.scene;
        model.traverse((child) => 
        {
            if (child.isMesh)
                { 
                    child.material.envMap = environmentMap; //Enviroment Map
                    child.material.envMapIntensity = 1; // Enviroment Map strength
                    child.material.needsUpdate = true;

                    child.castShadow = true;
                    child.receiveShadow = true;

                    const tex = child.material.map;

                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                }
        });
        model.position.x = X;
        model.position.y = Y;
        model.position.z = Z;
        

        scene.add(model);

        Items.push(
        {
            mesh: model,
            box: new THREE.Box3().setFromObject(model)
        });

    });


}

const torusGeometry = new THREE.TorusGeometry( 2, 0.3, 16, 116 ); 
const torus  = new THREE.Mesh( torusGeometry, material5 ); // Create torus object and set material
torus.castShadow = true;
torus.receiveShadow = true;
scene.add( torus ); // Add torus  to scene
let TorusAnimationSpeed = 0.05 * Delta; // Torus animation speed

function loadCurrentLevel() 
{
    switch (CurrentLevel)
    {
        case 0:

            playMusic("./Resources/Music/frankum_ambient-electronic-music.mp3", 0.4);

            SkyTex = "Resources/Images/skybox.jpg";

            loadLevel("Resources/Models/TestLevel/TestLevel.glb", 1, 0);
            loadLevel("Resources/Models/TestLevel/TestLevel_01.glb", 1, 0);
            loadLevel("Resources/Models/TestLevel/TestLevel_02.glb", 1, 0);
            loadLevel("Resources/Models/TestLevel/TestLevel_03.glb", 1, 0);
            loadLevel("Resources/Models/TestLevel/TestLevel_04.glb", 1, 0);

            loadBomb(5, 4, 0);

            loadItem(-5, 3, 0);

            torus.position.x = 15;
            torus.position.z = 0;
            torus.position.y = 5;
            break;

        case 1:

            playMusic("./Resources/Music/viramiller__morning-in-the-forest.mp3", 0.4);

            SkyTex = "Resources/Images/mossy_forest_2k.png";

            loadLevel("Resources/Models/Level1/Level1_01.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_02.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_03.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_04.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_05.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_06.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_07.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_08.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_09.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_10.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_11.glb", 1, 0);
            loadLevel("Resources/Models/Level1/Level1_12.glb", 1, 0);
            
            loadBomb(7, 11, 1);
            loadBomb(7, 11, 13);
            loadBomb(33.000, 11.000, -5.000);
            loadBomb(33.000, 11.000, -1.000);
            loadBomb(33.000, 11.000, 3.000);
            loadBomb(33.000, 11.000, 7.000);
            loadBomb(33.000, 11.000, 11.000);
            loadBomb(33.000, 11.000, 15.000);
            loadBomb(33.000, 11.000, 19.000);
            loadBomb(43.000, 21.000, -5.000);
            loadBomb(43.000, 21.000, -1.000);
            loadBomb(43.000, 21.000, 3.000);
            loadBomb(43.000, 21.000, 7.000);
            loadBomb(43.000, 21.000, 11.000);
            loadBomb(43.000, 21.000, 15.000);
            loadBomb(43.000, 21.000, 19.000);
            loadBomb(13.000, 36.000, 11.000);
            loadBomb(17.000, 36.000, 11.000);
            loadBomb(21.000, 36.000, 11.000);
            loadBomb(9.000, 36.000, 11.000);
            loadBomb(13.000, 36.000, -3.000);
            loadBomb(17.000, 36.000, -3.000);
            loadBomb(21.000, 36.000, -3.000);
            loadBomb(9.000, 36.000, -3.000);
            loadBomb(9.000, 36.000, 6.000);
            loadBomb(9.000, 36.000, 1.000);
            loadBomb(21.000, 36.000, 6.000);
            loadBomb(21.000, 36.000, 1.000);
            loadBomb(2.000, 41.000, -18.000);
            loadBomb(-2.000, 41.000, -18.000);
            loadBomb(36.000, 51.000, -40.000);
            loadBomb(36.000, 51.000, -45.000);
            loadBomb(36.000, 51.000, -35.000);
            loadBomb(36.000, 51.000, -30.000);
            loadBomb(36.000, 51.000, -25.000);
            loadBomb(36.000, 51.000, -20.000);
            loadBomb(16.000, 51.000, -40.000);
            loadBomb(16.000, 51.000, -45.000);
            loadBomb(16.000, 51.000, -35.000);
            loadBomb(16.000, 51.000, -30.000);
            loadBomb(16.000, 51.000, -25.000);
            loadBomb(16.000, 51.000, -20.000);
            loadBomb(21.000, 51.000, -20.000);
            loadBomb(26.000, 51.000, -20.000);
            loadBomb(31.000, 51.000, -20.000);
            loadBomb(21.000, 51.000, -45.000);
            loadBomb(26.000, 51.000, -45.000);
            loadBomb(31.000, 51.000, -45.000);
            loadBomb(26.000, 51.000, -25.000);
            loadBomb(21.000, 51.000, -30.000);
            loadBomb(31.000, 51.000, -30.000);
            loadBomb(26.000, 51.000, -35.000);
            loadBomb(21.000, 51.000, -40.000);
            loadBomb(31.000, 51.000, -40.000);


            loadItem(0, 4, 7);  // Item
            loadItem(7, 10, 7); // Item.001
            loadItem(38, 20, 8); // Item.002
            loadItem(50, 25, 8); // Item.003
            loadItem(50, 30, -12); // Item.004
            loadItem(45, 30, -12); // Item.005
            loadItem(40, 30, -12); // Item.006
            loadItem(13, 35, 6); // Item.007
            loadItem(17, 35, 6); // Item.008
            loadItem(17, 35, 1); // Item.009
            loadItem(14, 35, 1); // Item.010
            loadItem(31, 50, -35); // Item.011
            loadItem(21, 50, -35); // Item.012
            loadItem(26, 50, -40); // Item.013
            loadItem(31, 50, -25); // Item.014
            loadItem(21, 50, -25); // Item.015
            loadItem(26, 50, -30); // Item.016

            torus.position.x = 45;
            torus.position.z = -30;
            torus.position.y = 52;

            break;

        case 2:
            playMusic("./Resources/Music/vrymaa__louxor-desert-caravan.wav", 0.4);

            SkyTex = "Resources/Images/goegap_2k.png"; 

            loadLevel("Resources/Models/Level2/Level2_01.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_02.glb", 0, 2);
            loadLevel("Resources/Models/Level2/Level2_03.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_04.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_05.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_06.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_07.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_08.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_09.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_10.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_11.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_12.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_13.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_14.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_15.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_16.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_17.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_18.glb", 1, 0);
            loadLevel("Resources/Models/Level2/Level2_19.glb", 0, 2);
            loadLevel("Resources/Models/Level2/Level2_20.glb", 0, 2);
            loadLevel("Resources/Models/Level2/Level2_21.glb", 0, 0);
            loadLevel("Resources/Models/Level2/Level2_22.glb", 0, 0);
            loadLevel("Resources/Models/Level2/Level2_23.glb", 0, 0);

            loadBomb(7, 3, -17);
            loadBomb(2, 3, -17);
            loadBomb(-3, 3, -17);
            loadBomb(-8, 3, -17);
            loadBomb(7, 3, -247);
            loadBomb(2, 3, -247);
            loadBomb(-3, 3, -247);
            loadBomb(-8, 3, -247);
            loadBomb(7, 11, -258);
            loadBomb(2, 11, -258);
            loadBomb(-3, 11, -258);
            loadBomb(-13, 11, -258);
            loadBomb(-8, 11, -258);
            loadBomb(12, 11, -258);
            loadBomb(17, 3, -247);
            loadBomb(12, 3, -247);
            loadBomb(22, 3, -247);
            loadBomb(-18, 3, -247);
            loadBomb(-23, 3, -247);
            loadBomb(-13, 3, -247);
            loadBomb(22, 3, -281);
            loadBomb(22, 3, -276);
            loadBomb(22, 3, -271);
            loadBomb(22, 3, -266);
            loadBomb(-23, 3, -281);
            loadBomb(22, 3, -286);
            loadBomb(-23, 3, -276);
            loadBomb(22, 3, -256);
            loadBomb(22, 3, -251);
            loadBomb(22, 3, -261);
            loadBomb(-23, 3, -271);
            loadBomb(-23, 3, -266);
            loadBomb(-23, 3, -286);
            loadBomb(-23, 3, -256);
            loadBomb(-23, 3, -251);
            loadBomb(-23, 3, -261);
            loadBomb(7, 3, -292);
            loadBomb(2, 3, -292);
            loadBomb(-3, 3, -292);
            loadBomb(-8, 3, -292);
            loadBomb(17, 3, -292);
            loadBomb(12, 3, -292);
            loadBomb(22, 3, -292);
            loadBomb(-18, 3, -292);
            loadBomb(-23, 3, -292);
            loadBomb(-13, 3, -292);
            loadBomb(7, 11, -282);
            loadBomb(2, 11, -282);
            loadBomb(-3, 11, -282);
            loadBomb(-13, 11, -282);
            loadBomb(-8, 11, -282);
            loadBomb(12, 11, -282);
            loadBomb(12, 11, -263);
            loadBomb(12, 11, -268);
            loadBomb(12, 11, -273);
            loadBomb(12, 11, -278);
            loadBomb(12, 11, -263);
            loadBomb(12, 11, -268);
            loadBomb(12, 11, -278);
            loadBomb(-13, 11, -273);
            loadBomb(-13, 11, -263);
            loadBomb(-13, 11, -268);
            loadBomb(-13, 11, -278);
            loadBomb(5, -19, -118);
            loadBomb(-3, -14, -155);
            loadBomb(-5, -19, -118);
            loadBomb(-4, -10, -168);
            loadBomb(5, -19, -139);
            loadBomb(-5, -19, -139);
            loadBomb(5, -19, -129);
            loadBomb(0, -19, -124);
            loadBomb(-5, -19, -129);
            loadBomb(-10, -19, -124);
            loadBomb(10, -19, -124);
            loadBomb(0, -19, -134);
            loadBomb(-10, -19, -134);
            loadBomb(10, -19, -134);

            loadItem(0, 4, 7);
            loadItem(0, 2, -34);
            loadItem(-8, 2, -51);
            loadItem(-8, 2, -70);
            loadItem(3, 2, -80);
            loadItem(0, 2, -92);
            loadItem(2, -15, -155);
            loadItem(-9, -11, -168);
            loadItem(-9, -6, -182);
            loadItem(-3, -2, -196);
            loadItem(4, 1, -211);
            loadItem(0, -20, -118);
            loadItem(-10, -20, -118);
            loadItem(10, -20, -118);
            loadItem(0, -20, -129);
            loadItem(-10, -20, -129);
            loadItem(10, -20, -129);
            loadItem(0, -20, -139);
            loadItem(-10, -20, -139);
            loadItem(10, -20, -139);
            loadItem(-5, -20, -124);
            loadItem(5, -20, -124);
            loadItem(-5, -20, -134);
            loadItem(5, -20, -134);

            torus.position.x = 0;
            torus.position.z = -270;
            torus.position.y = 18;

            break;

    }

    createskybox();
}

function collectUvMaps(material, uvANIM)
{
    const maps = [
        material.map,
        material.normalMap,
        material.roughnessMap,
        material.metalnessMap,
        material.specularMap
    ];

    for (const tex of maps)
    {
        if (!tex) continue;

        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;

        uvAnimatedTextures.push({
            texture: tex,
            mode: uvANIM,
            speed: 0.002 * Delta
        });
    }
}

const CapsuleGeometry = new THREE.CapsuleGeometry( 0.0001, 0.0001, 4, 8, 1 );
const Player = new THREE.Mesh(CapsuleGeometry, material5);
const PlayerCollison = new THREE.Mesh(CapsuleGeometry, material5);
scene.add(Player);
const PlayerReflectivity = 0.5;
const PlayerModel = new THREE.Group();
Player.add(PlayerModel);

loader.load('Resources/Models/Player.glb', (gltf) => {

    const envLoader = new THREE.TextureLoader();

    const environmentMap = envLoader.load(SkyTex, (tex) => //Convert Sky Texture to Enviroment Map
    {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.colorSpace = THREE.SRGBColorSpace;
    });

    const model = gltf.scene;

    model.scale.set(1, 1, 1);
    model.position.set(0, -1, 0);

    model.traverse((child) => {
        if (child.isMesh) 
        {
            child.material.envMap = environmentMap; //Enviroment Map
            child.material.envMapIntensity = PlayerReflectivity; // Enviroment Map strength
            child.material.needsUpdate = true;

            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    PlayerModel.add(model);
});

let WheelModel = null;

loader.load('Resources/Models/PlayerWheel.glb', (gltf) => {

    WheelModel = gltf.scene;

    WheelModel.scale.set(1, 1, 1);
    WheelModel.position.set(0, -1, 0);

    WheelModel.traverse((child) => {
        if (child.isMesh) {
            child.material.envMap = environmentMap;
            child.material.envMapIntensity = PlayerReflectivity;
            child.material.needsUpdate = true;

            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    PlayerModel.add(WheelModel);
});

function LoseLife()
{
    lives -= 10;

    Player.position.x = 0;
    Player.position.y = 55;
    Player.position.z = 15;
}

function AddScore()
{
    score += 100; 
}

Player.position.x = 0;
Player.position.y = 55;
Player.position.z = 15;
CapsuleGeometry.scale(1, 1, 1); // scale the sphere

const Light = new THREE.DirectionalLight( 0xffffff, 3 ); // soft white light// White directional light at half intensity shining from the top.
Light.position.set(20, 40, 20);
Light.target.position.set(0, 0, 0);Light.castShadow = true;
scene.add( Light ); // Add directional light to scene

const cameraZ = 25; // Camera Distance
const cameraY = 8;
camera.rotation.x = -0.27


// shadow settings
let shadow = 55;
Light.shadow.mapSize.set(2048, 2048);
Light.shadow.bias = -0.0001; // Small negative bias to reduce acne
Light.shadow.normalBias = 0.01; // Helps with peter-panning

Light.shadow.camera.left = -shadow;
Light.shadow.camera.right = shadow;
Light.shadow.camera.top = shadow;
Light.shadow.camera.bottom = -shadow;

Light.shadow.camera.near = 0.1;
Light.shadow.camera.far = 50000;

const gravity = -0.03; // Gravity speed
const Speed = 0.35;
const JumpForce = 0.85;

let velocityY = 0;     // Vertical speed
let velocityX = 0;     // Horizontal speed
let velocityZ = 0;     // Forwrds and Backwards speed

let canJump; // Can the player Jump?

const LivesImage = document.getElementById("lives").innerHTML;
const ScoreImage = document.getElementById("score").innerHTML;
const FinishScoreImage = document.getElementById("finish-score").innerHTML;

function RestartLevel()  // Animation Function
{

    score = 0;

    lives = 100;

    Player.position.x = 0;
    Player.position.y = 55;
    Player.position.z = 15;

    loadCurrentLevel();
}


function animate()  // Animation Function
{
    stats.update(); //Update the stats inside the animation loop

    document.getElementById("score").innerHTML = (ScoreImage + score);
    document.getElementById("finish-score").innerHTML = (FinishScoreImage + score);
    document.getElementById("lives").innerHTML = (LivesImage + lives);

    if (!gamePaused  || !gameStarted) 
    {

        Player.position.x += velocityX  * Delta;

        Player.position.z += velocityZ * Delta;
        
        if((velocityX || velocityZ) > 0 || (velocityX || velocityZ) < 0)
        {
            WheelModel.rotation.x += Speed;
        }

        if (Player.position.y <= -20)
        {
            Player.position.x = 0;
            Player.position.y = 55;
            Player.position.z = 15;
        }

        torus.rotation.y += TorusAnimationSpeed; // rotate torus

        // Apply gravity
        velocityY += gravity * Delta;
        Player.position.y += velocityY * Delta;
        

        // Compute player bounding box
        const playerBox = new THREE.Box3().setFromObject(Player);

        const TorusBox = new THREE.Box3().setFromObject(torus);

        canJump = false;
        
        // if (groundBox) {

        //     // Check collision
        //    // if (playerBox.min.y <= groundBox.max.y) {
        //     if (playerBox.intersectsBox(groundBox)) {
        //         // COLLIDED WITH GROUND
        //         Player.position.y = 0.35 +  groundBox.max.y + (Player.geometry.parameters.radiusTop || 1);
        //         velocityY = 0; // Stop falling
        //         canJump = true;
        //     }
        //     else
        //     {
        //         canJump = false;
        //     }
        // }

        for (const ground of grounds) 
        {
            if (playerBox.intersectsBox(ground)) //if player interects ground
            {
                const result = resolveCollision(playerBox, ground, Player);

                if (result === "ground") 
                {
                    canJump = true;
                }

                // Recalculate playerBox after moving
                playerBox.setFromObject(Player);
            }
            
        }

        if (playerBox.intersectsBox(TorusBox)) //if player interects ground
        {
            gamePaused = true;
            gameUI.classList.add("hidden");
            finishMenu.classList.remove("hidden");
        }

        //for (const bomb of Bombs)
        for (let b = Bombs.length - 1; b >= 0; b--) 
            {
            
                const bomb = Bombs[b];
                if (playerBox.intersectsBox(bomb.box)) //if player interects ground
                {
                    playSFX("damage");
                    LoseLife();

                    // Recalculate playerBox after moving
                    playerBox.setFromObject(Player);

                    scene.remove(bomb.mesh);
                    Bombs.splice(b, 1); // remove from array
                }
                
            }

        if (lives <= 0)
        {
            gamePaused = true;
            GameOverMenu.classList.remove("hidden");
        }

       // for (const item of Items) 
        for (let i = Items.length - 1; i >= 0; i--) 
        {
        
            const item = Items[i];

                item.mesh.rotation.y += 0.025;
                item.box.setFromObject(item.mesh);

                if (playerBox.intersectsBox(item.box)) //if player interects ground
                {
                    playSFX("pickup");
                    AddScore();

                    // Recalculate playerBox after moving
                    playerBox.setFromObject(Player);

                    scene.remove(item.mesh);
                    Items.splice(i, 1); // remove from array
                }
                
            }

        camera.position.x =  Player.position.x;
        camera.position.z = Player.position.z + cameraZ;
        camera.position.y = (cameraY + Player.position.y);
        
        for (const uv of uvAnimatedTextures)
        {
            if (uv.mode === 1) 
            {
                uv.texture.offset.x += uv.speed; // scroll X
            }
            else if (uv.mode === 2) 
            {
                uv.texture.offset.y += uv.speed; // scroll Y
            }
        }

        renderer.render(scene, camera);
        return;
    }

}

function resolveCollision(playerBox, ground, player) {
    const overlap = new THREE.Vector3();

    // Compute overlap in each axis
    overlap.x = Math.min(
        playerBox.max.x - ground.min.x,
        ground.max.x - playerBox.min.x
    );
    overlap.y = Math.min(
        playerBox.max.y - ground.min.y,
        ground.max.y - playerBox.min.y
    );
    overlap.z = Math.min(
        playerBox.max.z - ground.min.z,
        ground.max.z - playerBox.min.z
    );

    // Find smallest axis (the direction to push out)
    const minAxis = Math.min(overlap.x, overlap.y, overlap.z);

    if (minAxis === overlap.y) {
        // vertical collision
        if (player.position.y > ground.max.y) 
            {
            player.position.y += overlap.y ; // push up
            velocityY = 0;
            return "ground";
        } 
        else 
        {
            player.position.y -= overlap.y ; // hit ceiling
            velocityY = Math.min(velocityY, 0) ;
            return "ceiling";
        }
    }

    if (minAxis === overlap.x) {
        // horizontal X collision
        if (player.position.x > ground.max.x) 
        {
            player.position.x += overlap.x ;

        }
        else 
        {
            player.position.x -= overlap.x ;
            velocityX = 0;
            return "wall";
        }
    }

    if (minAxis === overlap.z) {
        // horizontal Z collision
        if (player.position.z > ground.max.z) 
        {
                player.position.z += overlap.z ;
        }
        else 
        {
            player.position.z -= overlap.z ;
            velocityZ = 0;
            return "wall";
        }
    }
}

window.addEventListener("keydown", (event) => 
    {
        console.log(Event)

        switch (event.code)
        {
            case "KeyA":
                console.log("KeyA")
                velocityX = -Math.abs(Speed) ;
                Player.rotation.y =  90 * Math.PI / 180;
                break

            case "KeyD":
                console.log("KeyD")
                velocityX = Speed ;
                Player.rotation.y =  -90 * Math.PI / 180;
                break

            case "KeyW":
                console.log("KeyW")
                velocityZ = -Math.abs(Speed) ;
                Player.rotation.y = 0;
                break
    
            case "KeyS":
                console.log("KeyS")
                velocityZ = Speed ;
                Player.rotation.y =  180 * Math.PI / 180;
                break

            case "KeyL":
                console.log("KeyL")
                if (canJump)
                {
                velocityY = JumpForce ;
                }
                break
            
            default:
                break


        }
    
    });

    window.addEventListener("keyup", (event) => 
    {
        switch (event.code)
        {
            case "KeyA":
                velocityX = 0;
                break

            case "KeyD":
                velocityX = 0; 
                break

            case "KeyW":
                velocityZ = 0;
                break

            case "KeyS":
                velocityZ = 0; 
                break
            
            case "KeyL":
                velocityY = 0;
                break
            
            default:
                break


        }
    });

function onWindowresize() // function to resize when when changed
{
    camera.aspect = window.innerWidth / window.innerHeight; // set the aspect ratio to match new window size

    camera.updateProjectionMatrix(); // update the camera's frustum

    renderer.setSize(window.innerWidth, window.innerHeight); // Update size of the renderer and camera
}

window.addEventListener("resize", onWindowresize); // to activate function window size is changed

const createskybox = () => // Skybox function
{
    let bgMesh;

    const loader = new THREE.TextureLoader();
    loader.load
    (
        SkyTex, 
        function(texture)
        {
            // create sphere
            let sphereGeometry = new THREE.SphereGeometry( 100, 60, 40 );  // Create new geometry met and set its X, Y & Z scale

            // set the sphere texture
            const SphereMaterial = new THREE.MeshBasicMaterial // Basic Material
            ( { 
                map:texture,
                side: THREE.DoubleSide
            } );

            // scale the sphere
            sphereGeometry.scale(-25, 25, 22);
            
            bgMesh = new THREE.Mesh(sphereGeometry, SphereMaterial);
            scene.add(bgMesh)
        } 
    );
}


// UI ELEMENTS
const mainMenu = document.getElementById("main-menu");
const levelSelect = document.getElementById("level-select");
const gameUI = document.getElementById("game-ui");
const pauseMenu = document.getElementById("pause-menu");
const finishMenu = document.getElementById("finish-menu");
const GameOverMenu = document.getElementById("game-over-menu");

const level0Btn = document.getElementById("level-0");
const level1Btn = document.getElementById("level-1");
const level2Btn = document.getElementById("level-2");

const playBtn = document.getElementById("play-game-btn");
const QuitToTitleBtn = document.getElementById("quit-to-title-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartbtn = document.getElementById("restart-btn");
const restartgamebtn = document.getElementById("restart-game-btn");

QuitToTitleBtn.addEventListener("click", () => 
{
    location.reload();
});

// Start Game
playBtn.addEventListener("click", () => 
{
    mainMenu.classList.add("hidden");
    levelSelect.classList.remove("hidden");
    
});

// Level 0
level0Btn.addEventListener("click", () => 
{
    CurrentLevel = 0;
    levelSelect.classList.add("hidden");
    gameUI.classList.remove("hidden");
    loadCurrentLevel();
    gameStarted = true;
});

// Level 1
level1Btn.addEventListener("click", () => 
{
    CurrentLevel = 1;
    levelSelect.classList.add("hidden");
    gameUI.classList.remove("hidden");
    loadCurrentLevel();
    gameStarted = true;
});

// Level 2
level2Btn.addEventListener("click", () => 
{
    CurrentLevel = 2;
    levelSelect.classList.add("hidden");
    gameUI.classList.remove("hidden");
    loadCurrentLevel();
    gameStarted = true;
});

// Pause the game
pauseBtn.addEventListener("click", () => 
{
    gamePaused = true;
    pauseMenu.classList.remove("hidden");
});

// Resume
resumeBtn.addEventListener("click", () => 
{
    gamePaused = false;
    pauseMenu.classList.add("hidden");
});

// Restart from Game Over
restartgamebtn.addEventListener("click", () => 
{
    RestartLevel();
    gamePaused = false;
    gameUI.classList.remove("hidden");
    GameOverMenu.classList.add("hidden");
});

// restart from finish menu
restartbtn.addEventListener("click", () => 
{
    RestartLevel();
    gamePaused = false;
    gameUI.classList.remove("hidden");
    finishMenu.classList.add("hidden");
});