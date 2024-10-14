import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.widgets import Slider, Button

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
sort_by_lambda = False


def calculate_b_values(impact, capability, preference, pref_scalar):
    return impact * (capability + pref_scalar * preference)


def plot_team_scatter(msum):
    ax.clear()

    lambdas = np.zeros(shape=(len(team_names), 1))
    team_max_values = [max(msum[i, :][np.nonzero(msum[i, :])])
                       for i in range(len(team_names))]

    for i in range(len(team_names)):
        team_b_values = msum[i, :]
        non_zero_projects = np.nonzero(team_b_values)[0]
        non_zero_values = team_b_values[non_zero_projects]
        if len(non_zero_values) > 0:
            non_zero_values = non_zero_values / max(non_zero_values)
            sd = np.std(non_zero_values)
            lambda_value = sd / len(non_zero_values)
            lambdas[i] = lambda_value

    if sort_by_lambda:
        sorted_teams_indices = np.argsort(lambdas.flatten())[::-1]
    else:
        sorted_teams_indices = np.argsort(team_max_values)[::-1]

    sorted_team_names = [team_names[i] for i in sorted_teams_indices]

    for sorted_i, i in enumerate(sorted_teams_indices):
        team_b_values = msum[i, :]
        non_zero_projects = np.nonzero(team_b_values)[0]
        non_zero_values = team_b_values[non_zero_projects]
        if len(non_zero_values) > 0:
            non_zero_values = non_zero_values / max(non_zero_values)
            ax.scatter(non_zero_values, [sorted_i] * len(non_zero_values),
                       c=non_zero_projects, cmap='viridis', s=5, label=sorted_team_names[sorted_i])

    if not hasattr(ax, 'ax2'):
        ax.ax2 = ax.twinx()
    ax.ax2.set_ylabel('Sigma (Urgency Coefficient)')
    ax.ax2.set_yticks(np.arange(len(sorted_team_names)))
    ax.ax2.set_yticklabels(
        np.around(lambdas[sorted_teams_indices], decimals=3))

    ax.set_yticks(np.arange(len(sorted_team_names)))
    ax.set_yticklabels(sorted_team_names)
    ax.set_xlabel('B Values')
    ax.set_ylabel('Teams')
    ax.set_title('Scatter Plot of Non-Zero B Values by Team')
    plt.draw()


def update(val):
    global preference_scalar
    preference_scalar = val
    matrix_sum = calculate_b_values(
        impact_data, capability_data, preference_data, preference_scalar)
    plot_team_scatter(matrix_sum)


def toggle_sorting(_):
    global sort_by_lambda
    sort_by_lambda = not sort_by_lambda
    button.label.set_text(
        'Sorting by Sigma' if sort_by_lambda else 'Sorting by Max B Value')
    matrix_sum = calculate_b_values(
        impact_data, capability_data, preference_data, preference_scalar)
    plot_team_scatter(matrix_sum)


# Create figure and axis
# Adjust figure size to allow more space for scatter plot
fig, ax = plt.subplots(figsize=(10, 8))
# Adjust bottom to make more space for controls
plt.subplots_adjust(left=0.1, right=0.9, top=0.95, bottom=0.2)

matrix_sum = calculate_b_values(
    impact_data, capability_data, preference_data, preference_scalar)
plot_team_scatter(matrix_sum)

ax_slider = plt.axes([0.1, 0.08, 0.45, 0.03],
                     facecolor='lightgoldenrodyellow')
slider = Slider(ax_slider, 'Preference Scalar',
                0.01, 1.0, valinit=preference_scalar)
slider.on_changed(update)

ax_button = plt.axes([0.6, 0.08, 0.3, 0.04])
button = Button(ax_button, 'Sorting by Max B Value')
button.on_clicked(toggle_sorting)

# Display the plot
plt.show()
