attribute vec3  position;
attribute vec3  normal;
uniform   mat4  mvpMatrix;
uniform   float pointSize;
varying   vec4  vColor;

void main(void)
{
  vec3       L = normalize(vec3(1, -2, 3));
  vColor       = vec4(1,2,3,4) * max(0.0, dot(normal, -L));
  gl_PointSize = pointSize;
  gl_Position  = mvpMatrix * vec4(position, 1.0);
}
