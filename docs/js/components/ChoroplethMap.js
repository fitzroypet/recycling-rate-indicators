import BaseVisualization from './BaseVisualization.js';
import dataUtils from '../utils/dataUtils.js';

class ChoroplethMap extends BaseVisualization {
    constructor(containerId) {
        super(containerId);
        
        // Make map responsive
        this.svg
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', '0 0 960 700')
            .attr('preserveAspectRatio', 'xMidYMid meet');
        
        // Initialize map-specific properties
        this.projection = d3.geoMercator()
            .scale(150)
            .center([0, 20]);
            
        this.path = d3.geoPath().projection(this.projection);
        
        // Adjust map group position to accommodate title
        this.mapGroup = this.svg.append('g')
            .attr('transform', `translate(0, 200)`);
        
        // Adjust legend size and position
        this.legendGroup = this.svg.append('g')
            .attr('class', 'legend')
            //.attr('transform', `translate(20, ${this.height - 80})`);  // Adjust position
            .attr('transform', `translate(20, 600)`)
        // Initialize tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        
        // Load and render data
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('./data/processed/map_data.json');
            this.mapData = await response.json();
            console.log('Map data loaded:', this.mapData);
            this.update();
        } catch (error) {
            console.error('Error loading map data:', error);
        }
    }
    
    update() {
        if (!this.mapData) return;
        
        const currentMetric = dataUtils.getCurrentMetric();
        const currentContinent = dataUtils.getCurrentContinent();
        
        // Map the metric name to the correct property name
        const metricMapping = {
            'Recycling Score (2022)': 'RecyclingRates_EPIRecyclingScore_2022',
            'Waste Recovery Rate (2024)': 'RecyclingRates_EPIWasteRecoveryRateScore_2024'
        };
        
        const propertyName = metricMapping[currentMetric];
        
        // Debug log to check data
        console.log('Current metric:', currentMetric);
        console.log('Property name:', propertyName);
        
        // Draw map
        const countries = this.mapGroup
            .selectAll('path')
            .data(this.mapData.features);
            
        // Enter new paths
        const countriesEnter = countries.enter()
            .append('path');
            
        // Update all paths
        countries.merge(countriesEnter)
            .attr('d', this.path)
            .attr('fill', d => {
                const value = d.properties[propertyName];
                if (value === null || value === undefined) {
                    return '#ccc';
                }
                return dataUtils.getColorScale(currentMetric)(value);
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .style('opacity', d => {
                if (currentContinent === 'all') return 1;
                return d.properties.continent === currentContinent ? 1 : 0.3;
            })
            .on('mouseover', (event, d) => {
                const value = d.properties[propertyName];
                this.tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>${d.properties.name}</strong><br/>
                        Continent: ${d.properties.continent}<br/>
                        ${currentMetric}: 
                        ${(value || 0).toFixed(1)}%
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.style('opacity', 0);
            });
            
        // Remove old paths
        countries.exit().remove();
        
        // Update legend
        this.updateLegend(currentMetric, propertyName);
    }
    
    updateLegend(metric, propertyName) {
        const legendWidth = 200;  // Match other legends
        const legendHeight = 10;  // Match other legends
        
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
            .attr('id', 'map-legend-gradient')
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
            .style('fill', 'url(#map-legend-gradient)')
            .style('stroke', '#999')
            .style('stroke-width', '0.5px');
            
        // Add labels
        this.legendGroup.append('text')
            .attr('x', 0)
            .attr('y', -5)
            .style('font-size', '12px')
            .style('fill', '#000')  // Ensure text is visible
            .text('0%');
            
        this.legendGroup.append('text')
            .attr('x', legendWidth)
            .attr('y', -5)
            .attr('text-anchor', 'end')
            .style('font-size', '12px')
            .style('fill', '#000')  // Ensure text is visible
            .text('100%');
    }
}

export default ChoroplethMap; 