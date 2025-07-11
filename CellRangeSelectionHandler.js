// CellRangeSelectionHandler.js

export class CellRangeSelectionHandler {
    constructor(excel) {
        this.excel = excel;
    }

    hitTest(e) {
        const { offsetX: x, offsetY: y } = e;
        return x > this.excel.headerWidth && y > this.excel.headerHeight;
    }

    onPointerDown(e) {
        const { offsetX: x, offsetY: y } = e;
        const col = this.excel.getColFromX(x);
        const row = this.excel.getRowFromY(y);
        if (!row || !col) return;

        this.excel.selection = {
            start: { row: row.row, col: col.col },
            end: null,
            isSelecting: true,
            type: 'cell'
        };

        this.excel.activeCell = { row: row.row, col: col.col };
        this.excel.scheduleRender();
        // this.excel.autoScroller?.start()
    }

    onPointerMove(e) {
        if (!this.excel.selection.isSelecting) return;

        const { offsetX: x, offsetY: y } = e;
        const col = this.excel.getColFromX(x);
        const row = this.excel.getRowFromY(y);

        if (!col || !row) return;

        this.excel.selection.end = { row: row.row, col: col.col };
        this.excel.scheduleStatsUpdate?.();
        this.excel.scheduleRender?.();

    }

    onPointerUp(e) {
        this.excel.selection.isSelecting = false;
        // this.excel.autoScroller?.stop()
    }
}
