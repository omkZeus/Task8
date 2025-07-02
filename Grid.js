// Grid.js

export class Grid {
    /**
     * Initializes the Grid object
     * @param {ExcelClone} excel Reference to main ExcelClone instance
     **/
    constructor(excel) {
        this.excel = excel;
    }

    drawGrid() {
        const { ctx, canvas, startCol, startRow, visibleCols, visibleRows, headerHeight, headerWidth } = this.excel;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.strokeStyle = '#d0d0d0';
        ctx.lineWidth = 1;

        //vertical lines 
        let x = headerWidth;
        for (let col = startCol; col <= startCol + visibleCols; col++) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, rect.height);
            ctx.stroke();
            if (col < startCol + visibleCols) {
                x += this.excel.getColWidth(col);
            }
        }
        //horizontal lines
        let y = headerHeight;
        for (let row = startRow; row <= startRow + visibleRows; row++) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(rect.width, y + 0.5);
            ctx.stroke();
            if (row < startRow + visibleRows) {
                y += this.excel.getRowHeight(row);
            }
        }

        // Header separators
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#999';
        ctx.beginPath();
        ctx.moveTo(headerWidth + 0.5, 0);
        ctx.lineTo(headerWidth + 0.5, rect.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, headerHeight + 0.5);
        ctx.lineTo(rect.width, headerHeight + 0.5);
        ctx.stroke();
    }

    drawHeaders() {
        const { ctx, startCol, startRow, visibleCols, visibleRows, headerHeight, headerWidth } = this.excel;
        const selection = this.excel.selection;

        const rect = this.excel.canvas.getBoundingClientRect();

        // Column Header
        let x = headerWidth;
        for (let col = startCol; col < startCol + visibleCols; col++) {
            const width = this.excel.getColWidth(col);

            // Check if this column is selected
            const isSelected =
                selection.type === 'col' &&
                selection.start &&
                col >= Math.min(selection.start.col, selection.end?.col ?? selection.start.col) &&
                col <= Math.max(selection.start.col, selection.end?.col ?? selection.start.col);

            // Set background fill
            ctx.fillStyle = isSelected ? '#137E43' : '#f5f5f5';
            ctx.fillRect(x, 0, width, headerHeight);

            // Draw column label text
            ctx.fillStyle = isSelected ? '#fff' : '#333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = this.getColumnLabel(col);
            ctx.fillText(label, x + width / 2, headerHeight / 2);

            // Right border
            ctx.strokeStyle = '#ccc';
            ctx.beginPath();
            ctx.moveTo(x + width, 0);
            ctx.lineTo(x + width, headerHeight);
            ctx.stroke();

            x += width;
        }

        // Row Header
        let y = headerHeight;
        for (let row = startRow; row < startRow + visibleRows; row++) {
            const height = this.excel.getRowHeight(row);

            // Check if this row is selected
            const isSelected =
                selection.type === 'row' &&
                selection.start &&
                row >= Math.min(selection.start.row, selection.end?.row ?? selection.start.row) &&
                row <= Math.max(selection.start.row, selection.end?.row ?? selection.start.row);

            // Set background fill
            ctx.fillStyle = isSelected ? '#137E43' : '#f5f5f5';
            ctx.fillRect(0, y, headerWidth, height);

            // Draw row label text
            ctx.fillStyle = isSelected ? '#fff' : '#333';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(row + 1, headerWidth / 2, y + height / 2);


            // Bottom border
            ctx.strokeStyle = '#ccc';
            ctx.beginPath();
            ctx.moveTo(0, y + height);
            ctx.lineTo(headerWidth, y + height);
            ctx.stroke();

            y += height;
        }

        // Top-left corner cell
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, headerWidth, headerHeight);
        ctx.lineWidth=2
        ctx.strokeStyle = '#B7B7B7';
        ctx.beginPath();
        ctx.moveTo(headerWidth, 0);
        ctx.lineTo(headerWidth, headerHeight);
        ctx.lineTo(0, headerHeight);
        ctx.stroke();
    }


    getColumnLabel(col) {
        let label = '';
        let num = col;
        while (num >= 0) {
            label = String.fromCharCode(65 + (num % 26)) + label;


            num = Math.floor(num / 26) - 1;
            if (num < 0) break;
        }
        return label;
    }

    drawCells() {
        const { ctx, startRow, startCol, visibleRows, visibleCols, headerHeight, headerWidth } = this.excel;
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';

        let y = headerHeight;
        for (let i = 0; i < visibleRows; i++) {
            const row = startRow + i;
            let x = headerWidth + 4;
            const height = this.excel.getRowHeight(row);

            for (let j = 0; j < visibleCols; j++) {
                const col = startCol + j;
                const value = this.excel.getCell(row, col);
                const width = this.excel.getColWidth(col);

                if (value) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(x - 4, y, width - 1, height);
                    ctx.clip();
                    ctx.fillText(value, x, y + height / 2);
                    ctx.restore();
                }

                x += width;
            }

            y += height;
        }
    }
}
