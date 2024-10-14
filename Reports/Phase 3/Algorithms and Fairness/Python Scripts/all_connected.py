import networkx as nx
import matplotlib.pyplot as plt
import random


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
        pos = nx.bipartite_layout(G, nodes=[node for node in range(50)])
        nx.draw_networkx(G, pos, with_labels=True, node_color=[
                         'lightblue' if i < 100 else 'lightgreen' for i in range(100)])
        plt.show()


graph_vis = GraphVisualization()

for i in range(50):
    for j in range(50, 100):
        graph_vis.add_edge(i, j)

graph_vis.visualize()


graph_vis2 = GraphVisualization()

for i in range(50):
    for j in range(50, 100):
        if random.random() < 0.1:
            graph_vis2.add_edge(i, j)

graph_vis2.visualize()