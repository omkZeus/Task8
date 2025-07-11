// RowResizeHandler.js

export class RowResizeHandler {
    constructor(excel) {
        this.excel = excel;
        this.resizing = false;
    }

    hitTest(e) {
        const { offsetX: x, offsetY: y } = e;
        if (x >= this.excel.headerWidth || y <= this.excel.headerHeight) return false;
        const row = this.excel.getRowFromY(y);
        return row && Math.abs(y - (row.y + row.height)) < 5;
    }

    getCursor(e) {
        return 'row-resize';
    }


    onPointerDown(e) {
        const { offsetY: y } = e;
        const row = this.excel.getRowFromY(y);
        if (!row) return;

        this.resizing = true;
        this.row = row.row;
        this.startY = y;
        this.originalHeight = this.excel.getRowHeight(row.row);
        this.excel.canvas.style.cursor = 'row-resize';
    }

    onPointerMove(e) {
        if (!this.resizing) return;
        const delta = e.offsetY - this.startY;
        const newHeight = Math.max(20, this.originalHeight + delta);
        this.excel.rowHeights.set(this.row, newHeight);
        this.excel.scheduleRender();
    }

    onPointerUp(e) {
        if (this.resizing) {
            this.resizing = false;
            this.excel.canvas.style.cursor = 'default';

            const selection = this.excel.selection;
            const selectedRows = new Set();

            if (selection.type === 'row' && selection.start) {
                const start = Math.min(selection.start.row, selection.end?.row ?? selection.start.row);
                const end = Math.max(selection.start.row, selection.end?.row ?? selection.start.row);
                for (let r = start; r <= end; r++) {
                    selectedRows.add(r);
                }
            }

            if (selectedRows.has(this.row)) {
                for (const row of selectedRows) {
                    if (row !== this.row) {
                        this.excel.setRowHeight(row, this.excel.getRowHeight(this.row));
                    }
                }
                this.excel.scheduleRender();
            }
        }
    }

}
