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

/**
 * @param {DOMPointReadOnly} centre
 */
function initialiseGameState(centre) {
  /**
   * @typedef {{calcNumber: number}} TargetData
   * @typedef {{path: Path2D, index: number, isSelected: boolean, isDisplayed: boolean, position: DOMPointReadOnly, data: TargetData}} PieceData
   * @type {[PieceData]} */
  let circles;
  /** @type {[number]} */
  let dataNumbers;
  /**
   * @typedef {{hasPlayed: boolean, selectedIndex: number}} Play
   * @type {{first: Play, second: Play}}
   */
  const currentTurn = {
    first: initialPlay(),
    second: initialPlay(),
  };
  let currentLevel = 0;
  const circleRadius = 150;

  /**
   * @param {number} circleIndex
   * @param {number} dataNumber
   * @returns {PieceData}
   */
  function initACircle(circleIndex, dataNumber) {
    const partCircle = fullCircle * (circleIndex / totalCircles);
    const circleX = centre.x + circleRadius * Math.sin(partCircle);
    const circleY = centre.y + circleRadius * Math.cos(partCircle);
    const position = new DOMPointReadOnly(circleX, circleY);
    const path = new Path2D();
    path.arc(circleX, circleY, 50, 0, fullCircle);
    return {
      path,
      index: circleIndex - 1,
      isSelected: false,
      data: {
        calcNumber: dataNumber,
      },
      position,
      isDisplayed: true,
    };
  }

  function initialiseGame() {
    dataNumbers = [25, 37, 25, 256, 42, 56, 97, 60];
    currentLevel = 0;
    initialiseLevel();
  }

  function initialiseLevel() {
    const targetNumber = dataNumbers[currentLevel];
    const totalPairs = 4;
    let currentPair = 0;
    circles = [];
    while (currentPair < totalPairs) {
      const firstNumber = Math.round(Math.random() * targetNumber);
      const secondNumber = targetNumber - firstNumber;
      circles.push(initACircle(currentPair * 2 + 1, firstNumber));
      circles.push(initACircle(currentPair * 2 + 2, secondNumber));
      currentPair++;
    }
  }

  /**
   * @returns {[PieceData]}
   */
  function getCirclesToDraw() {
    return circles.filter((c) => c.isDisplayed);
  }
  /**
   * @returns {boolean}
   */
  function turnIsWon() {
    return (
      dataNumbers[currentLevel] ===
      circles[currentTurn.first.selectedIndex].data.calcNumber +
        circles[currentTurn.second.selectedIndex].data.calcNumber
    );
  }
  /**
   * @returns {boolean}
   */
  function gameIsWon() {
    return currentLevel === dataNumbers.length;
  }
  /**
   * @returns {boolean}
   */
  function levelIsWon() {
    return circles.filter((c) => c.isDisplayed).length === 0;
  }

  /**
   * @param {CanvasRenderingContext2D} theContext
   * @param {number} x
   * @param {number} y
   * @returns {PieceData}
   */
  function getHitCircle(theContext, x, y) {
    return circles.find((c) =>
      theContext.isPointInPath(c.path, e.offsetX, e.offsetY)
    );
  }

  /**
   * @param {CanvasRenderingContext2D} theContext
   * @param {number} x
   * @param {number} y
   */
  function onGameClick(theContext, x, y) {
    const clickedCircle = getHitCircle(theContext, x, y);
    if (clickedCircle) {
      onCircleClicked(clickedCircle);
    }
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

  /**
   * @param {PieceData} hitCircle
   */
  function onCircleClicked(hitCircle) {
    const newPlay = doPlay(hitCircle.index);
    if (
      currentTurn.first.hasPlayed ||
      currentTurn.first.selectedIndex === hitCircle.index
    ) {
      currentTurn.second = newPlay;
      if (turnIsWon()) {
        //  Right. Get rid of the circles.
        circles[currentTurn.first.selectedIndex].isDisplayed = false;
        circles[currentTurn.second.selectedIndex].isDisplayed = false;
        currentTurn.first.hasPlayed = false;
        if (levelIsWon()) {
          currentLevel++;
          if (gameIsWon()) {
            //?
          } else {
            initialiseLevel();
          }
        }
      } else {
        //  Wrong. Unselect
        circles[currentTurn.first.selectedIndex].isSelected = false;
      }
    } else {
      hitCircle.isSelected = true;
      currentTurn.first = newPlay;
    }
  }

  return {
    initialiseGame,
    initialiseLevel,
    getCirclesToDraw,
    gameIsWon,
    onGameClick,
  };
}

export default {
  name: "HelloWorld",
  setup() {
    /**@type {HTMLCanvasElement} */
    let theCanvas;
    /**@type {CanvasRenderingContext2D} */
    let theContext;
    let gameState = initialiseGameState();
    const centre = new DOMPointReadOnly(250, 250);
    onMounted(() => {
      initialise();
    });
    function initialise() {
      circles = [];
      theCanvas = document.getElementById("gameCanvas");
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
      theContext.clearRect(0, 0, 500, 500); // clear canvas
      gameState.getCirclesToDraw().forEach((p) => {
        //  Circles
        theContext.fillStyle = p.isSelected ? "green" : "red";
        theContext.fill(p.path);
        //  Numbers
        drawText(
          theContext,
          `${p.data.calcNumber}`,
          p.position,
          "blue",
          "32px Impact"
        );
      });
      if (gameState.gameIsWon()) {
        drawText(theContext, "✓", centre, "green", "48px Impact");
      } else {
        drawText(
          theContext,
          `${dataNumbers[currentLevel]}`,
          centre,
          "black",
          "48px Impact"
        );
      }
      window.requestAnimationFrame(drawCircles);
    }
    /**@param {MouseEvent} e */
    function gameCanvasClick(e) {
      const hitCircle = gameState.onGameClick(theContext, e.offsetX, e.offsetY);
    }
    return { gameCanvasClick };
  },
};
</script>
