#include <math.h>
#include <stdio.h>

int main()
{
    for(int i = 0 ; i < 360; i += 45) {
        float deg = (3.14159265358979323 * float(i)) / 180.0;
        printf("X=%f, Y=%f\n",
            cos(deg),
            sin(deg));
    }
}
