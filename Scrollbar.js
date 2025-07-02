// Scrollbar.js

export class Scrollbar {
    /**
     * Initializes the Scrollbar object
     * @param {ExcelClone} excel Reference to ExcelClone instance
     **/
    constructor(excel) {
        this.excel = excel;
        this.isDragging = false;
        this.dragType = null;
        this.dragStart = 0;
        this.scrollStart = 0;

        this.attachEvents();
    }

    updateScrollbars() {
        const { container, vScrollbar, hScrollbar, vThumb, hThumb, maxRows, maxCols, rowHeight, colWidth, scrollX, scrollY, scrollbarWidth } = this.excel;
        const rect = container.getBoundingClientRect();
        const canvasHeight = rect.height - scrollbarWidth;
        const canvasWidth = rect.width - scrollbarWidth;

        // Vertical
        const totalHeight = maxRows * rowHeight;
        const visibleRatioY = canvasHeight / totalHeight;
        const thumbHeight = Math.max(20, visibleRatioY * canvasHeight);
        const maxScrollY = totalHeight - canvasHeight;
        const thumbTop = maxScrollY > 0 ? (scrollY / maxScrollY) * (canvasHeight - thumbHeight) : 0;

        vThumb.style.height = `${thumbHeight}px`;
        vThumb.style.top = `${thumbTop}px`;

        // Horizontal
        const totalWidth = maxCols * colWidth;
        const visibleRatioX = canvasWidth / totalWidth;
        const thumbWidth = Math.max(20, visibleRatioX * canvasWidth);
        const maxScrollX = totalWidth - canvasWidth;
        const thumbLeft = maxScrollX > 0 ? (scrollX / maxScrollX) * (canvasWidth - thumbWidth) : 0;

        hThumb.style.width = `${thumbWidth}px`;
        hThumb.style.left = `${thumbLeft}px`;
    }

    attachEvents() {
        const { vThumb, hThumb, container, scrollbarWidth, canvas } = this.excel;

        const startDrag = (e, type) => {
            this.isDragging = true;
            this.dragType = type;
            this.dragStart = type === 'vertical' ? e.clientY : e.clientX;
            this.scrollStart = type === 'vertical' ? this.excel.scrollY : this.excel.scrollX;

            const thumb = type === 'vertical' ? vThumb : hThumb;
            thumb.classList.add('dragging');

            e.preventDefault();
        };

        vThumb.addEventListener('mousedown', e => startDrag(e, 'vertical'));
        hThumb.addEventListener('mousedown', e => startDrag(e, 'horizontal'));

        document.addEventListener('mousemove', e => {
            if (!this.isDragging) return;

            const rect = container.getBoundingClientRect();
            if (this.dragType === 'vertical') {
                const canvasHeight = rect.height - scrollbarWidth;
                const totalHeight = this.excel.maxRows * this.excel.rowHeight;
                const deltaY = e.clientY - this.dragStart;
                const scrollRatio = deltaY / canvasHeight;
                this.excel.scrollY = Math.max(0, Math.min(totalHeight - canvasHeight, this.scrollStart + scrollRatio * totalHeight));
            } else {
                const canvasWidth = rect.width - scrollbarWidth;
                const totalWidth = this.excel.maxCols * this.excel.colWidth;
                const deltaX = e.clientX - this.dragStart;
                const scrollRatio = deltaX / canvasWidth;
                this.excel.scrollX = Math.max(0, Math.min(totalWidth - canvasWidth, this.scrollStart + scrollRatio * totalWidth));
            }

            this.excel.render();
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                vThumb.classList.remove('dragging');
                hThumb.classList.remove('dragging');
                this.dragType = null;
            }
        });
    }
}
