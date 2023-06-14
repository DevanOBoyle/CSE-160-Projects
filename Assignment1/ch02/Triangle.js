/** @format */
class Triangle {
    constructor() {
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0]; // The array for the position of a mouse press
        this.color = [1.0, 1.0, 1.0, 1.0]; // The array to store the color of a point
        this.size = 5;
        this.specificVertices = false;
        this.vertices = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);
        // Draw
        var d = this.size / 200.0;
        if (this.specificVertices === true) {
            drawTriangle(this.vertices);
        } else {
            drawTriangle([
                xy[0] - d / 2,
                xy[1] - d / 2,
                xy[0],
                xy[1] + d / 2,
                xy[0] + d / 2,
                xy[1] - d / 2,
            ]);
        }
    }
}

function drawTriangle(vertices) {
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
