export class AutoScroller {
    /**
     * @param {Object} config
     * @param {HTMLElement} canvas The canvas to monitor edges of
     * @param {Function} onScroll Callback to update scrollX/Y
     */
    constructor(excel, canvas, onScroll) {
        this.excel = excel;       // for scrollX, scrollY, maxRows etc.
        this.canvas = canvas;
        this.onScroll = onScroll;
        this.lastMouseX = 0;
        this.lastMouseY = 0;


        this.edge = { top: false, bottom: false, left: false, right: false };
        this.raf = null;
    }

    // updateEdge(x, y) {
    //     const marginRB = 15;
    //     const marginLB = 50;
    //     const rect = this.excel.Excelcontainer.getBoundingClientRect();
    //     const canvasRect=this.excel.container.getBoundingClientRect();

    //     this.edge.top = y < rect.height-canvasRect.height+ 25;
    //     console.log(y,rect-canvasRect)
    //     this.edge.bottom = y > rect.height - marginRB;
    //     this.edge.left = x < marginLB;
    //     this.edge.right = x > rect.width - marginRB;
    // }

       updateEdge(x, y) {
        const marginRB = 15;
        const marginL = 50;
        const marginT =25;
        const rect = this.canvas.getBoundingClientRect();

        this.edge.top = y < marginT;
        this.edge.bottom = y > rect.height;
        this.edge.left = x < marginL;
        this.edge.right = x > rect.width;
    }

    start() {
        if (this.raf) return;

        const step = () => {
            let changed = false;
            const verticalSpeed = 10;
            const horizontalSpeed = 20;

            const selType = this.excel.selection.type;

            // Scroll vertically only if not col-only
            if (selType !== 'col') {
                if (this.edge.top) {
                    this.excel.scrollY = Math.max(0, this.excel.scrollY - verticalSpeed);
                    changed = true;
                } else if (this.edge.bottom) {
                    this.excel.scrollY = Math.min(this.excel.maxRows * this.excel.rowHeight, this.excel.scrollY + verticalSpeed);
                    changed = true;
                }
            }

            // Scroll horizontally only if not row-only
            if (selType !== 'row') {
                if (this.edge.left) {
                    this.excel.scrollX = Math.max(0, this.excel.scrollX - horizontalSpeed);
                    changed = true;
                } else if (this.edge.right) {
                    this.excel.scrollX = Math.min(this.excel.maxCols * this.excel.colWidth, this.excel.scrollX + horizontalSpeed);
                    changed = true;
                }
            }

            if (changed && this.excel.selection.isSelecting) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = Math.min(Math.max(0, this.lastMouseX), rect.width);
                const mouseY = Math.min(Math.max(0, this.lastMouseY), rect.height);

                const colInfo = this.excel.getColFromX(mouseX);
                const rowInfo = this.excel.getRowFromY(mouseY);

                const sel = this.excel.selection;
                const start = sel.start;

                let endRow = rowInfo?.row;
                let endCol = colInfo?.col;

                // fallback if null
                if (endRow == null) endRow = Math.floor(this.excel.scrollY / this.excel.rowHeight);
                if (endCol == null) endCol = Math.floor(this.excel.scrollX / this.excel.colWidth);

                if (sel.type === 'row') {
                    this.excel.selection.end = { row: endRow ?? start.row, col: 0 };
                } else if (sel.type === 'col') {
                    this.excel.selection.end = { row: 0, col: endCol ?? start.col };
                } else {
                    this.excel.selection.end = {
                        row: endRow ?? start.row,
                        col: endCol ?? start.col
                    };
                }

                this.excel.scheduleStatsUpdate?.();
                this.excel.scheduleRender?.();
            }

          this.raf = requestAnimationFrame(step);


        };

        step();
    }



    stop() {
        if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
        this.edge = { top: false, bottom: false, left: false, right: false };
    }

    scrollToCell(row, col, padding = 1) {

        // Calculate Y scroll
        let y = 0;
        for (let r = 0; r < row; r++) {
            y += this.excel.getRowHeight(r);
        }

        const cellHeight = this.excel.getRowHeight(row);
        const canvasHeight = this.canvas.getBoundingClientRect().height;

        if (y < this.excel.scrollY) {
            this.excel.scrollY = Math.max(0, y - padding * cellHeight);
        } else if (y + cellHeight > this.excel.scrollY + canvasHeight) {
            this.excel.scrollY = y + cellHeight - canvasHeight + padding * cellHeight;
        }

        // Calculate X scroll
        let x = 0;
        for (let c = 0; c < col; c++) {
            x += this.excel.getColWidth(c);
        }

        const cellWidth = this.excel.getColWidth(col);
        const canvasWidth = this.canvas.getBoundingClientRect().width;

        if (x < this.excel.scrollX) {
            this.excel.scrollX = Math.max(0, x - padding * cellWidth);
        } else if (x + cellWidth > this.excel.scrollX + canvasWidth) {
            this.excel.scrollX = x + cellWidth - canvasWidth + padding * cellWidth;
        }
    }

}
