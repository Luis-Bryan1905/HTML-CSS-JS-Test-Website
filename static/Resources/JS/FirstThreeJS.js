import * as THREE from "three"; // Import Three.js

const scene = new THREE.Scene(); // Initialise 3D scene

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); // Create Camera object

const renderer = new THREE.WebGLRenderer({ antialias: true }); // Initialise 3D renderer + anti-aliasing

renderer.setSize( window.innerWidth, window.innerHeight ); // Set Render Size

renderer.setAnimationLoop( animate ); // Start animation

document.body.appendChild( renderer.domElement ); // add the renderer to the HTML

const geometry = new THREE.BoxGeometry( 1, 1, 1 ); // Create new geometry met and set its X, Y & Z scale

const sphereGeometry = new THREE.SphereGeometry( 0.65, 16, 16 );  // Create new geometry met and set its X, Y & Z scale

const torusGeometry = new THREE.TorusGeometry( 1.5, 0.3, 16, 116 ); 

const material = new THREE.MeshBasicMaterial // Basic Material
( { 
    color: 0x00ff00 // Base Colour
} );

const material2 = new THREE.MeshBasicMaterial // Basic Material
( { 
    color: 0xFF0000 // Base Colour
} );

const material3 = new THREE.MeshBasicMaterial // Basic Material
( { 
    color: 0xCC6CE7 // Base Colour
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

const cube = new THREE.Mesh( geometry, material ); // Create cube object and set material
const cube2 = new THREE.Mesh( geometry, material3 ); // Create cube object and set material
const torus  = new THREE.Mesh( torusGeometry, material5 ); // Create torus object and set material
const sphere  = new THREE.Mesh( sphereGeometry, material2 ); // Create sphere object and set material


const Light = new THREE.DirectionalLight( 0xffffff, 3 ); // soft white light// White directional light at half intensity shining from the top.

scene.add( Light ); // Add directional light to scene
scene.add( cube ); // Add cube to scene
scene.add( cube2 ); // Add cube to scene
scene.add( sphere ); // Add sphere to scene
scene.add( torus ); // Add torus  to scene

let MovingLeft = false; // which way torus is moving
let MoveSpeed = 0.025; // movement speed
let CubeAnimationSpeed = 0.025; // Cube animation speed
let TorusAnimationSpeed = 0.02; // Torus animation speed

camera.position.z = 4; // Camera Distance

function animate() { // Animation Function

  cube.rotation.x += CubeAnimationSpeed; // rotate cube

  cube2.rotation.y += CubeAnimationSpeed; // rotate cube

  torus.rotation.x += TorusAnimationSpeed; // rotate torus

  torus.rotation.y += TorusAnimationSpeed; // rotate torus

    if (MovingLeft == false) 
    {
        torus.position.x += MoveSpeed; // Move torus right

        if (torus.position.x >= 3) // right boundary
            { 

            MovingLeft = true;
            
            }
    } 

    else 

    {
        torus.position.x -= MoveSpeed; // Move torus left

        if (torus.position.x <= -3) // left boundary
            { 

            MovingLeft = false;

            }
    }

  renderer.render( scene, camera ); // Render Scene

}

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
