/** @format */

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
  gl_Position = a_Position;
  gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
    gl_FragColor = u_FragColor;
    }`;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setUpWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById("webgl");

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log("Failed to get the rendering context for WebGL");
        return;
    }
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

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (!u_FragColor) {
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }

    // Get the storage location of u_FragColor
    u_Size = gl.getUniformLocation(gl.program, "u_Size");
    if (!u_Size) {
        console.log("Failed to get the storage location of u_FragColor");
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSeg = 6;
let plane_drawn = true;

function addActionsForHtmlUI() {
    document.getElementById("plane").onclick = function () {
        plane_drawn = !plane_drawn;
        renderAllShapes();
    };
    document.getElementById("green").onclick = function () {
        g_selectedColor = [0.0, 1.0, 0.0, 1.0];
    };
    document.getElementById("red").onclick = function () {
        g_selectedColor = [1.0, 0.0, 0.0, 1.0];
    };
    document.getElementById("clear").onclick = function () {
        g_shapesList = [];
        renderAllShapes();
    };
    document.getElementById("pointButton").onclick = function () {
        g_selectedType = POINT;
    };
    document.getElementById("triButton").onclick = function () {
        g_selectedType = TRIANGLE;
    };
    document.getElementById("circleButton").onclick = function () {
        g_selectedType = CIRCLE;
    };
    document.getElementById("undoButton").onclick = function () {
        if (g_shapesUndoList.length < 1) {
            return;
        }
        for (
            let i = 0;
            i < g_shapesUndoList[g_shapesUndoList.length - 1].length;
            i++
        ) {
            index = g_shapesList.indexOf(
                g_shapesUndoList[g_shapesUndoList.length - 1][i]
            );
            if (index > -1) {
                g_shapesList.splice(index, 1);
            }
        }
        renderAllShapes();
        g_shapesRedoList.unshift(g_shapesUndoList.pop());
    };
    document.getElementById("redoButton").onclick = function () {
        if (g_shapesRedoList.length < 1) {
            return;
        }
        for (i = 0; i < g_shapesRedoList[0].length; i++) {
            g_shapesList.push(g_shapesRedoList[0][i]);
        }
        renderAllShapes();
        g_shapesUndoList.push(g_shapesRedoList[0]);
        g_shapesRedoList.shift();
    };
    document
        .getElementById("redSlide")
        .addEventListener("mouseup", function () {
            g_selectedColor[0] = this.value / 100;
        });
    document
        .getElementById("greenSlide")
        .addEventListener("mouseup", function () {
            g_selectedColor[1] = this.value / 100;
        });
    document
        .getElementById("blueSlide")
        .addEventListener("mouseup", function () {
            g_selectedColor[2] = this.value / 100;
        });

    document
        .getElementById("sizeSlide")
        .addEventListener("mouseup", function () {
            g_selectedSize = this.value;
        });
    document
        .getElementById("segSlide")
        .addEventListener("mouseup", function () {
            g_selectedSeg = this.value;
        });
}

var g_shapesList = [];
var g_shapesUndoList = [];
var g_shapesLastList = [];
var g_shapesRedoList = [];
var g_planeList = [];

function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press

    canvas.onmousedown = function (ev) {
        g_shapesLastList = [];
        g_shapesRedoList = [];
        click(ev);
    };
    canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) {
            click(ev);
        }
    };
    canvas.onmouseup = function () {
        g_shapesUndoList.push(g_shapesLastList);
    };

    drawPlane();
    renderAllShapes();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    } else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSeg;
    }
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;

    g_shapesList.push(point);
    g_shapesLastList.push(point);

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
    if (plane_drawn === true) {
        for (var i = 0; i < g_planeList.length; i++) {
            g_planeList[i].render();
        }
    }
}

function drawPlane() {
    drawPlanePart(
        [0.75, 0.75, 0.75, 1.0],
        [-0.15, -0.15, 0.15, -0.15, 0.15, 0.15]
    );
    drawPlanePart(
        [0.75, 0.75, 0.75, 1.0],
        [-0.15, -0.15, -0.15, 0.15, 0.15, 0.15]
    );
    drawPlanePart(
        [0.0, 0.0, 0.0, 1.0],
        [-0.05, -0.05, 0.05, -0.05, 0.05, 0.05]
    );
    drawPlanePart(
        [0.0, 0.0, 0.0, 1.0],
        [-0.05, -0.05, -0.05, 0.05, 0.05, 0.05]
    );
    drawPlanePart([0.75, 0.75, 0.75, 1.0], [-0.15, 0, -0.92, 0.92, 0, 0.15]);
    drawPlanePart([0.75, 0.75, 0.75, 1.0], [0.15, 0, 0.92, -0.92, 0, -0.15]);
    drawPlanePart(
        [0.75, 0.75, 0.75, 1.0],
        [0.075, 0.15, 0.15, 0.15, 0.15, 0.225]
    );
    drawPlanePart([0.75, 0.75, 0.75, 1.0], [0.075, 0, 0.15, 0.15, 0.225, 0.15]);
    drawPlanePart(
        [0.5, 0.8, 0.95, 1.0],
        [0.15, 0.15, 0.15, 0.225, 0.225, 0.15]
    );
    drawPlanePart(
        [0.75, 0.75, 0.75, 1.0],
        [0.23, 0.23, 0.15, 0.225, 0.225, 0.15]
    );
    drawPlanePart([0.1, 0.1, 0.1, 1.0], [0.05, 0, 0.35, 0.075, 0.35, -0.075]);
    drawPlanePart(
        [0.1, 0.1, 0.1, 1.0],
        [-0.05, 0, -0.35, 0.075, -0.35, -0.075]
    );

    renderAllShapes();
}

function drawPlanePart(color, vertices) {
    point = new Triangle();
    point.color = color;
    point.specificVertices = true;
    point.vertices = vertices;

    g_planeList.push(point);
}
