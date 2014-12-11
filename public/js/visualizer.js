var Visualizer = function(){
  this.appName = 'Green Snake Platinum Kangaroo';
  this.renderer = new THREE.WebGLRenderer({alpha:true});
  this.scene = new THREE.Scene();
  this.controls = {};
  this.camera = {};
  // this.render = function(){};
  this.orbitControls = {};
  this.cubes = [];
  this.init = function(){
    // get dimensions of window
    var width = window.innerWidth;
    var height = window.innerHeight;

    // get the DOM element to attach to
    var $container = $('#container');
    this.renderer.domElement.id = "container";

    // create cubes
    this.cubes = this.createCubes();
    
    // create camera and set position based on window
    this.camera = this.createCamera(width, height);
    this.camera.position.z = 50;

    // create Orbit Controls for panning
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    for(var i = 0; i < 7; i++) {
      this.controls.pan(new THREE.Vector3( 1, 0, 0 ));
      this.controls.pan(new THREE.Vector3( 0, 1, 0 ));
    }

    // start the renderer
    this.renderer.setSize(width, height);

    // and make it pretty
    this.renderer.setClearColor(0xffffff, 0.7);
    this.renderer.clear();


    // attach the render-supplied DOM element

    // create dat.gui for variables control
    // this.datgui.create(this.renderer.domElement);

    // create stats box so we look legit
    // this.stats.create();

    // kick off the animation
    var that = this;
    this.render.bind(that);
    $container.append(this.renderer.domElement);
  };
};

Visualizer.prototype = {
  createCamera: function(width, height){
    // set some camera attributes
    var view_angle = 50;
    var aspect = width / height;
    var near = 1;
    var far = 10000;
    var camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
    return camera;
  },
  createCubes: function(){
    // setup the grid with 8 rows with 16 columns of cubes
    var cubes = [];
    var row = 0;
    var col = 0;

    // create x and y coordinates for each cube
    for(var x = -16; x < 48; x += 2) {
      cubes[row] = [];
      for(var y = 8; y < 24; y += 2) {
        // BoxGeometry creates cube shapes with HxWxD values
        var geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

        // Set some material values
        var material = new THREE.MeshLambertMaterial({
          ambient: 0x808080,
          specular: 0x999999,
          shininess: 100,
          opacity:0.8,
          transparent: true
        });

        // create the actual cube and assign properties
        cubes[row][col] = new THREE.Mesh(geometry, material);
        cubes[row][col].position.x = x;
        cubes[row][col].position.y = y;
        cubes[row][col].position.z = 0;
        cubes[row][col].material.color.setHSL(0.0,0.8,0.8);

        // add the cube to the scene for rendering
        this.scene.add(cubes[row][col]);
        col++;
      }
      row++;
    }
    return cubes;
  },
  createLighting: function(){
    var light = new THREE.AmbientLight(0x505050);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(0, 1, 1);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(1, 1, 0);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(0, -1, -1);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(-1, -1, 0);
    this.scene.add(light);
  },
  // This is where the magic happens
  updateCubes: function(){
    // reload the fft data
    analyser.getByteFrequencyData(dataArray);
    analyser.getByteTimeDomainData(timeDomain);

    // check if the dataArray (audio buffer) is empty
    var zeros = Array.prototype.slice.call(dataArray);
    zeros = zeros.reduce(function(a, b){ return a + b; });

    // don't do anything to the cubes if the dataArray is empty
    if(typeof dataArray === 'object' && dataArray.length > 0 && zeros > 0) {
      
      // will represent index in the dataArray buffer
      var z = 0;

      // needed for left-side mirroring
      var offset = 1;

      // iterate through each row and column cube
      for(var row = 16, rowLength = cubes.length; row < rowLength; row++) {
        for(var col = 0, colLength = cubes[row].length; col < colLength; col++) {
          
          // scale data for z-index of cubes
          var scale = (dataArray[z] / 10 < 1) ? 1 : dataArray[z] / 10;
          
          // adjust byte data from 0-255 to 0-1 for HSL values
          var data = dataArray[z] / 255;
          
          // offset for left side of visualizer
          var rowShift = row - offset;

          // right half of visualizer
          cubes[row][col].material.color.setHSL(data, 0.8, 0.5);
          cubes[row][col].scale.z = scale;
          cubes[row][col].material.opacity = data * 10;

          // left half of visualizer
          cubes[rowShift][col].material.color.setHSL(Math.abs(data - 1), 0.8, 0.5);
          cubes[rowShift][col].scale.z = scale;
          cubes[rowShift][col].material.opacity = data * 10;

          // increment location in dataArray buffer
          z++;
        }

        // adjust to move further along left side of visualizer
        offset += 2;
      }
    }
  },
  render: function () {
    console.log('render');
    // Updates the visualizer
    this.updateCubes();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    // this.stats.update();

    // invokes render again
    requestAnimationFrame(this.render);
  },
  stats: {
    create: function(){
      // add stats for performance so it looks legit
      var stats = new Stats();
      stats.setMode(1); // 0: fps, 1: ms

      // align bottom-right
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.right = '0px';
      stats.domElement.style.bottom = '0px';

      // stick it on the page
      document.body.appendChild( stats.domElement );

      // make available outside this function
      this.begin = stats.begin;
      this.end = stats.end;
    },
    update: function (stats) {
      this.begin();
      // monitored code goes here
      this.end();
      // requestAnimationFrame( update );
    }
  },
  datgui: {
    create: function(domElement){
      var canvas = domElement;
      var gui = new dat.GUI();
      gui.add(canvas, 'width', 800, 1200);
      gui.add(canvas, 'height', 500, 700);
    }
  } 
};

// Dimension Settings set the scene size
// var width = window.innerWidth;
// var height = window.innerHeight;

// set some camera attributes
// var view_angle = 50;
// var aspect = width / height;
// var near = 1;
// var far = 10000;

// get the DOM element to attach to
// var $container = $('#container');

// create a WebGL renderer, camera and a scene
// var renderer = new THREE.WebGLRenderer({alpha:true});
// var camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
// var scene = new THREE.Scene();
// var controls;
// renderer.domElement.id = "container";


// var createCubes = function(){
//   // initialize
//   var cubes = [];

//   // setup the grid with 8 rows with 16 columns cubes
//   var row = 0;
//   var col = 0;
//   cubes[row] = [];

//   for(var x = -16; x < 48; x += 2) {
//     for(var y = 8; y < 24; y += 2) {
//       var geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
//       var material = new THREE.MeshLambertMaterial({
//         ambient: 0x808080,
//         specular: 0x999999,
//         shininess: 100,
//         opacity:0.8,
//         transparent: true
//       });
//   		cubes[row][col] = new THREE.Mesh(geometry, material);
//   		cubes[row][col].position.x = x;
//       cubes[row][col].position.y = y;
//       cubes[row][col].position.z = 0;
//       cubes[row][col].material.color.setHSL(0.0,0.8,0.8);
//   		scene.add(cubes[row][col]);
//   		col++;
//   	}
//   	row++;
//   }
//   return cubes;
// };

// create lighting
// var light = new THREE.AmbientLight(0x505050);
// scene.add(light);

// light = new THREE.DirectionalLight(0xffffff, 0.7);
// light.position.set(0, 1, 1);
// scene.add(light);

// light = new THREE.DirectionalLight(0xffffff, 0.7);
// light.position.set(1, 1, 0);
// scene.add(light);

// light = new THREE.DirectionalLight(0xffffff, 0.7);
// light.position.set(0, -1, -1);
// scene.add(light);

// light = new THREE.DirectionalLight(0xffffff, 0.7);
// light.position.set(-1, -1, 0);
// scene.add(light);

// set the camera position
// camera.position.z = 50;

// controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.addEventListener('change', render);

// for(var i = 0; i < 7; i++) {
// 	controls.pan(new THREE.Vector3( 1, 0, 0 ));
// 	controls.pan(new THREE.Vector3( 0, 1, 0 ));
// }

// Makes the cubes change shape and color
// var updateCubes = function(){
//   // reloads the fft data
//   analyser.getByteFrequencyData(dataArray);
//   analyser.getByteTimeDomainData(timeDomain);

//   // check if the dataArray (audio buffer) is empty
//   var zeros = Array.prototype.slice.call(dataArray);

//   zeros = zeros.reduce(function(a, b){ return a + b; });

//   // don't do anything to the cubes if the dataArray is empty
//   if(typeof dataArray === 'object' && dataArray.length > 0 && zeros > 0) {
//     var z = 0;
//     var offset = 1;
//     for(var row = 16, rowLength = cubes.length; row < rowLength; row++) {
//       for(var col = 0, colLength = cubes[row].length; col < colLength; col++) {
//         var scale = (dataArray[z] / 10 < 1) ? 1 : dataArray[z] / 10;
//         var data = dataArray[z] / 255;
//         var rowShift = row - offset;

//         // right side
//         cubes[row][col].material.color.setHSL(data, 0.8, 0.5);
//         cubes[row][col].scale.z = scale;
//         cubes[row][col].material.opacity = data * 10;

//         // left side
//         cubes[rowShift][col].material.color.setHSL(Math.abs(data - 1), 0.8, 0.5);
//         cubes[rowShift][col].scale.z = scale;
//         cubes[rowShift][col].material.opacity = data * 10;
//         z++;
//       }
//       offset += 2;
//     }
//   }
// };

// Updates the visualizer
// var render = function () {
//   updateCubes();
//   controls.update();
//   renderer.render(scene, camera);

//   // invokes render again
//   requestAnimationFrame(render);
// };

// start the renderer
// renderer.setSize(width, height);

// // and make it pretty
// renderer.setClearColor(0xffffff, 0.7);
// renderer.clear();

// render();

// attach the render-supplied DOM element
// $container.append(renderer.domElement);

// Originally used for cube created. Not currently being used
// function randomFairColor() {
// 	var min = 64;
// 	var max = 224;
// 	var r = (Math.floor(Math.random() * (max - min + 1)) + min) * 65536;
// 	var g = (Math.floor(Math.random() * (max - min + 1)) + min) * 256;
// 	var b = (Math.floor(Math.random() * (max - min + 1)) + min);
// 	return r + g + b;
// }


// add stats for performance

// var stats = new Stats();
// stats.setMode(1); // 0: fps, 1: ms

// // align top-left
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.right = '0px';
// stats.domElement.style.bottom = '0px';

// document.body.appendChild( stats.domElement );

// Is this actually checking the render function?
// var update = function () {
//     stats.begin();
//     // monitored code goes here
//     stats.end();
//     requestAnimationFrame( update );
// };

// requestAnimationFrame( update );

// create dat.gui for variables control
// window.onload = function() {
//   var canvas = renderer.domElement;
//   var gui = new dat.GUI();
//   gui.add(canvas, 'width', 800, 1200);
//   gui.add(canvas, 'height', 500, 700);
// };
