const fullCircle = 2 * Math.PI;
/**
 * @param {DOMPointReadOnly} centre
 */
export function initialiseGameState(centre) {
  /**
   * @typedef {{calcNumber: number}} TargetData
   * @typedef {{isDisplayed: boolean, data: TargetData, path:Path2D, popStartTime: Date, popEndTime: Date}} PieceData
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
    popStartTime: null,
    popEndTime: null,
  });

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
    p_Turn.first.selectedPiece.data.calcNumber +
      p_Turn.second.selectedPiece.data.calcNumber;

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
    circles
      .filter((c) => c.isDisplayed)
      .find((c) => theContext.isPointInPath(c.path, x, y));

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
   * @typedef {{hasPlayed: boolean, selectedPiece: PieceData}} Play
   * @typedef {{first: Play, second: Play}} Turn
   * @type {Turn}
   */
  const currentTurnData = {
    first: initialPlay(),
    second: initialPlay(),
  };

  /**
   *
   * @param {PieceData} p_Piece
   */
  const isPieceSelected = (p_Piece) =>
    p_Piece === currentTurnData.first.selectedPiece;

  function initialiseGame() {
    dataNumbers = [25 /*, 37 , 25, 256, 42, 56, 97, 60*/];
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
   *
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function startPopping(p_Piece, p_Now) {
    p_Piece.popStartTime = p_Now;
    const endTime = new Date(p_Now);
    endTime.setSeconds(endTime.getSeconds() + SECONDS_PER_POP);
    p_Piece.popEndTime = endTime;
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
        const now = new Date();
        //  Right. Get rid of the circles.
        startPopping(currentTurnData.first.selectedPiece, now);
        startPopping(currentTurnData.second.selectedPiece, now);
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

  const SECONDS_PER_POP = 1;
  /**
   *
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function getPieceSize(p_Piece, p_Now) {
    const baseRadius = 50;
    if (p_Piece.popStartTime === null) {
      return baseRadius;
    } else {
      //  y=sin(x+pi)+1
      //  from 0 to 1.5PI(starts at 1, goes to 0, then goes to 2)
      return (
        baseRadius *
        (1 +
          Math.sin(
            //  Proportion gone
            ((p_Now - p_Piece.popStartTime) /
              (p_Piece.popEndTime - p_Piece.popStartTime)) *
              //  Range 0 - 1.5PI
              (1.5 * Math.PI) +
              //  Plus PI
              Math.PI
          ))
      );
    }
  }

  /**
   * @param {PieceData} p_Piece
   * @param {DOMPointReadOnly} p_Centre
   * @param {Date} p_Now
   */
  function updatePiecePath(p_Piece, p_Centre, p_Now) {
    const radius = getPieceSize(p_Piece, p_Now);
    const path = new Path2D();
    //  Save the path for collision detection
    path.arc(p_Centre.x, p_Centre.y, radius, 0, fullCircle);
    p_Piece.path = path;
    return p_Piece.path;
  }

  /**
   *
   * @param {Date} p_Now
   */
  function onGameTick(p_Now) {
    circles.forEach((c) => {
      if (c.popStartTime !== null) {
        c.isDisplayed = p_Now < c.popEndTime;
      }
    });
    if (!gameIsWon() && levelIsWon()) {
      currentLevel++;
      if (!gameIsWon()) {
        initialiseNewLevel();
      }
    }
  }

  /**
   *
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function getIdlePieceColour(p_Piece, p_Now) {
    if (p_Piece.popStartTime !== null) {
      const donePercentage =
        (p_Piece.popEndTime - p_Now) / (SECONDS_PER_POP * 1000);
      return `rgba(255, 0, 0, ${donePercentage})`;
    } else {
      return "red";
    }
  }

  /**
   *
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function getPieceFillStyle(p_Piece, p_Now) {
    return isPieceSelected(p_Piece)
      ? "green"
      : getIdlePieceColour(p_Piece, p_Now);
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
    onGameTick,
    getPieceFillStyle,
  };
}
