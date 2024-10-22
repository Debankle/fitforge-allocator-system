%% Generate Matrix Data:
% Result is some matrix c which is m teams by n projects
% Each element is compatability of team to project on some integer scale
% For the moment it's just preference as compatability
% Binary XOR and then sum is next thing to try
% Works for 20x7, i.e. 20 teams with 7 preferences each
% Will need to modify for more projects than teams
clear,clc

% Sample_1 data from excel spreadsheet
% Contains project preference in order from highest to lowest
T = readtable('sample_data.xlsx','Sheet','Sample_11');
original_matrix = table2array(T(:,2:8));

num_teams = size(original_matrix,1);
num_prefs = size(original_matrix,2);

% Convert original data into team by project with preference as
% compatability for now
c = zeros(size(original_matrix));
for i=1:num_teams
    for j=1:num_teams
        val = num_prefs+1 - find(original_matrix(i,:)==j);
        if isempty(val)
            c(i,j) = 0;
        else
            c(i,j) = val;
        end
    end
end

%% Allocate teams to projects using Integer Programming

[m, n] = size(c); % m teams, n projects

f = -c(:); % Convert compatibility matrix into a column vector and negate for maximization

intcon = 1:(m*n); % Define integer variables (binary)

Aeq = zeros(m+n, m*n); % Initialize equality constraint matrix
beq = ones(m+n, 1); % Initialize equality constraint vector

% Constraint: Each team must be assigned to exactly one project
for i = 1:m
    Aeq(i, (i-1)*n+1:i*n) = 1;
end

% Constraint: Each project can be assigned to at most one team
for j = 1:n
    Aeq(m+j, j:n:m*n) = 1;
end

lb = zeros(m*n, 1); % Lower bound for variables
ub = ones(m*n, 1); % Upper bound for variables

[x, fval, exitflag] = intlinprog(f, intcon, [], [], Aeq, beq, lb, ub);

assignments = reshape(x, m, n);
disp(assignments);