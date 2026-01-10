import * as THREE from "three"; // Import Three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene(); // Initialise 3D scene

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 ); // Create Camera object
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Initialise 3D renderer + anti-aliasing

renderer.setSize( window.innerWidth, window.innerHeight ); // Set Render Size

renderer.setAnimationLoop( animate ); // Start animation

document.body.appendChild( renderer.domElement ); // add the renderer to the HTML 

let controls; //create orbit controls

// create indicator for start or stop status
let Started = false;

let model = null; // Declare model globally

const material = new THREE.MeshBasicMaterial // Basic Material
( { 
    color: 0x00ff00 // Base Colour
} );


const material4 = new THREE.MeshLambertMaterial // Non-physically based Lambertian Material
( { 
    color: 0x54c0da, // Base Colour
    emissive: 0x09232a, // Emissive colour
    reflectivity: 1, // How much the environment map affects the surfac
    refractionRatio: 1, // Index of refraction (IOR)
    
} );

const material5 = new THREE.MeshPhongMaterial // Material that can simulate shiny surfaces with specular highlights
( { 
    color: 0xfcc200  , // Base Colour
    specular: 0xffffff, //Specular colour
    shininess: 100, // How shiny the material is
    emissive: 0x422c00, // Emissive colour
    reflectivity: 1, // How much the environment map affects the surface
    refractionRatio: 1, // Index of refraction (IOR)
    
} );

    // Create a GLTFLoader instance
    const loader = new GLTFLoader();

    // Load the GLTF model
    loader.load
    (
        'Resources/Models/sega_mega_drive.glb', // Path to the GLTF file
        (gltf) => 
        {
            // Add the loaded scene to your Three.js scene
            model = gltf.scene;
            scene.add(model);
        },
    );

const Light = new THREE.DirectionalLight( 0xffffff, 3 ); // soft white light// White directional light at half intensity shining from the top.

scene.add( Light ); // Add directional light to scene


camera.position.z = 35; // Camera Distance

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
        'Resources/Images/matrix-background.jpg', 
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
            sphereGeometry.scale(8, 8, 8);
            
            bgMesh = new THREE.Mesh(sphereGeometry, SphereMaterial);
            scene.add(bgMesh)
            
        } 
    );

}

createskybox();


const createControls=() => // control function
{ 
    //initiate the control
    controls = new OrbitControls(camera, renderer.domElement);

    //update controls
    controls.update()
}

createControls();

const Start=()=> //button function
{
    Started = true;
} 
document.getElementById("StartButton").addEventListener("click", Start) //create event listener for start button

const Stop=()=> //button function
{
    Started = false;
} 
document.getElementById("StopButton").addEventListener("click", Stop) //create event listener for stop button

const Up=()=> //button function
{
    Started = true;
} 
document.getElementById("StartButton").addEventListener("click", Start) //create event listener for start button

let RotationCoordinates = 0;

let XPosition = 0;
let YPosition = 0;
let ZPosition = 0;

const MoveUp =()=>
{
    model.position.y += 1;
}

const MoveDown =()=>
{
    model.position.y -= 1;
}

const MoveLeft =()=>
{
    model.position.x -= 1;
}

const MoveRight =()=>
{
    model.position.x += 1;
}


function animate() 
{ // Animation Function

  if (model) {
    if (Started) {
      // Rotate the model
      model.rotation.y += 0.005;
      RotationCoordinates = model.rotation.y;
    }

    XPosition = model.position.x;
    YPosition = model.position.y;
    ZPosition = model.position.z;
  }



  document.getElementById("UpButton").addEventListener("click", MoveUp);
  document.getElementById("DownButton").addEventListener("click", MoveDown);
  document.getElementById("LeftButton").addEventListener("click", MoveLeft);
  document.getElementById("RightButton").addEventListener("click", MoveRight);

  renderer.render( scene, camera ); // Render Scene

  document.getElementById("Coordinates").innerHTML = ("Rotation Coordinates: " + RotationCoordinates.toFixed(3));
  document.getElementById("XPosition").innerHTML = ("X Position: " + XPosition.toFixed(2));
  document.getElementById("YPosition").innerHTML = ("Y Position: " + YPosition.toFixed(2));
  document.getElementById("ZPosition").innerHTML = ("Z Position: " + ZPosition.toFixed(2));
  

}
