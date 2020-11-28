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
    /**
     * @typedef {{hasPlayed: boolean, selectedIndex: number}} Play
     * @type {{first: Play, second: Play}}
     */
    let currentGame;
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
      currentGame = {
        first: { hasPlayed: false },
        second: { hasPlayed: false },
      };
      window.requestAnimationFrame(drawCircles);
    }
    /**
     * @param {CanvasRenderingContext2D} p_Context
     * @param {string} p_ToShow
     * @param {DOMPointReadOnly} p_Position
     */
    function drawText(p_Context, p_ToShow, p_Position) {
      const textSize = p_Context.measureText(p_ToShow);
      p_Context.fillText(
        p_ToShow,
        p_Position.x - textSize.width / 2,
        p_Position.y +
          (textSize.actualBoundingBoxAscent +
            textSize.actualBoundingBoxDescent) /
            2
      );
    }
    function drawCircles() {
      theContext.clearRect(0, 0, 300, 300); // clear canvas
      circles.forEach((p) => {
        //  Circles
        theContext.fillStyle = p.isHit ? "green" : "red";
        theContext.fill(p.path);
        //  Numbers
        theContext.fillStyle = "blue";
        theContext.font = "32px Impact";
        drawText(theContext, `${p.data.calcNumber}`, p.position);
        //  Total
        if (currentGame.first.hasPlayed && currentGame.second.hasPlayed) {
          theContext.fillStyle = "black";
          theContext.font = "48px Impact";
          drawText(
            theContext,
            circles[currentGame.first.selectedIndex].data.calcNumber +
              circles[currentGame.second.selectedIndex].data.calcNumber,
            new DOMPointReadOnly(250, 250)
          );
        }
      });
      window.requestAnimationFrame(drawCircles);
    }
    /**@param {MouseEvent} e */
    function gameCanvasClick(e) {
      const hitCircle = circles.find((c) =>
        theContext.isPointInPath(c.path, e.offsetX, e.offsetY)
      );
      if (hitCircle) {
        if (currentGame.second.hasPlayed) {
          //  Previous game is over. Unset all.
          circles.forEach((c) => (c.isHit = false));
          currentGame.first = { hasPlayed: false, selectedIndex: -1 };
          currentGame.second = { hasPlayed: false, selectedIndex: -1 };
        }
        if (!currentGame.first.hasPlayed) {
          currentGame.first.hasPlayed = true;
          currentGame.first.selectedIndex = hitCircle.index;
        } else {
          currentGame.second.hasPlayed = true;
          currentGame.second.selectedIndex = hitCircle.index;
        }
        hitCircle.isHit = true;
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
