<template>
  <canvas
    id="gameCanvas"
    height="500"
    width="500"
    @click="gameCanvasClick"
  ></canvas>
</template>

<script>
import { onMounted } from "vue";
const fullCircle = 2 * Math.PI;
export default {
  name: "HelloWorld",
  setup() {
    /**@type {HTMLCanvasElement} */
    let theCanvas;
    /**@type {CanvasRenderingContext2D} */
    let theContext;
    /**
     * @typedef {{calcNumber: number}} TargetData
     * @type {[{path: Path2D, index: number, isHit: boolean, position: DOMPointReadOnly, data: TargetData}]} */
    let circles;
    const dataNumbers = [25, 37, 25, 256, 42, 56, 97, 60];
    onMounted(() => {
      initialise();
    });
    function initialise() {
      circles = [];
      theCanvas = document.getElementById("gameCanvas");
      theContext = theCanvas.getContext("2d");
      const totalCircles = 8;
      const centreX = 250;
      const centreY = 250;
      const circleRadius = 150;
      for (let circle = 1; circle < totalCircles + 1; circle++) {
        const partCircle = fullCircle * (circle / totalCircles);
        const circleX = centreX + circleRadius * Math.sin(partCircle);
        const circleY = centreY + circleRadius * Math.cos(partCircle);
        const position = new DOMPointReadOnly(circleX, circleY);
        const path = new Path2D();
        path.arc(circleX, circleY, 50, 0, fullCircle);
        circles.push({
          path,
          index: circle - 1,
          isHit: false,
          data: {
            calcNumber: dataNumbers[circle - 1],
          },
          position,
        });
      }
      window.requestAnimationFrame(drawCircles);
    }
    function drawCircles() {
      theContext.clearRect(0, 0, 300, 300); // clear canvas
      circles.forEach((p) => {
        theContext.fillStyle = p.isHit ? "green" : "red";
        theContext.fill(p.path);
        theContext.fillStyle = "blue";
        theContext.font = "32px Impact";
        const textToDisplay = `${p.data.calcNumber}`;
        const textSize = theContext.measureText(textToDisplay);
        theContext.fillText(
          textToDisplay,
          p.position.x - textSize.width / 2,
          p.position.y +
            (textSize.actualBoundingBoxAscent +
              textSize.actualBoundingBoxDescent) /
              2
        );
      });
      window.requestAnimationFrame(drawCircles);
    }
    /**@param {MouseEvent} e */
    function gameCanvasClick(e) {
      const hitCircle = circles.find((c) =>
        theContext.isPointInPath(c.path, e.offsetX, e.offsetY)
      );
      if (hitCircle) {
        hitCircle.isHit = !hitCircle.isHit;
      }
    }
    return { gameCanvasClick };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
