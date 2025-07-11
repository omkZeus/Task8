// registerInteractionHandlers.js

import { TouchManager } from './TouchManager.js';
import { ColResizeHandler } from './ColResizeHandler.js';
import { RowResizeHandler } from './RowResizeHandler.js';
import { ColSelectionHandler } from './ColSelectionHandler.js';
import { RowSelectionHandler } from './RowSelectionHandler.js';
import { CellRangeSelectionHandler } from './CellRangeSelectionHandler.js';

/**
 * Initializes all interaction handlers and returns a TouchManager instance
 * @param {ExcelClone} excel - Main spreadsheet instance
 * @param {HTMLCanvasElement} canvas - The canvas element to bind listeners on
 * @returns {TouchManager}
 */
export function RegisterHandlers(excel, canvas) {
    const touchManager = new TouchManager(excel, canvas);

    touchManager.registerHandler(new ColResizeHandler(excel));
    touchManager.registerHandler(new RowResizeHandler(excel));
    touchManager.registerHandler(new ColSelectionHandler(excel));
    touchManager.registerHandler(new RowSelectionHandler(excel));
    touchManager.registerHandler(new CellRangeSelectionHandler(excel));

    touchManager.registerAll();
    return touchManager;
}
