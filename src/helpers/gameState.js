const fullCircle = 2 * Math.PI;
/**
 * @param {DOMPointReadOnly} centre
 */
export function initialiseGameState(centre) {
  /**
   * @typedef {{calcNumber: number}} TargetData
   * @typedef {{isDisplayed: boolean, data: TargetData, path:Path2D}} PieceData
   * @type {[PieceData]} */
  let circles;
  /** @type {[number]} */
  let dataNumbers;
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
    path: null,
  });

  /**
   * @typedef {{hasPlayed: boolean, selectedPiece: PieceData}} Play
   * @typedef {{first: Play, second: Play}} Turn
   * @type {Turn}
   */
  const currentTurnData = {
    first: initialPlay(),
    second: initialPlay(),
  };

  /**
   * @returns {[PieceData]}
   */
  const getCirclesToDraw = () => circles; //.filter((c) => c.isDisplayed);

  /**
   * @param {Turn} p_Turn
   * @returns {boolean}
   */
  const turnIsWon = (p_Turn) =>
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
   * @returns {Play}
   */
  const initialPlay = () => ({ hasPlayed: false, selectedPiece: null });

  /**
   * @param {PieceData} p_Circle
   * @returns {Play}
   */
  const doPlay = (p_Circle) => ({ hasPlayed: true, selectedPiece: p_Circle });

  /**
   *
   * @param {PieceData} p_Piece
   */
  const isPieceSelected = (p_Piece) =>
    p_Piece === currentTurnData.first.selectedPiece;

  function initialiseGame() {
    dataNumbers = [25, 37 /*, 25, 256, 42, 56, 97, 60*/];
    currentLevel = 0;
    initialiseNewLevel();
  }

  function initialiseNewLevel() {
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
   * @param {CanvasRenderingContext2D} theContext
   * @param {number} x
   * @param {number} y
   */
  function onGameClick(theContext, x, y) {
    const clickedCircle = getHitCircle(theContext, x, y);
    if (clickedCircle) {
      console.log("hit");
      onCircleClicked(clickedCircle);
    } else {
      console.log("miss");
    }
  }

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
      if (turnIsWon(currentTurnData)) {
        //  Right. Get rid of the circles.
        currentTurnData.first.selectedPiece.isDisplayed = false;
        currentTurnData.second.selectedPiece.isDisplayed = false;
        if (levelIsWon()) {
          currentLevel++;
          if (!gameIsWon()) {
            initialiseNewLevel();
          }
        }
      }
      //  Reset the turn
      currentTurnData.first = initialPlay();
      currentTurnData.second = initialPlay();
    } else {
      currentTurnData.first = newPlay;
    }
  }

  const SECONDS_PER_SPIN = 10;
  /**
   * @param {number} p_Index
   * @param {Date} p_Now
   * @returns {DOMPointReadOnly}
   */
  function getPieceCentre(p_Index, p_Now) {
    const partCircle =
      fullCircle *
      //  Simple "How far along is based on it's index"
      ((p_Index + 1) / circles.length +
        //  Extra bit based on the current time (spinning at the rate of SECONDS_PER_SPIN)
        p_Now / (SECONDS_PER_SPIN * 1_000));
    const circleX = centre.x + circleRadius * Math.sin(partCircle);
    const circleY = centre.y + circleRadius * Math.cos(partCircle);
    return new DOMPointReadOnly(circleX, circleY);
  }

  /**
   * @param {PieceData} p_Piece
   * @param {DOMPointReadOnly} p_Centre
   */
  function updatePiecePath(p_Piece, p_Centre) {
    const path = new Path2D();
    //  Save the path for collision detection
    path.arc(p_Centre.x, p_Centre.y, 50, 0, fullCircle);
    p_Piece.path = path;
    return p_Piece.path;
  }

  return {
    initialiseGame,
    initialiseNewLevel,
    getCirclesToDraw,
    gameIsWon,
    onGameClick,
    getCurrentTargetText,
    isPieceSelected,
    getPieceCentre,
    updatePiecePath,
  };
}
