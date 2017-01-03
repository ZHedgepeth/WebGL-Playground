var gl; //global webgl context
var canvas;
var squareVerticesBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var perspectiveMatrix;

//Matrix Utility Functions
function loadIdentity() {
  mvMatrix = Matrix.I(4);
}
function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}
function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}
function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
}
var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));


function start() {
  canvas = document.getElementById("glcanvas");

  //Initialize gl context
  initWebGL(canvas);

  //Break if GL context initialization fails
  if (gl) {
    //Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 0.5);
    //Clear everything
    gl.clearDepth(1.0);
    // Depth testing
    gl.enable(gl.DEPTH_TEST);
    //Focus on near objects obscure far ones
    gl.depthFunc(gl.LEQUAL);

    initShaders();

    initBuffers();

    setInterval(drawScene, 15);
  }
  else {
    console.log("context initialization failed");
  }
}

function initWebGL(canvas) {
  gl = null;

  try {
    //Get standard context from canvas, if it fails use experimental
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(error) {
  }
  //If we dont grab any GL context, alert user
  if(!gl) {
    alert("Could not initialize WebGL. Your browser may not support it")
  }
}

//Initialize all shaders
function initShaders() {
  var fragShader = getShader(gl, "shader-fs");
  var vertShader = getShader(gl, "shader-vs");
  //create the shader's actual program -- we think shaderProgram in this instance is a global var
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  //if shader program fails : alert here
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Didn't load no shader program. Pay tention to da next bits: \n" + gl.getProgramInfoLog(shader)); //NOTE: wtf you aint shaderprogram?
  }
  //possibly, take note of the above function "getProgramInfoLog" as it may a debugging future friend
  gl.useProgram(shaderProgram);

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
}

function getShader(gl, id, type) {
  var shaderScript, theSource, currentChild, shader;

  shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  theSource = shaderScript.text;

  if (!type) {
    // Check MIME type
    if (shaderScript.type == "x-shader/x-fragment") {
      type = gl.FRAGMENT_SHADER;
    } else if (shaderScript.type == "x-shader/x-vertex") {
      type = gl.VERTEX_SHADER;
    } else {
      //Unknown shader type
      console.log('Shader type is neither fragment nor vertex. Please check yoself');
      return null;
    }
  }

  // Shader is a basic shader initialized with a MIME type
  shader = gl.createShader(type);
  // Specify the actually shader code and link it to your shader object
  gl.shaderSource(shader, theSource);

  //Compile the shader program
  gl.compileShader(shader);

  //Check if compilation was unsuccessful
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  // Define square shape in 3d space
  var vertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

//about to draw the scene

function drawScene() {
  //Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //TODO: Check if gl.viewport.width is of type FLOAT
  var glViewportRatio = gl.viewport.width/gl.viewport.height;
  perspectiveMatrix = makePerspective(45, glViewportRatio, 0.1, 100.0);

  loadIdentity();

  mvTranslate([-0.0, 0.0, -6.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
