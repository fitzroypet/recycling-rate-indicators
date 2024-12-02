import pandas as pd
import json

def load_and_display_head(filename):
    print(f"\n{'='*50}")
    print(f"Dataset: {filename}")
    print(f"{'='*50}")
    
    try:
        if filename.endswith('.json'):
            with open(filename, 'r') as f:
                data = json.load(f)
                # Convert JSON to DataFrame for consistent display
                df = pd.DataFrame(data)
        else:  # CSV files
            df = pd.DataFrame(pd.read_csv(filename))
            
        print("\nFirst 5 rows:")
        print(df.head())
        
        print("\nColumns:")
        print(df.columns.tolist())
        
        print("\nData Info:")
        print(df.info())
        
    except Exception as e:
        print(f"Error loading {filename}: {str(e)}")

# List of files to examine
files = [
    'data/countries-by-population-density-2024.json',
    'data/recycling-rates-by-country-2024.json',
    'data/world_countries.json',
    'data/world-gdp-data.csv',
    'data/countries.csv'
]

# Process each file
for file in files:
    load_and_display_head(file)