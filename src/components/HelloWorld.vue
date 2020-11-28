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
    /**@type{HTMLCanvasElement} */
    let theCanvas;
    let theContext;
    /**@type{{path: Path2D}} */
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
        circles.push({ path: thePath });
      }
      drawCircles();
    }
    function drawCircles() {
      circles.forEach((p) => {
        theContext.fill(p.path);
      });
    }
    /**@param {MouseEvent} e */
    function gameCanvasClick(e) {
      console.log(`x: ${e.offsetX} y: ${e.offsetY}`);
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
