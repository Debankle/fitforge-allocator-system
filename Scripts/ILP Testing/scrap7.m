% Works for n > m, n = m, P, Q


%% Generate Team Allocations
function results = get_allocations(filename, sheetname, P, Q, R)
% Final work of of allocation implementations. Takes an excel file and
% sheet name with some m team by n projects, m >= n, and finds the best
% matching allocations based off of numbers indicating how well they would
% be allocated to each project
% P is teams that have determined allocations
%   ix2 matrix of team x project that will set that value to 1000
% Q is teams that have must not have allocations
%   jx2 matrix of team x project that will be set to -1000
% R is nx1 vector of projects with a number that indicates max teams to
% project - default is at most 1

[c, c_original, m, n] = read_data(filename, sheetname, P, Q);

tic;

[assignments, fval, exitflag] = calculate_assignments(c, m, n, R);

alloc_sum = sum(c(:) .* assignments(:));

display_results(assignments, alloc_sum, fval, exitflag);

t = toc;

results = {assignments, fval, alloc_sum, exitflag, t};

end
%% Subfunctions
function [c, c_original, m, n] = read_data(filename, sheetname, P, Q)
% Reads the specified sheet from the specified .xlsx data. Expects a table
% of n+1 columns, with Team | [preferences...]. m teams rows. Reads all the
% rows, and the preference columns and returns the matrix data c. Each
% entry will be an integer indicating how well suited a team is to a
% project, higher being better.

T = readtable(filename, 'Sheet', sheetname);
c = table2array(T(2:end,2:end));
c_original = c;
m = size(c,1);
n = size(c,2);

if n > m
    c(m+1:n, :) = 0;
    m = n;
end

for i=1:size(P,1)
    c(P(i,1), P(i,2)) = 1000;
end

for i=1:size(Q,1)
    c(Q(i,1), Q(i,2)) = -1000;
end

end


function [assignments, fval, exitflag] = calculate_assignments(c, m, n, R)
% Calculate the assignments of teams to projects

f = -c(:);
intcon = 1:(m*n);

[Aeq, beq] = equality_constraints(m, n);
[Aineq, bineq] = inequality_constraints(m, n, R);

lb = zeros(m*n, 1);
ub = ones(m*n, 1);

[x, fval, exitflag] = intlinprog(f, intcon, Aineq, bineq, Aeq, beq, lb, ub);

assignments = reshape(x, n, m);

end


function [A,b] = equality_constraints(m, n)
% Constraint: Each team must be assigned to exactly one project
% TODO: Modify with Q to indicate specific team assignments

A = zeros(m, m*n);
b = ones(m, 1);

for i = 1:m
    A(i, (i-1)*n+1:i*n) = 1;
end

end


function [A,b] = inequality_constraints(m, n, R)
% Inequality Constraints: Each project can be assigned to at most one team
% TODO: Modify with Q to indicate specific projects multiple teams

A = zeros(n, m*n);
b = ones(n,1); % R;

for j = 1:n
    A(j, j:m:m*n) = 1;
end

end


function [] = display_results(assignments, alloc_sum, fval, exitflag)
% TODO: Implement proper exitflag handling

for i=1:size(assignments,1)
    fprintf("Team %d - Allocated to Project %d\n", i, find(assignments(i,:)==1));
end

fprintf("The fval is %d\n", fval);
fprintf("The exitflag is %d\n", exitflag);
fprintf("The allocation satisfaction coefficient for this model was %d\n", alloc_sum)

end
