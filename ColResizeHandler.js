// ColResizeHandler.js
import { ResizeColCommand } from './commands/ResizeColCommand.js';

export class ColResizeHandler {
    constructor(excel) {
        this.excel = excel;
        this.resizing = false;
    }

    hitTest(e) {
        const { offsetX: x, offsetY: y } = e;
        if (y >= this.excel.headerHeight || x <= this.excel.headerWidth) return false;
        const col = this.excel.getColFromX(x);
        return col && Math.abs(x - (col.x + col.width)) < 5;
    }

    getCursor() {
        console.log("hello");

        return 'col-resize';
    }

    onPointerDown(e) {
        const { offsetX: x } = e;
        const col = this.excel.getColFromX(x);
        if (!col) return;

        this.resizing = true;
        this.col = col.col;
        this.startX = x;
        this.originalWidth = this.excel.getColWidth(col.col);
        this.excel.canvas.style.cursor = 'col-resize';
    }

    onPointerMove(e) {
        if (!this.resizing) return;
        const delta = e.offsetX - this.startX;
        const newWidth = Math.max(30, this.originalWidth + delta);
        this.excel.colWidths.set(this.col, newWidth);
        this.excel.scheduleRender();
    }

    onPointerUp(e) {
        if (this.resizing) {
            this.resizing = false;
            this.excel.canvas.style.cursor = 'default';

            const selection = this.excel.selection;
            const selectedCols = new Set();

            if (selection.type === 'col' && selection.start) {
                const start = Math.min(selection.start.col, selection.end?.col ?? selection.start.col);
                const end = Math.max(selection.start.col, selection.end?.col ?? selection.start.col);
                for (let c = start; c <= end; c++) {
                    selectedCols.add(c);
                }
            }

            if (selectedCols.has(this.col)) {
                for (const col of selectedCols) {
                    if (col !== this.col) {
                        this.excel.setColWidth(col, this.excel.getColWidth(this.col));
                    }
                }
                this.excel.scheduleRender();
            }
        }

      
    }




}
