// ContextMenu.js

export class ContextMenu {
    /**
     * Initializes the ContextMenu object
     * @param {ExcelClone} excel The main spreadsheet instance
     */
    constructor(excel) {
        this.excel = excel;

        this.menu = document.createElement('div');
        this.menu.id = 'contextMenu';

        document.body.appendChild(this.menu);
        this._bindAutoHide();
    }

    /**
     * Displays the context menu at the given position with options based on target type.
     * @param {number} x X position on screen
     * @param {number} y Y position on screen
     * @param {'row'|'col'|'cell'} type Clicked region type
     * @param {number} row Row index
     * @param {number} col Column index
     */
    show(x, y, type, row, col) {
        this.menu.innerHTML = ''; // Clear old items
        this.excel.contextRow = row;
        this.excel.contextCol = col;

        // if (type === 'row' || type === 'cell') {
        //     this._addItem('Insert Row Above', () => this.excel.sheetOps.insertRowBelow(row - 1));
        //     this._addItem('Insert Row Below', () => this.excel.sheetOps.insertRowBelow(row));
        // }
        if (type === 'row' || type === 'cell') {
           
            const { start, end } = this.excel.selection;
             if(!start && !end) return;
            const count = Math.abs((end?.row ?? start.row) - start.row) + 1;

            this._addItem(`Insert ${count} Row${count > 1 ? 's' : ''} Above`, () => {
                for (let i = 0; i < count; i++) {
                    this.excel.sheetOps.insertRowBelow(start.row - 1);
                }
            });

            this._addItem(`Insert ${count} Row${count > 1 ? 's' : ''} Below`, () => {
                for (let i = 0; i < count; i++) {
                    this.excel.sheetOps.insertRowBelow(end?.row ?? start.row);
                }
            });
        }



        // if (type === 'col' || type === 'cell') {
        //     this._addItem('Insert Column Left', () => this.excel.sheetOps.insertColRight(col - 1));
        //     this._addItem('Insert Column Right', () => this.excel.sheetOps.insertColRight(col));
        // }

        if (type === 'col' || type === 'cell') {
            const { start, end } = this.excel.selection;
             if(!start && !end) return;

            const count = Math.abs((end?.col ?? start.col) - start.col) + 1;

            this._addItem(`Insert ${count} Column${count > 1 ? 's' : ''} Left`, () => {
                for (let i = 0; i < count; i++) {
                    this.excel.sheetOps.insertColRight(start.col - 1);
                }
            });

            this._addItem(`Insert ${count} Column${count > 1 ? 's' : ''} Right`, () => {
                for (let i = 0; i < count; i++) {
                    this.excel.sheetOps.insertColRight(end?.col ?? start.col);
                }
            });
        }


        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
        this.menu.style.display = 'block';
    }

    _addItem(label, handler) {
        const item = document.createElement('div');
        item.textContent = label;
        item.style.cssText = 'padding: 8px; cursor: pointer;';
        item.addEventListener('click', () => {
            handler();
            this.hide();
        });
        this.menu.appendChild(item);
    }

    hide() {
        this.menu.style.display = 'none';
    }

    _bindAutoHide() {
        document.addEventListener('click', () => this.hide());
    }
}
