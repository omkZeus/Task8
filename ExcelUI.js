// UIManager
export class ExcelUI {
    /**
     * @param {HTMLElement} rootEl The root container to build UI into
     * @param {Object} handlers Functions for button events
     */
    constructor(rootEl, handlers = {}) {
        this.rootEl = rootEl;

        // Build DOM
        this.container = document.createElement('div');
        this.container.className = 'container';

        this.toolbar = document.createElement('div');
        this.toolbar.className = 'toolbar';

        this.loadBtn = document.createElement('button');
        this.loadBtn.textContent = 'Load Data';
        this.loadBtn.onclick = handlers.loadData;

        this.clearBtn = document.createElement('button');
        this.clearBtn.textContent = 'Clear Data';
        this.clearBtn.onclick = handlers.clearData;

        this.stats = document.createElement('div');
        this.stats.id = 'stats';
        this.stats.className = 'stats';
        this.stats.textContent = 'Ready';

        this.toolbar.append(this.loadBtn, this.clearBtn, this.stats);

        this.canvasContainer = document.createElement('div');
        this.canvasContainer.id = 'canvasContainer';
        this.canvasContainer.className = 'canvas-container';

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';

        this.cellInput = document.createElement('input');
        this.cellInput.id = 'cellInput';
        this.cellInput.className = 'cell-input';
        this.cellInput.type = 'text';

        this.vScrollbar = document.createElement('div');
        this.vScrollbar.id = 'vScrollbar';
        this.vScrollbar.className = 'scrollbar-vertical';
        this.vThumb = document.createElement('div');
        this.vThumb.id = 'vThumb';
        this.vThumb.className = 'scroll-thumb';
        this.vScrollbar.appendChild(this.vThumb);

        this.hScrollbar = document.createElement('div');
        this.hScrollbar.id = 'hScrollbar';
        this.hScrollbar.className = 'scrollbar-horizontal';
        this.hThumb = document.createElement('div');
        this.hThumb.id = 'hThumb';
        this.hThumb.className = 'scroll-thumb';
        this.hScrollbar.appendChild(this.hThumb);

        this.canvasContainer.append(this.canvas, this.cellInput, this.vScrollbar, this.hScrollbar);

        this.container.append(this.toolbar, this.canvasContainer);
        this.rootEl.appendChild(this.container);
    }

    getElements() {
        return {
            canvas: this.canvas,
            cellInput: this.cellInput,
            statsEl: this.stats,
            container: this.canvasContainer,
            vScrollbar: this.vScrollbar,
            hScrollbar: this.hScrollbar,
            vThumb: this.vThumb,
            hThumb: this.hThumb
        };
    }
}