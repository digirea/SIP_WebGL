#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <vector>


int random() {
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


void WriteRandomSTLB(
    const char *name,
    int num,
    float scale = 2,
    float mult  = 1.0,
    int pat     = 0)
{
    std::vector<stlbindata> vdata;
    float x  = 0.0;
    float y  = 0.0;
    float z  = 0.0;
    float dx = 0.04 * mult;
    float dy = 0.07 * mult;
    float dz = 0.05 * mult;
    for(int i = 0 ; i < num; i++) {
        stlbindata data;

        //normal
        for(int n = 0 ; n < 3; n++) {
            data.n[n] = 0;
        }

        //Face
        for(int p = 0 ; p < 9; p++) {
            if(!pat) {
                if( (p % 3) == 0) data.p[p] =  cos(x);
                if( (p % 3) == 1) data.p[p] = -cos(y);
                if( (p % 3) == 2) data.p[p] = -sin(z);
            } else {
                if( (p % 3) == 0) data.p[p] =  sin(x);
                if( (p % 3) == 1) data.p[p] =  cos(y);
                if( (p % 3) == 2) data.p[p] = -cos(z);
            }
            data.p[p] *= scale;
            x += dx;
            y += dy;
            z += dz;
        }
        vdata.push_back(data);
        
        if( (i % 256) == 0) {
            printf("Generate : %d\r", i);
        }
    }
    printf("\nDone.");

    FILE *fp = fopen(name, "wb");
    if(fp) {
        fseek(fp, 80, SEEK_SET);
        fwrite(&num, 1, 4, fp);
        fwrite(&vdata[0], 1, sizeof(stlbindata) * vdata.size(), fp);
        fclose(fp);
    }
}


int main(int argc, char *argv[]) {
    if(argc <= 3 ) {
        printf("Usage : <filename.stl>  <iteration-num>  [scale]   [LissajousMult]\n");
        exit(1);
    }
    
    for(int i = 0 ; i < argc; i++) {
        printf("argv[%d] = %s\n", i, argv[i]);
    }
    
    char *filename = argv[1];
    int   num      = atoi(argv[2]);
    float scale    = 100;
    float mult     = 1.0;
    int   pat      = 0;
    if(argc > 3)  scale = atof(argv[3]);
    if(argc > 4)  mult  = atof(argv[4]);
    if(argc > 5)  pat   = atoi(argv[5]);
    
    
    printf("Create %s : num=%d scale=%f mult=%f pat=%d\n", filename, num, scale, mult, pat);
    WriteRandomSTLB(filename, num, scale, mult, pat);
    return 0;
}


