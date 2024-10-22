% Generate random preferences for 5 teams and 5 projects
original_matrix = [
    5 4 1 3 2;
    5 2 1 3 4;
    4 2 5 3 1;
    1 4 2 3 5;
    3 2 5 4 1;
];

num_teams = size(original_matrix,1);
num_projects = size(original_matrix,2);

preference_matrix = zeros(size(original_matrix));
for i=1:num_teams
    for j=1:num_projects
        preference_matrix(i,j) = num_projects+1-find(original_matrix(i,:)==j);
    end
end

%%
[m, n] = size(preference_matrix); % m teams, n projects

% Objective coefficients (preferences)
f = -reshape(preference_matrix', 1, []);

% Inequality constraints (each project assigned to at most one team)
A = zeros(n, m*n);
for j = 1:n
    A(j, (j-1)*m+1:j*m) = 1;
end
b = ones(n, 1);

% Equality constraints (each team assigned to exactly one project)
Aeq = zeros(m, m*n);
for i = 1:m
    Aeq(i, (i-1)*n+1:i*n) = 1;
end
beq = ones(m, 1);

% Binary constraints on decision variables
lb = zeros(m*n, 1);
ub = ones(m*n, 1);

% Solve ILP problem
[x, fval, exitflag] = intlinprog(f, 1:m*n, A, b, Aeq, beq, lb, ub);

% Reshape solution vector to matrix form
allocationMatrix = reshape(x, m, n)';

% Display results
disp('Allocations:');
disp(allocationMatrix);
disp(['Total preference score: ' num2str(-fval)]);