import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import cabbanaGLB from '../../../assets/cabbana_new.glb'
import singleStructure from '../../../assets/final_one.glb'
import bladeGlb from '../../../assets/blade.glb'

import { GUI } from 'dat.gui'


let origin_model; //glb files
let model_size; // origin model size
let row_count;
let col_count;
let inc_r_step = 1; // length scale size
let inc_c_step = 1; // width scale size
let inc_h_step = 1; // width scale size

let group = new THREE.Group(); // whole panel
let r_group = new THREE.Group(); // one row

let origin_stick; // stick

const addWidthRange = document.getElementById('widthRange');
const addDepthRange = document.getElementById('depthRange');
const addHeightRange = document.getElementById('heightRange');


export class SceneViewer {


    constructor() {

        //Canvas
        this._canvas = document.getElementById('cabbana-canvas');
        this._canvas_container = document.getElementById('cabbana-canvas-container');

        //Scene
        this._scene = new THREE.Scene();

        //Camera
        this._camera = new THREE.PerspectiveCamera(75, this._canvas.clientWidth / this._canvas.clientHeight, 0.1, 1000);
        this._camera.position.set(2.2945290784058825,6.280132490683021,7.0826900131878014)


        //Ambient Light
        this._ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this._scene.add(this._ambientLight);

        //Directional Light
        this._directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);

        // this._directionalLight.castShadow = true;

        //position the light to cast shadow
        this._directionalLight.position.set(3, 50, 15);



        this._scene.add(this._directionalLight);



        //Controls
        this._controls = new OrbitControls(this._camera, this._canvas);

        //make orbit control smooth
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.05;



        //Renderer
        this._renderer = new THREE.WebGLRenderer({antialias: true,canvas: this._canvas});
        this._renderer.setSize(this._canvas.clientWidth, this._canvas.clientHeight);
        this._renderer.setPixelRatio( window.devicePixelRatio );
        this._canvas_container.appendChild(this._renderer.domElement);

        //Make Renderer Transparent
        this._renderer.setClearColor(0x000000, 0);


        //add a white floor mesh to the scene
        const floorGeometry = new THREE.PlaneGeometry( 25, 25, 32 );
        const floorMaterial = new THREE.MeshStandardMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        const floor = new THREE.Mesh( floorGeometry, floorMaterial );
        floor.rotation.x = Math.PI / 2
        //receive shadow
        floor.receiveShadow = true;
        this._scene.add( floor );



        //add shadow to the scene
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
        this._renderer.shadowMapSoft = true;
        this._renderer.shadowMapAutoUpdate = true;
        this._renderer.shadowMap.needsUpdate = true;


        this._renderer.shadowIntensity = 0;


        //Load GLB
        // this._loadGLB()


        this._loadModel()

        //Animate
        this._animate();

        //Resize Listener
        window.addEventListener('resize', this._onWindowResize.bind(this,this._canvas_container), false);

        addWidthRange.addEventListener('input', this._widthRangeHandler.bind(this))
        addHeightRange.addEventListener('input', this._heightRangeHandler.bind(this))
        addDepthRange.addEventListener('input', this._depthRangeHandler.bind(this))

    }

    _show(r_cnt, c_cnt, r_scale, c_scale, h_scale) {
        group.clear();
        for (let j = 0; j < c_cnt; j++) {
            r_group.clear();
            for (let i = 0; i < r_cnt; i++) {
                let m_model = origin_model.clone();
                m_model.position.set(model_size.x * i, 0, model_size.z * j);
                r_group.add(m_model.clone());
            }
            group.add(r_group.clone());
        }
        group.scale.set(r_scale, h_scale, c_scale);
        group.position.set(model_size.x * (2 - r_cnt) * r_scale / 2.0, 0, -model_size.z * c_cnt * c_scale / 2.0);
    }





    _onWindowResize(canvas) {
        console.log(canvas.clientWidth)
        this._camera.aspect = canvas.clientWidth /canvas.clientHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    _animate() {
        requestAnimationFrame(() => this._animate());
        this._controls.update();
        this._renderer.render(this._scene, this._camera);
    }


    _widthRangeHandler(e){
        let slider_val = e.target.value;
        slider_val = (slider_val - slider_val % 200) / 200;

        row_count = (slider_val -slider_val % 30)/ 30 + 1;
        inc_r_step = slider_val / 20 / row_count;
        this._show(row_count, col_count, inc_r_step, inc_c_step, inc_h_step);
        this._scene.add(group);
    }


    _heightRangeHandler(e){
        let slider_val = e.target.value;

        col_count = (slider_val -slider_val % 3600)/ 3600 + 1;
        inc_c_step = slider_val / 3000 / col_count;
        this._show(row_count, col_count, inc_r_step, inc_c_step, inc_h_step);
        this._scene.add(group);
    }

    _depthRangeHandler(e){
        let slider_val = e.target.value;

        inc_h_step = slider_val / 3000 ;
        this._show(row_count, col_count, inc_r_step, inc_c_step, inc_h_step);
        this._scene.add(group);
    }

    _loadModel(){

        const loader = new GLTFLoader();
        loader.load(
            singleStructure,
            (gltf) => {
                //onLoad

                console.log(gltf.scene)

                origin_model = gltf.scene;
                row_count = col_count = 1;
                origin_stick = origin_model.getObjectByName("sticks");
                origin_model.remove(origin_stick);

                origin_model.traverse((child) => {
                    //set color to ox2d2d2d
                    if (child.isMesh) {
                        child.material.color.set(0x2d2d2d);
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }

                })



                const number_of_blades = 24;

                for (let i = 1; i < number_of_blades; i++) {
                    const cloned_blade = origin_stick.clone();
                    cloned_blade.name = `cloned-blade${i}`;
                    const bboundingBox = new THREE.Box3().setFromObject(origin_stick);
                    let offset= (bboundingBox.max.x - bboundingBox.min.x)
                    cloned_blade.position.x = origin_stick.position.x - offset*i
                    cloned_blade.position.y -= 0.05;
                    origin_model.add(cloned_blade);
                    console.log(cloned_blade.rotation)
                }


                // origin_model.scale.set(0.2, 0.2, 0.2);
                origin_model.position.set(0, 0, 0);

                const boundingBox = new THREE.Box3().setFromObject(origin_model);

                // // Calculate the size of the bounding box
                model_size = new THREE.Vector3();
                boundingBox.getSize(model_size);
                group.attach(origin_model.clone());
                group.position.set(model_size.x / 2.0, 0, -model_size.z / 2.0);
                this._scene.add(group);





            },
            (xhr) => {
                //Show Loading Progress

            },
            (error) => {
                console.error(error);
            }
        );

    }
}