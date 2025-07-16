class LichessGameExtractor {
  constructor() {
    this.currentMoves = [];
    this.gameType = "";
    this.gameStatus = "";
    this.playerColors = {};
    this.timeControl = "";
    this.lastMoveTime = 0;

    this.init();
  }

  init() {
    this.setupMessageListener();
    this.startGameMonitoring();
    this.injectAnalysisOverlay();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "getGameData") {
        // Add debug info
        if (!this.currentMoves || this.currentMoves.length === 0) {
          console.warn("Lichess Pro Engine: No moves found for analysis.");
        }
        sendResponse({
          success: !!(this.currentMoves && this.currentMoves.length > 0),
          data: {
            moves: this.currentMoves,
            gameType: this.gameType,
            gameStatus: this.gameStatus,
            playerColors: this.playerColors,
            timeControl: this.timeControl,
            isGameActive: this.isGameActive(),
          },
          error: (!this.currentMoves || this.currentMoves.length === 0) ? "No moves found" : undefined
        });
      }
      return true;
    });
  }

  startGameMonitoring() {
    // Monitor for game changes
    const observer = new MutationObserver(() => {
      this.extractGameData();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    // Initial extraction
    this.extractGameData();

    // Periodic updates
    setInterval(() => {
      this.extractGameData();
    }, 1000);
  }

  extractGameData() {
    try {
      this.extractMoves();
      this.extractGameInfo();
      this.extractPlayerInfo();
      this.extractTimeControl();
      this.detectGameStatus();
    } catch (error) {
      console.error("Error extracting game data:", error);
    }
  }

  extractMoves() {
    // Try to extract moves from PGN textarea (Lichess analysis, studies, etc.)
    let moves = [];
    const pgnTextarea = document.querySelector('textarea.pgn');
    if (pgnTextarea && pgnTextarea.value) {
      moves = this.extractMovesFromPGN(pgnTextarea.value);
      if (moves.length > 0) {
        this.currentMoves = moves;
        this.lastMoveTime = Date.now();
        return;
      }
    }
    // Try to extract moves from move list (live games)
    const moveElements = document.querySelectorAll('.move .move__ply, .vertical-move-list__move');
    moves = [];
    moveElements.forEach((el) => {
      const moveText = el.textContent.trim();
      if (moveText && this.isValidMove(moveText)) {
        moves.push(moveText);
      }
    });
    if (moves.length > 0) {
      this.currentMoves = moves;
      this.lastMoveTime = Date.now();
      return;
    }
    // Try to extract from lichess game data if available
    const gameData = this.extractFromGameData();
    if (gameData && Array.isArray(gameData.moves) && gameData.moves.length > 0) {
      this.currentMoves = gameData.moves;
      this.lastMoveTime = Date.now();
      return;
    }
    // If nothing found, clear moves
    this.currentMoves = [];
  }

  extractMovesFromPGN(pgn) {
    const moves = [];
    // Remove move numbers and extract moves
    const cleanPgn = pgn.replace(/\d+\./g, "").replace(/\s+/g, " ").trim();
    const movePattern =
      /([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=?[NBRQ])?[+#]?|O-O-O|O-O)/g;
    let match;

    while ((match = movePattern.exec(cleanPgn)) !== null) {
      moves.push(match[1]);
    }

    return moves;
  }

  extractFromGameData() {
    // Try to extract from window.lichess object
    if (window.lichess && window.lichess.data) {
      const gameData = window.lichess.data;
      return {
        moves: gameData.moves || [],
        gameType: gameData.game ? gameData.game.variant.name : "",
        status: gameData.game ? gameData.game.status : "",
      };
    }

    // Try to extract from data attributes
    const gameElement = document.querySelector("[data-game-id]");
    if (gameElement) {
      const gameId = gameElement.getAttribute("data-game-id");
      // Could fetch game data via API if needed
    }

    return null;
  }

  extractGameInfo() {
    // Extract game variant
    const variantElement = document.querySelector(".game__meta .variant");
    if (variantElement) {
      this.gameType = variantElement.textContent.trim();
    } else {
      // Default to standard chess
      this.gameType = "Standard";
    }

    // Check if it's a puzzle, analysis, or game
    if (window.location.pathname.includes("/puzzle")) {
      this.gameType = "Puzzle";
    } else if (window.location.pathname.includes("/analysis")) {
      this.gameType = "Analysis";
    } else if (window.location.pathname.includes("/study")) {
      this.gameType = "Study";
    }
  }

  extractPlayerInfo() {
    const players = document.querySelectorAll(".player .username");
    if (players.length >= 2) {
      this.playerColors = {
        white: players[0].textContent.trim(),
        black: players[1].textContent.trim(),
      };
    }
  }

  extractTimeControl() {
    const timeElement = document.querySelector(".game__meta .time");
    if (timeElement) {
      this.timeControl = timeElement.textContent.trim();
    }
  }

  detectGameStatus() {
    // Check for game end conditions
    const statusSelectors = [
      ".game__meta .status",
      ".game-over",
      ".result",
      ".game__end",
    ];

    for (const selector of statusSelectors) {
      const statusElement = document.querySelector(selector);
      if (statusElement) {
        this.gameStatus = statusElement.textContent.trim();
        break;
      }
    }

    // Check if game is still active
    if (!this.gameStatus && document.querySelector(".playing")) {
      this.gameStatus = "Playing";
    }
  }

  isValidMove(move) {
    // Basic move validation
    if (!move || move.length < 2) return false;

    // Check for common chess move patterns
    const movePatterns = [
      /^[a-h][1-8]$/, // Simple coordinate
      /^[a-h][1-8][a-h][1-8]$/, // UCI format
      /^[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=?[NBRQ])?[+#]?$/, // SAN format
      /^O-O(?:-O)?$/, // Castling
    ];

    return movePatterns.some((pattern) => pattern.test(move));
  }

  isGameActive() {
    return (
      this.gameStatus === "Playing" ||
      this.gameStatus === "" ||
      Date.now() - this.lastMoveTime < 60000
    ); // Active within last minute
  }

  injectAnalysisOverlay() {
    // Create a floating analysis button
    const overlay = document.createElement("div");
    overlay.id = "lichess-engine-overlay";
    overlay.innerHTML = `
            <div class="engine-overlay">
                <button id="quick-analyze-btn" class="quick-analyze-btn">
                    <span class="icon">🔍</span>
                    <span class="text">Quick Analysis</span>
                </button>
                <div id="quick-result" class="quick-result hidden">
                    <div class="best-move-display">
                        <span class="label">Best:</span>
                        <span class="move" id="overlay-best-move">-</span>
                    </div>
                    <div class="evaluation-display">
                        <span class="eval" id="overlay-evaluation">+0.00</span>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(overlay);
    this.setupOverlayEvents();
  }

  setupOverlayEvents() {
    const quickAnalyzeBtn = document.getElementById("quick-analyze-btn");
    const quickResult = document.getElementById("quick-result");

    if (quickAnalyzeBtn) {
      quickAnalyzeBtn.addEventListener("click", () => {
        this.triggerQuickAnalysis();
      });
    }
  }

  triggerQuickAnalysis() {
    // Send message to background script to trigger analysis
    chrome.runtime.sendMessage({
      action: "quickAnalysis",
      moves: this.currentMoves,
    });
  }

  updateOverlayResult(bestMove, evaluation) {
    const quickResult = document.getElementById("quick-result");
    const bestMoveElement = document.getElementById("overlay-best-move");
    const evaluationElement = document.getElementById("overlay-evaluation");

    if (bestMoveElement) bestMoveElement.textContent = bestMove;
    if (evaluationElement) evaluationElement.textContent = evaluation;
    if (quickResult) quickResult.classList.remove("hidden");
  }
}

// Initialize the content script
const lichessExtractor = new LichessGameExtractor();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateOverlay") {
    lichessExtractor.updateOverlayResult(request.bestMove, request.evaluation);
  }
});
