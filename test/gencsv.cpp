#include <stdio.h>
#include <math.h>


int random() {
	static int a = 1;
	static int b = 156487;
	static int c = 1248487;
	a += b;
	b += c;
	c += a;
	return (c >> 16);
}


float frand() {
	return float(random()) / (float)(0x7FFF);
}


int main()
{
	/*
	for(int j = 0 ; j < 256; j++) {
		for(int i = 0 ; i < 16; i++) {
			printf("%f,", frand() * 250.0);
		}
		printf("\n");
	}
	*/
	
	float t = 0.0;
	for(int j = 0 ; j < 1024; j++) {
		printf("%f,%f,%f,", cos(t * 0.3) * 100, -sin(t * 0.4) * 100, -cos(t * 0.6) * 100);
		printf("%f,%f,%f,", sin(t * 0.007) * 200, -cos(t * 0.009) * 200, -sin(t * 0.012) * 200);
		printf("%f,%f,%f,", frand() * 300, frand() * 300, frand() * 300);
		printf("\n");
		t += 7.3;;
	}

}


