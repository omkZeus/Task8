// ExcelClone.js 

import { Grid } from './Grid.js';
import { Selection } from './Selection.js';
import { Scrollbar } from './Scrollbar.js';
import { SheetOperations } from './SheetOperations.js';
import { ContextMenu } from './ContextMenu.js';
import { AutoScroller } from './AutoScroller.js';
import { RegisterHandlers } from './RegisterHandlers.js';
import { CommandManager } from './commands/CommandManager.js';
import { EditCellCommand } from './commands/EditCellCommand.js';



// import { Cell } from './Cell.js';

export class ExcelClone {
    /**
      * Initializes the ExcelClone object
      * @param {HTMLCanvasElement} canvas Canvas element to render the spreadsheet
      **/

    constructor({ Excelcontainer, canvas, cellInput, statsEl, container, vScrollbar, hScrollbar, vThumb, hThumb, undobtn, redobtn }) {
        this.Excelcontainer = Excelcontainer;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellInput = cellInput;
        this.statsEl = statsEl;
        this.container = container;
        this.vScrollbar = vScrollbar;
        this.hScrollbar = hScrollbar;
        this.vThumb = vThumb;
        this.hThumb = hThumb;
        this.undoBtn = undobtn
        this.redoBtn = redobtn

        // Grid configuration
        this.rowHeight = 22;
        this.colWidth = 71;
        this.headerHeight = 25;
        this.headerWidth = 50;

        // Spreadsheet size
        this.maxCols = 5000;
        this.maxRows = 100000;

        // Scroll positions
        this.scrollX = 0;
        this.scrollY = 0;
        this.visibleRows = 0;
        this.visibleCols = 0;
        this.startRow = 0;
        this.startCol = 0;

        this.autoScroller = new AutoScroller(this, this.canvas, () => this.scheduleRender());



        // State
        this.data = new Map();
        this.selection = { start: null, end: null, isSelecting: false, type: 'cell' };
        this.editingCell = null;
        this.activeCell = null;

        // Resizing
        this.isResizing = false;
        this.resizeType = null;
        this.resizeIndex = -1;
        this.resizeStartPos = 0;

        // Custom dimensions
        this.colWidths = new Map();
        this.rowHeights = new Map();

        // Scrollbars
        // this.vScrollbar = document.getElementById('vScrollbar');
        // this.hScrollbar = document.getElementById('hScrollbar');
        // this.vThumb = document.getElementById('vThumb');
        // this.hThumb = document.getElementById('hThumb');
        this.scrollbarWidth = 15;

        // Modules
        this.grid = new Grid(this);
        this.selectionRenderer = new Selection(this);
        this.scrollbar = new Scrollbar(this);

        //contextMenu
        this.contextMenu = new ContextMenu(this);

        //Sheet operations
        this.sheetOps = new SheetOperations(this);

        // Performance optimizations
        this.statsUpdateTimer = null;
        this.lastStatsSelection = null;


        //Smooth animation using req animation
        this._renderScheduled = false;

        //Command manager instance
        this.commandManager = new CommandManager();

        this.scheduleRender = () => {
            if (!this._renderScheduled) {
                this._renderScheduled = true;
                requestAnimationFrame(() => {
                    this.render();
                    this._renderScheduled = false;
                });
            }
        };



        this.setupCanvas();
        this.bindEvents();
        this.setupScrollbars();
        this.render();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;

        const updateSize = () => {
            const rect = this.container.getBoundingClientRect();
            console.log(rect.height)
            const canvasWidth = rect.width - this.scrollbarWidth;
            const canvasHeight = rect.height - this.scrollbarWidth;

            this.canvas.width = canvasWidth * dpr;
            this.canvas.height = canvasHeight * dpr;
            this.canvas.style.width = canvasWidth + 'px';
            this.canvas.style.height = canvasHeight + 'px';
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.ctx.font = '14px Arial';
            this.ctx.textBaseline = 'middle';

            this.visibleRows = Math.ceil((canvasHeight - this.headerHeight) / this.rowHeight) + 2;
            this.visibleCols = Math.ceil((canvasWidth - this.headerWidth) / this.colWidth) + 2;

            this.scrollbar.updateScrollbars();
            this.render();
        };

        updateSize();
        window.addEventListener('resize', updateSize);
    }

    getColWidth(col) {
        return this.colWidths.get(col) || this.colWidth;
    }

    setColWidth(col, width) {
        this.colWidths.set(col, Math.max(30, width));
    }

    getRowHeight(row) {
        return this.rowHeights.get(row) || this.rowHeight;
    }

    setRowHeight(row, height) {
        this.rowHeights.set(row, Math.max(15, height));
    }

    getCellKey(row, col) {
        return `${row},${col}`;
    }

    getCell(row, col) {
        return this.data.get(this.getCellKey(row, col)) || '';
    }

    setCell(row, col, value) {
        const key = this.getCellKey(row, col);
        if (value === '' || value == null) {
            this.data.delete(key);
        } else {
            this.data.set(key, value);
        }
    }

    getCellRect(row, col) {
        let x = this.headerWidth;
        for (let c = this.startCol; c < col; c++) {
            x += this.getColWidth(c);
        }

        let y = this.headerHeight;
        for (let r = this.startRow; r < row; r++) {
            y += this.getRowHeight(r);
        }

        return {
            x,
            y,
            width: this.getColWidth(col),
            height: this.getRowHeight(row)
        };
    }

    // Optimized stats update with debouncing and early exit
    updateStats() {
        const sel = this.selection;
        if (!sel.start) {
            this.statsEl.textContent = 'Ready';
            return;
        }

        const start = sel.start;
        const end = sel.end || start;

        let minRow = Math.min(start.row, end.row);
        let maxRow = Math.max(start.row, end.row);
        let minCol = Math.min(start.col, end.col);
        let maxCol = Math.max(start.col, end.col);

        // Check if selection hasn't changed to avoid unnecessary computation
        const selectionKey = `${sel.type}-${minRow}-${maxRow}-${minCol}-${maxCol}`;
        if (this.lastStatsSelection === selectionKey) {
            return;
        }
        this.lastStatsSelection = selectionKey;

        // Show progress for very large selections
        const selectionSize = (maxRow - minRow + 1) * (maxCol - minCol + 1);
        if (selectionSize > 50000) {
            this.statsEl.textContent = `Calculating stats for ${selectionSize} cells...`;

            // Use setTimeout to allow UI to update and prevent blocking
            setTimeout(() => {
                this.calculateStatsAsync(sel, minRow, maxRow, minCol, maxCol, selectionSize);
            }, 10);
            return;
        }

        // For smaller selections, calculate immediately
        this.calculateStatsSync(sel, minRow, maxRow, minCol, maxCol, selectionSize);
    }

    // Synchronous calculation for smaller selections
    calculateStatsSync(sel, minRow, maxRow, minCol, maxCol, selectionSize) {
        let count = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;
        let hasNumbers = false;

        // Optimized iteration - only check cells that could be in selection
        for (const [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);

            // Early exit if row/col is outside possible range
            if (sel.type === 'col') {
                if (col < minCol || col > maxCol) continue;
            } else if (sel.type === 'row') {
                if (row < minRow || row > maxRow) continue;
            } else {
                if (row < minRow || row > maxRow || col < minCol || col > maxCol) continue;
            }

            if (value !== '') {
                count++;
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    hasNumbers = true;
                    sum += num;
                    if (num < min) min = num;
                    if (num > max) max = num;
                }
            }
        }

        if (!hasNumbers) {
            this.statsEl.textContent = `Count: ${count} | Selection: ${selectionSize} `;
            return;
        }

        const avg = sum / count;
        this.statsEl.textContent =
            `Count: ${count} | Sum: ${sum.toFixed(2)} | Avg: ${avg.toFixed(2)} | Min: ${min} | Max: ${max} | Selection: ${selectionSize} cells`;
    }

    // Asynchronous calculation for large selections to prevent UI blocking
    calculateStatsAsync(sel, minRow, maxRow, minCol, maxCol, selectionSize) {
        let count = 0;
        let sum = 0;
        let min = Infinity;
        let max = -Infinity;
        let hasNumbers = false;
        let processed = 0;

        const dataEntries = Array.from(this.data.entries());
        const batchSize = 1000; // Process 1000 entries at a time

        const processBatch = (startIndex) => {
            const endIndex = Math.min(startIndex + batchSize, dataEntries.length);

            for (let i = startIndex; i < endIndex; i++) {
                const [key, value] = dataEntries[i];
                const [row, col] = key.split(',').map(Number);

                // Early exit if row/col is outside possible range
                if (sel.type === 'col') {
                    if (col < minCol || col > maxCol) continue;
                } else if (sel.type === 'row') {
                    if (row < minRow || row > maxRow) continue;
                } else {
                    if (row < minRow || row > maxRow || col < minCol || col > maxCol) continue;
                }

                if (value !== '') {
                    count++;
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                        hasNumbers = true;
                        sum += num;
                        if (num < min) min = num;
                        if (num > max) max = num;
                    }
                }
                processed++;
            }

            // Update progress
            if (processed % 5000 === 0) {
                const progress = Math.round((processed / dataEntries.length) * 100);
                this.statsEl.textContent = `Calculating... ${progress}% (${processed}/${dataEntries.length})`;
            }

            // Continue processing or finish
            if (endIndex < dataEntries.length) {
                setTimeout(() => processBatch(endIndex), 1); // Small delay to prevent blocking
            } else {
                // Finished processing
                if (!hasNumbers) {
                    this.statsEl.textContent = `Count: ${count} | Selection: ${selectionSize} cells`;
                    return;
                }

                const avg = sum / count;
                this.statsEl.textContent =
                    `Count: ${count} | Sum: ${sum.toFixed(2)} | Avg: ${avg.toFixed(2)} | Min: ${min} | Max: ${max} | Selection: ${selectionSize} cells`;
            }
        };

        processBatch(0);
    }

    // Debounced stats update
    scheduleStatsUpdate() {
        if (this.statsUpdateTimer) {
            clearTimeout(this.statsUpdateTimer);
        }
        this.statsUpdateTimer = setTimeout(() => {
            this.updateStats();
        }, 100); // 100ms debounce
    }




    render() {

        // const maxScrollY = this.maxRows * this.rowHeight;
        // const maxScrollX = this.maxCols * this.colWidth;

        // this.scrollY = Math.min(this.scrollY, maxScrollY);
        // this.scrollX = Math.min(this.scrollX, maxScrollX);

        const maxScrollY = this.maxRows * this.rowHeight - this.canvas.height;
        const maxScrollX = this.maxCols * this.colWidth - this.canvas.width;

        this.scrollY = Math.min(this.scrollY, maxScrollY);
        this.scrollX = Math.min(this.scrollX, maxScrollX);



        this.startRow = Math.min(Math.floor(this.scrollY / this.rowHeight), this.maxRows - 1);
        this.startCol = Math.min(Math.floor(this.scrollX / this.colWidth), this.maxCols - 1);



        this.grid.drawGrid();
        this.grid.drawHeaders();
        this.grid.drawCells();

        this.selectionRenderer.drawSelection();


        if (this.editingCell) {
            this.updateCellInputPosition();
        }

        this.scrollbar.updateScrollbars();
    }

    startCellEdit(row, col) {
        this.editingCell = { row, col };
        this.updateCellInputPosition();

        const value = this.getCell(row, col);
        this.cellInput.style.display = 'block';
        this.cellInput.value = value;
        this.cellInput.focus();
        this.cellInput.select();
    }

    updateCellInputPosition() {
        if (!this.editingCell) return;

        const { row, col } = this.editingCell;

        if (
            row < this.startRow || row >= this.startRow + this.visibleRows ||
            col < this.startCol || col >= this.startCol + this.visibleCols
        ) {
            this.cellInput.style.display = 'none';
            return;
        }

        const rect = this.getCellRect(row, col);
        this.cellInput.style.left = rect.x - 1 + 'px';
        this.cellInput.style.top = rect.y - 1 + 'px';
        this.cellInput.style.width = (rect.width - 10) + 'px';
        this.cellInput.style.height = (rect.height - 6) + 'px';
    }

    finishCellEdit() {
        if (!this.editingCell) return;

        const { row, col } = this.editingCell;
        const value = this.cellInput.value.trim();

        //oldval and newval for undo redo
        const oldValue = this.getCell(row, col);
        if (oldValue !== value) {
            const cmd = new EditCellCommand(this, row, col, oldValue, value);
            this.commandManager.executeCommand(cmd);
        }

        this.cellInput.style.display = 'none';
        this.editingCell = null;
        this.render();
    }

    scrollToCell(row, col) {
        const cellY = row * this.rowHeight;
        const cellX = col * this.colWidth;
        const rect = this.container.getBoundingClientRect();
        const canvasHeight = rect.height - this.scrollbarWidth - this.headerHeight;
        const canvasWidth = rect.width - this.scrollbarWidth - this.headerWidth;

        if (cellY < this.scrollY) {
            this.scrollY = cellY;
        } else if (cellY + this.rowHeight > this.scrollY + canvasHeight) {
            this.scrollY = cellY + this.rowHeight - canvasHeight;
        }

        if (cellX < this.scrollX) {
            this.scrollX = cellX;
        } else if (cellX + this.colWidth > this.scrollX + canvasWidth) {
            this.scrollX = cellX + this.colWidth - canvasWidth;
        }

        this.scrollX = Math.max(0, this.scrollX);
        this.scrollY = Math.max(0, this.scrollY);
    }

    handleArrowKey(key) {
        if (!this.activeCell) {
            this.activeCell = { row: 0, col: 0 };
        }

        let { row, col } = this.activeCell;

        switch (key) {
            case 'ArrowUp':
                row = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                row = Math.min(this.maxRows - 1, row + 1);
                break;
            case 'ArrowLeft':
                col = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                col = Math.min(this.maxCols - 1, col + 1);
                break;
        }

        this.activeCell = { row, col };
        this.selection.start = { row, col };
        this.selection.end = null;
        this.selection.type = 'cell';

        this.scrollToCell(row, col);
        this.render();
    }

    getColFromX(x) {
        let currentX = this.headerWidth;
        for (let col = this.startCol; col < this.startCol + this.visibleCols; col++) {
            const width = this.getColWidth(col);
            if (x >= currentX && x < currentX + width) {
                return { col, x: currentX, width };
            }
            currentX += width;
        }
        return null;
    }

    getRowFromY(y) {
        if (y < this.headerHeight) return null;
        let currentY = this.headerHeight;
        for (let row = this.startRow; row < this.startRow + this.visibleRows; row++) {
            const height = this.getRowHeight(row);
            if (y >= currentY && y < currentY + height) {
                return { row, y: currentY, height };
            }
            currentY += height;
        }
        return null;
    }

    bindEvents() {
        // Setup all pointer-based handlers
        this.touchManager = RegisterHandlers(this, this.canvas);

        // this.copyBtn = buttons.copyBtn || null;


        if (this.undoBtn) {
            console.log("Helllo");
            
            this.undoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.commandManager.undo();
            });
        }

        if (this.redoBtn) {
            this.redoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.commandManager.redo();
            });
        }

        // Keyboard Navigation / Cell Editing
        document.addEventListener('keydown', (e) => {
            // undo-redo shortcuts
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.commandManager.undo();
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.commandManager.redo();
            }

            if (this.editingCell) {
                if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    this.finishCellEdit();
                    if (this.activeCell) {
                        if (e.key === 'Enter') this.handleArrowKey('ArrowDown');
                        if (e.key === 'Tab') this.handleArrowKey('ArrowRight');
                    }
                } else if (e.key === 'Escape') {
                    this.cellInput.style.display = 'none';
                    this.editingCell = null;
                }
                return;
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.handleArrowKey(e.key);
            } else if (e.key === 'Enter' || e.key === 'F2') {
                e.preventDefault();
                if (this.activeCell) {
                    this.startCellEdit(this.activeCell.row, this.activeCell.col);
                }
            } else if (e.key === 'Delete') {
                const start = this.selection.start;
                const end = this.selection.end || start;
                const minRow = Math.min(start.row, end.row);
                const maxRow = Math.max(start.row, end.row);
                const minCol = Math.min(start.col, end.col);
                const maxCol = Math.max(start.col, end.col);

                for (let r = minRow; r <= maxRow; r++) {
                    for (let c = minCol; c <= maxCol; c++) {
                        this.setCell(r, c, '');
                    }
                }
                this.render();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (this.activeCell) {
                    const { row, col } = this.activeCell;
                    this.autoScroller.scrollToCell(row, col);
                    this.render();
                    this.startCellEdit(row, col);
                    this.cellInput.value = '';
                    this.cellInput.select();
                }
            }
        });

        // Double-click to edit cell
        this.canvas.addEventListener('dblclick', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (x < this.headerWidth || y < this.headerHeight) return;

            const row = this.getRowFromY(y);
            const col = this.getColFromX(x);
            if (row && col) {
                this.startCellEdit(row.row, col.col);
            }
        });

        // Right-click context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();


            console.log("cm fired");

            this.selection.isSelecting = false;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rowInfo = this.getRowFromY(y);
            const colInfo = this.getColFromX(x);

            let type = 'cell';
            if (x < this.headerWidth && y > this.headerHeight && rowInfo) {
                type = 'row';
            } else if (y < this.headerHeight && x > this.headerWidth && colInfo) {
                type = 'col';
            }

            const row = rowInfo?.row ?? 0;
            const col = colInfo?.col ?? 0;

            this.contextMenu.show(e.clientX, e.clientY, type, row, col);
        });

        // Mouse wheel scroll
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.shiftKey) {
                this.scrollX = Math.max(0, this.scrollX + e.deltaY);
            } else {
                this.scrollY = Math.max(0, this.scrollY + e.deltaY);
            }
            this.render();
        });

        // when Input blur then finish edit
        this.cellInput.addEventListener('blur', () => {
            this.finishCellEdit();
        });



    }



    setupScrollbars() {
        const rect = this.container.getBoundingClientRect();
        this.vScrollbar.style.height = (rect.height - this.scrollbarWidth) + 'px';
        this.hScrollbar.style.width = (rect.width - this.scrollbarWidth) + 'px';
        this.hScrollbar.style.right = this.scrollbarWidth + 'px';
        this.vScrollbar.style.bottom = this.scrollbarWidth + 'px';

        this.scrollbar.updateScrollbars();
    }

    loadData(jsonData) {
        this.data.clear();
        jsonData.forEach((record, rowIndex) => {
            Object.entries(record).forEach(([_, value], colIndex) => {
                this.setCell(rowIndex, colIndex, String(value));
            });
        });
        this.render();
    }
}






