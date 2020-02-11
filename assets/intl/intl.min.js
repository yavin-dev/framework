!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.IntlPolyfill=r()}(this,(function(){"use strict"
function e(r){for(var t in r)(r instanceof e||Q.call(r,t))&&ee(this,t,{value:r[t],enumerable:!0,writable:!0,configurable:!0})}function r(){ee(this,"length",{writable:!0,value:0}),arguments.length&&ie.apply(this,ne.call(arguments))}function t(){if(ce.disableRegExpRestore)return function(){}
for(var e={lastMatch:RegExp.lastMatch||"",leftContext:RegExp.leftContext,multiline:RegExp.multiline,input:RegExp.input},t=!1,n=1;n<=9;n++)t=(e["$"+n]=RegExp["$"+n])||t
return function(){var n=/[.?*+^$[\]\\(){}|-]/g,a=e.lastMatch.replace(n,"\\$&"),i=new r
if(t)for(var o=1;o<=9;o++){var s=e["$"+o]
s?(s=s.replace(n,"\\$&"),a=a.replace(s,"("+s+")")):a="()"+a,ie.call(i,a.slice(0,a.indexOf("(")+1)),a=a.slice(a.indexOf("(")+1)}var l=oe.call(i,"")+a
l=l.replace(/(\\\(|\\\)|[^()])+/g,(function(e){return"[\\s\\S]{"+e.replace("\\","").length+"}"}))
var c=new RegExp(l,e.multiline?"gm":"g")
c.lastIndex=e.leftContext.length,c.exec(e.input)}}function n(e){if(null===e)throw new TypeError("Cannot convert null or undefined to object")
return"object"===(void 0===e?"undefined":X.typeof(e))?e:Object(e)}function a(e){return"number"==typeof e?e:Number(e)}function i(e){var r=function(e){var r=a(e)
return isNaN(r)?0:0===r||-0===r||r===1/0||r===-1/0?r:r<0?-1*Math.floor(Math.abs(r)):Math.floor(Math.abs(r))}(e)
return r<=0?0:r===1/0?Math.pow(2,53)-1:Math.min(r,Math.pow(2,53)-1)}function o(e){return Q.call(e,"__getInternalProperties")?e.__getInternalProperties(ue):te(null)}function s(e){for(var r=e.length;r--;){var t=e.charAt(r)
t>="a"&&t<="z"&&(e=e.slice(0,r)+t.toUpperCase()+e.slice(r+1))}return e}function l(e){return!!de.test(e)&&!he.test(e)&&!pe.test(e)}function c(e){for(var r=void 0,t=void 0,n=1,a=(t=(e=e.toLowerCase()).split("-")).length;n<a;n++)if(2===t[n].length)t[n]=t[n].toUpperCase()
else if(4===t[n].length)t[n]=t[n].charAt(0).toUpperCase()+t[n].slice(1)
else if(1===t[n].length&&"x"!==t[n])break;(r=(e=oe.call(t,"-")).match(ye))&&r.length>1&&(r.sort(),e=e.replace(RegExp("(?:"+ye.source+")+","i"),oe.call(r,""))),Q.call(we.tags,e)&&(e=we.tags[e])
for(var i=1,o=(t=e.split("-")).length;i<o;i++)Q.call(we.subtags,t[i])?t[i]=we.subtags[t[i]]:Q.call(we.extLang,t[i])&&(t[i]=we.extLang[t[i]][0],1===i&&we.extLang[t[1]][1]===t[0]&&(t=ne.call(t,i++),o-=1))
return oe.call(t,"-")}function u(e){var r=s(String(e))
return!1!==xe.test(r)}function g(e){if(void 0===e)return new r
for(var t=new r,a=n(e="string"==typeof e?[e]:e),o=i(a.length),s=0;s<o;){var u=String(s)
if(u in a){var g=a[u]
if(null===g||"string"!=typeof g&&"object"!==(void 0===g?"undefined":X.typeof(g)))throw new TypeError("String or Object type expected")
var f=String(g)
if(!l(f))throw new RangeError("'"+f+"' is not a structurally valid language tag")
f=c(f),-1===re.call(t,f)&&ie.call(t,f)}s++}return t}function f(e,r){for(var t=r;t;){if(re.call(e,t)>-1)return t
var n=t.lastIndexOf("-")
if(n<0)return
n>=2&&"-"===t.charAt(n-2)&&(n-=2),t=t.substring(0,n)}}function m(r,t){for(var n=0,a=t.length,i=void 0,o=void 0,s=void 0;n<a&&!i;)o=t[n],i=f(r,s=String(o).replace(je,"")),n++
var l=new e
if(void 0!==i){if(l["[[locale]]"]=i,String(o)!==String(s)){var c=o.match(je)[0],u=o.indexOf("-u-")
l["[[extension]]"]=c,l["[[extensionIndex]]"]=u}}else l["[[locale]]"]=be
return l}function v(r,t,n,a,i){if(0===r.length)throw new ReferenceError("No locale data has been provided for this object yet.")
var o,s=(o="lookup"===n["[[localeMatcher]]"]?m(r,t):function(e,r){return m(e,r)}(r,t))["[[locale]]"],l=void 0,u=void 0
if(Q.call(o,"[[extension]]")){var g=o["[[extension]]"]
u=(l=String.prototype.split.call(g,"-")).length}var f=new e
f["[[dataLocale]]"]=s
for(var v="-u",d=0,h=a.length;d<h;){var p=a[d],y=i[s][p],b=y[0],w="",x=re
if(void 0!==l){var j=x.call(l,p)
if(-1!==j)if(j+1<u&&l[j+1].length>2){var z=l[j+1];-1!==x.call(y,z)&&(w="-"+p+"-"+(b=z))}else{-1!==x(y,"true")&&(b="true")}}if(Q.call(n,"[["+p+"]]")){var D=n["[["+p+"]]"];-1!==x.call(y,D)&&D!==b&&(b=D,w="")}f["[["+p+"]]"]=b,v+=w,d++}if(v.length>2){var k=s.indexOf("-x-")
if(-1===k)s+=v
else{var O=s.substring(0,k),F=s.substring(k)
s=O+v+F}s=c(s)}return f["[[locale]]"]=s,f}function d(e,t){for(var n=t.length,a=new r,i=0;i<n;){var o=t[i]
void 0!==f(e,String(o).replace(je,""))&&ie.call(a,o),i++}return ne.call(a)}function h(r,t,a){var i,o=void 0
if(void 0!==a&&(void 0!==(o=(a=new e(n(a))).localeMatcher)&&("lookup"!==(o=String(o))&&"best fit"!==o)))throw new RangeError('matcher should be "lookup" or "best fit"')
for(var s in i=void 0===o||"best fit"===o?function(e,r){return d(e,r)}(r,t):d(r,t))Q.call(i,s)&&ee(i,s,{writable:!1,configurable:!1,value:i[s]})
return ee(i,"length",{writable:!1}),i}function p(e,r,t,n,a){var i=e[r]
if(void 0!==i){if(i="boolean"===t?Boolean(i):"string"===t?String(i):i,void 0!==n&&-1===re.call(n,i))throw new RangeError("'"+i+"' is not an allowed value for `"+r+"`")
return i}return a}function y(e,r,t,n,a){var i=e[r]
if(void 0!==i){if(i=Number(i),isNaN(i)||i<t||i>n)throw new RangeError("Value is not a number or outside accepted range")
return Math.floor(i)}return a}function b(){var e=arguments[0],r=arguments[1]
return this&&this!==ze?w(n(this),e,r):new ze.NumberFormat(e,r)}function w(a,i,s){var l=o(a),c=t()
if(!0===l["[[initializedIntlObject]]"])throw new TypeError("`this` object has already been initialized as an Intl object")
ee(a,"__getInternalProperties",{value:function(){if(arguments[0]===ue)return l}}),l["[[initializedIntlObject]]"]=!0
var f=g(i)
s=void 0===s?{}:n(s)
var m=new e,d=p(s,"localeMatcher","string",new r("lookup","best fit"),"best fit")
m["[[localeMatcher]]"]=d
var h=ce.NumberFormat["[[localeData]]"],b=v(ce.NumberFormat["[[availableLocales]]"],f,m,ce.NumberFormat["[[relevantExtensionKeys]]"],h)
l["[[locale]]"]=b["[[locale]]"],l["[[numberingSystem]]"]=b["[[nu]]"],l["[[dataLocale]]"]=b["[[dataLocale]]"]
var w=b["[[dataLocale]]"],j=p(s,"style","string",new r("decimal","percent","currency"),"decimal")
l["[[style]]"]=j
var z=p(s,"currency","string")
if(void 0!==z&&!u(z))throw new RangeError("'"+z+"' is not a valid currency code")
if("currency"===j&&void 0===z)throw new TypeError("Currency code is required when style is currency")
var D=void 0
"currency"===j&&(z=z.toUpperCase(),l["[[currency]]"]=z,D=function(e){return void 0!==De[e]?De[e]:2}(z))
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
return l["[[positivePattern]]"]=N.positivePattern,l["[[negativePattern]]"]=N.negativePattern,l["[[boundFormat]]"]=void 0,l["[[initializedNumberFormat]]"]=!0,J&&(a.format=x.call(a)),c(),a}function x(){var e=null!==this&&"object"===X.typeof(this)&&o(this)
if(!e||!e["[[initializedNumberFormat]]"])throw new TypeError("`this` value for format() is not an initialized Intl.NumberFormat object.")
if(void 0===e["[[boundFormat]]"]){var r=le.call((function(e){return D(this,Number(e))}),this)
e["[[boundFormat]]"]=r}return e["[[boundFormat]]"]}function j(e,r){for(var t=z(e,r),n=[],a=0,i=0;t.length>i;i++){var o=t[i],s={}
s.type=o["[[type]]"],s.value=o["[[value]]"],n[a]=s,a+=1}return n}function z(e,t){var n=o(e),a=n["[[dataLocale]]"],i=n["[[numberingSystem]]"],s=ce.NumberFormat["[[localeData]]"][a],l=s.symbols[i]||s.symbols.latn,c=void 0
!isNaN(t)&&t<0?(t=-t,c=n["[[negativePattern]]"]):c=n["[[positivePattern]]"]
for(var u=new r,g=c.indexOf("{",0),f=0,m=0,v=c.length;g>-1&&g<v;){if(-1===(f=c.indexOf("}",g)))throw new Error
if(g>m){var d=c.substring(m,g)
ie.call(u,{"[[type]]":"literal","[[value]]":d})}var h=c.substring(g+1,f)
if("number"===h)if(isNaN(t)){var p=l.nan
ie.call(u,{"[[type]]":"nan","[[value]]":p})}else if(isFinite(t)){"percent"===n["[[style]]"]&&isFinite(t)&&(t*=100)
var y=void 0
y=Q.call(n,"[[minimumSignificantDigits]]")&&Q.call(n,"[[maximumSignificantDigits]]")?k(t,n["[[minimumSignificantDigits]]"],n["[[maximumSignificantDigits]]"]):O(t,n["[[minimumIntegerDigits]]"],n["[[minimumFractionDigits]]"],n["[[maximumFractionDigits]]"]),ke[i]?function(){var e=ke[i]
y=String(y).replace(/\d/g,(function(r){return e[r]}))}():y=String(y)
var b=void 0,w=void 0,x=y.indexOf(".",0)
if(x>0?(b=y.substring(0,x),w=y.substring(x+1,x.length)):(b=y,w=void 0),!0===n["[[useGrouping]]"]){var j=l.group,z=[],D=s.patterns.primaryGroupSize||3,F=s.patterns.secondaryGroupSize||D
if(b.length>D){var S=b.length-D,E=S%F,L=b.slice(0,E)
for(L.length&&ie.call(z,L);E<S;)ie.call(z,b.slice(E,E+F)),E+=F
ie.call(z,b.slice(S))}else ie.call(z,b)
if(0===z.length)throw new Error
for(;z.length;){var P=se.call(z)
ie.call(u,{"[[type]]":"integer","[[value]]":P}),z.length&&ie.call(u,{"[[type]]":"group","[[value]]":j})}}else ie.call(u,{"[[type]]":"integer","[[value]]":b})
if(void 0!==w){var N=l.decimal
ie.call(u,{"[[type]]":"decimal","[[value]]":N}),ie.call(u,{"[[type]]":"fraction","[[value]]":w})}}else{var T=l.infinity
ie.call(u,{"[[type]]":"infinity","[[value]]":T})}else if("plusSign"===h){var _=l.plusSign
ie.call(u,{"[[type]]":"plusSign","[[value]]":_})}else if("minusSign"===h){var M=l.minusSign
ie.call(u,{"[[type]]":"minusSign","[[value]]":M})}else if("percentSign"===h&&"percent"===n["[[style]]"]){var I=l.percentSign
ie.call(u,{"[[type]]":"literal","[[value]]":I})}else if("currency"===h&&"currency"===n["[[style]]"]){var A=n["[[currency]]"],R=void 0
"code"===n["[[currencyDisplay]]"]?R=A:"symbol"===n["[[currencyDisplay]]"]?R=s.currencies[A]||A:"name"===n["[[currencyDisplay]]"]&&(R=A),ie.call(u,{"[[type]]":"currency","[[value]]":R})}else{var q=c.substring(g,f)
ie.call(u,{"[[type]]":"literal","[[value]]":q})}m=f+1,g=c.indexOf("{",m)}if(m<v){var C=c.substring(m,v)
ie.call(u,{"[[type]]":"literal","[[value]]":C})}return u}function D(e,r){for(var t=z(e,r),n="",a=0;t.length>a;a++){n+=t[a]["[[value]]"]}return n}function k(e,r,t){var n=t,a=void 0,i=void 0
if(0===e)a=oe.call(Array(n+1),"0"),i=0
else{i=function(e){if("function"==typeof Math.log10)return Math.floor(Math.log10(e))
var r=Math.round(Math.log(e)*Math.LOG10E)
return r-(Number("1e"+r)>e)}(Math.abs(e))
var o=Math.round(Math.exp(Math.abs(i-n+1)*Math.LN10))
a=String(Math.round(i-n+1<0?e*o:e/o))}if(i>=n)return a+oe.call(Array(i-n+1+1),"0")
if(i===n-1)return a
if(i>=0?a=a.slice(0,i+1)+"."+a.slice(i+1):i<0&&(a="0."+oe.call(Array(1-(i+1)),"0")+a),a.indexOf(".")>=0&&t>r){for(var s=t-r;s>0&&"0"===a.charAt(a.length-1);)a=a.slice(0,-1),s--
"."===a.charAt(a.length-1)&&(a=a.slice(0,-1))}return a}function O(e,r,t,n){var a,i=n,o=Math.pow(10,i)*e,s=0===o?"0":o.toFixed(0),l=(a=s.indexOf("e"))>-1?s.slice(a+1):0
l&&(s=s.slice(0,a).replace(".",""),s+=oe.call(Array(l-(s.length-1)+1),"0"))
var c=void 0
if(0!==i){var u=s.length
if(u<=i)s=oe.call(Array(i+1-u+1),"0")+s,u=i+1
var g=s.substring(0,u-i),f=s.substring(u-i,s.length)
s=g+"."+f,c=g.length}else c=s.length
for(var m=n-t;m>0&&"0"===s.slice(-1);)s=s.slice(0,-1),m--;("."===s.slice(-1)&&(s=s.slice(0,-1)),c<r)&&(s=oe.call(Array(r-c+1),"0")+s)
return s}function F(e){for(var r=0;r<Le.length;r+=1)if(e.hasOwnProperty(Le[r]))return!1
return!0}function S(e){for(var r=0;r<Ee.length;r+=1)if(e.hasOwnProperty(Ee[r]))return!1
return!0}function E(e,r){for(var t={_:{}},n=0;n<Ee.length;n+=1)e[Ee[n]]&&(t[Ee[n]]=e[Ee[n]]),e._[Ee[n]]&&(t._[Ee[n]]=e._[Ee[n]])
for(var a=0;a<Le.length;a+=1)r[Le[a]]&&(t[Le[a]]=r[Le[a]]),r._[Le[a]]&&(t._[Le[a]]=r._[Le[a]])
return t}function L(e){return e.pattern12=e.extendedPattern.replace(/'([^']*)'/g,(function(e,r){return r||"'"})),e.pattern=e.pattern12.replace("{ampm}","").replace(Fe,""),e}function P(e,r){switch(e.charAt(0)){case"G":return r.era=["short","short","short","long","narrow"][e.length-1],"{era}"
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
case"z":case"Z":case"O":case"v":case"V":case"X":case"x":return r.timeZoneName=e.length<4?"short":"long","{timeZoneName}"}}function N(e,r){if(!Se.test(r)){var t={originalPattern:r,_:{}}
return t.extendedPattern=r.replace(Oe,(function(e){return P(e,t._)})),e.replace(Oe,(function(e){return P(e,t)})),L(t)}}function T(e,r,t,n,a){var i=e[r]&&e[r][t]?e[r][t]:e.gregory[t],o={narrow:["short","long"],short:["long","narrow"],long:["short","narrow"]},s=Q.call(i,n)?i[n]:Q.call(i,o[n][0])?i[o[n][0]]:i[o[n][1]]
return null!==a?s[a]:s}function _(){var e=arguments[0],r=arguments[1]
return this&&this!==ze?M(n(this),e,r):new ze.DateTimeFormat(e,r)}function M(n,a,i){var l=o(n),c=t()
if(!0===l["[[initializedIntlObject]]"])throw new TypeError("`this` object has already been initialized as an Intl object")
ee(n,"__getInternalProperties",{value:function(){if(arguments[0]===ue)return l}}),l["[[initializedIntlObject]]"]=!0
var u=g(a)
i=I(i,"any","date")
var f=new e,m=p(i,"localeMatcher","string",new r("lookup","best fit"),"best fit")
f["[[localeMatcher]]"]=m
var d=ce.DateTimeFormat,h=d["[[localeData]]"],y=v(d["[[availableLocales]]"],u,f,d["[[relevantExtensionKeys]]"],h)
l["[[locale]]"]=y["[[locale]]"],l["[[calendar]]"]=y["[[ca]]"],l["[[numberingSystem]]"]=y["[[nu]]"],l["[[dataLocale]]"]=y["[[dataLocale]]"]
var b=y["[[dataLocale]]"],w=i.timeZone
if(void 0!==w&&"UTC"!==(w=s(w)))throw new RangeError("timeZone is not supported.")
for(var x in l["[[timeZone]]"]=w,f=new e,Te)if(Q.call(Te,x)){var j=p(i,x,"string",Te[x])
f["[["+x+"]]"]=j}var z=void 0,D=h[b],k=function(e){return"[object Array]"===Object.prototype.toString.call(e)?e:function(e){var r=e.availableFormats,t=e.timeFormats,n=e.dateFormats,a=[],i=void 0,o=void 0,s=void 0,l=void 0,c=void 0,u=[],g=[]
for(i in r)r.hasOwnProperty(i)&&((s=N(i,o=r[i]))&&(a.push(s),F(s)?g.push(s):S(s)&&u.push(s)))
for(i in t)t.hasOwnProperty(i)&&((s=N(i,o=t[i]))&&(a.push(s),u.push(s)))
for(i in n)n.hasOwnProperty(i)&&((s=N(i,o=n[i]))&&(a.push(s),g.push(s)))
for(l=0;l<u.length;l+=1)for(c=0;c<g.length;c+=1)o="long"===g[c].month?g[c].weekday?e.full:e.long:"short"===g[c].month?e.medium:e.short,(s=E(g[c],u[l])).originalPattern=o,s.extendedPattern=o.replace("{0}",u[l].extendedPattern).replace("{1}",g[c].extendedPattern).replace(/^[,\s]+|[,\s]+$/gi,""),a.push(L(s))
return a}(e)}(D.formats)
if(m=p(i,"formatMatcher","string",new r("basic","best fit"),"best fit"),D.formats=k,"basic"===m)z=function(e,r){for(var t=-1/0,n=void 0,a=0,i=r.length;a<i;){var o=r[a],s=0
for(var l in Te)if(Q.call(Te,l)){var c=e["[["+l+"]]"],u=Q.call(o,l)?o[l]:void 0
if(void 0===c&&void 0!==u)s-=20
else if(void 0!==c&&void 0===u)s-=120
else{var g=["2-digit","numeric","narrow","short","long"],f=re.call(g,c),m=re.call(g,u),v=Math.max(Math.min(m-f,2),-2)
2===v?s-=6:1===v?s-=3:-1===v?s-=6:-2===v&&(s-=8)}}s>t&&(t=s,n=o),a++}return n}(f,k)
else{var O=p(i,"hour12","boolean")
f.hour12=void 0===O?D.hour12:O,z=function(e,r){var t=[]
for(var n in Te)Q.call(Te,n)&&void 0!==e["[["+n+"]]"]&&t.push(n)
if(1===t.length){var a=function(e,r){var t
if(Pe[e]&&Pe[e][r])return t={originalPattern:Pe[e][r],_:K({},e,r),extendedPattern:"{"+e+"}"},K(t,e,r),K(t,"pattern12","{"+e+"}"),K(t,"pattern","{"+e+"}"),t}(t[0],e["[["+t[0]+"]]"])
if(a)return a}for(var i=-1/0,o=void 0,s=0,l=r.length;s<l;){var c=r[s],u=0
for(var g in Te)if(Q.call(Te,g)){var f=e["[["+g+"]]"],m=Q.call(c,g)?c[g]:void 0,v=Q.call(c._,g)?c._[g]:void 0
if(f!==v&&(u-=2),void 0===f&&void 0!==m)u-=20
else if(void 0!==f&&void 0===m)u-=120
else{var d=["2-digit","numeric","narrow","short","long"],h=re.call(d,f),p=re.call(d,m),y=Math.max(Math.min(p-h,2),-2)
p<=1&&h>=2||p>=2&&h<=1?y>0?u-=6:y<0&&(u-=8):y>1?u-=3:y<-1&&(u-=6)}}c._.hour12!==e.hour12&&(u-=1),u>i&&(i=u,o=c),s++}return o}(f,k)}for(var P in Te)if(Q.call(Te,P)&&Q.call(z,P)){var T=z[P]
T=z._&&Q.call(z._,P)?z._[P]:T,l["[["+P+"]]"]=T}var _=void 0,M=p(i,"hour12","boolean")
if(l["[[hour]]"])if(M=void 0===M?D.hour12:M,l["[[hour12]]"]=M,!0===M){var R=D.hourNo0
l["[[hourNo0]]"]=R,_=z.pattern12}else _=z.pattern
else _=z.pattern
return l["[[pattern]]"]=_,l["[[boundFormat]]"]=void 0,l["[[initializedDateTimeFormat]]"]=!0,J&&(n.format=A.call(n)),c(),n}function I(r,t,a){if(void 0===r)r=null
else{var i=n(r)
for(var o in r=new e,i)r[o]=i[o]}r=te(r)
var s=!0
return"date"!==t&&"any"!==t||void 0===r.weekday&&void 0===r.year&&void 0===r.month&&void 0===r.day||(s=!1),"time"!==t&&"any"!==t||void 0===r.hour&&void 0===r.minute&&void 0===r.second||(s=!1),!s||"date"!==a&&"all"!==a||(r.year=r.month=r.day="numeric"),!s||"time"!==a&&"all"!==a||(r.hour=r.minute=r.second="numeric"),r}function A(){var e=null!==this&&"object"===X.typeof(this)&&o(this)
if(!e||!e["[[initializedDateTimeFormat]]"])throw new TypeError("`this` value for format() is not an initialized Intl.DateTimeFormat object.")
if(void 0===e["[[boundFormat]]"]){var r=le.call((function(){var e=arguments.length<=0||void 0===arguments[0]?void 0:arguments[0],r=void 0===e?Date.now():a(e)
return q(this,r)}),this)
e["[[boundFormat]]"]=r}return e["[[boundFormat]]"]}function R(e,n){if(!isFinite(n))throw new RangeError("Invalid valid date passed to format")
var a=e.__getInternalProperties(ue)
t()
for(var i=a["[[locale]]"],o=new ze.NumberFormat([i],{useGrouping:!1}),s=new ze.NumberFormat([i],{minimumIntegerDigits:2,useGrouping:!1}),l=G(n,a["[[calendar]]"],a["[[timeZone]]"]),c=a["[[pattern]]"],u=new r,g=0,f=c.indexOf("{"),m=0,v=a["[[dataLocale]]"],d=ce.DateTimeFormat["[[localeData]]"][v].calendars,h=a["[[calendar]]"];-1!==f;){var p=void 0
if(-1===(m=c.indexOf("}",f)))throw new Error("Unclosed pattern")
f>g&&ie.call(u,{type:"literal",value:c.substring(g,f)})
var y=c.substring(f+1,m)
if(Te.hasOwnProperty(y)){var b=a["[["+y+"]]"],w=l["[["+y+"]]"]
if("year"===y&&w<=0?w=1-w:"month"===y?w++:"hour"===y&&!0===a["[[hour12]]"]&&(0===(w%=12)&&!0===a["[[hourNo0]]"]&&(w=12)),"numeric"===b)p=D(o,w)
else if("2-digit"===b)(p=D(s,w)).length>2&&(p=p.slice(-2))
else if(b in Ne)switch(y){case"month":p=T(d,h,"months",b,l["[["+y+"]]"])
break
case"weekday":try{p=T(d,h,"days",b,l["[["+y+"]]"])}catch(e){throw new Error("Could not find weekday data for locale "+i)}break
case"timeZoneName":p=""
break
case"era":try{p=T(d,h,"eras",b,l["[["+y+"]]"])}catch(e){throw new Error("Could not find era data for locale "+i)}break
default:p=l["[["+y+"]]"]}ie.call(u,{type:y,value:p})}else if("ampm"===y){p=T(d,h,"dayPeriods",l["[[hour]]"]>11?"pm":"am",null),ie.call(u,{type:"dayPeriod",value:p})}else ie.call(u,{type:"literal",value:c.substring(f,m+1)})
g=m+1,f=c.indexOf("{",g)}return m<c.length-1&&ie.call(u,{type:"literal",value:c.substr(m+1)}),u}function q(e,r){for(var t=R(e,r),n="",a=0;t.length>a;a++){n+=t[a].value}return n}function C(e,r){for(var t=R(e,r),n=[],a=0;t.length>a;a++){var i=t[a]
n.push({type:i.type,value:i.value})}return n}function G(r,t,n){var a=new Date(r),i="get"+(n||"")
return new e({"[[weekday]]":a[i+"Day"](),"[[era]]":+(a[i+"FullYear"]()>=0),"[[year]]":a[i+"FullYear"](),"[[month]]":a[i+"Month"](),"[[day]]":a[i+"Date"](),"[[hour]]":a[i+"Hours"](),"[[minute]]":a[i+"Minutes"](),"[[second]]":a[i+"Seconds"](),"[[inDST]]":!1})}function Z(e,r){if(!e.number)throw new Error("Object passed doesn't contain locale data for Intl.NumberFormat")
var t=void 0,n=[r],a=r.split("-")
for(a.length>2&&4===a[1].length&&ie.call(n,a[0]+"-"+a[2]);t=se.call(n);)ie.call(ce.NumberFormat["[[availableLocales]]"],t),ce.NumberFormat["[[localeData]]"][t]=e.number,e.date&&(e.date.nu=e.number.nu,ie.call(ce.DateTimeFormat["[[availableLocales]]"],t),ce.DateTimeFormat["[[localeData]]"][t]=e.date)
void 0===be&&function(e){be=e}(r)}var B="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},U=function(){var e="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103
return function(r,t,n,a){var i=r&&r.defaultProps,o=arguments.length-3
if(t||0===o||(t={}),t&&i)for(var s in i)void 0===t[s]&&(t[s]=i[s])
else t||(t=i||{})
if(1===o)t.children=a
else if(o>1){for(var l=Array(o),c=0;c<o;c++)l[c]=arguments[c+3]
t.children=l}return{$$typeof:e,type:r,key:void 0===n?null:""+n,ref:null,props:t,_owner:null}}}(),$=function(){function e(e,r){for(var t=0;t<r.length;t++){var n=r[t]
n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(r,t,n){return t&&e(r.prototype,t),n&&e(r,n),r}}(),K=function(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e},Y=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r]
for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e},H="undefined"==typeof global?self:global,W=function(e,r){if(Array.isArray(e))return e
if(Symbol.iterator in Object(e))return function(e,r){var t=[],n=!0,a=!1,i=void 0
try{for(var o,s=e[Symbol.iterator]();!(n=(o=s.next()).done)&&(t.push(o.value),!r||t.length!==r);n=!0);}catch(e){a=!0,i=e}finally{try{!n&&s.return&&s.return()}finally{if(a)throw i}}return t}(e,r)
throw new TypeError("Invalid attempt to destructure non-iterable instance")},X=Object.freeze({jsx:U,asyncToGenerator:function(e){return function(){var r=e.apply(this,arguments)
return new Promise((function(e,t){return function n(a,i){try{var o=r[a](i),s=o.value}catch(e){return void t(e)}return o.done?void e(s):Promise.resolve(s).then((function(e){return n("next",e)}),(function(e){return n("throw",e)}))}("next")}))}},classCallCheck:function(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")},createClass:$,defineEnumerableProperties:function(e,r){for(var t in r){var n=r[t]
n.configurable=n.enumerable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,t,n)}return e},defaults:function(e,r){for(var t=Object.getOwnPropertyNames(r),n=0;n<t.length;n++){var a=t[n],i=Object.getOwnPropertyDescriptor(r,a)
i&&i.configurable&&void 0===e[a]&&Object.defineProperty(e,a,i)}return e},defineProperty:K,get:function e(r,t,n){null===r&&(r=Function.prototype)
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
return!r||"object"!=typeof r&&"function"!=typeof r?e:r},selfGlobal:H,set:function e(r,t,n,a){var i=Object.getOwnPropertyDescriptor(r,t)
if(void 0===i){var o=Object.getPrototypeOf(r)
null!==o&&e(o,t,n,a)}else if("value"in i&&i.writable)i.value=n
else{var s=i.set
void 0!==s&&s.call(a,n)}return n},slicedToArray:W,slicedToArrayLoose:function(e,r){if(Array.isArray(e))return e
if(Symbol.iterator in Object(e)){for(var t,n=[],a=e[Symbol.iterator]();!(t=a.next()).done&&(n.push(t.value),!r||n.length!==r););return n}throw new TypeError("Invalid attempt to destructure non-iterable instance")},taggedTemplateLiteral:function(e,r){return Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(r)}}))},taggedTemplateLiteralLoose:function(e,r){return e.raw=r,e},temporalRef:function(e,r,t){if(e===t)throw new ReferenceError(r+" is not defined - temporal dead zone")
return e},temporalUndefined:{},toArray:function(e){return Array.isArray(e)?e:Array.from(e)},toConsumableArray:function(e){if(Array.isArray(e)){for(var r=0,t=Array(e.length);r<e.length;r++)t[r]=e[r]
return t}return Array.from(e)},typeof:B,extends:Y,instanceof:function(e,r){return null!=r&&"undefined"!=typeof Symbol&&r[Symbol.hasInstance]?r[Symbol.hasInstance](e):e instanceof r}}),V=function(){var e=function(){}
try{return Object.defineProperty(e,"a",{get:function(){return 1}}),Object.defineProperty(e,"prototype",{writable:!1}),1===e.a&&e.prototype instanceof Object}catch(e){return!1}}(),J=!V&&!Object.prototype.__defineGetter__,Q=Object.prototype.hasOwnProperty,ee=V?Object.defineProperty:function(e,r,t){"get"in t&&e.__defineGetter__?e.__defineGetter__(r,t.get):(!Q.call(e,r)||"value"in t)&&(e[r]=t.value)},re=Array.prototype.indexOf||function(e){var r=this
if(!r.length)return-1
for(var t=arguments[1]||0,n=r.length;t<n;t++)if(r[t]===e)return t
return-1},te=Object.create||function(e,r){function t(){}var n
for(var a in t.prototype=e,n=new t,r)Q.call(r,a)&&ee(n,a,r[a])
return n},ne=Array.prototype.slice,ae=Array.prototype.concat,ie=Array.prototype.push,oe=Array.prototype.join,se=Array.prototype.shift,le=Function.prototype.bind||function(e){var r=this,t=ne.call(arguments,1)
return r.length,function(){return r.apply(e,ae.call(t,ne.call(arguments)))}},ce=te(null),ue=Math.random()
e.prototype=te(null),r.prototype=te(null)
var ge="(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3})",fe="[0-9a-wy-z]",me=fe+"(?:-[a-z0-9]{2,8})+",ve="x(?:-[a-z0-9]{1,8})+",de=RegExp("^(?:(?:[a-z]{2,3}(?:-[a-z]{3}(?:-[a-z]{3}){0,2})?|[a-z]{4}|[a-z]{5,8})(?:-[a-z]{4})?(?:-(?:[a-z]{2}|\\d{3}))?(?:-(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3}))*(?:-[0-9a-wy-z](?:-[a-z0-9]{2,8})+)*(?:-x(?:-[a-z0-9]{1,8})+)?|"+ve+"|(?:(?:en-GB-oed|i-(?:ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu)|sgn-(?:BE-FR|BE-NL|CH-DE))|(?:art-lojban|cel-gaulish|no-bok|no-nyn|zh-(?:guoyu|hakka|min|min-nan|xiang))))$","i"),he=RegExp("^(?!x).*?-("+ge+")-(?:\\w{4,8}-(?!x-))*\\1\\b","i"),pe=RegExp("^(?!x).*?-("+fe+")-(?:\\w+-(?!x-))*\\1\\b","i"),ye=RegExp("-"+me,"ig"),be=void 0,we={tags:{"art-lojban":"jbo","i-ami":"ami","i-bnn":"bnn","i-hak":"hak","i-klingon":"tlh","i-lux":"lb","i-navajo":"nv","i-pwn":"pwn","i-tao":"tao","i-tay":"tay","i-tsu":"tsu","no-bok":"nb","no-nyn":"nn","sgn-BE-FR":"sfb","sgn-BE-NL":"vgt","sgn-CH-DE":"sgg","zh-guoyu":"cmn","zh-hakka":"hak","zh-min-nan":"nan","zh-xiang":"hsn","sgn-BR":"bzs","sgn-CO":"csn","sgn-DE":"gsg","sgn-DK":"dsl","sgn-ES":"ssp","sgn-FR":"fsl","sgn-GB":"bfi","sgn-GR":"gss","sgn-IE":"isg","sgn-IT":"ise","sgn-JP":"jsl","sgn-MX":"mfs","sgn-NI":"ncs","sgn-NL":"dse","sgn-NO":"nsl","sgn-PT":"psr","sgn-SE":"swl","sgn-US":"ase","sgn-ZA":"sfs","zh-cmn":"cmn","zh-cmn-Hans":"cmn-Hans","zh-cmn-Hant":"cmn-Hant","zh-gan":"gan","zh-wuu":"wuu","zh-yue":"yue"},subtags:{BU:"MM",DD:"DE",FX:"FR",TP:"TL",YD:"YE",ZR:"CD",heploc:"alalc97",in:"id",iw:"he",ji:"yi",jw:"jv",mo:"ro",ayx:"nun",bjd:"drl",ccq:"rki",cjr:"mom",cka:"cmr",cmk:"xch",drh:"khk",drw:"prs",gav:"dev",hrr:"jal",ibi:"opa",kgh:"kml",lcq:"ppr",mst:"mry",myt:"mry",sca:"hle",tie:"ras",tkk:"twm",tlw:"weo",tnf:"prs",ybd:"rki",yma:"lrr"},extLang:{aao:["aao","ar"],abh:["abh","ar"],abv:["abv","ar"],acm:["acm","ar"],acq:["acq","ar"],acw:["acw","ar"],acx:["acx","ar"],acy:["acy","ar"],adf:["adf","ar"],ads:["ads","sgn"],aeb:["aeb","ar"],aec:["aec","ar"],aed:["aed","sgn"],aen:["aen","sgn"],afb:["afb","ar"],afg:["afg","sgn"],ajp:["ajp","ar"],apc:["apc","ar"],apd:["apd","ar"],arb:["arb","ar"],arq:["arq","ar"],ars:["ars","ar"],ary:["ary","ar"],arz:["arz","ar"],ase:["ase","sgn"],asf:["asf","sgn"],asp:["asp","sgn"],asq:["asq","sgn"],asw:["asw","sgn"],auz:["auz","ar"],avl:["avl","ar"],ayh:["ayh","ar"],ayl:["ayl","ar"],ayn:["ayn","ar"],ayp:["ayp","ar"],bbz:["bbz","ar"],bfi:["bfi","sgn"],bfk:["bfk","sgn"],bjn:["bjn","ms"],bog:["bog","sgn"],bqn:["bqn","sgn"],bqy:["bqy","sgn"],btj:["btj","ms"],bve:["bve","ms"],bvl:["bvl","sgn"],bvu:["bvu","ms"],bzs:["bzs","sgn"],cdo:["cdo","zh"],cds:["cds","sgn"],cjy:["cjy","zh"],cmn:["cmn","zh"],coa:["coa","ms"],cpx:["cpx","zh"],csc:["csc","sgn"],csd:["csd","sgn"],cse:["cse","sgn"],csf:["csf","sgn"],csg:["csg","sgn"],csl:["csl","sgn"],csn:["csn","sgn"],csq:["csq","sgn"],csr:["csr","sgn"],czh:["czh","zh"],czo:["czo","zh"],doq:["doq","sgn"],dse:["dse","sgn"],dsl:["dsl","sgn"],dup:["dup","ms"],ecs:["ecs","sgn"],esl:["esl","sgn"],esn:["esn","sgn"],eso:["eso","sgn"],eth:["eth","sgn"],fcs:["fcs","sgn"],fse:["fse","sgn"],fsl:["fsl","sgn"],fss:["fss","sgn"],gan:["gan","zh"],gds:["gds","sgn"],gom:["gom","kok"],gse:["gse","sgn"],gsg:["gsg","sgn"],gsm:["gsm","sgn"],gss:["gss","sgn"],gus:["gus","sgn"],hab:["hab","sgn"],haf:["haf","sgn"],hak:["hak","zh"],hds:["hds","sgn"],hji:["hji","ms"],hks:["hks","sgn"],hos:["hos","sgn"],hps:["hps","sgn"],hsh:["hsh","sgn"],hsl:["hsl","sgn"],hsn:["hsn","zh"],icl:["icl","sgn"],ils:["ils","sgn"],inl:["inl","sgn"],ins:["ins","sgn"],ise:["ise","sgn"],isg:["isg","sgn"],isr:["isr","sgn"],jak:["jak","ms"],jax:["jax","ms"],jcs:["jcs","sgn"],jhs:["jhs","sgn"],jls:["jls","sgn"],jos:["jos","sgn"],jsl:["jsl","sgn"],jus:["jus","sgn"],kgi:["kgi","sgn"],knn:["knn","kok"],kvb:["kvb","ms"],kvk:["kvk","sgn"],kvr:["kvr","ms"],kxd:["kxd","ms"],lbs:["lbs","sgn"],lce:["lce","ms"],lcf:["lcf","ms"],liw:["liw","ms"],lls:["lls","sgn"],lsg:["lsg","sgn"],lsl:["lsl","sgn"],lso:["lso","sgn"],lsp:["lsp","sgn"],lst:["lst","sgn"],lsy:["lsy","sgn"],ltg:["ltg","lv"],lvs:["lvs","lv"],lzh:["lzh","zh"],max:["max","ms"],mdl:["mdl","sgn"],meo:["meo","ms"],mfa:["mfa","ms"],mfb:["mfb","ms"],mfs:["mfs","sgn"],min:["min","ms"],mnp:["mnp","zh"],mqg:["mqg","ms"],mre:["mre","sgn"],msd:["msd","sgn"],msi:["msi","ms"],msr:["msr","sgn"],mui:["mui","ms"],mzc:["mzc","sgn"],mzg:["mzg","sgn"],mzy:["mzy","sgn"],nan:["nan","zh"],nbs:["nbs","sgn"],ncs:["ncs","sgn"],nsi:["nsi","sgn"],nsl:["nsl","sgn"],nsp:["nsp","sgn"],nsr:["nsr","sgn"],nzs:["nzs","sgn"],okl:["okl","sgn"],orn:["orn","ms"],ors:["ors","ms"],pel:["pel","ms"],pga:["pga","ar"],pks:["pks","sgn"],prl:["prl","sgn"],prz:["prz","sgn"],psc:["psc","sgn"],psd:["psd","sgn"],pse:["pse","ms"],psg:["psg","sgn"],psl:["psl","sgn"],pso:["pso","sgn"],psp:["psp","sgn"],psr:["psr","sgn"],pys:["pys","sgn"],rms:["rms","sgn"],rsi:["rsi","sgn"],rsl:["rsl","sgn"],sdl:["sdl","sgn"],sfb:["sfb","sgn"],sfs:["sfs","sgn"],sgg:["sgg","sgn"],sgx:["sgx","sgn"],shu:["shu","ar"],slf:["slf","sgn"],sls:["sls","sgn"],sqk:["sqk","sgn"],sqs:["sqs","sgn"],ssh:["ssh","ar"],ssp:["ssp","sgn"],ssr:["ssr","sgn"],svk:["svk","sgn"],swc:["swc","sw"],swh:["swh","sw"],swl:["swl","sgn"],syy:["syy","sgn"],tmw:["tmw","ms"],tse:["tse","sgn"],tsm:["tsm","sgn"],tsq:["tsq","sgn"],tss:["tss","sgn"],tsy:["tsy","sgn"],tza:["tza","sgn"],ugn:["ugn","sgn"],ugy:["ugy","sgn"],ukl:["ukl","sgn"],uks:["uks","sgn"],urk:["urk","ms"],uzn:["uzn","uz"],uzs:["uzs","uz"],vgt:["vgt","sgn"],vkk:["vkk","ms"],vkt:["vkt","ms"],vsi:["vsi","sgn"],vsl:["vsl","sgn"],vsv:["vsv","sgn"],wuu:["wuu","zh"],xki:["xki","sgn"],xml:["xml","sgn"],xmm:["xmm","ms"],xms:["xms","sgn"],yds:["yds","sgn"],ysl:["ysl","sgn"],yue:["yue","zh"],zib:["zib","sgn"],zlm:["zlm","ms"],zmi:["zmi","ms"],zsl:["zsl","sgn"],zsm:["zsm","ms"]}},xe=/^[A-Z]{3}$/,je=/-u(?:-[0-9a-z]{2,8})+/gi,ze={}
Object.defineProperty(ze,"getCanonicalLocales",{enumerable:!1,configurable:!0,writable:!0,value:function(e){for(var r=g(e),t=[],n=r.length,a=0;a<n;)t[a]=r[a],a++
return t}})
var De={BHD:3,BYR:0,XOF:0,BIF:0,XAF:0,CLF:4,CLP:0,KMF:0,DJF:0,XPF:0,GNF:0,ISK:0,IQD:3,JPY:0,JOD:3,KRW:0,KWD:3,LYD:3,OMR:3,PYG:0,RWF:0,TND:3,UGX:0,UYI:0,VUV:0,VND:0}
ee(ze,"NumberFormat",{configurable:!0,writable:!0,value:b}),ee(ze.NumberFormat,"prototype",{writable:!1}),ce.NumberFormat={"[[availableLocales]]":[],"[[relevantExtensionKeys]]":["nu"],"[[localeData]]":{}},ee(ze.NumberFormat,"supportedLocalesOf",{configurable:!0,writable:!0,value:le.call((function(e){if(!Q.call(this,"[[availableLocales]]"))throw new TypeError("supportedLocalesOf() is not a constructor")
var r=t(),n=arguments[1],a=this["[[availableLocales]]"],i=g(e)
return r(),h(a,i,n)}),ce.NumberFormat)}),ee(ze.NumberFormat.prototype,"format",{configurable:!0,get:x}),Object.defineProperty(ze.NumberFormat.prototype,"formatToParts",{configurable:!0,enumerable:!1,writable:!0,value:function(){var e=arguments.length<=0||void 0===arguments[0]?void 0:arguments[0],r=null!==this&&"object"===X.typeof(this)&&o(this)
if(!r||!r["[[initializedNumberFormat]]"])throw new TypeError("`this` value for formatToParts() is not an initialized Intl.NumberFormat object.")
var t=Number(e)
return j(this,t)}})
var ke={arab:["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"],arabext:["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"],bali:["᭐","᭑","᭒","᭓","᭔","᭕","᭖","᭗","᭘","᭙"],beng:["০","১","২","৩","৪","৫","৬","৭","৮","৯"],deva:["०","१","२","३","४","५","६","७","८","९"],fullwide:["０","１","２","３","４","５","６","７","８","９"],gujr:["૦","૧","૨","૩","૪","૫","૬","૭","૮","૯"],guru:["੦","੧","੨","੩","੪","੫","੬","੭","੮","੯"],hanidec:["〇","一","二","三","四","五","六","七","八","九"],khmr:["០","១","២","៣","៤","៥","៦","៧","៨","៩"],knda:["೦","೧","೨","೩","೪","೫","೬","೭","೮","೯"],laoo:["໐","໑","໒","໓","໔","໕","໖","໗","໘","໙"],latn:["0","1","2","3","4","5","6","7","8","9"],limb:["᥆","᥇","᥈","᥉","᥊","᥋","᥌","᥍","᥎","᥏"],mlym:["൦","൧","൨","൩","൪","൫","൬","൭","൮","൯"],mong:["᠐","᠑","᠒","᠓","᠔","᠕","᠖","᠗","᠘","᠙"],mymr:["၀","၁","၂","၃","၄","၅","၆","၇","၈","၉"],orya:["୦","୧","୨","୩","୪","୫","୬","୭","୮","୯"],tamldec:["௦","௧","௨","௩","௪","௫","௬","௭","௮","௯"],telu:["౦","౧","౨","౩","౪","౫","౬","౭","౮","౯"],thai:["๐","๑","๒","๓","๔","๕","๖","๗","๘","๙"],tibt:["༠","༡","༢","༣","༤","༥","༦","༧","༨","༩"]}
ee(ze.NumberFormat.prototype,"resolvedOptions",{configurable:!0,writable:!0,value:function(){var r=void 0,t=new e,n=["locale","numberingSystem","style","currency","currencyDisplay","minimumIntegerDigits","minimumFractionDigits","maximumFractionDigits","minimumSignificantDigits","maximumSignificantDigits","useGrouping"],a=null!==this&&"object"===X.typeof(this)&&o(this)
if(!a||!a["[[initializedNumberFormat]]"])throw new TypeError("`this` value for resolvedOptions() is not an initialized Intl.NumberFormat object.")
for(var i=0,s=n.length;i<s;i++)Q.call(a,r="[["+n[i]+"]]")&&(t[n[i]]={value:a[r],writable:!0,configurable:!0,enumerable:!0})
return te({},t)}})
var Oe=/(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g,Fe=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,Se=/[rqQASjJgwWIQq]/,Ee=["era","year","month","day","weekday","quarter"],Le=["hour","minute","second","hour12","timeZoneName"],Pe={second:{numeric:"s","2-digit":"ss"},minute:{numeric:"m","2-digit":"mm"},year:{numeric:"y","2-digit":"yy"},day:{numeric:"d","2-digit":"dd"},month:{numeric:"L","2-digit":"LL",narrow:"LLLLL",short:"LLL",long:"LLLL"},weekday:{narrow:"ccccc",short:"ccc",long:"cccc"}},Ne=te(null,{narrow:{},short:{},long:{}})
ee(ze,"DateTimeFormat",{configurable:!0,writable:!0,value:_}),ee(_,"prototype",{writable:!1})
var Te={weekday:["narrow","short","long"],era:["narrow","short","long"],year:["2-digit","numeric"],month:["2-digit","numeric","narrow","short","long"],day:["2-digit","numeric"],hour:["2-digit","numeric"],minute:["2-digit","numeric"],second:["2-digit","numeric"],timeZoneName:["short","long"]}
ce.DateTimeFormat={"[[availableLocales]]":[],"[[relevantExtensionKeys]]":["ca","nu"],"[[localeData]]":{}},ee(ze.DateTimeFormat,"supportedLocalesOf",{configurable:!0,writable:!0,value:le.call((function(e){if(!Q.call(this,"[[availableLocales]]"))throw new TypeError("supportedLocalesOf() is not a constructor")
var r=t(),n=arguments[1],a=this["[[availableLocales]]"],i=g(e)
return r(),h(a,i,n)}),ce.NumberFormat)}),ee(ze.DateTimeFormat.prototype,"format",{configurable:!0,get:A}),Object.defineProperty(ze.DateTimeFormat.prototype,"formatToParts",{enumerable:!1,writable:!0,configurable:!0,value:function(){var e=arguments.length<=0||void 0===arguments[0]?void 0:arguments[0],r=null!==this&&"object"===X.typeof(this)&&o(this)
if(!r||!r["[[initializedDateTimeFormat]]"])throw new TypeError("`this` value for formatToParts() is not an initialized Intl.DateTimeFormat object.")
var t=void 0===e?Date.now():a(e)
return C(this,t)}}),ee(ze.DateTimeFormat.prototype,"resolvedOptions",{writable:!0,configurable:!0,value:function(){var r=void 0,t=new e,n=["locale","calendar","numberingSystem","timeZone","hour12","weekday","era","year","month","day","hour","minute","second","timeZoneName"],a=null!==this&&"object"===X.typeof(this)&&o(this)
if(!a||!a["[[initializedDateTimeFormat]]"])throw new TypeError("`this` value for resolvedOptions() is not an initialized Intl.DateTimeFormat object.")
for(var i=0,s=n.length;i<s;i++)Q.call(a,r="[["+n[i]+"]]")&&(t[n[i]]={value:a[r],writable:!0,configurable:!0,enumerable:!0})
return te({},t)}})
var _e=ze.__localeSensitiveProtos={Number:{},Date:{}}
if(_e.Number.toLocaleString=function(){if("[object Number]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a number for Number.prototype.toLocaleString()")
return D(new b(arguments[0],arguments[1]),this)},_e.Date.toLocaleString=function(){if("[object Date]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a Date instance for Date.prototype.toLocaleString()")
var e=+this
if(isNaN(e))return"Invalid Date"
var r=arguments[0],t=arguments[1],n=new _(r,t=I(t,"any","all"))
return q(n,e)},_e.Date.toLocaleDateString=function(){if("[object Date]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a Date instance for Date.prototype.toLocaleDateString()")
var e=+this
if(isNaN(e))return"Invalid Date"
var r=arguments[0],t=arguments[1],n=new _(r,t=I(t,"date","date"))
return q(n,e)},_e.Date.toLocaleTimeString=function(){if("[object Date]"!==Object.prototype.toString.call(this))throw new TypeError("`this` value must be a Date instance for Date.prototype.toLocaleTimeString()")
var e=+this
if(isNaN(e))return"Invalid Date"
var r=arguments[0],t=arguments[1],n=new _(r,t=I(t,"time","time"))
return q(n,e)},ee(ze,"__applyLocaleSensitivePrototypes",{writable:!0,configurable:!0,value:function(){for(var e in ee(Number.prototype,"toLocaleString",{writable:!0,configurable:!0,value:_e.Number.toLocaleString}),ee(Date.prototype,"toLocaleString",{writable:!0,configurable:!0,value:_e.Date.toLocaleString}),_e.Date)Q.call(_e.Date,e)&&ee(Date.prototype,e,{writable:!0,configurable:!0,value:_e.Date[e]})}}),ee(ze,"__addLocaleData",{value:function(e){if(!l(e.locale))throw new Error("Object passed doesn't identify itself with a valid language tag")
Z(e,e.locale)}}),ee(ze,"__disableRegExpRestore",{value:function(){ce.disableRegExpRestore=!0}}),"undefined"==typeof Intl)try{window.Intl=ze,ze.__applyLocaleSensitivePrototypes()}catch(Me){}return ze}))
