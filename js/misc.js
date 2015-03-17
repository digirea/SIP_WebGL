//http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
/**
 * Description
 * @method CosInter
 * @param {} a
 * @param {} b
 * @param {} t
 * @return BinaryExpression
 */
function CosInter(a, b, t) {
	var ft = x * Math.PI,
		f  = (1 - Math.cos(ft)) * .5;
	return a * (1 - f) + b * f;
}
