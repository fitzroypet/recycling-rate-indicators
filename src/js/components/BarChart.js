import BaseVisualization from './BaseVisualization.js';
import dataUtils from '../utils/dataUtils.js';

class BarChart extends BaseVisualization {
    constructor(containerId) {
        super(containerId);
        
        // Add back button (initially hidden) with updated positioning
        this.backButton = d3.select(containerId)
            .append('button')
            .attr('class', 'back-button')
            .style('display', 'none')
            .style('position', 'absolute')
            .style('top', '10px')
            .style('left', '10px')
            .html('← Back to Continents')
            .on('click', () => this.handleBackClick());
            
        // Increase margins for labels
        this.margin = { top: 40, right: 20, bottom: 100, left: 60 };
        
        // Initialize tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('padding', '10px')
            .style('border', '1px solid #ddd')
            .style('border-radius', '4px');
        
        // Initialize scales
        this.xScale = d3.scaleBand().padding(0.1);
        this.yScale = d3.scaleLinear();
        
        // Create chart group with updated margins
        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
            
        // Add axes groups
        this.xAxis = this.chartGroup.append('g')
            .attr('class', 'x-axis');
            
        this.yAxis = this.chartGroup.append('g')
            .attr('class', 'y-axis');
            
        // Add legend group
        this.legendGroup = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 220}, 40)`);  // Changed Y from 20 to 40
        
        // Load data
        this.loadData();
    }
    
    async loadData() {
        try {
            const [countryData, continentData] = await Promise.all([
                fetch('../data/processed/recycling_by_country.json').then(res => res.json()),
                fetch('../data/processed/recycling_by_continent.json').then(res => res.json())
            ]);
            
            this.countryData = countryData;
            this.continentData = continentData;
            this.currentView = 'continent';
            console.log('Bar chart data loaded:', { countryData, continentData });
            this.update();
        } catch (error) {
            console.error('Error loading bar chart data:', error);
        }
    }
    
    handleBackClick() {
        this.currentView = 'continent';
        document.getElementById('continentSelector').value = 'all';
        document.getElementById('continentSelector').dispatchEvent(new Event('change'));
        this.backButton.style('display', 'none');
    }
    
    updateLegend(metric, propertyName) {
        const legendWidth = 200;
        const legendHeight = 10;
        
        // Clear previous legend
        this.legendGroup.selectAll('*').remove();
        
        // Add title first (so it appears above the gradient)
        this.legendGroup.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#000')
            .text(metric);
        
        // Create gradient
        const gradient = this.legendGroup.append('defs')
            .append('linearGradient')
            .attr('id', 'bar-legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%');
            
        gradient.selectAll('stop')
            .data([0, 0.5, 1])
            .enter()
            .append('stop')
            .attr('offset', d => d * 100 + '%')
            .attr('stop-color', d => dataUtils.getColorScale(metric)(d * 100));
            
        // Add gradient rect with border
        this.legendGroup.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#bar-legend-gradient)')
            .style('stroke', '#999')
            .style('stroke-width', '0.5px');
            
        // Add labels
        this.legendGroup.append('text')
            .attr('x', 0)
            .attr('y', -5)
            .style('font-size', '12px')
            .text('0%');
            
        this.legendGroup.append('text')
            .attr('x', legendWidth)
            .attr('y', -5)
            .attr('text-anchor', 'end')
            .style('font-size', '12px')
            .text('100%');
    }
    
    update() {
        if (!this.continentData || !this.countryData) return;
        
        const currentMetric = dataUtils.getCurrentMetric();
        const propertyName = dataUtils.getMetricProperty(currentMetric);
        const currentContinent = dataUtils.getCurrentContinent();
        
        // Calculate chart dimensions
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Determine which data to show
        let data;
        if (currentContinent === 'all') {
            data = this.continentData
                .sort((a, b) => (b[propertyName] || 0) - (a[propertyName] || 0));
        } else {
            data = this.countryData
                .filter(d => d.continent === currentContinent)
                .sort((a, b) => (b[propertyName] || 0) - (a[propertyName] || 0))
                .slice(0, 10);
        }
        
        // Update scales
        this.xScale = d3.scaleBand()
            .domain(data.map(d => d.name || d.country || d.continent))
            .range([0, chartWidth])
            .padding(0.3);
            
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[propertyName] || 0) * 1.1])
            .range([chartHeight, 0]);
        
        // Update axes
        this.xAxis
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(this.xScale))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');
            
        this.yAxis
            .call(d3.axisLeft(this.yScale)
                .ticks(5)
                .tickFormat(d => d + '%'));
            
        // Add axis labels
        // Remove old labels first
        this.chartGroup.selectAll('.axis-label').remove();
        
        // Add Y axis label
        this.chartGroup.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -chartHeight / 2)
            .attr('y', -45)
            .style('text-anchor', 'middle')
            .style('fill', '#666')
            .text('Recycling Rate (%)');
        
        // Update bars
        const bars = this.chartGroup.selectAll('.bar')
            .data(data, d => d.name || d.country || d.continent);
        
        bars.exit().remove();
        
        const barsEnter = bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .style('cursor', currentContinent === 'all' ? 'pointer' : 'default');
        
        bars.merge(barsEnter)
            .transition()
            .duration(750)
            .attr('x', d => this.xScale(d.name || d.country || d.continent))
            .attr('y', d => this.yScale(d[propertyName] || 0))
            .attr('width', this.xScale.bandwidth())
            .attr('height', d => chartHeight - this.yScale(d[propertyName] || 0))
            .attr('fill', d => dataUtils.getColorScale(currentMetric)(d[propertyName] || 0));
        
        // Add tooltips and click handlers
        this.chartGroup.selectAll('.bar')
            .on('mouseover', (event, d) => {
                this.tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>${d.name || d.country || d.continent}</strong><br/>
                        ${currentMetric}: ${(d[propertyName] || 0).toFixed(1)}%
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.style('opacity', 0);
            })
            .on('click', (event, d) => {
                if (currentContinent === 'all') {
                    this.currentView = 'country';
                    document.getElementById('continentSelector').value = d.continent;
                    document.getElementById('continentSelector').dispatchEvent(new Event('change'));
                    this.backButton.style('display', 'block');
                }
            });
        
        // Show/hide back button based on view
        this.backButton.style('display', 
            currentContinent !== 'all' ? 'block' : 'none');
        
        // Add this at the end of the update method
        this.updateLegend(currentMetric, propertyName);
    }
}

export default BarChart; 