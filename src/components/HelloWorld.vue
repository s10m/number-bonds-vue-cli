<template>
  <canvas
    id="gameCanvas"
    height="300"
    width="300"
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
    /**@type {[{path: Path2D, index: number, isHit: boolean}]} */
    let circles;
    onMounted(() => {
      initialise();
    });
    function initialise() {
      circles = [];
      theCanvas = document.getElementById("gameCanvas");
      theContext = theCanvas.getContext("2d");
      const totalCircles = 8;
      const centreX = 150;
      const centreY = 150;
      const circleRadius = 100;
      for (let circle = 1; circle < totalCircles + 1; circle++) {
        const partCircle = fullCircle * (circle / totalCircles);
        const circleX = centreX + circleRadius * Math.sin(partCircle);
        const circleY = centreY + circleRadius * Math.cos(partCircle);
        const thePath = new Path2D();
        thePath.arc(circleX, circleY, 25, 0, fullCircle);
        circles.push({ path: thePath, index: circle - 1, isHit: false });
      }
      window.requestAnimationFrame(drawCircles);
    }
    function drawCircles() {
      theContext.globalCompositeOperation = "destination-over";
      theContext.clearRect(0, 0, 300, 300); // clear canvas
      circles.forEach((p) => {
        theContext.fillStyle = p.isHit ? "red" : "blue";
        theContext.fill(p.path);
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
