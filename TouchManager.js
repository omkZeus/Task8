// TouchManager.js

export class TouchManager {
    /**
     * @param {ExcelClone} excel - reference to the main ExcelClone instance
     * @param {HTMLCanvasElement} canvas - the canvas DOM element
     */
    constructor(excel, canvas) {
        /**@type {ExcelClone} */
        this.excel = excel;
        
        this.canvas = canvas;
        this.handlers = [];
        this.activeHandler = null;
    }

    registerHandler(handler) {
        this.handlers.push(handler);
    }

    registerAll() {
        this.canvas.addEventListener('pointerdown', this._onPointerDown.bind(this));
        // console.log(this);
        
        window.addEventListener('pointermove', this._onPointerMove.bind(this));
        window.addEventListener('pointerup', this._onPointerUp.bind(this));
    }

    _onPointerDown(e) {
        if (e.button === 2) return;
        this.excel.autoScroller.start();

        for (const handler of this.handlers) {
            if (handler.hitTest(e)) {
                this.activeHandler = handler;
                handler.onPointerDown(e);
                break;
            }
        }
    }

    _onPointerMove(e) {
  

        let hoverCursor = 'default';
        for (const handler of this.handlers) {
            if (typeof handler.getCursor === 'function' && handler.hitTest(e)) {
                hoverCursor = handler.getCursor() || 'default';
                break;
            }
        }
        this.canvas.style.cursor = hoverCursor;
    


        const rect = this.canvas.getBoundingClientRect();

        const x = e.clientX-rect.left;
        const y = e.clientY-rect.top;

        this.excel.autoScroller.lastMouseX = x;
        this.excel.autoScroller.lastMouseY = y;

        if (this.excel.selection?.isSelecting) {
            this.excel.autoScroller.updateEdge(x, y);

            const row = this.excel.getRowFromY(y);
            const col = this.excel.getColFromX(x);
            const prevEnd = this.excel.selection.end || {};

            if (this.excel.selection.type === 'col' && col) {
                if (prevEnd.col !== col.col) {
                    this.excel.selection.end = { row: 0, col: col.col };
                    this.excel.scheduleRender?.();
                }
            } else if (this.excel.selection.type === 'row' && row) {
                if (prevEnd.row !== row.row) {
                    this.excel.selection.end = { row: row.row, col: 0 };
                    this.excel.scheduleRender?.();
                }
            } else if (row && col) {
                if (prevEnd.row !== row.row || prevEnd.col !== col.col) {
                    this.excel.selection.end = { row: row.row, col: col.col };
                    this.excel.scheduleRender?.();
                }
            }
        }

        if (this.activeHandler) {
            this.activeHandler.onPointerMove(e);
        }
    }



    _onPointerUp(e) {
        this.excel.autoScroller.stop();

        if (this.activeHandler) {
            this.activeHandler.onPointerUp(e);
            this.activeHandler = null;
        }
    }
}
