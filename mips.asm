.data
# (No data needed since values are loaded as immediates)

.text
.globl main

main:
    li   $t0, 5        # Load first constant decimal value (25) into register $t0
    li   $t1, 15        # Load second constant decimal value (15) into register $t1
    add  $t2, $t0, $t1  # 
    # (Optional) Move result to $v0 or print it depending on your environment
    move $a0, $t2        # Move result into $a0 for printing
    li   $v0, 1          # syscall code 1 = print integer
    syscall

    li   $v0, 10          # syscall code 10 = exit program
    syscall