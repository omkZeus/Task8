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
             let top=null;
            let bottom=null;

            for (let row = startRow; row < startRow + visibleRows; row++) {
                const height = this.excel.getRowHeight(row);
                if (row >= minRow && row <= maxRow) {
                    ctx.fillRect(this.excel.headerWidth, y, rect.width - this.excel.headerWidth, height);
                    // ctx.strokeRect(0, y, rect.width - this.excel.headerWidth, height);
                    if(top==null) top=y;
                    bottom= y+ height
                }
                y += height;
            }

            if(top!==null && bottom!==null){
                    ctx.strokeRect(0, top,rect.width ,bottom-top);
                    // console.log(left, right);
                    
            } 
        } else if (selection.type === 'col') {
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            let x = this.excel.headerWidth;
            let left=null;
            let right=null;
            for (let col = startCol; col < startCol + visibleCols; col++) {
                const width = this.excel.getColWidth(col);
                if (col >= minCol && col <= maxCol) {

                    ctx.fillRect(x, this.excel.headerHeight, width, rect.height - this.excel.headerHeight);
                    // ctx.strokeRect(x, 0, width, rect.height);
                    if(left==null){
                        left=x;
                    }
                    right= x+width;


                }
                x += width;
                

            }
            //  console.log(minCol, minColDist, x);

            if(left!==null && right!==null){
                    ctx.strokeRect(left, 0, right-left, rect.height);
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
                          if (row === start.row && col === start.col){
                                anchorCellRect = cellRect;
                          }
                            else {
                            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
                        }
                   

                    }
                }
            }
            for (let row = minRow; row <= maxRow; row++) {
                sumHeight += this.excel.getRowHeight(row)
            }
            for (let col = minCol; col <= maxCol; col++) {
                sumWidth += this.excel.getColWidth(col)
            }
            const cellRect = this.excel.getCellRect(minRow, minCol);
            ctx.strokeRect(cellRect.x, cellRect.y, sumWidth, sumHeight);


        }

        // this.excel.updateStats();
        setTimeout(() => this.excel.updateStats(), 0);
    }
}
