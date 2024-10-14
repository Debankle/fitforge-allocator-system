import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

class GraphVisualization:
    def __init__(self):
        # visual will store all the edges in the graph
        self.visual = []
          
    def add_edge(self, a, b):
        # Adds an edge between team a and team b
        self.visual.append((a, b))
          
    def visualize(self):
        G = nx.Graph()
        G.add_edges_from(self.visual)
        nx.draw_networkx(G, with_labels=True)
        plt.show()


impact_dataframe = pd.read_excel(
    "IFB398 24se1 Project Allocation.xlsx", sheet_name="impact")
capability_dataframe = pd.read_excel(
    "IFB398 24se1 Project Allocation.xlsx", sheet_name="fit")
preference_dataframe = pd.read_excel(
    "IFB398 24se1 Project Allocation.xlsx", sheet_name="pref")

team_names = impact_dataframe.iloc[1:, 0].values
project_names = impact_dataframe.columns[2:]

impact_data = impact_dataframe.iloc[1:, 2:].to_numpy()
capability_data = capability_dataframe.iloc[1:, 2:].to_numpy()
preference_data = preference_dataframe.iloc[1:, 2:].to_numpy()

preference_scalar = 0.1


def normalize_b_values(b_values):
    return [b / np.max(b) for b in b_values]

def get_non_zero_indices(b_values):
    return [np.nonzero(team_b)[0] for team_b in b_values]

def get_top_50_percent_indices(b_values):
    # For each team, sort non-zero b values and get top 50%
    top_50_indices = []
    for team_b in b_values:
        non_zero_b = team_b[team_b > 0]  # Get non-zero values
        sorted_indices = np.argsort(non_zero_b)[::-1]  # Sort in descending order
        top_50_count = len(non_zero_b) // 5  # Calculate top 50% count
        top_indices = sorted_indices[:top_50_count]  # Get indices of top 50%
        top_50_indices.append(top_indices)
    return top_50_indices

def calculate_b_values(impact, capability, preference, pref_scalar):
    # Your existing function to calculate the b values
    return impact * (capability + pref_scalar * preference)

def calculate_overlap(b_values_matrix, threshold=80):
    # Normalize b values
    normalized_b_values = normalize_b_values(b_values_matrix)
    non_zero_indices = get_non_zero_indices(normalized_b_values)
    top_50_indices = get_top_50_percent_indices(normalized_b_values)
    
    team_count = len(b_values_matrix)
    graph_vis = GraphVisualization()
    
    for team1 in range(team_count):
        team1_top_50 = set(non_zero_indices[team1][top_50_indices[team1]])
        
        for team2 in range(team_count):
            if team1 == team2:
                continue
            
            team2_non_zero = set(non_zero_indices[team2])
            overlap_count = len(team1_top_50.intersection(team2_non_zero))
            overlap_percentage = (overlap_count / len(team1_top_50)) * 100 if len(team1_top_50) > 0 else 0
            
            # Add an edge only if overlap percentage is above the threshold
            if overlap_percentage >= threshold:
                graph_vis.add_edge(f'Team {team1+1}', f'Team {team2+1}')
    
    # Visualize the graph
    graph_vis.visualize()

# Example usage
b_values_matrix = calculate_b_values(impact_data, capability_data, preference_data, preference_scalar)
calculate_overlap(b_values_matrix, threshold=80)
calculate_overlap(b_values_matrix, threshold=100)