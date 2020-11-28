<template>
  <h1>
    <canvas id="gameCanvas" height="300" width="300"></canvas>
  </h1>
</template>

<script>
import { onMounted } from "vue";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  setup() {
    /**@type{HTMLCanvasElement} */
    let theCanvas;
    let theContext;
    /**@type{[{path: Path2D}]} */
    let circles;
    onMounted(() => {
      initialise();
    });
    function initialise() {
      theCanvas = document.getElementById("gameCanvas");
      theContext = theCanvas.getContext("2d");
      circles = [];
      const totalCircles = 8;
      const centreX = 150;
      const centreY = 150;
      const circleRadius = 100;
      for (let circle = 1; circle < totalCircles + 1; circle++) {
        const circleX =
          centreX +
          circleRadius * Math.sin(2 * Math.PI * (circle / totalCircles));
        const circleY =
          centreY +
          circleRadius * Math.cos(2 * Math.PI * (circle / totalCircles));
        const thePath = new Path2D();
        thePath.arc(circleX, circleY, 25, 0, 2 * Math.PI);
        circles.push({ path: thePath });
      }
      drawCircles();
    }
    function drawCircles() {
      circles.forEach((p) => {
        theContext.fill(p.path);
      });
    }
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
