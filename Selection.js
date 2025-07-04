// Selection.js

export class Selection {
    /**
     * Initializes the Selection object
     * @param {ExcelClone} excel Reference to ExcelClone instance
     **/
    constructor(excel) {
        this.excel = excel;
      
    }

    drawSelection() {
        const { ctx, canvas, selection, startRow, startCol, visibleRows, visibleCols, render } = this.excel;
        if (!selection.start) return;

        const start = selection.start;
        const end = selection.end || start;

        ctx.fillStyle = 'rgba(76, 240, 98, 0.05)';
        ctx.strokeStyle = '#137E43';
        ctx.lineWidth = 2;
        const rect = canvas.getBoundingClientRect();

        if (selection.type === 'row') {
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            let y = this.excel.headerHeight;
            let top = null;
            let bottom = null;
            let anchor=null;
            for (let row = startRow; row < startRow + visibleRows; row++) {
                const height = this.excel.getRowHeight(row);
                if (row >= minRow && row <= maxRow) {
                    if(!anchor){
                        ctx.fillRect(this.excel.headerWidth + this.excel.getColWidth(this.excel.startCol), y, rect.width - this.excel.headerWidth - this.excel.getColWidth(this.excel.startCol), height);
                        anchor=true;
                    }
                    else{
                        ctx.fillRect(this.excel.headerWidth , y, rect.width - this.excel.headerWidth, height);

                    }
                    // ctx.strokeRect(0, y, rect.width - this.excel.headerWidth, height);
                    if (top == null) top = y;
                    bottom = y + height
                }
                y += height;
            }

            if (top !== null && bottom !== null) {
                ctx.strokeRect(0, top, rect.width, bottom - top);

                 ctx.fillStyle = 'rgba(73, 199, 128, 0.3)';
                ctx.fillRect(this.excel.headerWidth,0,rect.width, this.excel.headerHeight);


                // Draw bottom border under top header highlight
                ctx.beginPath();
                ctx.moveTo(this.excel.headerWidth, this.excel.headerHeight);
                ctx.lineTo(rect.width, this.excel.headerHeight);
                ctx.stroke();
                // console.log(left, right);

            }
        } else if (selection.type === 'col') {
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            let x = this.excel.headerWidth;
            let left = null;
            let right = null;
            let anchor=null;
            for (let col = startCol; col < startCol + visibleCols; col++) {
                const width = this.excel.getColWidth(col);
                if (col >= minCol && col <= maxCol) {
                    if(!anchor){

                        ctx.fillRect(x, this.excel.headerHeight + this.excel.getRowHeight(this.excel.startRow), width, rect.height - this.excel.headerHeight - this.excel.getRowHeight(this.excel.startRow));
                        anchor=true;
                    }
                    else{
                        ctx.fillRect(x, this.excel.headerHeight , width, rect.height - this.excel.headerHeight );
                        
                    }
                    // ctx.strokeRect(x, 0, width, rect.height);
                    if (left == null) {
                        left = x;
                    }
                    right = x + width;


                }
                x += width;


            }
            //  console.log(minCol, minColDist, x);

            if (left !== null && right !== null) {
                ctx.strokeRect(left, 0, right - left, rect.height);
                ctx.fillStyle = 'rgba(73, 199, 128, 0.3)';
                ctx.fillRect(0,this.excel.headerHeight, this.excel.headerWidth, rect.height);

                ctx.lineWidth = 2;

                // Draw right border beside left header highlight
                ctx.beginPath();
                ctx.moveTo(this.excel.headerWidth, this.excel.headerHeight);
                ctx.lineTo(this.excel.headerWidth, rect.height);
                ctx.stroke();

                // console.log(left, right);

            }


        }
        else {
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            let sumWidth = 0;
            let sumHeight = 0;
            let anchorCellRect = null;

            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    if (row >= startRow && row < startRow + visibleRows &&
                        col >= startCol && col < startCol + visibleCols) {
                        const cellRect = this.excel.getCellRect(row, col);


                        // if (row != minRow || col != minCol) {
                        if (row === start.row && col === start.col) {
                            anchorCellRect = cellRect;
                        }
                        else {
                            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);

                        }


                    }
                }
            }
            const visibleMinRow = Math.max(minRow, startRow);
            const visibleMaxRow = Math.min(maxRow, startRow + visibleRows - 1);
            const visibleMinCol = Math.max(minCol, startCol);
            const visibleMaxCol = Math.min(maxCol, startCol + visibleCols - 1);

            let strokeWidth = 0;
            let strokeHeight = 0;

            for (let col = visibleMinCol; col <= visibleMaxCol; col++) {
                strokeWidth += this.excel.getColWidth(col);
            }
            for (let row = visibleMinRow; row <= visibleMaxRow; row++) {
                strokeHeight += this.excel.getRowHeight(row);
            }

            // Only draw stroke if the top-left of the selection is actually visible
            if (
                visibleMinRow <= visibleMaxRow &&
                visibleMinCol <= visibleMaxCol
            ) {
                const strokeOrigin = this.excel.getCellRect(visibleMinRow, visibleMinCol);
                ctx.strokeRect(strokeOrigin.x, strokeOrigin.y, strokeWidth, strokeHeight);
                ctx.fillStyle = 'rgba(73, 199, 128, 0.3)';
                ctx.fillRect(strokeOrigin.x, 0, strokeWidth, this.excel.headerHeight);
                ctx.fillRect(0, strokeOrigin.y, this.excel.headerWidth, strokeHeight);

                ctx.lineWidth = 2;

                // Draw bottom border under top header highlight
                ctx.beginPath();
                ctx.moveTo(strokeOrigin.x, this.excel.headerHeight);
                ctx.lineTo(strokeOrigin.x + strokeWidth, this.excel.headerHeight);
                ctx.stroke();

                // Draw right border beside left header highlight
                ctx.beginPath();
                ctx.moveTo(this.excel.headerWidth, strokeOrigin.y);
                ctx.lineTo(this.excel.headerWidth, strokeOrigin.y + strokeHeight);
                ctx.stroke();

            }



        }

        // this.excel.updateStats();
        // Use debounced stats update instead of immediate
        this.excel.scheduleStatsUpdate();

    }
}
