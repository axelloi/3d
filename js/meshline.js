// three.js animataed line using BufferGeometry

var renderer, scene, camera;

var geometry, material, line, vertices, last;

var MAX_POINTS = 500;
var drawCount;
var splineArray = [];
var line;
var activeLine;
var lines;

var allLines = [];

init();
//initLine();
animate();


function init() {

	// renderer
	renderer = new THREE.WebGLRenderer();

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// camera
	/*camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 500 );*/

	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.set( 0, 0, 500 );

	// scene
	scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xb0b0b0 );
	lines = new THREE.Group();
	scene.add(lines);

	//
	/*var gridscene = new THREE.GridHelper( 300, 10, "grey", "grey" );
	gridscene.rotateX(THREE.Math.degToRad( 90 ));
	scene.add( gridscene );*/

	var geometry = new THREE.PlaneGeometry( 300, 300, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffffff, transparent:true, opacity:0.75} );

	var plane = new THREE.Mesh( geometry, material );
	plane.opacity=0.5;
	scene.add( plane );

	var gridlines = new THREE.GridHelper( 300, 10 , "red", "blue");
	gridlines.rotateX(THREE.Math.degToRad( 90 ));
	lines.add(gridlines);

	/*
	left = 37
up = 38
right = 39
down = 40

+ = 107 187
- = 109 189

*/


	document.addEventListener( 'keydown', function ( event ) {
					console.log(event.keyCode);

					switch ( event.keyCode ) {
						case 38 : // UP
						case 56 : // UP
							rotate("up");
							break;
						case 40 : // DOWN
						case 50 : // DOWN
							rotate("down");
							break;
						case 39 : // RIGHT
						case 54 : // RIGHT
							rotate("right");
							break;
						case 37 : // LEFT
						case 52 : // LEFT
							rotate("left");
							break;
						case 107 :
						case 187 : // +
							translate("front");
							break;
						case 109 :
						case 189 : // -
							translate("back");
							break;
						case 48 : // -
							recentre();
							break;
						case 90 : // -
							efface();
							break;
					}
	});

    document.addEventListener('mousedown', onMouseDown, false);

}


function sauv(){
	var json = lines.toJSON();
	console.log(json);

	var dataJSON = {};
	dataJSON.titre = "test2";
	dataJSON.json = JSON.stringify(json);

	$.ajax({
        type: 'POST',
        url: 'saveJSON.php',
       	data : dataJSON,
        success : function(d){
        	console.log(d);
            console.log('done');
        }
     })

}

function test(){
	var json = JSON.stringify(lines.toJSON());
	window.open("test.php?json="+json);

}


function efface(){

	lines.remove(line);
}

const INCREMENT = 0.05;

function rotate(dir) {

	var rot = THREE.Math.degToRad(INCREMENT);

	if (dir == "down"){

		///var rot =  THREE.Math.degToRad(INCREMENT);
    	//lines.rotateX( rot );
    	var rotx = lines.rotation.x + INCREMENT;
    	lines.rotation.set( rotx,0,0 );
	}

	else if (dir == "up"){

		var rotx = lines.rotation.x - INCREMENT;
    	lines.rotation.set( rotx,0,0 );
	}
	else if (dir == "right"){

		var roty = lines.rotation.y + INCREMENT;
    	lines.rotation.set( 0,roty,0 );
	}
	else if (dir == "left"){

		var roty = lines.rotation.y - INCREMENT;
    	lines.rotation.set( 0,roty,0 );
	}
	positionLog();
}

function translate(dir){

	if (dir == "front"){
		var posz = lines.position.z + INCREMENT*20;
		lines.position.set( 0,0,posz );

	}
	else if (dir == "back"){

		var posz = lines.position.z - INCREMENT*20;
		lines.position.set( 0,0,posz );
	}
	positionLog();
}

function positionLog(){
	console.log("rot : ",lines.rotation);
	console.log("pos : ",lines.position);
	console.log("- - -");
}

function recentre(){

	console.log(lines.position);
	console.log(lines.rotation);

	lines.position.set( 0,0,0 );
	lines.rotation.set( 0,0,0 );
}

function initLine(){
	// line
	activeLine = true;

	// geometry
	geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vector3( 0, 0, 0) );

	// material
	material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );

	var newLine = new THREE.Line( geometry,  material );
	line.rotateX( lines.rotation.x );
	scene.add( newLine );

	//lines.add( newLine );
	line = newLine;


}

function render() {

	renderer.render( scene, camera );

}

function addStep(vector) {

	vertices = geometry.vertices;
	vertices.push(vector ) ;

	geometry = new THREE.Geometry();
	geometry.vertices = vertices;

	scene.remove( line );
	line = new THREE.Line( geometry, material )
	scene.add( line );

}

function onMouseMove(event) {

	if(renderer) {

		addpoint(event);

	}
}

function addpoint(event){
		var vector = new THREE.Vector3();

		vector.set(
		( event.clientX / window.innerWidth ) * 2 - 1,
		- ( event.clientY / window.innerHeight ) * 2 + 1,
		-1 );

		vector.unproject( camera );

		var dir = vector.sub( camera.position ).normalize();

		var distance = - camera.position.z / dir.z;

		var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

		addStep(pos);
}

function onMouseUp(evt) {
	document.removeEventListener("mousemove",onMouseMove,false);


	line.rotation.set(-lines.rotation.x, -lines.rotation.y, lines.rotation.z);
	line.translateZ(- lines.position.z);

	//line.rotateY(- lines.rotation.y);

	lines.add(line);
	//console.log("rotXline : ",line.rotation.x);
	console.log("rotXlines : ",lines.rotation.x);
	console.log("rotYlines : ",lines.rotation.x);
}

function onMouseDown(event) {
	geometry = new THREE.Geometry();
	material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );

	addpoint(event);
	document.addEventListener("mousemove",onMouseMove,false);
	document.addEventListener("mouseup",onMouseUp,false);

}

// animate
function animate() {

	requestAnimationFrame( animate );

	render();

}
