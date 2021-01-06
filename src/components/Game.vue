<template>
  <canvas
    id="gameCanvas"
    height="500"
    width="500"
    @click="gameCanvasClick"
  ></canvas>
  <div v-if="displayState.controls">
    <h2>Start game?</h2>
    <div><button @click="startEasyGame">Easy</button></div>
    <div><button @click="startMediumGame">Medium</button></div>
    <div><button @click="startHardGame">Hard</button></div>
  </div>
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
  name: "Game",
  setup() {
    /**@type {CanvasRenderingContext2D} */
    let theContext;
    const centre = new DOMPointReadOnly(250, 250);
    const soundPop = new Audio(require("@/assets/sounds/pop.wav"));
    const soundClap = new Audio(require("@/assets/sounds/clap.wav"));
    const soundError = new Audio(require("@/assets/sounds/error.wav"));
    const soundBoo = new Audio(require("@/assets/sounds/boo.wav"));
    const gameState = initialiseGameState(centre, {
      pop: soundPop,
      clap: soundClap,
      error: soundError,
      boo: soundBoo,
    });
    onMounted(async () => {
      initialise();
    });
    async function initialise() {
      const font = new FontFace(
        "CanvasFont",
        `url(${require("@/assets/fonts/Lobster/Lobster-Regular.ttf")})`
      );
      await font.load();
      document.fonts.add(font);
      const theCanvas = document.getElementById("gameCanvas");
      theContext = theCanvas.getContext("2d");
    }

    /**
     * @param {string} difficulty
     */
    function startGame(difficulty) {
      displayState.controls = false;
      gameState.initialiseGame(difficulty);
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
    const displayState = { controls: true };
    function drawCircles() {
      try {
        const timeNow = new Date();
        theContext.clearRect(0, 0, 500, 500); // clear canvas
        gameState.onGameTick(timeNow);
        if (gameState.gameIsWon()) {
          drawText(theContext, "✓", centre, "green", "72px Impact");
          displayState.controls = true;
        } else if (gameState.gameIsLost()) {
          drawText(theContext, "✗", centre, "red", "72px Impact");
          displayState.controls = true;
        } else {
          gameState.getCirclesToDraw().forEach((p, index) => {
            if (p.isDisplayed) {
              //  Circles
              const circleAlpha = gameState.getPieceAlpha(p, timeNow);
              theContext.fillStyle = gameState.isPieceSelected(p)
                ? `rgba(0, 255, 0, ${circleAlpha})`
                : `rgba(255, 0, 0, ${circleAlpha})`;
              const pieceCentre = gameState.getPieceCentre(index, timeNow);
              theContext.fill(
                gameState.updatePiecePath(p, pieceCentre, timeNow)
              );
              //  Numbers
              drawText(
                theContext,
                `${p.data.calcNumber}`,
                pieceCentre,
                `rgba(0, 0, 255, ${circleAlpha})`,
                "32px CanvasFont"
              );
            }
          });
          drawText(
            theContext,
            gameState.getCurrentTargetText(),
            centre,
            "black",
            "48px CanvasFont"
          );
          drawText(
            theContext,
            `${gameState.getCountdownSeconds(timeNow)}`,
            new DOMPointReadOnly(30, 30),
            "black",
            "32px CanvasFont"
          );
          window.requestAnimationFrame(drawCircles);
        }
      } catch (error) {
        console.error(error);
      }
    }

    /**@param {MouseEvent} e */
    function gameCanvasClick(e) {
      gameState.onGameClick(theContext, e.offsetX, e.offsetY);
    }
    const startEasyGame = () => startGame("easy");
    const startMediumGame = () => startGame("medium");
    const startHardGame = () => startGame("hard");
    return {
      gameCanvasClick,
      displayState,
      startEasyGame,
      startMediumGame,
      startHardGame,
    };
  },
};
</script>
