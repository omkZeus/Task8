// ColSelectionHandler.js

export class ColSelectionHandler {
    constructor(excel) {
        this.excel = excel;
    }

    hitTest(e) {
        const { offsetX: x, offsetY: y } = e;
        if (y >= this.excel.headerHeight || x <= this.excel.headerWidth) return false;
        const col = this.excel.getColFromX(x);
        // Ignore edge zone reserved for resize
        return col && Math.abs(x - (col.x + col.width)) >= 5;
    }

    onPointerDown(e) {
        const { offsetX: x } = e;
        const col = this.excel.getColFromX(x);
        if (!col) return;

        this.excel.selection = {
            start: { row: 0, col: col.col },
            end: null,
            isSelecting: true,
            type: 'col'
        };

        this.excel.activeCell = { row: 0, col: col.col };
        this.excel.autoScroller?.start();
        this.excel.scheduleRender();
    }

  onPointerMove(e) {
    if (!this.excel.selection.isSelecting) return;

    const col = this.excel.getColFromX(e.offsetX);
    if (col) {
        this.excel.selection.end = { row: 0, col: col.col };
        this.excel.scheduleRender?.();
    }
}


    onPointerUp(e) {
        this.excel.selection.isSelecting = false;
        this.excel.autoScroller?.stop();
    }
}
