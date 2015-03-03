#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <vector>



int random()
{
    static int a = 1, b = 234567, c = 8901234;
    a += b;
    b += c;
    c += a;
    return (a >> 16);
}


float frand() {
    return static_cast<float>(random()) / static_cast<float>(0x7FFF);
}


#pragma pack(push,1)
struct stlbindata {
    float n[3];
    float p[9];
    unsigned short pad;
    void print()
    {
        printf("%f %f %f::", n[0], n[1], n[2]);
        for(int i = 0; i < 9; i++) {
            printf("%f ", p[i]);
        }
        printf("\n");
        
    }
};
#pragma pack(pop)



void WriteRandomSTLB(const char *name, int num, float scale = 2, float mult = 1.0) {
    std::vector<stlbindata> vdata;
    printf("Start Generate facet num=%d\n", num);
    for(int i = 0 ; i < num; i++) {
        stlbindata data;
        for(int n = 0 ; n < 3; n++) {
            data.n[n] = frand() + 0.2;
        }

        for(int p = 0 ; p < 9; p++) {
            static float x = 0.0;
            static float y = 0.0;
            static float z = 0.0;
            static float dx = 0.4 * mult;
            static float dy = 0.7 * mult;
            static float dz = 0.5 * mult;
            
            
            if( (p % 3) == 0) data.p[p] =  cos(x);
            if( (p % 3) == 1) data.p[p] = -sin(y);
            if( (p % 3) == 2) data.p[p] = -cos(z);
            data.p[p] *= scale;
            
            x += dx;
            y += dy;
            z += dz;
            
        }
        vdata.push_back(data);
        
        
        if( (i % 10000) == 0) {
            printf("Generate : %d\r", i);
        }
    }
    printf("\nDone.");

    //WErite
    FILE *fp = fopen(name, "wb");
    if(fp) {
        fseek(fp, 80, SEEK_SET);
        fwrite(&num, 1, 4, fp);
        fwrite(&vdata[0], 1, sizeof(stlbindata) * vdata.size(), fp);
        fclose(fp);
    }
}


int main(int argc, char *argv[])
{
    WriteRandomSTLB(argv[1], atoi(argv[2]), atoi(argv[3]), atof(argv[4]));
    return 0;
}

