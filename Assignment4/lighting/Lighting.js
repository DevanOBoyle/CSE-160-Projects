/** @format */

// BlockyAnimal.js
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec3 a_Normal;
  attribute vec4 a_Position;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform int u_whichTexture;
  uniform bool u_spec;
  uniform vec3 u_cameraPos;
  uniform vec3 u_lightPos;
  uniform bool u_lightOn;
  varying vec4 v_VertPos;
  void main() {
    if (u_whichTexture == 1) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    }
    else {
      gl_FragColor = u_FragColor;
    }

    if (u_lightOn) {
      vec3 lightVector = u_lightPos - vec3(v_VertPos);
      float r = length(lightVector);
      // if (r < 2.0) {
      //   gl_FragColor = vec4(1, 0, 0, 1);
      // } else if (r < 6.0) {
      //   gl_FragColor = vec4(0, 1, 0, 1);
      // }
      //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r), 1);

      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);

      vec3 R = reflect(-L, N);

      vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

      float specular = pow(max(dot(E, R), 0.0), 10.0);

      vec3 diffuse = vec3(gl_FragColor) * nDotL;
      vec3 ambient = vec3(gl_FragColor) * 0.3;
      if (u_spec) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      }
      else {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }
  }`;

// Global variables
let canvas;
let gl;
let a_Position;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_whichTexture;
let u_spec;
var g_camera = new Camera();

function setUpWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to intialize shaders.");
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("Failed to get the storage location of a_Position");
        return;
    }

    a_Normal = gl.getUniformLocation(gl.program, "a_Normal");
    if (a_Normal < 0) {
        console.log("Failed to get the storage location of a_Normal");
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, "u_lightOn");
    if (!u_lightOn) {
        console.log("Failed to get the storage location of u_lightOn");
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, "u_lightPos");
    if (!u_lightPos) {
        console.log("Failed to get the storage location of u_lightPos");
        return;
    }

    u_spec = gl.getUniformLocation(gl.program, "u_spec");
    if (!u_spec) {
        console.log("Failed to get the storage location of u_spec");
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, "u_cameraPos");
    if (!u_cameraPos) {
        console.log("Failed to get the storage location of u_cameraPos");
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (!u_FragColor) {
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    if (!u_ModelMatrix) {
        console.log("Failed to get the storage location of a u_ModelMatrix");
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(
        gl.program,
        `u_GlobalRotateMatrix`
    );
    if (!u_GlobalRotateMatrix) {
        console.log(
            `Failed to get the storage location of u_GlobalRotateMatrix`
        );
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    if (!u_ViewMatrix) {
        console.log(`Failed to get the storage location of u_ViewMatrix`);
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(
        gl.program,
        "u_ProjectionMatrix"
    );
    if (!u_ProjectionMatrix) {
        console.log(`Failed to get the storage location of u_ProjectionMatrix`);
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
    if (!u_whichTexture) {
        console.log(`Failed to get the storage location of u_Sampler0`);
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedSeg = 6;
let g_normalOn = false;
let g_lightPos = [0.15, -0.5, 3];
let g_lightOn = false;

function addActionsForHtmlUI() {
    document
        .getElementById(`cameraSlideY`)
        .addEventListener("mousemove", function () {
            g_globalAngleY = this.value;
            renderScene();
        });
    document
        .getElementById(`cameraSlideX`)
        .addEventListener("mousemove", function () {
            g_globalAngleX = this.value;
            renderScene();
        });
    document
        .getElementById(`lightSlideX`)
        .addEventListener("mousemove", function () {
            g_lightPos[0] = this.value / 100;
            renderScene();
        });
    document
        .getElementById(`lightSlideY`)
        .addEventListener("mousemove", function () {
            g_lightPos[1] = this.value / 100;
            renderScene();
        });
    document
        .getElementById(`lightSlideZ`)
        .addEventListener("mousemove", function () {
            g_lightPos[2] = this.value / 100;
            renderScene();
        });
    document.getElementById("normalOn").onclick = function () {
        g_normalOn = true;
    };
    document.getElementById("normalOff").onclick = function () {
        g_normalOn = false;
    };
    document.getElementById("lightOn").onclick = function () {
        g_lightOn = true;
    };
    document.getElementById("lightOff").onclick = function () {
        g_lightOn = false;
    };
}

var g_globalAngleX = 0;
var g_globalAngleY = 0;
var g_startTime = 0;

function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press

    canvas.onmousedown = function (ev) {
        [x, y] = convertCoordinatesEventToGL(ev);
        lastDownX = x;
        lastDownY = y;
        click(ev);
    };
    canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) {
            click(ev);
        }
    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(tick);
}

var g_startperformancevarTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    g_lightPos[0] = 5 * Math.cos(g_seconds);
}

function click(ev) {
    let [nX, nY] = convertCoordinatesEventToGL(ev);

    var dX = nX - lastDownX;
    //console.log("nX: " + nX +" lastDownX: " + lastDownX + " dX: " + dX);
    g_globalAngleY += 360 * dX;
    g_globalAngleY = g_globalAngleY % 360;
    if (g_globalAngleY < 0) {
        g_globalAngleY += 360;
    }

    var dY = nY - lastDownY;
    g_globalAngleX += 360 * dY;
    g_globalAngleX = g_globalAngleX % 360;
    if (g_globalAngleX < 0) {
        g_globalAngleX += 360;
    }

    lastDownX = nX;
    lastDownY = nY;
    renderScene();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

function renderScene() {
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(90, (1 * canvas.width) / canvas.height, 0.1, 200);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0],
        g_camera.eye.elements[1],
        g_camera.eye.elements[2],
        g_camera.at.elements[0],
        g_camera.at.elements[1],
        g_camera.at.elements[2],
        g_camera.up.elements[0],
        g_camera.up.elements[1],
        g_camera.up.elements[2]
    );
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_globalAngleX, 1, 0, 0);
    globalRotMat.rotate(g_globalAngleY, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3f(
        u_cameraPos,
        g_camera.eye.elements[0],
        g_camera.eye.elements[1],
        g_camera.eye.elements[2]
    );

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    gl.uniform1i(u_lightOn, g_lightOn);

    var light = new Cube();
    light.color = [2, 2, 0, 1];
    //if (g_normalOn) box.textureNum = 1;
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.render();

    var box = new Cube();
    box.color = [0.7, 0.7, 0.7, 1];
    if (g_normalOn) box.textureNum = 1;
    box.matrix.scale(-15, -15, -15);
    box.matrix.translate(-0.5, -0.7, -0.8);
    //box.normalMatrix.setInverseOf(box.matrix).transpose();
    box.render();

    var cube = new Cube();
    cube.color = [1.0, 0.0, 0.0, 1];
    if (g_normalOn) cube.textureNum = 1;
    cube.matrix.translate(-0.15, -0.55, -0.15);
    cube.matrix.scale(0.5, 0.5, 0.5);
    cube.render();

    var ball = new Sphere();
    ball.color = [1.0, 0.0, 0.0, 1];
    ball.spec = true;
    if (g_normalOn) ball.textureNum = 1;
    ball.matrix.translate(-0.5, -0.7, 0.25);
    ball.matrix.scale(0.25, 0.25, 0.25);
    ball.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(
        " ms: " +
            Math.floor(duration) +
            " fps: " +
            Math.floor(10000 / duration) / 10,
        "numdot"
    );
}

function sendTextToHTML(msg, htmlID) {
    var htmlText = document.getElementById(htmlID);
    if (!htmlText) {
        console.log("Failed to get " + htmlID + "from HTML");
        return;
    }
    htmlText.innerHTML = msg;
}
