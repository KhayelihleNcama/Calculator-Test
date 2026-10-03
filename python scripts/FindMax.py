


def find_max(a,b,c):
    max_num = a
    if b > max_num:
        max_num = b
    if c > max_num:
        max_num = c
    return max_num


print(find_max(10, 70, 30))