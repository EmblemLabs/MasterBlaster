(this["webpackJsonppancake-frontend"]=this["webpackJsonppancake-frontend"]||[]).push([[7],{1016:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return p}));var r=n(4),a=n.n(r),o=n(25),c=n(791),s=n(792),i=n.n(s),l=n(355),u=n(233),d=n(199),h=new i.a({allErrors:!0}).compile(c);function p(e,t){return b.apply(this,arguments)}function b(){return(b=Object(o.a)(a.a.mark((function e(t,n){var r,o,c,s,i,p,b,f,w,k,v,x,E;return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!(r=Object(u.a)(t))){e.next=23;break}return e.prev=2,e.next=5,n(r.ensName);case 5:s=e.sent,e.next=12;break;case 8:throw e.prev=8,e.t0=e.catch(2),console.error("Failed to resolve ENS name: ".concat(r.ensName),e.t0),new Error("Failed to resolve ENS name: ".concat(r.ensName));case 12:e.prev=12,i=Object(l.a)(s),e.next=20;break;case 16:throw e.prev=16,e.t1=e.catch(12),console.error("Failed to translate contenthash to URI",s),new Error("Failed to translate contenthash to URI: ".concat(s));case 20:o=Object(d.a)("".concat(i).concat(null!==(c=r.ensPath)&&void 0!==c?c:"")),e.next=24;break;case 23:o=Object(d.a)(t);case 24:p=0;case 25:if(!(p<o.length)){e.next=55;break}return b=o[p],f=p===o.length-1,w=void 0,e.prev=29,e.next=32,fetch(b);case 32:w=e.sent,e.next=41;break;case 35:if(e.prev=35,e.t2=e.catch(29),console.error("Failed to fetch list",t,e.t2),!f){e.next=40;break}throw new Error("Failed to download list ".concat(t));case 40:return e.abrupt("continue",52);case 41:if(w.ok){e.next=45;break}if(!f){e.next=44;break}throw new Error("Failed to download list ".concat(t));case 44:return e.abrupt("continue",52);case 45:return e.next=47,w.json();case 47:if(k=e.sent,h(k)){e.next=51;break}throw E=null!==(v=null===(x=h.errors)||void 0===x?void 0:x.reduce((function(e,t){var n,r="".concat(t.dataPath," ").concat(null!==(n=t.message)&&void 0!==n?n:"");return e.length>0?"".concat(e,"; ").concat(r):"".concat(r)}),""))&&void 0!==v?v:"unknown error",new Error("Token list failed validation: ".concat(E));case 51:return e.abrupt("return",k);case 52:p++,e.next=25;break;case 55:throw new Error("Unrecognized list URL protocol.");case 56:case"end":return e.stop()}}),e,null,[[2,8],[12,16],[29,35]])})))).apply(this,arguments)}}}]);