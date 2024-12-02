import ChoroplethMap from './components/ChoroplethMap.js';
import BarChart from './components/BarChart.js';
import ScatterPlot from './components/ScatterPlot.js';
import RankingsChart from './components/RankingsChart.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing visualizations...');
    
    // Initialize visualizations
    const map = new ChoroplethMap('#map-viz');
    const barChart = new BarChart('#bar-chart');
    const scatterPlot = new ScatterPlot('#scatter-plot');
    const rankingsChart = new RankingsChart('#rankings-chart');
    
    console.log('Rankings chart initialized:', rankingsChart);

    // Add event listeners for filters
    const metricSelector = document.getElementById('metricSelector');
    const continentSelector = document.getElementById('continentSelector');

    metricSelector.addEventListener('change', () => {
        console.log('Metric changed to:', metricSelector.value);
        map.update();
        barChart.update();
        scatterPlot.update();
        rankingsChart.update();
    });

    continentSelector.addEventListener('change', () => {
        console.log('Continent changed to:', continentSelector.value);
        map.update();
        barChart.update();
        scatterPlot.update();
        rankingsChart.update();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        map.handleResize();
        barChart.handleResize();
        scatterPlot.handleResize();
        rankingsChart.handleResize();
    });
}); 