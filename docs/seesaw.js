
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {FontLoader} from "three/addons/loaders/FontLoader.js";
import Module from './rkseesaw.js';


let container, camera, renderer;
let gui;

/////////////////
let L=10.0, H=0.5, H2=0.0, Dm=0.65, Is = 0.0016;
let Xo;
let run_button, clear_button,play_button, h1_slider, xo_slider,h2_slider,dm_slider,is_slider;
let RN = 0.0;
//////////////////
const nx0 = 45.0 
const ny0 = 10;
const nx1 = 0.0;  
const ny1 = 20.0;
///////////////
const Np = 10000;
const NL = 2*Np;
const mymod = await Module();
var  rkseesaw = mymod.cwrap('integrals', 'number', ['number','number','number','number','number','number','number']);
let rn = new Float64Array( Array(NL).fill(1.0) );
let nDataBytes = rn.length * rn.BYTES_PER_ELEMENT;
let dataPtr = mymod._malloc(nDataBytes);
let dataHeap = new Float64Array(mymod.HEAPF64.buffer, dataPtr, nDataBytes);
/////

let T = []; let X=[]; let Y=[];
let pointsxyz = []; 
let pxt =[]; let pyt =[];
let Cx = [];
let Cy = [];
///////////
////////////////////////////////////////////////
const material = new THREE.LineBasicMaterial({
	color: 0xffffff,opacity:0.75
});

const Pimaterial = new THREE.LineBasicMaterial({
	color: 0xe0b824,opacity:0.75
});


const points1 = [];
const points2 = [];
const points3 = [];
const points4 = [];
const points5 = [];

points1.push( new THREE.Vector3( -nx0, -2*ny0, 0 ) );
points1.push( new THREE.Vector3( 100-nx0, -2*ny0, 0 ) );

const geometry1 = new THREE.BufferGeometry().setFromPoints( points1 );
const ax1 = new THREE.Line( geometry1, material );

points2.push( new THREE.Vector3( -nx0, -1.5*ny0, 0 ) );
points2.push( new THREE.Vector3( 100-nx0, -1.5*ny0, 0 ) );;
const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
const ax2 = new THREE.Line( geometry2, material );


points3.push( new THREE.Vector3( -nx0+1.0, -2*ny0, 0 ) );
points3.push( new THREE.Vector3( -nx0+1.0,-1.0*ny0, 0 ) );;
const geometry3 = new THREE.BufferGeometry().setFromPoints( points3 );
const ax3 = new THREE.Line( geometry3, material );


points4.push( new THREE.Vector3( -nx0, -2*ny0, 0 ) );
points4.push( new THREE.Vector3( -nx0, -1.0*ny0, 0 ) );;
const geometry4 = new THREE.BufferGeometry().setFromPoints( points4 );
const ax4 = new THREE.Line( geometry4, material );


////		
let font;
const loader = new FontLoader();
var  textMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xc2bfc9)});
let tXYZ = ['X','Y','Z'];
let k;

const scenes= [];
init();

function init() {


	for (let i=0;i<Np;i++){
		T[i]=i*1e-2;
	}

	H = 0.5;
	Xo = 0.5 //Math.PI*0.5;
	H2 = 0.0; 

	container = document.querySelector( '.container' );

	for (let i = 0; i<2; i++){

		const scene = new THREE.Scene();

		if (i==0){

			const frustumSize = 45.0;
			const aspect = 2*window.innerWidth / window.innerHeight;
			const camera = new THREE.OrthographicCamera( frustumSize * aspect / - 1.5, frustumSize * aspect / 1.5, frustumSize / 1.5, frustumSize / - 1.5, 0.1, 200 );
			 
		 	camera.position.x = 0;
		 	camera.position.y = 0;
		 	camera.position.z = 10.0;
			
			scene.userData.camera = camera;
			scene.background = new THREE.Color( 0x170b42);

			const controls = new OrbitControls( scene.userData.camera, container );
			controls.enableRotate = false;
		
			scene.userData.controls = controls;
		}

		if (i==1){

			const frustumSize = 60.0;
			const aspect = 1.0*window.innerWidth / window.innerHeight;
			const camera = new THREE.OrthographicCamera( frustumSize * aspect / - 1.5, frustumSize * aspect / 1.5, frustumSize / 1.5, frustumSize / - 1.5, 0.1, 200 );

			camera.position.x = 0;
			camera.position.y = 0 ;
			camera.position.z = 5.0;
		
			scene.userData.camera = camera;
			scene.background = new THREE.Color( 0x000000 );

			const controls = new OrbitControls( scene.userData.camera, container );
			controls.enablePan = false;
			controls.enableRotate = false;
			controls.enableZoom = false;
			scene.userData.controls = controls;
		}
                       
		scene.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444, 3 ) );
		const light = new THREE.DirectionalLight( 0xffffff, 1.5 );
		light.position.set( 1, 1, 1 );
		scene.add(light)
		scenes.push(scene)

	}

	initMeshes();
	initGUI();
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setScissorTest( true );
	renderer.setAnimationLoop( animate );
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize );
}

function initGUI(){
	gui = new GUI();

	const param ={
		'H': H,
		'H2': H2,
		'Xo': Xo,
		'km': Dm,
		'Is': Is,
		'Run':  RK,
		'Play': play,
		'Stop': clear,
		'X': true,
		};


	h1_slider = gui.add(param, 'H',0.2,0.8,0.01 ).onChange( function (val){
		H = val;
		let U = scenes[1].children[4];
		U.position.y = ny1 - (10*H)-0.5;
		U.needsUpdate = true


		////
		let tho = 0.5*Math.PI-Math.acos( (10*H)/L ) - Xo
		let  Mu = scenes[1].children[6];
		Mu.geometry.attributes.position.array[3] =  2*L*Math.cos(tho);
		Mu.geometry.attributes.position.array[4] =  2*L*Math.sin(tho)+ny1;
		let Qu = scenes[1].children[6].geometry.attributes.position
		Qu.needsUpdate =  true;
		////

	});


	h2_slider = gui.add(param, 'H2',0.0,0.8,0.01 ).onChange( function (val){
		H2 = val;
		let U = scenes[1].children[5];
		U.position.y = ny1 - (10*H2)-0.75;
		U.needsUpdate = true

	});


	xo_slider = gui.add(param, 'Xo',0.0,0.8,0.01 ).onChange( function (val){
		Xo = val;
		let tho = 0.5*Math.PI-Math.acos( (10*H)/L ) - Xo
		//console.log(Xo,tho)

		let  Mu = scenes[1].children[6];
		Mu.geometry.attributes.position.array[3] =  2*L*Math.cos(tho);
		Mu.geometry.attributes.position.array[4] =  2*L*Math.sin(tho)+ny1;
		let Qu = scenes[1].children[6].geometry.attributes.position
		Qu.needsUpdate =  true;
	});

	dm_slider = gui.add(param, 'km',0.0,0.9,0.01).onChange(function(val){
		Dm = val;
	});

	is_slider = gui.add(param, 'Is',0.0015,0.0017,0.00001).onChange(function(val){
		Is = val;
	});

	run_button = gui.add(param,'Run');
	play_button = gui.add(param,'Play').disable();
	clear_button = gui.add(param,'Stop').disable();
}

function RK(){

	console.log("RK");
	console.log(Xo);
	rkseesaw(Is,Dm,Xo,H,H2,dataHeap.byteOffset,rn.length)
	var result = new Float64Array(dataHeap.buffer, dataHeap.byteOffset, rn.length);
	/////
	reset_xt();
	
	let VX = scenes[0].children[5].geometry.attributes.position
	let VY = scenes[0].children[6].geometry.attributes.position
	let n = 0;
	for(let i=0;i<result.length;i+=2){
		X[n] = result[i];
		Y[n] = result[i+1];
		n+=1
	}

	for(let i =0; i<Np;i++){
		VX.setXYZ(i,T[i]-nx0,ny0*(X[i]/Math.PI)-1.0*ny0,0.0);
		VY.setXYZ(i,T[i]-nx0,ny0*(Y[i])-ny0,0.0);
		}

	VX.needsUpdate = true;
	VY.needsUpdate = true;
	scenes[0].children[5].geometry.computeBoundingSphere();
	scenes[0].children[6].geometry.computeBoundingSphere();

	run_button.disable(false);
	play_button.disable(false);
	mymod._free(dataHeap.byteOffset);


}


function play(){
	console.log('Play');
	RN=1.0;
	play_button.disable(true);
	clear_button.disable(false);
	run_button.disable(true);
	h1_slider.disable(true);
	h2_slider.disable(true);
	xo_slider.disable(true);
	dm_slider.disable(true);
	is_slider.disable(true);
	k = 0;
}

function clear(){
	console.log('Clear');
	RN=0.0;
	play_button.disable(false);
	run_button.disable(false);
	h1_slider.disable(false);
	h2_slider.disable(false);
	xo_slider.disable(false);
	is_slider.disable(false);
	dm_slider.disable(false);

}


function initMeshes() {

		///// Axes Scene 1
		const axesHelper = new THREE.AxesHelper(20);
		const axcolor = new THREE.Color(0xc2bfc9);
		axesHelper.setColors(axcolor,axcolor,axcolor);
		axesHelper.translateY(ny1);
		scenes[1].add( axesHelper );
		///////
		const axesHelper2 = new THREE.AxesHelper(100);
		axesHelper2.setColors(axcolor,axcolor,axcolor);
		axesHelper2.translateX(-nx0);
		axesHelper2.translateY(-ny0);
		scenes[0].add( axesHelper2 );
		///////////////////////////////
		scenes[0].add(ax1)
		scenes[0].add(ax2)
		///////////////////////////////
		loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",function(font){

					const Tsh = font.generateShapes(' ',1.0);
					const gT = new THREE.ShapeGeometry(Tsh);
					const textT = new THREE.Mesh(gT,textMaterial);


					//const XYZsh = font.generateShapes("m(t)",3.0);
					const XYZsh = font.generateShapes("\u0394m*[t]",3.0);
					const gXYZ = new THREE.ShapeGeometry(XYZsh);
					const textXYZ = new THREE.Mesh(gXYZ,textMaterial);

					textT.position.set(40.5,-11.1,0);
					textXYZ.position.set(-58,-5.0,0);


					scenes[0].add(textT)					
					scenes[0].add(textXYZ)

				});	
		
	
	const geometry = new THREE.BoxGeometry();
	const pcolorbar = new THREE.Color(); 
	const pcolorbaseA = new THREE.Color(); 
	const pcolorbaseB = new THREE.Color();

	pcolorbar.setRGB(0.9,1.0,0.9, THREE.SRGBColorSpace);
	pcolorbaseA.setRGB(0.9,0.0,0.09, THREE.SRGBColorSpace);
	pcolorbaseB.setRGB(0.0,0.0,0.9, THREE.SRGBColorSpace);

	const Rod = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: pcolorbar } ) );

	Rod.position.x = 0;
	Rod.position.y = ny1;
	Rod.position.z = 0.0;

	Rod.scale.x = 2*L;
	Rod.scale.y = 0.5;
	Rod.scale.z = 1
	
	const baseA = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: pcolorbaseA } ) );
	baseA.position.x = -L
	baseA.position.y = ny1-(10*H)-0.5;
	baseA.position.z = 0.0;

	baseA.scale.x = 2*L
	baseA.scale.y = 1
	baseA.scale.z = 1


	const baseB = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: pcolorbaseB } ) );

	baseB.position.x = L
	baseB.position.y = ny1 - (10*H2)-0.75
	baseB.position.z = 0.0;

	baseB.scale.x = L
	baseB.scale.y = 1
	baseB.scale.z = 1





	scenes[1].add(Rod);
	scenes[1].add(baseA);
	scenes[1].add(baseB);

	for(let i=0;i<Np;i++){
		pointsxyz.push(0.0,0.0,0.0)
		const pcolorx = new THREE.Color(); 
		pcolorx.setRGB(1.0,0.0,0.0, THREE.SRGBColorSpace);
		Cx.push(pcolorx.r,pcolorx.g,pcolorx.b);
	}


	for(let i=0;i<Np;i++){
		
		const pcolory = new THREE.Color(); 
		pcolory.setRGB(0.999,0.7294,0.011, THREE.SRGBColorSpace);
		Cy.push(pcolory.r,pcolory.g,pcolory.b);
	}

		const pMaterialt =  new THREE.PointsMaterial( { size: 1.5, vertexColors: true } );
				
		let SolX = new THREE.BufferGeometry();
		SolX.setAttribute( 'position', new THREE.Float32BufferAttribute( pointsxyz, 3 ) );
		SolX.setAttribute( 'color', new THREE.Float32BufferAttribute( Cx, 3 ) );

				
		let SolY = new THREE.BufferGeometry();
		SolY.setAttribute( 'position', new THREE.Float32BufferAttribute( pointsxyz, 3 ) );
		SolY.setAttribute( 'color', new THREE.Float32BufferAttribute( Cy, 3 ) );


		let pX = new THREE.Points( SolX, pMaterialt );
		let pY = new THREE.Points( SolY, pMaterialt );
		scenes[0].add(pX);
		scenes[0].add(pY);

		pxt.push(0.0,-ny0,0.0);
		const pgnx =  new THREE.BufferGeometry();
		const Xpcolor = new THREE.Color(); 
		Xpcolor.setRGB(1.00,0.00,0.000, THREE.SRGBColorSpace);
		const XpNMaterial =  new THREE.PointsMaterial( { size: 5.5, vertexColors: true } );
		pgnx.setAttribute( 'color', new THREE.Float32BufferAttribute( Xpcolor, 3 ) );
		pgnx.setAttribute( 'position', new THREE.Float32BufferAttribute( pxt, 3 ) );
		
		let pnx1 = new THREE.Points(pgnx,XpNMaterial)
		scenes[0].add(pnx1)

		pyt.push(0.0,-ny0,0.0);
		const pgny =  new THREE.BufferGeometry();
		const Ypcolor = new THREE.Color(); 
		Ypcolor.setRGB(0.999,0.7294,0.011, THREE.SRGBColorSpace);
		const YpNMaterial =  new THREE.PointsMaterial( { size: 5.5, vertexColors: true } );
		pgny.setAttribute( 'color', new THREE.Float32BufferAttribute( Ypcolor, 3 ) );
		pgny.setAttribute( 'position', new THREE.Float32BufferAttribute( pxt, 3 ) );
		
		let pny1 = new THREE.Points(pgny,YpNMaterial)
		scenes[0].add(pny1)
		////////////////////////////
		scenes[0].add(ax3)
		scenes[0].add(ax4)
	
		////////////////////////////
		points5.push( new THREE.Vector3(  0, ny1, 0 ) );
		let tho = 0.5*Math.PI-Math.acos( (10*H)/L )-Xo
		//console.log(tho)
		points5.push( new THREE.Vector3( 2*L*Math.cos(tho), 2*L*Math.sin(tho)+ny1, 0 ) );
		const geometry5 = new THREE.BufferGeometry().setFromPoints( points5 );
		const ax5 = new THREE.Line( geometry5, material );
		scenes[1].add(ax5)

		loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",function(font){

			const Tshx = font.generateShapes('t (final = 100)',3.0);
			const gTx = new THREE.ShapeGeometry(Tshx);
			const textTx = new THREE.Mesh(gTx,textMaterial);


			const XYZshx = font.generateShapes("\u03B8[t]",3.0);
			const gXYZx = new THREE.ShapeGeometry(XYZshx);
			const textXYZx = new THREE.Mesh(gXYZx,textMaterial);

			textTx.position.set(50.5,-24.1,0);
			textXYZx.position.set(-54,-13.0,0);
			

			scenes[0].add(textTx)					
			scenes[0].add(textXYZx)
		});

	}


function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

function reset_xt(){
	let M1 = scenes[0].children[7].geometry.attributes.position
	let M2 = scenes[0].children[8].geometry.attributes.position
	M1.setXYZ(0,T[0]-nx0,ny0*(X[0]/Math.PI)-1.0*ny0,0.0);
	M2.setXYZ(0,T[0]-nx0,ny0*(Y[0])-ny0,0.0);
	M1.needsUpdate = true;
	M2.needsUpdate = true;

}

function animate() {

	let m=0
	scenes.forEach( function(scene) {


		camera = scene.userData.camera;

		if(m==0){

			if (RN==1){

				k=(k+1)%Np;
				
				let M1 = scene.children[7].geometry.attributes.position
				let M2 = scene.children[8].geometry.attributes.position
				M1.setXYZ(0,T[k]-nx0,ny0*(X[k]/Math.PI)-1.0*ny0,0.0);
				M2.setXYZ(0,T[k]-nx0,ny0*(Y[k])-ny0,0.0);
				scene.children[7].geometry.computeBoundingSphere();
				scene.children[8].geometry.computeBoundingSphere();
				M1.needsUpdate = true;
				M2.needsUpdate = true;
			}

			renderer.setScissor( 0, 0, window.innerWidth, window.innerHeight/2 );
		
		}

		if(m==1){

			if(RN==1){

				let U = scenes[1].children[3];
				U.rotation.z = -0.5*Math.PI + X[k];
				U.needsUpdate = true
			}

			renderer.setScissor(0,window.innerHeight/2, window.innerWidth, window.innerHeight/2 );
			}
			m=1;

		scene.userData.controls.update();
		renderer.render( scene, camera );
		})
	}
