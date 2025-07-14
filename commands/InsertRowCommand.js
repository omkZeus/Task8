
import { Command } from './Command.js';

export class InsertRowCommand extends  Command {
    constructor(excel, targetRow, oldData, oldHeights) {
        super();

        this.excel = excel;
        this.targetRow = targetRow;
        this.oldData = oldData;
        this.oldHeights = oldHeights;
    }

    execute() {
        this.excel.sheetOps._insertRowLogic(this.targetRow);
    }

    undo() {
        this.excel.data = new Map(this.oldData);
        this.excel.rowHeights = new Map(this.oldHeights);
        this.excel.render();
    }
}
