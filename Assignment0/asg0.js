/** @format */
// Retrieve <canvas> element <- (1)
var canvas = document.getElementById("example");

// Get the rendering context for 2DCG <- (2)
var ctx = canvas.getContext("2d");

// DrawRectangle.js
function main() {
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }

    // Draw a blue rectangle <- (3)
    ctx.fillStyle = "rgba(0, 0, 0, 1.0)"; // Set a blue color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

    let v1 = new Vector3([2.25, 2.25, 0]);

    drawVector(v1, "red");
}

function drawVector(v, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(
        v.elements[0] * 20 + canvas.width / 2,
        canvas.height / 2 - v.elements[1] * 20
    );
    ctx.stroke();
}

function handleDrawEvent() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    ctx.fillRect(0, 0, 400, 400);

    var x1 = document.getElementById("x1");
    var y1 = document.getElementById("y1");

    var v1 = new Vector3([x1.value, y1.value, 0]);

    var x2 = document.getElementById("x2");
    var y2 = document.getElementById("y2");

    var v2 = new Vector3([x2.value, y2.value, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
    ctx.fillRect(0, 0, 400, 400);

    var x1 = document.getElementById("x1");
    var y1 = document.getElementById("y1");

    var v1 = new Vector3([x1.value, y1.value, 0]);

    var x2 = document.getElementById("x2");
    var y2 = document.getElementById("y2");

    var v2 = new Vector3([x2.value, y2.value, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    var op = document.getElementById("operation").value;
    var scalar = document.getElementById("scalar").value;

    switch (op) {
        case "Add":
            v1.add(v2);
            drawVector(v1, "green");
            return;
        case "Subtract":
            v1.sub(v2);
            drawVector(v1, "green");
            return;
        case "Multiply":
            v1.mul(scalar);
            v2.mul(scalar);
            drawVector(v1, "green");
            drawVector(v2, "green");
            return;
        case "Divide":
            v1.div(scalar);
            v2.div(scalar);
            drawVector(v1, "green");
            drawVector(v2, "green");
            return;
        case "Magnitude":
            console.log("Magnitude v1: " + v1.magnitude());
            console.log("Magnitude v2: " + v2.magnitude());
            return;
        case "Normalize":
            v1.normalize();
            v2.normalize();
            drawVector(v1, "green");
            drawVector(v2, "green");
            return;
        case "Angle Between":
            console.log("Angle: " + angleBetween(v1, v2));
            return;
        case "Area":
            console.log("Area of the Triangle: " + areaTriangle(v1, v2));
            return;
    }
    return;
}

function angleBetween(v1, v2) {
    var d = Vector3.dot(v1, v2);
    d /= v1.magnitude() * v2.magnitude();
    d = (Math.acos(d) * 180) / Math.PI;
    // Don't delete the return statement.
    return d;
}

function areaTriangle(v1, v2) {
    var area = 0;
    v3 = Vector3.cross(v1, v2);
    for (let i = 0; i < 3; i++) {
        area += v3.elements[i] * v3.elements[i];
    }
    return Math.sqrt(area) * 0.5;
}
