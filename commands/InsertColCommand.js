import { Command } from './Command.js';

export class InsertColCommand extends  Command {
    constructor(excel, targetCol, oldData, oldWidths) {
        super();
        this.excel = excel;
        this.targetCol = targetCol;
        this.oldData = oldData;
        this.oldWidths = oldWidths;
    }

    execute() {
        this.excel.sheetOps._insertColLogic(this.targetCol);
    }

    undo() {
        this.excel.data = new Map(this.oldData);
        this.excel.colWidths = new Map(this.oldWidths);
        this.excel.render();
    }
}
