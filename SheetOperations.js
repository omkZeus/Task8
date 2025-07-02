// SheetOperations.js

export class SheetOperations {
    constructor(excel) {
        this.excel = excel;
    }

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

    _shiftRowHeights(afterRow) {
        const newHeights = new Map();
        for (const [row, height] of this.excel.rowHeights.entries()) {
            newHeights.set(row > afterRow ? row + 1 : row, height);
        }
        this.excel.rowHeights = newHeights;
    }

    _shiftColWidths(afterCol) {
        const newWidths = new Map();
        for (const [col, width] of this.excel.colWidths.entries()) {
            newWidths.set(col > afterCol ? col + 1 : col, width);
        }
        this.excel.colWidths = newWidths;
    }
}
