class BaseVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        
        // Set default margins
        this.margin = { top: 40, right: 20, bottom: 60, left: 60 };
        
        // Get container dimensions
        const container = d3.select(containerId);
        const containerRect = container.node().getBoundingClientRect();
        this.width = containerRect.width;
        this.height = 500; // Fixed height for consistency
        
        // Create SVG element
        this.svg = container
            .append('svg')
            .attr('width', '100%')
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');
            
        // Add resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    handleResize() {
        const container = d3.select(this.containerId);
        const containerRect = container.node().getBoundingClientRect();
        this.width = containerRect.width;
        
        this.svg
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);
            
        if (this.update) {
            this.update();
        }
    }
    
    update() {
        // To be implemented by child classes
        console.warn('Update method not implemented');
    }
}

export default BaseVisualization; 