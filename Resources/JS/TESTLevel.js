import * as THREE from "three"; // Import Three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene(); // Initialise 3D scene

const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 11000 ); // Create Camera object

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Initialise 3D renderer + anti-aliasing

renderer.setSize( window.innerWidth, window.innerHeight ); // Set Render Size

renderer.setAnimationLoop( animate ); // Start animation
renderer.shadowMap.enabled = true;

document.body.appendChild( renderer.domElement ); // add the renderer to the HTML

let model = null; // Declare model globally
let groundBox = null;

const material5 = new THREE.MeshPhongMaterial // Material that can simulate shiny surfaces with specular highlights
( { 
    color: 0xfcc200  , // Base Colour
    specular: 0xffffff, //Specular colour
    shininess: 100, // How shiny the material is
    emissive: 0x422c00, // Emissive colour
    reflectivity: 1, // How much the environment map affects the surface
    refractionRatio: 1, // Index of refraction (IOR)
    
} );

//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const CapsuleGeometry = new THREE.CapsuleGeometry( 1, 1, 4, 8, 1 );
const Player = new THREE.Mesh( CapsuleGeometry, material5 ); // Create cube object and set material
scene.add(Player);
Player.position.x = -15;
Player.position.y = 20;
Player.position.z = 15;
CapsuleGeometry.scale(1, 1, 1); // scale the sphere


const loader = new GLTFLoader();// Create a GLTFLoader instance
loader.load // Load the GLTF model
(
    'Resources/Models/TestLevel/TestLevel.glb', // Path to the GLTF file
    (gltf) => 
    {
        model = gltf.scene;
        model.castShadow = true;
        model.receiveShadow = true;
        scene.add(model); // Add the loaded scene to your Three.js scene
        
        groundBox = new THREE.Box3().setFromObject(model);
    },
);

const Groundgeometry = new THREE.BoxGeometry( 1, 1, 1 ); // Create new geometry met and set its X, Y & Z scale


const Light = new THREE.DirectionalLight( 0xffffff, 3 ); // soft white light// White directional light at half intensity shining from the top.
Light.castShadow = true;
scene.add( Light ); // Add directional light to scene

camera.position.z = 42; // Camera Distance
camera.position.y = 15;
camera.rotation.x = -0.27

const gravity = -0.01; //gravity speed
let velocityY = 0;     // vertical speed

function animate()  // Animation Function
{
       
    if (groundBox) {

        // Apply gravity
        velocityY += gravity;
        Player.position.y += velocityY;
    
        // Compute player bounding box
        const playerBox = new THREE.Box3().setFromObject(Player);
    
        // Check collision
       // if (playerBox.min.y <= groundBox.max.y) {
        if (playerBox.intersectsBox(groundBox)) {
    
            // COLLIDED WITH GROUND
            Player.position.y = 0.35 +  groundBox.max.y + (Player.geometry.parameters.radiusTop || 1);
            velocityY = 0; // Stop falling
        }
    }
  
    renderer.render( scene, camera ); // Render Scene
}

window.addEventListener("keydown", (event) => 
    {
        console.log(Event)

        switch (event.code)
        {
            case "KeyA":
                console.log("KeyA")
                Player.position.x -= 1;
                break

            case "KeyD":
                console.log("KeyD")
                Player.position.x += 1;
                break

            case "KeyW":
                console.log("KeyW")
                Player.position.z -= 1;
                break
    
            case "KeyS":
                console.log("KeyS")
                Player.position.z += 1;
                break

            case "Space":
                console.log("Space")
                Player.position.y += 5;
                break
    


        }
    
    }); // to activate function window size is changed

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
        'Resources/Images/skybox.jpg', 
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
            sphereGeometry.scale(-1, 1, 1);
            
            bgMesh = new THREE.Mesh(sphereGeometry, SphereMaterial);
            scene.add(bgMesh)
            
        } 
    );

}

createskybox();