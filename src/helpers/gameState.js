const fullCircle = 2 * Math.PI;
/**
 * @param {DOMPointReadOnly} centre
 * @param {{pop: HTMLAudioElement, clap: HTMLAudioElement, error: HTMLAudioElement}} sounds
 */
export function initialiseGameState(centre, sounds) {
  /**
   * @typedef {{calcNumber: number}} TargetData
   * @typedef {{
   * isDisplayed: boolean,
   * data: TargetData,
   * path:Path2D,
   * popStartTime: Date,
   * popEndTime: Date,
   * playMoveStartTime: Date,
   * playMoveEndTime: Date,
   * isMovingIn: boolean,
   * moveInStartTime: Date,
   * moveInEndTime: Date,
   * isMovingOut: boolean,
   * moveOutStartTime: Date,
   * moveOutEndTime: Date
   * }} PieceData
   * @type {[PieceData]} */
  let circles;
  /** @type {[number]} */
  let dataNumbers;
  let currentLevel = 0;
  const circleRadius = 150;
  const innerCircleRadius = circleRadius / 2;

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
    hasBeenPlayed: false,
  });

  /**
   * @returns {[PieceData]}
   */
  const getCirclesToDraw = () => circles;

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
   * @param {PieceData} p_Piece
   */
  const isPieceSelected = (p_Piece) => p_Piece.isMovingIn;

  function initialiseGame() {
    dataNumbers = [25, 37 /* , 25, 256, 42, 56, 97, 60*/];
    currentLevel = 0;
    initialiseNewLevel();
  }

  const NUMBER_OF_PAIRS = 4;
  function initialiseNewLevel() {
    const targetNumber = dataNumbers[currentLevel];
    let currentPair = 0;
    circles = [];
    while (currentPair < NUMBER_OF_PAIRS) {
      const firstNumber = Math.round(Math.random() * targetNumber);
      circles.push(initACircle(firstNumber));
      circles.push(initACircle(targetNumber - firstNumber));
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
   * @param {Date} p_Now
   * @param {number} p_SecondsToAdd
   * @returns {Date}
   */
  function addSeconds(p_Now, p_SecondsToAdd) {
    const newDate = new Date(p_Now);
    newDate.setSeconds(newDate.getSeconds() + p_SecondsToAdd);
    return newDate;
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
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function startPopping(p_Piece, p_Now) {
    p_Piece.popStartTime = p_Now;
    p_Piece.popEndTime = addSeconds(p_Now, SECONDS_PER_POP);
  }

  /**
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function startMovingIn(p_Piece, p_Now) {
    p_Piece.isMovingIn = true;
    p_Piece.moveInStartTime = p_Now;
    p_Piece.moveInEndTime = addSeconds(p_Now, SECONDS_PER_SELECT);
  }

  /**
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function startMovingOut(p_Piece, p_Now) {
    p_Piece.isMovingIn = !(p_Piece.isMovingOut = true);
    p_Piece.moveOutStartTime = p_Now;
    p_Piece.moveOutEndTime = addSeconds(p_Now, SECONDS_PER_SELECT);
  }

  /**
   * @param {PieceData} p_Piece
   */
  function canPlay(p_Piece) {
    //  Cannot be in any selection
    return !selections.some((s) => s.some((p) => p === p_Piece));
  }

  let currentTurnIndex = 0;
  /**
   * @param {PieceData} p_Piece
   */
  function doPlay(p_Piece) {
    selections[currentTurnIndex].push(p_Piece);
    startMovingIn(p_Piece, new Date());
  }

  const SELECTIONS_PER_TURN = 2;
  function prepareForNextPlay() {
    if (selections[currentTurnIndex].length == SELECTIONS_PER_TURN) {
      currentTurnIndex = (currentTurnIndex + 1) % NUMBER_OF_PAIRS;
    }
  }

  /**@type {[[PieceData]]} */
  const selections = [[], [], [], []];
  /**
   * @param {PieceData} hitCircle
   */
  function onCircleClicked(hitCircle) {
    if (canPlay(hitCircle)) {
      doPlay(hitCircle);
      prepareForNextPlay();
    }
  }

  const SECONDS_PER_SELECT = 1;
  /**
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function getPieceRadiusProgressFactor(p_Piece, p_Now) {
    if (p_Piece.isMovingIn) {
      return p_Piece.moveInEndTime < p_Now
        ? 0
        : (p_Piece.moveInEndTime - p_Now) / (SECONDS_PER_SELECT * 1000);
    } else if (p_Piece.isMovingOut) {
      return p_Now > p_Piece.moveOutEndTime
        ? 1
        : (p_Now - p_Piece.moveOutStartTime) / (SECONDS_PER_SELECT * 1000);
    } else {
      return 1;
    }
  }

  const SECONDS_PER_SPIN = 10;
  /**
   * @param {number} p_Index
   * @param {Date} p_Now
   * @returns {DOMPointReadOnly}
   */
  function getPieceCentre(p_Index, p_Now) {
    const thePiece = circles[p_Index];
    const progressFactor = getPieceRadiusProgressFactor(thePiece, p_Now);
    const positionRadius =
      innerCircleRadius + (circleRadius - innerCircleRadius) * progressFactor;
    const partCircle =
      fullCircle *
      //  Simple "How far along is based on it's index"
      ((p_Index + 1) / circles.length +
        //  Extra bit based on the current time (spinning at the rate of SECONDS_PER_SPIN)
        p_Now / (SECONDS_PER_SPIN * 1_000));
    const circleX = centre.x + positionRadius * Math.sin(partCircle);
    const circleY = centre.y + positionRadius * Math.cos(partCircle);
    return new DOMPointReadOnly(circleX, circleY);
  }

  const SECONDS_PER_POP = 1;
  /**
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
            ((p_Now - p_Piece.popStartTime) / (SECONDS_PER_POP * 1000)) *
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
    return (p_Piece.path = path);
  }

  /**
   * @param {Date} p_Now
   */
  function checkForTurnWon(p_Now) {
    for (let pairNumber = 0; pairNumber < selections.length; pairNumber++) {
      const aSelection = selections[pairNumber];
      //  If the play is active
      if (aSelection.length === SELECTIONS_PER_TURN) {
        //  If they have all finished moving in (turn is over)
        if (aSelection.every((p) => p.moveInEndTime < p_Now)) {
          const selectedTotal = aSelection.reduce(
            (v, c) => v + c.data.calcNumber,
            0
          );
          if (selectedTotal === dataNumbers[currentLevel]) {
            aSelection.forEach((p) => startPopping(p, p_Now));
            new Promise((resolve) =>
              setTimeout(resolve, (SECONDS_PER_POP * 1000) / 3)
            ).then(() => sounds.pop.play());
          } else {
            aSelection.forEach((p) => startMovingOut(p, p_Now));
            sounds.error.play();
          }
          aSelection.length = 0;
        }
      }
    }
  }

  /**
   * @param {Date} p_Now
   */
  function onGameTick(p_Now) {
    checkForTurnWon(p_Now);

    if (!gameIsWon() && levelIsWon()) {
      currentLevel++;
      if (gameIsWon()) {
        sounds.clap.play();
      } else {
        initialiseNewLevel();
      }
    }
    circles.forEach((c) => {
      if (c.popStartTime !== null) {
        c.isDisplayed = p_Now < c.popEndTime;
      }
    });
  }

  /**
   * @param {PieceData} p_Piece
   * @param {Date} p_Now
   */
  function getPieceAlpha(p_Piece, p_Now) {
    if (p_Piece.popStartTime !== null) {
      //  Popping.
      return (p_Now - p_Piece.popStartTime) / (SECONDS_PER_POP * 1000);
    } else {
      //  Not popping.
      return 1;
    }
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
    getPieceAlpha,
  };
}
