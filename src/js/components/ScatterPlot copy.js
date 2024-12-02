import BaseVisualization from './BaseVisualization.js';
import dataUtils from '../utils/dataUtils.js';

class ScatterPlot extends BaseVisualization {
    constructor(containerId) {
        super(containerId);
        
        // Create chart group with margins
        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Initialize scales
        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();
        this.radiusScale = d3.scaleSqrt().range([4, 20]);
        
        // Add axes groups
        this.xAxis = this.chartGroup.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height - this.margin.top - this.margin.bottom})`);
            
        this.yAxis = this.chartGroup.append('g')
            .attr('class', 'y-axis');
            
        // Initialize tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
            
        // Replace both legend groups with a single one
        this.legendGroup = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 220}, 40)`);  // Position top-right
        
        // Load data
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('../data/processed/correlation_data.json');
            this.data = await response.json();
            console.log('Scatter plot data loaded:', this.data);
            this.update();
        } catch (error) {
            console.error('Error loading scatter plot data:', error);
        }
    }
    
    update() {
        if (!this.data) return;
        
        const currentMetric = dataUtils.getCurrentMetric();
        const propertyName = dataUtils.getMetricProperty(currentMetric);
        const currentContinent = dataUtils.getCurrentContinent();
        
        // Filter data based on continent
        let filteredData = currentContinent === 'all' 
            ? this.data 
            : this.data.filter(d => d.continent === currentContinent);
        
        // Calculate quartiles for GDP and density
        const gdpQuartiles = {
            q1: d3.quantile(filteredData.map(d => d.gdpPerCapita).sort(d3.ascending), 0.25),
            q3: d3.quantile(filteredData.map(d => d.gdpPerCapita).sort(d3.ascending), 0.75)
        };
        
        const densityQuartiles = {
            q1: d3.quantile(filteredData.map(d => d.density).sort(d3.ascending), 0.25),
            q3: d3.quantile(filteredData.map(d => d.density).sort(d3.ascending), 0.75)
        };
        
        // Calculate IQR and bounds
        const gdpIQR = gdpQuartiles.q3 - gdpQuartiles.q1;
        const densityIQR = densityQuartiles.q3 - densityQuartiles.q1;
        
        const gdpUpperBound = gdpQuartiles.q3 + (gdpIQR * 1.5);
        const densityUpperBound = densityQuartiles.q3 + (densityIQR * 1.5);
        
        // Filter out extreme outliers
        filteredData = filteredData.filter(d => 
            d.gdpPerCapita <= gdpUpperBound && 
            d.density <= densityUpperBound
        );
        
        // Update scales with filtered data
        this.xScale
            .domain([0, d3.max(filteredData, d => d.gdpPerCapita)])
            .range([0, this.width - this.margin.left - this.margin.right]);
            
        this.yScale
            .domain([0, d3.max(filteredData, d => d.density)])
            .range([this.height - this.margin.top - this.margin.bottom, 0]);
            
        this.radiusScale
            .domain([0, d3.max(filteredData, d => d[propertyName] || 0)]);
        
        // Update axes with formatted labels
        this.xAxis.call(d3.axisBottom(this.xScale)
            .ticks(5)
            .tickFormat(d => d3.format("$,.0f")(d)))
            .selectAll('text')  // Select all tick labels
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');  // Rotate labels
        
        this.yAxis.call(d3.axisLeft(this.yScale)
            .ticks(5)
            .tickFormat(d => d3.format(",.0f")(d)));
        
        // Update circles
        const circles = this.chartGroup.selectAll('circle')
            .data(filteredData);
            
        circles.exit().remove();
        
        const circlesEnter = circles.enter()
            .append('circle');
            
        circles.merge(circlesEnter)
            .transition()
            .duration(750)
            .attr('cx', d => this.xScale(d.gdpPerCapita || 0))
            .attr('cy', d => this.yScale(d.density || 0))
            .attr('r', d => this.radiusScale(d[propertyName] || 0))
            .attr('fill', d => dataUtils.getColorScale(currentMetric)(d[propertyName] || 0))
            .attr('opacity', 0.7);
            
        // Update tooltips
        this.chartGroup.selectAll('circle')
            .on('mouseover', (event, d) => {
                this.tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>${d.country}</strong><br/>
                        GDP per Capita: $${d3.format(",.0f")(d.gdpPerCapita)}<br/>
                        Population Density: ${d3.format(",.0f")(d.density)}/km²<br/>
                        ${currentMetric}: ${(d[propertyName] || 0).toFixed(1)}%
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.style('opacity', 0);
            });
            
        // Update axis labels
        this.chartGroup.selectAll('.axis-label').remove();
        
        // X-axis label
        this.chartGroup.append('text')
            .attr('class', 'axis-label')
            .attr('x', this.width / 2)
            .attr('y', this.height - this.margin.bottom + 40)
            .attr('text-anchor', 'middle')
            .text('GDP per Capita ($)');
            
        // Y-axis label
        this.chartGroup.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -this.height / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .text('Population Density (per km²)');
            
        // Adjust bottom margin if needed
        this.margin.bottom = 60;  // Increase bottom margin for rotated labels
        
        // Replace both legend updates with single call
        this.updateLegend(currentMetric, propertyName);
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
            .style('fill', '#000')  // Ensure text is visible
            .text(metric);
        
        // Create gradient
        const gradient = this.legendGroup.append('defs')
            .append('linearGradient')
            .attr('id', 'scatter-legend-gradient')
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
            .style('fill', 'url(#scatter-legend-gradient)')
            .style('stroke', '#999')  // Add border
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
}

export default ScatterPlot; 