var test = '    face  hoge huga horya';
var ret  = test.replace(/^\s*/, '');
var ret2 = ret.replace(/ +(?= )/g,'');
var ret3  = ret2.split(' ');



console.log(ret3);

