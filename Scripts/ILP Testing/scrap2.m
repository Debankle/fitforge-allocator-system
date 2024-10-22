A = [
    5 4 1 3 2;
    5 2 1 3 4;
    4 2 5 3 1;
    1 4 2 3 5;
    3 2 5 4 1;
];

b = perms(1:5)';

x = A\b;

n = zeros(1,size(x,2));
for i=1:size(x,2)
    n(i) = sum(x(1:5,i));
end

[val, idx] = max(n);
disp('The max accuracy is: ' + int2str(val));
disp(x(:,idx));
disp('The best allocation order is:');
disp(b(:,idx));