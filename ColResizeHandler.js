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
        return 'col-resize';
    }

    onPointerDown(e) {
        const { offsetX: x } = e;
        const col = this.excel.getColFromX(x);
        if (!col) return;
        this.col = col.col;
        this.startWidth = this.excel.getColWidth(this.col);
        this.resizing = true;
        this.startX = x;
        this.excel.canvas.style.cursor = 'col-resize';
    }

    onPointerMove(e) {
        if (!this.resizing) return;
        const delta = e.offsetX - this.startX;
        const newWidth = Math.max(30, this.startWidth + delta);
        this.excel.colWidths.set(this.col, newWidth);
        this.excel.scheduleRender();
    }

    onPointerUp(e) {
        if (!this.resizing) return;
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

        // Determine if we should resize multiple or just the dragged one
        const resizeMultiple = selection.type === 'col' &&
            selection.start &&
            selectedCols.has(this.col); // Only if dragged col is in selection

        if (resizeMultiple) {
            
        } else {
            selectedCols.clear();          
            selectedCols.add(this.col);     // Just resize the one that was dragged
        }


        // Save old widths from before and also the oldwidth of dragged col
        const oldWidths = new Map();
        for (const col of selectedCols) {
            const oldWidth = col === this.col ? this.startWidth : this.excel.getColWidth(col);
            oldWidths.set(col, oldWidth);
        }

        // Final width is now on the dragged column
        const finalWidth = this.excel.getColWidth(this.col);
        console.log("ggg")

        // Apply same width to the rest (skip dragged one)
        if (selectedCols.has(this.resizeIndex)) {
            for (const col of selectedCols) {
                if (col !== this.col) {
                    this.excel.setColWidth(col, finalWidth);
                }
            }
        }

        this.excel.scheduleRender();
        this.excel.resizeIndex = -1

        //Build and execute command
        const cmd = new ResizeColCommand(this.excel, [...selectedCols], oldWidths, finalWidth);
        this.excel.commandManager.executeCommand(cmd);
    }






}
