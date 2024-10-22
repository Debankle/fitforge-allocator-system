%% Generate Matrix Data:
% Result is some matrix c which is m teams by n projects
% Each element is compatability of team to project on some integer scale
% For the moment it's just preference as compatability
% Binary XOR and then sum is next thing to try
% Works for 20x7, i.e. 20 teams with 7 preferences each
% Fix size of c at initialisation - best we can do without better structure
% Implement for more projects than teams, i.e. meet the requirement at most
% one team per project
% Now solves when n>m but solves wrong - fix implementation of Aeq and
% Aineq
% Works for n >= m
clear,clc

T = readtable('sample_data.xlsx','Sheet','Sample_1');
original_matrix = table2array(T(:,2:end));

num_teams = size(original_matrix,1);
num_prefs = size(original_matrix,2);
num_projects = num_teams;

% No longer needed - working of table of direct values not ordered
% preferences
% Convert original data into team by project with preference as
% compatability for now
c = zeros(num_teams, num_projects);
for i=1:num_teams
    for j=1:num_teams
        val = num_prefs+1 - find(original_matrix(i,:)==j);
        if ~isempty(val)
            c(i,j) = val;
        end
    end
end

if num_projects > num_teams
    n = num_projects - num_teams;
    c(num_teams+1:num_teams+n, :) = 0;
end

%% Allocate teams to projects using Integer Programming
tic;
[m, n] = size(c); % m teams, n projects

f = -c(:); % Convert compatibility matrix into a column vector and negate for maximization

intcon = 1:(m*n); % Define integer variables (binary)

% Constraint: Each team must be assigned to exactly one project
Aeq = zeros(m, m*n); % Initialize equality constraint matrix
beq = ones(m, 1); % Initialize equality constraint vector for team assignments

for i = 1:m
    Aeq(i, (i-1)*n+1:i*n) = 1;
end

% Inequality Constraints: Each project can be assigned to at most one team
Aineq = zeros(n, m*n);
bineq = ones(n, 1);

for j = 1:n
    Aineq(j, j:m:m*n) = 1;
end

lb = zeros(m*n, 1); % Lower bound for variables
ub = ones(m*n, 1); % Upper bound for variables

[x, fval, exitflag] = intlinprog(f, intcon, Aineq, bineq, Aeq, beq, lb, ub);
t = toc;

assignments = reshape(x, m, n);
%disp(assignments);

%% Display Results

for i=1:num_teams
    str = sprintf("Team %d - Allocated to Project %d", i, find(assignments(i,:)==1));
    disp(str)
end