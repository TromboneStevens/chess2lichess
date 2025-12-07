/**
 * elo-hider.js
 * Handles hiding ELO ratings based on user preference.
 * Uses CSS injection for performance and stability.
 */

(function() {
    const STYLE_ID = "c2l-hide-elo-style";

    function updateEloVisibility(shouldHide) {
        const existingStyle = document.getElementById(STYLE_ID);

        if (shouldHide) {
            // If supposed to hide and style doesn't exist, create it
            if (!existingStyle) {
                const style = document.createElement("style");
                style.id = STYLE_ID;
                // Using visibility: hidden preserves the layout space but hides the text
                style.textContent = `
                    [data-cy="user-tagline-rating"] {
                        visibility: hidden !important;
                    }
                `;
                (document.head || document.documentElement).appendChild(style);
            }
        } else {
            // If supposed to show, remove the hiding style
            if (existingStyle) {
                existingStyle.remove();
            }
        }
    }

    // 1. Check preference on load
    browser.storage.local.get("hideElo").then(data => {
        updateEloVisibility(!!data.hideElo);
    });

    // 2. Listen for toggle changes from the popup
    browser.storage.onChanged.addListener((changes) => {
        if (changes.hideElo) {
            updateEloVisibility(changes.hideElo.newValue);
        }
    });
})();