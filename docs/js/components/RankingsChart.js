import BaseVisualization from './BaseVisualization.js';
import dataUtils from '../utils/dataUtils.js';

class RankingsChart extends BaseVisualization {
    constructor(containerId) {
        super(containerId);
        console.log('Initializing RankingsChart');
        
        // Set initial dimensions
        this.width = this.svg.node().getBoundingClientRect().width;
        this.height = 600;
        this.margin = { top: 70, right: 80, bottom: 40, left: 150 };
        
        // Create chart group
        this.chartGroup = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
            
        // Add legend group
        this.legendGroup = this.svg.append('g')
            .attr('class', 'legend')
            //.attr('transform', `translate(20, ${this.height - 40})`);
            .attr('transform', `translate(${this.width - 220}, 40)`);

        // Initialize scales
        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleBand().padding(0.2);
        
        // Add axes groups
        this.xAxis = this.chartGroup.append('g')
            .attr('class', 'x-axis');
        this.yAxis = this.chartGroup.append('g')
            .attr('class', 'y-axis');
            
        // Initialize tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
            
        // Load data
        this.loadData();
    }
    
    async loadData() {
        try {
            // Log the data loading attempt
            console.log('Loading rankings data...');
            
            // Use the same data source as the map
            const response = await fetch('./data/processed/map_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const mapData = await response.json();
            console.log('Raw data loaded:', mapData);
            
            // Extract and transform the data we need
            this.data = mapData.features
                .map(f => ({
                    name: f.properties.name,
                    continent: f.properties.continent,
                    recyclingScore: f.properties.RecyclingRates_EPIRecyclingScore_2022,
                    wasteRecoveryRate: f.properties.RecyclingRates_EPIWasteRecoveryRateScore_2024
                }))
                .filter(d => d.name && (d.recyclingScore != null || d.wasteRecoveryRate != null));
            
            console.log('Transformed data:', this.data);
            this.update();
        } catch (error) {
            console.error('Error loading rankings data:', error);
            this.showError('Error loading data: ' + error.message);
        }
    }
    
    update() {
        if (!this.data || !this.data.length) {
            console.error('No data available for rankings chart');
            return;
        }
        
        const currentMetric = dataUtils.getCurrentMetric();
        const currentContinent = dataUtils.getCurrentContinent();
        
        // Get the correct data property based on the metric
        const dataProperty = currentMetric === 'Recycling Score (2022)' ? 'recyclingScore' : 'wasteRecoveryRate';
        
        console.log('Updating chart with metric:', currentMetric, 'property:', dataProperty);
        
        // Filter and sort data
        let filteredData = this.data
            .filter(d => d[dataProperty] != null)
            .sort((a, b) => b[dataProperty] - a[dataProperty]);
            
        if (currentContinent !== 'all') {
            filteredData = filteredData.filter(d => d.continent === currentContinent);
        }
        
        console.log('Filtered data:', filteredData);
        
        // Rest of the update code remains the same...
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = Math.max(filteredData.length * 25, 400);
        
        // Update SVG height
        this.svg
            .attr('height', chartHeight + this.margin.top + this.margin.bottom)
            .attr('viewBox', `0 0 ${this.width} ${chartHeight + this.margin.top + this.margin.bottom}`);
        
        // Update scales
        this.xScale
            .domain([0, 100])
            .range([0, chartWidth]);
            
        this.yScale
            .domain(filteredData.map(d => d.name))
            .range([0, chartHeight]);
            
        // Update axes
        this.xAxis
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(this.xScale)
                .ticks(5)
                .tickFormat(d => d + '%'));
                
        this.yAxis
            .call(d3.axisLeft(this.yScale));
            
        // Update bars
        const bars = this.chartGroup.selectAll('.bar')
            .data(filteredData, d => d.name);
            
        bars.exit().remove();
        
        const barsEnter = bars.enter()
            .append('rect')
            .attr('class', 'bar');
            
        bars.merge(barsEnter)
            .transition()
            .duration(750)
            .attr('x', 0)
            .attr('y', d => this.yScale(d.name))
            .attr('width', d => this.xScale(d[dataProperty]))
            .attr('height', this.yScale.bandwidth())
            .attr('fill', d => dataUtils.getColorScale(currentMetric)(d[dataProperty]));
            
        // After updating bars, add legend
        this.updateLegend(currentMetric);
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
}

export default RankingsChart; 