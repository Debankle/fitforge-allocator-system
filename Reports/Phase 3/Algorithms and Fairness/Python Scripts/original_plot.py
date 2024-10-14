import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

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


def calculate_b_values(impact, capability, preference):
    # No preference scalar adjustment
    return impact * (capability + 0.1 * preference)


def plot_team_scatter(msum):
    ax.clear()

    # Get the max non-zero values for sorting
    team_max_values = [max(msum[i, :][np.nonzero(msum[i, :])])
                       for i in range(len(team_names))]

    # Sort teams by the maximum `b` value
    sorted_teams_indices = np.argsort(team_max_values)[::-1]
    sorted_team_names = [team_names[i] for i in sorted_teams_indices]

    # Plot the scatter for each team, sorted by max `b` value
    for sorted_i, i in enumerate(sorted_teams_indices):
        team_b_values = msum[i, :]
        non_zero_projects = np.nonzero(team_b_values)[0]
        non_zero_values = team_b_values[non_zero_projects]
        if len(non_zero_values) > 0:
            ax.scatter(non_zero_values, [sorted_i] * len(non_zero_values),
                       c=non_zero_projects, cmap='viridis', s=5, label=sorted_team_names[sorted_i])

    ax.set_yticks(np.arange(len(sorted_team_names)))
    ax.set_yticklabels(sorted_team_names)
    ax.set_xlabel('B Values')
    ax.set_ylabel('Teams')
    ax.set_title('Scatter Plot of Non-Zero B Values by Team')
    plt.draw()


# Create figure and axis
fig, ax = plt.subplots(figsize=(10, 8))

matrix_sum = calculate_b_values(impact_data, capability_data, preference_data)
plot_team_scatter(matrix_sum)

# Display the plot
plt.show()
