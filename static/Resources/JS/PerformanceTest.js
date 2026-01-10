import * as THREE from "three"; // Import Three.js
import { GLTFLoader } from "https://unpkg.com/three@0.169.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.169.0/examples/jsm/controls/OrbitControls.js";
import Stats from 'https://unpkg.com/three@0.169.0/examples/jsm/libs/stats.module.js';

const scene = new THREE.Scene(); // Initialise 3D scene

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 20000 ); // Create Camera object
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Initialise 3D renderer + anti-aliasing

renderer.setSize( window.innerWidth, window.innerHeight ); // Set Render Size

renderer.setAnimationLoop( animate ); // Start animation

document.body.appendChild( renderer.domElement ); // add the renderer to the HTML 

let controls; //create orbit controls

let stats; //create stats

stats = new Stats(); // Declare a new Stats object 

document.body.appendChild( stats.dom ); // add the Stats object to the canvas

const toursGeometry = new THREE.TorusGeometry( 10, 3.5, 16, 16 ); 

for (let i = 0; i < 5000; i ++ )
{
    const object = new THREE.Mesh(toursGeometry, new THREE.MeshPhongMaterial
    (
        {
            color: 0xfcc200  , // Base Colour
            specular: 0xffffff, //Specular colour
            shininess: 100, // How shiny the material is
            emissive: 0x422c00, // Emissive colour
            reflectivity: 1, // How much the environment map affects the surface
            refractionRatio: 1, // Index of refraction (IOR)
        }
    )
    )

    object.position.x = Math.random() * 800 - 400; ////800 is the overallrange of the x value. -400 is the starting point of the x value ​
    object.position.y = Math.random() * 800 - 400;
    object.position.z = Math.random() * 800 - 400;

    object.rotation.x = Math.random() * 2 * Math.PI; // 2 * Math.PI = 360 degree
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    object.scale.x = Math.random() + 0.5; // //0.5 is the scale range you want to achieve
    object.scale.y = Math.random() + 0.5;
    object.scale.setZ = Math.random() + 0.5;

    scene.add(object);

}

const radius = 15;
const widthSegments = 32;
const heightSegments = 16;
const pointGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
const pointMaterial = new THREE.PointsMaterial
({
    color: "red"  , // Base Colour
    sizeAttenuation: false, // whether size of individual points is attenuated by the camera depth
    size: 20,     // individual point size
});

const pointMesh = new THREE.Points(pointGeometry, pointMaterial);

scene.add(pointMesh);

const ambientLight = new THREE.HemisphereLight(

    0xddeeff, // sky color ​

    0x202020, // ground color​

    0.8, // intensity​

); 

const Light = new THREE.DirectionalLight( 

    0xffffff, // sky color ​

    3 // intensity​

); 

scene.add( Light ); // Add directional light to scene
scene.add( ambientLight ); // Add ambient light to scene


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
        'Resources/Images/matrix-background.jpg', // set the sphere texture
        function(texture)
        {
            // create sphere
            let sphereGeometry = new THREE.SphereGeometry( 1000, 60, 40 );  // Create new geometry met and set its X, Y & Z scale

            const SphereMaterial = new THREE.MeshBasicMaterial // Basic Material
            ( { 
                map:texture,
                side: THREE.DoubleSide
            } );
            
            sphereGeometry.scale(8, 8, 8);// scale the sphere
            
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


function animate() 
{ // Animation Function

  stats.update(); //Update the stats inside the animation loop

  pointMesh.rotation.x += 0.01;
  pointMesh.rotation.y += 0.02;

  renderer.render( scene, camera ); // Render Scene

}
