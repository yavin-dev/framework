!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.IntlPolyfill=r()}(this,function(){"use strict"
function e(r){for(var t in r)(r instanceof e||V.call(r,t))&&J(this,t,{value:r[t],enumerable:!0,writable:!0,configurable:!0})}function r(){J(this,"length",{writable:!0,value:0}),arguments.length&&ne.apply(this,re.call(arguments))}function t(){if(se.disableRegExpRestore)return function(){}
for(var e={lastMatch:RegExp.lastMatch||"",leftContext:RegExp.leftContext,multiline:RegExp.multiline,input:RegExp.input},t=!1,n=1;n<=9;n++)t=(e["$"+n]=RegExp["$"+n])||t
return function(){var n=/[.?*+^$[\]\\(){}|-]/g,a=e.lastMatch.replace(n,"\\$&"),i=new r
if(t)for(var o=1;o<=9;o++){var s=e["$"+o]
s?(s=s.replace(n,"\\$&"),a=a.replace(s,"("+s+")")):a="()"+a,ne.call(i,a.slice(0,a.indexOf("(")+1)),a=a.slice(a.indexOf("(")+1)}var l=ae.call(i,"")+a
l=l.replace(/(\\\(|\\\)|[^()])+/g,function(e){return"[\\s\\S]{"+e.replace("\\","").length+"}"})
var c=new RegExp(l,e.multiline?"gm":"g")
c.lastIndex=e.leftContext.length,c.exec(e.input)}}function n(e){if(null===e)throw new TypeError("Cannot convert null or undefined to object")
return"object"===(void 0===e?"undefined":H.typeof(e))?e:Object(e)}function a(e){return"number"==typeof e?e:Number(e)}function i(e){var r=function(e){var r=a(e)
return isNaN(r)?0:0===r||-0===r||r===1/0||r===-1/0?r:r<0?-1*Math.floor(Math.abs(r)):Math.floor(Math.abs(r))}(e)
return r<=0?0:r===1/0?Math.pow(2,53)-1:Math.min(r,Math.pow(2,53)-1)}function o(e){return V.call(e,"__getInternalProperties")?e.__getInternalProperties(le):ee(null)}function s(e){for(var r=e.length;r--;){var t=e.charAt(r)
t>="a"&&t<="z"&&(e=e.slice(0,r)+t.toUpperCase()+e.slice(r+1))}return e}function l(e){return!!me.test(e)&&!ve.test(e)&&!de.test(e)}function c(e){for(var r=void 0,t=void 0,n=1,a=(t=(e=e.toLowerCase()).split("-")).length;n<a;n++)if(2===t[n].length)t[n]=t[n].toUpperCase()
else if(4===t[n].length)t[n]=t[n].charAt(0).toUpperCase()+t[n].slice(1)
else if(1===t[n].length&&"x"!==t[n])break;(r=(e=ae.call(t,"-")).match(he))&&r.length>1&&(r.sort(),e=e.replace(RegExp("(?:"+he.source+")+","i"),ae.call(r,""))),V.call(ye.tags,e)&&(e=ye.tags[e])
for(var i=1,o=(t=e.split("-")).length;i<o;i++)V.call(ye.subtags,t[i])?t[i]=ye.subtags[t[i]]:V.call(ye.extLang,t[i])&&(t[i]=ye.extLang[t[i]][0],1===i&&ye.extLang[t[1]][1]===t[0]&&(t=re.call(t,i++),o-=1))
return ae.call(t,"-")}function u(e){var r=s(String(e))
return!1!==be.test(r)}function g(e){if(void 0===e)return new r
for(var t=new r,a=n(e="string"==typeof e?[e]:e),o=i(a.length),s=0;s<o;){var u=String(s)
if(u in a){var g=a[u]
if(null===g||"string"!=typeof g&&"object"!==(void 0===g?"undefined":H.typeof(g)))throw new TypeError("String or Object type expected")
var f=String(g)
if(!l(f))throw new RangeError("'"+f+"' is not a structurally valid language tag")
f=c(f),-1===Q.call(t,f)&&ne.call(t,f)}s++}return t}function f(e,r){for(var t=r;t;){if(Q.call(e,t)>-1)return t
var n=t.lastIndexOf("-")
if(n<0)return
n>=2&&"-"===t.charAt(n-2)&&(n-=2),t=t.substring(0,n)}}function m(r,t){for(var n=0,a=t.length,i=void 0,o=void 0,s=void 0;n<a&&!i;)o=t[n],i=f(r,s=String(o).replace(we,"")),n++
var l=new e
if(void 0!==i){if(l["[[locale]]"]=i,String(o)!==String(s)){var c=o.match(we)[0],u=o.indexOf("-u-")
l["[[extension]]"]=c,l["[[extensionIndex]]"]=u}}else l["[[locale]]"]=pe
return l}function v(r,t,n,a,i){if(0===r.length)throw new ReferenceError("No locale data has been provided for this object yet.")
var o,s=(o="lookup"===n["[[localeMatcher]]"]?m(r,t):function(e,r){return m(e,r)}(r,t))["[[locale]]"],l=void 0,u=void 0
if(V.call(o,"[[extension]]")){var g=o["[[extension]]"]
u=(l=String.prototype.split.call(g,"-")).length}var f=new e
f["[[dataLocale]]"]=s
for(var v="-u",d=0,h=a.length;d<h;){var p=a[d],y=i[s][p],b=y[0],w="",x=Q
if(void 0!==l){var j=x.call(l,p)
if(-1!==j)if(j+1<u&&l[j+1].length>2){var z=l[j+1];-1!==x.call(y,z)&&(w="-"+p+"-"+(b=z))}else{-1!==x(y,"true")&&(b="true")}}if(V.call(n,"[["+p+"]]")){var D=n["[["+p+"]]"];-1!==x.call(y,D)&&D!==b&&(b=D,w="")}f["[["+p+"]]"]=b,v+=w,d++}if(v.length>2){var k=s.indexOf("-x-")
if(-1===k)s+=v
else{var O=s.substring(0,k),F=s.substring(k)
s=O+v+F}s=c(s)}return f["[[locale]]"]=s,f}function d(e,t){for(var n=t.length,a=new r,i=0;i<n;){var o=t[i]
void 0!==f(e,String(o).replace(we,""))&&ne.call(a,o),i++}return re.call(a)}function h(r,t,a){var i,o=void 0
if(void 0!==a&&(void 0!==(o=(a=new e(n(a))).localeMatcher)&&("lookup"!==(o=String(o))&&"best fit"!==o)))throw new RangeError('matcher should be "lookup" or "best fit"')
for(var s in i=void 0===o||"best fit"===o?function(e,r){return d(e,r)}(r,t):d(r,t))V.call(i,s)&&J(i,s,{writable:!1,configurable:!1,value:i[s]})
return J(i,"length",{writable:!1}),i}function p(e,r,t,n,a){var i=e[r]
if(void 0!==i){if(i="boolean"===t?Boolean(i):"string"===t?String(i):i,void 0!==n&&-1===Q.call(n,i))throw new RangeError("'"+i+"' is not an allowed value for `"+r+"`")
return i}return a}function y(e,r,t,n,a){var i=e[r]
if(void 0!==i){if(i=Number(i),isNaN(i)||i<t||i>n)throw new RangeError("Value is not a number or outside accepted range")
return Math.floor(i)}return a}function b(){var e=arguments[0],r=arguments[1]
return this&&this!==xe?w(n(this),e,r):new xe.NumberFormat(e,r)}function w(a,i,s){var l=o(a),c=t()
if(!0===l["[[initializedIntlObject]]"])throw new TypeError("`this` object has already been initialized as an Intl object")
J(a,"__getInternalProperties",{value:function(){if(arguments[0]===le)return l}}),l["[[initializedIntlObject]]"]=!0
var f=g(i)
s=void 0===s?{}:n(s)
var m=new e,d=p(s,"localeMatcher","string",new r("lookup","best fit"),"best fit")
m["[[localeMatcher]]"]=d
var h=se.NumberFormat["[[localeData]]"],b=v(se.NumberFormat["[[availableLocales]]"],f,m,se.NumberFormat["[[relevantExtensionKeys]]"],h)
l["[[locale]]"]=b["[[locale]]"],l["[[numberingSystem]]"]=b["[[nu]]"],l["[[dataLocale]]"]=b["[[dataLocale]]"]
var w=b["[[dataLocale]]"],j=p(s,"style","string",new r("decimal","percent","currency"),"decimal")
l["[[style]]"]=j
var z=p(s,"currency","string")
if(void 0!==z&&!u(z))throw new RangeError("'"+z+"' is not a valid currency code")
if("currency"===j&&void 0===z)throw new TypeError("Currency code is required when style is currency")
var D=void 0
"currency"===j&&(z=z.toUpperCase(),l["[[currency]]"]=z,D=function(e){return void 0!==je[e]?je[e]:2}(z))
var k=p(s,"currencyDisplay","string",new r("code","symbol","name"),"symbol")
"currency"===j&&(l["[[currencyDisplay]]"]=k)
var O=y(s,"minimumIntegerDigits",1,21,1)
l["[[minimumIntegerDigits]]"]=O
var F=y(s,"minimumFractionDigits",0,20,"currency"===j?D:0)
l["[[minimumFractionDigits]]"]=F
var S=y(s,"maximumFractionDigits",F,20,"currency"===j?Math.max(F,D):"percent"===j?Math.max(F,0):Math.max(F,3))
l["[[maximumFractionDigits]]"]=S
var E=s.minimumSignificantDigits,L=s.maximumSignificantDigits
void 0===E&&void 0===L||(E=y(s,"minimumSignificantDigits",1,21,1),L=y(s,"maximumSignificantDigits",E,21,21),l["[[minimumSignificantDigits]]"]=E,l["[[maximumSignificantDigits]]"]=L)
var P=p(s,"useGrouping","boolean",void 0,!0)
l["[[useGrouping]]"]=P
var N=h[w].patterns[j]
return l["[[positivePattern]]"]=N.positivePattern,l["[[negativePattern]]"]=N.negativePattern,l["[[boundFormat]]"]=void 0,l["[[initializedNumberFormat]]"]=!0,X&&(a.format=x.call(a)),c(),a}function x(){var e=null!==this&&"object"===H.typeof(this)&&o(this)
if(!e||!e["[[initializedNumberFormat]]"])throw new TypeError("`this` value for format() is not an initialized Intl.NumberFormat object.")
if(void 0===e["[[boundFormat]]"]){var r=oe.call(function(e){return z(this,Number(e))},this)
e["[[boundFormat]]"]=r}return e["[[boundFormat]]"]}function j(e,t){var n=o(e),a=n["[[dataLocale]]"],i=n["[[numberingSystem]]"],s=se.NumberFormat["[[localeData]]"][a],l=s.symbols[i]||s.symbols.latn,c=void 0
!isNaN(t)&&t<0?(t=-t,c=n["[[negativePattern]]"]):c=n["[[positivePattern]]"]
for(var u=new r,g=c.indexOf("{",0),f=0,m=0,v=c.length;g>-1&&g<v;){if(-1===(f=c.indexOf("}",g)))throw new Error
if(g>m){var d=c.substring(m,g)
ne.call(u,{"[[type]]":"literal","[[value]]":d})}var h=c.substring(g+1,f)
if("number"===h)if(isNaN(t)){var p=l.nan
ne.call(u,{"[[type]]":"nan","[[value]]":p})}else if(isFinite(t)){"percent"===n["[[style]]"]&&isFinite(t)&&(t*=100)
var y=void 0
y=V.call(n,"[[minimumSignificantDigits]]")&&V.call(n,"[[maximumSignificantDigits]]")?D(t,n["[[minimumSignificantDigits]]"],n["[[maximumSignificantDigits]]"]):k(t,n["[[minimumIntegerDigits]]"],n["[[minimumFractionDigits]]"],n["[[maximumFractionDigits]]"]),ze[i]?function(){var e=ze[i]
y=String(y).replace(/\d/g,function(r){return e[r]})}():y=String(y)
var b=void 0,w=void 0,x=y.indexOf(".",0)
if(x>0?(b=y.substring(0,x),w=y.substring(x+1,x.length)):(b=y,w=void 0),!0===n["[[useGrouping]]"]){var j=l.group,z=[],O=s.patterns.primaryGroupSize||3,F=s.patterns.secondaryGroupSize||O
if(b.length>O){var S=b.length-O,E=S%F,L=b.slice(0,E)
for(L.length&&ne.call(z,L);E<S;)ne.call(z,b.slice(E,E+F)),E+=F
ne.call(z,b.slice(S))}else ne.call(z,b)
if(0===z.length)throw new Error
for(;z.length;){var P=ie.call(z)
ne.call(u,{"[[type]]":"integer","[[value]]":P}),z.length&&ne.call(u,{"[[type]]":"group","[[value]]":j})}}else ne.call(u,{"[[type]]":"integer","[[value]]":b})
if(void 0!==w){var N=l.decimal
ne.call(u,{"[[type]]":"decimal","[[value]]":N}),ne.call(u,{"[[type]]":"fraction","[[value]]":w})}}else{var T=l.infinity
ne.call(u,{"[[type]]":"infinity","[[value]]":T})}else if("plusSign"===h){var _=l.plusSign
ne.call(u,{"[[type]]":"plusSign","[[value]]":_})}else if("minusSign"===h){var M=l.minusSign
ne.call(u,{"[[type]]":"minusSign","[[value]]":M})}else if("percentSign"===h&&"percent"===n["[[style]]"]){var I=l.percentSign
ne.call(u,{"[[type]]":"literal","[[value]]":I})}else if("currency"===h&&"currency"===n["[[style]]"]){var A=n["[[currency]]"],R=void 0
"code"===n["[[currencyDisplay]]"]?R=A:"symbol"===n["[[currencyDisplay]]"]?R=s.currencies[A]||A:"name"===n["[[currencyDisplay]]"]&&(R=A),ne.call(u,{"[[type]]":"currency","[[value]]":R})}else{var q=c.substring(g,f)
ne.call(u,{"[[type]]":"literal","[[value]]":q})}m=f+1,g=c.indexOf("{",m)}if(m<v){var C=c.substring(m,v)
ne.call(u,{"[[type]]":"literal","[[value]]":C})}return u}function z(e,r){for(var t=j(e,r),n="",a=0;t.length>a;a++){n+=t[a]["[[value]]"]}return n}function D(e,r,t){var n=t,a=void 0,i=void 0
if(0===e)a=ae.call(Array(n+1),"0"),i=0
else{i=function(e){if("function"==typeof Math.log10)return Math.floor(Math.log10(e))
var r=Math.round(Math.log(e)*Math.LOG10E)
return r-(Number("1e"+r)>e)}(Math.abs(e))
var o=Math.round(Math.exp(Math.abs(i-n+1)*Math.LN10))
a=String(Math.round(i-n+1<0?e*o:e/o))}if(i>=n)return a+ae.call(Array(i-n+1+1),"0")
if(i===n-1)return a
if(i>=0?a=a.slice(0,i+1)+"."+a.slice(i+1):i<0&&(a="0."+ae.call(Array(1-(i+1)),"0")+a),a.indexOf(".")>=0&&t>r){for(var s=t-r;s>0&&"0"===a.charAt(a.length-1);)a=a.slice(0,-1),s--
"."===a.charAt(a.length-1)&&(a=a.slice(0,-1))}return a}function k(e,r,t,n){var a,i=n,o=Math.pow(10,i)*e,s=0===o?"0":o.toFixed(0),l=(a=s.indexOf("e"))>-1?s.slice(a+1):0
l&&(s=s.slice(0,a).replace(".",""),s+=ae.call(Array(l-(s.length-1)+1),"0"))
var c=void 0
if(0!==i){var u=s.length
if(u<=i)s=ae.call(Array(i+1-u+1),"0")+s,u=i+1
var g=s.substring(0,u-i),f=s.substring(u-i,s.length)
s=g+"."+f,c=g.length}else c=s.length
for(var m=n-t;m>0&&"0"===s.slice(-1);)s=s.slice(0,-1),m--;("."===s.slice(-1)&&(s=s.slice(0,-1)),c<r)&&(s=ae.call(Array(r-c+1),"0")+s)
return s}function O(e){for(var r=0;r<Se.length;r+=1)if(e.hasOwnProperty(Se[r]))return!1
return!0}function F(e){for(var r=0;r<Fe.length;r+=1)if(e.hasOwnProperty(Fe[r]))return!1
return!0}function S(e,r){for(var t={_:{}},n=0;n<Fe.length;n+=1)e[Fe[n]]&&(t[Fe[n]]=e[Fe[n]]),e._[Fe[n]]&&(t._[Fe[n]]=e._[Fe[n]])
for(var a=0;a<Se.length;a+=1)r[Se[a]]&&(t[Se[a]]=r[Se[a]]),r._[Se[a]]&&(t._[Se[a]]=r._[Se[a]])
return t}function E(e){return e.pattern12=e.extendedPattern.replace(/'([^']*)'/g,function(e,r){return r||"'"}),e.pattern=e.pattern12.replace("{ampm}","").replace(ke,""),e}function L(e,r){switch(e.charAt(0)){case"G":return r.era=["short","short","short","long","narrow"][e.length-1],"{era}"
case"y":case"Y":case"u":case"U":case"r":return r.year=2===e.length?"2-digit":"numeric","{year}"
case"Q":case"q":return r.quarter=["numeric","2-digit","short","long","narrow"][e.length-1],"{quarter}"
case"M":case"L":return r.month=["numeric","2-digit","short","long","narrow"][e.length-1],"{month}"
case"w":return r.week=2===e.length?"2-digit":"numeric","{weekday}"
case"W":return r.week="numeric","{weekday}"
case"d":return r.day=2===e.length?"2-digit":"numeric","{day}"
case"D":case"F":case"g":return r.day="numeric","{day}"
case"E":return r.weekday=["short","short","short","long","narrow","short"][e.length-1],"{weekday}"
case"e":return r.weekday=["numeric","2-digit","short","long","narrow","short"][e.length-1],"{weekday}"
case"c":return r.weekday=["numeric",void 0,"short","long","narrow","short"][e.length-1],"{weekday}"
case"a":case"b":case"B":return r.hour12=!0,"{ampm}"
case"h":case"H":return r.hour=2===e.length?"2-digit":"numeric","{hour}"
case"k":case"K":return r.hour12=!0,r.hour=2===e.length?"2-digit":"numeric","{hour}"
case"m":return r.minute=2===e.length?"2-digit":"numeric","{minute}"
case"s":return r.second=2===e.length?"2-digit":"numeric","{second}"
case"S":case"A":return r.second="numeric","{second}"
case"z":case"Z":case"O":case"v":case"V":case"X":case"x":return r.timeZoneName=e.length<4?"short":"long","{timeZoneName}"}}function P(e,r){if(!Oe.test(r)){var t={originalPattern:r,_:{}}
return t.extendedPattern=r.replace(De,function(e){return L(e,t._)}),e.replace(De,function(e){return L(e,t)}),E(t)}}function N(e,r,t,n,a){var i=e[r]&&e[r][t]?e[r][t]:e.gregory[t],o={narrow:["short","long"],short:["long","narrow"],long:["short","narrow"]},s=V.call(i,n)?i[n]:V.call(i,o[n][0])?i[o[n][0]]:i[o[n][1]]
return null!==a?s[a]:s}function T(){var e=arguments[0],r=arguments[1]
return this&&this!==xe?_(n(this),e,r):new xe.DateTimeFormat(e,r)}function _(n,a,i){var l=o(n),c=t()
if(!0===l["[[initializedIntlObject]]"])throw new TypeError("`this` object has already been initialized as an Intl object")
J(n,"__getInternalProperties",{value:function(){if(arguments[0]===le)return l}}),l["[[initializedIntlObject]]"]=!0
var u=g(a)
i=M(i,"any","date")
var f=new e,m=p(i,"localeMatcher","string",new r("lookup","best fit"),"best fit")
f["[[localeMatcher]]"]=m
var d=se.DateTimeFormat,h=d["[[localeData]]"],y=v(d["[[availableLocales]]"],u,f,d["[[relevantExtensionKeys]]"],h)
l["[[locale]]"]=y["[[locale]]"],l["[[calendar]]"]=y["[[ca]]"],l["[[numberingSystem]]"]=y["[[nu]]"],l["[[dataLocale]]"]=y["[[dataLocale]]"]
var b=y["[[dataLocale]]"],w=i.timeZone
if(void 0!==w&&"UTC"!==(w=s(w)))throw new RangeError("timeZone is not supported.")
for(var x in l["[[timeZone]]"]=w,f=new e,Pe)if(V.call(Pe,x)){var j=p(i,x,"string",Pe[x])
f["[["+x+"]]"]=j}var z=void 0,D=h[b],k=function(e){return"[object Array]"===Object.prototype.toString.call(e)?e:function(e){var r=e.availableFormats,t=e.timeFormats,n=e.dateFormats,a=[],i=void 0,o=void 0,s=void 0,l=void 0,c=void 0,u=[],g=[]
for(i in r)r.hasOwnProperty(i)&&(s=P(i,o=r[i]))&&(a.push(s),O(s)?g.push(s):F(s)&&u.push(s))
for(i in t)t.hasOwnProperty(i)&&(s=P(i,o=t[i]))&&(a.push(s),u.push(s))
for(i in n)n.hasOwnProperty(i)&&(s=P(i,o=n[i]))&&(a.push(s),g.push(s))
for(l=0;l<u.length;l+=1)for(c=0;c<g.length;c+=1)o="long"===g[c].month?g[c].weekday?e.full:e.long:"short"===g[c].month?e.medium:e.short,(s=S(g[c],u[l])).originalPattern=o,s.extendedPattern=o.replace("{0}",u[l].extendedPattern).replace("{1}",g[c].extendedPattern).replace(/^[,\s]+|[,\s]+$/gi,""),a.push(E(s))
return a}(e)}(D.formats)
if(m=p(i,"formatMatcher","string",new r("basic","best fit"),"best fit"),D.formats=k,"basic"===m)z=function(e,r){for(var t=-1/0,n=void 0,a=0,i=r.length;a<i;){var o=r[a],s=0
for(var l in Pe)if(V.call(Pe,l)){var c=e["[["+l+"]]"],u=V.call(o,l)?o[l]:void 0
if(void 0===c&&void 0!==u)s-=20
else if(void 0!==c&&void 0===u)s-=120
else{var g=["2-digit","numeric","narrow","short","long"],f=Q.call(g,c),m=Q.call(g,u),v=Math.max(Math.min(m-f,2),-2)
2===v?s-=6:1===v?s-=3:-1===v?s-=6:-2===v&&(s-=8)}}s>t&&(t=s,n=o),a++}return n}(f,k)
else{var L=p(i,"hour12","boolean")
f.hour12=void 0===L?D.hour12:L,z=function(e,r){var t=[]
for(var n in Pe)V.call(Pe,n)&&void 0!==e["[["+n+"]]"]&&t.push(n)
if(1===t.length){var a=function(e,r){var t
if(Ee[e]&&Ee[e][r])return t={originalPattern:Ee[e][r],_:U({},e,r),extendedPattern:"{"+e+"}"},U(t,e,r),U(t,"pattern12","{"+e+"}"),U(t,"pattern","{"+e+"}"),t}(t[0],e["[["+t[0]+"]]"])
if(a)return a}for(var i=-1/0,o=void 0,s=0,l=r.length;s<l;){var c=r[s],u=0
for(var g in Pe)if(V.call(Pe,g)){var f=e["[["+g+"]]"],m=V.call(c,g)?c[g]:void 0,v=V.call(c._,g)?c._[g]:void 0
if(f!==v&&(u-=2),void 0===f&&void 0!==m)u-=20
else if(void 0!==f&&void 0===m)u-=120
else{var d=["2-digit","numeric","narrow","short","long"],h=Q.call(d,f),p=Q.call(d,m),y=Math.max(Math.min(p-h,2),-2)
p<=1&&h>=2||p>=2&&h<=1?y>0?u-=6:y<0&&(u-=8):y>1?u-=3:y<-1&&(u-=6)}}c._.hour12!==e.hour12&&(u-=1),u>i&&(i=u,o=c),s++}return o}(f,k)}for(var N in Pe)if(V.call(Pe,N)&&V.call(z,N)){var T=z[N]
T=z._&&V.call(z._,N)?z._[N]:T,l["[["+N+"]]"]=T}var _=void 0,A=p(i,"hour12","boolean")
if(l["[[hour]]"])if(A=void 0===A?D.hour12:A,l["[[hour12]]"]=A,!0===A){var R=D.hourNo0
l["[[hourNo0]]"]=R,_=z.pattern12}else _=z.pattern
else _=z.pattern
return l["[[pattern]]"]=_,l["[[boundFormat]]"]=void 0,l["[[initializedDateTimeFormat]]"]=!0,X&&(n.format=I.call(n)),c(),n}function M(r,t,a){if(void 0===r)r=null
else{var i=n(r)
for(var o in r=new e,i)r[o]=i[o]}r=ee(r)
var s=!0
return"date"!==t&&"any"!==t||void 0===r.weekday&&void 0===r.year&&void 0===r.month&&void 0===r.day||(s=!1),"time"!==t&&"any"!==t||void 0===r.hour&&void 0===r.minute&&void 0===r.second||(s=!1),!s||"date"!==a&&"all"!==a||(r.year=r.month=r.day="numeric"),!s||"time"!==a&&"all"!==a||(r.hour=r.minute=r.second="numeric"),r}function I(){var e=null!==this&&"object"===H.typeof(this)&&o(this)
if(!e||!e["[[initializedDateTimeFormat]]"])throw new TypeError("`this` value for format() is not an initialized Intl.DateTimeFormat object.")
if(void 0===e["[[boundFormat]]"]){var r=oe.call(function(){var e=arguments.length<=0||void 0===arguments[0]?void 0:arguments[0]
return R(this,void 0===e?Date.now():a(e))},this)
e["[[boundFormat]]"]=r}return e["[[boundFormat]]"]}function A(e,n){if(!isFinite(n))throw new RangeError("Invalid valid date passed to format")
var a=e.__getInternalProperties(le)
t()
for(var i=a["[[locale]]"],o=new xe.NumberFormat([i],{useGrouping:!1}),s=new xe.NumberFormat([i],{minimumIntegerDigits:2,useGrouping:!1}),l=q(n,a["[[calendar]]"],a["[[timeZone]]"]),c=a["[[pattern]]"],u=new r,g=0,f=c.indexOf("{"),m=0,v=a["[[dataLocale]]"],d=se.DateTimeFormat["[[localeData]]"][v].calendars,h=a["[[calendar]]"];-1!==f;){var p=void 0
if(-1===(m=c.indexOf("}",f)))throw new Error("Unclosed pattern")
f>g&&ne.call(u,{type:"literal",value:c.substring(g,f)})
var y=c.substring(f+1,m)
if(Pe.hasOwnProperty(y)){var b=a["[["+y+"]]"],w=l["[["+y+"]]"]
if("year"===y&&w<=0?w=1-w:"month"===y?w++:"hour"===y&&!0===a["[[hour12]]"]&&(0===(w%=12)&&!0===a["[[hourNo0]]"]&&(w=12)),"numeric"===b)p=z(o,w)
else if("2-digit"===b)(p=z(s,w)).length>2&&(p=p.slice(-2))
else if(b in Le)switch(y){case"month":p=N(d,h,"months",b,l["[["+y+"]]"])
break
case"weekday":try{p=N(d,h,"days",b,l["[["+y+"]]"])}catch(e){throw new Error("Could not find weekday data for locale "+i)}break
case"timeZoneName":p=""
break
case"era":try{p=N(d,h,"eras",b,l["[["+y+"]]"])}catch(e){throw new Error("Could not find era data for locale "+i)}break
default:p=l["[["+y+"]]"]}ne.call(u,{type:y,value:p})}else if("ampm"===y){p=N(d,h,"dayPeriods",l["[[hour]]"]>11?"pm":"am",null),ne.call(u,{type:"dayPeriod",value:p})}else ne.call(u,{type:"literal",value:c.substring(f,m+1)})
g=m+1,f=c.indexOf("{",g)}return m<c.length-1&&ne.call(u,{type:"literal",value:c.substr(m+1)}),u}function R(e,r){for(var t=A(e,r),n="",a=0;t.length>a;a++){n+=t[a].value}return n}function q(r,t,n){var a=new Date(r),i="get"+(n||"")
return new e({"[[weekday]]":a[i+"Day"](),"[[era]]":+(a[i+"FullYear"]()>=0),"[[year]]":a[i+"FullYear"](),"[[month]]":a[i+"Month"](),"[[day]]":a[i+"Date"](),"[[hour]]":a[i+"Hours"](),"[[minute]]":a[i+"Minutes"](),"[[second]]":a[i+"Seconds"](),"[[inDST]]":!1})}function C(e,r){if(!e.number)throw new Error("Object passed doesn't contain locale data for Intl.NumberFormat")
var t=void 0,n=[r],a=r.split("-")
for(a.length>2&&4===a[1].length&&ne.call(n,a[0]+"-"+a[2]);t=ie.call(n);)ne.call(se.NumberFormat["[[availableLocales]]"],t),se.NumberFormat["[[localeData]]"][t]=e.number,e.date&&(e.date.nu=e.number.nu,ne.call(se.DateTimeFormat["[[availableLocales]]"],t),se.DateTimeFormat["[[localeData]]"][t]=e.date)
void 0===pe&&function(e){pe=e}(r)}var G="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},Z=function(){var e="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103
return function(r,t,n,a){var i=r&&r.defaultProps,o=arguments.length-3
if(t||0===o||(t={}),t&&i)for(var s in i)void 0===t[s]&&(t[s]=i[s])
else t||(t=i||{})
if(1===o)t.children=a
else if(o>1){for(var l=Array(o),c=0;c<o;c++)l[c]=arguments[c+3]
t.children=l}return{$$typeof:e,type:r,key:void 0===n?null:""+n,ref:null,props:t,_owner:null}}}(),B=function(){function e(e,r){for(var t=0;t<r.length;t++){var n=r[t]
n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(r,t,n){return t&&e(r.prototype,t),n&&e(r,n),r}}(),U=function(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e},$=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r]
for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e},K="undefined"==typeof global?self:global,Y=function(){return function(e,r){if(Array.isArray(e))return e
if(Symbol.iterator in Object(e))return function(e,r){var t=[],n=!0,a=!1,i=void 0
try{for(var o,s=e[Symbol.iterator]();!(n=(o=s.next()).done)&&(t.push(o.value),!r||t.length!==r);n=!0);}catch(e){a=!0,i=e}finally{try{!n&&s.return&&s.return()}finally{if(a)throw i}}return t}(e,r)
throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),H=Object.freeze({jsx:Z,asyncToGenerator:function(e){return function(){var r=e.apply(this,arguments)
return new Promise(function(e,t){return function n(a,i){try{var o=r[a](i),s=o.value}catch(e){return void t(e)}return o.done?void e(s):Promise.resolve(s).then(function(e){return n("next",e)},function(e){return n("throw",e)})}("next")})}},classCallCheck:function(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")},createClass:B,defineEnumerableProperties:function(e,r){for(var t in r){var n=r[t]
n.configurable=n.enumerable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,t,n)}return e},defaults:function(e,r){for(var t=Object.getOwnPropertyNames(r),n=0;n<t.length;n++){var a=t[n],i=Object.getOwnPropertyDescriptor(r,a)
i&&i.configurable&&void 0===e[a]&&Object.defineProperty(e,a,i)}return e},defineProperty:U,get:function e(r,t,n){null===r&&(r=Function.prototype)
var a=Object.getOwnPropertyDescriptor(r,t)
if(void 0===a){var i=Object.getPrototypeOf(r)
return null===i?void 0:e(i,t,n)}if("value"in a)return a.value
var o=a.get
return void 0!==o?o.call(n):void 0},inherits:function(e,r){if("function"!=typeof r&&null!==r)throw new TypeError("Super expression must either be null or a function, not "+typeof r)
e.prototype=Object.create(r&&r.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),r&&(Object.setPrototypeOf?Object.setPrototypeOf(e,r):e.__proto__=r)},interopRequireDefault:function(e){return e&&e.__esModule?e:{default:e}},interopRequireWildcard:function(e){if(e&&e.__esModule)return e
var r={}
if(null!=e)for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=e[t])
return r.default=e,r},newArrowCheck:function(e,r){if(e!==r)throw new TypeError("Cannot instantiate an arrow function")},objectDestructuringEmpty:function(e){if(null==e)throw new TypeError("Cannot destructure undefined")},objectWithoutProperties:function(e,r){var t={}
for(var n in e)r.indexOf(n)>=0||Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])
return t},possibleConstructorReturn:function(e,r){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
return!r||"object"!=typeof r&&"function"!=typeof r?e:r},selfGlobal:K,set:function e(r,t,n,a){var i=Object.getOwnPropertyDescriptor(r,t)
if(void 0===i){var o=Object.getPrototypeOf(r)
null!==o&&e(o,t,n,a)}else if("value"in i&&i.writable)i.value=n
else{var s=i.set
void 0!==s&&s.call(a,n)}return n},slicedToArray:Y,slicedToArrayLoose:function(e,r){if(Array.isArray(e))return e
if(Symbol.iterator in Object(e)){for(var t,n=[],a=e[Symbol.iterator]();!(t=a.next()).done&&(n.push(t.value),!r||n.length!==r););return n}throw new TypeError("Invalid attempt to destructure non-iterable instance")},taggedTemplateLiteral:function(e,r){return Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(r)}}))},taggedTemplateLiteralLoose:function(e,r){return e.raw=r,e},temporalRef:function(e,r,t){if(e===t)throw new ReferenceError(r+" is not defined - temporal dead zone")
return e},temporalUndefined:{},toArray:function(e){return Array.isArray(e)?e:Array.from(e)},toConsumableArray:function(e){if(Array.isArray(e)){for(var r=0,t=Array(e.length);r<e.length;r++)t[r]=e[r]
return t}return Array.from(e)},typeof:G,extends:$,instanceof:function(e,r){return null!=r&&"undefined"!=typeof Symbol&&r[Symbol.hasInstance]?r[Symbol.hasInstance](e):e instanceof r}}),W=function(){var e=function(){}
try{return Object.defineProperty(e,"a",{get:function(){return 1}}),Object.defineProperty(e,"prototype",{writable:!1}),1===e.a&&e.prototype instanceof Object}catch(e){return!1}}(),X=!W&&!Object.prototype.__defineGetter__,V=Object.prototype.hasOwnProperty,J=W?Object.defineProperty:function(e,r,t){"get"in t&&e.__defineGetter__?e.__defineGetter__(r,t.get):(!V.call(e,r)||"value"in t)&&(e[r]=t.value)},Q=Array.prototype.indexOf||function(e){var r=this
if(!r.length)return-1
for(var t=arguments[1]||0,n=r.length;t<n;t++)if(r[t]===e)return t
return-1},ee=Object.create||function(e,r){function t(){}var n
for(var a in t.prototype=e,n=new t,r)V.call(r,a)&&J(n,a,r[a])
return n},re=Array.prototype.slice,te=Array.prototype.concat,ne=Array.prototype.push,ae=Array.prototype.join,ie=Array.prototype.shift,oe=Function.prototype.bind||function(e){var r=this,t=re.call(arguments,1)
return r.length,function(){return r.apply(e,te.call(t,re.call(arguments)))}},se=ee(null),le=Math.random()
e.prototype=ee(null),r.prototype=ee(null)
var ce="(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3})",ue="[0-9a-wy-z]",ge=ue+"(?:-[a-z0-9]{2,8})+",fe="x(?:-[a-z0-9]{1,8})+",me=RegExp("^(?:(?:[a-z]{2,3}(?:-[a-z]{3}(?:-[a-z]{3}){0,2})?|[a-z]{4}|[a-z]{5,8})(?:-[a-z]{4})?(?:-(?:[a-z]{2}|\\d{3}))?(?:-(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3}))*(?:-[0-9a-wy-z](?:-[a-z0-9]{2,8})+)*(?:-x(?:-[a-z0-9]{1,8})+)?|"+fe+"|(?:(?:en-GB-oed|i-(?:ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu)|sgn-(?:BE-FR|BE-NL|CH-DE))|(?:art-lojban|cel-gaulish|no-bok|no-nyn|zh-(?:guoyu|hakka|min|min-nan|xiang))))$","i"),ve=RegExp("^(?!x).*?-("+ce+")-(?:\\w{4,8}-(?!x-))*\\1\\b","i"),de=RegExp("^(?!x).*?-("+ue+")-(?:\\w+-(?!x-))*\\1\\b","i"),he=RegExp("-"+ge,"ig"),pe=void 0,ye={tags:{"art-lojban":"jbo","i-ami":"ami","i-bnn":"bnn","i-hak":"hak","i-klingon":"tlh","i-lux":"lb","i-navajo":"nv","i-pwn":"pwn","i-tao":"tao","i-tay":"tay","i-tsu":"tsu","no-bok":"nb","no-nyn":"nn","sgn-BE-FR":"sfb","sgn-BE-NL":"vgt","sgn-CH-DE":"sgg","zh-guoyu":"cmn","zh-hakka":"hak","zh-min-nan":"nan","zh-xiang":"hsn","sgn-BR":"bzs","sgn-CO":"csn","sgn-DE":"gsg","sgn-DK":"dsl","sgn-ES":"ssp","sgn-FR":"fsl","sgn-GB":"bfi","sgn-GR":"gss","sgn-IE":"isg","sgn-IT":"ise","sgn-JP":"jsl","sgn-MX":"mfs","sgn-NI":"ncs","sgn-NL":"dse","sgn-NO":"nsl","sgn-PT":"psr","sgn-SE":"swl","sgn-US":"ase","sgn-ZA":"sfs","zh-cmn":"cmn","zh-cmn-Hans":"cmn-Hans","zh-cmn-Hant":"cmn-Hant","zh-gan":"gan","zh-wuu":"wuu","zh-yue":"yue"},subtags:{BU:"MM",DD:"DE",FX:"FR",TP:"TL",YD:"YE",ZR:"CD",heploc:"alalc97",in:"id",iw:"he",ji:"yi",jw:"jv",mo:"ro",ayx:"nun",bjd:"drl",ccq:"rki",cjr:"mom",cka:"cmr",cmk:"xch",drh:"khk",drw:"prs",gav:"dev",hrr:"jal",ibi:"opa",kgh:"kml",lcq:"ppr",mst:"mry",myt:"mry",sca:"hle",tie:"ras",tkk:"twm",tlw:"weo",tnf:"prs",ybd:"rki",yma:"lrr"},extLang:{aao:["aao","ar"],abh:["abh","ar"],abv:["abv","ar"],acm:["acm","ar"],acq:["acq","ar"],acw:["acw","ar"],acx:["acx","ar"],acy:["acy","ar"],adf:["adf","ar"],ads:["ads","sgn"],aeb:["aeb","ar"],aec:["aec","ar"],aed:["aed","sgn"],aen:["aen","sgn"],afb:["afb","ar"],afg:["afg","sgn"],ajp:["ajp","ar"],apc:["apc","ar"],apd:["apd","ar"],arb:["arb","ar"],arq:["arq","ar"],ars:["ars","ar"],ary:["ary","ar"],arz:["arz","ar"],ase:["ase","sgn"],asf:["asf","sgn"],asp:["asp","sgn"],asq:["asq","sgn"],asw:["asw","sgn"],auz:["auz","ar"],avl:["avl","ar"],ayh:["ayh","ar"],ayl:["ayl","ar"],ayn:["ayn","ar"],ayp:["ayp","ar"],bbz:["bbz","ar"],bfi:["bfi","sgn"],bfk:["bfk","sgn"],bjn:["bjn","ms"],bog:["bog","sgn"],bqn:["bqn","sgn"],bqy:["bqy","sgn"],btj:["btj","ms"],bve:["bve","ms"],bvl:["bvl","sgn"],bvu:["bvu","ms"],bzs:["bzs","sgn"],cdo:["cdo","zh"],cds:["cds","sgn"],cjy:["cjy","zh"],cmn:["cmn","zh"],coa:["coa","ms"],cpx:["cpx","zh"],csc:["csc","sgn"],csd:["csd","sgn"],cse:["cse","sgn"],csf:["csf","sgn"],csg:["csg","sgn"],csl:["csl","sgn"],csn:["csn","sgn"],csq:["csq","sgn"],csr:["csr","sgn"],czh:["czh","zh"],czo:["czo","zh"],doq:["doq","sgn"],dse:["dse","sgn"],dsl:["dsl","sgn"],dup:["dup","ms"],ecs:["ecs","sgn"],esl:["esl","sgn"],esn:["esn","sgn"],eso:["eso","sgn"],eth:["eth","sgn"],fcs:["fcs","sgn"],fse:["fse","sgn"],fsl:["fsl","sgn"],fss:["fss","sgn"],gan:["gan","zh"],gds:["gds","sgn"],gom:["gom","kok"],gse:["gse","sgn"],gsg:["gsg","sgn"],gsm:["gsm","sgn"],gss:["gss","sgn"],gus:["gus","sgn"],hab:["hab","sgn"],haf:["haf","sgn"],hak:["hak","zh"],hds:["hds","sgn"],hji:["hji","ms"],hks:["hks","sgn"],hos:["hos","sgn"],hps:["hps","sgn"],hsh:["hsh","sgn"],hsl:["hsl","sgn"],hsn:["hsn","zh"],icl:["icl","sgn"],ils:["ils","sgn"],inl:["inl","sgn"],ins:["ins","sgn"],ise:["ise","sgn"],isg:["isg","sgn"],isr:["isr","sgn"],jak:["jak","ms"],jax:["jax","ms"],jcs:["jcs","sgn"],jhs:["jhs","sgn"],jls:["jls","sgn"],jos:["jos","sgn"],jsl:["jsl","sgn"],jus:["jus","sgn"],kgi:["kgi","sgn"],knn:["knn","kok"],kvb:["kvb","ms"],kvk:["kvk","sgn"],kvr:["kvr","ms"],kxd:["kxd","ms"],lbs:["lbs","sgn"],lce:["lce","ms"],lcf:["lcf","ms"],liw:["liw","ms"],lls:["lls","sgn"],lsg:["lsg","sgn"],lsl:["lsl","sgn"],lso:["lso","sgn"],lsp:["lsp","sgn"],lst:["lst","sgn"],lsy:["lsy","sgn"],ltg:["ltg","lv"],lvs:["lvs","lv"],lzh:["lzh","zh"],max:["max","ms"],mdl:["mdl","sgn"],meo:["meo","ms"],mfa:["mfa","ms"],mfb:["mfb","ms"],mfs:["mfs","sgn"],min:["min","ms"],mnp:["mnp","zh"],mqg:["mqg","ms"],mre:["mre","sgn"],msd:["msd","sgn"],msi:["msi","ms"],msr:["msr","sgn"],mui:["mui","ms"],mzc:["mzc","sgn"],mzg:["mzg","sgn"],mzy:["mzy","sgn"],nan:["nan","zh"],nbs:["nbs","sgn"],ncs:["ncs","sgn"],nsi:["nsi","sgn"],nsl:["nsl","sgn"],nsp:["nsp","sgn"],nsr:["nsr","sgn"],nzs:["nzs","sgn"],okl:["okl","sgn"],orn:["orn","ms"],ors:["ors","ms"],pel:["pel","ms"],pga:["pga","ar"],pks:["pks","sgn"],prl:["prl","sgn"],prz:["prz","sgn"],psc:["psc","sgn"],psd:["psd","sgn"],pse:["pse","ms"],psg:["psg","sgn"],psl:["psl","sgn"],pso:["pso","sgn"],psp:["psp","sgn"],psr:["psr","sgn"],pys:["pys","sgn"],rms:["rms","sgn"],rsi:["rsi","sgn"],rsl:["rsl","sgn"],sdl:["sdl","sgn"],sfb:["sfb","sgn"],sfs:["sfs","sgn"],sgg:["sgg","sgn"],sgx:["sgx","sgn"],shu:["shu","ar"],slf:["slf","sgn"],sls:["sls","sgn"],sqk:["sqk","sgn"],sqs:["sqs","sgn"],ssh:["ssh","ar"],ssp:["ssp","sgn"],ssr:["ssr","sgn"],svk:["svk","sgn"],swc:["swc","sw"],swh:["swh","sw"],swl:["swl","sgn"],syy:["syy","sgn"],tmw:["tmw","ms"],tse:["tse","sgn"],tsm:["tsm","sgn"],tsq:["tsq","sgn"],tss:["tss","sgn"],tsy:["tsy","sgn"],tza:["tza","sgn"],ugn:["ugn","sgn"],ugy:["ugy","sgn"],ukl:["ukl","sgn"],uks:["uks","sgn"],urk:["urk","ms"],uzn:["uzn","uz"],uzs:["uzs","uz"],vgt:["vgt","sgn"],vkk:["vkk","ms"],vkt:["vkt","ms"],vsi:["vsi","sgn"],vsl:["vsl","sgn"],vsv:["vsv","sgn"],wuu:["wuu","zh"],xki:["xki","sgn"],xml:["xml","sgn"],xmm:["xmm","ms"],xms:["xms","sgn"],yds:["yds","sgn"],ysl:["ysl","sgn"],yue:["yue","zh"],zib:["zib","sgn"],zlm:["zlm","ms"],zmi:["zmi","ms"],zsl:["zsl","sgn"],zsm:["zsm","ms"]}},be=/^[A-Z]{3}$/,we=/-u(?:-[0-9a-z]{2,8})+/gi,xe={}
Object.defineProperty(xe,"getCanonicalLocales",{enumerable:!1,configurable:!0,writable:!0,value:function(e){for(var r=g(e),t=[],n=r.length,a=0;a<n;)t[a]=r[a],a++
return t}})
var je={BHD:3,BYR:0,XOF:0,BIF:0,XAF:0,CLF:4,CLP:0,KMF:0,DJF:0,XPF:0,GNF:0,ISK:0,IQD:3,JPY:0,JOD:3,KRW:0,KWD:3,LYD:3,OMR:3,PYG:0,RWF:0,TND:3,UGX:0,UYI:0,VUV:0,VND:0}
J(xe,"NumberFormat",{configurable:!0,writable:!0,value:b}),J(xe.NumberFormat,"prototype",{writable:!1}),se.NumberFormat={"[[availableLocales]]":[],"[[relevantExtensionKeys]]":["nu"],"[[localeData]]":{}},J(xe.NumberFormat,"supportedLocalesOf",{configurable:!0,writable:!0,value:oe.call(function(e){if(!V.call(this,"[[availableLocales]]"))throw new TypeError("supportedLocalesOf() is not a constructor")
var r=t(),n=arguments[1],a=this["[[availableLocales]]"],i=g(e)
return r(),h(a,i,n)},se.NumberFormat)}),J(xe.NumberFormat.prototype,"format",{configurable:!0,get:x}),Object.defineProperty(xe.NumberFormat.prototype,"formatToParts",{configurable:!0,enumerable:!1,writable:!0,value:function(){var e=arguments.length<=0||void 0===arguments[0]?void 0:arguments[0],r=null!==this&&"object"===H.typeof(this)&&o(this)
if(!r||!r["[[initializedNumberFormat]]"])throw new TypeError("`this` value for formatToParts() is not an initialized Intl.NumberFormat object.")
return function(e,r){for(var t=j(e,r),n=[],a=0,i=0;t.length>i;i++){var o=t[i],s={}
s.type=o["[[type]]"],s.value=o["[[value]]"],n[a]=s,a+=1}return n}(this,Number(e))}})
var ze={arab:["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"],arabext:["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"],bali:["᭐","᭑","᭒","᭓","᭔","᭕","᭖","᭗","᭘","᭙"],beng:["০","১","২","৩","৪","৫","৬","৭","৮","৯"],deva:["०","१","२","३","४","५","६","७","८","९"],fullwide:["０","１","２","３","４","５","６","７","８","９"],gujr:["૦","૧","૨","૩","૪","૫","૬","૭","૮","૯"],guru:["੦","੧","੨","੩","੪","੫","੬","੭","੮","੯"],hanidec:["〇","一","二","三","四","五","六","七","八","九"],khmr:["០","១","២","៣","៤","៥","៦","៧","៨","៩"],knda:["೦","೧","೨","೩","೪","೫","೬","೭","೮","೯"],laoo:["໐","໑","໒","໓","໔","໕","໖","໗","໘","໙"],latn:["0","1","2","3","4","5","6","7","8","9"],limb:["᥆","᥇","᥈","᥉","᥊","᥋","᥌","᥍","᥎","᥏"],mlym:["൦","൧","൨","൩","൪","൫","൬","൭","൮","൯"],mong:["᠐","᠑","᠒","᠓","᠔","᠕","᠖","᠗","᠘","᠙"],mymr:["၀","၁","၂","၃","၄","၅","၆","၇","၈","၉"],orya:["୦","୧","୨","୩","୪","୫","୬","୭","୮","୯"],tamldec:["௦","௧","௨","௩","௪","௫","௬","௭","௮","௯"],telu:["౦","౧","౨","౩","౪","౫","౬","౭","౮","౯"],thai:["๐","๑","๒","๓","๔","๕","๖","๗","๘","๙"],tibt:["༠","༡","༢","༣","༤","༥","༦","༧","༨","༩"]}
J(xe.NumberFormat.prototype,"resolvedOptions",{configurable:!0,writable:!0,value:function(){var r=void 0,t=new e,n=["locale","numberingSystem","style","currency","currencyDisplay","minimumIntegerDigits","minimumFractionDigits","maximumFractionDigits","minimumSignificantDigits","maximumSignificantDigits","useGrouping"],a=null!==this&&"object"===H.typeof(this)&&o(this)
if(!a||!a["[[initializedNumberFormat]]"])throw new TypeError("`this` value for resolvedOptions() is not an initialized Intl.NumberFormat object.")
for(var i=0,s=n.length;i<s;i++)V.call(a,r="[["+n[i]+"]]")&&(t[n[i]]={value:a[r],writable:!0,configurable:!0,enumerable:!0})
return ee({},t)}})
var De=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g,ke=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,Oe=/[rqQASjJgwWIQq]/,Fe=["era","year","month","day","weekday","quarter"],Se=["hour","minute","second","hour12","timeZoneName"],Ee={second:{numeric:"s","2-digit":"ss"},minute:{numeric:"m","2-digit":"mm"},year:{numeric:"y","2-digit":"yy"},day:{numeric:"d","2-digit":"dd"},month:{numeric:"L","2-digit":"LL",narrow:"LLLLL",short:"LLL",long:"LLLL"},weekday:{narrow:"ccccc",short:"ccc",long:"cccc"}},Le=ee(null,{narrow:{},short:{},long:{}})
J(xe,"DateTimeFormat",{configurable:!0,writable:!0,value:T}),J(T,"prototype",{writable:!1})
var Pe={weekday:["narrow","short","long"],era:["narrow","short","long"],year:["2-digit","numeric"],month:["2-digit","numeric","narrow","short","long"],day:["2-digit","numeric"],hour:["2-digit","numeric"],minute:["2-digit","numeric"],second:["2-digit","numeric"],timeZoneName:["short","long"]}
se.DateTimeFormat={"[[availableLocales]]":[],"[[relevantExtensionKeys]]":["ca","nu"],"[[localeData]]":{}},J(xe.DateTimeFormat,"supportedLocalesOf",{configurable:!0,writable:!0,value:oe.call(function(e){if(!V.call(this,"[[availableLocales]]"))throw new TypeError("supportedLocalesOf() is not a constructor")
var r=t(),n=arguments[1],a=this["[[availableLocales]]"],i=g(e)
return r(),h(a,i,n)},se.NumberFormat)}),J(xe.DateTimeFormat.prototype,"format",{configurable:!0,get:I}),Object.defineProperty(xe.DateTimeFormat.prototype,"formatToParts",{enumerable:!1,writable:!0,configurable:!0,value:function(){var e=arguments.length<=0||void 0===arguments[0]?void 0:arguments[0],r=null!==this&&"object"===H.typeof(this)&&o(this)
if(!r||!r["[[initializedDateTimeFormat]]"])throw new TypeError("`this` value for formatToParts() is not an initialized Intl.DateTimeFormat object.")
return function(e,r){for(var t=A(e,r),n=[],a=0;t.length>a;a++){var i=t[a]
n.push({type:i.type,value:i.value})}return n}(this,void 0===e?Date.now():a(e))}}),J(xe.DateTimeFormat.prototype,"resolvedOptions",{writable:!0,configurable:!0,value:function(){var r=void 0,t=new e,n=["locale","calendar","numberingSystem","timeZone","hour12","weekday","era","year","month","day","hour","minute","second","timeZoneName"],a=null!==this&&"object"===H.typeof(this)&&o(this)
if(!a||!a["[[initializedDateTimeFormat]]"])throw new TypeError("`this` value for resolvedOptions() is not an initialized Intl.DateTimeFormat object.")
for(var i=0,s=n.length;i<s;i++)V.call(a,r="[["+n[i]+"]]")&&(t[n[i]]={value:a[r],writable:!0,configurable:!0,enumerable:!0})
return ee({},t)}})
var Ne=xe.__localeSensitiveProtos={Number:{},Date:{}}
if(Ne.Number.toLocaleString=function(){if("[object Number]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a number for Number.prototype.toLocaleString()")
return z(new b(arguments[0],arguments[1]),this)},Ne.Date.toLocaleString=function(){if("[object Date]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a Date instance for Date.prototype.toLocaleString()")
var e=+this
if(isNaN(e))return"Invalid Date"
var r=arguments[0],t=arguments[1]
return R(new T(r,t=M(t,"any","all")),e)},Ne.Date.toLocaleDateString=function(){if("[object Date]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a Date instance for Date.prototype.toLocaleDateString()")
var e=+this
if(isNaN(e))return"Invalid Date"
var r=arguments[0],t=arguments[1]
return R(new T(r,t=M(t,"date","date")),e)},Ne.Date.toLocaleTimeString=function(){if("[object Date]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a Date instance for Date.prototype.toLocaleTimeString()")
var e=+this
if(isNaN(e))return"Invalid Date"
var r=arguments[0],t=arguments[1]
return R(new T(r,t=M(t,"time","time")),e)},J(xe,"__applyLocaleSensitivePrototypes",{writable:!0,configurable:!0,value:function(){for(var e in J(Number.prototype,"toLocaleString",{writable:!0,configurable:!0,value:Ne.Number.toLocaleString}),J(Date.prototype,"toLocaleString",{writable:!0,configurable:!0,value:Ne.Date.toLocaleString}),Ne.Date)V.call(Ne.Date,e)&&J(Date.prototype,e,{writable:!0,configurable:!0,value:Ne.Date[e]})}}),J(xe,"__addLocaleData",{value:function(e){if(!l(e.locale))throw new Error("Object passed doesn't identify itself with a valid language tag")
C(e,e.locale)}}),J(xe,"__disableRegExpRestore",{value:function(){se.disableRegExpRestore=!0}}),"undefined"==typeof Intl)try{window.Intl=xe,xe.__applyLocaleSensitivePrototypes()}catch(Te){}return xe})
