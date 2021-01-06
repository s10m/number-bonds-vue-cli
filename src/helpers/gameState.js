const fullCircle = 2 * Math.PI;
/**
 * @param {DOMPointReadOnly} centre
 * @param {{pop: HTMLAudioElement, clap: HTMLAudioElement, error: HTMLAudioElement, boo: HTMLAudioElement}} sounds
 */
export function initialiseGameState(centre, sounds) {
  //  TODO: Split into drawing and game engine functions
  //  TODO: Booing
  //  TODO: "+5", "-2" text
  //  TODO: Allow win if circles are moving in (delay setting end game until things have finished)
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
  function gameIsWon() {
    return gameHasEnded && gameWasWon;
  }

  /**
   * @returns {boolean}
   */
  function gameIsLost() {
    return gameHasEnded && !gameWasWon;
  }

  /**
   * @returns {boolean}
   */
  function hasFinishedLastLevel() {
    return currentLevel === dataNumbers.length;
  }

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

  const MAX_TARGET_EASY = 9;
  const MAX_TARGET_MEDIUM = 20;
  const MAX_TARGET_HARD = 1000;
  /**
   * @returns {number}
   */
  function difficultyMax() {
    return forDifficulty(MAX_TARGET_EASY, MAX_TARGET_MEDIUM, MAX_TARGET_HARD);
  }

  function forDifficulty(easy, medium, hard) {
    switch (currentDifficulty) {
      case "easy":
        return easy;
      case "medium":
        return medium;
      default:
        return hard;
    }
  }

  const LEVELS_PER_GAME = 5;
  /** @type {string} */
  let currentDifficulty;
  /**
   * @param {string} difficulty
   */
  function initialiseGame(difficulty) {
    currentDifficulty = difficulty.toLowerCase();
    dataNumbers = [];
    const maxForDifficulty = difficultyMax(difficulty);
    for (let level = 0; level < LEVELS_PER_GAME; level++) {
      const levelTarget = Math.round(Math.random() * maxForDifficulty);
      dataNumbers.push(levelTarget);
    }
    currentLevel = 0;
    gameHasEnded = false;
    initialiseNewLevel(true);
  }

  const NUMBER_OF_PAIRS = 4;
  /**
   * @param {boolean} p_IsFirstLevel
   */
  function initialiseNewLevel(p_IsFirstLevel) {
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
    gameEndTime = addSeconds(
      p_IsFirstLevel ? new Date() : gameEndTime,
      difficultySecondsPerLevel()
    );
  }

  const SECONDS_PER_LEVEL_EASY = 20;
  const SECONDS_PER_LEVEL_MEDIUM = 15;
  const SECONDS_PER_LEVEL_HARD = 10;
  /**
   * @returns {number}
   */
  function difficultySecondsPerLevel() {
    return forDifficulty(
      SECONDS_PER_LEVEL_EASY,
      SECONDS_PER_LEVEL_MEDIUM,
      SECONDS_PER_LEVEL_HARD
    );
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

  const SECONDS_PER_SUCCESS_EASY = 5;
  const SECONDS_PER_SUCCESS_MEDIUM = 3;
  const SECONDS_PER_SUCCESS_HARD = 2;
  /**
   * @returns {number}
   */
  function difficultySecondsPerSuccess() {
    return forDifficulty(
      SECONDS_PER_SUCCESS_EASY,
      SECONDS_PER_SUCCESS_MEDIUM,
      SECONDS_PER_SUCCESS_HARD
    );
  }

  const SECONDS_PER_ERROR_EASY = 2;
  const SECONDS_PER_ERROR_MEDIUM = 2;
  const SECONDS_PER_ERROR_HARD = 2;
  /**
   * @returns {number}
   */
  function difficultySecondsPerError() {
    return forDifficulty(
      SECONDS_PER_ERROR_EASY,
      SECONDS_PER_ERROR_MEDIUM,
      SECONDS_PER_ERROR_HARD
    );
  }

  /**
   * @param {[PieceData]} p_Selection
   * @param {Date} p_Now
   */
  function onTurnFinished(p_Selection, p_Now) {
    const selectedTotal = p_Selection.reduce(
      (v, c) => v + c.data.calcNumber,
      0
    );
    if (selectedTotal === dataNumbers[currentLevel]) {
      p_Selection.forEach((p) => startPopping(p, p_Now));
      new Promise((resolve) =>
        setTimeout(resolve, (SECONDS_PER_POP * 1000) / 3)
      ).then(() => sounds.pop.play());
      gameEndTime = addSeconds(gameEndTime, difficultySecondsPerSuccess());
    } else {
      p_Selection.forEach((p) => startMovingOut(p, p_Now));
      sounds.error.play();
      //  Time off.
      gameEndTime = addSeconds(gameEndTime, -difficultySecondsPerError());
    }
    p_Selection.length = 0;
  }

  /**
   * @param {[PieceData]} p_Selection
   * @param {Date} p_Now
   */
  function checkForTurnWon(p_Selection, p_Now) {
    //  If the play is active
    if (p_Selection.length === SELECTIONS_PER_TURN) {
      //  If they have all finished moving in (turn is over)
      if (p_Selection.every((p) => p.moveInEndTime < p_Now)) {
        onTurnFinished(p_Selection, p_Now);
      }
    }
  }

  /**
   * @param {Date} p_Now
   */
  function checkAllForTurnWon(p_Now) {
    selections.forEach((s) => checkForTurnWon(s, p_Now));
  }

  function endGame(p_HasWon) {
    if (p_HasWon) {
      sounds.clap.play();
    } else {
      sounds.boo.play();
    }
    gameHasEnded = true;
    gameWasWon = p_HasWon;
  }

  /** @type {boolean} */
  let gameHasEnded;
  /** @type {boolean} */
  let gameWasWon;
  /**
   * @param {Date} p_Now
   */
  function onGameTick(p_Now) {
    if (!gameHasEnded) {
      checkAllForTurnWon(p_Now);
      if (levelIsWon()) {
        currentLevel++;
        if (hasFinishedLastLevel()) {
          sounds.clap.play();
          endGame(true);
        } else {
          initialiseNewLevel(false);
        }
      } else if (gameIsOver(p_Now)) {
        endGame(false);
      }
      circles.forEach((c) => {
        if (c.popStartTime !== null) {
          c.isDisplayed = p_Now < c.popEndTime;
        }
      });
    }
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

  /**@type {Date} gameEndTime */
  let gameEndTime;
  /**
   * @param {Date} p_Now
   */
  function getCountdownSeconds(p_Now) {
    return Math.round((gameEndTime - p_Now) / 1000);
  }

  /**
   * @param {Date} p_Now
   */
  function gameIsOver(p_Now) {
    return p_Now > gameEndTime;
  }

  return {
    initialiseGame,
    initialiseNewLevel,
    getCirclesToDraw,
    gameIsWon,
    gameIsLost,
    onGameClick,
    getCurrentTargetText,
    isPieceSelected,
    getPieceCentre,
    updatePiecePath,
    onGameTick,
    getPieceAlpha,
    getCountdownSeconds,
  };
}
