/** @format */
class Cube {
    constructor() {
        this.type = "cube";
        //this.position = [0.0, 0.0, 0.0]; // The array for the position of a mouse press
        this.color = [1.0, 1.0, 1.0, 1.0]; // The array to store the color of a point
        //this.size = 5;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // draw front
        drawTriangle3DUV(
            [-0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5],
            [0, 0, 0, 1, 1, 1]
        );
        drawTriangle3DUV(
            [-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5],
            [0, 0, 1, 0, 1, 1]
        );

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.8,
            rgba[1] * 0.8,
            rgba[2] * 0.8,
            rgba[3]
        );

        // draw right
        drawTriangle3DUV(
            [0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5],
            [1, 0, 0, 1, 1, 1]
        );
        drawTriangle3DUV(
            [0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5],
            [1, 0, 0, 1, 1, 1]
        );

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.7,
            rgba[1] * 0.7,
            rgba[2] * 0.7,
            rgba[3]
        );

        // draw left
        drawTriangle3DUV(
            [-0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5],
            [1, 0, 0, 1, 1, 1]
        );
        drawTriangle3DUV(
            [-0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5],
            [1, 0, 0, 1, 1, 1]
        );

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.6,
            rgba[1] * 0.6,
            rgba[2] * 0.6,
            rgba[3]
        );

        // draw back
        drawTriangle3DUV(
            [-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5],
            [1, 0, 0, 1, 1, 1]
        );
        drawTriangle3DUV(
            [0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5],
            [1, 0, 0, 1, 1, 1]
        );

        // make top slightly darker
        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.8,
            rgba[1] * 0.8,
            rgba[2] * 0.8,
            rgba[3]
        );
        // draw top
        drawTriangle3DUV(
            [0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5],
            [1, 0, 0, 1, 1, 1]
        );
        drawTriangle3DUV(
            [0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5],
            [1, 0, 0, 1, 1, 1]
        );

        // make bottom darker
        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.4,
            rgba[1] * 0.4,
            rgba[2] * 0.4,
            rgba[3]
        );

        // draw bottom
        drawTriangle3DUV(
            [-0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5],
            [1, 0, 0, 1, 1, 1]
        );
        drawTriangle3DUV(
            [-0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5],
            [1, 0, 0, 1, 1, 1]
        );
    }
}
