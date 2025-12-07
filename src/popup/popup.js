document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('eloToggle');
    const analyzeBtn = document.getElementById('analyzeBtn');

    // 1. Restore the toggle state from storage
    browser.storage.local.get("hideElo").then(data => {
        toggle.checked = !!data.hideElo;
    });

    // 2. Save state when toggled
    toggle.addEventListener('change', () => {
        browser.storage.local.set({ hideElo: toggle.checked });
    });

    // 3. Handle the "Analyze" button click
    // Sends a message to service-worker to trigger the scrape
    analyzeBtn.addEventListener('click', () => {
        browser.runtime.sendMessage({ type: "POPUP_TRIGGER_SCRAPE" });
        window.close(); // Close the popup to provide immediate feedback
    });
});