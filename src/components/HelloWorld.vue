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
/**
 * Numbers set up by teacher
 *  Qs per round
 *  Operation
 *  Time to answer
 * Music
 * Countdown
 * Farm themed
 * Filling up milk
 * cow kick bucket to help farmer milk cow
 */
export default {
  name: "HelloWorld",
  setup() {
    /**@type {HTMLCanvasElement} */
    let theCanvas;
    /**@type {CanvasRenderingContext2D} */
    let theContext;
    /**
     * @typedef {{calcNumber: number}} TargetData
     * @typedef {{path: Path2D, index: number, isHit: boolean, position: DOMPointReadOnly, data: TargetData}} PieceData
     * @type {[PieceData]} */
    let circles;
    const dataNumbers = [25, 37, 25, 256, 42, 56, 97, 60];
    /**
     * @typedef {{hasPlayed: boolean, selectedIndex: number}} Play
     * @type {{first: Play, second: Play}}
     */
    const currentGame = {
      first: initialPlay(),
      second: initialPlay(),
    };
    const centre = new DOMPointReadOnly(250, 250);
    const totalCircles = 8;
    const circleRadius = 150;
    onMounted(() => {
      initialise();
    });
    /**
     * @param {number} circle
     * @returns {PieceData}
     */
    function initACircle(circleNumber) {
      const partCircle = fullCircle * (circleNumber / totalCircles);
      const circleX = centre.x + circleRadius * Math.sin(partCircle);
      const circleY = centre.y + circleRadius * Math.cos(partCircle);
      const position = new DOMPointReadOnly(circleX, circleY);
      const path = new Path2D();
      path.arc(circleX, circleY, 50, 0, fullCircle);
      return {
        path,
        index: circleNumber - 1,
        isHit: false,
        data: {
          calcNumber: dataNumbers[circleNumber - 1],
        },
        position,
      };
    }
    function initialise() {
      circles = [];
      theCanvas = document.getElementById("gameCanvas");
      theContext = theCanvas.getContext("2d");
      for (let circle = 1; circle < totalCircles + 1; circle++) {
        circles.push(initACircle(circle));
      }
      window.requestAnimationFrame(drawCircles);
    }
    /**
     * @param {CanvasRenderingContext2D} p_Context
     * @param {string} p_ToShow
     * @param {DOMPointReadOnly} p_Position
     * @param {string} p_Colour
     * @param {string} p_Font
     */
    function drawText(p_Context, p_ToShow, p_Position, p_Colour, p_Font) {
      p_Context.fillStyle = p_Colour;
      p_Context.font = p_Font;
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
        drawText(
          theContext,
          `${p.data.calcNumber}`,
          p.position,
          "blue",
          "32px Impact"
        );
        //  Total if we're done
        if (currentGame.first.hasPlayed && currentGame.second.hasPlayed) {
          drawText(
            theContext,
            circles[currentGame.first.selectedIndex].data.calcNumber +
              circles[currentGame.second.selectedIndex].data.calcNumber,
            centre,
            "black",
            "48px Impact"
          );
        }
      });
      window.requestAnimationFrame(drawCircles);
    }
    /**
     * @returns {Play}
     */
    function initialPlay() {
      return { hasPlayed: false, selectedIndex: -1 };
    }
    /**
     * @param {number} p_Index
     * @returns {Play}
     */
    function doPlay(p_Index) {
      return { hasPlayed: true, selectedIndex: p_Index };
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
          currentGame.first = initialPlay();
          currentGame.second = initialPlay();
        }
        const newPlay = doPlay(hitCircle.index);
        if (currentGame.first.hasPlayed) {
          currentGame.second = newPlay;
        } else {
          currentGame.first = newPlay;
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
