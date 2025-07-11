import { Command } from './Command.js';

export class ResizeRowCommand extends Command {
    constructor(excel, rows, oldHeights, newHeight) {
        super();
        this.excel = excel;
        this.rows = rows;
        this.oldHeights = oldHeights;
        this.newHeight = newHeight;
    }

    execute() {
        for (const row of this.rows) {
            this.excel.setRowHeight(row, this.newHeight);
        }
        this.excel.render();
    }

    undo() {
        for (const [row, height] of this.oldHeights.entries()) {
            this.excel.setRowHeight(row, height);
        }
        this.excel.render();
    }
}
