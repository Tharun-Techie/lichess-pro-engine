class LichessEngineHelper {
    constructor() {
        this.stockfish = null;
        this.isAnalyzing = false;
        this.currentMoves = [];
        this.analysisTimeout = null;
        this.bestMove = null;
        this.evaluation = null;
        this.currentDepth = 0;
        this.analysisLines = [];
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.initializeStockfish();
        this.setupEventListeners();
        this.loadGameData();
        this.updateUI();
    }

    initializeElements() {
        // Control elements
        this.depthSlider = document.getElementById('engine-depth');
        this.timeSlider = document.getElementById('engine-time');
        this.analysisMode = document.getElementById('analysis-mode');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.stopBtn = document.getElementById('stop-btn');
        
        // Display elements
        this.statusText = document.getElementById('status-text');
        this.gameInfo = document.getElementById('game-info');
        this.gameType = document.getElementById('game-type');
        this.moveCount = document.getElementById('move-count');
        this.currentTurn = document.getElementById('current-turn');
        this.depthValue = document.getElementById('depth-value');
        this.timeValue = document.getElementById('time-value');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.successMessage = document.getElementById('success-message');
        this.analysisPanel = document.getElementById('analysis-panel');
        this.bestMoveDisplay = document.getElementById('best-move');
        this.analysisDepthDisplay = document.getElementById('analysis-depth-display');
        this.analysisLines = document.getElementById('analysis-lines');
        this.progressFill = document.getElementById('progress-fill');
    }

    initializeStockfish() {
        try {
            // Try to load Stockfish WASM (preferred) or fallback to JS
            this.stockfish = new Worker(chrome.runtime.getURL('stockfish.js'));
            
            this.stockfish.onmessage = (e) => {
                this.handleStockfishMessage(e.data);
            };

            this.stockfish.onerror = (error) => {
                console.error('Stockfish error:', error);
                this.showError('Engine initialization failed');
            };

            // Initialize engine
            this.stockfish.postMessage('uci');
            this.stockfish.postMessage('setoption name Threads value 1');
            this.stockfish.postMessage('setoption name Hash value 128');
            this.stockfish.postMessage('ucinewgame');
            this.stockfish.postMessage('isready');
            
            this.updateStatus('Engine initialized');
        } catch (error) {
            console.error('Failed to initialize Stockfish:', error);
            this.showError('Failed to initialize chess engine');
        }
    }

    setupEventListeners() {
        // Slider updates
        this.depthSlider.addEventListener('input', (e) => {
            this.depthValue.textContent = e.target.value;
        });

        this.timeSlider.addEventListener('input', (e) => {
            this.timeValue.textContent = e.target.value;
        });

        // Button events
        this.analyzeBtn.addEventListener('click', () => {
            this.startAnalysis();
        });

        this.stopBtn.addEventListener('click', () => {
            this.stopAnalysis();
        });

        // Auto-refresh game data every 2 seconds
        setInterval(() => {
            this.loadGameData();
        }, 2000);
    }

    loadGameData() {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] && tabs[0].url.includes('lichess.org')) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'getGameData'}, (response) => {
                    if (response && response.success) {
                        this.updateGameData(response.data);
                    }
                });
            }
        });
    }

    updateGameData(gameData) {
        if (!gameData) return;

        this.currentMoves = gameData.moves || [];
        
        // Update game info display
        this.gameType.textContent = gameData.gameType || 'Unknown';
        this.moveCount.textContent = this.currentMoves.length;
        this.currentTurn.textContent = this.currentMoves.length % 2 === 0 ? 'White' : 'Black';
        
        // Show game info panel
        this.gameInfo.classList.remove('hidden');
        
        // Update status
        if (this.currentMoves.length > 0) {
            this.updateStatus(`Game loaded - ${this.currentMoves.length} moves`);
        } else {
            this.updateStatus('Waiting for game moves...');
        }
    }

    startAnalysis() {
        if (this.isAnalyzing) return;
        
        if (this.currentMoves.length === 0) {
            this.showError('No moves to analyze. Please start a game on Lichess.');
            return;
        }

        this.isAnalyzing = true;
        this.updateUI();
        this.showLoading();
        this.resetAnalysisData();
        
        const position = this.currentMoves.length > 0 ? 
            `startpos moves ${this.currentMoves.join(' ')}` : 
            'startpos';
        
        this.stockfish.postMessage('stop');
        this.stockfish.postMessage('ucinewgame');
        this.stockfish.postMessage(`position ${position}`);
        
        // Start analysis based on mode
        const mode = this.analysisMode.value;
        const depth = parseInt(this.depthSlider.value);
        const time = parseInt(this.timeSlider.value);
        
        switch (mode) {
            case 'depth':
                this.stockfish.postMessage(`go depth ${depth}`);
                break;
            case 'time':
                this.stockfish.postMessage(`go movetime ${time}`);
                break;
            case 'infinite':
                this.stockfish.postMessage('go infinite');
                // Set timeout to prevent infinite analysis
                this.analysisTimeout = setTimeout(() => {
                    this.stopAnalysis();
                }, 30000);
                break;
        }

        this.updateStatus('Analyzing position...');
    }

    stopAnalysis() {
        if (!this.isAnalyzing) return;
        
        this.isAnalyzing = false;
        this.stockfish.postMessage('stop');
        
        if (this.analysisTimeout) {
            clearTimeout(this.analysisTimeout);
            this.analysisTimeout = null;
        }
        
        this.hideLoading();
        this.updateUI();
        this.updateStatus('Analysis stopped');
    }

    handleStockfishMessage(message) {
        if (message.startsWith('info')) {
            this.parseAnalysisInfo(message);
        } else if (message.startsWith('bestmove')) {
            this.handleBestMove(message);
        } else if (message === 'readyok') {
            this.updateStatus('Engine ready');
        }
    }

    parseAnalysisInfo(info) {
        // Parse depth
        const depthMatch = info.match(/depth (\d+)/);
        if (depthMatch) {
            this.currentDepth = parseInt(depthMatch[1]);
            this.analysisDepthDisplay.textContent = `Depth ${this.currentDepth}`;
            
            // Update progress (assuming max depth of 25)
            const progress = Math.min((this.currentDepth / 25) * 100, 100);
            this.progressFill.style.width = `${progress}%`;
        }

        // Parse evaluation
        const scoreMatch = info.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
            const [, type, value] = scoreMatch;
            if (type === 'cp') {
                this.evaluation = parseInt(value) / 100;
            } else {
                this.evaluation = `Mate in ${Math.abs(parseInt(value))}`;
            }
        }

        // Parse principal variation
        const pvMatch = info.match(/pv (.+)/);
        if (pvMatch) {
            const moves = pvMatch[1].split(' ');
            this.bestMove = moves[0];
            this.updateBestMoveDisplay();
        }

        // Parse and display multiple lines
        if (info.includes('multipv')) {
            this.parseMultiPV(info);
        }
    }

    parseMultiPV(info) {
        const multipvMatch = info.match(/multipv (\d+)/);
        if (multipvMatch) {
            const lineNumber = parseInt(multipvMatch[1]);
            const pvMatch = info.match(/pv (.+)/);
            if (pvMatch) {
                const moves = pvMatch[1].split(' ').slice(0, 6); // Show first 6 moves
                const line = this.convertMovesToAlgebraic(moves);
                this.updateAnalysisLines(lineNumber, line);
            }
        }
    }

    convertMovesToAlgebraic(moves) {
        // This is a simplified conversion - in a real implementation,
        // you'd want to use a proper chess library
        return moves.map((move, index) => {
            const moveNumber = Math.floor(index / 2) + 1;
            const prefix = index % 2 === 0 ? `${moveNumber}.` : '';
            return `${prefix}${move}`;
        }).join(' ');
    }

    updateAnalysisLines(lineNumber, line) {
        const lineElement = document.createElement('div');
        lineElement.className = 'analysis-line';
        lineElement.textContent = `Line ${lineNumber}: ${line}`;
        
        // Update or add line
        const existingLines = this.analysisLines.querySelectorAll('.analysis-line');
        if (existingLines[lineNumber - 1]) {
            existingLines[lineNumber - 1].textContent = lineElement.textContent;
        } else {
            this.analysisLines.appendChild(lineElement);
        }
    }

    handleBestMove(message) {
        this.isAnalyzing = false;
        this.hideLoading();
        
        const moveMatch = message.match(/bestmove (\S+)/);
        if (moveMatch) {
            this.bestMove = moveMatch[1];
            this.updateBestMoveDisplay();
            this.showAnalysisPanel();
            this.showSuccess(`Analysis complete! Best move: ${this.bestMove}`);
        }
        
        this.updateUI();
        this.updateStatus('Analysis complete');
    }

    updateBestMoveDisplay() {
        if (this.bestMove) {
            const moveText = this.bestMoveDisplay.querySelector('.move-text');
            const moveEval = this.bestMoveDisplay.querySelector('.move-eval');
            
            moveText.textContent = this.bestMove.toUpperCase();
            
            if (this.evaluation !== null) {
                if (typeof this.evaluation === 'number') {
                    const evalText = this.evaluation > 0 ? `+${this.evaluation.toFixed(2)}` : this.evaluation.toFixed(2);
                    moveEval.textContent = `Evaluation: ${evalText}`;
                } else {
                    moveEval.textContent = `Evaluation: ${this.evaluation}`;
                }
            }
        }
    }

    showAnalysisPanel() {
        this.analysisPanel.classList.remove('hidden');
    }

    hideAnalysisPanel() {
        this.analysisPanel.classList.add('hidden');
    }

    showLoading() {
        this.loading.classList.remove('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
        setTimeout(() => {
            this.errorMessage.classList.add('hidden');
        }, 5000);
    }

    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        setTimeout(() => {
            this.successMessage.classList.add('hidden');
        }, 5000);
    }

    updateStatus(message) {
        this.statusText.textContent = message;
    }

    updateUI() {
        this.analyzeBtn.disabled = this.isAnalyzing;
        this.stopBtn.disabled = !this.isAnalyzing;
        
        if (this.isAnalyzing) {
            this.analyzeBtn.textContent = '🔄 Analyzing...';
        } else {
            this.analyzeBtn.textContent = '🔍 Analyze';
        }
    }

    resetAnalysisData() {
        this.bestMove = null;
        this.evaluation = null;
        this.currentDepth = 0;
        this.analysisLines.innerHTML = '';
        this.progressFill.style.width = '0%';
    }
}

// Initialize the extension when popup opens
document.addEventListener('DOMContentLoaded', () => {
    new LichessEngineHelper();
});