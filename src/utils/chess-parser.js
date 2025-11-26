/**
 * chess-parser.js
 * Responsible solely for reading the DOM and extracting Move/Piece data.
 */

const ChessParser = (() => {

    /**
     * Determines the piece type (N, B, R, Q, K) from a DOM node.
     * @param {HTMLElement} node 
     * @returns {string} One letter piece code or empty string.
     */
    function getPieceFromNode(node) {
        // 1. Check data attributes (most reliable)
        const dataNode = node.querySelector('[data-piece]') || (node.hasAttribute('data-piece') ? node : null);
        if (dataNode) {
            const val = dataNode.getAttribute('data-piece').toLowerCase();
            return _mapCharToPiece(val);
        }

        // 2. Check child elements (images, icons)
        const childElements = node.querySelectorAll('span, div, img, i');
        for (let el of childElements) {
            const cls = (el.className || "").toString().toLowerCase();
            const src = (el.src || "").toString().toLowerCase();

            // Check class names
            if (cls.includes('knight')) return 'N';
            if (cls.includes('bishop')) return 'B';
            if (cls.includes('rook'))   return 'R';
            if (cls.includes('queen'))  return 'Q';
            if (cls.includes('king'))   return 'K';

            // Check standard chess.com class patterns (e.g. "wb", "bk")
            if (/\b[wb][nbrqk]\b/.test(cls)) {
                return _mapCharToPiece(cls);
            }

            // Check Image Sources
            if (src) {
                if (src.includes('wn.') || src.includes('bn.') || src.includes('n.')) return 'N';
                if (src.includes('wb.') || src.includes('bb.') || src.includes('b.')) return 'B';
                if (src.includes('wr.') || src.includes('br.') || src.includes('r.')) return 'R';
                if (src.includes('wq.') || src.includes('bq.') || src.includes('q.')) return 'Q';
                if (src.includes('wk.') || src.includes('bk.') || src.includes('k.')) return 'K';
            }
        }
        
        // 3. Check Text content (Unicode chess pieces)
        const text = node.innerText || "";
        if (/[♘♞]/.test(text)) return "N";
        if (/[♗♝]/.test(text)) return "B";
        if (/[♖♜]/.test(text)) return "R";
        if (/[♕♛]/.test(text)) return "Q";
        if (/[♔♚]/.test(text)) return "K";

        return "";
    }

    /**
     * Helper to map a string like "wb" or "n" to a piece code.
     */
    function _mapCharToPiece(str) {
        if (str.includes('n')) return 'N';
        if (str.includes('b')) return 'B';
        if (str.includes('r')) return 'R';
        if (str.includes('q')) return 'Q';
        if (str.includes('k')) return 'K';
        return '';
    }

    /**
     * Scrapes the PGN from the move list.
     * @returns {string|null} The formatted PGN string.
     */
    function scrapePgn() {
        const plyNodes = document.querySelectorAll('.move-list .node, .wc-move-list .node, .move-list-component .node');
        
        // Fallback: If no move list, try grabbing raw text from container
        if (plyNodes.length === 0) {
             const container = document.querySelector('chess-board')?.nextElementSibling || document.body;
             return (container.innerText || "").replace(/\u00A0/g, " ");
        }

        let pgnMoves = [];

        plyNodes.forEach((node) => {
            if (node.classList.contains('move-number')) return; 

            let piece = getPieceFromNode(node);
            let text = node.innerText.replace(/[\n\r]/g, '').trim();

            // Clean up move numbers (e.g. "1.")
            text = text.replace(/^\d+\.+/, '').trim();
            
            if (!text && !piece) return;

            // Castling logic
            if (text.includes("O-O")) {
                pgnMoves.push(text);
                return;
            }

            // Append piece letter if missing from text
            if (piece && !/^[NBRQK]/.test(text)) {
                text = piece + text;
            }
            
            pgnMoves.push(text);
        });

        if (pgnMoves.length === 0) return null;

        // Reconstruct PGN with move numbers
        let fullPgn = "";
        for (let i = 0; i < pgnMoves.length; i++) {
            if (i % 2 === 0) {
                fullPgn += `${(i/2) + 1}. ${pgnMoves[i]} `;
            } else {
                fullPgn += `${pgnMoves[i]} `;
            }
        }
        return fullPgn.trim();
    }

    // Public API
    return {
        scrape: scrapePgn
    };

})();