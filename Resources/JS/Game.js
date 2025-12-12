import * as THREE from "three"; // Import Three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene(); // Initialise 3D scene

const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 11000 ); // Create Camera object

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Initialise 3D renderer + anti-aliasing

renderer.setSize( window.innerWidth, window.innerHeight ); // Set Render Size

renderer.setAnimationLoop( animate ); // Start animation
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

document.body.appendChild( renderer.domElement ); // add the renderer to the HTML

// GAME STATE
let gamePaused = false;

let CurrentLevel = 1;

const grounds = [];

const material5 = new THREE.MeshPhongMaterial // Material that can simulate shiny surfaces with specular highlights
( { 
    color: 0xfcc200  , // Base Colour
    specular: 0xffffff, //Specular colour
    shininess: 100, // How shiny the material is
    emissive: 0x422c00, // Emissive colour
    reflectivity: 1, // How much the environment map affects the surface
    refractionRatio: 1, // Index of refraction (IOR)
    
} );


const loader = new GLTFLoader();

function loadLevel(path) 
{
    loader.load(path, (gltf) => 
    {
        const model = gltf.scene;
        model.traverse((child) => 
        {
            if (child.isMesh)
                { 
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
        });
        scene.add(model);
        grounds.push(new THREE.Box3().setFromObject(model));
    });
}

switch (CurrentLevel)
{

    case 0:
        loadLevel("Resources/Models/TestLevel/TestLevel.glb");
        loadLevel("Resources/Models/TestLevel/TestLevel_01.glb");
        loadLevel("Resources/Models/TestLevel/TestLevel_02.glb");
        loadLevel("Resources/Models/TestLevel/TestLevel_03.glb");
        loadLevel("Resources/Models/TestLevel/TestLevel_04.glb");
        break;

    case 1:
        loadLevel("Resources/Models/Level1/Level1_01.glb");
        loadLevel("Resources/Models/Level1/Level1_02.glb");
        loadLevel("Resources/Models/Level1/Level1_03.glb");
        loadLevel("Resources/Models/Level1/Level1_04.glb");
        loadLevel("Resources/Models/Level1/Level1_05.glb");
        loadLevel("Resources/Models/Level1/Level1_06.glb");
        loadLevel("Resources/Models/Level1/Level1_07.glb");
        loadLevel("Resources/Models/Level1/Level1_08.glb");
        loadLevel("Resources/Models/Level1/Level1_09.glb");
        loadLevel("Resources/Models/Level1/Level1_10.glb");
        loadLevel("Resources/Models/Level1/Level1_11.glb");
        loadLevel("Resources/Models/Level1/Level1_12.glb");
        break;

}



//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const CapsuleGeometry = new THREE.CapsuleGeometry( 1, 1, 4, 8, 1 );
const Player = new THREE.Mesh( CapsuleGeometry, material5 ); // Create cube object and set material
Player.receiveShadow = true;
Player.castShadow = true;
scene.add(Player);
Player.position.x = 0;
Player.position.y = 15;
Player.position.z = 15;
CapsuleGeometry.scale(1, 1, 1); // scale the sphere

const Light = new THREE.DirectionalLight( 0xffffff, 3 ); // soft white light// White directional light at half intensity shining from the top.
Light.position.set(20, 40, 20);
Light.target.position.set(0, 0, 0);Light.castShadow = true;
scene.add( Light ); // Add directional light to scene

camera.position.z = 42; // Camera Distance
camera.position.y = 15;
camera.rotation.x = -0.27


// shadow settings
let shadow = 25;
Light.shadow.mapSize.set(2048, 2048);
Light.shadow.bias = -0.0001; // Small negative bias to reduce acne
Light.shadow.normalBias = 0.02; // Helps with peter-panning

Light.shadow.camera.left = -shadow;
Light.shadow.camera.right = shadow;
Light.shadow.camera.top = shadow;
Light.shadow.camera.bottom = -shadow;

Light.shadow.camera.near = 1;
Light.shadow.camera.far = 200;

const gravity = -0.02; // Gravity speed
const Speed = 0.25;
const JumpForce = 0.75;

let velocityY = 0;     // Vertical speed
let velocityX = 0;     // Horizontal speed
let velocityZ = 0;     // Forwrds and Backwards speed

let canJump; // Can the player Jump?

function animate()  // Animation Function
{
    if (!gamePaused) 
    {
        Player.position.x += velocityX;
        camera.position.x += velocityX;

        Player.position.z += velocityZ;
        camera.position.z += velocityZ;

        // Apply gravity
        velocityY += gravity;
        Player.position.y += velocityY;
        camera.position.y = (8 + Player.position.y);

        // Compute player bounding box
        const playerBox = new THREE.Box3().setFromObject(Player);

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
            if (playerBox.intersectsBox(ground)) 
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
        if (player.position.y > ground.max.y) {
            player.position.y += overlap.y; // push up
            velocityY = 0;
            return "ground";
        } else {
            player.position.y -= overlap.y; // hit ceiling
            velocityY = Math.min(velocityY, 0);
            return "ceiling";
        }
    }

    if (minAxis === overlap.x) {
        // horizontal X collision
        if (player.position.x > ground.max.x) player.position.x += overlap.x;
        else player.position.x -= overlap.x;
        velocityX = 0;
        return "wall";
    }

    if (minAxis === overlap.z) {
        // horizontal Z collision
        if (player.position.z > ground.max.z) player.position.z += overlap.z;
        else player.position.z -= overlap.z;
        velocityZ = 0;
        return "wall";
    }
}

window.addEventListener("keydown", (event) => 
    {
        console.log(Event)

        switch (event.code)
        {
            case "KeyA":
                console.log("KeyA")
                velocityX = -Math.abs(Speed);
                break

            case "KeyD":
                console.log("KeyD")
                velocityX = Speed;
                break

            case "KeyW":
                console.log("KeyW")
                velocityZ = -Math.abs(Speed);
                break
    
            case "KeyS":
                console.log("KeyS")
                velocityZ = Speed;
                break

            case "KeyL":
                console.log("KeyL")
                if (canJump)
                {
                velocityY = JumpForce;
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

   let SkyTex;

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
            sphereGeometry.scale(-5, 5, 5);
            
            bgMesh = new THREE.Mesh(sphereGeometry, SphereMaterial);
            scene.add(bgMesh)
            
        } 
    );

}

    switch (CurrentLevel)
    {
        case 0:
            SkyTex = "Resources/Images/skybox.jpg";
            break;

        case 1:
            SkyTex = "Resources/Images/mossy_forest_2k.png";
            break;
    }

createskybox();

// UI ELEMENTS
const gameUI = document.getElementById("game-ui");
const pauseMenu = document.getElementById("pause-menu");

const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const quitBtn = document.getElementById("quit-btn");

// Pause the game
pauseBtn.addEventListener("click", () => {
    gamePaused = true;
    pauseMenu.classList.remove("hidden");
});

// Resume
resumeBtn.addEventListener("click", () => {
    gamePaused = false;
    pauseMenu.classList.add("hidden");
});

// Quit → reload the page
quitBtn.addEventListener("click", () => {
    location.reload();
});