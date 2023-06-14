/** @format */
class Cube {
    constructor() {
        this.type = "cube";
        //this.position = [0.0, 0.0, 0.0]; // The array for the position of a mouse press
        this.color = [1.0, 1.0, 1.0, 1.0]; // The array to store the color of a point
        //this.size = 5;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = 0;
        this.spec = false;
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform1i(u_spec, this.spec);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //Front of Cube

        drawTriangle3DNormal(
            [0, 0, 0, 1, 1, 0, 1, 0, 0],
            [0, 0, -1, 0, 0, -1, 0, 0, -1]
        );
        drawTriangle3DNormal(
            [0, 0, 0, 0, 1, 0, 1, 1, 0],
            [0, 0, -1, 0, 0, -1, 0, 0, -1]
        );

        // Back of Cube
        drawTriangle3DNormal(
            [0, 0, 1, 1, 1, 1, 1, 0, 1],
            [0, 0, 1, 0, 0, 1, 0, 0, 1]
        );
        drawTriangle3DNormal(
            [0, 0, 1, 0, 1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0, 1, 0, 0, 1]
        );

        // Left of cube
        drawTriangle3DNormal(
            [0, 0, 0, 0, 1, 1, 0, 0, 1],
            [-1, 0, 0, -1, 0, 0, -1, 0, 0]
        );
        drawTriangle3DNormal(
            [0, 0, 0, 0, 1, 0, 0, 1, 1],
            [-1, 0, 0, -1, 0, 0, -1, 0, 0]
        );

        // Bottom of cube
        drawTriangle3DNormal(
            [0, 0, 0, 1, 0, 1, 1, 0, 0],
            [0, -1, 0, 0, -1, 0, 0, -1, 0]
        );
        drawTriangle3DNormal(
            [0, 0, 0, 0, 0, 1, 1, 0, 1],
            [0, -1, 0, 0, -1, 0, 0, -1, 0]
        );

        // Right of cube
        drawTriangle3DNormal(
            [1, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 1, 0, 0]
        );
        drawTriangle3DNormal(
            [1, 0, 0, 1, 1, 0, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 1, 0, 0]
        );

        // Top of cube
        drawTriangle3DNormal(
            [0, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 0, 0, 1, 0, 0, 1, 0]
        );
        drawTriangle3DNormal(
            [0, 1, 0, 0, 1, 1, 1, 1, 1],
            [0, 1, 0, 0, 1, 0, 0, 1, 0]
        );
    }
}
