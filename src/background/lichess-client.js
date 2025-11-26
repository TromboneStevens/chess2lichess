/**
 * lichess-client.js
 * Handles the actual API communication with Lichess.
 */

const LichessClient = (() => {

    async function upload(pgn) {
        try {
            const response = await fetch("https://lichess.org/api/import", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                },
                body: new URLSearchParams({ pgn: pgn })
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lichess Error ${response.status}: ${errorText}`);
            }
    
            const data = await response.json();
            return { success: true, url: data.url };

        } catch (error) {
            console.error("Lichess Upload Error:", error);
            throw error;
        }
    }

    return {
        upload: upload
    };

})();