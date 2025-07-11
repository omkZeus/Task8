import { Command } from './Command.js';

export class ResizeColCommand extends Command {
    constructor(excel, cols, oldWidths, newWidth) {
        super();
        this.excel = excel;
        this.cols = cols;
        this.oldWidths = oldWidths;
        this.newWidth = newWidth;
    }

    execute() {
        for (const col of this.cols) {
            this.excel.setColWidth(col, this.newWidth);
            console.log(`[ResizeCol] ${this.cols}`, this.oldWidths, this.newWidth);

        }
        this.excel.render();
    }

    undo() {
        for (const [col, width] of this.oldWidths.entries()) {
            this.excel.setColWidth(col, width);
            console.log(`[ResizeCol] ${this.cols}`, this.oldWidths, this.newWidth);

        }
        this.excel.render();
    }
}
