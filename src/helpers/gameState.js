const fullCircle = 2 * Math.PI;
/**
 * @param {DOMPointReadOnly} centre
 */
export function initialiseGameState(centre) {
  /**
   * @typedef {{calcNumber: number}} TargetData
   * @typedef {{isDisplayed: boolean, data: TargetData}} PieceData
   * @type {[PieceData]} */
  let circles;
  /** @type {[number]} */
  let dataNumbers;
  /**
   * @typedef {{hasPlayed: boolean, selectedPiece: PieceData}} Play
   * @type {{first: Play, second: Play}}
   */
  const currentTurnData = {
    first: initialPlay(),
    second: initialPlay(),
  };
  let currentLevel = 0;
  const circleRadius = 150;

  /**
   * @param {number} dataNumber
   * @returns {PieceData}
   */
  const initACircle = (dataNumber) => ({
    data: {
      calcNumber: dataNumber,
    },
    isDisplayed: true,
  });

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
      circles.push(initACircle(firstNumber));
      circles.push(initACircle(secondNumber));
      currentPair++;
    }
    shuffleCircles();
  }

  function shuffleCircles() {
    const newCircles = [];
    for (let index = circles.length - 1; index >= 0; index--) {
      const indexToRemove = Math.round(Math.random()) * (circles.length - 1);
      newCircles.push(circles[indexToRemove]);
      circles.splice(indexToRemove, 1);
    }
    circles = newCircles;
  }

  /**
   * @returns {[PieceData]}
   */
  const getCirclesToDraw = () => circles.filter((c) => c.isDisplayed);

  /**
   * @returns {boolean}
   */
  const turnIsWon = () =>
    dataNumbers[currentLevel] ===
    currentTurnData.first.selectedPiece.data.calcNumber +
      currentTurnData.second.selectedPiece.data.calcNumber;

  /**
   * @returns {boolean}
   */
  const gameIsWon = () => currentLevel === dataNumbers.length;

  /**
   * @returns {boolean}
   */
  const levelIsWon = () => circles.filter((c) => c.isDisplayed).length === 0;

  /**
   * @returns {string}
   */
  const getCurrentTargetText = () => `${dataNumbers[currentLevel]}`;

  /**
   * @param {CanvasRenderingContext2D} theContext
   * @param {number} x
   * @param {number} y
   * @returns {PieceData}
   */
  const getHitCircle = (theContext, x, y) =>
    circles.find((c) => theContext.isPointInPath(c.path, x, y));

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
  const initialPlay = () => ({ hasPlayed: false, selectedPiece: null });

  /**
   * @param {PieceData} p_Circle
   * @returns {Play}
   */
  const doPlay = (p_Circle) => ({ hasPlayed: true, selectedPiece: p_Circle });

  /**
   * @param {PieceData} hitCircle
   */
  function onCircleClicked(hitCircle) {
    const newPlay = doPlay(hitCircle);
    if (
      currentTurnData.first.hasPlayed &&
      currentTurnData.first.selectedPiece !== hitCircle
    ) {
      currentTurnData.second = newPlay;
      const isTurnWon = turnIsWon();
      currentTurnData.first = initialPlay();
      currentTurnData.second = initialPlay();
      if (isTurnWon) {
        //  Right. Get rid of the circles.
        currentTurnData.first.selectedPiece.isDisplayed = false;
        currentTurnData.second.selectedPiece.isDisplayed = false;
        if (levelIsWon()) {
          currentLevel++;
          if (!gameIsWon()) {
            initialiseLevel();
          }
        }
      }
    } else {
      currentTurnData.first = newPlay;
    }
  }

  /**
   *
   * @param {PieceData} p_Piece
   */
  const isPieceSelected = (p_Piece) =>
    p_Piece === currentTurnData.first.selectedPiece;

  /**
   * @param {PieceData} p_Piece
   * @param {number} p_Index
   * @returns {DOMPointReadOnly}
   */
  function getPieceCentre(p_Index) {
    const partCircle = fullCircle * (p_Index + 1 / circles.length);
    const circleX = centre.x + circleRadius * Math.sin(partCircle);
    const circleY = centre.y + circleRadius * Math.cos(partCircle);
    return new DOMPointReadOnly(circleX, circleY);
  }

  /**
   * @param {DOMPointReadOnly} p_Centre
   */
  function getPiecePath(p_Centre) {
    const path = new Path2D();
    path.arc(p_Centre.x, p_Centre.y, 50, 0, fullCircle);
    return path;
  }

  return {
    initialiseGame,
    initialiseLevel,
    getCirclesToDraw,
    gameIsWon,
    onGameClick,
    getCurrentTargetText,
    isPieceSelected,
    getPieceCentre,
    getPiecePath,
  };
}
