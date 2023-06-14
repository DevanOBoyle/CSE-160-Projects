/** @format */

class Sphere {
    constructor() {
        this.type = "cylinder";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 15;
        this.size = 1;
        this.matrix = new Matrix4();
    }
    render() {
        var rgba = this.color;
        // Pass the size
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let orig = [0, 0];

        let angleStep = 180 / this.segments;
        var sphereSegments = []; // radius and height of sphere cross sections
        for (var angle = -90; angle <= 90; angle += angleStep) {
            //get all sphere cross sections
            let circ = [
                Math.cos((angle * Math.PI) / 180),
                Math.sin((angle * Math.PI) / 180),
            ];
            sphereSegments.push(circ);
        }
        for (var seg = 0; seg < this.segments; seg += 1) {
            //seg refers to segment of sphere
            let seg1 = sphereSegments[seg];
            let seg2 = sphereSegments[seg + 1];
            for (var angle = 0; angle < 360; angle += angleStep) {
                //there is a rounding error for when number of segments == 7 (fixed by making less than 361 shouldnt be a problem as long as seg size > 360
                let angle1 = angle;
                let angle2 = angle + angleStep;
                let s1v1 = [
                    Math.cos((angle1 * Math.PI) / 180) * seg1[0],
                    seg1[1],
                    Math.sin((angle1 * Math.PI) / 180) * seg1[0],
                ];
                let s1v2 = [
                    Math.cos((angle2 * Math.PI) / 180) * seg1[0],
                    seg1[1],
                    Math.sin((angle2 * Math.PI) / 180) * seg1[0],
                ];
                let s2v1 = [
                    Math.cos((angle1 * Math.PI) / 180) * seg2[0],
                    seg2[1],
                    Math.sin((angle1 * Math.PI) / 180) * seg2[0],
                ];
                let s2v2 = [
                    Math.cos((angle2 * Math.PI) / 180) * seg2[0],
                    seg2[1],
                    Math.sin((angle2 * Math.PI) / 180) * seg2[0],
                ];

                let shade = 0.6 + 0.4 * (angle / 360);
                gl.uniform4f(
                    u_FragColor,
                    rgba[0] * shade,
                    rgba[1] * shade,
                    rgba[2] * shade,
                    rgba[3]
                );
                if (seg1[0] == 0) {
                    drawTriangle3D([
                        s1v1[0],
                        s1v1[1],
                        s1v1[2],
                        s2v1[0],
                        s2v1[1],
                        s2v1[2],
                        s2v2[0],
                        s2v2[1],
                        s2v2[2],
                    ]);
                } else if (seg2[0] == 0) {
                    drawTriangle3D([
                        s2v2[0],
                        s2v2[1],
                        s2v2[2],
                        s1v2[0],
                        s1v2[1],
                        s1v2[2],
                        s1v1[0],
                        s1v1[1],
                        s1v1[2],
                    ]);
                } else {
                    drawTriangle3D([
                        s1v1[0],
                        s1v1[1],
                        s1v1[2],
                        s2v1[0],
                        s2v1[1],
                        s2v1[2],
                        s2v2[0],
                        s2v2[1],
                        s2v2[2],
                    ]);
                    drawTriangle3D([
                        s2v2[0],
                        s2v2[1],
                        s2v2[2],
                        s1v2[0],
                        s1v2[1],
                        s1v2[2],
                        s1v1[0],
                        s1v1[1],
                        s1v1[2],
                    ]);
                }
            }
        }
    }
}
