/**
 * elo-hider.js
 * Handles hiding ELO ratings based on user preference.
 * Uses CSS injection to visually replace the rating text.
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
                
                // CSS STRATEGY:
                // 1. font-size: 0 hides the original text "(1200)"
                // 2. ::after inserts the replacement text and restores the font size
                style.textContent = `
                    [data-cy="user-tagline-rating"] {
                        font-size: 0 !important;
                        display: inline-block;
                    }
                    
                    [data-cy="user-tagline-rating"]::after {
                        content: '(hidden)';
                        font-size: 13px !important;  /* Restore visible size */
                        font-style: italic !important;
                        color: #888888 !important;   /* Grey */
                        visibility: visible !important;
                        margin-left: 4px;
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