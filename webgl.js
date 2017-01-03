var gl; //global webgl context

function start() {
  var canvas = document.getElementById("glcanvas");

  //Initialize gl context
  gl = initWebGL(canvas);

  //Break if GL context initialization fails
  if (!gl) {
    console.log("context initialization failed");
    return;
  }

  //Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 0.5);
  // Depth testing
  gl.enable(gl.DEPTH_TEST);
  //Focus on near objects obscure far ones
  gl.depthFunc(gl.LEQUAL);
  //Clear the color as well as the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function initWebGL(canvas) {
  gl = null;

  //Get standard context from canvas, if it fails use experimental
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");


  //If we dont grab any GL context, alert user
  if(!gl) {
    alert("Could not initialize WebGL. Your browser may not support it")
  }

  return gl;
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
