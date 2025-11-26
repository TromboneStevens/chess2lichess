/**
 * main.js
 * The entry point for the Content Script.
 * Orchestrates the Parser and the UI Manager.
 */

(function() {
    // Prevent double-injection
    if (window.chess2lichessInitialized) return;
    window.chess2lichessInitialized = true;

    /**
     * Simple debounce utility to prevent performance issues.
     * Prevents the MutationObserver from firing thousands of times per second.
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * The core action: Scrape PGN and send to background.
     * @param {boolean} isInteractive - show alerts on failure?
     */
    async function handleExport(isInteractive = true) {
        // Try scraping a few times in case DOM is sluggish
        for (let i = 0; i < 5; i++) {
            const pgn = ChessParser.scrape();
            
            if (pgn && pgn.length > 15) {
                try {
                    const response = await browser.runtime.sendMessage({ type: "PGN_FOUND", pgn: pgn });
                    
                    if (response && !response.success && isInteractive) {
                        alert("Lichess Import Error:\n" + (response.error || "Unknown Error"));
                    }
                } catch (e) {
                    console.error("Messaging error:", e);
                }
                return;
            }
            
            // Wait 200ms before retrying
            await new Promise(r => setTimeout(r, 200));
        }

        if (isInteractive) {
            alert("Could not find moves. Make sure the game is visible.");
        }
    }

    /**
     * Checks if the current URL is allowed for button injection.
     * @returns {boolean}
     */
    function isAllowedUrl() {
        const path = window.location.pathname;

        const allowedPaths = [
            '/game',      // Review game screen
            '/analysis',  // Analysis board screen
        ];

        return allowedPaths.some(allowed => path.startsWith(allowed));
    }

    /**
     * Decides whether to inject or remove the button based on URL.
     */
    function updateInterface() {
        if (isAllowedUrl()) {
            ButtonManager.inject(() => handleExport(true));
        } else {
            if (ButtonManager.remove) {
                ButtonManager.remove();
            }
        }
    }

    // 1. Initial Injection Check
    updateInterface();

    // 2. Watch for DOM changes (navigation, new games)
    // We debounce this to avoid performance hits on busy pages.
    const debouncedUpdate = debounce(() => updateInterface(), 500);
    
    const observer = new MutationObserver((mutations) => {
        debouncedUpdate();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 3. Listen for triggers
    browser.runtime.onMessage.addListener((msg) => {
        if (msg.type === "TRIGGER_SCRAPE") {
            handleExport(true);
        }
    });

})();