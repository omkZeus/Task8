// ClipboardManager.js

export class ClipboardManager {
    /**
     * @param {ExcelClone} excel The main ExcelClone instance
     * @param {Object} buttons Optional UI buttons (copyBtn, pasteBtn)
     */
    constructor(excel, buttons = {}) {
        this.excel = excel;
        this.clipboardData = null;

        this.copyBtn = buttons.copyBtn || null;
        this.pasteBtn = buttons.pasteBtn || null;

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copy());
        }

        if (this.pasteBtn) {
            this.pasteBtn.addEventListener('click', () => this.paste());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'c') {
                this.copy();
                e.preventDefault();
            }
            if (e.ctrlKey && e.key === 'v') {
                this.paste();
                e.preventDefault();
            }
        });
    }

    copy() {
    const sel = this.excel.selection;
    if (!sel.start) return;

    const start = sel.start;
    const end = sel.end || start;

    let minRow = Math.min(start.row, end.row);
    let maxRow = Math.max(start.row, end.row);
    let minCol = Math.min(start.col, end.col);
    let maxCol = Math.max(start.col, end.col);

    // If entire row is selected, set full column range
    if (sel.type === 'row') {
        minCol = 0;
        maxCol = this.excel.maxCols - 1;
    }
    // If entire column is selected, set full row range
    else if (sel.type === 'col') {
        minRow = 0;
        maxRow = this.excel.maxRows - 1;
    }

    const data = [];

    for (let r = minRow; r <= maxRow; r++) {
        const row = [];
        // let hasContent = false;
        for (let c = minCol; c <= maxCol; c++) {
            const value = this.excel.getCell(r, c);
            row.push(value);
        }
      
       
            data.push(row); 
       
    }

    this.clipboardData = {
        rows: maxRow - minRow + 1,
        cols: maxCol - minCol + 1,
        data
    };

    if (this.pasteBtn) {
        this.pasteBtn.disabled = false;
    }

    console.log('Copied:', {
        rows: this.clipboardData.rows,
        cols: this.clipboardData.cols,
        size: `${data.length}x${data[0]?.length || 0}`
    });
}


    paste() {
        if (!this.clipboardData || !this.excel.activeCell) return;

        const startRow = this.excel.activeCell.row;
        const startCol = this.excel.activeCell.col;

        for (let r = 0; r < this.clipboardData.rows; r++) {
            for (let c = 0; c < this.clipboardData.cols; c++) {
                const value = this.clipboardData.data[r][c] ;
                this.excel.setCell(startRow + r, startCol + c, value);
            }
        }

        this.excel.render();
        console.log('Pasted to', startRow, startCol);
    }
}
