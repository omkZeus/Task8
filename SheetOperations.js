// SheetOperations.js

export class SheetOperations {
    /**
     * @param {Object} excel - Reference to the main ExcelClone instance
     */
    constructor(excel) {
        this.excel = excel;
    }

    /**
     * Inserts a new row below the specified row index
     * @param {number} targetRow - The row index below which the new row will be inserted
     */
    insertRowBelow(targetRow) {
        const newData = new Map();
        for (const [key, value] of this.excel.data.entries()) {
            const [row, col] = key.split(',').map(Number);
            newData.set(`${row > targetRow ? row + 1 : row},${col}`, value);
        }
        this.excel.data = newData;
        this._shiftRowHeights(targetRow);
        this.excel.render();
    }

    /**
     * Inserts a new column to the right of the specified column index
     * @param {number} targetCol - The column index to the right of which the new column will be inserted
     */
    insertColRight(targetCol) {
        const newData = new Map();
        for (const [key, value] of this.excel.data.entries()) {
            const [row, col] = key.split(',').map(Number);
            newData.set(`${row},${col > targetCol ? col + 1 : col}`, value);
        }
        this.excel.data = newData;
        this._shiftColWidths(targetCol);
        this.excel.render();
    }

    /**
     * Shifts row height mappings for rows after the inserted row
     * @param {number} afterRow - The row index after which row heights should be shifted
     * @private
     */
    _shiftRowHeights(afterRow) {
        const newHeights = new Map();
        for (const [row, height] of this.excel.rowHeights.entries()) {
            newHeights.set(row > afterRow ? row + 1 : row, height);
        }
        this.excel.rowHeights = newHeights;
    }

    /**
     * Shifts column width mappings for columns after the inserted column
     * @param {number} afterCol - The column index after which column widths should be shifted
     * @private
     */
    _shiftColWidths(afterCol) {
        const newWidths = new Map();
        for (const [col, width] of this.excel.colWidths.entries()) {
            newWidths.set(col > afterCol ? col + 1 : col, width);
        }
        this.excel.colWidths = newWidths;
    }
}

