#include <stdio.h>
#include <vector>

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

int ReadAsciiSTL(const char *name, std::vector<stlbindata> &vdata) {
    int facet    = 0;
    FILE *fp = fopen(name, "r");
    printf("Reading\n");
    if(fp) {
        stlbindata data;
        char linebuf[123];
        char token[5][123];
        int  index = 0;
        while(fgets(linebuf, sizeof(linebuf) - 1, fp) > 0) {
            int cnt = sscanf(linebuf, "%s %s %s %s %s\n", token[0], token[1], token[2], token[3], token[4]);
            
            if(cnt <= 0) continue;
            if(!strcmp(token[0], "facet")) {
                memset(&data, 0, sizeof(data));
                facet++;
                if( (facet % 0x8000) == 0) printf("facet = %d\r", facet);
                data.n[0] = atof(token[2]);
                data.n[1] = atof(token[3]);
                data.n[2] = atof(token[4]);
                continue;
            }
            
            if(!strcmp(token[0], "vertex")) {
                data.p[0 + index] = atof(token[1]);
                data.p[1 + index] = atof(token[2]);
                data.p[2 + index] = atof(token[3]);
                index += 3;
                continue;
            }

            if(!strcmp(token[0], "endfacet")) {
                vdata.push_back(data);
                index = 0;
                continue;
            }
        }
        fclose(fp);
    }
    printf("\nDone. facet=%d\n", facet);
    return facet;
}

int WriteBinarySTL(const char *name, int facet, std::vector<stlbindata> &vdata) {
    int ret = -1;
    FILE *fp = fopen(name, "wb");
    if(fp) {
        printf("Writing file -> %s\n", name);
        fseek(fp, 80, SEEK_SET);
        fwrite(&facet, 1, 4, fp);
        fwrite(&vdata[0], 1, sizeof(stlbindata) * vdata.size(), fp);
        fclose(fp);
        printf("Done.\n");
        ret = 0;
    }
    return ret;
}

int main(int argc, char *argv[]) {
    std::vector<stlbindata> vdata;
    int facet = ReadAsciiSTL(argv[1], vdata);
    printf("%d size=%d\n", facet, vdata.size());
    //WriteBinarySTL("test.stl", facet, vdata);
    char filename[2112];
    sprintf(filename, "%s.bin", argv[1]);
    WriteBinarySTL(filename, facet, vdata);
    return 0;
}




