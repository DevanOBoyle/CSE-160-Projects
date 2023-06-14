/** @format */

// World.js
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_GlobalRotateMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {

    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1, .2, .2, 1);
    }
  }`;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
var g_velocity = new Vector3([0, 0, 0]);
var g_rot_velocity = new Vector3([0, 0, 0]);
var g_speed = 20;
var g_rot_speed = 20;
var g_camera = new Camera();
var g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function drawMap() {
    for (x = 0; x < 11; x++) {
        for (y = 0; y < 11; y++) {
            if (g_map[x][y] != 0) {
                var wall = new Cube();
                wall.color = [1, 1, 1, 1];
                wall.matrix.scale(9.1, 20, 9.1);
                wall.matrix.translate(x - 4, 0, y - 4);
                wall.render();
            }
        }
    }
}

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

    a_UV = gl.getAttribLocation(gl.program, "a_UV");
    if (a_UV < 0) {
        console.log("Failed to get storage location of a_UV");
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
        "u_GlobalRotateMatrix"
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

    u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
    if (!u_Sampler0) {
        console.log(`Failed to get the storage location of u_Sampler0`);
        return;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
    if (!u_Sampler1) {
        console.log(`Failed to get the storage location of u_Sampler1`);
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

function initTextures() {
    var image1 = new Image(); // Create the image object
    var image2 = new Image();
    if (!image1 || !image2) {
        console.log("Failed to create the image object");
        return false;
    }
    // Register the event handler to be called on loading an image
    image1.onload = function () {
        sendTextureToTex0(image1);
    };
    image2.onload = function () {
        sendTextureToTex1(image2);
    };
    // Tell the browser to load an image
    image1.src = "../resources/grass.jpg";
    image2.src = "../resources/night.jpg";

    return true;
}

function sendTextureToTex0(image) {
    var texture0 = gl.createTexture(); // Create a texture object
    if (!texture0) {
        console.log("Failed to create the texture object");
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture0);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
}

function sendTextureToTex1(image) {
    var texture1 = gl.createTexture(); // Create a texture object
    if (!texture1) {
        console.log("Failed to create the texture object");
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture1);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
}

var g_globalAngleX = 0;
var g_globalAngleY = 0;
var g_leftArmAngle = 0;
var g_leftForearmAngle = 0;
var g_leftArmAngleX = 0;
var g_leftArmAngleY = 0;
var g_leftForearmAngleZ = 0;
var g_leftHandAngle = 0;
var g_leftHandAngleY = 0;
var g_rightArmAngle = 0;
var g_rightForearmAngle = 0;
var g_rightArmAngleY = 0;
var g_rightForearmAngleZ = 0;
var g_rightHandAngle = 0;
var g_leftThighAngle = 0;
var g_leftCalfAngle = 0;
var g_leftFootAngle = 0;
var g_rightThighAngle = 0;
var g_rightCalfAngle = 0;
var g_rightFootAngle = 0;
var g_xPos = 0;
var g_yPos = 0;
var g_zPos = 0;
var g_xAngle = 0;
var g_yAngle = 0;
var g_zAngle = 0;
var g_startTime = 0;
var g_animation = true;
var g_swing = false;
var g_spin = false;
var g_swordColor = [0.91, 0.95, 0.95, 1.0];
var g_handleColor = [0.15, 0.12, 0.15, 1];
var g_bodyColor = [0.91, 0.87, 0.91, 1];
var g_clothColor = [0, 0.25, 0.25, 1];
var g_bootColor = [0.25, 0, 0, 1];

function main() {
    setUpWebGL();
    connectVariablesToGLSL();

    // Register function (event handler) to be called on a mouse press

    g_velocity[0] = 0;
    g_velocity[1] = 0;
    g_velocity[2] = 0;

    g_rot_velocity[0] = 0;
    g_rot_velocity[1] = 0;
    g_rot_velocity[2] = 0;

    canvas.onmousedown = function (ev) {
        [x, y] = convertCoordinatesEventToGL(ev);
        lastDownX = x;
        lastDownY = y;
        click(ev);
    };
    canvas.onmousemove = function (ev) {
        click(ev);
    };

    document.onkeydown = function (ev) {
        if (ev.key == "d") {
            g_velocity[0] = 1;
        }
        if (ev.key == "a") {
            g_velocity[0] = -1;
        }
        if (ev.key == "w") {
            g_velocity[1] = 1;
        }
        if (ev.key == "s") {
            g_velocity[1] = -1;
        }
        if (ev.key == "q") {
            g_rot_velocity[0] -= 1;
        }
        if (ev.key == "e") {
            g_rot_velocity[0] += 1;
        }
    };

    document.onkeyup = function (ev) {
        if (ev.key == "d") {
            g_velocity[0] = 0;
        }
        if (ev.key == "a") {
            g_velocity[0] = 0;
        }
        if (ev.key == "w") {
            g_velocity[1] = 0;
        }
        if (ev.key == "s") {
            g_velocity[1] = 0;
        }
        if (ev.key == "q") {
            g_rot_velocity[0] = 0;
        }
        if (ev.key == "e") {
            g_rot_velocity[0] = 0;
        }
    };

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(tick);
}

var g_startperformancevarTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
    var seconds = performance.now() / 1000.0 - g_startTime;
    g_dt = seconds - g_seconds;
    g_seconds = seconds;

    var dz = 0;
    var dx = 0;
    dz +=
        g_velocity[1] *
        g_speed *
        g_dt *
        Math.sin(g_globalAngleY * (Math.PI / 180));
    dx +=
        g_velocity[1] *
        g_speed *
        g_dt *
        Math.cos(g_globalAngleY * (Math.PI / 180));
    dx -=
        g_velocity[0] *
        g_speed *
        g_dt *
        Math.sin(g_globalAngleY * (Math.PI / 180));
    dz +=
        g_velocity[0] *
        g_speed *
        g_dt *
        Math.cos(g_globalAngleY * (Math.PI / 180));

    g_camera.eye.elements[0] += dz;
    g_camera.eye.elements[1] += g_velocity[2] * g_dt;
    g_camera.eye.elements[2] -= dx;
    g_globalAngleY += g_rot_velocity[0] * g_rot_speed * g_dt;

    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
}

function reset() {
    g_globalAngleX = 0;
    g_globalAngleY = 0;
    g_leftArmAngle = 0;
    g_leftForearmAngle = 0;
    g_leftArmAngleX = 0;
    g_leftArmAngleY = 0;
    g_leftForearmAngleZ = 0;
    g_leftHandAngle = 0;
    g_leftHandAngleY = 0;
    g_rightArmAngle = 0;
    g_rightForearmAngle = 0;
    g_rightArmAngleY = 0;
    g_rightForearmAngleZ = 0;
    g_rightHandAngle = 0;
    g_leftThighAngle = 0;
    g_leftCalfAngle = 0;
    g_leftFootAngle = 0;
    g_rightThighAngle = 0;
    g_rightCalfAngle = 0;
    g_rightFootAngle = 0;
    g_xPos = 0;
    g_yPos = 0;
    g_zPos = 0;
    g_xAngle = 0;
    g_yAngle = 0;
    g_zAngle = 0;
    g_startTime = 0;
}

function updateAnimationAngles() {
    // if (g_swing) {
    //     if (g_leftArmAngle < 40 && g_leftArmAngle > -5) {
    //         g_leftArmAngle = 30 * Math.sin(1.5 * g_seconds) + 10;
    //         //g_leftArmAngleY = 10 * Math.sin(0.6 * g_seconds);
    //         g_leftForearmAngle = 30 * Math.sin(1.5 * g_seconds);
    //         g_leftForearmAngleX = 30 * Math.sin(1.5 * g_seconds);
    //         g_leftHandAngle = 95 * Math.sin(-1.5 * g_seconds) + 75;
    //     } else {
    //         //g_swing = false;
    //         g_leftArmAngleX = 30 * Math.sin(1.5 * g_seconds);
    //         g_leftForearmAngleZ = 30 * Math.sin(1.5 * g_seconds);
    //         g_leftHandAngle = 95 * Math.sin(-1.5 * g_seconds) + 75;
    //     }
    // g_leftForearmAngleZ = 15 * Math.sin(0.6 * g_seconds);
    // g_leftHandAngle = -25 * Math.sin(-0.6 * g_seconds);
    // g_rightArmAngle = -20 * Math.sin(0.6 * g_seconds) + 10;
    // g_rightForearmAngle = -15 * Math.sin(0.6 * g_seconds) + 15;
    // g_rightHandAngle = 25 * Math.sin(-0.6 * g_seconds) + 20;
    if (g_spin) {
        if (g_leftArmAngle > -9) {
            g_leftArmAngle = 10 * Math.sin(2.6 * g_seconds);
            g_leftForearmAngle = 15 * Math.sin(2.6 * g_seconds);
            g_leftHandAngle = -25 * Math.sin(-2.6 * g_seconds);
            g_rightArmAngle = -20 * Math.sin(2.6 * g_seconds) + 10;
            g_rightForearmAngle = -15 * Math.sin(2.6 * g_seconds) + 15;
            g_rightHandAngle = 25 * Math.sin(-2.6 * g_seconds) + 20;
            g_leftThighAngle = 15 * Math.sin(-2.6 * g_seconds);
            g_leftCalfAngle = 15 * Math.sin(-2.6 * g_seconds);
            g_rightThighAngle = 20 * Math.sin(-2.6 * g_seconds) + 5;
            g_rightCalfAngle = 20 * Math.sin(-2.6 * g_seconds);
            console.log(g_leftArmAngle);
        } else if (g_leftHandAngle < 4900) {
            g_leftHandAngle = Math.sin(g_seconds * 5) * 5000;
            g_rightHandAngle = Math.sin(g_seconds * 5) * 5000;
        } else {
            g_slam = false;
            reset();
        }
        // if (g_leftArmAngleX < 139) {
        //     g_leftArmAngleY = -45 * Math.sin(2.6 * g_seconds);
        //     g_leftArmAngleX = -95 * Math.sin(2.6 * g_seconds) + 45;
        //     g_leftForearmAngleZ = 65 * Math.sin(2.6 * g_seconds);
        //     g_leftHandAngleY = 35 * Math.sin(2.6 * g_seconds);
        // } else {
        //     g_leftArmAngleX = 95 * Math.sin(2.6 * g_seconds);
        //     g_leftForearmAngleZ = 180 * Math.sin(2.6 * g_seconds);
        //     g_leftHandAngle = 20 * Math.sin(2.6 * g_seconds);
        //     g_leftHandAngleY = -40 * Math.sin(2.6 * g_seconds) + 30;
        // }
    } else if (g_animation) {
        g_leftArmAngle = 10 * Math.sin(0.6 * g_seconds);
        g_leftForearmAngle = 15 * Math.sin(0.6 * g_seconds);
        g_leftHandAngle = -25 * Math.sin(-0.6 * g_seconds);
        g_rightArmAngle = -20 * Math.sin(0.6 * g_seconds) + 10;
        g_rightForearmAngle = -15 * Math.sin(0.6 * g_seconds) + 15;
        g_rightHandAngle = 25 * Math.sin(-0.6 * g_seconds) + 20;
        g_leftThighAngle = 15 * Math.sin(-0.6 * g_seconds);
        g_leftCalfAngle = 15 * Math.sin(-0.6 * g_seconds);
        g_rightThighAngle = 20 * Math.sin(-0.6 * g_seconds) + 5;
        g_rightCalfAngle = 20 * Math.sin(-0.6 * g_seconds);
    }
}

function click(ev) {
    if (ev.shiftKey && !g_spin) {
        g_spin = true;
        return;
    } else if (ev.shiftKey && g_spin) {
        g_spin = false;
        return;
    }
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

    var floor = new Cube();
    floor.color = [1.0, 0.0, 0.0, 1.0];
    floor.textureNum = 0;
    floor.matrix.translate(75, -5, 75);
    floor.matrix.scale(100, 0, 100);
    floor.matrix.translate(-0.75, -0.5, -0.75);
    floor.render();

    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0];
    sky.textureNum = 1;
    sky.matrix.translate(75, 75, 75);
    sky.matrix.scale(150, 150, 150);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    drawMap();

    var body = new AnimalCube();
    body.matrix.rotate(-20, 1, 0, 0);
    body.color = g_bodyColor;
    body.matrix.translate(-0.15, -0.25, 0.7);
    body.matrix.scale(0.28, 0.34, 0.15);
    var headCoords = new Matrix4(body.matrix);
    body.render();

    var head = new Sphere();
    head.color = g_bodyColor;
    head.matrix = headCoords;
    head.matrix.translate(0.5, 1.55, 0);
    var faceCoords = new Matrix4(head.matrix);
    var foreHeadCoords = new Matrix4(head.matrix);
    head.matrix.scale(0.35, 0.35, 0.67);
    var chinCoords = new Matrix4(head.matrix);
    head.render();

    var chin = new Cylinder();
    chin.color = g_bodyColor;
    chin.matrix = chinCoords;
    chin.matrix.rotate(90, 1, 0, 0);

    chin.matrix.scale(1.45, 1.6, 1.2);
    chin.render();

    var face = new TriPrism();
    face.color = g_bodyColor;
    face.matrix = faceCoords;
    face.matrix.rotate(90, 0, 1, 0);
    face.matrix.rotate(180, 1, 0, 0);
    face.matrix.rotate(12, 0, 0, 1);

    face.matrix.translate(-0.2, 0.03, -0.23);

    face.matrix.scale(0.85, 0.25, 0.45);
    face.render();

    var foreHead = new TriPrism();
    foreHead.color = g_bodyColor;
    foreHead.matrix = foreHeadCoords;
    foreHead.matrix.rotate(90, 0, 1, 0);
    foreHead.matrix.rotate(180, 1, 0, 0);
    foreHead.matrix.rotate(90, 0, 0, 1);

    foreHead.matrix.translate(-0.17, -0.7, -0.28);
    foreHead.matrix.scale(0.25, 0.35, 0.55);
    foreHead.render();

    var torso = new AnimalCube();
    torso.color = g_clothColor;
    torso.matrix.translate(-0.18, -0.25, 0.7);
    torso.matrix.scale(0.35, 0.22, 0.17);
    var leftThighCoords = new Matrix4(torso.matrix);
    var rightThighCoords = new Matrix4(torso.matrix);
    torso.render();

    //Left Leg Connection

    var leftThigh = new AnimalCube();
    leftThigh.color = g_clothColor;
    leftThigh.matrix.rotate(120, 1, 0, 0);
    leftThigh.matrix.rotate(180, 0, 0, 1);
    leftThigh.matrix.rotate(-30, 0, 1, 0);
    leftThigh.matrix.translate(-0.34, -0.79, -0.14);

    leftThigh.matrix.rotate(g_leftThighAngle, 0, 1, 0);
    leftCalfCoords = new Matrix4(leftThigh.matrix);

    leftThigh.matrix.scale(0.2, 0.2, 0.4);
    leftThigh.render();

    var leftCalf = new TriPrism();
    leftCalf.color = g_bootColor;
    leftCalf.matrix = leftCalfCoords;

    leftCalf.matrix.rotate(49, 1, 0, 0);
    leftCalf.matrix.rotate(22, 0, 1, 0);
    leftCalf.matrix.rotate(141, 0, 0, 1);

    leftCalf.matrix.translate(0.17, -0.32, 0.22);
    leftCalf.matrix.rotate(g_leftCalfAngle, 0, 1, 0);
    leftFootCoords = new Matrix4(leftCalf.matrix);

    leftCalf.matrix.scale(0.11, 0.11, 0.4);
    leftCalf.render();

    var leftFoot = new AnimalCube();
    leftFoot.color = g_bootColor;
    leftFoot.matrix = leftFootCoords;
    leftFoot.matrix.rotate(-84, 1, 0, 0);
    leftFoot.matrix.rotate(-316, 0, 1, 0);
    leftFoot.matrix.rotate(183, 0, 0, 1);

    leftFoot.matrix.translate(0.07, 0.48, 0.17);
    leftFoot.matrix.rotate(g_leftFootAngle, 0, 0, 1);
    leftFoot.matrix.scale(-0.25, -0.07, -0.13);
    leftFoot.render();

    //Right Leg Connection

    var rightThigh = new AnimalCube();
    rightThigh.color = g_clothColor;
    rightThigh.matrix.rotate(115, 1, 0, 0);
    rightThigh.matrix.rotate(-18, 0, 1, 0);
    rightThigh.matrix.rotate(198, 0, 0, 1);

    rightThigh.matrix.translate(-0.08, -0.88, -0.16);

    rightThigh.matrix.rotate(g_rightThighAngle, 0, 0, 1);

    var rightCalfCoords = new Matrix4(rightThigh.matrix);
    rightThigh.matrix.scale(0.2, 0.2, 0.4);
    rightThigh.render();

    var rightCalf = new TriPrism();
    rightCalf.color = g_bootColor;
    rightCalf.matrix = rightCalfCoords;

    rightCalf.matrix.rotate(36, 1, 0, 0);
    rightCalf.matrix.rotate(-31, 0, 1, 0);
    rightCalf.matrix.rotate(104, 0, 0, 1);

    rightCalf.matrix.translate(0.21, -0.32, 0.19);
    rightCalf.matrix.rotate(g_rightCalfAngle, 0, 0, 1);
    var rightFootCoords = new Matrix4(rightCalf.matrix);
    rightCalf.matrix.scale(0.11, 0.11, 0.4);
    rightCalf.render();

    var rightFoot = new AnimalCube();
    rightFoot.color = g_bootColor;
    rightFoot.matrix = rightFootCoords;
    rightFoot.matrix.rotate(-84, 1, 0, 0);
    rightFoot.matrix.rotate(-316, 0, 1, 0);
    rightFoot.matrix.rotate(183, 0, 0, 1);
    rightFoot.matrix.rotate(g_xAngle, 1, 0, 0);
    rightFoot.matrix.rotate(g_yAngle, 0, 1, 0);
    rightFoot.matrix.rotate(g_zAngle, 0, 0, 1);
    rightFoot.matrix.translate(0.07, 0.48, 0.17);
    rightFoot.matrix.rotate(g_rightFootAngle, 0, 0, 1);

    rightFoot.matrix.translate(g_xPos, g_yPos, g_zPos);
    rightFoot.matrix.scale(-0.25, -0.07, -0.13);
    rightFoot.render();

    // Left Arm Connection

    leftShoulder = new Sphere();
    leftShoulder.color = g_bodyColor;
    leftShoulder.matrix.translate(0.14, 0.3, 0.73);
    leftShoulder.matrix.scale(0.08, 0.08, 0.08);
    leftShoulder.render();

    leftArm = new AnimalCube();
    leftArm.color = g_bodyColor;
    leftArm.matrix.rotate(137, 1, 0, 0);
    leftArm.matrix.rotate(15, 0, 1, 0);
    leftArm.matrix.rotate(-25, 0, 0, 1);

    leftArm.matrix.translate(0.115, 0.4, -0.74);
    leftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
    leftArm.matrix.rotate(g_leftArmAngleX, 1, 0, 0);
    leftArm.matrix.rotate(g_leftArmAngleY, 0, 1, 0);

    leftForearmCoords = new Matrix4(leftArm.matrix);

    leftArm.matrix.scale(0.1, 0.3, 0.14);
    leftArm.render();

    leftForearm = new TriPrism();
    leftForearm.color = g_bodyColor;
    leftForearm.matrix = leftForearmCoords;
    leftForearm.matrix.rotate(-20, 1, 0, 0);
    leftForearm.matrix.rotate(-1, 0, 1, 0);
    leftForearm.matrix.rotate(119, 0, 0, 1);
    leftForearm.matrix.rotate(6, 1, 0, 0);
    leftForearm.matrix.rotate(7, 0, 1, 0);
    leftForearm.matrix.rotate(12, 0, 0, 1);
    leftForearm.matrix.translate(0.12, -0.24, 0.15);
    leftForearm.matrix.rotate(g_leftForearmAngle, 0, 1, 0);
    leftForearm.matrix.rotate(g_leftForearmAngleZ, 0, 0, 1);
    leftHandCoords = new Matrix4(leftForearm.matrix);

    leftForearm.matrix.scale(0.09, 0.09, 0.33);
    leftForearm.render();

    leftHand = new AnimalCube();
    leftHand.color = g_bodyColor;
    leftHand.matrix = leftHandCoords;

    leftHand.matrix.translate(0, 0, 0.33);
    leftHand.matrix.rotate(g_leftHandAngle, 0, 0, 1);
    leftHand.matrix.rotate(g_leftHandAngleY, 0, 1, 0);
    leftHandleCoords = new Matrix4(leftHand.matrix);

    leftHand.matrix.scale(0.1, 0.1, 0.1);
    leftHand.render();

    leftHandle = new Cylinder();
    leftHandle.color = g_handleColor;
    leftHandle.matrix = leftHandleCoords;
    leftHandle.matrix.rotate(-97, 0, 1, 0);

    leftHandle.matrix.translate(0.05, 0.04, -0.35);

    leftGuardCoords = new Matrix4(leftHandle.matrix);
    leftHandle.matrix.scale(0.05, 0.05, 0.42);
    leftHandle.render();

    leftGuard = new AnimalCube();
    leftGuard.color = g_handleColor;
    leftGuard.matrix = leftGuardCoords;
    leftGuard.matrix.rotate(-90, 0, 0, 1);

    leftGuard.matrix.translate(-0.05, -0.17, 0.38);
    leftBladeCoords = new Matrix4(leftGuard.matrix);

    leftGuard.matrix.scale(0.1, 0.35, 0.07);
    leftGuard.render();

    leftBlade = new AnimalCube();
    leftBlade.matrix = leftBladeCoords;
    leftBlade.color = g_swordColor;

    leftBlade.matrix.translate(0.04, 0.04, 0);
    leftEdgeCoords = new Matrix4(leftBlade.matrix);
    leftBlade.matrix.scale(0.03, 0.2, 0.9);
    leftBlade.render();

    leftEdge = new TriPrism();
    leftEdge.color = g_swordColor;
    leftEdge.matrix = leftEdgeCoords;
    leftEdge.matrix.rotate(90, 0, 1, 0);

    leftEdge.matrix.translate(-1.1, 0, 0);

    leftEdge.matrix.scale(0.2, 0.2, 0.03);
    leftEdge.render();

    // Right Arm Connection

    rightShoulder = new Sphere();
    rightShoulder.color = g_bodyColor;

    rightShoulder.matrix.translate(-0.15, 0.3, 0.73);
    rightShoulder.matrix.scale(0.08, 0.08, 0.08);
    rightShoulder.render();

    rightArm = new AnimalCube();
    rightArm.color = g_bodyColor;
    rightArm.matrix.rotate(137, 1, 0, 0);
    rightArm.matrix.rotate(-6, 0, 1, 0);
    rightArm.matrix.rotate(25, 0, 0, 1);

    rightArm.matrix.translate(-0.03, 0.35, -0.78);

    rightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
    rightArm.matrix.rotate(g_rightArmAngleY, 0, 1, 0);
    rightForearmCoords = new Matrix4(rightArm.matrix);

    rightArm.matrix.scale(-0.1, 0.3, 0.14);
    rightArm.render();

    rightForearm = new TriPrism();
    rightForearm.color = g_bodyColor;
    rightForearm.matrix = rightForearmCoords;
    rightForearm.matrix.rotate(-35, 1, 0, 0);
    rightForearm.matrix.rotate(-31, 0, 1, 0);
    rightForearm.matrix.rotate(150, 0, 0, 1);

    rightForearm.matrix.translate(0, -0.25, 0.17);
    rightForearm.matrix.rotate(g_rightForearmAngle, 0, 1, 0);
    rightForearm.matrix.rotate(g_rightForearmAngleZ, 0, 0, 1);

    rightHandCoords = new Matrix4(rightForearm.matrix);

    rightForearm.matrix.scale(0.09, 0.09, 0.33);
    rightForearm.render();

    rightHand = new AnimalCube();
    rightHand.color = g_bodyColor;
    rightHand.matrix = rightHandCoords;
    rightHand.matrix.rotate(16, 1, 0, 0);
    rightHand.matrix.rotate(-15, 0, 1, 0);
    rightHand.matrix.rotate(-102, 0, 0, 1);

    rightHand.matrix.translate(-0.23, 0.08, 0.26);
    rightHand.matrix.rotate(g_rightHandAngle, 0, 0, 1);
    rightHandleCoords = new Matrix4(rightHand.matrix);
    rightHand.matrix.scale(0.1, 0.1, 0.1);
    rightHand.render();

    rightHandle = new Cylinder();
    rightHandle.color = g_handleColor;
    rightHandle.matrix = rightHandleCoords;
    rightHandle.matrix.rotate(-97, 0, 1, 0);

    rightHandle.matrix.translate(0.05, 0.04, -0.35);
    rightGuardCoords = new Matrix4(rightHandle.matrix);
    rightHandle.matrix.scale(0.05, 0.05, 0.42);
    rightHandle.render();

    rightGuard = new AnimalCube();
    rightGuard.color = g_handleColor;
    rightGuard.matrix = rightGuardCoords;
    rightGuard.matrix.rotate(-90, 0, 0, 1);

    rightGuard.matrix.translate(-0.05, -0.17, 0.38);
    rightBladeCoords = new Matrix4(rightGuard.matrix);

    rightGuard.matrix.scale(0.1, 0.35, 0.07);
    rightGuard.render();

    rightBlade = new AnimalCube();
    rightBlade.color = g_swordColor;
    rightBlade.matrix = rightBladeCoords;

    rightBlade.matrix.translate(0.04, 0.04, 0);
    rightEdgeCoords = new Matrix4(rightBlade.matrix);
    rightBlade.matrix.scale(0.03, 0.2, 0.9);
    rightBlade.render();

    rightEdge = new TriPrism();
    rightEdge.color = g_swordColor;
    rightEdge.matrix = rightEdgeCoords;
    rightEdge.matrix.rotate(90, 0, 1, 0);
    rightEdge.matrix.translate(-1.1, 0, 0);
    rightEdge.matrix.scale(0.2, 0.2, 0.03);
    rightEdge.render();

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
