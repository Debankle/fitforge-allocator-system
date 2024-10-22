import pandas as pd
import matplotlib.pyplot as plt
from datetime import timedelta

def parse_time_string(time_str):
    if pd.isna(time_str):
        return 0.0
    try:
        parts = time_str.split(':')
        if len(parts) == 2:
            minutes, seconds = map(int, parts)
            return minutes * 60 + seconds
        elif len(parts) == 3:
            hours, minutes, seconds = map(int, parts)
            return hours * 3600 + minutes * 60 + seconds
    except ValueError:
        return 0.0

class Action(object):
    def __init__(self, time, action, team=None, project=None, missing=False):
        self.time = time
        self.action = action
        self.team = team
        self.project = project
        self.missing = missing

    def __repr__(self):
        return f"Action(time={self.time}, action={self.action}, team={self.team}, project={self.project}, missing={self.missing})\n"
    

#######################
## Read Pairing Data ##
#######################

alpha = 1 # capability scalar
beta = 0.1 # preference scalar

impact = pd.read_excel("IFB398 24se1 Project Allocation.xlsx", sheet_name="impact")
capability = pd.read_excel("IFB398 24se1 Project Allocation.xlsx", sheet_name="fit")
preference = pd.read_excel("IFB398 24se1 Project Allocation.xlsx", sheet_name="pref")

impact_dict = impact.set_index('team_id').to_dict('index')
capability_dict = capability.set_index('team_id').to_dict('index')
preference_dict = preference.set_index('team_id').to_dict('index')

b_values = {}

for team, impact_values in impact_dict.items():
    b_values[team] = {}

    for project in impact_values.keys():
        if project != 'impact':
            b_value = impact_values[project] * (alpha * capability_dict[team][project] + beta * preference_dict[team][project])
            b_values[team][project] = b_value;

##########################
## Read Experiment Data ##
##########################

df = pd.read_excel("R Studio Experiment Data.xlsx")
df['Time'] = df['Time'].apply(parse_time_string)

actions = [ Action(row["Time"], row["Action"], row["Team"], row["Project"], False if pd.isna(row["Missing"]) else True) for _, row in df.iterrows()]
actions.insert(0, Action(0, "Allocate", None, None, False))

allocations = [action for action in actions if action.action == 'Allocate']
removals = [action for action in actions if action.action == 'Remove']
graphs = [action for action in actions if action.action == 'Graph']
spreadsheets = [action for action in actions if action.action == 'Spreadsheet']
r = [action for action in actions if action.action == 'R']
data = [action for action in actions if action.action == 'Data']
missing_times = [action.time for action in actions if action.missing]

####################
## BURNDOWN CHART ##
####################

events = []
for action in allocations:
    events.append((action.time, 1))
for action in removals:
    events.append((action.time, -1))

events.sort(key=lambda x: x[0])

time_points = []
remaining_allocations = []
remaining = 0

for time_point, delta in events:
    time_points.append(time_point)
    remaining += delta
    remaining_allocations.append(remaining)

max_remaining = max(remaining_allocations, default=0)


#######################
## Spreadsheet Times ##
#######################
spreadsheets2 = spreadsheets.copy()
spreadsheet_times = [action.time for action in spreadsheets2]
r_times = []
time_diffs = []

last_spreadsheet_time = None

last_spreadsheet_time = None

for action in r:
    if last_spreadsheet_time is not None:
        time_diffs.append(action.time - last_spreadsheet_time)
        r_times.append(action.time)
        last_spreadsheet_time = None
    if spreadsheets2:
        last_spreadsheet_time = spreadsheets2.pop(0).time


##########################
## Time per Action Type ##
##########################

allocateTime = 0
removeTime = 0
spreadsheetTime = 0
graphTime = 0
Rtime = 0
dataTime = 0

for i in range(0,len(actions)-1):
    if actions[i].action == "Allocate":
        allocateTime = allocateTime + (actions[i+1].time - actions[i].time)
    elif actions[i].action == "Remove":
        removeTime = removeTime + (actions[i+1].time - actions[i].time)
    elif actions[i].action == "Graph":
        graphTime = graphTime + (actions[i+1].time - actions[i].time)
    elif actions[i].action == "Spreadsheet":
        spreadsheetTime = spreadsheetTime + (actions[i+1].time - actions[i].time)
    elif actions[i].action == "R":
        Rtime = Rtime + (actions[i+1].time - actions[i].time)
    elif actions[i].action == "Data":
        dataTime = dataTime + (actions[i+1].time - actions[i].time)

###############################
## Impact on remaining teams ##
###############################
goodness_scores = []
impact_scores = []
for action in allocations[1:]:
    try:
        goodness = b_values[f"T{int(action.team)}"][f"P{int(action.project)}"]
        goodness_scores.append(goodness)
        
        impact = 0
        for other_action in allocations[1:]:
            if other_action.team != action.team and other_action.project == action.project:
                potential_b_value = b_values[f"T{int(other_action.team)}"][f"P{int(other_action.project)}"]
                if potential_b_value > 0:
                    impact += (potential_b_value - goodness)
        impact_scores.append(impact)
    except:
        pass

######################
## Actions vs Score ##
######################

cycleStarted = True
count = 1
actionScore = []
for action in actions[1:]:
    if cycleStarted:
        if action.action == "Allocate":
            cycleStarted = False
            actionScore.append((count, b_values[f"T{int(action.team)}"][f"P{int(action.project)}"], action.team, action.project))
        else:
            count = count + 1
    else:
        if action.action == "R":
            cycleStarted = True
            count = 0

###############
## PLOT DATA ##
###############

plt.figure(figsize=(12, 12))

##############
## Burndown ##
##############
plt.subplot(2, 1, 1)
plt.plot(time_points, [max_remaining - x for x in remaining_allocations], marker='o', linestyle='-', color='b', label='Remaining Allocations')
for missing_time in missing_times:
    plt.axvline(x=missing_time, color='r', linestyle='--', label='Missing Action')
plt.xlim(0, max(time_points))
x_ticks = range(0, int(max(time_points)) + 1, 15 * 60)
plt.xticks(x_ticks, [str(timedelta(seconds=t)) for t in x_ticks], rotation=45)
plt.xlabel('Time')
plt.ylabel('Remaining Allocations')
plt.title('Burndown Chart of Remaining Allocations Over Time')
plt.grid(True)
plt.legend()

#########################
## Time in Spreadsheet ##
#########################
plt.subplot(2, 1, 2)
plt.plot(range(len(time_diffs)), time_diffs, marker='o', linestyle='-', color='g', label='Time Between Spreadsheet and R Actions')
plt.xlabel('Event Number')
plt.ylabel('Time Difference (seconds)')
plt.title('Time Between Spreadsheet and R Actions')
plt.grid(True)
plt.legend()

plt.tight_layout()
plt.show()


#####################
## Time per action ##
#####################
action_labels = ['Allocate', 'Remove', 'Spreadsheet', 'Graph', 'R', 'Data']
total_times = [allocateTime, removeTime, spreadsheetTime, graphTime, Rtime, dataTime]
average_times = [allocateTime/len(allocations), removeTime/len(removals), spreadsheetTime/len(spreadsheets), graphTime/len(graphs), Rtime/len(r), dataTime/len(data)]
fig,ax = plt.subplots()
bar_width = 0.35
index = range(6)
bars1 = ax.bar(index, total_times, bar_width, label='Total Time')
bars2 = ax.bar([i + bar_width for i in index], average_times, bar_width, label='Average Time per Action')
ax.set_xlabel('Actions')
ax.set_ylabel('Time (seconds)')
ax.set_title('Time Spent on Each Action')
ax.set_xticks([i + bar_width / 2 for i in index])
ax.set_xticklabels(action_labels)
ax.legend(loc='best')
plt.show()


############################
## Actions per allocation ##
############################
fig,ax = plt.subplots()
count = [c[0] for c in actionScore]
b = [b[1] for b in actionScore]
tooltips = [(b[2], b[3]) for b in actionScore]
scatter1 = ax.scatter(count, b)
ax.set_xlabel('Number of actions before allocating')
ax.set_ylabel('b value of allocation')
ax.set_title('Number of actions taken vs strength of pairing')
plt.show()


##########################
## Impact of Allocation ##
##########################
# allocation_indices = range(len(goodness_scores))
# plt.figure(figsize=(10, 6))
# plt.plot(allocation_indices, goodness_scores, label="Goodness of Allocation")
# plt.plot(allocation_indices, impact_scores, label="Impact on Other Pairings")
# plt.set_xlabel("Allocation Index")
# plt.set_ylabel("Scores")
# plt.set_title("Goodness vs Impact of Allocations")
# plt.legend()
# plt.show()