class LichessEngineBackground {
    constructor() {
        this.stockfish = null;
        this.isAnalyzing = false;
        this.analysisQueue = [];
        this.currentAnalysis = null;
        
        this.init();
    }

    init() {
        this.setupMessageListeners();
        this.initializeStockfish();
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.action) {
                case 'quickAnalysis':
                    this.handleQuickAnalysis(request.moves, sender.tab.id);
                    break;
                case 'stopAnalysis':
                    this.stopAnalysis();
                    break;
                case 'getEngineStatus':
                    sendResponse({ isAnalyzing: this.isAnalyzing });
                    break;
            }
            return true;
        });

        // Handle extension installation
        chrome.runtime.onInstalled.addListener(() => {
            console.log('Lichess Engine Helper installed');
        });
    }

    initializeStockfish() {
        try {
            // Initialize Stockfish in background
            this.stockfish = new Worker(chrome.runtime.getURL('stockfish.js'));
            
            this.stockfish.onmessage = (e) => {
                this.handleStockfishMessage(e.data);
            };

            this.stockfish.onerror = (error) => {
                console.error('Background Stockfish error:', error);
            };

            // Configure engine
            this.stockfish.postMessage('uci');
            this.stockfish.postMessage('setoption name Threads value 1');
            this.stockfish.postMessage('setoption name Hash value 64');
            this.stockfish.postMessage('setoption name MultiPV value 3');
            this.stockfish.postMessage('ucinewgame');
            this.stockfish.postMessage('isready');
            
            console.log('Background Stockfish initialized');
        } catch (error) {
            console.error('Failed to initialize background Stockfish:', error);
        }
    }

    handleQuickAnalysis(moves, tabId) {
        if (this.isAnalyzing) {
            // Queue the analysis
            this.analysisQueue.push({ moves, tabId });
            return;
        }

        this.startQuickAnalysis(moves, tabId);
    }

    startQuickAnalysis(moves, tabId) {
        if (!moves || moves.length === 0) {
            return;
        }

        this.isAnalyzing = true;
        this.currentAnalysis = {
            moves,
            tabId,
            startTime: Date.now(),
            bestMove: null,
            evaluation: null
        };

        const position = moves.length > 0 ? 
            `startpos moves ${moves.join(' ')}` : 
            'startpos';

        this.stockfish.postMessage('stop');
        this.stockfish.postMessage('ucinewgame');
        this.stockfish.postMessage(`position ${position}`);
        this.stockfish.postMessage('go depth 15 movetime 2000');

        // Set timeout for quick analysis
        setTimeout(() => {
            if (this.isAnalyzing) {
                this.stopAnalysis();
            }
        }, 3000);
    }

    handleStockfishMessage(message) {
        if (!this.currentAnalysis) return;

        if (message.startsWith('info')) {
            this.parseAnalysisInfo(message);
        } else if (message.startsWith('bestmove')) {
            this.handleBestMove(message);
        }
    }

    parseAnalysisInfo(info) {
        // Parse evaluation
        const scoreMatch = info.match(/score (cp|mate) (-?\d+)/);
        if (scoreMatch) {
            const [, type, value] = scoreMatch;
            if (type === 'cp') {
                this.currentAnalysis.evaluation = (parseInt(value) / 100).toFixed(2);
            } else {
                this.currentAnalysis.evaluation = `M${Math.abs(parseInt(value))}`;
            }
        }

        // Parse best move from PV
        const pvMatch = info.match(/pv (\S+)/);
        if (pvMatch) {
            this.currentAnalysis.bestMove = pvMatch[1];
        }
    }

    handleBestMove(message) {
        const moveMatch = message.match(/bestmove (\S+)/);
        if (moveMatch) {
            this.currentAnalysis.bestMove = moveMatch[1];
        }

        this.completeAnalysis();
    }

    completeAnalysis() {
        if (!this.currentAnalysis) return;

        const { tabId, bestMove, evaluation } = this.currentAnalysis;
        
        // Send result to content script
        chrome.tabs.sendMessage(tabId, {
            action: 'updateOverlay',
            bestMove: bestMove || 'N/A',
            evaluation: evaluation ? (evaluation > 0 ? `+${evaluation}` : evaluation) : '0.00'
        });

        // Update badge
        this.updateBadge(bestMove);

        this.isAnalyzing = false;
        this.currentAnalysis = null;

        // Process next analysis in queue
        if (this.analysisQueue.length > 0) {
            const nextAnalysis = this.analysisQueue.shift();
            this.startQuickAnalysis(nextAnalysis.moves, nextAnalysis.tabId);
        }
    }

    stopAnalysis() {
        if (this.stockfish) {
            this.stockfish.postMessage('stop');
        }
        
        this.isAnalyzing = false;
        this.currentAnalysis = null;
        this.analysisQueue = [];
    }

    updateBadge(bestMove) {
        if (bestMove) {
            chrome.action.setBadgeText({
                text: bestMove.substring(0, 2).toUpperCase()
            });
            chrome.action.setBadgeBackgroundColor({
                color: '#28a745'
            });
            
            // Clear badge after 5 seconds
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '' });
            }, 5000);
        }
    }
}

// Initialize background service
const lichessEngineBackground = new LichessEngineBackground();

// Handle tab updates to clear analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('lichess.org')) {
        // Clear any ongoing analysis when navigating to new page
        lichessEngineBackground.stopAnalysis();
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    if (tab.url && tab.url.includes('lichess.org')) {
        // Trigger quick analysis on icon click
        chrome.tabs.sendMessage(tab.id, { action: 'getGameData' }, (response) => {
            if (response && response.success && response.data.moves) {
                lichessEngineBackground.handleQuickAnalysis(response.data.moves, tab.id);
            }
        });
    }
});

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
    lichessEngineBackground.stopAnalysis();
});