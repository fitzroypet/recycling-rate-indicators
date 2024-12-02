import unittest
import pandas as pd
import json
import os

class TestDataProcessing(unittest.TestCase):
    def setUp(self):
        self.processed_data_path = 'data/processed'
        
    def test_map_data_structure(self):
        """Test if map data has correct GeoJSON structure"""
        with open(f'{self.processed_data_path}/map_data.json', 'r') as f:
            data = json.load(f)
            
        self.assertIn('type', data)
        self.assertEqual(data['type'], 'FeatureCollection')
        self.assertIn('features', data)
        self.assertTrue(len(data['features']) > 0)
        
    def test_bar_chart_data(self):
        """Test if bar chart data has required columns"""
        with open(f'{self.processed_data_path}/recycling_by_country.json', 'r') as f:
            data = json.load(f)
            
        required_fields = [
            'country',
            'RecyclingRates_EPIWasteRecoveryRateScore_2024',
            'RecyclingRates_EPIRecyclingScore_2022',
            'continent'
        ]
        
        self.assertTrue(len(data) > 0)
        for field in required_fields:
            self.assertIn(field, data[0])
            
    def test_bubble_chart_data(self):
        """Test if bubble chart data has required columns and valid ranges"""
        with open(f'{self.processed_data_path}/correlation_data.json', 'r') as f:
            data = pd.read_json(f)
            
        required_columns = [
            'country',
            'density',
            'population',
            'gdpPerCapita',
            'RecyclingRates_EPIWasteRecoveryRateScore_2024',
            'RecyclingRates_EPIRecyclingScore_2022',
            'continent'
        ]
        
        # Check columns exist
        for col in required_columns:
            self.assertIn(col, data.columns)
            
        # Check for valid ranges
        self.assertTrue((data['density'] >= 0).all())
        self.assertTrue((data['population'] >= 0).all())
        self.assertTrue((data['gdpPerCapita'] >= 0).all())

if __name__ == '__main__':
    unittest.main() 