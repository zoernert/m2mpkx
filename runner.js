var M2Mpkx=require("./m2mpkx.js");

var m2m=new M2Mpkx({t:'Test',path:'test\\'});
try {
//var c= m2m.getContract("0xa941600a601f24e47edaa4a4a06b9d49a64be45d");
var c= m2m.getContract("0xa941600a601f24e47edaa4a4a06b9d49a64be45d");
console.log(m2m.config);
console.log("Owner: "+c.owner());
var e=m2m.encrypt("0xa941600a601f24e47edaa4a4a06b9d49a64be45d",m2m.config.fromAddress,"Hallo!");
//console.log(e);
console.log(m2m.decrypt(e));
//mc.init({t:'Test',path:'test\\'});


//console.log("Owner: "+c.owner());
} catch(e) { console.log(e); }