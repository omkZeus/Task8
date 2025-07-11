// RowSelectionHandler.js

export class RowSelectionHandler {
    constructor(excel) {
        this.excel = excel;
    }

    hitTest(e) {
        const { offsetX: x, offsetY: y } = e;
        if (x >= this.excel.headerWidth || y <= this.excel.headerHeight) return false;
        const row = this.excel.getRowFromY(y);
        // Ignore edge zone reserved for resizing
        return row && Math.abs(y - (row.y + row.height)) >= 5;
    }

    onPointerDown(e) {
        const { offsetY: y } = e;
        const row = this.excel.getRowFromY(y);
        if (!row) return;

        this.excel.selection = {
            start: { row: row.row, col: 0 },
            end: null,
            isSelecting: true,
            type: 'row'
        };

        this.excel.activeCell = { row: row.row, col: 0 };
        this.excel.scheduleRender();
    }

    onPointerMove(e) {
    if (!this.excel.selection.isSelecting) return;

    const row = this.excel.getRowFromY(e.offsetY);
    if (row) {
        this.excel.selection.end = { row: row.row, col: 0 };
        this.excel.scheduleRender?.();
    }
}


    onPointerUp(e) {
        this.excel.selection.isSelecting = false;
    }
}
