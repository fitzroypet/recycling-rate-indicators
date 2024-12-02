# Global Recycling Indicators Dashboard

An interactive visualization dashboard exploring global recycling and waste management practices using D3.js.

## Overview

This project provides insights into global recycling and waste management through interactive visualizations. It aims to answer key research questions about regional performance, top-performing countries, and correlations with economic and demographic factors.

## Research Questions

1. **Regional Waste Management Performance**
   - **Visualization**: Choropleth map
   - **Metrics**: EPIWasteRecoveryRateScore_2024, EPIRecyclingScore_2022
   - **Features**: Interactive tooltips with detailed country information

2. **Top Performing Countries Analysis**
   - **Visualization**: Interactive bar chart
   - **Metrics**: Toggle between EPIWasteRecoveryRateScore_2024 and EPIRecyclingScore_2022
   - **Features**: Drill-down capability to explore country-level data within continents

3. **Correlation Analysis**
   - **Visualization**: Bubble chart
   - **Metrics**: GDP per capita, Population density, Recycling scores
   - **Features**: Toggle between different recycling metrics

## Project Structure

recycling-rate-indicators/
├── data/
│ ├── raw/ # Original data files
│ └── processed/ # Transformed JSON files
├── scripts/
│ ├── data_processing/ # Python data transformation scripts
│ └── tests/ # Data validation tests
├── src/
│ ├── assets/ # Images, icons
│ ├── styles/ # CSS files
│ ├── js/ # JavaScript files
│ └── index.html # Main entry point
└── README.md


## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fitzroypet/recycling-rate-indicators.git
   cd recycling-rate-indicators
   ```

2. **Process the data**:
   ```bash
   python scripts/data_processing/process_data.py
   ```

3. **Open the dashboard**:
   - Open `src/index.html` in a web browser

## Technologies Used

- **D3.js**: For data visualization
- **Python**: For data processing
- **HTML5/CSS3**: For layout and styling

## Data Sources

- **Countries by Population Density (2024)**
- **Recycling Rates by Country (2024)**
- **World GDP Data**
- **Geographic Data (GeoJSON)**

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.