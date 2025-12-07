document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('eloToggle');

    // 1. Restore the toggle state from storage
    browser.storage.local.get("hideElo").then(data => {
        toggle.checked = !!data.hideElo;
    });

    // 2. Save state when toggled
    toggle.addEventListener('change', () => {
        browser.storage.local.set({ hideElo: toggle.checked });
    });
});