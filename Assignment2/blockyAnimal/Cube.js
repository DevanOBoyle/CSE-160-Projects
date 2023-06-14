/** @format */
class Cube {
    constructor() {
        this.type = "cube";
        //this.position = [0.0, 0.0, 0.0]; // The array for the position of a mouse press
        this.color = [1.0, 1.0, 1.0, 1.0]; // The array to store the color of a point
        //this.size = 5;
        //this.segments = 10;
        this.matrix = new Matrix4();
    }

    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.9,
            rgba[1] * 0.9,
            rgba[2] * 0.9,
            rgba[3]
        );
        drawTriangle3D([0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0]);

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.8,
            rgba[1] * 0.8,
            rgba[2] * 0.8,
            rgba[3]
        );
        drawTriangle3D([1, 0, 0, 1, 0, 1, 1, 1, 1]);
        drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.6,
            rgba[1] * 0.6,
            rgba[2] * 0.6,
            rgba[3]
        );
        drawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);
        drawTriangle3D([0, 0, 0, 0, 1, 0, 0, 1, 1]);

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.5,
            rgba[1] * 0.5,
            rgba[2] * 0.5,
            rgba[3]
        );
        drawTriangle3D([0, 0, 1, 1, 0, 1, 1, 1, 1]);
        drawTriangle3D([0, 0, 1, 0, 1, 1, 1, 1, 1]);

        gl.uniform4f(
            u_FragColor,
            rgba[0] * 0.4,
            rgba[1] * 0.4,
            rgba[2] * 0.4,
            rgba[3]
        );
        drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);
        drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);
    }
}
