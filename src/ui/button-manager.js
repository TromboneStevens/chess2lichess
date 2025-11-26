/**
 * button-manager.js
 * Handles the creation, injection, and event binding of the Lichess button.
 */

const ButtonManager = (() => {
    
    const BUTTON_ID = "chess2lichess-btn";

    /**
     * Helper: Loads the SVG file from the extension assets
     * Uses DOMParser to avoid "innerHTML" security warnings.
     */
    function loadIcon(container) {
        const iconUrl = browser.runtime.getURL("src/assets/icon.svg");
        fetch(iconUrl)
            .then(response => response.text())
            .then(svgText => {
                // VALIDATION FIX: Use DOMParser instead of innerHTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, "image/svg+xml");
                const svg = doc.documentElement;

                if (svg && svg.nodeName.toLowerCase() === 'svg') {
                    svg.classList.add('c2l-svg-icon');
                    // Safely clear and append
                    container.textContent = ''; 
                    container.appendChild(svg);
                } else {
                    // Fallback if parsing failed
                    container.innerText = "♞";
                }
            })
            .catch(err => {
                // Quiet fail for icon
                container.innerText = "♞"; 
            });
    }

    /**
     * Creates the DOM element for the button.
     */
    function createButton(onClickHandler) {
        const btn = document.createElement("button");
        btn.id = BUTTON_ID;
        btn.className = "cc-button-component cc-button-primary cc-button-xx-large cc-button-full c2l-button"; 

        btn.innerHTML = `
            <span class="cc-icon-glyph cc-icon-size-32 cc-button-icon c2l-icon-container"></span>
            <span class="cc-button-one-line c2l-text">Lichess</span>
        `;

        const iconContainer = btn.querySelector('.c2l-icon-container');
        loadIcon(iconContainer);

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const textSpan = btn.querySelector('.c2l-text');
            const originalText = textSpan ? textSpan.innerText : "Lichess";
            if(textSpan) textSpan.innerText = "Loading...";
            btn.classList.add('c2l-loading');
            onClickHandler().finally(() => {
                setTimeout(() => {
                    if(textSpan) textSpan.innerText = originalText;
                    btn.classList.remove('c2l-loading');
                }, 2000);
            });
        };
        return btn;
    }

    /**
     * Injects the button based on the current page context.
     */
    function inject(onClickHandler) {
        const existingBtn = document.getElementById(BUTTON_ID);
        const path = window.location.pathname;
        
        let target = null;
        let isAnalysisBar = false;
        
        // --- STRATEGY 1: GAME REVIEW (/game/...) ---
        if (path.startsWith('/game')) {
            const gameReviewContainer = document.querySelector('.game-review-buttons-component');
            if (gameReviewContainer) {
                gameReviewContainer.classList.add('c2l-flex-container');
                const originalBtn = gameReviewContainer.querySelector('.cc-button-component');
                if (originalBtn) originalBtn.classList.add('c2l-flex-item');
                target = gameReviewContainer;
            } else {
                target = document.querySelector('.move-list-buttons-component') || 
                         document.querySelector('.daily-game-footer-component');
            }
        }

        // --- STRATEGY 2: ANALYSIS (/analysis) ---
        else if (path.startsWith('/analysis')) {
            const analysisSelectors = [
                '[data-cy="analysis-tab-analysis"]', 
                '.analysis-view-buttons',       
                '[class*="analysis-view-buttons"]', 
                '.move-list-buttons-component', 
                '.secondary-controls-component',
                '.tab-content-component',       
                '.sidebar-view',                
                '.board-layout-sidebar'         
            ];

            for (const selector of analysisSelectors) {
                const el = document.querySelector(selector);
                if (el) {
                    target = el;
                    if (selector.includes('analysis-view-buttons')) isAnalysisBar = true;
                    break; 
                }
            }
        }

        // --- FINAL SAFEGUARD ---
        if (!target && (path.startsWith('/game') || path.startsWith('/analysis'))) {
            target = document.querySelector('.board-layout-sidebar');
        }

        // --- EXECUTE INJECTION / MOVE ---
        if (target) {
            
            const btn = existingBtn || createButton(onClickHandler);
            
            // --- IDEMPOTENCY CHECK ---
            // If the button already exists in the target container, we are good.
            if (existingBtn && existingBtn.parentElement === target) {
                return;
            }
            
            // --- STYLING LOGIC ---
            if (isAnalysisBar) {
                btn.style.width = "auto";
                btn.style.minWidth = "120px";
                btn.style.margin = "0 5px";
                btn.style.flex = "0 0 auto"; 
                btn.classList.remove('c2l-fallback', 'c2l-flex-item');
                target.prepend(btn);
            } 
            else if (target.classList.contains('game-review-buttons-component')) {
                btn.style.width = "";
                btn.style.minWidth = "";
                btn.style.margin = "";
                btn.style.marginTop = "";
                btn.style.flex = "";
                btn.classList.remove('c2l-fallback');
                btn.classList.add('c2l-flex-item');
                target.appendChild(btn);
            }
            else {
                // Sidebar Full Width Styling
                btn.style.width = "";
                btn.style.minWidth = "";
                btn.style.flex = "";
                btn.classList.remove('c2l-flex-item');
                btn.classList.add('c2l-fallback'); 
                btn.style.margin = "";
                
                target.appendChild(btn);
            }
        }
    }

    function remove() {
        const btn = document.getElementById(BUTTON_ID);
        if (btn) {
            btn.remove();
            const gameReviewContainer = document.querySelector('.game-review-buttons-component');
            if (gameReviewContainer) {
                gameReviewContainer.classList.remove('c2l-flex-container');
                const originalBtn = gameReviewContainer.querySelector('.cc-button-component');
                if (originalBtn) originalBtn.classList.remove('c2l-flex-item');
            }
        }
    }

    return {
        inject: inject,
        remove: remove
    };

})();