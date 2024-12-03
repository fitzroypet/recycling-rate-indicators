// Utility functions for data manipulation and shared operations
const dataUtils = {
    // Format numbers for display
    formatNumber: d3.format(","),
    
    // Format percentage values
    formatPercent: d3.format(".1%"),
    
    // Color scales for different metrics
    colorScales: {
        'RecyclingRates_EPIWasteRecoveryRateScore_2024': d3.scaleSequential(d3.interpolateGreens).domain([0, 100]),
        'RecyclingRates_EPIRecyclingScore_2022': d3.scaleSequential(d3.interpolateBlues).domain([0, 100])
    },
    
    // Get current selected metric value
    getCurrentMetric: () => {
        const selector = document.getElementById('metricSelector');
        return selector.value;  // Returns display name like "Recycling Score (2022)"
    },
    
    // Get metric property name for data access
    getMetricProperty: (displayName) => {
        const mapping = {
            'Waste Recovery Rate (2024)': 'RecyclingRates_EPIWasteRecoveryRateScore_2024',
            'Recycling Score (2022)': 'RecyclingRates_EPIRecyclingScore_2022'
        };
        return mapping[displayName];
    },
    
    // Get color scale for a metric
    getColorScale: (displayName) => {
        const propertyName = dataUtils.getMetricProperty(displayName);
        return dataUtils.colorScales[propertyName];
    },
    
    // Get current selected continent
    getCurrentContinent: () => document.getElementById('continentSelector').value,
    
    // Helper function to get metric display name
    getMetricDisplayName: (metric) => {
        const mapping = {
            'RecyclingRates_EPIWasteRecoveryRateScore_2024': 'Waste Recovery Rate (2024)',
            'RecyclingRates_EPIRecyclingScore_2022': 'Recycling Score (2022)'
        };
        return mapping[metric] || metric;
    }
};

export default dataUtils; 