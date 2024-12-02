import pandas as pd
import numpy as np
import json
import os

class DataProcessor:
    def __init__(self):
        self.raw_data_path = 'data/raw'
        self.processed_data_path = 'data/processed'
        
        # Ensure processed directory exists
        if not os.path.exists(self.processed_data_path):
            os.makedirs(self.processed_data_path)
    
    def load_raw_data(self):
        """Load all raw data files"""
        # Load Population Density Data
        with open(f'{self.raw_data_path}/countries-by-population-density-2024.json', 'r') as f:
            self.density_data = pd.DataFrame(json.load(f))
        
        # Load Recycling Rates Data
        with open(f'{self.raw_data_path}/recycling-rates-by-country-2024.json', 'r') as f:
            self.recycling_data = pd.DataFrame(json.load(f))
        
        # Load World Countries (GeoJSON)
        with open(f'{self.raw_data_path}/world_countries.json', 'r') as f:
            self.geo_data = json.load(f)
        
        # Load GDP Data
        self.gdp_data = pd.read_csv(f'{self.raw_data_path}/world-gdp-data.csv')
        
        # Load Countries Data
        self.countries_data = pd.read_csv(f'{self.raw_data_path}/countries.csv')

    def create_map_data(self):
        """Create processed data for the choropleth map"""
        # Merge recycling data with geo data
        map_data = self.geo_data.copy()
        
        # Create a country name mapping for standardization
        country_name_mapping = {
            'United States of America': 'United States',  # Fix USA naming
            'USA': 'United States',
            'UK': 'United Kingdom',
            'United States': 'United States',  # Add this if needed
            'United Republic of Tanzania': 'Tanzania',
            'Democratic Republic of the Congo': 'Congo',
            'Republic of the Congo': 'Congo Republic'
        }
    
        # Select only the required columns and replace NaN with None
        recycling_subset = self.recycling_data[
            ['country', 
             'RecyclingRates_EPIRecyclingScore_2022',
             'RecyclingRates_EPIWasteRecoveryRateScore_2024']
        ].copy()
    
        # Create continent lookup from GDP data
        continent_lookup = self.gdp_data.set_index('country')['continent'].to_dict()
    
        # Replace NaN with None and create lookup dictionary
        recycling_subset = recycling_subset.replace({np.nan: None})
        recycling_lookup = recycling_subset.set_index('country').to_dict(orient='index')
    
        # Add recycling data and continent to features
        for feature in map_data['features']:
            country_name = feature['properties']['name']
            
            # Map the country name if it exists in our mapping
            mapped_name = country_name_mapping.get(country_name, country_name)
            
            # Update feature properties
            if mapped_name in recycling_lookup:
                # Add recycling data
                recycling_values = recycling_lookup[mapped_name]
                clean_values = {k: v for k, v in recycling_values.items() if v is not None}
                feature['properties'].update(clean_values)
                
                # Add continent information
                if mapped_name in continent_lookup:
                    feature['properties']['continent'] = continent_lookup[mapped_name]
        
            # Store both original and mapped names for reference
            feature['properties']['original_name'] = country_name
        feature['properties']['mapped_name'] = mapped_name
    
        # Debug print to verify USA mapping
        usa_data = next((f['properties'] for f in map_data['features'] if f['properties']['name'] == 'USA'), None)
        print("USA data after mapping:", usa_data)
    
        # Convert any remaining NaN values to None in the entire structure
        def clean_nan(obj):
            if isinstance(obj, dict):
                return {k: clean_nan(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_nan(item) for item in obj]
            elif isinstance(obj, float) and np.isnan(obj):
                return None
            return obj
        
        map_data = clean_nan(map_data)
        
        # Save processed map data
        with open(f'{self.processed_data_path}/map_data.json', 'w') as f:
            json.dump(map_data, f)

    def create_bar_chart_data(self):
        """Create processed data for the bar chart"""
        # Select only required columns from recycling data
        recycling_subset = self.recycling_data[
            ['country',
             'RecyclingRates_EPIRecyclingScore_2022',
             'RecyclingRates_EPIWasteRecoveryRateScore_2024']
        ].copy()
        
        # Merge recycling data with continent information
        bar_data = pd.merge(
            recycling_subset,
            self.gdp_data[['country', 'continent']],
            on='country',
            how='left'
        )
        
        # Create continent aggregates
        continent_data = bar_data.groupby('continent').agg({
            'RecyclingRates_EPIWasteRecoveryRateScore_2024': 'mean',
            'RecyclingRates_EPIRecyclingScore_2022': 'mean'
        }).reset_index()
        
        # Replace NaN with None for JSON serialization
        bar_data = bar_data.where(pd.notnull(bar_data), None)
        continent_data = continent_data.where(pd.notnull(continent_data), None)
        
        # Save both country-level and continent-level data
        bar_data.to_json(f'{self.processed_data_path}/recycling_by_country.json', 
                         orient='records',
                         default_handler=lambda x: None)
        
        continent_data.to_json(f'{self.processed_data_path}/recycling_by_continent.json', 
                              orient='records',
                              default_handler=lambda x: None)

    def create_bubble_chart_data(self):
        """Create processed data for the bubble chart"""
        # Merge density, recycling, and GDP data
        bubble_data = pd.merge(
            self.density_data,
            self.recycling_data,
            on='country',
            how='inner'
        )
        
        bubble_data = pd.merge(
            bubble_data,
            self.gdp_data[['country', 'gdpPerCapita', 'continent']],
            on='country',
            how='inner'
        )
        
        # Select relevant columns
        bubble_data = bubble_data[[
            'country',
            'density',
            'population',
            'gdpPerCapita',
            'RecyclingRates_EPIWasteRecoveryRateScore_2024',
            'RecyclingRates_EPIRecyclingScore_2022',
            'continent'
        ]]
        
        # Save processed data
        bubble_data.to_json(f'{self.processed_data_path}/correlation_data.json', orient='records')

    def process_all_data(self):
        """Process all data sets"""
        print("Loading raw data...")
        self.load_raw_data()
        
        print("Creating map data...")
        self.create_map_data()
        
        print("Creating bar chart data...")
        self.create_bar_chart_data()
        
        print("Creating bubble chart data...")
        self.create_bubble_chart_data()
        
        print("Data processing complete!")

if __name__ == "__main__":
    processor = DataProcessor()
    processor.process_all_data() 