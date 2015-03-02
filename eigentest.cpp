#include <stdio.h>
#include <Eigen>

int main()
{
    using namespace Eigen;
    Vector3f v1(1,6,3);
    Vector3f v2(5,2,3);
    Vector3f v3 = v2 - v1;
    v3.normalize();
    
    printf("%f %f %f\n", v3.x(), v3.y(), v3.z());
}




