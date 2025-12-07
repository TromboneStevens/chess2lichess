/**
 * service-worker.js (Formerly background.js)
 * Handles Extension events and coordinates messages.
 */

// Handle Messages from Content Script AND Popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
    // --- 1. Handle Trigger from Popup Menu ---
    if (message.type === "POPUP_TRIGGER_SCRAPE") {
        // We need to find the active tab in the current window manually now
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (tabs.length === 0) return;
            const tab = tabs[0];

            // Send message to content script
            browser.tabs.sendMessage(tab.id, { type: "TRIGGER_SCRAPE" })
                .catch(err => {
                    console.log("Content script not ready, injecting fallback...");
                    
                    // Fallback injection if content script failed to load automatically
                    browser.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: [
                            "src/utils/chess-parser.js",
                            "src/ui/button-manager.js", 
                            "src/content/main.js"
                        ]
                    });
                    
                    // Also inject CSS
                    browser.scripting.insertCSS({
                        target: { tabId: tab.id },
                        files: ["src/ui/styles.css"]
                    });
                });
        });
    }

    // --- 2. Handle PGN Found (from Content Script) ---
    if (message.type === "PGN_FOUND") {
        
        handlePgnUpload(message.pgn, sendResponse);
        
        // Return true to indicate we will sendResponse asynchronously
        return true; 
    }
});

async function handlePgnUpload(pgn, sendResponse) {
    browser.action.setBadgeText({ text: "UP" });

    try {
        // LichessClient is available because it is loaded before this script in manifest.json
        const result = await LichessClient.upload(pgn);
        
        browser.tabs.create({ url: result.url });
        browser.action.setBadgeText({ text: "" });
        
        sendResponse({ success: true });

    } catch (error) {
        browser.action.setBadgeText({ text: "ERR" });
        setTimeout(() => browser.action.setBadgeText({ text: "" }), 3000);
        
        sendResponse({ success: false, error: error.message });
    }
}