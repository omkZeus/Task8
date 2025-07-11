import { Command } from './Command.js';

export class EditCellCommand extends Command {
    constructor(excel, row, col, oldValue, newValue) {
        super();
        this.excel = excel;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    execute() {
        this.excel.setCell(this.row, this.col, this.newValue);
        this.excel.render();
    }

    undo() {
        this.excel.setCell(this.row, this.col, this.oldValue);
        this.excel.render();
    }
}
