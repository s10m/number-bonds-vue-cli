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
import { initialiseGameState } from "../helpers/gameState";
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
    /**@type {CanvasRenderingContext2D} */
    let theContext;
    const centre = new DOMPointReadOnly(250, 250);
    const gameState = initialiseGameState(centre);
    onMounted(() => {
      initialise();
    });
    function initialise() {
      const theCanvas = document.getElementById("gameCanvas");
      theContext = theCanvas.getContext("2d");
      gameState.initialiseGame();
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
      try {
        const timeNow = new Date();
        theContext.clearRect(0, 0, 500, 500); // clear canvas
        gameState.getCirclesToDraw().forEach((p, index) => {
          if (p.isDisplayed) {
            //  Circles
            theContext.fillStyle = gameState.isPieceSelected(p)
              ? "green"
              : "red";
            const pieceCentre = gameState.getPieceCentre(index, timeNow);
            theContext.fill(gameState.updatePiecePath(p, pieceCentre, timeNow));
            const toDisplay = `${p.data.calcNumber}`;
            //  Numbers
            drawText(theContext, toDisplay, pieceCentre, "blue", "32px Impact");
          }
        });
        if (gameState.gameIsWon()) {
          drawText(theContext, "✓", centre, "green", "72px Impact");
        } else {
          const targetText = gameState.getCurrentTargetText();
          drawText(theContext, targetText, centre, "black", "48px Impact");
        }
      } catch (error) {
        console.error(error);
      }
      window.requestAnimationFrame(drawCircles);
    }

    /**@param {MouseEvent} e */
    function gameCanvasClick(e) {
      gameState.onGameClick(theContext, e.offsetX, e.offsetY);
    }
    return { gameCanvasClick };
  },
};
</script>
