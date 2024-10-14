import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

class GraphVisualization:
    def __init__(self):
        self.visual = []
        self.nodes = set()
          
    def add_edge(self, a, b):
        self.visual.append((a, b))
        self.nodes.add(a)
        self.nodes.add(b)
        
    def add_node(self, node):
        self.nodes.add(node)
          
    def visualize(self):
        G = nx.Graph()
        G.add_edges_from(self.visual)
        G.add_nodes_from(self.nodes)
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

def calculate_b_values(impact, capability, preference, pref_scalar):
    return impact * (capability + pref_scalar * preference)

def normalize_b_values(b_values):
    return [b / np.max(b) for b in b_values]

def get_top_50_percent_indices(b_values):
    top_50_indices = []
    for team_b in b_values:
        non_zero_b = team_b[team_b > 0]
        sorted_indices = np.argsort(non_zero_b)[::-1]
        top_50_count = len(non_zero_b) // 2
        top_indices = sorted_indices[:top_50_count]
        top_50_indices.append(top_indices)
    return top_50_indices

def calculate_top_50_overlap(b_values_matrix):
    normalized_b_values = normalize_b_values(b_values_matrix)
    
    top_50_indices = get_top_50_percent_indices(normalized_b_values)
    
    team_count = len(b_values_matrix)
    overlap_matrix = np.zeros((team_count, team_count))
    
    for team1 in range(team_count):
        team1_top_50 = set(top_50_indices[team1])
        
        for team2 in range(team_count):
            if team1 == team2:
                continue
            
            team2_top_50 = set(top_50_indices[team2])
            overlap_count = len(team1_top_50.intersection(team2_top_50))
            
            overlap_percentage = (overlap_count / len(team1_top_50)) * 100 if len(team1_top_50) > 0 else 0
            overlap_matrix[team1][team2] = overlap_percentage
            
            # print(f"Team {team1+1} vs Team {team2+1} overlap (top 50%): {overlap_percentage}%")
    
    return overlap_matrix

def graph_overlap_matrix(overlap_matrix, threshold=50):
    graph_vis = GraphVisualization()
    
    team_count = len(overlap_matrix)
    
    for team1 in range(team_count):
        for team2 in range(team_count):
            if team1 != team2 and overlap_matrix[team1][team2] > threshold:
                graph_vis.add_edge(f'Team {team1+1}', f'Team {team2+1}')
    
    for team in range(team_count):
        graph_vis.add_node(f'Team {team+1}')
    
    graph_vis.visualize()

b_values_matrix = calculate_b_values(impact_data, capability_data, preference_data, preference_scalar)
overlap_matrix = calculate_top_50_overlap(b_values_matrix)
graph_overlap_matrix(overlap_matrix, threshold=80)