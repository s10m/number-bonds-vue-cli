
const fullCircle = 2 * Math.PI;
/**
* @param {DOMPointReadOnly} centre
*/
export function initialiseGameState(centre) {
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
 const currentTurnData = {
   first: initialPlay(),
   second: initialPlay(),
 };
 let currentLevel = 0;
 const circleRadius = 150;

 /**
  * @param {number} circleIndex
  * @param {number} dataNumber
  * @param {number} totalCircles
  * @returns {PieceData}
  */
 function initACircle(circleIndex, dataNumber, totalCircles) {
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
   const totalCircles = 2 * totalPairs;
   let currentPair = 0;
   circles = [];
   while (currentPair < totalPairs) {
     const firstNumber = Math.round(Math.random() * targetNumber);
     const secondNumber = targetNumber - firstNumber;
     circles.push(initACircle(currentPair * 2 + 1, firstNumber, totalCircles));
     circles.push(initACircle(currentPair * 2 + 2, secondNumber, totalCircles));
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
     circles[currentTurnData.first.selectedIndex].data.calcNumber +
       circles[currentTurnData.second.selectedIndex].data.calcNumber
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
   * @returns {string}
   */
  function getCurrentTargetText() {
    return `${dataNumbers[currentLevel]}`;
  }

 /**
  * @param {CanvasRenderingContext2D} theContext
  * @param {number} x
  * @param {number} y
  * @returns {PieceData}
  */
 function getHitCircle(theContext, x, y) {
   return circles.find((c) =>
     theContext.isPointInPath(c.path, x, y)
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
     currentTurnData.first.hasPlayed ||
     currentTurnData.first.selectedIndex === hitCircle.index
   ) {
     currentTurnData.second = newPlay;
     if (turnIsWon()) {
       //  Right. Get rid of the circles.
       circles[currentTurnData.first.selectedIndex].isDisplayed = false;
       circles[currentTurnData.second.selectedIndex].isDisplayed = false;
       currentTurnData.first.hasPlayed = false;
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
       circles[currentTurnData.first.selectedIndex].isSelected = false;
     }
   } else {
     hitCircle.isSelected = true;
     currentTurnData.first = newPlay;
   }
 }

 return {
   initialiseGame,
   initialiseLevel,
   getCirclesToDraw,
   gameIsWon,
   onGameClick,
   getCurrentTargetText,
 };
}