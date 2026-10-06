var Ga="160";var pf=0,Kc=1,mf=2;var vu=1,gf=2,Rn=3,cn=0,Ce=1,ke=2;var Wn=0,Gi=1,jc=2,Qc=3,tl=4,_f=5,li=100,xf=101,yf=102,el=103,nl=104,vf=200,Mf=201,Sf=202,bf=203,ra=204,oa=205,Af=206,Tf=207,Ef=208,wf=209,Rf=210,Cf=211,Pf=212,If=213,Lf=214,Df=0,Uf=1,Nf=2,pr=3,Ff=4,Of=5,Bf=6,zf=7,Mu=0,kf=1,Vf=2,Xn=0,Hf=1,Gf=2,Wf=3,Xf=4,qf=5,Yf=6;var Su=300,qi=301,Yi=302,aa=303,ca=304,Nr=306,la=1e3,on=1001,ua=1002,Ue=1003,il=1004;var Ro=1005;var $e=1006,Zf=1007;var bs=1008;var qn=1009,Jf=1010,$f=1011,Wa=1012,bu=1013,Hn=1014,Gn=1015,As=1016,Au=1017,Tu=1018,hi=1020,Kf=1021,an=1023,jf=1024,Qf=1025,fi=1026,Zi=1027,td=1028,Eu=1029,ed=1030,wu=1031,Ru=1033,Co=33776,Po=33777,Io=33778,Lo=33779,sl=35840,rl=35841,ol=35842,al=35843,Cu=36196,cl=37492,ll=37496,ul=37808,hl=37809,fl=37810,dl=37811,pl=37812,ml=37813,gl=37814,_l=37815,xl=37816,yl=37817,vl=37818,Ml=37819,Sl=37820,bl=37821,Do=36492,Al=36494,Tl=36495,nd=36283,El=36284,wl=36285,Rl=36286;var mr=2300,gr=2301,Uo=2302,Cl=2400,Pl=2401,Il=2402;var Pu=3e3,di=3001,id=3200,sd=3201,rd=0,od=1,Ke="",Te="srgb",Pn="srgb-linear",Xa="display-p3",Fr="display-p3-linear",_r="linear",te="srgb",xr="rec709",yr="p3";var Ai=7680;var Ll=519,ad=512,cd=513,ld=514,Iu=515,ud=516,hd=517,fd=518,dd=519,Dl=35044;var Ul="300 es",ha=1035,Cn=2e3,vr=2001,Yn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},we=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var No=Math.PI/180,fa=180/Math.PI;function ws(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(we[i&255]+we[i>>8&255]+we[i>>16&255]+we[i>>24&255]+"-"+we[t&255]+we[t>>8&255]+"-"+we[t>>16&15|64]+we[t>>24&255]+"-"+we[e&63|128]+we[e>>8&255]+"-"+we[e>>16&255]+we[e>>24&255]+we[n&255]+we[n>>8&255]+we[n>>16&255]+we[n>>24&255]).toLowerCase()}function Ne(i,t,e){return Math.max(t,Math.min(e,i))}function pd(i,t){return(i%t+t)%t}function Fo(i,t,e){return(1-e)*i+e*t}function Nl(i){return(i&i-1)===0&&i!==0}function da(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function gs(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ze(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Ct=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ne(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Dt=class i{constructor(t,e,n,s,r,a,o,c,l){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,l)}set(t,e,n,s,r,a,o,c,l){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=c,u[6]=n,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],u=n[4],d=n[7],h=n[2],p=n[5],_=n[8],x=s[0],m=s[3],f=s[6],y=s[1],g=s[4],M=s[7],A=s[2],T=s[5],S=s[8];return r[0]=a*x+o*y+c*A,r[3]=a*m+o*g+c*T,r[6]=a*f+o*M+c*S,r[1]=l*x+u*y+d*A,r[4]=l*m+u*g+d*T,r[7]=l*f+u*M+d*S,r[2]=h*x+p*y+_*A,r[5]=h*m+p*g+_*T,r[8]=h*f+p*M+_*S,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8];return e*a*u-e*o*l-n*r*u+n*o*c+s*r*l-s*a*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8],d=u*a-o*l,h=o*c-u*r,p=l*r-a*c,_=e*d+n*h+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/_;return t[0]=d*x,t[1]=(s*l-u*n)*x,t[2]=(o*n-s*a)*x,t[3]=h*x,t[4]=(u*e-s*c)*x,t[5]=(s*r-o*e)*x,t[6]=p*x,t[7]=(n*c-l*e)*x,t[8]=(a*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+t,-s*l,s*c,-s*(-l*a+c*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Oo.makeScale(t,e)),this}rotate(t){return this.premultiply(Oo.makeRotation(-t)),this}translate(t,e){return this.premultiply(Oo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Oo=new Dt;function Lu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Mr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function md(){let i=Mr("canvas");return i.style.display="block",i}var Fl={};function Ms(i){i in Fl||(Fl[i]=!0,console.warn(i))}var Ol=new Dt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Bl=new Dt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ws={[Pn]:{transfer:_r,primaries:xr,toReference:i=>i,fromReference:i=>i},[Te]:{transfer:te,primaries:xr,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Fr]:{transfer:_r,primaries:yr,toReference:i=>i.applyMatrix3(Bl),fromReference:i=>i.applyMatrix3(Ol)},[Xa]:{transfer:te,primaries:yr,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Bl),fromReference:i=>i.applyMatrix3(Ol).convertLinearToSRGB()}},gd=new Set([Pn,Fr]),qt={enabled:!0,_workingColorSpace:Pn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!gd.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;let n=Ws[t].toReference,s=Ws[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return Ws[i].primaries},getTransfer:function(i){return i===Ke?_r:Ws[i].transfer}};function Wi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Bo(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ti,Sr=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ti===void 0&&(Ti=Mr("canvas")),Ti.width=t.width,Ti.height=t.height;let n=Ti.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Ti}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Mr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Wi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Wi(e[n]/255)*255):e[n]=Wi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},_d=0,br=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_d++}),this.uuid=ws(),this.data=t,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(zo(s[a].image)):r.push(zo(s[a]))}else r=zo(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function zo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Sr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var xd=0,ln=class i extends Yn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=on,s=on,r=$e,a=bs,o=an,c=qn,l=i.DEFAULT_ANISOTROPY,u=Ke){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:xd++}),this.uuid=ws(),this.name="",this.source=new br(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Ct(0,0),this.repeat=new Ct(1,1),this.center=new Ct(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Dt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(Ms("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===di?Te:Ke),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Su)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case la:t.x=t.x-Math.floor(t.x);break;case on:t.x=t.x<0?0:1;break;case ua:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case la:t.y=t.y-Math.floor(t.y);break;case on:t.y=t.y<0?0:1;break;case ua:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Ms("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===Te?di:Pu}set encoding(t){Ms("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=t===di?Te:Ke}};ln.DEFAULT_IMAGE=null;ln.DEFAULT_MAPPING=Su;ln.DEFAULT_ANISOTROPY=1;var Qt=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,l=c[0],u=c[4],d=c[8],h=c[1],p=c[5],_=c[9],x=c[2],m=c[6],f=c[10];if(Math.abs(u-h)<.01&&Math.abs(d-x)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+x)<.1&&Math.abs(_+m)<.1&&Math.abs(l+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let g=(l+1)/2,M=(p+1)/2,A=(f+1)/2,T=(u+h)/4,S=(d+x)/4,I=(_+m)/4;return g>M&&g>A?g<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(g),s=T/n,r=S/n):M>A?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=T/s,r=I/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=S/r,s=I/r),this.set(n,s,r,e),this}let y=Math.sqrt((m-_)*(m-_)+(d-x)*(d-x)+(h-u)*(h-u));return Math.abs(y)<.001&&(y=1),this.x=(m-_)/y,this.y=(d-x)/y,this.z=(h-u)/y,this.w=Math.acos((l+p+f-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},pa=class extends Yn{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Qt(0,0,t,e),this.scissorTest=!1,this.viewport=new Qt(0,0,t,e);let s={width:t,height:e,depth:1};n.encoding!==void 0&&(Ms("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===di?Te:Ke),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:$e,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new ln(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(t,e,n=1){(this.width!==t||this.height!==e||this.depth!==n)&&(this.width=t,this.height=e,this.depth=n,this.texture.image.width=t,this.texture.image.height=e,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.texture=t.texture.clone(),this.texture.isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new br(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},In=class extends pa{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Ar=class extends ln{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ue,this.minFilter=Ue,this.wrapR=on,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ma=class extends ln{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ue,this.minFilter=Ue,this.wrapR=on,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Zn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let c=n[s+0],l=n[s+1],u=n[s+2],d=n[s+3],h=r[a+0],p=r[a+1],_=r[a+2],x=r[a+3];if(o===0){t[e+0]=c,t[e+1]=l,t[e+2]=u,t[e+3]=d;return}if(o===1){t[e+0]=h,t[e+1]=p,t[e+2]=_,t[e+3]=x;return}if(d!==x||c!==h||l!==p||u!==_){let m=1-o,f=c*h+l*p+u*_+d*x,y=f>=0?1:-1,g=1-f*f;if(g>Number.EPSILON){let A=Math.sqrt(g),T=Math.atan2(A,f*y);m=Math.sin(m*T)/A,o=Math.sin(o*T)/A}let M=o*y;if(c=c*m+h*M,l=l*m+p*M,u=u*m+_*M,d=d*m+x*M,m===1-o){let A=1/Math.sqrt(c*c+l*l+u*u+d*d);c*=A,l*=A,u*=A,d*=A}}t[e]=c,t[e+1]=l,t[e+2]=u,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],u=n[s+3],d=r[a],h=r[a+1],p=r[a+2],_=r[a+3];return t[e]=o*_+u*d+c*p-l*h,t[e+1]=c*_+u*h+l*d-o*p,t[e+2]=l*_+u*p+o*h-c*d,t[e+3]=u*_-o*d-c*h-l*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,l=o(n/2),u=o(s/2),d=o(r/2),h=c(n/2),p=c(s/2),_=c(r/2);switch(a){case"XYZ":this._x=h*u*d+l*p*_,this._y=l*p*d-h*u*_,this._z=l*u*_+h*p*d,this._w=l*u*d-h*p*_;break;case"YXZ":this._x=h*u*d+l*p*_,this._y=l*p*d-h*u*_,this._z=l*u*_-h*p*d,this._w=l*u*d+h*p*_;break;case"ZXY":this._x=h*u*d-l*p*_,this._y=l*p*d+h*u*_,this._z=l*u*_+h*p*d,this._w=l*u*d-h*p*_;break;case"ZYX":this._x=h*u*d-l*p*_,this._y=l*p*d+h*u*_,this._z=l*u*_-h*p*d,this._w=l*u*d+h*p*_;break;case"YZX":this._x=h*u*d+l*p*_,this._y=l*p*d+h*u*_,this._z=l*u*_-h*p*d,this._w=l*u*d-h*p*_;break;case"XZY":this._x=h*u*d-l*p*_,this._y=l*p*d-h*u*_,this._z=l*u*_+h*p*d,this._w=l*u*d+h*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],c=e[9],l=e[2],u=e[6],d=e[10],h=n+o+d;if(h>0){let p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(u-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+u)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ne(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,c=e._y,l=e._z,u=e._w;return this._x=n*u+a*o+s*l-r*c,this._y=s*u+a*c+r*o-n*l,this._z=r*u+a*l+n*c-s*o,this._w=a*u-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let c=1-o*o;if(c<=Number.EPSILON){let p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}let l=Math.sqrt(c),u=Math.atan2(l,o),d=Math.sin((1-e)*u)/l,h=Math.sin(e*u)/l;return this._w=a*d+this._w*h,this._x=n*d+this._x*h,this._y=s*d+this._y*h,this._z=r*d+this._z*h,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=Math.random(),e=Math.sqrt(1-t),n=Math.sqrt(t),s=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(e*Math.cos(s),n*Math.sin(r),n*Math.cos(r),e*Math.sin(s))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(zl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(zl.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,c=t.w,l=2*(a*s-o*n),u=2*(o*e-r*s),d=2*(r*n-a*e);return this.x=e+c*l+a*d-o*u,this.y=n+c*u+o*l-r*d,this.z=s+c*d+r*u-a*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ko.copy(this).projectOnVector(t),this.sub(ko)}reflect(t){return this.sub(ko.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ne(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=(Math.random()-.5)*2,e=Math.random()*Math.PI*2,n=Math.sqrt(1-t**2);return this.x=n*Math.cos(e),this.y=n*Math.sin(e),this.z=t,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ko=new D,zl=new Zn,le=class{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(nn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(nn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=nn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,nn):nn.fromBufferAttribute(r,a),nn.applyMatrix4(t.matrixWorld),this.expandByPoint(nn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Xs.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Xs.copy(n.boundingBox)),Xs.applyMatrix4(t.matrixWorld),this.union(Xs)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return!(t.x<this.min.x||t.x>this.max.x||t.y<this.min.y||t.y>this.max.y||t.z<this.min.z||t.z>this.max.z)}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return!(t.max.x<this.min.x||t.min.x>this.max.x||t.max.y<this.min.y||t.min.y>this.max.y||t.max.z<this.min.z||t.min.z>this.max.z)}intersectsSphere(t){return this.clampPoint(t.center,nn),nn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(_s),qs.subVectors(this.max,_s),Ei.subVectors(t.a,_s),wi.subVectors(t.b,_s),Ri.subVectors(t.c,_s),On.subVectors(wi,Ei),Bn.subVectors(Ri,wi),si.subVectors(Ei,Ri);let e=[0,-On.z,On.y,0,-Bn.z,Bn.y,0,-si.z,si.y,On.z,0,-On.x,Bn.z,0,-Bn.x,si.z,0,-si.x,-On.y,On.x,0,-Bn.y,Bn.x,0,-si.y,si.x,0];return!Vo(e,Ei,wi,Ri,qs)||(e=[1,0,0,0,1,0,0,0,1],!Vo(e,Ei,wi,Ri,qs))?!1:(Ys.crossVectors(On,Bn),e=[Ys.x,Ys.y,Ys.z],Vo(e,Ei,wi,Ri,qs))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,nn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(nn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(bn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},bn=[new D,new D,new D,new D,new D,new D,new D,new D],nn=new D,Xs=new le,Ei=new D,wi=new D,Ri=new D,On=new D,Bn=new D,si=new D,_s=new D,qs=new D,Ys=new D,ri=new D;function Vo(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ri.fromArray(i,r);let o=s.x*Math.abs(ri.x)+s.y*Math.abs(ri.y)+s.z*Math.abs(ri.z),c=t.dot(ri),l=e.dot(ri),u=n.dot(ri);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var yd=new le,xs=new D,Ho=new D,pi=class{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):yd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;xs.subVectors(t,this.center);let e=xs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(xs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ho.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(xs.copy(t.center).add(Ho)),this.expandByPoint(xs.copy(t.center).sub(Ho))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},An=new D,Go=new D,Zs=new D,zn=new D,Wo=new D,Js=new D,Xo=new D,mi=class{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,An)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=An.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(An.copy(this.origin).addScaledVector(this.direction,e),An.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Go.copy(t).add(e).multiplyScalar(.5),Zs.copy(e).sub(t).normalize(),zn.copy(this.origin).sub(Go);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Zs),o=zn.dot(this.direction),c=-zn.dot(Zs),l=zn.lengthSq(),u=Math.abs(1-a*a),d,h,p,_;if(u>0)if(d=a*c-o,h=a*o-c,_=r*u,d>=0)if(h>=-_)if(h<=_){let x=1/u;d*=x,h*=x,p=d*(d+a*h+2*o)+h*(a*d+h+2*c)+l}else h=r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*c)+l;else h=-r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*c)+l;else h<=-_?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-c),r),p=-d*d+h*(h+2*c)+l):h<=_?(d=0,h=Math.min(Math.max(-r,-c),r),p=h*(h+2*c)+l):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-c),r),p=-d*d+h*(h+2*c)+l);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Go).addScaledVector(Zs,h),p}intersectSphere(t,e){An.subVectors(t.center,this.origin);let n=An.dot(this.direction),s=An.dot(An)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,c,l=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return l>=0?(n=(t.min.x-h.x)*l,s=(t.max.x-h.x)*l):(n=(t.max.x-h.x)*l,s=(t.min.x-h.x)*l),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(t.min.z-h.z)*d,c=(t.max.z-h.z)*d):(o=(t.max.z-h.z)*d,c=(t.min.z-h.z)*d),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,An)!==null}intersectTriangle(t,e,n,s,r){Wo.subVectors(e,t),Js.subVectors(n,t),Xo.crossVectors(Wo,Js);let a=this.direction.dot(Xo),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;zn.subVectors(this.origin,t);let c=o*this.direction.dot(Js.crossVectors(zn,Js));if(c<0)return null;let l=o*this.direction.dot(Wo.cross(zn));if(l<0||c+l>a)return null;let u=-o*zn.dot(Xo);return u<0?null:this.at(u/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},kt=class i{constructor(t,e,n,s,r,a,o,c,l,u,d,h,p,_,x,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,l,u,d,h,p,_,x,m)}set(t,e,n,s,r,a,o,c,l,u,d,h,p,_,x,m){let f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=c,f[2]=l,f[6]=u,f[10]=d,f[14]=h,f[3]=p,f[7]=_,f[11]=x,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Ci.setFromMatrixColumn(t,0).length(),r=1/Ci.setFromMatrixColumn(t,1).length(),a=1/Ci.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let h=a*u,p=a*d,_=o*u,x=o*d;e[0]=c*u,e[4]=-c*d,e[8]=l,e[1]=p+_*l,e[5]=h-x*l,e[9]=-o*c,e[2]=x-h*l,e[6]=_+p*l,e[10]=a*c}else if(t.order==="YXZ"){let h=c*u,p=c*d,_=l*u,x=l*d;e[0]=h+x*o,e[4]=_*o-p,e[8]=a*l,e[1]=a*d,e[5]=a*u,e[9]=-o,e[2]=p*o-_,e[6]=x+h*o,e[10]=a*c}else if(t.order==="ZXY"){let h=c*u,p=c*d,_=l*u,x=l*d;e[0]=h-x*o,e[4]=-a*d,e[8]=_+p*o,e[1]=p+_*o,e[5]=a*u,e[9]=x-h*o,e[2]=-a*l,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let h=a*u,p=a*d,_=o*u,x=o*d;e[0]=c*u,e[4]=_*l-p,e[8]=h*l+x,e[1]=c*d,e[5]=x*l+h,e[9]=p*l-_,e[2]=-l,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let h=a*c,p=a*l,_=o*c,x=o*l;e[0]=c*u,e[4]=x-h*d,e[8]=_*d+p,e[1]=d,e[5]=a*u,e[9]=-o*u,e[2]=-l*u,e[6]=p*d+_,e[10]=h-x*d}else if(t.order==="XZY"){let h=a*c,p=a*l,_=o*c,x=o*l;e[0]=c*u,e[4]=-d,e[8]=l*u,e[1]=h*d+x,e[5]=a*u,e[9]=p*d-_,e[2]=_*d-p,e[6]=o*u,e[10]=x*d+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(vd,t,Md)}lookAt(t,e,n){let s=this.elements;return Xe.subVectors(t,e),Xe.lengthSq()===0&&(Xe.z=1),Xe.normalize(),kn.crossVectors(n,Xe),kn.lengthSq()===0&&(Math.abs(n.z)===1?Xe.x+=1e-4:Xe.z+=1e-4,Xe.normalize(),kn.crossVectors(n,Xe)),kn.normalize(),$s.crossVectors(Xe,kn),s[0]=kn.x,s[4]=$s.x,s[8]=Xe.x,s[1]=kn.y,s[5]=$s.y,s[9]=Xe.y,s[2]=kn.z,s[6]=$s.z,s[10]=Xe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],u=n[1],d=n[5],h=n[9],p=n[13],_=n[2],x=n[6],m=n[10],f=n[14],y=n[3],g=n[7],M=n[11],A=n[15],T=s[0],S=s[4],I=s[8],v=s[12],b=s[1],R=s[5],P=s[9],F=s[13],L=s[2],U=s[6],B=s[10],Y=s[14],G=s[3],q=s[7],J=s[11],Q=s[15];return r[0]=a*T+o*b+c*L+l*G,r[4]=a*S+o*R+c*U+l*q,r[8]=a*I+o*P+c*B+l*J,r[12]=a*v+o*F+c*Y+l*Q,r[1]=u*T+d*b+h*L+p*G,r[5]=u*S+d*R+h*U+p*q,r[9]=u*I+d*P+h*B+p*J,r[13]=u*v+d*F+h*Y+p*Q,r[2]=_*T+x*b+m*L+f*G,r[6]=_*S+x*R+m*U+f*q,r[10]=_*I+x*P+m*B+f*J,r[14]=_*v+x*F+m*Y+f*Q,r[3]=y*T+g*b+M*L+A*G,r[7]=y*S+g*R+M*U+A*q,r[11]=y*I+g*P+M*B+A*J,r[15]=y*v+g*F+M*Y+A*Q,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],c=t[9],l=t[13],u=t[2],d=t[6],h=t[10],p=t[14],_=t[3],x=t[7],m=t[11],f=t[15];return _*(+r*c*d-s*l*d-r*o*h+n*l*h+s*o*p-n*c*p)+x*(+e*c*p-e*l*h+r*a*h-s*a*p+s*l*u-r*c*u)+m*(+e*l*d-e*o*p-r*a*d+n*a*p+r*o*u-n*l*u)+f*(-s*o*u-e*c*d+e*o*h+s*a*d-n*a*h+n*c*u)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],u=t[8],d=t[9],h=t[10],p=t[11],_=t[12],x=t[13],m=t[14],f=t[15],y=d*m*l-x*h*l+x*c*p-o*m*p-d*c*f+o*h*f,g=_*h*l-u*m*l-_*c*p+a*m*p+u*c*f-a*h*f,M=u*x*l-_*d*l+_*o*p-a*x*p-u*o*f+a*d*f,A=_*d*c-u*x*c-_*o*h+a*x*h+u*o*m-a*d*m,T=e*y+n*g+s*M+r*A;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/T;return t[0]=y*S,t[1]=(x*h*r-d*m*r-x*s*p+n*m*p+d*s*f-n*h*f)*S,t[2]=(o*m*r-x*c*r+x*s*l-n*m*l-o*s*f+n*c*f)*S,t[3]=(d*c*r-o*h*r-d*s*l+n*h*l+o*s*p-n*c*p)*S,t[4]=g*S,t[5]=(u*m*r-_*h*r+_*s*p-e*m*p-u*s*f+e*h*f)*S,t[6]=(_*c*r-a*m*r-_*s*l+e*m*l+a*s*f-e*c*f)*S,t[7]=(a*h*r-u*c*r+u*s*l-e*h*l-a*s*p+e*c*p)*S,t[8]=M*S,t[9]=(_*d*r-u*x*r-_*n*p+e*x*p+u*n*f-e*d*f)*S,t[10]=(a*x*r-_*o*r+_*n*l-e*x*l-a*n*f+e*o*f)*S,t[11]=(u*o*r-a*d*r-u*n*l+e*d*l+a*n*p-e*o*p)*S,t[12]=A*S,t[13]=(u*x*s-_*d*s+_*n*h-e*x*h-u*n*m+e*d*m)*S,t[14]=(_*o*s-a*x*s-_*n*c+e*x*c+a*n*m-e*o*m)*S,t[15]=(a*d*s-u*o*s+u*n*c-e*d*c-a*n*h+e*o*h)*S,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,c=t.z,l=r*a,u=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,u*o+n,u*c-s*a,0,l*c-s*o,u*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,l=r+r,u=a+a,d=o+o,h=r*l,p=r*u,_=r*d,x=a*u,m=a*d,f=o*d,y=c*l,g=c*u,M=c*d,A=n.x,T=n.y,S=n.z;return s[0]=(1-(x+f))*A,s[1]=(p+M)*A,s[2]=(_-g)*A,s[3]=0,s[4]=(p-M)*T,s[5]=(1-(h+f))*T,s[6]=(m+y)*T,s[7]=0,s[8]=(_+g)*S,s[9]=(m-y)*S,s[10]=(1-(h+x))*S,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Ci.set(s[0],s[1],s[2]).length(),a=Ci.set(s[4],s[5],s[6]).length(),o=Ci.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],sn.copy(this);let l=1/r,u=1/a,d=1/o;return sn.elements[0]*=l,sn.elements[1]*=l,sn.elements[2]*=l,sn.elements[4]*=u,sn.elements[5]*=u,sn.elements[6]*=u,sn.elements[8]*=d,sn.elements[9]*=d,sn.elements[10]*=d,e.setFromRotationMatrix(sn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=Cn){let c=this.elements,l=2*r/(e-t),u=2*r/(n-s),d=(e+t)/(e-t),h=(n+s)/(n-s),p,_;if(o===Cn)p=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===vr)p=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=Cn){let c=this.elements,l=1/(e-t),u=1/(n-s),d=1/(a-r),h=(e+t)*l,p=(n+s)*u,_,x;if(o===Cn)_=(a+r)*d,x=-2*d;else if(o===vr)_=r*d,x=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-h,c[1]=0,c[5]=2*u,c[9]=0,c[13]=-p,c[2]=0,c[6]=0,c[10]=x,c[14]=-_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Ci=new D,sn=new kt,vd=new D(0,0,0),Md=new D(1,1,1),kn=new D,$s=new D,Xe=new D,kl=new kt,Vl=new Zn,Tr=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],u=s[9],d=s[2],h=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Ne(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ne(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ne(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ne(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Ne(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ne(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return kl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(kl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Vl.setFromEuler(this),this.setFromQuaternion(Vl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Tr.DEFAULT_ORDER="XYZ";var Er=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Sd=0,Hl=new D,Pi=new Zn,Tn=new kt,Ks=new D,ys=new D,bd=new D,Ad=new Zn,Gl=new D(1,0,0),Wl=new D(0,1,0),Xl=new D(0,0,1),Td={type:"added"},Ed={type:"removed"},_n=class i extends Yn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sd++}),this.uuid=ws(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new D,e=new Tr,n=new Zn,s=new D(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new kt},normalMatrix:{value:new Dt}}),this.matrix=new kt,this.matrixWorld=new kt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Er,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Pi.setFromAxisAngle(t,e),this.quaternion.multiply(Pi),this}rotateOnWorldAxis(t,e){return Pi.setFromAxisAngle(t,e),this.quaternion.premultiply(Pi),this}rotateX(t){return this.rotateOnAxis(Gl,t)}rotateY(t){return this.rotateOnAxis(Wl,t)}rotateZ(t){return this.rotateOnAxis(Xl,t)}translateOnAxis(t,e){return Hl.copy(t).applyQuaternion(this.quaternion),this.position.add(Hl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Gl,t)}translateY(t){return this.translateOnAxis(Wl,t)}translateZ(t){return this.translateOnAxis(Xl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Tn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ks.copy(t):Ks.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Tn.lookAt(ys,Ks,this.up):Tn.lookAt(Ks,ys,this.up),this.quaternion.setFromRotationMatrix(Tn),s&&(Tn.extractRotation(s.matrixWorld),Pi.setFromRotationMatrix(Tn),this.quaternion.premultiply(Pi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.parent!==null&&t.parent.remove(t),t.parent=this,this.children.push(t),t.dispatchEvent(Td)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Ed)),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Tn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Tn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Tn),this.add(t),t.updateWorldMatrix(!1,!0),this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,t,bd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ys,Ad,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++){let r=e[n];(r.matrixWorldAutoUpdate===!0||t===!0)&&r.updateMatrixWorld(t)}}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++){let o=s[r];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let d=c[l];r(t.shapes,d)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(t.materials,this.material[c]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),l=a(t.textures),u=a(t.images),d=a(t.shapes),h=a(t.skeletons),p=a(t.animations),_=a(t.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let c=[];for(let l in o){let u=o[l];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};_n.DEFAULT_UP=new D(0,1,0);_n.DEFAULT_MATRIX_AUTO_UPDATE=!0;_n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var rn=new D,En=new D,qo=new D,wn=new D,Ii=new D,Li=new D,ql=new D,Yo=new D,Zo=new D,Jo=new D,js=!1,ee=class i{constructor(t=new D,e=new D,n=new D){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),rn.subVectors(t,e),s.cross(rn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){rn.subVectors(s,e),En.subVectors(n,e),qo.subVectors(t,e);let a=rn.dot(rn),o=rn.dot(En),c=rn.dot(qo),l=En.dot(En),u=En.dot(qo),d=a*l-o*o;if(d===0)return r.set(0,0,0),null;let h=1/d,p=(l*c-o*u)*h,_=(a*u-o*c)*h;return r.set(1-p-_,_,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,wn)===null?!1:wn.x>=0&&wn.y>=0&&wn.x+wn.y<=1}static getUV(t,e,n,s,r,a,o,c){return js===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),js=!0),this.getInterpolation(t,e,n,s,r,a,o,c)}static getInterpolation(t,e,n,s,r,a,o,c){return this.getBarycoord(t,e,n,s,wn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,wn.x),c.addScaledVector(a,wn.y),c.addScaledVector(o,wn.z),c)}static isFrontFacing(t,e,n,s){return rn.subVectors(n,e),En.subVectors(t,e),rn.cross(En).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return rn.subVectors(this.c,this.b),En.subVectors(this.a,this.b),rn.cross(En).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getUV(t,e,n,s,r){return js===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),js=!0),i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Ii.subVectors(s,n),Li.subVectors(r,n),Yo.subVectors(t,n);let c=Ii.dot(Yo),l=Li.dot(Yo);if(c<=0&&l<=0)return e.copy(n);Zo.subVectors(t,s);let u=Ii.dot(Zo),d=Li.dot(Zo);if(u>=0&&d<=u)return e.copy(s);let h=c*d-u*l;if(h<=0&&c>=0&&u<=0)return a=c/(c-u),e.copy(n).addScaledVector(Ii,a);Jo.subVectors(t,r);let p=Ii.dot(Jo),_=Li.dot(Jo);if(_>=0&&p<=_)return e.copy(r);let x=p*l-c*_;if(x<=0&&l>=0&&_<=0)return o=l/(l-_),e.copy(n).addScaledVector(Li,o);let m=u*_-p*d;if(m<=0&&d-u>=0&&p-_>=0)return ql.subVectors(r,s),o=(d-u)/(d-u+(p-_)),e.copy(s).addScaledVector(ql,o);let f=1/(m+x+h);return a=x*f,o=h*f,e.copy(n).addScaledVector(Ii,a).addScaledVector(Li,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Du={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vn={h:0,s:0,l:0},Qs={h:0,s:0,l:0};function $o(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Gt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Te){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,qt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=qt.workingColorSpace){return this.r=t,this.g=e,this.b=n,qt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=qt.workingColorSpace){if(t=pd(t,1),e=Ne(e,0,1),n=Ne(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=$o(a,r,t+1/3),this.g=$o(a,r,t),this.b=$o(a,r,t-1/3)}return qt.toWorkingColorSpace(this,s),this}setStyle(t,e=Te){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Te){let n=Du[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Wi(t.r),this.g=Wi(t.g),this.b=Wi(t.b),this}copyLinearToSRGB(t){return this.r=Bo(t.r),this.g=Bo(t.g),this.b=Bo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Te){return qt.fromWorkingColorSpace(Re.copy(this),t),Math.round(Ne(Re.r*255,0,255))*65536+Math.round(Ne(Re.g*255,0,255))*256+Math.round(Ne(Re.b*255,0,255))}getHexString(t=Te){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=qt.workingColorSpace){qt.fromWorkingColorSpace(Re.copy(this),e);let n=Re.r,s=Re.g,r=Re.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,u=(o+a)/2;if(o===a)c=0,l=0;else{let d=a-o;switch(l=u<=.5?d/(a+o):d/(2-a-o),a){case n:c=(s-r)/d+(s<r?6:0);break;case s:c=(r-n)/d+2;break;case r:c=(n-s)/d+4;break}c/=6}return t.h=c,t.s=l,t.l=u,t}getRGB(t,e=qt.workingColorSpace){return qt.fromWorkingColorSpace(Re.copy(this),e),t.r=Re.r,t.g=Re.g,t.b=Re.b,t}getStyle(t=Te){qt.fromWorkingColorSpace(Re.copy(this),t);let e=Re.r,n=Re.g,s=Re.b;return t!==Te?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Vn),this.setHSL(Vn.h+t,Vn.s+e,Vn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Vn),t.getHSL(Qs);let n=Fo(Vn.h,Qs.h,e),s=Fo(Vn.s,Qs.s,e),r=Fo(Vn.l,Qs.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Re=new Gt;Gt.NAMES=Du;var wd=0,Ji=class extends Yn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wd++}),this.uuid=ws(),this.name="",this.type="Material",this.blending=Gi,this.side=cn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ra,this.blendDst=oa,this.blendEquation=li,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Gt(0,0,0),this.blendAlpha=0,this.depthFunc=pr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ll,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ai,this.stencilZFail=Ai,this.stencilZPass=Ai,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Gi&&(n.blending=this.blending),this.side!==cn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ra&&(n.blendSrc=this.blendSrc),this.blendDst!==oa&&(n.blendDst=this.blendDst),this.blendEquation!==li&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==pr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ll&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ai&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ai&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ai&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},gi=class extends Ji{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Mu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var pe=new D,tr=new Ct,ie=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Dl,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Gn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)tr.fromBufferAttribute(this,e),tr.applyMatrix3(t),this.setXY(e,tr.x,tr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.applyMatrix3(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.applyMatrix4(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.applyNormalMatrix(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)pe.fromBufferAttribute(this,e),pe.transformDirection(t),this.setXYZ(e,pe.x,pe.y,pe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=gs(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ze(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=gs(e,this.array)),e}setX(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=gs(e,this.array)),e}setY(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=gs(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=gs(e,this.array)),e}setW(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array),s=ze(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array),s=ze(s,this.array),r=ze(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Dl&&(t.usage=this.usage),t}};var wr=class extends ie{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Rr=class extends ie{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Qe=class extends ie{constructor(t,e,n){super(new Float32Array(t),e,n)}};var Rd=0,Je=new kt,Ko=new _n,Di=new D,qe=new le,vs=new le,Se=new D,xn=class i extends Yn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Rd++}),this.uuid=ws(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Lu(t)?Rr:wr)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Dt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Je.makeRotationFromQuaternion(t),this.applyMatrix4(Je),this}rotateX(t){return Je.makeRotationX(t),this.applyMatrix4(Je),this}rotateY(t){return Je.makeRotationY(t),this.applyMatrix4(Je),this}rotateZ(t){return Je.makeRotationZ(t),this.applyMatrix4(Je),this}translate(t,e,n){return Je.makeTranslation(t,e,n),this.applyMatrix4(Je),this}scale(t,e,n){return Je.makeScale(t,e,n),this.applyMatrix4(Je),this}lookAt(t){return Ko.lookAt(t),Ko.updateMatrix(),this.applyMatrix4(Ko.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Di).negate(),this.translate(Di.x,Di.y,Di.z),this}setFromPoints(t){let e=[];for(let n=0,s=t.length;n<s;n++){let r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new Qe(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new le);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];qe.setFromBufferAttribute(r),this.morphTargetsRelative?(Se.addVectors(this.boundingBox.min,qe.min),this.boundingBox.expandByPoint(Se),Se.addVectors(this.boundingBox.max,qe.max),this.boundingBox.expandByPoint(Se)):(this.boundingBox.expandByPoint(qe.min),this.boundingBox.expandByPoint(qe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new pi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new D,1/0);return}if(t){let n=this.boundingSphere.center;if(qe.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];vs.setFromBufferAttribute(o),this.morphTargetsRelative?(Se.addVectors(qe.min,vs.min),qe.expandByPoint(Se),Se.addVectors(qe.max,vs.max),qe.expandByPoint(Se)):(qe.expandByPoint(vs.min),qe.expandByPoint(vs.max))}qe.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Se.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Se));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Se.fromBufferAttribute(o,l),c&&(Di.fromBufferAttribute(t,l),Se.add(Di)),s=Math.max(s,n.distanceToSquared(Se))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.array,s=e.position.array,r=e.normal.array,a=e.uv.array,o=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ie(new Float32Array(4*o),4));let c=this.getAttribute("tangent").array,l=[],u=[];for(let b=0;b<o;b++)l[b]=new D,u[b]=new D;let d=new D,h=new D,p=new D,_=new Ct,x=new Ct,m=new Ct,f=new D,y=new D;function g(b,R,P){d.fromArray(s,b*3),h.fromArray(s,R*3),p.fromArray(s,P*3),_.fromArray(a,b*2),x.fromArray(a,R*2),m.fromArray(a,P*2),h.sub(d),p.sub(d),x.sub(_),m.sub(_);let F=1/(x.x*m.y-m.x*x.y);isFinite(F)&&(f.copy(h).multiplyScalar(m.y).addScaledVector(p,-x.y).multiplyScalar(F),y.copy(p).multiplyScalar(x.x).addScaledVector(h,-m.x).multiplyScalar(F),l[b].add(f),l[R].add(f),l[P].add(f),u[b].add(y),u[R].add(y),u[P].add(y))}let M=this.groups;M.length===0&&(M=[{start:0,count:n.length}]);for(let b=0,R=M.length;b<R;++b){let P=M[b],F=P.start,L=P.count;for(let U=F,B=F+L;U<B;U+=3)g(n[U+0],n[U+1],n[U+2])}let A=new D,T=new D,S=new D,I=new D;function v(b){S.fromArray(r,b*3),I.copy(S);let R=l[b];A.copy(R),A.sub(S.multiplyScalar(S.dot(R))).normalize(),T.crossVectors(I,R);let F=T.dot(u[b])<0?-1:1;c[b*4]=A.x,c[b*4+1]=A.y,c[b*4+2]=A.z,c[b*4+3]=F}for(let b=0,R=M.length;b<R;++b){let P=M[b],F=P.start,L=P.count;for(let U=F,B=F+L;U<B;U+=3)v(n[U+0]),v(n[U+1]),v(n[U+2])}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ie(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,p=n.count;h<p;h++)n.setXYZ(h,0,0,0);let s=new D,r=new D,a=new D,o=new D,c=new D,l=new D,u=new D,d=new D;if(t)for(let h=0,p=t.count;h<p;h+=3){let _=t.getX(h+0),x=t.getX(h+1),m=t.getX(h+2);s.fromBufferAttribute(e,_),r.fromBufferAttribute(e,x),a.fromBufferAttribute(e,m),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(n,_),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),o.add(u),c.add(u),l.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let h=0,p=e.count;h<p;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Se.fromBufferAttribute(t,e),Se.normalize(),t.setXYZ(e,Se.x,Se.y,Se.z)}toNonIndexed(){function t(o,c){let l=o.array,u=o.itemSize,d=o.normalized,h=new l.constructor(c.length*u),p=0,_=0;for(let x=0,m=c.length;x<m;x++){o.isInterleavedBufferAttribute?p=c[x]*o.data.stride+o.offset:p=c[x]*u;for(let f=0;f<u;f++)h[_++]=l[p++]}return new ie(h,u,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=t(c,n);e.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let u=0,d=l.length;u<d;u++){let h=l[u],p=t(h,n);c.push(p)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let d=0,h=l.length;d<h;d++){let p=l[d];u.push(p.toJSON(t.data))}u.length>0&&(s[c]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let s=t.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(e))}let r=t.morphAttributes;for(let l in r){let u=[],d=r[l];for(let h=0,p=d.length;h<p;h++)u.push(d[h].clone(e));this.morphAttributes[l]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let l=0,u=a.length;l<u;l++){let d=a[l];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Yl=new kt,oi=new mi,er=new pi,Zl=new D,Ui=new D,Ni=new D,Fi=new D,jo=new D,nr=new D,ir=new Ct,sr=new Ct,rr=new Ct,Jl=new D,$l=new D,Kl=new D,or=new D,ar=new D,je=class extends _n{constructor(t=new xn,e=new gi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){nr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=o[c],d=r[c];u!==0&&(jo.fromBufferAttribute(d,t),a?nr.addScaledVector(jo,u):nr.addScaledVector(jo.sub(e),u))}e.add(nr)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),er.copy(n.boundingSphere),er.applyMatrix4(r),oi.copy(t.ray).recast(t.near),!(er.containsPoint(oi.origin)===!1&&(oi.intersectSphere(er,Zl)===null||oi.origin.distanceToSquared(Zl)>(t.far-t.near)**2))&&(Yl.copy(r).invert(),oi.copy(t.ray).applyMatrix4(Yl),!(n.boundingBox!==null&&oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,oi)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,x=h.length;_<x;_++){let m=h[_],f=a[m.materialIndex],y=Math.max(m.start,p.start),g=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let M=y,A=g;M<A;M+=3){let T=o.getX(M),S=o.getX(M+1),I=o.getX(M+2);s=cr(this,f,t,n,l,u,d,T,S,I),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,p.start),x=Math.min(o.count,p.start+p.count);for(let m=_,f=x;m<f;m+=3){let y=o.getX(m),g=o.getX(m+1),M=o.getX(m+2);s=cr(this,a,t,n,l,u,d,y,g,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let _=0,x=h.length;_<x;_++){let m=h[_],f=a[m.materialIndex],y=Math.max(m.start,p.start),g=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let M=y,A=g;M<A;M+=3){let T=M,S=M+1,I=M+2;s=cr(this,f,t,n,l,u,d,T,S,I),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,p.start),x=Math.min(c.count,p.start+p.count);for(let m=_,f=x;m<f;m+=3){let y=m,g=m+1,M=m+2;s=cr(this,a,t,n,l,u,d,y,g,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function Cd(i,t,e,n,s,r,a,o){let c;if(t.side===Ce?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,t.side===cn,o),c===null)return null;ar.copy(o),ar.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(ar);return l<e.near||l>e.far?null:{distance:l,point:ar.clone(),object:i}}function cr(i,t,e,n,s,r,a,o,c,l){i.getVertexPosition(o,Ui),i.getVertexPosition(c,Ni),i.getVertexPosition(l,Fi);let u=Cd(i,t,e,n,Ui,Ni,Fi,or);if(u){s&&(ir.fromBufferAttribute(s,o),sr.fromBufferAttribute(s,c),rr.fromBufferAttribute(s,l),u.uv=ee.getInterpolation(or,Ui,Ni,Fi,ir,sr,rr,new Ct)),r&&(ir.fromBufferAttribute(r,o),sr.fromBufferAttribute(r,c),rr.fromBufferAttribute(r,l),u.uv1=ee.getInterpolation(or,Ui,Ni,Fi,ir,sr,rr,new Ct),u.uv2=u.uv1),a&&(Jl.fromBufferAttribute(a,o),$l.fromBufferAttribute(a,c),Kl.fromBufferAttribute(a,l),u.normal=ee.getInterpolation(or,Ui,Ni,Fi,Jl,$l,Kl,new D),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let d={a:o,b:c,c:l,normal:new D,materialIndex:0};ee.getNormal(Ui,Ni,Fi,d.normal),u.face=d}return u}var Ts=class i extends xn{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],u=[],d=[],h=0,p=0;_("z","y","x",-1,-1,n,e,t,a,r,0),_("z","y","x",1,-1,n,e,-t,a,r,1),_("x","z","y",1,1,t,n,e,s,a,2),_("x","z","y",1,-1,t,n,-e,s,a,3),_("x","y","z",1,-1,t,e,n,s,r,4),_("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Qe(l,3)),this.setAttribute("normal",new Qe(u,3)),this.setAttribute("uv",new Qe(d,2));function _(x,m,f,y,g,M,A,T,S,I,v){let b=M/S,R=A/I,P=M/2,F=A/2,L=T/2,U=S+1,B=I+1,Y=0,G=0,q=new D;for(let J=0;J<B;J++){let Q=J*R-F;for(let at=0;at<U;at++){let X=at*b-P;q[x]=X*y,q[m]=Q*g,q[f]=L,l.push(q.x,q.y,q.z),q[x]=0,q[m]=0,q[f]=T>0?1:-1,u.push(q.x,q.y,q.z),d.push(at/S),d.push(1-J/I),Y+=1}}for(let J=0;J<I;J++)for(let Q=0;Q<S;Q++){let at=h+Q+U*J,X=h+Q+U*(J+1),Z=h+(Q+1)+U*(J+1),it=h+(Q+1)+U*J;c.push(at,X,it),c.push(X,Z,it),G+=6}o.addGroup(p,G,v),p+=G,h+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function $i(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function De(i){let t={};for(let e=0;e<i.length;e++){let n=$i(i[e]);for(let s in n)t[s]=n[s]}return t}function Pd(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Uu(i){return i.getRenderTarget()===null?i.outputColorSpace:qt.workingColorSpace}var Id={clone:$i,merge:De},Ld=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ln=class extends Ji{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ld,this.fragmentShader=Dd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=$i(t.uniforms),this.uniformsGroups=Pd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Cr=class extends _n{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new kt,this.projectionMatrix=new kt,this.projectionMatrixInverse=new kt,this.coordinateSystem=Cn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ye=class extends Cr{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=fa*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(No*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return fa*2*Math.atan(Math.tan(No*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(No*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,e-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Oi=-90,Bi=1,ga=class extends _n{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ye(Oi,Bi,t,e);s.layers=this.layers,this.add(s);let r=new Ye(Oi,Bi,t,e);r.layers=this.layers,this.add(r);let a=new Ye(Oi,Bi,t,e);a.layers=this.layers,this.add(a);let o=new Ye(Oi,Bi,t,e);o.layers=this.layers,this.add(o);let c=new Ye(Oi,Bi,t,e);c.layers=this.layers,this.add(c);let l=new Ye(Oi,Bi,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,c]=e;for(let l of e)this.remove(l);if(t===Cn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===vr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,u]=this.children,d=t.getRenderTarget(),h=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,c),t.setRenderTarget(n,4,s),t.render(e,l),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(d,h,p),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Pr=class extends ln{constructor(t,e,n,s,r,a,o,c,l,u){t=t!==void 0?t:[],e=e!==void 0?e:qi,super(t,e,n,s,r,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},_a=class extends In{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];e.encoding!==void 0&&(Ms("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),e.colorSpace=e.encoding===di?Te:Ke),this.texture=new Pr(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:$e}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ts(5,5,5),r=new Ln({name:"CubemapFromEquirect",uniforms:$i(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ce,blending:Wn});r.uniforms.tEquirect.value=e;let a=new je(s,r),o=e.minFilter;return e.minFilter===bs&&(e.minFilter=$e),new ga(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}},Qo=new D,Ud=new D,Nd=new Dt,Fe=class{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Qo.subVectors(n,e).cross(Ud.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(Qo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Nd.getNormalMatrix(t),s=this.coplanarPoint(Qo).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ai=new pi,lr=new D,Ir=class{constructor(t=new Fe,e=new Fe,n=new Fe,s=new Fe,r=new Fe,a=new Fe){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Cn){let n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],c=s[3],l=s[4],u=s[5],d=s[6],h=s[7],p=s[8],_=s[9],x=s[10],m=s[11],f=s[12],y=s[13],g=s[14],M=s[15];if(n[0].setComponents(c-r,h-l,m-p,M-f).normalize(),n[1].setComponents(c+r,h+l,m+p,M+f).normalize(),n[2].setComponents(c+a,h+u,m+_,M+y).normalize(),n[3].setComponents(c-a,h-u,m-_,M-y).normalize(),n[4].setComponents(c-o,h-d,m-x,M-g).normalize(),e===Cn)n[5].setComponents(c+o,h+d,m+x,M+g).normalize();else if(e===vr)n[5].setComponents(o,d,x,g).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ai.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ai.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ai)}intersectsSprite(t){return ai.center.set(0,0,0),ai.radius=.7071067811865476,ai.applyMatrix4(t.matrixWorld),this.intersectsSphere(ai)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(lr.x=s.normal.x>0?t.max.x:t.min.x,lr.y=s.normal.y>0?t.max.y:t.min.y,lr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(lr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Nu(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Fd(i,t){let e=t.isWebGL2,n=new WeakMap;function s(l,u){let d=l.array,h=l.usage,p=d.byteLength,_=i.createBuffer();i.bindBuffer(u,_),i.bufferData(u,d,h),l.onUploadCallback();let x;if(d instanceof Float32Array)x=i.FLOAT;else if(d instanceof Uint16Array)if(l.isFloat16BufferAttribute)if(e)x=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=i.UNSIGNED_SHORT;else if(d instanceof Int16Array)x=i.SHORT;else if(d instanceof Uint32Array)x=i.UNSIGNED_INT;else if(d instanceof Int32Array)x=i.INT;else if(d instanceof Int8Array)x=i.BYTE;else if(d instanceof Uint8Array)x=i.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)x=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:_,type:x,bytesPerElement:d.BYTES_PER_ELEMENT,version:l.version,size:p}}function r(l,u,d){let h=u.array,p=u._updateRange,_=u.updateRanges;if(i.bindBuffer(d,l),p.count===-1&&_.length===0&&i.bufferSubData(d,0,h),_.length!==0){for(let x=0,m=_.length;x<m;x++){let f=_[x];e?i.bufferSubData(d,f.start*h.BYTES_PER_ELEMENT,h,f.start,f.count):i.bufferSubData(d,f.start*h.BYTES_PER_ELEMENT,h.subarray(f.start,f.start+f.count))}u.clearUpdateRanges()}p.count!==-1&&(e?i.bufferSubData(d,p.offset*h.BYTES_PER_ELEMENT,h,p.offset,p.count):i.bufferSubData(d,p.offset*h.BYTES_PER_ELEMENT,h.subarray(p.offset,p.offset+p.count)),p.count=-1),u.onUploadCallback()}function a(l){return l.isInterleavedBufferAttribute&&(l=l.data),n.get(l)}function o(l){l.isInterleavedBufferAttribute&&(l=l.data);let u=n.get(l);u&&(i.deleteBuffer(u.buffer),n.delete(l))}function c(l,u){if(l.isGLBufferAttribute){let h=n.get(l);(!h||h.version<l.version)&&n.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}l.isInterleavedBufferAttribute&&(l=l.data);let d=n.get(l);if(d===void 0)n.set(l,s(l,u));else if(d.version<l.version){if(d.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(d.buffer,l,u),d.version=l.version}}return{get:a,remove:o,update:c}}var xa=class i extends xn{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),c=Math.floor(s),l=o+1,u=c+1,d=t/o,h=e/c,p=[],_=[],x=[],m=[];for(let f=0;f<u;f++){let y=f*h-a;for(let g=0;g<l;g++){let M=g*d-r;_.push(M,-y,0),x.push(0,0,1),m.push(g/o),m.push(1-f/c)}}for(let f=0;f<c;f++)for(let y=0;y<o;y++){let g=y+l*f,M=y+l*(f+1),A=y+1+l*(f+1),T=y+1+l*f;p.push(g,M,T),p.push(M,A,T)}this.setIndex(p),this.setAttribute("position",new Qe(_,3)),this.setAttribute("normal",new Qe(x,3)),this.setAttribute("uv",new Qe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},Od=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Bd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,zd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vd=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Hd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Gd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Wd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Xd=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,qd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Yd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Zd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Jd=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,$d=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Kd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,jd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Qd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,tp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ep=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,np=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ip=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,sp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,rp=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,op=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ap=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,cp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,lp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,up=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,hp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,fp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,dp="gl_FragColor = linearToOutputTexel( gl_FragColor );",pp=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,mp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,gp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,_p=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,xp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,yp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,vp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Mp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Sp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,bp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ap=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Tp=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Ep=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,wp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Rp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Cp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Pp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Ip=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Lp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Dp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Up=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Np=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Fp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Op=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Bp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,zp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,kp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Vp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Hp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Gp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Wp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Xp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,qp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Yp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,$p=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Kp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,jp=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Qp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,tm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,em=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,nm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,im=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,sm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,rm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,om=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,am=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,cm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,lm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,um=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,hm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,fm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,dm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,pm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,mm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,gm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,_m=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,xm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,ym=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,vm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Mm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Sm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,bm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Am=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Tm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Em=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,wm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Rm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Cm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Pm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Im=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Lm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Dm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Um=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Nm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Fm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Om=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,zm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,km=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Gm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Wm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Xm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,qm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ym=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Jm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$m=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Km=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,eg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ng=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ig=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,sg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,og=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ag=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,lg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ug=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,hg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,pg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,mg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Lt={alphahash_fragment:Od,alphahash_pars_fragment:Bd,alphamap_fragment:zd,alphamap_pars_fragment:kd,alphatest_fragment:Vd,alphatest_pars_fragment:Hd,aomap_fragment:Gd,aomap_pars_fragment:Wd,batching_pars_vertex:Xd,batching_vertex:qd,begin_vertex:Yd,beginnormal_vertex:Zd,bsdfs:Jd,iridescence_fragment:$d,bumpmap_pars_fragment:Kd,clipping_planes_fragment:jd,clipping_planes_pars_fragment:Qd,clipping_planes_pars_vertex:tp,clipping_planes_vertex:ep,color_fragment:np,color_pars_fragment:ip,color_pars_vertex:sp,color_vertex:rp,common:op,cube_uv_reflection_fragment:ap,defaultnormal_vertex:cp,displacementmap_pars_vertex:lp,displacementmap_vertex:up,emissivemap_fragment:hp,emissivemap_pars_fragment:fp,colorspace_fragment:dp,colorspace_pars_fragment:pp,envmap_fragment:mp,envmap_common_pars_fragment:gp,envmap_pars_fragment:_p,envmap_pars_vertex:xp,envmap_physical_pars_fragment:Pp,envmap_vertex:yp,fog_vertex:vp,fog_pars_vertex:Mp,fog_fragment:Sp,fog_pars_fragment:bp,gradientmap_pars_fragment:Ap,lightmap_fragment:Tp,lightmap_pars_fragment:Ep,lights_lambert_fragment:wp,lights_lambert_pars_fragment:Rp,lights_pars_begin:Cp,lights_toon_fragment:Ip,lights_toon_pars_fragment:Lp,lights_phong_fragment:Dp,lights_phong_pars_fragment:Up,lights_physical_fragment:Np,lights_physical_pars_fragment:Fp,lights_fragment_begin:Op,lights_fragment_maps:Bp,lights_fragment_end:zp,logdepthbuf_fragment:kp,logdepthbuf_pars_fragment:Vp,logdepthbuf_pars_vertex:Hp,logdepthbuf_vertex:Gp,map_fragment:Wp,map_pars_fragment:Xp,map_particle_fragment:qp,map_particle_pars_fragment:Yp,metalnessmap_fragment:Zp,metalnessmap_pars_fragment:Jp,morphcolor_vertex:$p,morphnormal_vertex:Kp,morphtarget_pars_vertex:jp,morphtarget_vertex:Qp,normal_fragment_begin:tm,normal_fragment_maps:em,normal_pars_fragment:nm,normal_pars_vertex:im,normal_vertex:sm,normalmap_pars_fragment:rm,clearcoat_normal_fragment_begin:om,clearcoat_normal_fragment_maps:am,clearcoat_pars_fragment:cm,iridescence_pars_fragment:lm,opaque_fragment:um,packing:hm,premultiplied_alpha_fragment:fm,project_vertex:dm,dithering_fragment:pm,dithering_pars_fragment:mm,roughnessmap_fragment:gm,roughnessmap_pars_fragment:_m,shadowmap_pars_fragment:xm,shadowmap_pars_vertex:ym,shadowmap_vertex:vm,shadowmask_pars_fragment:Mm,skinbase_vertex:Sm,skinning_pars_vertex:bm,skinning_vertex:Am,skinnormal_vertex:Tm,specularmap_fragment:Em,specularmap_pars_fragment:wm,tonemapping_fragment:Rm,tonemapping_pars_fragment:Cm,transmission_fragment:Pm,transmission_pars_fragment:Im,uv_pars_fragment:Lm,uv_pars_vertex:Dm,uv_vertex:Um,worldpos_vertex:Nm,background_vert:Fm,background_frag:Om,backgroundCube_vert:Bm,backgroundCube_frag:zm,cube_vert:km,cube_frag:Vm,depth_vert:Hm,depth_frag:Gm,distanceRGBA_vert:Wm,distanceRGBA_frag:Xm,equirect_vert:qm,equirect_frag:Ym,linedashed_vert:Zm,linedashed_frag:Jm,meshbasic_vert:$m,meshbasic_frag:Km,meshlambert_vert:jm,meshlambert_frag:Qm,meshmatcap_vert:tg,meshmatcap_frag:eg,meshnormal_vert:ng,meshnormal_frag:ig,meshphong_vert:sg,meshphong_frag:rg,meshphysical_vert:og,meshphysical_frag:ag,meshtoon_vert:cg,meshtoon_frag:lg,points_vert:ug,points_frag:hg,shadow_vert:fg,shadow_frag:dg,sprite_vert:pg,sprite_frag:mg},nt={common:{diffuse:{value:new Gt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Dt},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Dt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Dt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Dt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Dt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Dt},normalScale:{value:new Ct(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Dt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Dt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Dt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Dt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Gt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Gt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0},uvTransform:{value:new Dt}},sprite:{diffuse:{value:new Gt(16777215)},opacity:{value:1},center:{value:new Ct(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Dt},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0}}},gn={basic:{uniforms:De([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.fog]),vertexShader:Lt.meshbasic_vert,fragmentShader:Lt.meshbasic_frag},lambert:{uniforms:De([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,nt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Lt.meshlambert_vert,fragmentShader:Lt.meshlambert_frag},phong:{uniforms:De([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,nt.lights,{emissive:{value:new Gt(0)},specular:{value:new Gt(1118481)},shininess:{value:30}}]),vertexShader:Lt.meshphong_vert,fragmentShader:Lt.meshphong_frag},standard:{uniforms:De([nt.common,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.roughnessmap,nt.metalnessmap,nt.fog,nt.lights,{emissive:{value:new Gt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Lt.meshphysical_vert,fragmentShader:Lt.meshphysical_frag},toon:{uniforms:De([nt.common,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.gradientmap,nt.fog,nt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Lt.meshtoon_vert,fragmentShader:Lt.meshtoon_frag},matcap:{uniforms:De([nt.common,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,{matcap:{value:null}}]),vertexShader:Lt.meshmatcap_vert,fragmentShader:Lt.meshmatcap_frag},points:{uniforms:De([nt.points,nt.fog]),vertexShader:Lt.points_vert,fragmentShader:Lt.points_frag},dashed:{uniforms:De([nt.common,nt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Lt.linedashed_vert,fragmentShader:Lt.linedashed_frag},depth:{uniforms:De([nt.common,nt.displacementmap]),vertexShader:Lt.depth_vert,fragmentShader:Lt.depth_frag},normal:{uniforms:De([nt.common,nt.bumpmap,nt.normalmap,nt.displacementmap,{opacity:{value:1}}]),vertexShader:Lt.meshnormal_vert,fragmentShader:Lt.meshnormal_frag},sprite:{uniforms:De([nt.sprite,nt.fog]),vertexShader:Lt.sprite_vert,fragmentShader:Lt.sprite_frag},background:{uniforms:{uvTransform:{value:new Dt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Lt.background_vert,fragmentShader:Lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Lt.backgroundCube_vert,fragmentShader:Lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Lt.cube_vert,fragmentShader:Lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Lt.equirect_vert,fragmentShader:Lt.equirect_frag},distanceRGBA:{uniforms:De([nt.common,nt.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Lt.distanceRGBA_vert,fragmentShader:Lt.distanceRGBA_frag},shadow:{uniforms:De([nt.lights,nt.fog,{color:{value:new Gt(0)},opacity:{value:1}}]),vertexShader:Lt.shadow_vert,fragmentShader:Lt.shadow_frag}};gn.physical={uniforms:De([gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Dt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Dt},clearcoatNormalScale:{value:new Ct(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Dt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Dt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Dt},sheen:{value:0},sheenColor:{value:new Gt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Dt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Dt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Dt},transmissionSamplerSize:{value:new Ct},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Dt},attenuationDistance:{value:0},attenuationColor:{value:new Gt(0)},specularColor:{value:new Gt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Dt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Dt},anisotropyVector:{value:new Ct},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Dt}}]),vertexShader:Lt.meshphysical_vert,fragmentShader:Lt.meshphysical_frag};var ur={r:0,b:0,g:0};function gg(i,t,e,n,s,r,a){let o=new Gt(0),c=r===!0?0:1,l,u,d=null,h=0,p=null;function _(m,f){let y=!1,g=f.isScene===!0?f.background:null;g&&g.isTexture&&(g=(f.backgroundBlurriness>0?e:t).get(g)),g===null?x(o,c):g&&g.isColor&&(x(g,1),y=!0);let M=i.xr.getEnvironmentBlendMode();M==="additive"?n.buffers.color.setClear(0,0,0,1,a):M==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),g&&(g.isCubeTexture||g.mapping===Nr)?(u===void 0&&(u=new je(new Ts(1,1,1),new Ln({name:"BackgroundCubeMaterial",uniforms:$i(gn.backgroundCube.uniforms),vertexShader:gn.backgroundCube.vertexShader,fragmentShader:gn.backgroundCube.fragmentShader,side:Ce,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(A,T,S){this.matrixWorld.copyPosition(S.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),u.material.uniforms.envMap.value=g,u.material.uniforms.flipEnvMap.value=g.isCubeTexture&&g.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=f.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,u.material.toneMapped=qt.getTransfer(g.colorSpace)!==te,(d!==g||h!==g.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,d=g,h=g.version,p=i.toneMapping),u.layers.enableAll(),m.unshift(u,u.geometry,u.material,0,0,null)):g&&g.isTexture&&(l===void 0&&(l=new je(new xa(2,2),new Ln({name:"BackgroundMaterial",uniforms:$i(gn.background.uniforms),vertexShader:gn.background.vertexShader,fragmentShader:gn.background.fragmentShader,side:cn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=g,l.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,l.material.toneMapped=qt.getTransfer(g.colorSpace)!==te,g.matrixAutoUpdate===!0&&g.updateMatrix(),l.material.uniforms.uvTransform.value.copy(g.matrix),(d!==g||h!==g.version||p!==i.toneMapping)&&(l.material.needsUpdate=!0,d=g,h=g.version,p=i.toneMapping),l.layers.enableAll(),m.unshift(l,l.geometry,l.material,0,0,null))}function x(m,f){m.getRGB(ur,Uu(i)),n.buffers.color.setClear(ur.r,ur.g,ur.b,f,a)}return{getClearColor:function(){return o},setClearColor:function(m,f=1){o.set(m),c=f,x(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(m){c=m,x(o,c)},render:_}}function _g(i,t,e,n){let s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:t.get("OES_vertex_array_object"),a=n.isWebGL2||r!==null,o={},c=m(null),l=c,u=!1;function d(L,U,B,Y,G){let q=!1;if(a){let J=x(Y,B,U);l!==J&&(l=J,p(l.object)),q=f(L,Y,B,G),q&&y(L,Y,B,G)}else{let J=U.wireframe===!0;(l.geometry!==Y.id||l.program!==B.id||l.wireframe!==J)&&(l.geometry=Y.id,l.program=B.id,l.wireframe=J,q=!0)}G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(q||u)&&(u=!1,I(L,U,B,Y),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function h(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function p(L){return n.isWebGL2?i.bindVertexArray(L):r.bindVertexArrayOES(L)}function _(L){return n.isWebGL2?i.deleteVertexArray(L):r.deleteVertexArrayOES(L)}function x(L,U,B){let Y=B.wireframe===!0,G=o[L.id];G===void 0&&(G={},o[L.id]=G);let q=G[U.id];q===void 0&&(q={},G[U.id]=q);let J=q[Y];return J===void 0&&(J=m(h()),q[Y]=J),J}function m(L){let U=[],B=[],Y=[];for(let G=0;G<s;G++)U[G]=0,B[G]=0,Y[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:B,attributeDivisors:Y,object:L,attributes:{},index:null}}function f(L,U,B,Y){let G=l.attributes,q=U.attributes,J=0,Q=B.getAttributes();for(let at in Q)if(Q[at].location>=0){let Z=G[at],it=q[at];if(it===void 0&&(at==="instanceMatrix"&&L.instanceMatrix&&(it=L.instanceMatrix),at==="instanceColor"&&L.instanceColor&&(it=L.instanceColor)),Z===void 0||Z.attribute!==it||it&&Z.data!==it.data)return!0;J++}return l.attributesNum!==J||l.index!==Y}function y(L,U,B,Y){let G={},q=U.attributes,J=0,Q=B.getAttributes();for(let at in Q)if(Q[at].location>=0){let Z=q[at];Z===void 0&&(at==="instanceMatrix"&&L.instanceMatrix&&(Z=L.instanceMatrix),at==="instanceColor"&&L.instanceColor&&(Z=L.instanceColor));let it={};it.attribute=Z,Z&&Z.data&&(it.data=Z.data),G[at]=it,J++}l.attributes=G,l.attributesNum=J,l.index=Y}function g(){let L=l.newAttributes;for(let U=0,B=L.length;U<B;U++)L[U]=0}function M(L){A(L,0)}function A(L,U){let B=l.newAttributes,Y=l.enabledAttributes,G=l.attributeDivisors;B[L]=1,Y[L]===0&&(i.enableVertexAttribArray(L),Y[L]=1),G[L]!==U&&((n.isWebGL2?i:t.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](L,U),G[L]=U)}function T(){let L=l.newAttributes,U=l.enabledAttributes;for(let B=0,Y=U.length;B<Y;B++)U[B]!==L[B]&&(i.disableVertexAttribArray(B),U[B]=0)}function S(L,U,B,Y,G,q,J){J===!0?i.vertexAttribIPointer(L,U,B,G,q):i.vertexAttribPointer(L,U,B,Y,G,q)}function I(L,U,B,Y){if(n.isWebGL2===!1&&(L.isInstancedMesh||Y.isInstancedBufferGeometry)&&t.get("ANGLE_instanced_arrays")===null)return;g();let G=Y.attributes,q=B.getAttributes(),J=U.defaultAttributeValues;for(let Q in q){let at=q[Q];if(at.location>=0){let X=G[Q];if(X===void 0&&(Q==="instanceMatrix"&&L.instanceMatrix&&(X=L.instanceMatrix),Q==="instanceColor"&&L.instanceColor&&(X=L.instanceColor)),X!==void 0){let Z=X.normalized,it=X.itemSize,mt=e.get(X);if(mt===void 0)continue;let pt=mt.buffer,wt=mt.type,Pt=mt.bytesPerElement,Mt=n.isWebGL2===!0&&(wt===i.INT||wt===i.UNSIGNED_INT||X.gpuType===bu);if(X.isInterleavedBufferAttribute){let Vt=X.data,z=Vt.stride,Pe=X.offset;if(Vt.isInstancedInterleavedBuffer){for(let _t=0;_t<at.locationSize;_t++)A(at.location+_t,Vt.meshPerAttribute);L.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=Vt.meshPerAttribute*Vt.count)}else for(let _t=0;_t<at.locationSize;_t++)M(at.location+_t);i.bindBuffer(i.ARRAY_BUFFER,pt);for(let _t=0;_t<at.locationSize;_t++)S(at.location+_t,it/at.locationSize,wt,Z,z*Pt,(Pe+it/at.locationSize*_t)*Pt,Mt)}else{if(X.isInstancedBufferAttribute){for(let Vt=0;Vt<at.locationSize;Vt++)A(at.location+Vt,X.meshPerAttribute);L.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let Vt=0;Vt<at.locationSize;Vt++)M(at.location+Vt);i.bindBuffer(i.ARRAY_BUFFER,pt);for(let Vt=0;Vt<at.locationSize;Vt++)S(at.location+Vt,it/at.locationSize,wt,Z,it*Pt,it/at.locationSize*Vt*Pt,Mt)}}else if(J!==void 0){let Z=J[Q];if(Z!==void 0)switch(Z.length){case 2:i.vertexAttrib2fv(at.location,Z);break;case 3:i.vertexAttrib3fv(at.location,Z);break;case 4:i.vertexAttrib4fv(at.location,Z);break;default:i.vertexAttrib1fv(at.location,Z)}}}}T()}function v(){P();for(let L in o){let U=o[L];for(let B in U){let Y=U[B];for(let G in Y)_(Y[G].object),delete Y[G];delete U[B]}delete o[L]}}function b(L){if(o[L.id]===void 0)return;let U=o[L.id];for(let B in U){let Y=U[B];for(let G in Y)_(Y[G].object),delete Y[G];delete U[B]}delete o[L.id]}function R(L){for(let U in o){let B=o[U];if(B[L.id]===void 0)continue;let Y=B[L.id];for(let G in Y)_(Y[G].object),delete Y[G];delete B[L.id]}}function P(){F(),u=!0,l!==c&&(l=c,p(l.object))}function F(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:d,reset:P,resetDefaultState:F,dispose:v,releaseStatesOfGeometry:b,releaseStatesOfProgram:R,initAttributes:g,enableAttribute:M,disableUnusedAttributes:T}}function xg(i,t,e,n){let s=n.isWebGL2,r;function a(u){r=u}function o(u,d){i.drawArrays(r,u,d),e.update(d,r,1)}function c(u,d,h){if(h===0)return;let p,_;if(s)p=i,_="drawArraysInstanced";else if(p=t.get("ANGLE_instanced_arrays"),_="drawArraysInstancedANGLE",p===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[_](r,u,d,h),e.update(d,r,h)}function l(u,d,h){if(h===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let _=0;_<h;_++)this.render(u[_],d[_]);else{p.multiDrawArraysWEBGL(r,u,0,d,0,h);let _=0;for(let x=0;x<h;x++)_+=d[x];e.update(_,r,1)}}this.setMode=a,this.render=o,this.renderInstances=c,this.renderMultiDraw=l}function yg(i,t,e){let n;function s(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let S=t.get("EXT_texture_filter_anisotropic");n=i.getParameter(S.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(S){if(S==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";S="mediump"}return S==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let a=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext",o=e.precision!==void 0?e.precision:"highp",c=r(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);let l=a||t.has("WEBGL_draw_buffers"),u=e.logarithmicDepthBuffer===!0,d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),h=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_TEXTURE_SIZE),_=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),x=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),f=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),g=h>0,M=a||t.has("OES_texture_float"),A=g&&M,T=a?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:l,getMaxAnisotropy:s,getMaxPrecision:r,precision:o,logarithmicDepthBuffer:u,maxTextures:d,maxVertexTextures:h,maxTextureSize:p,maxCubemapSize:_,maxAttributes:x,maxVertexUniforms:m,maxVaryings:f,maxFragmentUniforms:y,vertexTextures:g,floatFragmentTextures:M,floatVertexTextures:A,maxSamples:T}}function vg(i){let t=this,e=null,n=0,s=!1,r=!1,a=new Fe,o=new Dt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let p=d.length!==0||h||n!==0||s;return s=h,n=d.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){e=u(d,h,0)},this.setState=function(d,h,p){let _=d.clippingPlanes,x=d.clipIntersection,m=d.clipShadows,f=i.get(d);if(!s||_===null||_.length===0||r&&!m)r?u(null):l();else{let y=r?0:n,g=y*4,M=f.clippingState||null;c.value=M,M=u(_,h,g,p);for(let A=0;A!==g;++A)M[A]=e[A];f.clippingState=M,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(d,h,p,_){let x=d!==null?d.length:0,m=null;if(x!==0){if(m=c.value,_!==!0||m===null){let f=p+x*4,y=h.matrixWorldInverse;o.getNormalMatrix(y),(m===null||m.length<f)&&(m=new Float32Array(f));for(let g=0,M=p;g!==x;++g,M+=4)a.copy(d[g]).applyMatrix4(y,o),a.normal.toArray(m,M),m[M+3]=a.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}function Mg(i){let t=new WeakMap;function e(a,o){return o===aa?a.mapping=qi:o===ca&&(a.mapping=Yi),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===aa||o===ca)if(t.has(a)){let c=t.get(a).texture;return e(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let l=new _a(c.height/2);return l.fromEquirectangularTexture(i,a),t.set(a,l),a.addEventListener("dispose",s),e(l.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let c=t.get(o);c!==void 0&&(t.delete(o),c.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var ya=class extends Cr{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},ki=4,jl=[.125,.215,.35,.446,.526,.582],ui=20,ta=new ya,Ql=new Gt,ea=null,na=0,ia=0,ci=(1+Math.sqrt(5))/2,zi=1/ci,tu=[new D(1,1,1),new D(-1,1,1),new D(1,1,-1),new D(-1,1,-1),new D(0,ci,zi),new D(0,ci,-zi),new D(zi,0,ci),new D(-zi,0,ci),new D(ci,zi,0),new D(-ci,zi,0)],Lr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){ea=this._renderer.getRenderTarget(),na=this._renderer.getActiveCubeFace(),ia=this._renderer.getActiveMipmapLevel(),this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=iu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=nu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ea,na,ia),t.scissorTest=!1,hr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===qi||t.mapping===Yi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ea=this._renderer.getRenderTarget(),na=this._renderer.getActiveCubeFace(),ia=this._renderer.getActiveMipmapLevel();let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:$e,minFilter:$e,generateMipmaps:!1,type:As,format:an,colorSpace:Pn,depthBuffer:!1},s=eu(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=eu(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Sg(r)),this._blurMaterial=bg(r,t,e)}return s}_compileMaterial(t){let e=new je(this._lodPlanes[0],t);this._renderer.compile(e,ta)}_sceneToCubeUV(t,e,n,s){let o=new Ye(90,1,e,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,h=u.toneMapping;u.getClearColor(Ql),u.toneMapping=Xn,u.autoClear=!1;let p=new gi({name:"PMREM.Background",side:Ce,depthWrite:!1,depthTest:!1}),_=new je(new Ts,p),x=!1,m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,x=!0):(p.color.copy(Ql),x=!0);for(let f=0;f<6;f++){let y=f%3;y===0?(o.up.set(0,c[f],0),o.lookAt(l[f],0,0)):y===1?(o.up.set(0,0,c[f]),o.lookAt(0,l[f],0)):(o.up.set(0,c[f],0),o.lookAt(0,0,l[f]));let g=this._cubeSize;hr(s,y*g,f>2?g:0,g,g),u.setRenderTarget(s),x&&u.render(_,o),u.render(t,o)}_.geometry.dispose(),_.material.dispose(),u.toneMapping=h,u.autoClear=d,t.background=m}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===qi||t.mapping===Yi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=iu()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=nu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new je(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;let c=this._cubeSize;hr(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(a,ta)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){let r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=tu[(s-1)%tu.length];this._blur(t,s-1,s,r,a)}e.autoClear=n}_blur(t,e,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,d=new je(this._lodPlanes[s],l),h=l.uniforms,p=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ui-1),x=r/_,m=isFinite(r)?1+Math.floor(u*x):ui;m>ui&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ui}`);let f=[],y=0;for(let S=0;S<ui;++S){let I=S/x,v=Math.exp(-I*I/2);f.push(v),S===0?y+=v:S<m&&(y+=2*v)}for(let S=0;S<f.length;S++)f[S]=f[S]/y;h.envMap.value=t.texture,h.samples.value=m,h.weights.value=f,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);let{_lodMax:g}=this;h.dTheta.value=_,h.mipInt.value=g-n;let M=this._sizeLods[s],A=3*M*(s>g-ki?s-g+ki:0),T=4*(this._cubeSize-M);hr(e,A,T,3*M,2*M),c.setRenderTarget(e),c.render(d,ta)}};function Sg(i){let t=[],e=[],n=[],s=i,r=i-ki+1+jl.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let c=1/o;a>i-ki?c=jl[a-i+ki-1]:a===0&&(c=0),n.push(c);let l=1/(o-2),u=-l,d=1+l,h=[u,u,d,u,d,d,u,u,d,d,u,d],p=6,_=6,x=3,m=2,f=1,y=new Float32Array(x*_*p),g=new Float32Array(m*_*p),M=new Float32Array(f*_*p);for(let T=0;T<p;T++){let S=T%3*2/3-1,I=T>2?0:-1,v=[S,I,0,S+2/3,I,0,S+2/3,I+1,0,S,I,0,S+2/3,I+1,0,S,I+1,0];y.set(v,x*_*T),g.set(h,m*_*T);let b=[T,T,T,T,T,T];M.set(b,f*_*T)}let A=new xn;A.setAttribute("position",new ie(y,x)),A.setAttribute("uv",new ie(g,m)),A.setAttribute("faceIndex",new ie(M,f)),t.push(A),s>ki&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function eu(i,t,e){let n=new In(i,t,e);return n.texture.mapping=Nr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function hr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function bg(i,t,e){let n=new Float32Array(ui),s=new D(0,1,0);return new Ln({name:"SphericalGaussianBlur",defines:{n:ui,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function nu(){return new Ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function iu(){return new Ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function qa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Ag(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){let c=o.mapping,l=c===aa||c===ca,u=c===qi||c===Yi;if(l||u)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let d=t.get(o);return e===null&&(e=new Lr(i)),d=l?e.fromEquirectangular(o,d):e.fromCubemap(o,d),t.set(o,d),d.texture}else{if(t.has(o))return t.get(o).texture;{let d=o.image;if(l&&d&&d.height>0||u&&d&&s(d)){e===null&&(e=new Lr(i));let h=l?e.fromEquirectangular(o):e.fromCubemap(o);return t.set(o,h),o.addEventListener("dispose",r),h.texture}else return null}}}return o}function s(o){let c=0,l=6;for(let u=0;u<l;u++)o[u]!==void 0&&c++;return c===l}function r(o){let c=o.target;c.removeEventListener("dispose",r);let l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function Tg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(n){n.isWebGL2?(e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance")):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(n){let s=e(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Eg(i,t,e,n){let s={},r=new WeakMap;function a(d){let h=d.target;h.index!==null&&t.remove(h.index);for(let _ in h.attributes)t.remove(h.attributes[_]);for(let _ in h.morphAttributes){let x=h.morphAttributes[_];for(let m=0,f=x.length;m<f;m++)t.remove(x[m])}h.removeEventListener("dispose",a),delete s[h.id];let p=r.get(h);p&&(t.remove(p),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function o(d,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,e.memory.geometries++),h}function c(d){let h=d.attributes;for(let _ in h)t.update(h[_],i.ARRAY_BUFFER);let p=d.morphAttributes;for(let _ in p){let x=p[_];for(let m=0,f=x.length;m<f;m++)t.update(x[m],i.ARRAY_BUFFER)}}function l(d){let h=[],p=d.index,_=d.attributes.position,x=0;if(p!==null){let y=p.array;x=p.version;for(let g=0,M=y.length;g<M;g+=3){let A=y[g+0],T=y[g+1],S=y[g+2];h.push(A,T,T,S,S,A)}}else if(_!==void 0){let y=_.array;x=_.version;for(let g=0,M=y.length/3-1;g<M;g+=3){let A=g+0,T=g+1,S=g+2;h.push(A,T,T,S,S,A)}}else return;let m=new(Lu(h)?Rr:wr)(h,1);m.version=x;let f=r.get(d);f&&t.remove(f),r.set(d,m)}function u(d){let h=r.get(d);if(h){let p=d.index;p!==null&&h.version<p.version&&l(d)}else l(d);return r.get(d)}return{get:o,update:c,getWireframeAttribute:u}}function wg(i,t,e,n){let s=n.isWebGL2,r;function a(p){r=p}let o,c;function l(p){o=p.type,c=p.bytesPerElement}function u(p,_){i.drawElements(r,_,o,p*c),e.update(_,r,1)}function d(p,_,x){if(x===0)return;let m,f;if(s)m=i,f="drawElementsInstanced";else if(m=t.get("ANGLE_instanced_arrays"),f="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[f](r,_,o,p*c,x),e.update(_,r,x)}function h(p,_,x){if(x===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<x;f++)this.render(p[f]/c,_[f]);else{m.multiDrawElementsWEBGL(r,_,0,o,p,0,x);let f=0;for(let y=0;y<x;y++)f+=_[y];e.update(f,r,1)}}this.setMode=a,this.setIndex=l,this.render=u,this.renderInstances=d,this.renderMultiDraw=h}function Rg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Cg(i,t){return i[0]-t[0]}function Pg(i,t){return Math.abs(t[1])-Math.abs(i[1])}function Ig(i,t,e){let n={},s=new Float32Array(8),r=new WeakMap,a=new Qt,o=[];for(let l=0;l<8;l++)o[l]=[l,0];function c(l,u,d){let h=l.morphTargetInfluences;if(t.isWebGL2===!0){let p=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,_=p!==void 0?p.length:0,x=r.get(u);if(x===void 0||x.count!==_){let L=function(){P.dispose(),r.delete(u),u.removeEventListener("dispose",L)};x!==void 0&&x.texture.dispose();let y=u.morphAttributes.position!==void 0,g=u.morphAttributes.normal!==void 0,M=u.morphAttributes.color!==void 0,A=u.morphAttributes.position||[],T=u.morphAttributes.normal||[],S=u.morphAttributes.color||[],I=0;y===!0&&(I=1),g===!0&&(I=2),M===!0&&(I=3);let v=u.attributes.position.count*I,b=1;v>t.maxTextureSize&&(b=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let R=new Float32Array(v*b*4*_),P=new Ar(R,v,b,_);P.type=Gn,P.needsUpdate=!0;let F=I*4;for(let U=0;U<_;U++){let B=A[U],Y=T[U],G=S[U],q=v*b*4*U;for(let J=0;J<B.count;J++){let Q=J*F;y===!0&&(a.fromBufferAttribute(B,J),R[q+Q+0]=a.x,R[q+Q+1]=a.y,R[q+Q+2]=a.z,R[q+Q+3]=0),g===!0&&(a.fromBufferAttribute(Y,J),R[q+Q+4]=a.x,R[q+Q+5]=a.y,R[q+Q+6]=a.z,R[q+Q+7]=0),M===!0&&(a.fromBufferAttribute(G,J),R[q+Q+8]=a.x,R[q+Q+9]=a.y,R[q+Q+10]=a.z,R[q+Q+11]=G.itemSize===4?a.w:1)}}x={count:_,texture:P,size:new Ct(v,b)},r.set(u,x),u.addEventListener("dispose",L)}let m=0;for(let y=0;y<h.length;y++)m+=h[y];let f=u.morphTargetsRelative?1:1-m;d.getUniforms().setValue(i,"morphTargetBaseInfluence",f),d.getUniforms().setValue(i,"morphTargetInfluences",h),d.getUniforms().setValue(i,"morphTargetsTexture",x.texture,e),d.getUniforms().setValue(i,"morphTargetsTextureSize",x.size)}else{let p=h===void 0?0:h.length,_=n[u.id];if(_===void 0||_.length!==p){_=[];for(let g=0;g<p;g++)_[g]=[g,0];n[u.id]=_}for(let g=0;g<p;g++){let M=_[g];M[0]=g,M[1]=h[g]}_.sort(Pg);for(let g=0;g<8;g++)g<p&&_[g][1]?(o[g][0]=_[g][0],o[g][1]=_[g][1]):(o[g][0]=Number.MAX_SAFE_INTEGER,o[g][1]=0);o.sort(Cg);let x=u.morphAttributes.position,m=u.morphAttributes.normal,f=0;for(let g=0;g<8;g++){let M=o[g],A=M[0],T=M[1];A!==Number.MAX_SAFE_INTEGER&&T?(x&&u.getAttribute("morphTarget"+g)!==x[A]&&u.setAttribute("morphTarget"+g,x[A]),m&&u.getAttribute("morphNormal"+g)!==m[A]&&u.setAttribute("morphNormal"+g,m[A]),s[g]=T,f+=T):(x&&u.hasAttribute("morphTarget"+g)===!0&&u.deleteAttribute("morphTarget"+g),m&&u.hasAttribute("morphNormal"+g)===!0&&u.deleteAttribute("morphNormal"+g),s[g]=0)}let y=u.morphTargetsRelative?1:1-f;d.getUniforms().setValue(i,"morphTargetBaseInfluence",y),d.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:c}}function Lg(i,t,e,n){let s=new WeakMap;function r(c){let l=n.render.frame,u=c.geometry,d=t.get(c,u);if(s.get(d)!==l&&(t.update(d),s.set(d,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==l&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let h=c.skeleton;s.get(h)!==l&&(h.update(),s.set(h,l))}return d}function a(){s=new WeakMap}function o(c){let l=c.target;l.removeEventListener("dispose",o),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:r,dispose:a}}var Dr=class extends ln{constructor(t,e,n,s,r,a,o,c,l,u){if(u=u!==void 0?u:fi,u!==fi&&u!==Zi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===fi&&(n=Hn),n===void 0&&u===Zi&&(n=hi),super(null,s,r,a,o,c,u,n,l),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Ue,this.minFilter=c!==void 0?c:Ue,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Fu=new ln,Ou=new Dr(1,1);Ou.compareFunction=Iu;var Bu=new Ar,zu=new ma,ku=new Pr,su=[],ru=[],ou=new Float32Array(16),au=new Float32Array(9),cu=new Float32Array(4);function ji(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=su[s];if(r===void 0&&(r=new Float32Array(s),su[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function ge(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function _e(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Or(i,t){let e=ru[t];e===void 0&&(e=new Int32Array(t),ru[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Dg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Ug(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ge(e,t))return;i.uniform2fv(this.addr,t),_e(e,t)}}function Ng(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ge(e,t))return;i.uniform3fv(this.addr,t),_e(e,t)}}function Fg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ge(e,t))return;i.uniform4fv(this.addr,t),_e(e,t)}}function Og(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ge(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),_e(e,t)}else{if(ge(e,n))return;cu.set(n),i.uniformMatrix2fv(this.addr,!1,cu),_e(e,n)}}function Bg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ge(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),_e(e,t)}else{if(ge(e,n))return;au.set(n),i.uniformMatrix3fv(this.addr,!1,au),_e(e,n)}}function zg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ge(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),_e(e,t)}else{if(ge(e,n))return;ou.set(n),i.uniformMatrix4fv(this.addr,!1,ou),_e(e,n)}}function kg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Vg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ge(e,t))return;i.uniform2iv(this.addr,t),_e(e,t)}}function Hg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ge(e,t))return;i.uniform3iv(this.addr,t),_e(e,t)}}function Gg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ge(e,t))return;i.uniform4iv(this.addr,t),_e(e,t)}}function Wg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Xg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ge(e,t))return;i.uniform2uiv(this.addr,t),_e(e,t)}}function qg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ge(e,t))return;i.uniform3uiv(this.addr,t),_e(e,t)}}function Yg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ge(e,t))return;i.uniform4uiv(this.addr,t),_e(e,t)}}function Zg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r=this.type===i.SAMPLER_2D_SHADOW?Ou:Fu;e.setTexture2D(t||r,s)}function Jg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||zu,s)}function $g(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||ku,s)}function Kg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Bu,s)}function jg(i){switch(i){case 5126:return Dg;case 35664:return Ug;case 35665:return Ng;case 35666:return Fg;case 35674:return Og;case 35675:return Bg;case 35676:return zg;case 5124:case 35670:return kg;case 35667:case 35671:return Vg;case 35668:case 35672:return Hg;case 35669:case 35673:return Gg;case 5125:return Wg;case 36294:return Xg;case 36295:return qg;case 36296:return Yg;case 35678:case 36198:case 36298:case 36306:case 35682:return Zg;case 35679:case 36299:case 36307:return Jg;case 35680:case 36300:case 36308:case 36293:return $g;case 36289:case 36303:case 36311:case 36292:return Kg}}function Qg(i,t){i.uniform1fv(this.addr,t)}function t_(i,t){let e=ji(t,this.size,2);i.uniform2fv(this.addr,e)}function e_(i,t){let e=ji(t,this.size,3);i.uniform3fv(this.addr,e)}function n_(i,t){let e=ji(t,this.size,4);i.uniform4fv(this.addr,e)}function i_(i,t){let e=ji(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function s_(i,t){let e=ji(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function r_(i,t){let e=ji(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function o_(i,t){i.uniform1iv(this.addr,t)}function a_(i,t){i.uniform2iv(this.addr,t)}function c_(i,t){i.uniform3iv(this.addr,t)}function l_(i,t){i.uniform4iv(this.addr,t)}function u_(i,t){i.uniform1uiv(this.addr,t)}function h_(i,t){i.uniform2uiv(this.addr,t)}function f_(i,t){i.uniform3uiv(this.addr,t)}function d_(i,t){i.uniform4uiv(this.addr,t)}function p_(i,t,e){let n=this.cache,s=t.length,r=Or(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),_e(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Fu,r[a])}function m_(i,t,e){let n=this.cache,s=t.length,r=Or(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),_e(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||zu,r[a])}function g_(i,t,e){let n=this.cache,s=t.length,r=Or(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),_e(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||ku,r[a])}function __(i,t,e){let n=this.cache,s=t.length,r=Or(e,s);ge(n,r)||(i.uniform1iv(this.addr,r),_e(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Bu,r[a])}function x_(i){switch(i){case 5126:return Qg;case 35664:return t_;case 35665:return e_;case 35666:return n_;case 35674:return i_;case 35675:return s_;case 35676:return r_;case 5124:case 35670:return o_;case 35667:case 35671:return a_;case 35668:case 35672:return c_;case 35669:case 35673:return l_;case 5125:return u_;case 36294:return h_;case 36295:return f_;case 36296:return d_;case 35678:case 36198:case 36298:case 36306:case 35682:return p_;case 35679:case 36299:case 36307:return m_;case 35680:case 36300:case 36308:case 36293:return g_;case 36289:case 36303:case 36311:case 36292:return __}}var va=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=jg(e.type)}},Ma=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=x_(e.type)}},Sa=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},sa=/(\w+)(\])?(\[|\.)?/g;function lu(i,t){i.seq.push(t),i.map[t.id]=t}function y_(i,t,e){let n=i.name,s=n.length;for(sa.lastIndex=0;;){let r=sa.exec(n),a=sa.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){lu(e,l===void 0?new va(o,i,t):new Ma(o,i,t));break}else{let d=e.map[o];d===void 0&&(d=new Sa(o),lu(e,d)),e=d}}}var Xi=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);y_(r,a,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function uu(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var v_=37297,M_=0;function S_(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}function b_(i){let t=qt.getPrimaries(qt.workingColorSpace),e=qt.getPrimaries(i),n;switch(t===e?n="":t===yr&&e===xr?n="LinearDisplayP3ToLinearSRGB":t===xr&&e===yr&&(n="LinearSRGBToLinearDisplayP3"),i){case Pn:case Fr:return[n,"LinearTransferOETF"];case Te:case Xa:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function hu(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+S_(i.getShaderSource(t),a)}else return s}function A_(i,t){let e=b_(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function T_(i,t){let e;switch(t){case Hf:e="Linear";break;case Gf:e="Reinhard";break;case Wf:e="OptimizedCineon";break;case Xf:e="ACESFilmic";break;case Yf:e="AgX";break;case qf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function E_(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Vi).join(`
`)}function w_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(Vi).join(`
`)}function R_(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function C_(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Vi(i){return i!==""}function fu(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function du(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var P_=/^[ \t]*#include +<([\w\d./]+)>/gm;function ba(i){return i.replace(P_,L_)}var I_=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function L_(i,t){let e=Lt[t];if(e===void 0){let n=I_.get(t);if(n!==void 0)e=Lt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return ba(e)}var D_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pu(i){return i.replace(D_,U_)}function U_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function mu(i){let t="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function N_(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===vu?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===gf?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Rn&&(t="SHADOWMAP_TYPE_VSM"),t}function F_(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case qi:case Yi:t="ENVMAP_TYPE_CUBE";break;case Nr:t="ENVMAP_TYPE_CUBE_UV";break}return t}function O_(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Yi:t="ENVMAP_MODE_REFRACTION";break}return t}function B_(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Mu:t="ENVMAP_BLENDING_MULTIPLY";break;case kf:t="ENVMAP_BLENDING_MIX";break;case Vf:t="ENVMAP_BLENDING_ADD";break}return t}function z_(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function k_(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,c=N_(e),l=F_(e),u=O_(e),d=B_(e),h=z_(e),p=e.isWebGL2?"":E_(e),_=w_(e),x=R_(r),m=s.createProgram(),f,y,g=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x].filter(Vi).join(`
`),f.length>0&&(f+=`
`),y=[p,"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x].filter(Vi).join(`
`),y.length>0&&(y+=`
`)):(f=[mu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Vi).join(`
`),y=[p,mu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+u:"",e.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Xn?"#define TONE_MAPPING":"",e.toneMapping!==Xn?Lt.tonemapping_pars_fragment:"",e.toneMapping!==Xn?T_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Lt.colorspace_pars_fragment,A_("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Vi).join(`
`)),a=ba(a),a=fu(a,e),a=du(a,e),o=ba(o),o=fu(o,e),o=du(o,e),a=pu(a),o=pu(o),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,f=[_,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,y=["precision mediump sampler2DArray;","#define varying in",e.glslVersion===Ul?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ul?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+y);let M=g+f+a,A=g+y+o,T=uu(s,s.VERTEX_SHADER,M),S=uu(s,s.FRAGMENT_SHADER,A);s.attachShader(m,T),s.attachShader(m,S),e.index0AttributeName!==void 0?s.bindAttribLocation(m,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(m,0,"position"),s.linkProgram(m);function I(P){if(i.debug.checkShaderErrors){let F=s.getProgramInfoLog(m).trim(),L=s.getShaderInfoLog(T).trim(),U=s.getShaderInfoLog(S).trim(),B=!0,Y=!0;if(s.getProgramParameter(m,s.LINK_STATUS)===!1)if(B=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,m,T,S);else{let G=hu(s,T,"vertex"),q=hu(s,S,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(m,s.VALIDATE_STATUS)+`

Program Info Log: `+F+`
`+G+`
`+q)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(L===""||U==="")&&(Y=!1);Y&&(P.diagnostics={runnable:B,programLog:F,vertexShader:{log:L,prefix:f},fragmentShader:{log:U,prefix:y}})}s.deleteShader(T),s.deleteShader(S),v=new Xi(s,m),b=C_(s,m)}let v;this.getUniforms=function(){return v===void 0&&I(this),v};let b;this.getAttributes=function(){return b===void 0&&I(this),b};let R=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(m,v_)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(m),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=M_++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=T,this.fragmentShader=S,this}var V_=0,Aa=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Ta(t),e.set(t,n)),n}},Ta=class{constructor(t){this.id=V_++,this.code=t,this.usedTimes=0}};function H_(i,t,e,n,s,r,a){let o=new Er,c=new Aa,l=[],u=s.isWebGL2,d=s.logarithmicDepthBuffer,h=s.vertexTextures,p=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(v){return v===0?"uv":`uv${v}`}function m(v,b,R,P,F){let L=P.fog,U=F.geometry,B=v.isMeshStandardMaterial?P.environment:null,Y=(v.isMeshStandardMaterial?e:t).get(v.envMap||B),G=Y&&Y.mapping===Nr?Y.image.height:null,q=_[v.type];v.precision!==null&&(p=s.getMaxPrecision(v.precision),p!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",p,"instead."));let J=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Q=J!==void 0?J.length:0,at=0;U.morphAttributes.position!==void 0&&(at=1),U.morphAttributes.normal!==void 0&&(at=2),U.morphAttributes.color!==void 0&&(at=3);let X,Z,it,mt;if(q){let Ie=gn[q];X=Ie.vertexShader,Z=Ie.fragmentShader}else X=v.vertexShader,Z=v.fragmentShader,c.update(v),it=c.getVertexShaderID(v),mt=c.getFragmentShaderID(v);let pt=i.getRenderTarget(),wt=F.isInstancedMesh===!0,Pt=F.isBatchedMesh===!0,Mt=!!v.map,Vt=!!v.matcap,z=!!Y,Pe=!!v.aoMap,_t=!!v.lightMap,Tt=!!v.bumpMap,ht=!!v.normalMap,se=!!v.displacementMap,Ut=!!v.emissiveMap,C=!!v.metalnessMap,E=!!v.roughnessMap,V=v.anisotropy>0,j=v.clearcoat>0,K=v.iridescence>0,tt=v.sheen>0,ft=v.transmission>0,ot=V&&!!v.anisotropyMap,lt=j&&!!v.clearcoatMap,vt=j&&!!v.clearcoatNormalMap,Nt=j&&!!v.clearcoatRoughnessMap,$=K&&!!v.iridescenceMap,Xt=K&&!!v.iridescenceThicknessMap,zt=tt&&!!v.sheenColorMap,At=tt&&!!v.sheenRoughnessMap,gt=!!v.specularMap,ut=!!v.specularColorMap,It=!!v.specularIntensityMap,Wt=ft&&!!v.transmissionMap,ae=ft&&!!v.thicknessMap,Ot=!!v.gradientMap,et=!!v.alphaMap,N=v.alphaTest>0,st=!!v.alphaHash,rt=!!v.extensions,St=!!U.attributes.uv1,xt=!!U.attributes.uv2,$t=!!U.attributes.uv3,Kt=Xn;return v.toneMapped&&(pt===null||pt.isXRRenderTarget===!0)&&(Kt=i.toneMapping),{isWebGL2:u,shaderID:q,shaderType:v.type,shaderName:v.name,vertexShader:X,fragmentShader:Z,defines:v.defines,customVertexShaderID:it,customFragmentShaderID:mt,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:p,batching:Pt,instancing:wt,instancingColor:wt&&F.instanceColor!==null,supportsVertexTextures:h,outputColorSpace:pt===null?i.outputColorSpace:pt.isXRRenderTarget===!0?pt.texture.colorSpace:Pn,map:Mt,matcap:Vt,envMap:z,envMapMode:z&&Y.mapping,envMapCubeUVHeight:G,aoMap:Pe,lightMap:_t,bumpMap:Tt,normalMap:ht,displacementMap:h&&se,emissiveMap:Ut,normalMapObjectSpace:ht&&v.normalMapType===od,normalMapTangentSpace:ht&&v.normalMapType===rd,metalnessMap:C,roughnessMap:E,anisotropy:V,anisotropyMap:ot,clearcoat:j,clearcoatMap:lt,clearcoatNormalMap:vt,clearcoatRoughnessMap:Nt,iridescence:K,iridescenceMap:$,iridescenceThicknessMap:Xt,sheen:tt,sheenColorMap:zt,sheenRoughnessMap:At,specularMap:gt,specularColorMap:ut,specularIntensityMap:It,transmission:ft,transmissionMap:Wt,thicknessMap:ae,gradientMap:Ot,opaque:v.transparent===!1&&v.blending===Gi,alphaMap:et,alphaTest:N,alphaHash:st,combine:v.combine,mapUv:Mt&&x(v.map.channel),aoMapUv:Pe&&x(v.aoMap.channel),lightMapUv:_t&&x(v.lightMap.channel),bumpMapUv:Tt&&x(v.bumpMap.channel),normalMapUv:ht&&x(v.normalMap.channel),displacementMapUv:se&&x(v.displacementMap.channel),emissiveMapUv:Ut&&x(v.emissiveMap.channel),metalnessMapUv:C&&x(v.metalnessMap.channel),roughnessMapUv:E&&x(v.roughnessMap.channel),anisotropyMapUv:ot&&x(v.anisotropyMap.channel),clearcoatMapUv:lt&&x(v.clearcoatMap.channel),clearcoatNormalMapUv:vt&&x(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Nt&&x(v.clearcoatRoughnessMap.channel),iridescenceMapUv:$&&x(v.iridescenceMap.channel),iridescenceThicknessMapUv:Xt&&x(v.iridescenceThicknessMap.channel),sheenColorMapUv:zt&&x(v.sheenColorMap.channel),sheenRoughnessMapUv:At&&x(v.sheenRoughnessMap.channel),specularMapUv:gt&&x(v.specularMap.channel),specularColorMapUv:ut&&x(v.specularColorMap.channel),specularIntensityMapUv:It&&x(v.specularIntensityMap.channel),transmissionMapUv:Wt&&x(v.transmissionMap.channel),thicknessMapUv:ae&&x(v.thicknessMap.channel),alphaMapUv:et&&x(v.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(ht||V),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,vertexUv1s:St,vertexUv2s:xt,vertexUv3s:$t,pointsUvs:F.isPoints===!0&&!!U.attributes.uv&&(Mt||et),fog:!!L,useFog:v.fog===!0,fogExp2:L&&L.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:d,skinning:F.isSkinnedMesh===!0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Q,morphTextureStride:at,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:Kt,useLegacyLights:i._useLegacyLights,decodeVideoTexture:Mt&&v.map.isVideoTexture===!0&&qt.getTransfer(v.map.colorSpace)===te,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===ke,flipSided:v.side===Ce,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:rt&&v.extensions.derivatives===!0,extensionFragDepth:rt&&v.extensions.fragDepth===!0,extensionDrawBuffers:rt&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:rt&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:rt&&v.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:u||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()}}function f(v){let b=[];if(v.shaderID?b.push(v.shaderID):(b.push(v.customVertexShaderID),b.push(v.customFragmentShaderID)),v.defines!==void 0)for(let R in v.defines)b.push(R),b.push(v.defines[R]);return v.isRawShaderMaterial===!1&&(y(b,v),g(b,v),b.push(i.outputColorSpace)),b.push(v.customProgramCacheKey),b.join()}function y(v,b){v.push(b.precision),v.push(b.outputColorSpace),v.push(b.envMapMode),v.push(b.envMapCubeUVHeight),v.push(b.mapUv),v.push(b.alphaMapUv),v.push(b.lightMapUv),v.push(b.aoMapUv),v.push(b.bumpMapUv),v.push(b.normalMapUv),v.push(b.displacementMapUv),v.push(b.emissiveMapUv),v.push(b.metalnessMapUv),v.push(b.roughnessMapUv),v.push(b.anisotropyMapUv),v.push(b.clearcoatMapUv),v.push(b.clearcoatNormalMapUv),v.push(b.clearcoatRoughnessMapUv),v.push(b.iridescenceMapUv),v.push(b.iridescenceThicknessMapUv),v.push(b.sheenColorMapUv),v.push(b.sheenRoughnessMapUv),v.push(b.specularMapUv),v.push(b.specularColorMapUv),v.push(b.specularIntensityMapUv),v.push(b.transmissionMapUv),v.push(b.thicknessMapUv),v.push(b.combine),v.push(b.fogExp2),v.push(b.sizeAttenuation),v.push(b.morphTargetsCount),v.push(b.morphAttributeCount),v.push(b.numDirLights),v.push(b.numPointLights),v.push(b.numSpotLights),v.push(b.numSpotLightMaps),v.push(b.numHemiLights),v.push(b.numRectAreaLights),v.push(b.numDirLightShadows),v.push(b.numPointLightShadows),v.push(b.numSpotLightShadows),v.push(b.numSpotLightShadowsWithMaps),v.push(b.numLightProbes),v.push(b.shadowMapType),v.push(b.toneMapping),v.push(b.numClippingPlanes),v.push(b.numClipIntersection),v.push(b.depthPacking)}function g(v,b){o.disableAll(),b.isWebGL2&&o.enable(0),b.supportsVertexTextures&&o.enable(1),b.instancing&&o.enable(2),b.instancingColor&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),v.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.skinning&&o.enable(4),b.morphTargets&&o.enable(5),b.morphNormals&&o.enable(6),b.morphColors&&o.enable(7),b.premultipliedAlpha&&o.enable(8),b.shadowMapEnabled&&o.enable(9),b.useLegacyLights&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),v.push(o.mask)}function M(v){let b=_[v.type],R;if(b){let P=gn[b];R=Id.clone(P.uniforms)}else R=v.uniforms;return R}function A(v,b){let R;for(let P=0,F=l.length;P<F;P++){let L=l[P];if(L.cacheKey===b){R=L,++R.usedTimes;break}}return R===void 0&&(R=new k_(i,b,v,r),l.push(R)),R}function T(v){if(--v.usedTimes===0){let b=l.indexOf(v);l[b]=l[l.length-1],l.pop(),v.destroy()}}function S(v){c.remove(v)}function I(){c.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:M,acquireProgram:A,releaseProgram:T,releaseShaderCache:S,programs:l,dispose:I}}function G_(){let i=new WeakMap;function t(r){let a=i.get(r);return a===void 0&&(a={},i.set(r,a)),a}function e(r){i.delete(r)}function n(r,a,o){i.get(r)[a]=o}function s(){i=new WeakMap}return{get:t,remove:e,update:n,dispose:s}}function W_(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function gu(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function _u(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(d,h,p,_,x,m){let f=i[t];return f===void 0?(f={id:d.id,object:d,geometry:h,material:p,groupOrder:_,renderOrder:d.renderOrder,z:x,group:m},i[t]=f):(f.id=d.id,f.object=d,f.geometry=h,f.material=p,f.groupOrder=_,f.renderOrder=d.renderOrder,f.z=x,f.group=m),t++,f}function o(d,h,p,_,x,m){let f=a(d,h,p,_,x,m);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):e.push(f)}function c(d,h,p,_,x,m){let f=a(d,h,p,_,x,m);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):e.unshift(f)}function l(d,h){e.length>1&&e.sort(d||W_),n.length>1&&n.sort(h||gu),s.length>1&&s.sort(h||gu)}function u(){for(let d=t,h=i.length;d<h;d++){let p=i[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:c,finish:u,sort:l}}function X_(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new _u,i.set(n,[a])):s>=r.length?(a=new _u,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function q_(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new D,color:new Gt};break;case"SpotLight":e={position:new D,direction:new D,color:new Gt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new Gt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new Gt,groundColor:new Gt};break;case"RectAreaLight":e={color:new Gt,position:new D,halfWidth:new D,halfHeight:new D};break}return i[t.id]=e,e}}}function Y_(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ct};break;case"SpotLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ct};break;case"PointLight":e={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ct,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Z_=0;function J_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function $_(i,t){let e=new q_,n=Y_(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)s.probe.push(new D);let r=new D,a=new kt,o=new kt;function c(u,d){let h=0,p=0,_=0;for(let P=0;P<9;P++)s.probe[P].set(0,0,0);let x=0,m=0,f=0,y=0,g=0,M=0,A=0,T=0,S=0,I=0,v=0;u.sort(J_);let b=d===!0?Math.PI:1;for(let P=0,F=u.length;P<F;P++){let L=u[P],U=L.color,B=L.intensity,Y=L.distance,G=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)h+=U.r*B*b,p+=U.g*B*b,_+=U.b*B*b;else if(L.isLightProbe){for(let q=0;q<9;q++)s.probe[q].addScaledVector(L.sh.coefficients[q],B);v++}else if(L.isDirectionalLight){let q=e.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity*b),L.castShadow){let J=L.shadow,Q=n.get(L);Q.shadowBias=J.bias,Q.shadowNormalBias=J.normalBias,Q.shadowRadius=J.radius,Q.shadowMapSize=J.mapSize,s.directionalShadow[x]=Q,s.directionalShadowMap[x]=G,s.directionalShadowMatrix[x]=L.shadow.matrix,M++}s.directional[x]=q,x++}else if(L.isSpotLight){let q=e.get(L);q.position.setFromMatrixPosition(L.matrixWorld),q.color.copy(U).multiplyScalar(B*b),q.distance=Y,q.coneCos=Math.cos(L.angle),q.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),q.decay=L.decay,s.spot[f]=q;let J=L.shadow;if(L.map&&(s.spotLightMap[S]=L.map,S++,J.updateMatrices(L),L.castShadow&&I++),s.spotLightMatrix[f]=J.matrix,L.castShadow){let Q=n.get(L);Q.shadowBias=J.bias,Q.shadowNormalBias=J.normalBias,Q.shadowRadius=J.radius,Q.shadowMapSize=J.mapSize,s.spotShadow[f]=Q,s.spotShadowMap[f]=G,T++}f++}else if(L.isRectAreaLight){let q=e.get(L);q.color.copy(U).multiplyScalar(B),q.halfWidth.set(L.width*.5,0,0),q.halfHeight.set(0,L.height*.5,0),s.rectArea[y]=q,y++}else if(L.isPointLight){let q=e.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity*b),q.distance=L.distance,q.decay=L.decay,L.castShadow){let J=L.shadow,Q=n.get(L);Q.shadowBias=J.bias,Q.shadowNormalBias=J.normalBias,Q.shadowRadius=J.radius,Q.shadowMapSize=J.mapSize,Q.shadowCameraNear=J.camera.near,Q.shadowCameraFar=J.camera.far,s.pointShadow[m]=Q,s.pointShadowMap[m]=G,s.pointShadowMatrix[m]=L.shadow.matrix,A++}s.point[m]=q,m++}else if(L.isHemisphereLight){let q=e.get(L);q.skyColor.copy(L.color).multiplyScalar(B*b),q.groundColor.copy(L.groundColor).multiplyScalar(B*b),s.hemi[g]=q,g++}}y>0&&(t.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=nt.LTC_FLOAT_1,s.rectAreaLTC2=nt.LTC_FLOAT_2):(s.rectAreaLTC1=nt.LTC_HALF_1,s.rectAreaLTC2=nt.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=nt.LTC_FLOAT_1,s.rectAreaLTC2=nt.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=nt.LTC_HALF_1,s.rectAreaLTC2=nt.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=h,s.ambient[1]=p,s.ambient[2]=_;let R=s.hash;(R.directionalLength!==x||R.pointLength!==m||R.spotLength!==f||R.rectAreaLength!==y||R.hemiLength!==g||R.numDirectionalShadows!==M||R.numPointShadows!==A||R.numSpotShadows!==T||R.numSpotMaps!==S||R.numLightProbes!==v)&&(s.directional.length=x,s.spot.length=f,s.rectArea.length=y,s.point.length=m,s.hemi.length=g,s.directionalShadow.length=M,s.directionalShadowMap.length=M,s.pointShadow.length=A,s.pointShadowMap.length=A,s.spotShadow.length=T,s.spotShadowMap.length=T,s.directionalShadowMatrix.length=M,s.pointShadowMatrix.length=A,s.spotLightMatrix.length=T+S-I,s.spotLightMap.length=S,s.numSpotLightShadowsWithMaps=I,s.numLightProbes=v,R.directionalLength=x,R.pointLength=m,R.spotLength=f,R.rectAreaLength=y,R.hemiLength=g,R.numDirectionalShadows=M,R.numPointShadows=A,R.numSpotShadows=T,R.numSpotMaps=S,R.numLightProbes=v,s.version=Z_++)}function l(u,d){let h=0,p=0,_=0,x=0,m=0,f=d.matrixWorldInverse;for(let y=0,g=u.length;y<g;y++){let M=u[y];if(M.isDirectionalLight){let A=s.directional[h];A.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(r),A.direction.transformDirection(f),h++}else if(M.isSpotLight){let A=s.spot[_];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(f),A.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(r),A.direction.transformDirection(f),_++}else if(M.isRectAreaLight){let A=s.rectArea[x];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(f),o.identity(),a.copy(M.matrixWorld),a.premultiply(f),o.extractRotation(a),A.halfWidth.set(M.width*.5,0,0),A.halfHeight.set(0,M.height*.5,0),A.halfWidth.applyMatrix4(o),A.halfHeight.applyMatrix4(o),x++}else if(M.isPointLight){let A=s.point[p];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(f),p++}else if(M.isHemisphereLight){let A=s.hemi[m];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(f),m++}}}return{setup:c,setupView:l,state:s}}function xu(i,t){let e=new $_(i,t),n=[],s=[];function r(){n.length=0,s.length=0}function a(d){n.push(d)}function o(d){s.push(d)}function c(d){e.setup(n,d)}function l(d){e.setupView(n,d)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:e},setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function K_(i,t){let e=new WeakMap;function n(r,a=0){let o=e.get(r),c;return o===void 0?(c=new xu(i,t),e.set(r,[c])):a>=o.length?(c=new xu(i,t),o.push(c)):c=o[a],c}function s(){e=new WeakMap}return{get:n,dispose:s}}var Ea=class extends Ji{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=id,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},wa=class extends Ji{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},j_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Q_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function t0(i,t,e){let n=new Ir,s=new Ct,r=new Ct,a=new Qt,o=new Ea({depthPacking:sd}),c=new wa,l={},u=e.maxTextureSize,d={[cn]:Ce,[Ce]:cn,[ke]:ke},h=new Ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ct},radius:{value:4}},vertexShader:j_,fragmentShader:Q_}),p=h.clone();p.defines.HORIZONTAL_PASS=1;let _=new xn;_.setAttribute("position",new ie(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new je(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=vu;let f=this.type;this.render=function(T,S,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;let v=i.getRenderTarget(),b=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),P=i.state;P.setBlending(Wn),P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let F=f!==Rn&&this.type===Rn,L=f===Rn&&this.type!==Rn;for(let U=0,B=T.length;U<B;U++){let Y=T[U],G=Y.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let q=G.getFrameExtents();if(s.multiply(q),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/q.x),s.x=r.x*q.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/q.y),s.y=r.y*q.y,G.mapSize.y=r.y)),G.map===null||F===!0||L===!0){let Q=this.type!==Rn?{minFilter:Ue,magFilter:Ue}:{};G.map!==null&&G.map.dispose(),G.map=new In(s.x,s.y,Q),G.map.texture.name=Y.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();let J=G.getViewportCount();for(let Q=0;Q<J;Q++){let at=G.getViewport(Q);a.set(r.x*at.x,r.y*at.y,r.x*at.z,r.y*at.w),P.viewport(a),G.updateMatrices(Y,Q),n=G.getFrustum(),M(S,I,G.camera,Y,this.type)}G.isPointLightShadow!==!0&&this.type===Rn&&y(G,I),G.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(v,b,R)};function y(T,S){let I=t.update(x);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new In(s.x,s.y)),h.uniforms.shadow_pass.value=T.map.texture,h.uniforms.resolution.value=T.mapSize,h.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(S,null,I,h,x,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(S,null,I,p,x,null)}function g(T,S,I,v){let b=null,R=I.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(R!==void 0)b=R;else if(b=I.isPointLight===!0?c:o,i.localClippingEnabled&&S.clipShadows===!0&&Array.isArray(S.clippingPlanes)&&S.clippingPlanes.length!==0||S.displacementMap&&S.displacementScale!==0||S.alphaMap&&S.alphaTest>0||S.map&&S.alphaTest>0){let P=b.uuid,F=S.uuid,L=l[P];L===void 0&&(L={},l[P]=L);let U=L[F];U===void 0&&(U=b.clone(),L[F]=U,S.addEventListener("dispose",A)),b=U}if(b.visible=S.visible,b.wireframe=S.wireframe,v===Rn?b.side=S.shadowSide!==null?S.shadowSide:S.side:b.side=S.shadowSide!==null?S.shadowSide:d[S.side],b.alphaMap=S.alphaMap,b.alphaTest=S.alphaTest,b.map=S.map,b.clipShadows=S.clipShadows,b.clippingPlanes=S.clippingPlanes,b.clipIntersection=S.clipIntersection,b.displacementMap=S.displacementMap,b.displacementScale=S.displacementScale,b.displacementBias=S.displacementBias,b.wireframeLinewidth=S.wireframeLinewidth,b.linewidth=S.linewidth,I.isPointLight===!0&&b.isMeshDistanceMaterial===!0){let P=i.properties.get(b);P.light=I}return b}function M(T,S,I,v,b){if(T.visible===!1)return;if(T.layers.test(S.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&b===Rn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,T.matrixWorld);let F=t.update(T),L=T.material;if(Array.isArray(L)){let U=F.groups;for(let B=0,Y=U.length;B<Y;B++){let G=U[B],q=L[G.materialIndex];if(q&&q.visible){let J=g(T,q,v,b);T.onBeforeShadow(i,T,S,I,F,J,G),i.renderBufferDirect(I,null,F,J,T,G),T.onAfterShadow(i,T,S,I,F,J,G)}}}else if(L.visible){let U=g(T,L,v,b);T.onBeforeShadow(i,T,S,I,F,U,null),i.renderBufferDirect(I,null,F,U,T,null),T.onAfterShadow(i,T,S,I,F,U,null)}}let P=T.children;for(let F=0,L=P.length;F<L;F++)M(P[F],S,I,v,b)}function A(T){T.target.removeEventListener("dispose",A);for(let I in l){let v=l[I],b=T.target.uuid;b in v&&(v[b].dispose(),delete v[b])}}}function e0(i,t,e){let n=e.isWebGL2;function s(){let N=!1,st=new Qt,rt=null,St=new Qt(0,0,0,0);return{setMask:function(xt){rt!==xt&&!N&&(i.colorMask(xt,xt,xt,xt),rt=xt)},setLocked:function(xt){N=xt},setClear:function(xt,$t,Kt,ve,Ie){Ie===!0&&(xt*=ve,$t*=ve,Kt*=ve),st.set(xt,$t,Kt,ve),St.equals(st)===!1&&(i.clearColor(xt,$t,Kt,ve),St.copy(st))},reset:function(){N=!1,rt=null,St.set(-1,0,0,0)}}}function r(){let N=!1,st=null,rt=null,St=null;return{setTest:function(xt){xt?Pt(i.DEPTH_TEST):Mt(i.DEPTH_TEST)},setMask:function(xt){st!==xt&&!N&&(i.depthMask(xt),st=xt)},setFunc:function(xt){if(rt!==xt){switch(xt){case Df:i.depthFunc(i.NEVER);break;case Uf:i.depthFunc(i.ALWAYS);break;case Nf:i.depthFunc(i.LESS);break;case pr:i.depthFunc(i.LEQUAL);break;case Ff:i.depthFunc(i.EQUAL);break;case Of:i.depthFunc(i.GEQUAL);break;case Bf:i.depthFunc(i.GREATER);break;case zf:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}rt=xt}},setLocked:function(xt){N=xt},setClear:function(xt){St!==xt&&(i.clearDepth(xt),St=xt)},reset:function(){N=!1,st=null,rt=null,St=null}}}function a(){let N=!1,st=null,rt=null,St=null,xt=null,$t=null,Kt=null,ve=null,Ie=null;return{setTest:function(jt){N||(jt?Pt(i.STENCIL_TEST):Mt(i.STENCIL_TEST))},setMask:function(jt){st!==jt&&!N&&(i.stencilMask(jt),st=jt)},setFunc:function(jt,Le,mn){(rt!==jt||St!==Le||xt!==mn)&&(i.stencilFunc(jt,Le,mn),rt=jt,St=Le,xt=mn)},setOp:function(jt,Le,mn){($t!==jt||Kt!==Le||ve!==mn)&&(i.stencilOp(jt,Le,mn),$t=jt,Kt=Le,ve=mn)},setLocked:function(jt){N=jt},setClear:function(jt){Ie!==jt&&(i.clearStencil(jt),Ie=jt)},reset:function(){N=!1,st=null,rt=null,St=null,xt=null,$t=null,Kt=null,ve=null,Ie=null}}}let o=new s,c=new r,l=new a,u=new WeakMap,d=new WeakMap,h={},p={},_=new WeakMap,x=[],m=null,f=!1,y=null,g=null,M=null,A=null,T=null,S=null,I=null,v=new Gt(0,0,0),b=0,R=!1,P=null,F=null,L=null,U=null,B=null,Y=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,q=0,J=i.getParameter(i.VERSION);J.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(J)[1]),G=q>=1):J.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),G=q>=2);let Q=null,at={},X=i.getParameter(i.SCISSOR_BOX),Z=i.getParameter(i.VIEWPORT),it=new Qt().fromArray(X),mt=new Qt().fromArray(Z);function pt(N,st,rt,St){let xt=new Uint8Array(4),$t=i.createTexture();i.bindTexture(N,$t),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Kt=0;Kt<rt;Kt++)n&&(N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY)?i.texImage3D(st,0,i.RGBA,1,1,St,0,i.RGBA,i.UNSIGNED_BYTE,xt):i.texImage2D(st+Kt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,xt);return $t}let wt={};wt[i.TEXTURE_2D]=pt(i.TEXTURE_2D,i.TEXTURE_2D,1),wt[i.TEXTURE_CUBE_MAP]=pt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(wt[i.TEXTURE_2D_ARRAY]=pt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),wt[i.TEXTURE_3D]=pt(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),c.setClear(1),l.setClear(0),Pt(i.DEPTH_TEST),c.setFunc(pr),Ut(!1),C(Kc),Pt(i.CULL_FACE),ht(Wn);function Pt(N){h[N]!==!0&&(i.enable(N),h[N]=!0)}function Mt(N){h[N]!==!1&&(i.disable(N),h[N]=!1)}function Vt(N,st){return p[N]!==st?(i.bindFramebuffer(N,st),p[N]=st,n&&(N===i.DRAW_FRAMEBUFFER&&(p[i.FRAMEBUFFER]=st),N===i.FRAMEBUFFER&&(p[i.DRAW_FRAMEBUFFER]=st)),!0):!1}function z(N,st){let rt=x,St=!1;if(N)if(rt=_.get(st),rt===void 0&&(rt=[],_.set(st,rt)),N.isWebGLMultipleRenderTargets){let xt=N.texture;if(rt.length!==xt.length||rt[0]!==i.COLOR_ATTACHMENT0){for(let $t=0,Kt=xt.length;$t<Kt;$t++)rt[$t]=i.COLOR_ATTACHMENT0+$t;rt.length=xt.length,St=!0}}else rt[0]!==i.COLOR_ATTACHMENT0&&(rt[0]=i.COLOR_ATTACHMENT0,St=!0);else rt[0]!==i.BACK&&(rt[0]=i.BACK,St=!0);St&&(e.isWebGL2?i.drawBuffers(rt):t.get("WEBGL_draw_buffers").drawBuffersWEBGL(rt))}function Pe(N){return m!==N?(i.useProgram(N),m=N,!0):!1}let _t={[li]:i.FUNC_ADD,[xf]:i.FUNC_SUBTRACT,[yf]:i.FUNC_REVERSE_SUBTRACT};if(n)_t[el]=i.MIN,_t[nl]=i.MAX;else{let N=t.get("EXT_blend_minmax");N!==null&&(_t[el]=N.MIN_EXT,_t[nl]=N.MAX_EXT)}let Tt={[vf]:i.ZERO,[Mf]:i.ONE,[Sf]:i.SRC_COLOR,[ra]:i.SRC_ALPHA,[Rf]:i.SRC_ALPHA_SATURATE,[Ef]:i.DST_COLOR,[Af]:i.DST_ALPHA,[bf]:i.ONE_MINUS_SRC_COLOR,[oa]:i.ONE_MINUS_SRC_ALPHA,[wf]:i.ONE_MINUS_DST_COLOR,[Tf]:i.ONE_MINUS_DST_ALPHA,[Cf]:i.CONSTANT_COLOR,[Pf]:i.ONE_MINUS_CONSTANT_COLOR,[If]:i.CONSTANT_ALPHA,[Lf]:i.ONE_MINUS_CONSTANT_ALPHA};function ht(N,st,rt,St,xt,$t,Kt,ve,Ie,jt){if(N===Wn){f===!0&&(Mt(i.BLEND),f=!1);return}if(f===!1&&(Pt(i.BLEND),f=!0),N!==_f){if(N!==y||jt!==R){if((g!==li||T!==li)&&(i.blendEquation(i.FUNC_ADD),g=li,T=li),jt)switch(N){case Gi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case jc:i.blendFunc(i.ONE,i.ONE);break;case Qc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case tl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case Gi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case jc:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Qc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case tl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}M=null,A=null,S=null,I=null,v.set(0,0,0),b=0,y=N,R=jt}return}xt=xt||st,$t=$t||rt,Kt=Kt||St,(st!==g||xt!==T)&&(i.blendEquationSeparate(_t[st],_t[xt]),g=st,T=xt),(rt!==M||St!==A||$t!==S||Kt!==I)&&(i.blendFuncSeparate(Tt[rt],Tt[St],Tt[$t],Tt[Kt]),M=rt,A=St,S=$t,I=Kt),(ve.equals(v)===!1||Ie!==b)&&(i.blendColor(ve.r,ve.g,ve.b,Ie),v.copy(ve),b=Ie),y=N,R=!1}function se(N,st){N.side===ke?Mt(i.CULL_FACE):Pt(i.CULL_FACE);let rt=N.side===Ce;st&&(rt=!rt),Ut(rt),N.blending===Gi&&N.transparent===!1?ht(Wn):ht(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),c.setFunc(N.depthFunc),c.setTest(N.depthTest),c.setMask(N.depthWrite),o.setMask(N.colorWrite);let St=N.stencilWrite;l.setTest(St),St&&(l.setMask(N.stencilWriteMask),l.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),l.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),V(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?Pt(i.SAMPLE_ALPHA_TO_COVERAGE):Mt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ut(N){P!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),P=N)}function C(N){N!==pf?(Pt(i.CULL_FACE),N!==F&&(N===Kc?i.cullFace(i.BACK):N===mf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Mt(i.CULL_FACE),F=N}function E(N){N!==L&&(G&&i.lineWidth(N),L=N)}function V(N,st,rt){N?(Pt(i.POLYGON_OFFSET_FILL),(U!==st||B!==rt)&&(i.polygonOffset(st,rt),U=st,B=rt)):Mt(i.POLYGON_OFFSET_FILL)}function j(N){N?Pt(i.SCISSOR_TEST):Mt(i.SCISSOR_TEST)}function K(N){N===void 0&&(N=i.TEXTURE0+Y-1),Q!==N&&(i.activeTexture(N),Q=N)}function tt(N,st,rt){rt===void 0&&(Q===null?rt=i.TEXTURE0+Y-1:rt=Q);let St=at[rt];St===void 0&&(St={type:void 0,texture:void 0},at[rt]=St),(St.type!==N||St.texture!==st)&&(Q!==rt&&(i.activeTexture(rt),Q=rt),i.bindTexture(N,st||wt[N]),St.type=N,St.texture=st)}function ft(){let N=at[Q];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function ot(){try{i.compressedTexImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function lt(){try{i.compressedTexImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function vt(){try{i.texSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Nt(){try{i.texSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function $(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Xt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function zt(){try{i.texStorage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function At(){try{i.texStorage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function gt(){try{i.texImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ut(){try{i.texImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function It(N){it.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),it.copy(N))}function Wt(N){mt.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),mt.copy(N))}function ae(N,st){let rt=d.get(st);rt===void 0&&(rt=new WeakMap,d.set(st,rt));let St=rt.get(N);St===void 0&&(St=i.getUniformBlockIndex(st,N.name),rt.set(N,St))}function Ot(N,st){let St=d.get(st).get(N);u.get(st)!==St&&(i.uniformBlockBinding(st,St,N.__bindingPointIndex),u.set(st,St))}function et(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},Q=null,at={},p={},_=new WeakMap,x=[],m=null,f=!1,y=null,g=null,M=null,A=null,T=null,S=null,I=null,v=new Gt(0,0,0),b=0,R=!1,P=null,F=null,L=null,U=null,B=null,it.set(0,0,i.canvas.width,i.canvas.height),mt.set(0,0,i.canvas.width,i.canvas.height),o.reset(),c.reset(),l.reset()}return{buffers:{color:o,depth:c,stencil:l},enable:Pt,disable:Mt,bindFramebuffer:Vt,drawBuffers:z,useProgram:Pe,setBlending:ht,setMaterial:se,setFlipSided:Ut,setCullFace:C,setLineWidth:E,setPolygonOffset:V,setScissorTest:j,activeTexture:K,bindTexture:tt,unbindTexture:ft,compressedTexImage2D:ot,compressedTexImage3D:lt,texImage2D:gt,texImage3D:ut,updateUBOMapping:ae,uniformBlockBinding:Ot,texStorage2D:zt,texStorage3D:At,texSubImage2D:vt,texSubImage3D:Nt,compressedTexSubImage2D:$,compressedTexSubImage3D:Xt,scissor:It,viewport:Wt,reset:et}}function n0(i,t,e,n,s,r,a){let o=s.isWebGL2,c=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap,d,h=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,E){return p?new OffscreenCanvas(C,E):Mr("canvas")}function x(C,E,V,j){let K=1;if((C.width>j||C.height>j)&&(K=j/Math.max(C.width,C.height)),K<1||E===!0)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap){let tt=E?da:Math.floor,ft=tt(K*C.width),ot=tt(K*C.height);d===void 0&&(d=_(ft,ot));let lt=V?_(ft,ot):d;return lt.width=ft,lt.height=ot,lt.getContext("2d").drawImage(C,0,0,ft,ot),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+C.width+"x"+C.height+") to ("+ft+"x"+ot+")."),lt}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+C.width+"x"+C.height+")."),C;return C}function m(C){return Nl(C.width)&&Nl(C.height)}function f(C){return o?!1:C.wrapS!==on||C.wrapT!==on||C.minFilter!==Ue&&C.minFilter!==$e}function y(C,E){return C.generateMipmaps&&E&&C.minFilter!==Ue&&C.minFilter!==$e}function g(C){i.generateMipmap(C)}function M(C,E,V,j,K=!1){if(o===!1)return E;if(C!==null){if(i[C]!==void 0)return i[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let tt=E;if(E===i.RED&&(V===i.FLOAT&&(tt=i.R32F),V===i.HALF_FLOAT&&(tt=i.R16F),V===i.UNSIGNED_BYTE&&(tt=i.R8)),E===i.RED_INTEGER&&(V===i.UNSIGNED_BYTE&&(tt=i.R8UI),V===i.UNSIGNED_SHORT&&(tt=i.R16UI),V===i.UNSIGNED_INT&&(tt=i.R32UI),V===i.BYTE&&(tt=i.R8I),V===i.SHORT&&(tt=i.R16I),V===i.INT&&(tt=i.R32I)),E===i.RG&&(V===i.FLOAT&&(tt=i.RG32F),V===i.HALF_FLOAT&&(tt=i.RG16F),V===i.UNSIGNED_BYTE&&(tt=i.RG8)),E===i.RGBA){let ft=K?_r:qt.getTransfer(j);V===i.FLOAT&&(tt=i.RGBA32F),V===i.HALF_FLOAT&&(tt=i.RGBA16F),V===i.UNSIGNED_BYTE&&(tt=ft===te?i.SRGB8_ALPHA8:i.RGBA8),V===i.UNSIGNED_SHORT_4_4_4_4&&(tt=i.RGBA4),V===i.UNSIGNED_SHORT_5_5_5_1&&(tt=i.RGB5_A1)}return(tt===i.R16F||tt===i.R32F||tt===i.RG16F||tt===i.RG32F||tt===i.RGBA16F||tt===i.RGBA32F)&&t.get("EXT_color_buffer_float"),tt}function A(C,E,V){return y(C,V)===!0||C.isFramebufferTexture&&C.minFilter!==Ue&&C.minFilter!==$e?Math.log2(Math.max(E.width,E.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?E.mipmaps.length:1}function T(C){return C===Ue||C===il||C===Ro?i.NEAREST:i.LINEAR}function S(C){let E=C.target;E.removeEventListener("dispose",S),v(E),E.isVideoTexture&&u.delete(E)}function I(C){let E=C.target;E.removeEventListener("dispose",I),R(E)}function v(C){let E=n.get(C);if(E.__webglInit===void 0)return;let V=C.source,j=h.get(V);if(j){let K=j[E.__cacheKey];K.usedTimes--,K.usedTimes===0&&b(C),Object.keys(j).length===0&&h.delete(V)}n.remove(C)}function b(C){let E=n.get(C);i.deleteTexture(E.__webglTexture);let V=C.source,j=h.get(V);delete j[E.__cacheKey],a.memory.textures--}function R(C){let E=C.texture,V=n.get(C),j=n.get(E);if(j.__webglTexture!==void 0&&(i.deleteTexture(j.__webglTexture),a.memory.textures--),C.depthTexture&&C.depthTexture.dispose(),C.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(V.__webglFramebuffer[K]))for(let tt=0;tt<V.__webglFramebuffer[K].length;tt++)i.deleteFramebuffer(V.__webglFramebuffer[K][tt]);else i.deleteFramebuffer(V.__webglFramebuffer[K]);V.__webglDepthbuffer&&i.deleteRenderbuffer(V.__webglDepthbuffer[K])}else{if(Array.isArray(V.__webglFramebuffer))for(let K=0;K<V.__webglFramebuffer.length;K++)i.deleteFramebuffer(V.__webglFramebuffer[K]);else i.deleteFramebuffer(V.__webglFramebuffer);if(V.__webglDepthbuffer&&i.deleteRenderbuffer(V.__webglDepthbuffer),V.__webglMultisampledFramebuffer&&i.deleteFramebuffer(V.__webglMultisampledFramebuffer),V.__webglColorRenderbuffer)for(let K=0;K<V.__webglColorRenderbuffer.length;K++)V.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(V.__webglColorRenderbuffer[K]);V.__webglDepthRenderbuffer&&i.deleteRenderbuffer(V.__webglDepthRenderbuffer)}if(C.isWebGLMultipleRenderTargets)for(let K=0,tt=E.length;K<tt;K++){let ft=n.get(E[K]);ft.__webglTexture&&(i.deleteTexture(ft.__webglTexture),a.memory.textures--),n.remove(E[K])}n.remove(E),n.remove(C)}let P=0;function F(){P=0}function L(){let C=P;return C>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),P+=1,C}function U(C){let E=[];return E.push(C.wrapS),E.push(C.wrapT),E.push(C.wrapR||0),E.push(C.magFilter),E.push(C.minFilter),E.push(C.anisotropy),E.push(C.internalFormat),E.push(C.format),E.push(C.type),E.push(C.generateMipmaps),E.push(C.premultiplyAlpha),E.push(C.flipY),E.push(C.unpackAlignment),E.push(C.colorSpace),E.join()}function B(C,E){let V=n.get(C);if(C.isVideoTexture&&se(C),C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){let j=C.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{it(V,C,E);return}}e.bindTexture(i.TEXTURE_2D,V.__webglTexture,i.TEXTURE0+E)}function Y(C,E){let V=n.get(C);if(C.version>0&&V.__version!==C.version){it(V,C,E);return}e.bindTexture(i.TEXTURE_2D_ARRAY,V.__webglTexture,i.TEXTURE0+E)}function G(C,E){let V=n.get(C);if(C.version>0&&V.__version!==C.version){it(V,C,E);return}e.bindTexture(i.TEXTURE_3D,V.__webglTexture,i.TEXTURE0+E)}function q(C,E){let V=n.get(C);if(C.version>0&&V.__version!==C.version){mt(V,C,E);return}e.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture,i.TEXTURE0+E)}let J={[la]:i.REPEAT,[on]:i.CLAMP_TO_EDGE,[ua]:i.MIRRORED_REPEAT},Q={[Ue]:i.NEAREST,[il]:i.NEAREST_MIPMAP_NEAREST,[Ro]:i.NEAREST_MIPMAP_LINEAR,[$e]:i.LINEAR,[Zf]:i.LINEAR_MIPMAP_NEAREST,[bs]:i.LINEAR_MIPMAP_LINEAR},at={[ad]:i.NEVER,[dd]:i.ALWAYS,[cd]:i.LESS,[Iu]:i.LEQUAL,[ld]:i.EQUAL,[fd]:i.GEQUAL,[ud]:i.GREATER,[hd]:i.NOTEQUAL};function X(C,E,V){if(V?(i.texParameteri(C,i.TEXTURE_WRAP_S,J[E.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,J[E.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,J[E.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,Q[E.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,Q[E.minFilter])):(i.texParameteri(C,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(C,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(E.wrapS!==on||E.wrapT!==on)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(C,i.TEXTURE_MAG_FILTER,T(E.magFilter)),i.texParameteri(C,i.TEXTURE_MIN_FILTER,T(E.minFilter)),E.minFilter!==Ue&&E.minFilter!==$e&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),E.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,at[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){let j=t.get("EXT_texture_filter_anisotropic");if(E.magFilter===Ue||E.minFilter!==Ro&&E.minFilter!==bs||E.type===Gn&&t.has("OES_texture_float_linear")===!1||o===!1&&E.type===As&&t.has("OES_texture_half_float_linear")===!1)return;(E.anisotropy>1||n.get(E).__currentAnisotropy)&&(i.texParameterf(C,j.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,s.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy)}}function Z(C,E){let V=!1;C.__webglInit===void 0&&(C.__webglInit=!0,E.addEventListener("dispose",S));let j=E.source,K=h.get(j);K===void 0&&(K={},h.set(j,K));let tt=U(E);if(tt!==C.__cacheKey){K[tt]===void 0&&(K[tt]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,V=!0),K[tt].usedTimes++;let ft=K[C.__cacheKey];ft!==void 0&&(K[C.__cacheKey].usedTimes--,ft.usedTimes===0&&b(E)),C.__cacheKey=tt,C.__webglTexture=K[tt].texture}return V}function it(C,E,V){let j=i.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),E.isData3DTexture&&(j=i.TEXTURE_3D);let K=Z(C,E),tt=E.source;e.bindTexture(j,C.__webglTexture,i.TEXTURE0+V);let ft=n.get(tt);if(tt.version!==ft.__version||K===!0){e.activeTexture(i.TEXTURE0+V);let ot=qt.getPrimaries(qt.workingColorSpace),lt=E.colorSpace===Ke?null:qt.getPrimaries(E.colorSpace),vt=E.colorSpace===Ke||ot===lt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,vt);let Nt=f(E)&&m(E.image)===!1,$=x(E.image,Nt,!1,s.maxTextureSize);$=Ut(E,$);let Xt=m($)||o,zt=r.convert(E.format,E.colorSpace),At=r.convert(E.type),gt=M(E.internalFormat,zt,At,E.colorSpace,E.isVideoTexture);X(j,E,Xt);let ut,It=E.mipmaps,Wt=o&&E.isVideoTexture!==!0&&gt!==Cu,ae=ft.__version===void 0||K===!0,Ot=A(E,$,Xt);if(E.isDepthTexture)gt=i.DEPTH_COMPONENT,o?E.type===Gn?gt=i.DEPTH_COMPONENT32F:E.type===Hn?gt=i.DEPTH_COMPONENT24:E.type===hi?gt=i.DEPTH24_STENCIL8:gt=i.DEPTH_COMPONENT16:E.type===Gn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),E.format===fi&&gt===i.DEPTH_COMPONENT&&E.type!==Wa&&E.type!==Hn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),E.type=Hn,At=r.convert(E.type)),E.format===Zi&&gt===i.DEPTH_COMPONENT&&(gt=i.DEPTH_STENCIL,E.type!==hi&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),E.type=hi,At=r.convert(E.type))),ae&&(Wt?e.texStorage2D(i.TEXTURE_2D,1,gt,$.width,$.height):e.texImage2D(i.TEXTURE_2D,0,gt,$.width,$.height,0,zt,At,null));else if(E.isDataTexture)if(It.length>0&&Xt){Wt&&ae&&e.texStorage2D(i.TEXTURE_2D,Ot,gt,It[0].width,It[0].height);for(let et=0,N=It.length;et<N;et++)ut=It[et],Wt?e.texSubImage2D(i.TEXTURE_2D,et,0,0,ut.width,ut.height,zt,At,ut.data):e.texImage2D(i.TEXTURE_2D,et,gt,ut.width,ut.height,0,zt,At,ut.data);E.generateMipmaps=!1}else Wt?(ae&&e.texStorage2D(i.TEXTURE_2D,Ot,gt,$.width,$.height),e.texSubImage2D(i.TEXTURE_2D,0,0,0,$.width,$.height,zt,At,$.data)):e.texImage2D(i.TEXTURE_2D,0,gt,$.width,$.height,0,zt,At,$.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Wt&&ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ot,gt,It[0].width,It[0].height,$.depth);for(let et=0,N=It.length;et<N;et++)ut=It[et],E.format!==an?zt!==null?Wt?e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,et,0,0,0,ut.width,ut.height,$.depth,zt,ut.data,0,0):e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,et,gt,ut.width,ut.height,$.depth,0,ut.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Wt?e.texSubImage3D(i.TEXTURE_2D_ARRAY,et,0,0,0,ut.width,ut.height,$.depth,zt,At,ut.data):e.texImage3D(i.TEXTURE_2D_ARRAY,et,gt,ut.width,ut.height,$.depth,0,zt,At,ut.data)}else{Wt&&ae&&e.texStorage2D(i.TEXTURE_2D,Ot,gt,It[0].width,It[0].height);for(let et=0,N=It.length;et<N;et++)ut=It[et],E.format!==an?zt!==null?Wt?e.compressedTexSubImage2D(i.TEXTURE_2D,et,0,0,ut.width,ut.height,zt,ut.data):e.compressedTexImage2D(i.TEXTURE_2D,et,gt,ut.width,ut.height,0,ut.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Wt?e.texSubImage2D(i.TEXTURE_2D,et,0,0,ut.width,ut.height,zt,At,ut.data):e.texImage2D(i.TEXTURE_2D,et,gt,ut.width,ut.height,0,zt,At,ut.data)}else if(E.isDataArrayTexture)Wt?(ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ot,gt,$.width,$.height,$.depth),e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,$.width,$.height,$.depth,zt,At,$.data)):e.texImage3D(i.TEXTURE_2D_ARRAY,0,gt,$.width,$.height,$.depth,0,zt,At,$.data);else if(E.isData3DTexture)Wt?(ae&&e.texStorage3D(i.TEXTURE_3D,Ot,gt,$.width,$.height,$.depth),e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,$.width,$.height,$.depth,zt,At,$.data)):e.texImage3D(i.TEXTURE_3D,0,gt,$.width,$.height,$.depth,0,zt,At,$.data);else if(E.isFramebufferTexture){if(ae)if(Wt)e.texStorage2D(i.TEXTURE_2D,Ot,gt,$.width,$.height);else{let et=$.width,N=$.height;for(let st=0;st<Ot;st++)e.texImage2D(i.TEXTURE_2D,st,gt,et,N,0,zt,At,null),et>>=1,N>>=1}}else if(It.length>0&&Xt){Wt&&ae&&e.texStorage2D(i.TEXTURE_2D,Ot,gt,It[0].width,It[0].height);for(let et=0,N=It.length;et<N;et++)ut=It[et],Wt?e.texSubImage2D(i.TEXTURE_2D,et,0,0,zt,At,ut):e.texImage2D(i.TEXTURE_2D,et,gt,zt,At,ut);E.generateMipmaps=!1}else Wt?(ae&&e.texStorage2D(i.TEXTURE_2D,Ot,gt,$.width,$.height),e.texSubImage2D(i.TEXTURE_2D,0,0,0,zt,At,$)):e.texImage2D(i.TEXTURE_2D,0,gt,zt,At,$);y(E,Xt)&&g(j),ft.__version=tt.version,E.onUpdate&&E.onUpdate(E)}C.__version=E.version}function mt(C,E,V){if(E.image.length!==6)return;let j=Z(C,E),K=E.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+V);let tt=n.get(K);if(K.version!==tt.__version||j===!0){e.activeTexture(i.TEXTURE0+V);let ft=qt.getPrimaries(qt.workingColorSpace),ot=E.colorSpace===Ke?null:qt.getPrimaries(E.colorSpace),lt=E.colorSpace===Ke||ft===ot?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,lt);let vt=E.isCompressedTexture||E.image[0].isCompressedTexture,Nt=E.image[0]&&E.image[0].isDataTexture,$=[];for(let et=0;et<6;et++)!vt&&!Nt?$[et]=x(E.image[et],!1,!0,s.maxCubemapSize):$[et]=Nt?E.image[et].image:E.image[et],$[et]=Ut(E,$[et]);let Xt=$[0],zt=m(Xt)||o,At=r.convert(E.format,E.colorSpace),gt=r.convert(E.type),ut=M(E.internalFormat,At,gt,E.colorSpace),It=o&&E.isVideoTexture!==!0,Wt=tt.__version===void 0||j===!0,ae=A(E,Xt,zt);X(i.TEXTURE_CUBE_MAP,E,zt);let Ot;if(vt){It&&Wt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ae,ut,Xt.width,Xt.height);for(let et=0;et<6;et++){Ot=$[et].mipmaps;for(let N=0;N<Ot.length;N++){let st=Ot[N];E.format!==an?At!==null?It?e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N,0,0,st.width,st.height,At,st.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N,ut,st.width,st.height,0,st.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):It?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N,0,0,st.width,st.height,At,gt,st.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N,ut,st.width,st.height,0,At,gt,st.data)}}}else{Ot=E.mipmaps,It&&Wt&&(Ot.length>0&&ae++,e.texStorage2D(i.TEXTURE_CUBE_MAP,ae,ut,$[0].width,$[0].height));for(let et=0;et<6;et++)if(Nt){It?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,$[et].width,$[et].height,At,gt,$[et].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,ut,$[et].width,$[et].height,0,At,gt,$[et].data);for(let N=0;N<Ot.length;N++){let rt=Ot[N].image[et].image;It?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N+1,0,0,rt.width,rt.height,At,gt,rt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N+1,ut,rt.width,rt.height,0,At,gt,rt.data)}}else{It?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,At,gt,$[et]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,ut,At,gt,$[et]);for(let N=0;N<Ot.length;N++){let st=Ot[N];It?e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N+1,0,0,At,gt,st.image[et]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+et,N+1,ut,At,gt,st.image[et])}}}y(E,zt)&&g(i.TEXTURE_CUBE_MAP),tt.__version=K.version,E.onUpdate&&E.onUpdate(E)}C.__version=E.version}function pt(C,E,V,j,K,tt){let ft=r.convert(V.format,V.colorSpace),ot=r.convert(V.type),lt=M(V.internalFormat,ft,ot,V.colorSpace);if(!n.get(E).__hasExternalTextures){let Nt=Math.max(1,E.width>>tt),$=Math.max(1,E.height>>tt);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?e.texImage3D(K,tt,lt,Nt,$,E.depth,0,ft,ot,null):e.texImage2D(K,tt,lt,Nt,$,0,ft,ot,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),ht(E)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,K,n.get(V).__webglTexture,0,Tt(E)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,K,n.get(V).__webglTexture,tt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function wt(C,E,V){if(i.bindRenderbuffer(i.RENDERBUFFER,C),E.depthBuffer&&!E.stencilBuffer){let j=o===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(V||ht(E)){let K=E.depthTexture;K&&K.isDepthTexture&&(K.type===Gn?j=i.DEPTH_COMPONENT32F:K.type===Hn&&(j=i.DEPTH_COMPONENT24));let tt=Tt(E);ht(E)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,tt,j,E.width,E.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,tt,j,E.width,E.height)}else i.renderbufferStorage(i.RENDERBUFFER,j,E.width,E.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,C)}else if(E.depthBuffer&&E.stencilBuffer){let j=Tt(E);V&&ht(E)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,j,i.DEPTH24_STENCIL8,E.width,E.height):ht(E)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,j,i.DEPTH24_STENCIL8,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,C)}else{let j=E.isWebGLMultipleRenderTargets===!0?E.texture:[E.texture];for(let K=0;K<j.length;K++){let tt=j[K],ft=r.convert(tt.format,tt.colorSpace),ot=r.convert(tt.type),lt=M(tt.internalFormat,ft,ot,tt.colorSpace),vt=Tt(E);V&&ht(E)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,vt,lt,E.width,E.height):ht(E)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,vt,lt,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,lt,E.width,E.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Pt(C,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(E.depthTexture).__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),B(E.depthTexture,0);let j=n.get(E.depthTexture).__webglTexture,K=Tt(E);if(E.depthTexture.format===fi)ht(E)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(E.depthTexture.format===Zi)ht(E)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Mt(C){let E=n.get(C),V=C.isWebGLCubeRenderTarget===!0;if(C.depthTexture&&!E.__autoAllocateDepthBuffer){if(V)throw new Error("target.depthTexture not supported in Cube render targets");Pt(E.__webglFramebuffer,C)}else if(V){E.__webglDepthbuffer=[];for(let j=0;j<6;j++)e.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer[j]),E.__webglDepthbuffer[j]=i.createRenderbuffer(),wt(E.__webglDepthbuffer[j],C,!1)}else e.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer=i.createRenderbuffer(),wt(E.__webglDepthbuffer,C,!1);e.bindFramebuffer(i.FRAMEBUFFER,null)}function Vt(C,E,V){let j=n.get(C);E!==void 0&&pt(j.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),V!==void 0&&Mt(C)}function z(C){let E=C.texture,V=n.get(C),j=n.get(E);C.addEventListener("dispose",I),C.isWebGLMultipleRenderTargets!==!0&&(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=E.version,a.memory.textures++);let K=C.isWebGLCubeRenderTarget===!0,tt=C.isWebGLMultipleRenderTargets===!0,ft=m(C)||o;if(K){V.__webglFramebuffer=[];for(let ot=0;ot<6;ot++)if(o&&E.mipmaps&&E.mipmaps.length>0){V.__webglFramebuffer[ot]=[];for(let lt=0;lt<E.mipmaps.length;lt++)V.__webglFramebuffer[ot][lt]=i.createFramebuffer()}else V.__webglFramebuffer[ot]=i.createFramebuffer()}else{if(o&&E.mipmaps&&E.mipmaps.length>0){V.__webglFramebuffer=[];for(let ot=0;ot<E.mipmaps.length;ot++)V.__webglFramebuffer[ot]=i.createFramebuffer()}else V.__webglFramebuffer=i.createFramebuffer();if(tt)if(s.drawBuffers){let ot=C.texture;for(let lt=0,vt=ot.length;lt<vt;lt++){let Nt=n.get(ot[lt]);Nt.__webglTexture===void 0&&(Nt.__webglTexture=i.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&C.samples>0&&ht(C)===!1){let ot=tt?E:[E];V.__webglMultisampledFramebuffer=i.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let lt=0;lt<ot.length;lt++){let vt=ot[lt];V.__webglColorRenderbuffer[lt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,V.__webglColorRenderbuffer[lt]);let Nt=r.convert(vt.format,vt.colorSpace),$=r.convert(vt.type),Xt=M(vt.internalFormat,Nt,$,vt.colorSpace,C.isXRRenderTarget===!0),zt=Tt(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,zt,Xt,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,V.__webglColorRenderbuffer[lt])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(V.__webglDepthRenderbuffer=i.createRenderbuffer(),wt(V.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(K){e.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),X(i.TEXTURE_CUBE_MAP,E,ft);for(let ot=0;ot<6;ot++)if(o&&E.mipmaps&&E.mipmaps.length>0)for(let lt=0;lt<E.mipmaps.length;lt++)pt(V.__webglFramebuffer[ot][lt],C,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ot,lt);else pt(V.__webglFramebuffer[ot],C,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0);y(E,ft)&&g(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(tt){let ot=C.texture;for(let lt=0,vt=ot.length;lt<vt;lt++){let Nt=ot[lt],$=n.get(Nt);e.bindTexture(i.TEXTURE_2D,$.__webglTexture),X(i.TEXTURE_2D,Nt,ft),pt(V.__webglFramebuffer,C,Nt,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,0),y(Nt,ft)&&g(i.TEXTURE_2D)}e.unbindTexture()}else{let ot=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(o?ot=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(ot,j.__webglTexture),X(ot,E,ft),o&&E.mipmaps&&E.mipmaps.length>0)for(let lt=0;lt<E.mipmaps.length;lt++)pt(V.__webglFramebuffer[lt],C,E,i.COLOR_ATTACHMENT0,ot,lt);else pt(V.__webglFramebuffer,C,E,i.COLOR_ATTACHMENT0,ot,0);y(E,ft)&&g(ot),e.unbindTexture()}C.depthBuffer&&Mt(C)}function Pe(C){let E=m(C)||o,V=C.isWebGLMultipleRenderTargets===!0?C.texture:[C.texture];for(let j=0,K=V.length;j<K;j++){let tt=V[j];if(y(tt,E)){let ft=C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,ot=n.get(tt).__webglTexture;e.bindTexture(ft,ot),g(ft),e.unbindTexture()}}}function _t(C){if(o&&C.samples>0&&ht(C)===!1){let E=C.isWebGLMultipleRenderTargets?C.texture:[C.texture],V=C.width,j=C.height,K=i.COLOR_BUFFER_BIT,tt=[],ft=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ot=n.get(C),lt=C.isWebGLMultipleRenderTargets===!0;if(lt)for(let vt=0;vt<E.length;vt++)e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,ot.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ot.__webglFramebuffer);for(let vt=0;vt<E.length;vt++){tt.push(i.COLOR_ATTACHMENT0+vt),C.depthBuffer&&tt.push(ft);let Nt=ot.__ignoreDepthValues!==void 0?ot.__ignoreDepthValues:!1;if(Nt===!1&&(C.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),lt&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ot.__webglColorRenderbuffer[vt]),Nt===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[ft]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[ft])),lt){let $=n.get(E[vt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,$,0)}i.blitFramebuffer(0,0,V,j,0,0,V,j,K,i.NEAREST),l&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,tt)}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),lt)for(let vt=0;vt<E.length;vt++){e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.RENDERBUFFER,ot.__webglColorRenderbuffer[vt]);let Nt=n.get(E[vt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+vt,i.TEXTURE_2D,Nt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ot.__webglMultisampledFramebuffer)}}function Tt(C){return Math.min(s.maxSamples,C.samples)}function ht(C){let E=n.get(C);return o&&C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function se(C){let E=a.render.frame;u.get(C)!==E&&(u.set(C,E),C.update())}function Ut(C,E){let V=C.colorSpace,j=C.format,K=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||C.format===ha||V!==Pn&&V!==Ke&&(qt.getTransfer(V)===te?o===!1?t.has("EXT_sRGB")===!0&&j===an?(C.format=ha,C.minFilter=$e,C.generateMipmaps=!1):E=Sr.sRGBToLinear(E):(j!==an||K!==qn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",V)),E}this.allocateTextureUnit=L,this.resetTextureUnits=F,this.setTexture2D=B,this.setTexture2DArray=Y,this.setTexture3D=G,this.setTextureCube=q,this.rebindTextures=Vt,this.setupRenderTarget=z,this.updateRenderTargetMipmap=Pe,this.updateMultisampleRenderTarget=_t,this.setupDepthRenderbuffer=Mt,this.setupFrameBufferTexture=pt,this.useMultisampledRTT=ht}function i0(i,t,e){let n=e.isWebGL2;function s(r,a=Ke){let o,c=qt.getTransfer(a);if(r===qn)return i.UNSIGNED_BYTE;if(r===Au)return i.UNSIGNED_SHORT_4_4_4_4;if(r===Tu)return i.UNSIGNED_SHORT_5_5_5_1;if(r===Jf)return i.BYTE;if(r===$f)return i.SHORT;if(r===Wa)return i.UNSIGNED_SHORT;if(r===bu)return i.INT;if(r===Hn)return i.UNSIGNED_INT;if(r===Gn)return i.FLOAT;if(r===As)return n?i.HALF_FLOAT:(o=t.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(r===Kf)return i.ALPHA;if(r===an)return i.RGBA;if(r===jf)return i.LUMINANCE;if(r===Qf)return i.LUMINANCE_ALPHA;if(r===fi)return i.DEPTH_COMPONENT;if(r===Zi)return i.DEPTH_STENCIL;if(r===ha)return o=t.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(r===td)return i.RED;if(r===Eu)return i.RED_INTEGER;if(r===ed)return i.RG;if(r===wu)return i.RG_INTEGER;if(r===Ru)return i.RGBA_INTEGER;if(r===Co||r===Po||r===Io||r===Lo)if(c===te)if(o=t.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(r===Co)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Po)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Io)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Lo)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=t.get("WEBGL_compressed_texture_s3tc"),o!==null){if(r===Co)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Po)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Io)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Lo)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===sl||r===rl||r===ol||r===al)if(o=t.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(r===sl)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===rl)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ol)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===al)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Cu)return o=t.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===cl||r===ll)if(o=t.get("WEBGL_compressed_texture_etc"),o!==null){if(r===cl)return c===te?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(r===ll)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===ul||r===hl||r===fl||r===dl||r===pl||r===ml||r===gl||r===_l||r===xl||r===yl||r===vl||r===Ml||r===Sl||r===bl)if(o=t.get("WEBGL_compressed_texture_astc"),o!==null){if(r===ul)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===hl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===fl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===dl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===pl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===ml)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===gl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===_l)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===xl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===yl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===vl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Ml)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Sl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===bl)return c===te?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Do||r===Al||r===Tl)if(o=t.get("EXT_texture_compression_bptc"),o!==null){if(r===Do)return c===te?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Al)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Tl)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===nd||r===El||r===wl||r===Rl)if(o=t.get("EXT_texture_compression_rgtc"),o!==null){if(r===Do)return o.COMPRESSED_RED_RGTC1_EXT;if(r===El)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===wl)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Rl)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===hi?n?i.UNSIGNED_INT_24_8:(o=t.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}var Ra=class extends Ye{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Hi=class extends _n{constructor(){super(),this.isGroup=!0,this.type="Group"}},s0={type:"move"},Ss=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Hi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Hi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Hi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){a=!0;for(let x of t.hand.values()){let m=e.getJointPose(x,n),f=this._getHandJoint(l,x);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let u=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],h=u.position.distanceTo(d.position),p=.02,_=.005;l.inputState.pinching&&h>p+_?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&h<=p-_&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(s0)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Hi;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Ca=class extends Yn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,u=null,d=null,h=null,p=null,_=null,x=e.getContextAttributes(),m=null,f=null,y=[],g=[],M=new Ct,A=null,T=new Ye;T.layers.enable(1),T.viewport=new Qt;let S=new Ye;S.layers.enable(2),S.viewport=new Qt;let I=[T,S],v=new Ra;v.layers.enable(1),v.layers.enable(2);let b=null,R=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let Z=y[X];return Z===void 0&&(Z=new Ss,y[X]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(X){let Z=y[X];return Z===void 0&&(Z=new Ss,y[X]=Z),Z.getGripSpace()},this.getHand=function(X){let Z=y[X];return Z===void 0&&(Z=new Ss,y[X]=Z),Z.getHandSpace()};function P(X){let Z=g.indexOf(X.inputSource);if(Z===-1)return;let it=y[Z];it!==void 0&&(it.update(X.inputSource,X.frame,l||a),it.dispatchEvent({type:X.type,data:X.inputSource}))}function F(){s.removeEventListener("select",P),s.removeEventListener("selectstart",P),s.removeEventListener("selectend",P),s.removeEventListener("squeeze",P),s.removeEventListener("squeezestart",P),s.removeEventListener("squeezeend",P),s.removeEventListener("end",F),s.removeEventListener("inputsourceschange",L);for(let X=0;X<y.length;X++){let Z=g[X];Z!==null&&(g[X]=null,y[X].disconnect(Z))}b=null,R=null,t.setRenderTarget(m),p=null,h=null,d=null,s=null,f=null,at.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(M.width,M.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(X){l=X},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return d},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",P),s.addEventListener("selectstart",P),s.addEventListener("selectend",P),s.addEventListener("squeeze",P),s.addEventListener("squeezestart",P),s.addEventListener("squeezeend",P),s.addEventListener("end",F),s.addEventListener("inputsourceschange",L),x.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(M),s.renderState.layers===void 0||t.capabilities.isWebGL2===!1){let Z={antialias:s.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,Z),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),f=new In(p.framebufferWidth,p.framebufferHeight,{format:an,type:qn,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil})}else{let Z=null,it=null,mt=null;x.depth&&(mt=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Z=x.stencil?Zi:fi,it=x.stencil?hi:Hn);let pt={colorFormat:e.RGBA8,depthFormat:mt,scaleFactor:r};d=new XRWebGLBinding(s,e),h=d.createProjectionLayer(pt),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),f=new In(h.textureWidth,h.textureHeight,{format:an,type:qn,depthTexture:new Dr(h.textureWidth,h.textureHeight,it,void 0,void 0,void 0,void 0,void 0,void 0,Z),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0});let wt=t.properties.get(f);wt.__ignoreDepthValues=h.ignoreDepthValues}f.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),at.setContext(s),at.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function L(X){for(let Z=0;Z<X.removed.length;Z++){let it=X.removed[Z],mt=g.indexOf(it);mt>=0&&(g[mt]=null,y[mt].disconnect(it))}for(let Z=0;Z<X.added.length;Z++){let it=X.added[Z],mt=g.indexOf(it);if(mt===-1){for(let wt=0;wt<y.length;wt++)if(wt>=g.length){g.push(it),mt=wt;break}else if(g[wt]===null){g[wt]=it,mt=wt;break}if(mt===-1)break}let pt=y[mt];pt&&pt.connect(it)}}let U=new D,B=new D;function Y(X,Z,it){U.setFromMatrixPosition(Z.matrixWorld),B.setFromMatrixPosition(it.matrixWorld);let mt=U.distanceTo(B),pt=Z.projectionMatrix.elements,wt=it.projectionMatrix.elements,Pt=pt[14]/(pt[10]-1),Mt=pt[14]/(pt[10]+1),Vt=(pt[9]+1)/pt[5],z=(pt[9]-1)/pt[5],Pe=(pt[8]-1)/pt[0],_t=(wt[8]+1)/wt[0],Tt=Pt*Pe,ht=Pt*_t,se=mt/(-Pe+_t),Ut=se*-Pe;Z.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Ut),X.translateZ(se),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert();let C=Pt+se,E=Mt+se,V=Tt-Ut,j=ht+(mt-Ut),K=Vt*Mt/E*C,tt=z*Mt/E*C;X.projectionMatrix.makePerspective(V,j,K,tt,C,E),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}function G(X,Z){Z===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(Z.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;v.near=S.near=T.near=X.near,v.far=S.far=T.far=X.far,(b!==v.near||R!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),b=v.near,R=v.far);let Z=X.parent,it=v.cameras;G(v,Z);for(let mt=0;mt<it.length;mt++)G(it[mt],Z);it.length===2?Y(v,T,S):v.projectionMatrix.copy(T.projectionMatrix),q(X,v,Z)};function q(X,Z,it){it===null?X.matrix.copy(Z.matrixWorld):(X.matrix.copy(it.matrixWorld),X.matrix.invert(),X.matrix.multiply(Z.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(Z.projectionMatrix),X.projectionMatrixInverse.copy(Z.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=fa*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(h===null&&p===null))return c},this.setFoveation=function(X){c=X,h!==null&&(h.fixedFoveation=X),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=X)};let J=null;function Q(X,Z){if(u=Z.getViewerPose(l||a),_=Z,u!==null){let it=u.views;p!==null&&(t.setRenderTargetFramebuffer(f,p.framebuffer),t.setRenderTarget(f));let mt=!1;it.length!==v.cameras.length&&(v.cameras.length=0,mt=!0);for(let pt=0;pt<it.length;pt++){let wt=it[pt],Pt=null;if(p!==null)Pt=p.getViewport(wt);else{let Vt=d.getViewSubImage(h,wt);Pt=Vt.viewport,pt===0&&(t.setRenderTargetTextures(f,Vt.colorTexture,h.ignoreDepthValues?void 0:Vt.depthStencilTexture),t.setRenderTarget(f))}let Mt=I[pt];Mt===void 0&&(Mt=new Ye,Mt.layers.enable(pt),Mt.viewport=new Qt,I[pt]=Mt),Mt.matrix.fromArray(wt.transform.matrix),Mt.matrix.decompose(Mt.position,Mt.quaternion,Mt.scale),Mt.projectionMatrix.fromArray(wt.projectionMatrix),Mt.projectionMatrixInverse.copy(Mt.projectionMatrix).invert(),Mt.viewport.set(Pt.x,Pt.y,Pt.width,Pt.height),pt===0&&(v.matrix.copy(Mt.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),mt===!0&&v.cameras.push(Mt)}}for(let it=0;it<y.length;it++){let mt=g[it],pt=y[it];mt!==null&&pt!==void 0&&pt.update(mt,Z,l||a)}J&&J(X,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),_=null}let at=new Nu;at.setAnimationLoop(Q),this.setAnimationLoop=function(X){J=X},this.dispose=function(){}}};function r0(i,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,Uu(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,y,g,M){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),d(m,f)):f.isMeshPhongMaterial?(r(m,f),u(m,f)):f.isMeshStandardMaterial?(r(m,f),h(m,f),f.isMeshPhysicalMaterial&&p(m,f,M)):f.isMeshMatcapMaterial?(r(m,f),_(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),x(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?c(m,f,y,g):f.isSpriteMaterial?l(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Ce&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Ce&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let y=t.get(f).envMap;if(y&&(m.envMap.value=y,m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap){m.lightMap.value=f.lightMap;let g=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=f.lightMapIntensity*g,e(f.lightMap,m.lightMapTransform)}f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function c(m,f,y,g){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*y,m.scale.value=g*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function l(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),t.get(f).envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,y){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ce&&m.clearcoatNormalScale.value.negate())),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,f){f.matcap&&(m.matcap.value=f.matcap)}function x(m,f){let y=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function o0(i,t,e,n){let s={},r={},a=[],o=e.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function c(y,g){let M=g.program;n.uniformBlockBinding(y,M)}function l(y,g){let M=s[y.id];M===void 0&&(_(y),M=u(y),s[y.id]=M,y.addEventListener("dispose",m));let A=g.program;n.updateUBOMapping(y,A);let T=t.render.frame;r[y.id]!==T&&(h(y),r[y.id]=T)}function u(y){let g=d();y.__bindingPointIndex=g;let M=i.createBuffer(),A=y.__size,T=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,A,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,g,M),M}function d(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(y){let g=s[y.id],M=y.uniforms,A=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,g);for(let T=0,S=M.length;T<S;T++){let I=Array.isArray(M[T])?M[T]:[M[T]];for(let v=0,b=I.length;v<b;v++){let R=I[v];if(p(R,T,v,A)===!0){let P=R.__offset,F=Array.isArray(R.value)?R.value:[R.value],L=0;for(let U=0;U<F.length;U++){let B=F[U],Y=x(B);typeof B=="number"||typeof B=="boolean"?(R.__data[0]=B,i.bufferSubData(i.UNIFORM_BUFFER,P+L,R.__data)):B.isMatrix3?(R.__data[0]=B.elements[0],R.__data[1]=B.elements[1],R.__data[2]=B.elements[2],R.__data[3]=0,R.__data[4]=B.elements[3],R.__data[5]=B.elements[4],R.__data[6]=B.elements[5],R.__data[7]=0,R.__data[8]=B.elements[6],R.__data[9]=B.elements[7],R.__data[10]=B.elements[8],R.__data[11]=0):(B.toArray(R.__data,L),L+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,P,R.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(y,g,M,A){let T=y.value,S=g+"_"+M;if(A[S]===void 0)return typeof T=="number"||typeof T=="boolean"?A[S]=T:A[S]=T.clone(),!0;{let I=A[S];if(typeof T=="number"||typeof T=="boolean"){if(I!==T)return A[S]=T,!0}else if(I.equals(T)===!1)return I.copy(T),!0}return!1}function _(y){let g=y.uniforms,M=0,A=16;for(let S=0,I=g.length;S<I;S++){let v=Array.isArray(g[S])?g[S]:[g[S]];for(let b=0,R=v.length;b<R;b++){let P=v[b],F=Array.isArray(P.value)?P.value:[P.value];for(let L=0,U=F.length;L<U;L++){let B=F[L],Y=x(B),G=M%A;G!==0&&A-G<Y.boundary&&(M+=A-G),P.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=M,M+=Y.storage}}}let T=M%A;return T>0&&(M+=A-T),y.__size=M,y.__cache={},this}function x(y){let g={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(g.boundary=4,g.storage=4):y.isVector2?(g.boundary=8,g.storage=8):y.isVector3||y.isColor?(g.boundary=16,g.storage=12):y.isVector4?(g.boundary=16,g.storage=16):y.isMatrix3?(g.boundary=48,g.storage=48):y.isMatrix4?(g.boundary=64,g.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),g}function m(y){let g=y.target;g.removeEventListener("dispose",m);let M=a.indexOf(g.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[g.id]),delete s[g.id],delete r[g.id]}function f(){for(let y in s)i.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:c,update:l,dispose:f}}var Pa=class{constructor(t={}){let{canvas:e=md(),context:n=null,depth:s=!0,stencil:r=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1}=t;this.isWebGLRenderer=!0;let h;n!==null?h=n.getContextAttributes().alpha:h=a;let p=new Uint32Array(4),_=new Int32Array(4),x=null,m=null,f=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Te,this._useLegacyLights=!1,this.toneMapping=Xn,this.toneMappingExposure=1;let g=this,M=!1,A=0,T=0,S=null,I=-1,v=null,b=new Qt,R=new Qt,P=null,F=new Gt(0),L=0,U=e.width,B=e.height,Y=1,G=null,q=null,J=new Qt(0,0,U,B),Q=new Qt(0,0,U,B),at=!1,X=new Ir,Z=!1,it=!1,mt=null,pt=new kt,wt=new Ct,Pt=new D,Mt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Vt(){return S===null?Y:1}let z=n;function Pe(w,O){for(let H=0;H<w.length;H++){let W=w[H],k=e.getContext(W,O);if(k!==null)return k}return null}try{let w={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ga}`),e.addEventListener("webglcontextlost",et,!1),e.addEventListener("webglcontextrestored",N,!1),e.addEventListener("webglcontextcreationerror",st,!1),z===null){let O=["webgl2","webgl","experimental-webgl"];if(g.isWebGL1Renderer===!0&&O.shift(),z=Pe(O,w),z===null)throw Pe(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&z instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),z.getShaderPrecisionFormat===void 0&&(z.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let _t,Tt,ht,se,Ut,C,E,V,j,K,tt,ft,ot,lt,vt,Nt,$,Xt,zt,At,gt,ut,It,Wt;function ae(){_t=new Tg(z),Tt=new yg(z,_t,t),_t.init(Tt),ut=new i0(z,_t,Tt),ht=new e0(z,_t,Tt),se=new Rg(z),Ut=new G_,C=new n0(z,_t,ht,Ut,Tt,ut,se),E=new Mg(g),V=new Ag(g),j=new Fd(z,Tt),It=new _g(z,_t,j,Tt),K=new Eg(z,j,se,It),tt=new Lg(z,K,j,se),zt=new Ig(z,Tt,C),Nt=new vg(Ut),ft=new H_(g,E,V,_t,Tt,It,Nt),ot=new r0(g,Ut),lt=new X_,vt=new K_(_t,Tt),Xt=new gg(g,E,V,ht,tt,h,c),$=new t0(g,tt,Tt),Wt=new o0(z,se,Tt,ht),At=new xg(z,_t,se,Tt),gt=new wg(z,_t,se,Tt),se.programs=ft.programs,g.capabilities=Tt,g.extensions=_t,g.properties=Ut,g.renderLists=lt,g.shadowMap=$,g.state=ht,g.info=se}ae();let Ot=new Ca(g,z);this.xr=Ot,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let w=_t.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=_t.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(w){w!==void 0&&(Y=w,this.setSize(U,B,!1))},this.getSize=function(w){return w.set(U,B)},this.setSize=function(w,O,H=!0){if(Ot.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=w,B=O,e.width=Math.floor(w*Y),e.height=Math.floor(O*Y),H===!0&&(e.style.width=w+"px",e.style.height=O+"px"),this.setViewport(0,0,w,O)},this.getDrawingBufferSize=function(w){return w.set(U*Y,B*Y).floor()},this.setDrawingBufferSize=function(w,O,H){U=w,B=O,Y=H,e.width=Math.floor(w*H),e.height=Math.floor(O*H),this.setViewport(0,0,w,O)},this.getCurrentViewport=function(w){return w.copy(b)},this.getViewport=function(w){return w.copy(J)},this.setViewport=function(w,O,H,W){w.isVector4?J.set(w.x,w.y,w.z,w.w):J.set(w,O,H,W),ht.viewport(b.copy(J).multiplyScalar(Y).floor())},this.getScissor=function(w){return w.copy(Q)},this.setScissor=function(w,O,H,W){w.isVector4?Q.set(w.x,w.y,w.z,w.w):Q.set(w,O,H,W),ht.scissor(R.copy(Q).multiplyScalar(Y).floor())},this.getScissorTest=function(){return at},this.setScissorTest=function(w){ht.setScissorTest(at=w)},this.setOpaqueSort=function(w){G=w},this.setTransparentSort=function(w){q=w},this.getClearColor=function(w){return w.copy(Xt.getClearColor())},this.setClearColor=function(){Xt.setClearColor.apply(Xt,arguments)},this.getClearAlpha=function(){return Xt.getClearAlpha()},this.setClearAlpha=function(){Xt.setClearAlpha.apply(Xt,arguments)},this.clear=function(w=!0,O=!0,H=!0){let W=0;if(w){let k=!1;if(S!==null){let ct=S.texture.format;k=ct===Ru||ct===wu||ct===Eu}if(k){let ct=S.texture.type,dt=ct===qn||ct===Hn||ct===Wa||ct===hi||ct===Au||ct===Tu,yt=Xt.getClearColor(),bt=Xt.getClearAlpha(),Ft=yt.r,Et=yt.g,Rt=yt.b;dt?(p[0]=Ft,p[1]=Et,p[2]=Rt,p[3]=bt,z.clearBufferuiv(z.COLOR,0,p)):(_[0]=Ft,_[1]=Et,_[2]=Rt,_[3]=bt,z.clearBufferiv(z.COLOR,0,_))}else W|=z.COLOR_BUFFER_BIT}O&&(W|=z.DEPTH_BUFFER_BIT),H&&(W|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",et,!1),e.removeEventListener("webglcontextrestored",N,!1),e.removeEventListener("webglcontextcreationerror",st,!1),lt.dispose(),vt.dispose(),Ut.dispose(),E.dispose(),V.dispose(),tt.dispose(),It.dispose(),Wt.dispose(),ft.dispose(),Ot.dispose(),Ot.removeEventListener("sessionstart",Ie),Ot.removeEventListener("sessionend",jt),mt&&(mt.dispose(),mt=null),Le.stop()};function et(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function N(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let w=se.autoReset,O=$.enabled,H=$.autoUpdate,W=$.needsUpdate,k=$.type;ae(),se.autoReset=w,$.enabled=O,$.autoUpdate=H,$.needsUpdate=W,$.type=k}function st(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function rt(w){let O=w.target;O.removeEventListener("dispose",rt),St(O)}function St(w){xt(w),Ut.remove(w)}function xt(w){let O=Ut.get(w).programs;O!==void 0&&(O.forEach(function(H){ft.releaseProgram(H)}),w.isShaderMaterial&&ft.releaseShaderCache(w))}this.renderBufferDirect=function(w,O,H,W,k,ct){O===null&&(O=Mt);let dt=k.isMesh&&k.matrixWorld.determinant()<0,yt=uf(w,O,H,W,k);ht.setMaterial(W,dt);let bt=H.index,Ft=1;if(W.wireframe===!0){if(bt=K.getWireframeAttribute(H),bt===void 0)return;Ft=2}let Et=H.drawRange,Rt=H.attributes.position,he=Et.start*Ft,We=(Et.start+Et.count)*Ft;ct!==null&&(he=Math.max(he,ct.start*Ft),We=Math.min(We,(ct.start+ct.count)*Ft)),bt!==null?(he=Math.max(he,0),We=Math.min(We,bt.count)):Rt!=null&&(he=Math.max(he,0),We=Math.min(We,Rt.count));let Me=We-he;if(Me<0||Me===1/0)return;It.setup(k,W,yt,H,bt);let Sn,re=At;if(bt!==null&&(Sn=j.get(bt),re=gt,re.setIndex(Sn)),k.isMesh)W.wireframe===!0?(ht.setLineWidth(W.wireframeLinewidth*Vt()),re.setMode(z.LINES)):re.setMode(z.TRIANGLES);else if(k.isLine){let Bt=W.linewidth;Bt===void 0&&(Bt=1),ht.setLineWidth(Bt*Vt()),k.isLineSegments?re.setMode(z.LINES):k.isLineLoop?re.setMode(z.LINE_LOOP):re.setMode(z.LINE_STRIP)}else k.isPoints?re.setMode(z.POINTS):k.isSprite&&re.setMode(z.TRIANGLES);if(k.isBatchedMesh)re.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else if(k.isInstancedMesh)re.renderInstances(he,Me,k.count);else if(H.isInstancedBufferGeometry){let Bt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Ao=Math.min(H.instanceCount,Bt);re.renderInstances(he,Me,Ao)}else re.render(he,Me)};function $t(w,O,H){w.transparent===!0&&w.side===ke&&w.forceSinglePass===!1?(w.side=Ce,w.needsUpdate=!0,Gs(w,O,H),w.side=cn,w.needsUpdate=!0,Gs(w,O,H),w.side=ke):Gs(w,O,H)}this.compile=function(w,O,H=null){H===null&&(H=w),m=vt.get(H),m.init(),y.push(m),H.traverseVisible(function(k){k.isLight&&k.layers.test(O.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),w!==H&&w.traverseVisible(function(k){k.isLight&&k.layers.test(O.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),m.setupLights(g._useLegacyLights);let W=new Set;return w.traverse(function(k){let ct=k.material;if(ct)if(Array.isArray(ct))for(let dt=0;dt<ct.length;dt++){let yt=ct[dt];$t(yt,H,k),W.add(yt)}else $t(ct,H,k),W.add(ct)}),y.pop(),m=null,W},this.compileAsync=function(w,O,H=null){let W=this.compile(w,O,H);return new Promise(k=>{function ct(){if(W.forEach(function(dt){Ut.get(dt).currentProgram.isReady()&&W.delete(dt)}),W.size===0){k(w);return}setTimeout(ct,10)}_t.get("KHR_parallel_shader_compile")!==null?ct():setTimeout(ct,10)})};let Kt=null;function ve(w){Kt&&Kt(w)}function Ie(){Le.stop()}function jt(){Le.start()}let Le=new Nu;Le.setAnimationLoop(ve),typeof self<"u"&&Le.setContext(self),this.setAnimationLoop=function(w){Kt=w,Ot.setAnimationLoop(w),w===null?Le.stop():Le.start()},Ot.addEventListener("sessionstart",Ie),Ot.addEventListener("sessionend",jt),this.render=function(w,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),Ot.enabled===!0&&Ot.isPresenting===!0&&(Ot.cameraAutoUpdate===!0&&Ot.updateCamera(O),O=Ot.getCamera()),w.isScene===!0&&w.onBeforeRender(g,w,O,S),m=vt.get(w,y.length),m.init(),y.push(m),pt.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),X.setFromProjectionMatrix(pt),it=this.localClippingEnabled,Z=Nt.init(this.clippingPlanes,it),x=lt.get(w,f.length),x.init(),f.push(x),mn(w,O,0,g.sortObjects),x.finish(),g.sortObjects===!0&&x.sort(G,q),this.info.render.frame++,Z===!0&&Nt.beginShadows();let H=m.state.shadowsArray;if($.render(H,w,O),Z===!0&&Nt.endShadows(),this.info.autoReset===!0&&this.info.reset(),Xt.render(x,w),m.setupLights(g._useLegacyLights),O.isArrayCamera){let W=O.cameras;for(let k=0,ct=W.length;k<ct;k++){let dt=W[k];Xc(x,w,dt,dt.viewport)}}else Xc(x,w,O);S!==null&&(C.updateMultisampleRenderTarget(S),C.updateRenderTargetMipmap(S)),w.isScene===!0&&w.onAfterRender(g,w,O),It.resetDefaultState(),I=-1,v=null,y.pop(),y.length>0?m=y[y.length-1]:m=null,f.pop(),f.length>0?x=f[f.length-1]:x=null};function mn(w,O,H,W){if(w.visible===!1)return;if(w.layers.test(O.layers)){if(w.isGroup)H=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(O);else if(w.isLight)m.pushLight(w),w.castShadow&&m.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||X.intersectsSprite(w)){W&&Pt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(pt);let dt=tt.update(w),yt=w.material;yt.visible&&x.push(w,dt,yt,H,Pt.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||X.intersectsObject(w))){let dt=tt.update(w),yt=w.material;if(W&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Pt.copy(w.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Pt.copy(dt.boundingSphere.center)),Pt.applyMatrix4(w.matrixWorld).applyMatrix4(pt)),Array.isArray(yt)){let bt=dt.groups;for(let Ft=0,Et=bt.length;Ft<Et;Ft++){let Rt=bt[Ft],he=yt[Rt.materialIndex];he&&he.visible&&x.push(w,dt,he,H,Pt.z,Rt)}}else yt.visible&&x.push(w,dt,yt,H,Pt.z,null)}}let ct=w.children;for(let dt=0,yt=ct.length;dt<yt;dt++)mn(ct[dt],O,H,W)}function Xc(w,O,H,W){let k=w.opaque,ct=w.transmissive,dt=w.transparent;m.setupLightsView(H),Z===!0&&Nt.setGlobalState(g.clippingPlanes,H),ct.length>0&&lf(k,ct,O,H),W&&ht.viewport(b.copy(W)),k.length>0&&Hs(k,O,H),ct.length>0&&Hs(ct,O,H),dt.length>0&&Hs(dt,O,H),ht.buffers.depth.setTest(!0),ht.buffers.depth.setMask(!0),ht.buffers.color.setMask(!0),ht.setPolygonOffset(!1)}function lf(w,O,H,W){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;let ct=Tt.isWebGL2;mt===null&&(mt=new In(1,1,{generateMipmaps:!0,type:_t.has("EXT_color_buffer_half_float")?As:qn,minFilter:bs,samples:ct?4:0})),g.getDrawingBufferSize(wt),ct?mt.setSize(wt.x,wt.y):mt.setSize(da(wt.x),da(wt.y));let dt=g.getRenderTarget();g.setRenderTarget(mt),g.getClearColor(F),L=g.getClearAlpha(),L<1&&g.setClearColor(16777215,.5),g.clear();let yt=g.toneMapping;g.toneMapping=Xn,Hs(w,H,W),C.updateMultisampleRenderTarget(mt),C.updateRenderTargetMipmap(mt);let bt=!1;for(let Ft=0,Et=O.length;Ft<Et;Ft++){let Rt=O[Ft],he=Rt.object,We=Rt.geometry,Me=Rt.material,Sn=Rt.group;if(Me.side===ke&&he.layers.test(W.layers)){let re=Me.side;Me.side=Ce,Me.needsUpdate=!0,qc(he,H,W,We,Me,Sn),Me.side=re,Me.needsUpdate=!0,bt=!0}}bt===!0&&(C.updateMultisampleRenderTarget(mt),C.updateRenderTargetMipmap(mt)),g.setRenderTarget(dt),g.setClearColor(F,L),g.toneMapping=yt}function Hs(w,O,H){let W=O.isScene===!0?O.overrideMaterial:null;for(let k=0,ct=w.length;k<ct;k++){let dt=w[k],yt=dt.object,bt=dt.geometry,Ft=W===null?dt.material:W,Et=dt.group;yt.layers.test(H.layers)&&qc(yt,O,H,bt,Ft,Et)}}function qc(w,O,H,W,k,ct){w.onBeforeRender(g,O,H,W,k,ct),w.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),k.onBeforeRender(g,O,H,W,w,ct),k.transparent===!0&&k.side===ke&&k.forceSinglePass===!1?(k.side=Ce,k.needsUpdate=!0,g.renderBufferDirect(H,O,W,k,w,ct),k.side=cn,k.needsUpdate=!0,g.renderBufferDirect(H,O,W,k,w,ct),k.side=ke):g.renderBufferDirect(H,O,W,k,w,ct),w.onAfterRender(g,O,H,W,k,ct)}function Gs(w,O,H){O.isScene!==!0&&(O=Mt);let W=Ut.get(w),k=m.state.lights,ct=m.state.shadowsArray,dt=k.state.version,yt=ft.getParameters(w,k.state,ct,O,H),bt=ft.getProgramCacheKey(yt),Ft=W.programs;W.environment=w.isMeshStandardMaterial?O.environment:null,W.fog=O.fog,W.envMap=(w.isMeshStandardMaterial?V:E).get(w.envMap||W.environment),Ft===void 0&&(w.addEventListener("dispose",rt),Ft=new Map,W.programs=Ft);let Et=Ft.get(bt);if(Et!==void 0){if(W.currentProgram===Et&&W.lightsStateVersion===dt)return Zc(w,yt),Et}else yt.uniforms=ft.getUniforms(w),w.onBuild(H,yt,g),w.onBeforeCompile(yt,g),Et=ft.acquireProgram(yt,bt),Ft.set(bt,Et),W.uniforms=yt.uniforms;let Rt=W.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Rt.clippingPlanes=Nt.uniform),Zc(w,yt),W.needsLights=ff(w),W.lightsStateVersion=dt,W.needsLights&&(Rt.ambientLightColor.value=k.state.ambient,Rt.lightProbe.value=k.state.probe,Rt.directionalLights.value=k.state.directional,Rt.directionalLightShadows.value=k.state.directionalShadow,Rt.spotLights.value=k.state.spot,Rt.spotLightShadows.value=k.state.spotShadow,Rt.rectAreaLights.value=k.state.rectArea,Rt.ltc_1.value=k.state.rectAreaLTC1,Rt.ltc_2.value=k.state.rectAreaLTC2,Rt.pointLights.value=k.state.point,Rt.pointLightShadows.value=k.state.pointShadow,Rt.hemisphereLights.value=k.state.hemi,Rt.directionalShadowMap.value=k.state.directionalShadowMap,Rt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Rt.spotShadowMap.value=k.state.spotShadowMap,Rt.spotLightMatrix.value=k.state.spotLightMatrix,Rt.spotLightMap.value=k.state.spotLightMap,Rt.pointShadowMap.value=k.state.pointShadowMap,Rt.pointShadowMatrix.value=k.state.pointShadowMatrix),W.currentProgram=Et,W.uniformsList=null,Et}function Yc(w){if(w.uniformsList===null){let O=w.currentProgram.getUniforms();w.uniformsList=Xi.seqWithValue(O.seq,w.uniforms)}return w.uniformsList}function Zc(w,O){let H=Ut.get(w);H.outputColorSpace=O.outputColorSpace,H.batching=O.batching,H.instancing=O.instancing,H.instancingColor=O.instancingColor,H.skinning=O.skinning,H.morphTargets=O.morphTargets,H.morphNormals=O.morphNormals,H.morphColors=O.morphColors,H.morphTargetsCount=O.morphTargetsCount,H.numClippingPlanes=O.numClippingPlanes,H.numIntersection=O.numClipIntersection,H.vertexAlphas=O.vertexAlphas,H.vertexTangents=O.vertexTangents,H.toneMapping=O.toneMapping}function uf(w,O,H,W,k){O.isScene!==!0&&(O=Mt),C.resetTextureUnits();let ct=O.fog,dt=W.isMeshStandardMaterial?O.environment:null,yt=S===null?g.outputColorSpace:S.isXRRenderTarget===!0?S.texture.colorSpace:Pn,bt=(W.isMeshStandardMaterial?V:E).get(W.envMap||dt),Ft=W.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Et=!!H.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Rt=!!H.morphAttributes.position,he=!!H.morphAttributes.normal,We=!!H.morphAttributes.color,Me=Xn;W.toneMapped&&(S===null||S.isXRRenderTarget===!0)&&(Me=g.toneMapping);let Sn=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,re=Sn!==void 0?Sn.length:0,Bt=Ut.get(W),Ao=m.state.lights;if(Z===!0&&(it===!0||w!==v)){let Ze=w===v&&W.id===I;Nt.setState(W,w,Ze)}let ce=!1;W.version===Bt.__version?(Bt.needsLights&&Bt.lightsStateVersion!==Ao.state.version||Bt.outputColorSpace!==yt||k.isBatchedMesh&&Bt.batching===!1||!k.isBatchedMesh&&Bt.batching===!0||k.isInstancedMesh&&Bt.instancing===!1||!k.isInstancedMesh&&Bt.instancing===!0||k.isSkinnedMesh&&Bt.skinning===!1||!k.isSkinnedMesh&&Bt.skinning===!0||k.isInstancedMesh&&Bt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Bt.instancingColor===!1&&k.instanceColor!==null||Bt.envMap!==bt||W.fog===!0&&Bt.fog!==ct||Bt.numClippingPlanes!==void 0&&(Bt.numClippingPlanes!==Nt.numPlanes||Bt.numIntersection!==Nt.numIntersection)||Bt.vertexAlphas!==Ft||Bt.vertexTangents!==Et||Bt.morphTargets!==Rt||Bt.morphNormals!==he||Bt.morphColors!==We||Bt.toneMapping!==Me||Tt.isWebGL2===!0&&Bt.morphTargetsCount!==re)&&(ce=!0):(ce=!0,Bt.__version=W.version);let ni=Bt.currentProgram;ce===!0&&(ni=Gs(W,O,k));let Jc=!1,ms=!1,To=!1,Ee=ni.getUniforms(),ii=Bt.uniforms;if(ht.useProgram(ni.program)&&(Jc=!0,ms=!0,To=!0),W.id!==I&&(I=W.id,ms=!0),Jc||v!==w){Ee.setValue(z,"projectionMatrix",w.projectionMatrix),Ee.setValue(z,"viewMatrix",w.matrixWorldInverse);let Ze=Ee.map.cameraPosition;Ze!==void 0&&Ze.setValue(z,Pt.setFromMatrixPosition(w.matrixWorld)),Tt.logarithmicDepthBuffer&&Ee.setValue(z,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&Ee.setValue(z,"isOrthographic",w.isOrthographicCamera===!0),v!==w&&(v=w,ms=!0,To=!0)}if(k.isSkinnedMesh){Ee.setOptional(z,k,"bindMatrix"),Ee.setOptional(z,k,"bindMatrixInverse");let Ze=k.skeleton;Ze&&(Tt.floatVertexTextures?(Ze.boneTexture===null&&Ze.computeBoneTexture(),Ee.setValue(z,"boneTexture",Ze.boneTexture,C)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}k.isBatchedMesh&&(Ee.setOptional(z,k,"batchingTexture"),Ee.setValue(z,"batchingTexture",k._matricesTexture,C));let Eo=H.morphAttributes;if((Eo.position!==void 0||Eo.normal!==void 0||Eo.color!==void 0&&Tt.isWebGL2===!0)&&zt.update(k,H,ni),(ms||Bt.receiveShadow!==k.receiveShadow)&&(Bt.receiveShadow=k.receiveShadow,Ee.setValue(z,"receiveShadow",k.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(ii.envMap.value=bt,ii.flipEnvMap.value=bt.isCubeTexture&&bt.isRenderTargetTexture===!1?-1:1),ms&&(Ee.setValue(z,"toneMappingExposure",g.toneMappingExposure),Bt.needsLights&&hf(ii,To),ct&&W.fog===!0&&ot.refreshFogUniforms(ii,ct),ot.refreshMaterialUniforms(ii,W,Y,B,mt),Xi.upload(z,Yc(Bt),ii,C)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Xi.upload(z,Yc(Bt),ii,C),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&Ee.setValue(z,"center",k.center),Ee.setValue(z,"modelViewMatrix",k.modelViewMatrix),Ee.setValue(z,"normalMatrix",k.normalMatrix),Ee.setValue(z,"modelMatrix",k.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){let Ze=W.uniformsGroups;for(let wo=0,df=Ze.length;wo<df;wo++)if(Tt.isWebGL2){let $c=Ze[wo];Wt.update($c,ni),Wt.bind($c,ni)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return ni}function hf(w,O){w.ambientLightColor.needsUpdate=O,w.lightProbe.needsUpdate=O,w.directionalLights.needsUpdate=O,w.directionalLightShadows.needsUpdate=O,w.pointLights.needsUpdate=O,w.pointLightShadows.needsUpdate=O,w.spotLights.needsUpdate=O,w.spotLightShadows.needsUpdate=O,w.rectAreaLights.needsUpdate=O,w.hemisphereLights.needsUpdate=O}function ff(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return S},this.setRenderTargetTextures=function(w,O,H){Ut.get(w.texture).__webglTexture=O,Ut.get(w.depthTexture).__webglTexture=H;let W=Ut.get(w);W.__hasExternalTextures=!0,W.__hasExternalTextures&&(W.__autoAllocateDepthBuffer=H===void 0,W.__autoAllocateDepthBuffer||_t.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),W.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(w,O){let H=Ut.get(w);H.__webglFramebuffer=O,H.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(w,O=0,H=0){S=w,A=O,T=H;let W=!0,k=null,ct=!1,dt=!1;if(w){let bt=Ut.get(w);bt.__useDefaultFramebuffer!==void 0?(ht.bindFramebuffer(z.FRAMEBUFFER,null),W=!1):bt.__webglFramebuffer===void 0?C.setupRenderTarget(w):bt.__hasExternalTextures&&C.rebindTextures(w,Ut.get(w.texture).__webglTexture,Ut.get(w.depthTexture).__webglTexture);let Ft=w.texture;(Ft.isData3DTexture||Ft.isDataArrayTexture||Ft.isCompressedArrayTexture)&&(dt=!0);let Et=Ut.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Et[O])?k=Et[O][H]:k=Et[O],ct=!0):Tt.isWebGL2&&w.samples>0&&C.useMultisampledRTT(w)===!1?k=Ut.get(w).__webglMultisampledFramebuffer:Array.isArray(Et)?k=Et[H]:k=Et,b.copy(w.viewport),R.copy(w.scissor),P=w.scissorTest}else b.copy(J).multiplyScalar(Y).floor(),R.copy(Q).multiplyScalar(Y).floor(),P=at;if(ht.bindFramebuffer(z.FRAMEBUFFER,k)&&Tt.drawBuffers&&W&&ht.drawBuffers(w,k),ht.viewport(b),ht.scissor(R),ht.setScissorTest(P),ct){let bt=Ut.get(w.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+O,bt.__webglTexture,H)}else if(dt){let bt=Ut.get(w.texture),Ft=O||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,bt.__webglTexture,H||0,Ft)}I=-1},this.readRenderTargetPixels=function(w,O,H,W,k,ct,dt){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let yt=Ut.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&dt!==void 0&&(yt=yt[dt]),yt){ht.bindFramebuffer(z.FRAMEBUFFER,yt);try{let bt=w.texture,Ft=bt.format,Et=bt.type;if(Ft!==an&&ut.convert(Ft)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let Rt=Et===As&&(_t.has("EXT_color_buffer_half_float")||Tt.isWebGL2&&_t.has("EXT_color_buffer_float"));if(Et!==qn&&ut.convert(Et)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Et===Gn&&(Tt.isWebGL2||_t.has("OES_texture_float")||_t.has("WEBGL_color_buffer_float")))&&!Rt){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=w.width-W&&H>=0&&H<=w.height-k&&z.readPixels(O,H,W,k,ut.convert(Ft),ut.convert(Et),ct)}finally{let bt=S!==null?Ut.get(S).__webglFramebuffer:null;ht.bindFramebuffer(z.FRAMEBUFFER,bt)}}},this.copyFramebufferToTexture=function(w,O,H=0){let W=Math.pow(2,-H),k=Math.floor(O.image.width*W),ct=Math.floor(O.image.height*W);C.setTexture2D(O,0),z.copyTexSubImage2D(z.TEXTURE_2D,H,0,0,w.x,w.y,k,ct),ht.unbindTexture()},this.copyTextureToTexture=function(w,O,H,W=0){let k=O.image.width,ct=O.image.height,dt=ut.convert(H.format),yt=ut.convert(H.type);C.setTexture2D(H,0),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,H.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,H.unpackAlignment),O.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,W,w.x,w.y,k,ct,dt,yt,O.image.data):O.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,W,w.x,w.y,O.mipmaps[0].width,O.mipmaps[0].height,dt,O.mipmaps[0].data):z.texSubImage2D(z.TEXTURE_2D,W,w.x,w.y,dt,yt,O.image),W===0&&H.generateMipmaps&&z.generateMipmap(z.TEXTURE_2D),ht.unbindTexture()},this.copyTextureToTexture3D=function(w,O,H,W,k=0){if(g.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let ct=w.max.x-w.min.x+1,dt=w.max.y-w.min.y+1,yt=w.max.z-w.min.z+1,bt=ut.convert(W.format),Ft=ut.convert(W.type),Et;if(W.isData3DTexture)C.setTexture3D(W,0),Et=z.TEXTURE_3D;else if(W.isDataArrayTexture||W.isCompressedArrayTexture)C.setTexture2DArray(W,0),Et=z.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,W.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,W.unpackAlignment);let Rt=z.getParameter(z.UNPACK_ROW_LENGTH),he=z.getParameter(z.UNPACK_IMAGE_HEIGHT),We=z.getParameter(z.UNPACK_SKIP_PIXELS),Me=z.getParameter(z.UNPACK_SKIP_ROWS),Sn=z.getParameter(z.UNPACK_SKIP_IMAGES),re=H.isCompressedTexture?H.mipmaps[k]:H.image;z.pixelStorei(z.UNPACK_ROW_LENGTH,re.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,re.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,w.min.x),z.pixelStorei(z.UNPACK_SKIP_ROWS,w.min.y),z.pixelStorei(z.UNPACK_SKIP_IMAGES,w.min.z),H.isDataTexture||H.isData3DTexture?z.texSubImage3D(Et,k,O.x,O.y,O.z,ct,dt,yt,bt,Ft,re.data):H.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),z.compressedTexSubImage3D(Et,k,O.x,O.y,O.z,ct,dt,yt,bt,re.data)):z.texSubImage3D(Et,k,O.x,O.y,O.z,ct,dt,yt,bt,Ft,re),z.pixelStorei(z.UNPACK_ROW_LENGTH,Rt),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,he),z.pixelStorei(z.UNPACK_SKIP_PIXELS,We),z.pixelStorei(z.UNPACK_SKIP_ROWS,Me),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Sn),k===0&&W.generateMipmaps&&z.generateMipmap(Et),ht.unbindTexture()},this.initTexture=function(w){w.isCubeTexture?C.setTextureCube(w,0):w.isData3DTexture?C.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?C.setTexture2DArray(w,0):C.setTexture2D(w,0),ht.unbindTexture()},this.resetState=function(){A=0,T=0,S=null,ht.reset(),It.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=t===Xa?"display-p3":"srgb",e.unpackColorSpace=qt.workingColorSpace===Fr?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===Te?di:Pu}set outputEncoding(t){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=t===di?Te:Pn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(t){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=t}},Ia=class extends Pa{};Ia.prototype.isWebGL1Renderer=!0;var La=class i extends xn{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),l(n),u(),this.setAttribute("position",new Qe(r,3)),this.setAttribute("normal",new Qe(r.slice(),3)),this.setAttribute("uv",new Qe(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(y){let g=new D,M=new D,A=new D;for(let T=0;T<e.length;T+=3)p(e[T+0],g),p(e[T+1],M),p(e[T+2],A),c(g,M,A,y)}function c(y,g,M,A){let T=A+1,S=[];for(let I=0;I<=T;I++){S[I]=[];let v=y.clone().lerp(M,I/T),b=g.clone().lerp(M,I/T),R=T-I;for(let P=0;P<=R;P++)P===0&&I===T?S[I][P]=v:S[I][P]=v.clone().lerp(b,P/R)}for(let I=0;I<T;I++)for(let v=0;v<2*(T-I)-1;v++){let b=Math.floor(v/2);v%2===0?(h(S[I][b+1]),h(S[I+1][b]),h(S[I][b])):(h(S[I][b+1]),h(S[I+1][b+1]),h(S[I+1][b]))}}function l(y){let g=new D;for(let M=0;M<r.length;M+=3)g.x=r[M+0],g.y=r[M+1],g.z=r[M+2],g.normalize().multiplyScalar(y),r[M+0]=g.x,r[M+1]=g.y,r[M+2]=g.z}function u(){let y=new D;for(let g=0;g<r.length;g+=3){y.x=r[g+0],y.y=r[g+1],y.z=r[g+2];let M=m(y)/2/Math.PI+.5,A=f(y)/Math.PI+.5;a.push(M,1-A)}_(),d()}function d(){for(let y=0;y<a.length;y+=6){let g=a[y+0],M=a[y+2],A=a[y+4],T=Math.max(g,M,A),S=Math.min(g,M,A);T>.9&&S<.1&&(g<.2&&(a[y+0]+=1),M<.2&&(a[y+2]+=1),A<.2&&(a[y+4]+=1))}}function h(y){r.push(y.x,y.y,y.z)}function p(y,g){let M=y*3;g.x=t[M+0],g.y=t[M+1],g.z=t[M+2]}function _(){let y=new D,g=new D,M=new D,A=new D,T=new Ct,S=new Ct,I=new Ct;for(let v=0,b=0;v<r.length;v+=9,b+=6){y.set(r[v+0],r[v+1],r[v+2]),g.set(r[v+3],r[v+4],r[v+5]),M.set(r[v+6],r[v+7],r[v+8]),T.set(a[b+0],a[b+1]),S.set(a[b+2],a[b+3]),I.set(a[b+4],a[b+5]),A.copy(y).add(g).add(M).divideScalar(3);let R=m(A);x(T,b+0,y,R),x(S,b+2,g,R),x(I,b+4,M,R)}}function x(y,g,M,A){A<0&&y.x===1&&(a[g]=y.x-1),M.x===0&&M.z===0&&(a[g]=A/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function f(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.details)}};var Ur=class i extends La{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};function fr(i,t,e){return!i||!e&&i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function a0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Ki=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Da=class extends Ki{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Cl,endingEnd:Cl}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Pl:r=t,o=2*e-n;break;case Il:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Pl:a=t,c=2*n-e;break;case Il:a=1,c=n+s[1]-s[0];break;default:a=t-1,c=e}let l=(n-e)*.5,u=this.valueSize;this._weightPrev=l/(e-o),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,p=this._weightNext,_=(n-e)/(s-e),x=_*_,m=x*_,f=-h*m+2*h*x-h*_,y=(1+h)*m+(-1.5-2*h)*x+(-.5+h)*_+1,g=(-1-p)*m+(1.5+p)*x+.5*_,M=p*m-p*x;for(let A=0;A!==o;++A)r[A]=f*a[u+A]+y*a[l+A]+g*a[c+A]+M*a[d+A];return r}},Ua=class extends Ki{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,u=(n-e)/(s-e),d=1-u;for(let h=0;h!==o;++h)r[h]=a[l+h]*d+a[c+h]*u;return r}},Na=class extends Ki{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},un=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=fr(e,this.TimeBufferType),this.values=fr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:fr(t.times,Array),values:fr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Na(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ua(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Da(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case mr:e=this.InterpolantFactoryMethodDiscrete;break;case gr:e=this.InterpolantFactoryMethodLinear;break;case Uo:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return mr;case this.InterpolantFactoryMethodLinear:return gr;case this.InterpolantFactoryMethodSmooth:return Uo}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(s!==void 0&&a0(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Uo,r=t.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=t[o],u=t[o+1];if(l!==u&&(o!==1||l!==t[0]))if(s)c=!0;else{let d=o*n,h=d-n,p=d+n;for(let _=0;_!==n;++_){let x=e[d+_];if(x!==e[h+_]||x!==e[p+_]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let d=o*n,h=a*n;for(let p=0;p!==n;++p)e[h+p]=e[d+p]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)e[c+l]=e[o+l];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};un.prototype.TimeBufferType=Float32Array;un.prototype.ValueBufferType=Float32Array;un.prototype.DefaultInterpolation=gr;var _i=class extends un{};_i.prototype.ValueTypeName="bool";_i.prototype.ValueBufferType=Array;_i.prototype.DefaultInterpolation=mr;_i.prototype.InterpolantFactoryMethodLinear=void 0;_i.prototype.InterpolantFactoryMethodSmooth=void 0;var Fa=class extends un{};Fa.prototype.ValueTypeName="color";var Oa=class extends un{};Oa.prototype.ValueTypeName="number";var Ba=class extends Ki{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-e)/(s-e),l=t*o;for(let u=l+o;l!==u;l+=4)Zn.slerpFlat(r,0,a,l-o,a,l,c);return r}},Es=class extends un{InterpolantFactoryMethodLinear(t){return new Ba(this.times,this.values,this.getValueSize(),t)}};Es.prototype.ValueTypeName="quaternion";Es.prototype.DefaultInterpolation=gr;Es.prototype.InterpolantFactoryMethodSmooth=void 0;var xi=class extends un{};xi.prototype.ValueTypeName="string";xi.prototype.ValueBufferType=Array;xi.prototype.DefaultInterpolation=mr;xi.prototype.InterpolantFactoryMethodLinear=void 0;xi.prototype.InterpolantFactoryMethodSmooth=void 0;var za=class extends un{};za.prototype.ValueTypeName="vector";var ka=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,d){return l.push(u,d),this},this.removeHandler=function(u){let d=l.indexOf(u);return d!==-1&&l.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=l.length;d<h;d+=2){let p=l[d],_=l[d+1];if(p.global&&(p.lastIndex=0),p.test(u))return _}return null}}},c0=new ka,Va=class{constructor(t){this.manager=t!==void 0?t:c0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};Va.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ya="\\[\\]\\.:\\/",l0=new RegExp("["+Ya+"]","g"),Za="[^"+Ya+"]",u0="[^"+Ya.replace("\\.","")+"]",h0=/((?:WC+[\/:])*)/.source.replace("WC",Za),f0=/(WCOD+)?/.source.replace("WCOD",u0),d0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Za),p0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Za),m0=new RegExp("^"+h0+f0+d0+p0+"$"),g0=["material","materials","bones","map"],Ha=class{constructor(t,e,n){let s=n||ne.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},ne=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(l0,"")}static parseTrackName(t){let e=m0.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);g0.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let c=n(o.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===l){l=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let a=t[s];if(a===void 0){let l=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ne.Composite=Ha;ne.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ne.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ne.prototype.GetterByBindingType=[ne.prototype._getValue_direct,ne.prototype._getValue_array,ne.prototype._getValue_arrayElement,ne.prototype._getValue_toArray];ne.prototype.SetterByBindingTypeAndVersioning=[[ne.prototype._setValue_direct,ne.prototype._setValue_direct_setNeedsUpdate,ne.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ne.prototype._setValue_array,ne.prototype._setValue_array_setNeedsUpdate,ne.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ne.prototype._setValue_arrayElement,ne.prototype._setValue_arrayElement_setNeedsUpdate,ne.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ne.prototype._setValue_fromArray,ne.prototype._setValue_fromArray_setNeedsUpdate,ne.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Mx=new Float32Array(1);var yu=new D,dr=new D,xe=class{constructor(t=new D,e=new D){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){yu.subVectors(t,this.start),dr.subVectors(this.end,this.start);let n=dr.dot(dr),r=dr.dot(yu)/n;return e&&(r=Ne(r,0,1)),r}closestPointToPoint(t,e,n){let s=this.closestPointToPointParameter(t,e);return this.delta(n).multiplyScalar(s).add(this.start)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ga}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ga);var Vu=Math.pow(2,-24),Br=Symbol("SKIP_GENERATION");function _0(i){return i.index?i.index.count:i.attributes.position.count}function yn(i){return _0(i)/3}function x0(i,t=ArrayBuffer){return i>65535?new Uint32Array(new t(4*i)):new Uint16Array(new t(2*i))}function Hu(i,t){if(!i.index){let e=i.attributes.position.count,n=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,s=x0(e,n);i.setIndex(new ie(s,1));for(let r=0;r<e;r++)s[r]=r}}function Ja(i,t){let e=yn(i),n=t||i.drawRange,s=n.start/3,r=(n.start+n.count)/3,a=Math.max(0,s),o=Math.min(e,r)-a;return[{offset:Math.floor(a),count:Math.floor(o)}]}function $a(i,t){if(!i.groups||!i.groups.length)return Ja(i,t);let e=[],n=new Set,s=t||i.drawRange,r=s.start/3,a=(s.start+s.count)/3;for(let c of i.groups){let l=c.start/3,u=(c.start+c.count)/3;n.add(Math.max(r,l)),n.add(Math.min(a,u))}let o=Array.from(n.values()).sort((c,l)=>c-l);for(let c=0;c<o.length-1;c++){let l=o[c],u=o[c+1];e.push({offset:Math.floor(l),count:Math.floor(u-l)})}return e}function Gu(i,t){let e=yn(i),n=$a(i,t).sort((a,o)=>a.offset-o.offset),s=n[n.length-1];s.count=Math.min(e-s.offset,s.count);let r=0;return n.forEach(({count:a})=>r+=a),e!==r}function zr(i,t,e,n,s){let r=1/0,a=1/0,o=1/0,c=-1/0,l=-1/0,u=-1/0,d=1/0,h=1/0,p=1/0,_=-1/0,x=-1/0,m=-1/0;for(let f=t*6,y=(t+e)*6;f<y;f+=6){let g=i[f+0],M=i[f+1],A=g-M,T=g+M;A<r&&(r=A),T>c&&(c=T),g<d&&(d=g),g>_&&(_=g);let S=i[f+2],I=i[f+3],v=S-I,b=S+I;v<a&&(a=v),b>l&&(l=b),S<h&&(h=S),S>x&&(x=S);let R=i[f+4],P=i[f+5],F=R-P,L=R+P;F<o&&(o=F),L>u&&(u=L),R<p&&(p=R),R>m&&(m=R)}n[0]=r,n[1]=a,n[2]=o,n[3]=c,n[4]=l,n[5]=u,s[0]=d,s[1]=h,s[2]=p,s[3]=_,s[4]=x,s[5]=m}function Wu(i,t=null,e=null,n=null){let s=i.attributes.position,r=i.index?i.index.array:null,a=yn(i),o=s.normalized,c;t===null?(c=new Float32Array(a*6*4),e=0,n=a):(c=t,e=e||0,n=n||a);let l=s.array,u=s.offset||0,d=3;s.isInterleavedBufferAttribute&&(d=s.data.stride);let h=["getX","getY","getZ"];for(let p=e;p<e+n;p++){let _=p*3,x=p*6,m=_+0,f=_+1,y=_+2;r&&(m=r[m],f=r[f],y=r[y]),o||(m=m*d+u,f=f*d+u,y=y*d+u);for(let g=0;g<3;g++){let M,A,T;o?(M=s[h[g]](m),A=s[h[g]](f),T=s[h[g]](y)):(M=l[m+g],A=l[f+g],T=l[y+g]);let S=M;A<S&&(S=A),T<S&&(S=T);let I=M;A>I&&(I=A),T>I&&(I=T);let v=(I-S)/2,b=g*2;c[x+b+0]=S+v,c[x+b+1]=v+(Math.abs(S)+v)*Vu}}return c}function Zt(i,t,e){return e.min.x=t[i],e.min.y=t[i+1],e.min.z=t[i+2],e.max.x=t[i+3],e.max.y=t[i+4],e.max.z=t[i+5],e}function Ka(i){let t=-1,e=-1/0;for(let n=0;n<3;n++){let s=i[n+3]-i[n];s>e&&(e=s,t=n)}return t}function ja(i,t){t.set(i)}function Qa(i,t,e){let n,s;for(let r=0;r<3;r++){let a=r+3;n=i[r],s=t[r],e[r]=n<s?n:s,n=i[a],s=t[a],e[a]=n>s?n:s}}function Rs(i,t,e){for(let n=0;n<3;n++){let s=t[i+2*n],r=t[i+2*n+1],a=s-r,o=s+r;a<e[n]&&(e[n]=a),o>e[n+3]&&(e[n+3]=o)}}function Qi(i){let t=i[3]-i[0],e=i[4]-i[1],n=i[5]-i[2];return 2*(t*e+e*n+n*t)}var Dn=32,v0=(i,t)=>i.candidate-t.candidate,Jn=new Array(Dn).fill().map(()=>({count:0,bounds:new Float32Array(6),rightCacheBounds:new Float32Array(6),leftCacheBounds:new Float32Array(6),candidate:0})),kr=new Float32Array(6);function Yu(i,t,e,n,s,r){let a=-1,o=0;if(r===0)a=Ka(t),a!==-1&&(o=(t[a]+t[a+3])/2);else if(r===1)a=Ka(i),a!==-1&&(o=M0(e,n,s,a));else if(r===2){let c=Qi(i),l=1.25*s,u=n*6,d=(n+s)*6;for(let h=0;h<3;h++){let p=t[h],m=(t[h+3]-p)/Dn;if(s<Dn/4){let f=[...Jn];f.length=s;let y=0;for(let M=u;M<d;M+=6,y++){let A=f[y];A.candidate=e[M+2*h],A.count=0;let{bounds:T,leftCacheBounds:S,rightCacheBounds:I}=A;for(let v=0;v<3;v++)I[v]=1/0,I[v+3]=-1/0,S[v]=1/0,S[v+3]=-1/0,T[v]=1/0,T[v+3]=-1/0;Rs(M,e,T)}f.sort(v0);let g=s;for(let M=0;M<g;M++){let A=f[M];for(;M+1<g&&f[M+1].candidate===A.candidate;)f.splice(M+1,1),g--}for(let M=u;M<d;M+=6){let A=e[M+2*h];for(let T=0;T<g;T++){let S=f[T];A>=S.candidate?Rs(M,e,S.rightCacheBounds):(Rs(M,e,S.leftCacheBounds),S.count++)}}for(let M=0;M<g;M++){let A=f[M],T=A.count,S=s-A.count,I=A.leftCacheBounds,v=A.rightCacheBounds,b=0;T!==0&&(b=Qi(I)/c);let R=0;S!==0&&(R=Qi(v)/c);let P=1+1.25*(b*T+R*S);P<l&&(a=h,l=P,o=A.candidate)}}else{for(let g=0;g<Dn;g++){let M=Jn[g];M.count=0,M.candidate=p+m+g*m;let A=M.bounds;for(let T=0;T<3;T++)A[T]=1/0,A[T+3]=-1/0}for(let g=u;g<d;g+=6){let T=~~((e[g+2*h]-p)/m);T>=Dn&&(T=Dn-1);let S=Jn[T];S.count++,Rs(g,e,S.bounds)}let f=Jn[Dn-1];ja(f.bounds,f.rightCacheBounds);for(let g=Dn-2;g>=0;g--){let M=Jn[g],A=Jn[g+1];Qa(M.bounds,A.rightCacheBounds,M.rightCacheBounds)}let y=0;for(let g=0;g<Dn-1;g++){let M=Jn[g],A=M.count,T=M.bounds,I=Jn[g+1].rightCacheBounds;A!==0&&(y===0?ja(T,kr):Qa(T,kr,kr)),y+=A;let v=0,b=0;y!==0&&(v=Qi(kr)/c);let R=s-y;R!==0&&(b=Qi(I)/c);let P=1+1.25*(v*y+b*R);P<l&&(a=h,l=P,o=M.candidate)}}}}else console.warn(`MeshBVH: Invalid build strategy value ${r} used.`);return{axis:a,pos:o}}function M0(i,t,e,n){let s=0;for(let r=t,a=t+e;r<a;r++)s+=i[r*6+n*2];return s/e}var ts=class{constructor(){this.boundingData=new Float32Array(6)}};function Zu(i,t,e,n,s,r){let a=n,o=n+s-1,c=r.pos,l=r.axis*2;for(;;){for(;a<=o&&e[a*6+l]<c;)a++;for(;a<=o&&e[o*6+l]>=c;)o--;if(a<o){for(let u=0;u<3;u++){let d=t[a*3+u];t[a*3+u]=t[o*3+u],t[o*3+u]=d}for(let u=0;u<6;u++){let d=e[a*6+u];e[a*6+u]=e[o*6+u],e[o*6+u]=d}a++,o--}else return a}}function Ju(i,t,e,n,s,r){let a=n,o=n+s-1,c=r.pos,l=r.axis*2;for(;;){for(;a<=o&&e[a*6+l]<c;)a++;for(;a<=o&&e[o*6+l]>=c;)o--;if(a<o){let u=i[a];i[a]=i[o],i[o]=u;for(let d=0;d<6;d++){let h=e[a*6+d];e[a*6+d]=e[o*6+d],e[o*6+d]=h}a++,o--}else return a}}function oe(i,t){return t[i+15]===65535}function fe(i,t){return t[i+6]}function me(i,t){return t[i+14]}function be(i){return i+8}function Ae(i,t){return t[i+6]}function Vr(i,t){return t[i+7]}var $u,Cs,Hr,Ku,S0=Math.pow(2,32);function Gr(i){return"count"in i?1:1+Gr(i.left)+Gr(i.right)}function ju(i,t,e){return $u=new Float32Array(e),Cs=new Uint32Array(e),Hr=new Uint16Array(e),Ku=new Uint8Array(e),tc(i,t)}function tc(i,t){let e=i/4,n=i/2,s="count"in t,r=t.boundingData;for(let a=0;a<6;a++)$u[e+a]=r[a];if(s)if(t.buffer){let a=t.buffer;Ku.set(new Uint8Array(a),i);for(let o=i,c=i+a.byteLength;o<c;o+=32){let l=o/2;oe(l,Hr)||(Cs[o/4+6]+=e)}return i+a.byteLength}else{let a=t.offset,o=t.count;return Cs[e+6]=a,Hr[n+14]=o,Hr[n+15]=65535,i+32}else{let a=t.left,o=t.right,c=t.splitAxis,l;if(l=tc(i+32,a),l/4>S0)throw new Error("MeshBVH: Cannot store child pointer greater than 32 bits.");return Cs[e+6]=l/4,l=tc(l,o),Cs[e+7]=c,l}}function b0(i,t){let e=(i.index?i.index.count:i.attributes.position.count)/3,n=e>2**16,s=n?4:2,r=t?new SharedArrayBuffer(e*s):new ArrayBuffer(e*s),a=n?new Uint32Array(r):new Uint16Array(r);for(let o=0,c=a.length;o<c;o++)a[o]=o;return a}function A0(i,t,e,n,s){let{maxDepth:r,verbose:a,maxLeafTris:o,strategy:c,onProgress:l,indirect:u}=s,d=i._indirectBuffer,h=i.geometry,p=h.index?h.index.array:null,_=u?Ju:Zu,x=yn(h),m=new Float32Array(6),f=!1,y=new ts;return zr(t,e,n,y.boundingData,m),M(y,e,n,m),y;function g(A){l&&l(A/x)}function M(A,T,S,I=null,v=0){if(!f&&v>=r&&(f=!0,a&&(console.warn(`MeshBVH: Max depth of ${r} reached when generating BVH. Consider increasing maxDepth.`),console.warn(h))),S<=o||v>=r)return g(T+S),A.offset=T,A.count=S,A;let b=Yu(A.boundingData,I,t,T,S,c);if(b.axis===-1)return g(T+S),A.offset=T,A.count=S,A;let R=_(d,p,t,T,S,b);if(R===T||R===T+S)g(T+S),A.offset=T,A.count=S;else{A.splitAxis=b.axis;let P=new ts,F=T,L=R-T;A.left=P,zr(t,F,L,P.boundingData,m),M(P,F,L,m,v+1);let U=new ts,B=R,Y=S-L;A.right=U,zr(t,B,Y,U.boundingData,m),M(U,B,Y,m,v+1)}return A}}function Qu(i,t){let e=i.geometry;t.indirect&&(i._indirectBuffer=b0(e,t.useSharedArrayBuffer),Gu(e,t.range)&&!t.verbose&&console.warn('MeshBVH: Provided geometry contains groups or a range that do not fully span the vertex contents while using the "indirect" option. BVH may incorrectly report intersections on unrendered portions of the geometry.')),i._indirectBuffer||Hu(e,t);let n=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,s=Wu(e),r=t.indirect?Ja(e,t.range):$a(e,t.range);i._roots=r.map(a=>{let o=A0(i,s,a.offset,a.count,t),c=Gr(o),l=new n(32*c);return ju(0,o,l),l})}var Ve=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let n=1/0,s=-1/0;for(let r=0,a=t.length;r<a;r++){let c=t[r][e];n=c<n?c:n,s=c>s?c:s}this.min=n,this.max=s}setFromPoints(t,e){let n=1/0,s=-1/0;for(let r=0,a=e.length;r<a;r++){let o=e[r],c=t.dot(o);n=c<n?c:n,s=c>s?c:s}this.min=n,this.max=s}isSeparated(t){return this.min>t.max||t.min>this.max}};Ve.prototype.setFromBox=function(){let i=new D;return function(e,n){let s=n.min,r=n.max,a=1/0,o=-1/0;for(let c=0;c<=1;c++)for(let l=0;l<=1;l++)for(let u=0;u<=1;u++){i.x=s.x*c+r.x*(1-c),i.y=s.y*l+r.y*(1-l),i.z=s.z*u+r.z*(1-u);let d=e.dot(i);a=Math.min(d,a),o=Math.max(d,o)}this.min=a,this.max=o}}();var Jx=function(){let i=new Ve;return function(e,n){let s=e.points,r=e.satAxes,a=e.satBounds,o=n.points,c=n.satAxes,l=n.satBounds;for(let u=0;u<3;u++){let d=a[u],h=r[u];if(i.setFromPoints(h,o),d.isSeparated(i))return!1}for(let u=0;u<3;u++){let d=l[u],h=c[u];if(i.setFromPoints(h,s),d.isSeparated(i))return!1}}}();var T0=function(){let i=new D,t=new D,e=new D;return function(s,r,a){let o=s.start,c=i,l=r.start,u=t;e.subVectors(o,l),i.subVectors(s.end,s.start),t.subVectors(r.end,r.start);let d=e.dot(u),h=u.dot(c),p=u.dot(u),_=e.dot(c),m=c.dot(c)*p-h*h,f,y;m!==0?f=(d*h-_*p)/m:f=0,y=(d+f*h)/p,a.x=f,a.y=y}}(),Is=function(){let i=new Ct,t=new D,e=new D;return function(s,r,a,o){T0(s,r,i);let c=i.x,l=i.y;if(c>=0&&c<=1&&l>=0&&l<=1){s.at(c,a),r.at(l,o);return}else if(c>=0&&c<=1){l<0?r.at(0,o):r.at(1,o),s.closestPointToPoint(o,!0,a);return}else if(l>=0&&l<=1){c<0?s.at(0,a):s.at(1,a),r.closestPointToPoint(a,!0,o);return}else{let u;c<0?u=s.start:u=s.end;let d;l<0?d=r.start:d=r.end;let h=t,p=e;if(s.closestPointToPoint(d,!0,t),r.closestPointToPoint(u,!0,e),h.distanceToSquared(d)<=p.distanceToSquared(u)){a.copy(h),o.copy(d);return}else{a.copy(u),o.copy(p);return}}}}(),th=function(){let i=new D,t=new D,e=new Fe,n=new xe;return function(r,a){let{radius:o,center:c}=r,{a:l,b:u,c:d}=a;if(n.start=l,n.end=u,n.closestPointToPoint(c,!0,i).distanceTo(c)<=o||(n.start=l,n.end=d,n.closestPointToPoint(c,!0,i).distanceTo(c)<=o)||(n.start=u,n.end=d,n.closestPointToPoint(c,!0,i).distanceTo(c)<=o))return!0;let x=a.getPlane(e);if(Math.abs(x.distanceToPoint(c))<=o){let f=x.projectPoint(c,t);if(a.containsPoint(f))return!0}return!1}}();var E0=1e-15;function ec(i){return Math.abs(i)<E0}var ye=class extends ee{constructor(...t){super(...t),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new D),this.satBounds=new Array(4).fill().map(()=>new Ve),this.points=[this.a,this.b,this.c],this.sphere=new pi,this.plane=new Fe,this.needsUpdate=!0}intersectsSphere(t){return th(t,this)}update(){let t=this.a,e=this.b,n=this.c,s=this.points,r=this.satAxes,a=this.satBounds,o=r[0],c=a[0];this.getNormal(o),c.setFromPoints(o,s);let l=r[1],u=a[1];l.subVectors(t,e),u.setFromPoints(l,s);let d=r[2],h=a[2];d.subVectors(e,n),h.setFromPoints(d,s);let p=r[3],_=a[3];p.subVectors(n,t),_.setFromPoints(p,s),this.sphere.setFromPoints(this.points),this.plane.setFromNormalAndCoplanarPoint(o,t),this.needsUpdate=!1}};ye.prototype.closestPointToSegment=function(){let i=new D,t=new D,e=new xe;return function(s,r=null,a=null){let{start:o,end:c}=s,l=this.points,u,d=1/0;for(let h=0;h<3;h++){let p=(h+1)%3;e.start.copy(l[h]),e.end.copy(l[p]),Is(e,s,i,t),u=i.distanceToSquared(t),u<d&&(d=u,r&&r.copy(i),a&&a.copy(t))}return this.closestPointToPoint(o,i),u=o.distanceToSquared(i),u<d&&(d=u,r&&r.copy(i),a&&a.copy(o)),this.closestPointToPoint(c,i),u=c.distanceToSquared(i),u<d&&(d=u,r&&r.copy(i),a&&a.copy(c)),Math.sqrt(d)}}();ye.prototype.intersectsTriangle=function(){let i=new ye,t=new Array(3),e=new Array(3),n=new Ve,s=new Ve,r=new D,a=new D,o=new D,c=new D,l=new D,u=new xe,d=new xe,h=new xe,p=new D;function _(x,m,f){let y=x.points,g=0,M=-1;for(let A=0;A<3;A++){let{start:T,end:S}=u;T.copy(y[A]),S.copy(y[(A+1)%3]),u.delta(a);let I=ec(m.distanceToPoint(T));if(ec(m.normal.dot(a))&&I){f.copy(u),g=2;break}let v=m.intersectLine(u,p);if(!v&&I&&p.copy(T),(v||I)&&!ec(p.distanceTo(S))){if(g<=1)(g===1?f.start:f.end).copy(p),I&&(M=g);else if(g>=2){(M===1?f.start:f.end).copy(p),g=2;break}if(g++,g===2&&M===-1)break}}return g}return function(m,f=null,y=!1){this.needsUpdate&&this.update(),m.isExtendedTriangle?m.needsUpdate&&m.update():(i.copy(m),i.update(),m=i);let g=this.plane,M=m.plane;if(Math.abs(g.normal.dot(M.normal))>1-1e-10){let A=this.satBounds,T=this.satAxes;e[0]=m.a,e[1]=m.b,e[2]=m.c;for(let v=0;v<4;v++){let b=A[v],R=T[v];if(n.setFromPoints(R,e),b.isSeparated(n))return!1}let S=m.satBounds,I=m.satAxes;t[0]=this.a,t[1]=this.b,t[2]=this.c;for(let v=0;v<4;v++){let b=S[v],R=I[v];if(n.setFromPoints(R,t),b.isSeparated(n))return!1}for(let v=0;v<4;v++){let b=T[v];for(let R=0;R<4;R++){let P=I[R];if(r.crossVectors(b,P),n.setFromPoints(r,t),s.setFromPoints(r,e),n.isSeparated(s))return!1}}return f&&(y||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),f.start.set(0,0,0),f.end.set(0,0,0)),!0}else{let A=_(this,M,d);if(A===1&&m.containsPoint(d.end))return f&&(f.start.copy(d.end),f.end.copy(d.end)),!0;if(A!==2)return!1;let T=_(m,g,h);if(T===1&&this.containsPoint(h.end))return f&&(f.start.copy(h.end),f.end.copy(h.end)),!0;if(T!==2)return!1;if(d.delta(o),h.delta(c),o.dot(c)<0){let F=h.start;h.start=h.end,h.end=F}let S=d.start.dot(o),I=d.end.dot(o),v=h.start.dot(o),b=h.end.dot(o),R=I<v,P=S<b;return S!==b&&v!==I&&R===P?!1:(f&&(l.subVectors(d.start,h.start),l.dot(o)>0?f.start.copy(d.start):f.start.copy(h.start),l.subVectors(d.end,h.end),l.dot(o)<0?f.end.copy(d.end):f.end.copy(h.end)),!0)}}}();ye.prototype.distanceToPoint=function(){let i=new D;return function(e){return this.closestPointToPoint(e,i),e.distanceTo(i)}}();ye.prototype.distanceToTriangle=function(){let i=new D,t=new D,e=["a","b","c"],n=new xe,s=new xe;return function(a,o=null,c=null){let l=o||c?n:null;if(this.intersectsTriangle(a,l))return(o||c)&&(o&&l.getCenter(o),c&&l.getCenter(c)),0;let u=1/0;for(let d=0;d<3;d++){let h,p=e[d],_=a[p];this.closestPointToPoint(_,i),h=_.distanceToSquared(i),h<u&&(u=h,o&&o.copy(i),c&&c.copy(_));let x=this[p];a.closestPointToPoint(x,i),h=x.distanceToSquared(i),h<u&&(u=h,o&&o.copy(x),c&&c.copy(i))}for(let d=0;d<3;d++){let h=e[d],p=e[(d+1)%3];n.set(this[h],this[p]);for(let _=0;_<3;_++){let x=e[_],m=e[(_+1)%3];s.set(a[x],a[m]),Is(n,s,i,t);let f=i.distanceToSquared(t);f<u&&(u=f,o&&o.copy(i),c&&c.copy(t))}}return Math.sqrt(u)}}();var ue=class{constructor(t,e,n){this.isOrientedBox=!0,this.min=new D,this.max=new D,this.matrix=new kt,this.invMatrix=new kt,this.points=new Array(8).fill().map(()=>new D),this.satAxes=new Array(3).fill().map(()=>new D),this.satBounds=new Array(3).fill().map(()=>new Ve),this.alignedSatBounds=new Array(3).fill().map(()=>new Ve),this.needsUpdate=!1,t&&this.min.copy(t),e&&this.max.copy(e),n&&this.matrix.copy(n)}set(t,e,n){this.min.copy(t),this.max.copy(e),this.matrix.copy(n),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}};ue.prototype.update=function(){return function(){let t=this.matrix,e=this.min,n=this.max,s=this.points;for(let l=0;l<=1;l++)for(let u=0;u<=1;u++)for(let d=0;d<=1;d++){let h=1*l|2*u|4*d,p=s[h];p.x=l?n.x:e.x,p.y=u?n.y:e.y,p.z=d?n.z:e.z,p.applyMatrix4(t)}let r=this.satBounds,a=this.satAxes,o=s[0];for(let l=0;l<3;l++){let u=a[l],d=r[l],h=1<<l,p=s[h];u.subVectors(o,p),d.setFromPoints(u,s)}let c=this.alignedSatBounds;c[0].setFromPointsField(s,"x"),c[1].setFromPointsField(s,"y"),c[2].setFromPointsField(s,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();ue.prototype.intersectsBox=function(){let i=new Ve;return function(e){this.needsUpdate&&this.update();let n=e.min,s=e.max,r=this.satBounds,a=this.satAxes,o=this.alignedSatBounds;if(i.min=n.x,i.max=s.x,o[0].isSeparated(i)||(i.min=n.y,i.max=s.y,o[1].isSeparated(i))||(i.min=n.z,i.max=s.z,o[2].isSeparated(i)))return!1;for(let c=0;c<3;c++){let l=a[c],u=r[c];if(i.setFromBox(l,e),u.isSeparated(i))return!1}return!0}}();ue.prototype.intersectsTriangle=function(){let i=new ye,t=new Array(3),e=new Ve,n=new Ve,s=new D;return function(a){this.needsUpdate&&this.update(),a.isExtendedTriangle?a.needsUpdate&&a.update():(i.copy(a),i.update(),a=i);let o=this.satBounds,c=this.satAxes;t[0]=a.a,t[1]=a.b,t[2]=a.c;for(let h=0;h<3;h++){let p=o[h],_=c[h];if(e.setFromPoints(_,t),p.isSeparated(e))return!1}let l=a.satBounds,u=a.satAxes,d=this.points;for(let h=0;h<3;h++){let p=l[h],_=u[h];if(e.setFromPoints(_,d),p.isSeparated(e))return!1}for(let h=0;h<3;h++){let p=c[h];for(let _=0;_<4;_++){let x=u[_];if(s.crossVectors(p,x),e.setFromPoints(s,t),n.setFromPoints(s,d),e.isSeparated(n))return!1}}return!0}}();ue.prototype.closestPointToPoint=function(){return function(t,e){return this.needsUpdate&&this.update(),e.copy(t).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),e}}();ue.prototype.distanceToPoint=function(){let i=new D;return function(e){return this.closestPointToPoint(e,i),e.distanceTo(i)}}();ue.prototype.distanceToBox=function(){let i=["x","y","z"],t=new Array(12).fill().map(()=>new xe),e=new Array(12).fill().map(()=>new xe),n=new D,s=new D;return function(a,o=0,c=null,l=null){if(this.needsUpdate&&this.update(),this.intersectsBox(a))return(c||l)&&(a.getCenter(s),this.closestPointToPoint(s,n),a.closestPointToPoint(n,s),c&&c.copy(n),l&&l.copy(s)),0;let u=o*o,d=a.min,h=a.max,p=this.points,_=1/0;for(let m=0;m<8;m++){let f=p[m];s.copy(f).clamp(d,h);let y=f.distanceToSquared(s);if(y<_&&(_=y,c&&c.copy(f),l&&l.copy(s),y<u))return Math.sqrt(y)}let x=0;for(let m=0;m<3;m++)for(let f=0;f<=1;f++)for(let y=0;y<=1;y++){let g=(m+1)%3,M=(m+2)%3,A=f<<g|y<<M,T=1<<m|f<<g|y<<M,S=p[A],I=p[T];t[x].set(S,I);let b=i[m],R=i[g],P=i[M],F=e[x],L=F.start,U=F.end;L[b]=d[b],L[R]=f?d[R]:h[R],L[P]=y?d[P]:h[R],U[b]=h[b],U[R]=f?d[R]:h[R],U[P]=y?d[P]:h[R],x++}for(let m=0;m<=1;m++)for(let f=0;f<=1;f++)for(let y=0;y<=1;y++){s.x=m?h.x:d.x,s.y=f?h.y:d.y,s.z=y?h.z:d.z,this.closestPointToPoint(s,n);let g=s.distanceToSquared(n);if(g<_&&(_=g,c&&c.copy(n),l&&l.copy(s),g<u))return Math.sqrt(g)}for(let m=0;m<12;m++){let f=t[m];for(let y=0;y<12;y++){let g=e[y];Is(f,g,n,s);let M=n.distanceToSquared(s);if(M<_&&(_=M,c&&c.copy(n),l&&l.copy(s),M<u))return Math.sqrt(M)}}return Math.sqrt(_)}}();var $n=class{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;return t.length===0?this._getNewPrimitive():t.pop()}releasePrimitive(t){this._primitives.push(t)}};var nc=class extends $n{constructor(){super(()=>new ye)}},Oe=new nc;var ic=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=n=>{e&&t.push(e),e=n,this.float32Array=new Float32Array(n),this.uint16Array=new Uint16Array(n),this.uint32Array=new Uint32Array(n)},this.clearBuffer=()=>{e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0&&this.setBuffer(t.pop())}}},Ht=new ic;var Kn,ns,es=[],Xr=new $n(()=>new le);function eh(i,t,e,n,s,r){Kn=Xr.getPrimitive(),ns=Xr.getPrimitive(),es.push(Kn,ns),Ht.setBuffer(i._roots[t]);let a=sc(0,i.geometry,e,n,s,r);Ht.clearBuffer(),Xr.releasePrimitive(Kn),Xr.releasePrimitive(ns),es.pop(),es.pop();let o=es.length;return o>0&&(ns=es[o-1],Kn=es[o-2]),a}function sc(i,t,e,n,s=null,r=0,a=0){let{float32Array:o,uint16Array:c,uint32Array:l}=Ht,u=i*2;if(oe(u,c)){let h=fe(i,l),p=me(u,c);return Zt(i,o,Kn),n(h,p,!1,a,r+i,Kn)}else{let b=function(P){let{uint16Array:F,uint32Array:L}=Ht,U=P*2;for(;!oe(U,F);)P=be(P),U=P*2;return fe(P,L)},R=function(P){let{uint16Array:F,uint32Array:L}=Ht,U=P*2;for(;!oe(U,F);)P=Ae(P,L),U=P*2;return fe(P,L)+me(U,F)},h=be(i),p=Ae(i,l),_=h,x=p,m,f,y,g;if(s&&(y=Kn,g=ns,Zt(_,o,y),Zt(x,o,g),m=s(y),f=s(g),f<m)){_=p,x=h;let P=m;m=f,f=P,y=g}y||(y=Kn,Zt(_,o,y));let M=oe(_*2,c),A=e(y,M,m,a+1,r+_),T;if(A===2){let P=b(_),L=R(_)-P;T=n(P,L,!0,a+1,r+_,y)}else T=A&&sc(_,t,e,n,s,r,a+1);if(T)return!0;g=ns,Zt(x,o,g);let S=oe(x*2,c),I=e(g,S,f,a+1,r+x),v;if(I===2){let P=b(x),L=R(x)-P;v=n(P,L,!0,a+1,r+x,g)}else v=I&&sc(x,t,e,n,s,r,a+1);return!!v}}var Ls=new D,oc=new D;function nh(i,t,e={},n=0,s=1/0){let r=n*n,a=s*s,o=1/0,c=null;if(i.shapecast({boundsTraverseOrder:u=>(Ls.copy(t).clamp(u.min,u.max),Ls.distanceToSquared(t)),intersectsBounds:(u,d,h)=>h<o&&h<a,intersectsTriangle:(u,d)=>{u.closestPointToPoint(t,Ls);let h=t.distanceToSquared(Ls);return h<o&&(oc.copy(Ls),o=h,c=d),h<r}}),o===1/0)return null;let l=Math.sqrt(o);return e.point?e.point.copy(oc):e.point=oc.clone(),e.distance=l,e.faceIndex=c,e}var is=new D,ss=new D,rs=new D,qr=new Ct,Yr=new Ct,Zr=new Ct,ih=new D,sh=new D,rh=new D,Jr=new D;function R0(i,t,e,n,s,r,a,o){let c;if(r===Ce?c=i.intersectTriangle(n,e,t,!0,s):c=i.intersectTriangle(t,e,n,r!==ke,s),c===null)return null;let l=i.origin.distanceTo(s);return l<a||l>o?null:{distance:l,point:s.clone()}}function C0(i,t,e,n,s,r,a,o,c,l,u){is.fromBufferAttribute(t,r),ss.fromBufferAttribute(t,a),rs.fromBufferAttribute(t,o);let d=R0(i,is,ss,rs,Jr,c,l,u);if(d){n&&(qr.fromBufferAttribute(n,r),Yr.fromBufferAttribute(n,a),Zr.fromBufferAttribute(n,o),d.uv=ee.getInterpolation(Jr,is,ss,rs,qr,Yr,Zr,new Ct)),s&&(qr.fromBufferAttribute(s,r),Yr.fromBufferAttribute(s,a),Zr.fromBufferAttribute(s,o),d.uv1=ee.getInterpolation(Jr,is,ss,rs,qr,Yr,Zr,new Ct)),e&&(ih.fromBufferAttribute(e,r),sh.fromBufferAttribute(e,a),rh.fromBufferAttribute(e,o),d.normal=ee.getInterpolation(Jr,is,ss,rs,ih,sh,rh,new D),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));let h={a:r,b:a,c:o,normal:new D,materialIndex:0};ee.getNormal(is,ss,rs,h.normal),d.face=h,d.faceIndex=r}return d}function os(i,t,e,n,s,r,a){let o=n*3,c=o+0,l=o+1,u=o+2,d=i.index;i.index&&(c=d.getX(c),l=d.getX(l),u=d.getX(u));let{position:h,normal:p,uv:_,uv1:x}=i.attributes,m=C0(e,h,p,_,x,c,l,u,t,r,a);return m?(m.faceIndex=n,s&&s.push(m),m):null}function Jt(i,t,e,n){let s=i.a,r=i.b,a=i.c,o=t,c=t+1,l=t+2;e&&(o=e.getX(o),c=e.getX(c),l=e.getX(l)),s.x=n.getX(o),s.y=n.getY(o),s.z=n.getZ(o),r.x=n.getX(c),r.y=n.getY(c),r.z=n.getZ(c),a.x=n.getX(l),a.y=n.getY(l),a.z=n.getZ(l)}function oh(i,t,e,n,s,r,a,o){let{geometry:c,_indirectBuffer:l}=i;for(let u=n,d=n+s;u<d;u++)os(c,t,e,u,r,a,o)}function ah(i,t,e,n,s,r,a){let{geometry:o,_indirectBuffer:c}=i,l=1/0,u=null;for(let d=n,h=n+s;d<h;d++){let p;p=os(o,t,e,d,null,r,a),p&&p.distance<l&&(u=p,l=p.distance)}return u}function ch(i,t,e,n,s,r,a){let{geometry:o}=e,{index:c}=o,l=o.attributes.position;for(let u=i,d=t+i;u<d;u++){let h;if(h=u,Jt(a,h*3,c,l),a.needsUpdate=!0,n(a,h,s,r))return!0}return!1}function lh(i,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=i.geometry,n=e.index?e.index.array:null,s=e.attributes.position,r,a,o,c,l=0,u=i._roots;for(let h=0,p=u.length;h<p;h++)r=u[h],a=new Uint32Array(r),o=new Uint16Array(r),c=new Float32Array(r),d(0,l),l+=r.byteLength;function d(h,p,_=!1){let x=h*2;if(o[x+15]===65535){let f=a[h+6],y=o[x+14],g=1/0,M=1/0,A=1/0,T=-1/0,S=-1/0,I=-1/0;for(let v=3*f,b=3*(f+y);v<b;v++){let R=n[v],P=s.getX(R),F=s.getY(R),L=s.getZ(R);P<g&&(g=P),P>T&&(T=P),F<M&&(M=F),F>S&&(S=F),L<A&&(A=L),L>I&&(I=L)}return c[h+0]!==g||c[h+1]!==M||c[h+2]!==A||c[h+3]!==T||c[h+4]!==S||c[h+5]!==I?(c[h+0]=g,c[h+1]=M,c[h+2]=A,c[h+3]=T,c[h+4]=S,c[h+5]=I,!0):!1}else{let f=h+8,y=a[h+6],g=f+p,M=y+p,A=_,T=!1,S=!1;t?A||(T=t.has(g),S=t.has(M),A=!T&&!S):(T=!0,S=!0);let I=A||T,v=A||S,b=!1;I&&(b=d(f,p,A));let R=!1;v&&(R=d(y,p,A));let P=b||R;if(P)for(let F=0;F<3;F++){let L=f+F,U=y+F,B=c[L],Y=c[L+3],G=c[U],q=c[U+3];c[h+F]=B<G?B:G,c[h+F+3]=Y>q?Y:q}return P}}}function tn(i,t,e,n,s){let r,a,o,c,l,u,d=1/e.direction.x,h=1/e.direction.y,p=1/e.direction.z,_=e.origin.x,x=e.origin.y,m=e.origin.z,f=t[i],y=t[i+3],g=t[i+1],M=t[i+3+1],A=t[i+2],T=t[i+3+2];return d>=0?(r=(f-_)*d,a=(y-_)*d):(r=(y-_)*d,a=(f-_)*d),h>=0?(o=(g-x)*h,c=(M-x)*h):(o=(M-x)*h,c=(g-x)*h),r>c||o>a||((o>r||isNaN(r))&&(r=o),(c<a||isNaN(a))&&(a=c),p>=0?(l=(A-m)*p,u=(T-m)*p):(l=(T-m)*p,u=(A-m)*p),r>u||l>a)?!1:((l>r||r!==r)&&(r=l),(u<a||a!==a)&&(a=u),r<=s&&a>=n)}function uh(i,t,e,n,s,r,a,o){let{geometry:c,_indirectBuffer:l}=i;for(let u=n,d=n+s;u<d;u++){let h=l?l[u]:u;os(c,t,e,h,r,a,o)}}function hh(i,t,e,n,s,r,a){let{geometry:o,_indirectBuffer:c}=i,l=1/0,u=null;for(let d=n,h=n+s;d<h;d++){let p;p=os(o,t,e,c?c[d]:d,null,r,a),p&&p.distance<l&&(u=p,l=p.distance)}return u}function fh(i,t,e,n,s,r,a){let{geometry:o}=e,{index:c}=o,l=o.attributes.position;for(let u=i,d=t+i;u<d;u++){let h;if(h=e.resolveTriangleIndex(u),Jt(a,h*3,c,l),a.needsUpdate=!0,n(a,h,s,r))return!0}return!1}function dh(i,t,e,n,s,r,a){Ht.setBuffer(i._roots[t]),ac(0,i,e,n,s,r,a),Ht.clearBuffer()}function ac(i,t,e,n,s,r,a){let{float32Array:o,uint16Array:c,uint32Array:l}=Ht,u=i*2;if(oe(u,c)){let h=fe(i,l),p=me(u,c);oh(t,e,n,h,p,s,r,a)}else{let h=be(i);tn(h,o,n,r,a)&&ac(h,t,e,n,s,r,a);let p=Ae(i,l);tn(p,o,n,r,a)&&ac(p,t,e,n,s,r,a)}}var P0=["x","y","z"];function ph(i,t,e,n,s,r){Ht.setBuffer(i._roots[t]);let a=cc(0,i,e,n,s,r);return Ht.clearBuffer(),a}function cc(i,t,e,n,s,r){let{float32Array:a,uint16Array:o,uint32Array:c}=Ht,l=i*2;if(oe(l,o)){let d=fe(i,c),h=me(l,o);return ah(t,e,n,d,h,s,r)}else{let d=Vr(i,c),h=P0[d],_=n.direction[h]>=0,x,m;_?(x=be(i),m=Ae(i,c)):(x=Ae(i,c),m=be(i));let y=tn(x,a,n,s,r)?cc(x,t,e,n,s,r):null;if(y){let A=y.point[h];if(_?A<=a[m+d]:A>=a[m+d+3])return y}let M=tn(m,a,n,s,r)?cc(m,t,e,n,s,r):null;return y&&M?y.distance<=M.distance?y:M:y||M||null}}var $r=new le,as=new ye,cs=new ye,Ds=new kt,mh=new ue,Kr=new ue;function gh(i,t,e,n){Ht.setBuffer(i._roots[t]);let s=lc(0,i,e,n);return Ht.clearBuffer(),s}function lc(i,t,e,n,s=null){let{float32Array:r,uint16Array:a,uint32Array:o}=Ht,c=i*2;if(s===null&&(e.boundingBox||e.computeBoundingBox(),mh.set(e.boundingBox.min,e.boundingBox.max,n),s=mh),oe(c,a)){let u=t.geometry,d=u.index,h=u.attributes.position,p=e.index,_=e.attributes.position,x=fe(i,o),m=me(c,a);if(Ds.copy(n).invert(),e.boundsTree)return Zt(i,r,Kr),Kr.matrix.copy(Ds),Kr.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:y=>Kr.intersectsBox(y),intersectsTriangle:y=>{y.a.applyMatrix4(n),y.b.applyMatrix4(n),y.c.applyMatrix4(n),y.needsUpdate=!0;for(let g=x*3,M=(m+x)*3;g<M;g+=3)if(Jt(cs,g,d,h),cs.needsUpdate=!0,y.intersectsTriangle(cs))return!0;return!1}});for(let f=x*3,y=(m+x)*3;f<y;f+=3){Jt(as,f,d,h),as.a.applyMatrix4(Ds),as.b.applyMatrix4(Ds),as.c.applyMatrix4(Ds),as.needsUpdate=!0;for(let g=0,M=p.count;g<M;g+=3)if(Jt(cs,g,p,_),cs.needsUpdate=!0,as.intersectsTriangle(cs))return!0}}else{let u=i+8,d=o[i+6];return Zt(u,r,$r),!!(s.intersectsBox($r)&&lc(u,t,e,n,s)||(Zt(d,r,$r),s.intersectsBox($r)&&lc(d,t,e,n,s)))}}var jr=new kt,uc=new ue,Us=new ue,I0=new D,L0=new D,D0=new D,U0=new D;function _h(i,t,e,n={},s={},r=0,a=1/0){t.boundingBox||t.computeBoundingBox(),uc.set(t.boundingBox.min,t.boundingBox.max,e),uc.needsUpdate=!0;let o=i.geometry,c=o.attributes.position,l=o.index,u=t.attributes.position,d=t.index,h=Oe.getPrimitive(),p=Oe.getPrimitive(),_=I0,x=L0,m=null,f=null;s&&(m=D0,f=U0);let y=1/0,g=null,M=null;return jr.copy(e).invert(),Us.matrix.copy(jr),i.shapecast({boundsTraverseOrder:A=>uc.distanceToBox(A),intersectsBounds:(A,T,S)=>S<y&&S<a?(T&&(Us.min.copy(A.min),Us.max.copy(A.max),Us.needsUpdate=!0),!0):!1,intersectsRange:(A,T)=>{if(t.boundsTree)return t.boundsTree.shapecast({boundsTraverseOrder:I=>Us.distanceToBox(I),intersectsBounds:(I,v,b)=>b<y&&b<a,intersectsRange:(I,v)=>{for(let b=I,R=I+v;b<R;b++){Jt(p,3*b,d,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let P=A,F=A+T;P<F;P++){Jt(h,3*P,l,c),h.needsUpdate=!0;let L=h.distanceToTriangle(p,_,m);if(L<y&&(x.copy(_),f&&f.copy(m),y=L,g=P,M=b),L<r)return!0}}}});{let S=yn(t);for(let I=0,v=S;I<v;I++){Jt(p,3*I,d,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let b=A,R=A+T;b<R;b++){Jt(h,3*b,l,c),h.needsUpdate=!0;let P=h.distanceToTriangle(p,_,m);if(P<y&&(x.copy(_),f&&f.copy(m),y=P,g=b,M=I),P<r)return!0}}}}}),Oe.releasePrimitive(h),Oe.releasePrimitive(p),y===1/0?null:(n.point?n.point.copy(x):n.point=x.clone(),n.distance=y,n.faceIndex=g,s&&(s.point?s.point.copy(f):s.point=f.clone(),s.point.applyMatrix4(jr),x.applyMatrix4(jr),s.distance=x.sub(s.point).length(),s.faceIndex=M),n)}function xh(i,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=i.geometry,n=e.index?e.index.array:null,s=e.attributes.position,r,a,o,c,l=0,u=i._roots;for(let h=0,p=u.length;h<p;h++)r=u[h],a=new Uint32Array(r),o=new Uint16Array(r),c=new Float32Array(r),d(0,l),l+=r.byteLength;function d(h,p,_=!1){let x=h*2;if(o[x+15]===65535){let f=a[h+6],y=o[x+14],g=1/0,M=1/0,A=1/0,T=-1/0,S=-1/0,I=-1/0;for(let v=f,b=f+y;v<b;v++){let R=3*i.resolveTriangleIndex(v);for(let P=0;P<3;P++){let F=R+P;F=n?n[F]:F;let L=s.getX(F),U=s.getY(F),B=s.getZ(F);L<g&&(g=L),L>T&&(T=L),U<M&&(M=U),U>S&&(S=U),B<A&&(A=B),B>I&&(I=B)}}return c[h+0]!==g||c[h+1]!==M||c[h+2]!==A||c[h+3]!==T||c[h+4]!==S||c[h+5]!==I?(c[h+0]=g,c[h+1]=M,c[h+2]=A,c[h+3]=T,c[h+4]=S,c[h+5]=I,!0):!1}else{let f=h+8,y=a[h+6],g=f+p,M=y+p,A=_,T=!1,S=!1;t?A||(T=t.has(g),S=t.has(M),A=!T&&!S):(T=!0,S=!0);let I=A||T,v=A||S,b=!1;I&&(b=d(f,p,A));let R=!1;v&&(R=d(y,p,A));let P=b||R;if(P)for(let F=0;F<3;F++){let L=f+F,U=y+F,B=c[L],Y=c[L+3],G=c[U],q=c[U+3];c[h+F]=B<G?B:G,c[h+F+3]=Y>q?Y:q}return P}}}function yh(i,t,e,n,s,r,a){Ht.setBuffer(i._roots[t]),hc(0,i,e,n,s,r,a),Ht.clearBuffer()}function hc(i,t,e,n,s,r,a){let{float32Array:o,uint16Array:c,uint32Array:l}=Ht,u=i*2;if(oe(u,c)){let h=fe(i,l),p=me(u,c);uh(t,e,n,h,p,s,r,a)}else{let h=be(i);tn(h,o,n,r,a)&&hc(h,t,e,n,s,r,a);let p=Ae(i,l);tn(p,o,n,r,a)&&hc(p,t,e,n,s,r,a)}}var N0=["x","y","z"];function vh(i,t,e,n,s,r){Ht.setBuffer(i._roots[t]);let a=fc(0,i,e,n,s,r);return Ht.clearBuffer(),a}function fc(i,t,e,n,s,r){let{float32Array:a,uint16Array:o,uint32Array:c}=Ht,l=i*2;if(oe(l,o)){let d=fe(i,c),h=me(l,o);return hh(t,e,n,d,h,s,r)}else{let d=Vr(i,c),h=N0[d],_=n.direction[h]>=0,x,m;_?(x=be(i),m=Ae(i,c)):(x=Ae(i,c),m=be(i));let y=tn(x,a,n,s,r)?fc(x,t,e,n,s,r):null;if(y){let A=y.point[h];if(_?A<=a[m+d]:A>=a[m+d+3])return y}let M=tn(m,a,n,s,r)?fc(m,t,e,n,s,r):null;return y&&M?y.distance<=M.distance?y:M:y||M||null}}var Qr=new le,ls=new ye,us=new ye,Ns=new kt,Mh=new ue,to=new ue;function Sh(i,t,e,n){Ht.setBuffer(i._roots[t]);let s=dc(0,i,e,n);return Ht.clearBuffer(),s}function dc(i,t,e,n,s=null){let{float32Array:r,uint16Array:a,uint32Array:o}=Ht,c=i*2;if(s===null&&(e.boundingBox||e.computeBoundingBox(),Mh.set(e.boundingBox.min,e.boundingBox.max,n),s=Mh),oe(c,a)){let u=t.geometry,d=u.index,h=u.attributes.position,p=e.index,_=e.attributes.position,x=fe(i,o),m=me(c,a);if(Ns.copy(n).invert(),e.boundsTree)return Zt(i,r,to),to.matrix.copy(Ns),to.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:y=>to.intersectsBox(y),intersectsTriangle:y=>{y.a.applyMatrix4(n),y.b.applyMatrix4(n),y.c.applyMatrix4(n),y.needsUpdate=!0;for(let g=x,M=m+x;g<M;g++)if(Jt(us,3*t.resolveTriangleIndex(g),d,h),us.needsUpdate=!0,y.intersectsTriangle(us))return!0;return!1}});for(let f=x,y=m+x;f<y;f++){let g=t.resolveTriangleIndex(f);Jt(ls,3*g,d,h),ls.a.applyMatrix4(Ns),ls.b.applyMatrix4(Ns),ls.c.applyMatrix4(Ns),ls.needsUpdate=!0;for(let M=0,A=p.count;M<A;M+=3)if(Jt(us,M,p,_),us.needsUpdate=!0,ls.intersectsTriangle(us))return!0}}else{let u=i+8,d=o[i+6];return Zt(u,r,Qr),!!(s.intersectsBox(Qr)&&dc(u,t,e,n,s)||(Zt(d,r,Qr),s.intersectsBox(Qr)&&dc(d,t,e,n,s)))}}var eo=new kt,pc=new ue,Fs=new ue,F0=new D,O0=new D,B0=new D,z0=new D;function bh(i,t,e,n={},s={},r=0,a=1/0){t.boundingBox||t.computeBoundingBox(),pc.set(t.boundingBox.min,t.boundingBox.max,e),pc.needsUpdate=!0;let o=i.geometry,c=o.attributes.position,l=o.index,u=t.attributes.position,d=t.index,h=Oe.getPrimitive(),p=Oe.getPrimitive(),_=F0,x=O0,m=null,f=null;s&&(m=B0,f=z0);let y=1/0,g=null,M=null;return eo.copy(e).invert(),Fs.matrix.copy(eo),i.shapecast({boundsTraverseOrder:A=>pc.distanceToBox(A),intersectsBounds:(A,T,S)=>S<y&&S<a?(T&&(Fs.min.copy(A.min),Fs.max.copy(A.max),Fs.needsUpdate=!0),!0):!1,intersectsRange:(A,T)=>{if(t.boundsTree){let S=t.boundsTree;return S.shapecast({boundsTraverseOrder:I=>Fs.distanceToBox(I),intersectsBounds:(I,v,b)=>b<y&&b<a,intersectsRange:(I,v)=>{for(let b=I,R=I+v;b<R;b++){let P=S.resolveTriangleIndex(b);Jt(p,3*P,d,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let F=A,L=A+T;F<L;F++){let U=i.resolveTriangleIndex(F);Jt(h,3*U,l,c),h.needsUpdate=!0;let B=h.distanceToTriangle(p,_,m);if(B<y&&(x.copy(_),f&&f.copy(m),y=B,g=F,M=b),B<r)return!0}}}})}else{let S=yn(t);for(let I=0,v=S;I<v;I++){Jt(p,3*I,d,u),p.a.applyMatrix4(e),p.b.applyMatrix4(e),p.c.applyMatrix4(e),p.needsUpdate=!0;for(let b=A,R=A+T;b<R;b++){let P=i.resolveTriangleIndex(b);Jt(h,3*P,l,c),h.needsUpdate=!0;let F=h.distanceToTriangle(p,_,m);if(F<y&&(x.copy(_),f&&f.copy(m),y=F,g=b,M=I),F<r)return!0}}}}}),Oe.releasePrimitive(h),Oe.releasePrimitive(p),y===1/0?null:(n.point?n.point.copy(x):n.point=x.clone(),n.distance=y,n.faceIndex=g,s&&(s.point?s.point.copy(f):s.point=f.clone(),s.point.applyMatrix4(eo),x.applyMatrix4(eo),s.distance=x.sub(s.point).length(),s.faceIndex=M),n)}function Ah(){return typeof SharedArrayBuffer<"u"}var Os=new Ht.constructor,no=new Ht.constructor,jn=new $n(()=>new le),hs=new le,fs=new le,mc=new le,gc=new le,_c=!1;function Th(i,t,e,n){if(_c)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");_c=!0;let s=i._roots,r=t._roots,a,o=0,c=0,l=new kt().copy(e).invert();for(let u=0,d=s.length;u<d;u++){Os.setBuffer(s[u]),c=0;let h=jn.getPrimitive();Zt(0,Os.float32Array,h),h.applyMatrix4(l);for(let p=0,_=r.length;p<_&&(no.setBuffer(r[p]),a=hn(0,0,e,l,n,o,c,0,0,h),no.clearBuffer(),c+=r[p].length,!a);p++);if(jn.releasePrimitive(h),Os.clearBuffer(),o+=s[u].length,a)break}return _c=!1,a}function hn(i,t,e,n,s,r=0,a=0,o=0,c=0,l=null,u=!1){let d,h;u?(d=no,h=Os):(d=Os,h=no);let p=d.float32Array,_=d.uint32Array,x=d.uint16Array,m=h.float32Array,f=h.uint32Array,y=h.uint16Array,g=i*2,M=t*2,A=oe(g,x),T=oe(M,y),S=!1;if(T&&A)u?S=s(fe(t,f),me(t*2,y),fe(i,_),me(i*2,x),c,a+t,o,r+i):S=s(fe(i,_),me(i*2,x),fe(t,f),me(t*2,y),o,r+i,c,a+t);else if(T){let I=jn.getPrimitive();Zt(t,m,I),I.applyMatrix4(e);let v=be(i),b=Ae(i,_);Zt(v,p,hs),Zt(b,p,fs);let R=I.intersectsBox(hs),P=I.intersectsBox(fs);S=R&&hn(t,v,n,e,s,a,r,c,o+1,I,!u)||P&&hn(t,b,n,e,s,a,r,c,o+1,I,!u),jn.releasePrimitive(I)}else{let I=be(t),v=Ae(t,f);Zt(I,m,mc),Zt(v,m,gc);let b=l.intersectsBox(mc),R=l.intersectsBox(gc);if(b&&R)S=hn(i,I,e,n,s,r,a,o,c+1,l,u)||hn(i,v,e,n,s,r,a,o,c+1,l,u);else if(b)if(A)S=hn(i,I,e,n,s,r,a,o,c+1,l,u);else{let P=jn.getPrimitive();P.copy(mc).applyMatrix4(e);let F=be(i),L=Ae(i,_);Zt(F,p,hs),Zt(L,p,fs);let U=P.intersectsBox(hs),B=P.intersectsBox(fs);S=U&&hn(I,F,n,e,s,a,r,c,o+1,P,!u)||B&&hn(I,L,n,e,s,a,r,c,o+1,P,!u),jn.releasePrimitive(P)}else if(R)if(A)S=hn(i,v,e,n,s,r,a,o,c+1,l,u);else{let P=jn.getPrimitive();P.copy(gc).applyMatrix4(e);let F=be(i),L=Ae(i,_);Zt(F,p,hs),Zt(L,p,fs);let U=P.intersectsBox(hs),B=P.intersectsBox(fs);S=U&&hn(v,F,n,e,s,a,r,c,o+1,P,!u)||B&&hn(v,L,n,e,s,a,r,c,o+1,P,!u),jn.releasePrimitive(P)}}return S}var io=new ue,Eh=new le,k0={strategy:0,maxDepth:40,maxLeafTris:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null},Bs=class i{static serialize(t,e={}){e={cloneBuffers:!0,...e};let n=t.geometry,s=t._roots,r=t._indirectBuffer,a=n.getIndex(),o;return e.cloneBuffers?o={roots:s.map(c=>c.slice()),index:a?a.array.slice():null,indirectBuffer:r?r.slice():null}:o={roots:s,index:a?a.array:null,indirectBuffer:r},o}static deserialize(t,e,n={}){n={setIndex:!0,indirect:!!t.indirectBuffer,...n};let{index:s,roots:r,indirectBuffer:a}=t,o=new i(e,{...n,[Br]:!0});if(o._roots=r,o._indirectBuffer=a||null,n.setIndex){let c=e.getIndex();if(c===null){let l=new ie(t.index,1,!1);e.setIndex(l)}else c.array!==s&&(c.array.set(s),c.needsUpdate=!0)}return o}get indirect(){return!!this._indirectBuffer}constructor(t,e={}){if(t.isBufferGeometry){if(t.index&&t.index.isInterleavedBufferAttribute)throw new Error("MeshBVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("MeshBVH: Only BufferGeometries are supported.");if(e=Object.assign({...k0,[Br]:!1},e),e.useSharedArrayBuffer&&!Ah())throw new Error("MeshBVH: SharedArrayBuffer is not available.");this.geometry=t,this._roots=null,this._indirectBuffer=null,e[Br]||(Qu(this,e),!t.boundingBox&&e.setBoundingBox&&(t.boundingBox=this.getBoundingBox(new le))),this.resolveTriangleIndex=e.indirect?n=>this._indirectBuffer[n]:n=>n}refit(t=null){return(this.indirect?xh:lh)(this,t)}traverse(t,e=0){let n=this._roots[e],s=new Uint32Array(n),r=new Uint16Array(n);a(0);function a(o,c=0){let l=o*2,u=r[l+15]===65535;if(u){let d=s[o+6],h=r[l+14];t(c,u,new Float32Array(n,o*4,6),d,h)}else{let d=o+32/4,h=s[o+6],p=s[o+7];t(c,u,new Float32Array(n,o*4,6),p)||(a(d,c+1),a(h,c+1))}}}raycast(t,e=cn,n=0,s=1/0){let r=this._roots,a=this.geometry,o=[],c=e.isMaterial,l=Array.isArray(e),u=a.groups,d=c?e.side:e,h=this.indirect?yh:dh;for(let p=0,_=r.length;p<_;p++){let x=l?e[u[p].materialIndex].side:d,m=o.length;if(h(this,p,x,t,o,n,s),l){let f=u[p].materialIndex;for(let y=m,g=o.length;y<g;y++)o[y].face.materialIndex=f}}return o}raycastFirst(t,e=cn,n=0,s=1/0){let r=this._roots,a=this.geometry,o=e.isMaterial,c=Array.isArray(e),l=null,u=a.groups,d=o?e.side:e,h=this.indirect?vh:ph;for(let p=0,_=r.length;p<_;p++){let x=c?e[u[p].materialIndex].side:d,m=h(this,p,x,t,n,s);m!=null&&(l==null||m.distance<l.distance)&&(l=m,c&&(m.face.materialIndex=u[p].materialIndex))}return l}intersectsGeometry(t,e){let n=!1,s=this._roots,r=this.indirect?Sh:gh;for(let a=0,o=s.length;a<o&&(n=r(this,a,t,e),!n);a++);return n}shapecast(t){let e=Oe.getPrimitive(),n=this.indirect?fh:ch,{boundsTraverseOrder:s,intersectsBounds:r,intersectsRange:a,intersectsTriangle:o}=t;if(a&&o){let d=a;a=(h,p,_,x,m)=>d(h,p,_,x,m)?!0:n(h,p,this,o,_,x,e)}else a||(o?a=(d,h,p,_)=>n(d,h,this,o,p,_,e):a=(d,h,p)=>p);let c=!1,l=0,u=this._roots;for(let d=0,h=u.length;d<h;d++){let p=u[d];if(c=eh(this,d,r,a,s,l),c)break;l+=p.byteLength}return Oe.releasePrimitive(e),c}bvhcast(t,e,n){let{intersectsRanges:s,intersectsTriangles:r}=n,a=Oe.getPrimitive(),o=this.geometry.index,c=this.geometry.attributes.position,l=this.indirect?_=>{let x=this.resolveTriangleIndex(_);Jt(a,x*3,o,c)}:_=>{Jt(a,_*3,o,c)},u=Oe.getPrimitive(),d=t.geometry.index,h=t.geometry.attributes.position,p=t.indirect?_=>{let x=t.resolveTriangleIndex(_);Jt(u,x*3,d,h)}:_=>{Jt(u,_*3,d,h)};if(r){let _=(x,m,f,y,g,M,A,T)=>{for(let S=f,I=f+y;S<I;S++){p(S),u.a.applyMatrix4(e),u.b.applyMatrix4(e),u.c.applyMatrix4(e),u.needsUpdate=!0;for(let v=x,b=x+m;v<b;v++)if(l(v),a.needsUpdate=!0,r(a,u,v,S,g,M,A,T))return!0}return!1};if(s){let x=s;s=function(m,f,y,g,M,A,T,S){return x(m,f,y,g,M,A,T,S)?!0:_(m,f,y,g,M,A,T,S)}}else s=_}return Th(this,t,e,s)}intersectsBox(t,e){return io.set(t.min,t.max,e),io.needsUpdate=!0,this.shapecast({intersectsBounds:n=>io.intersectsBox(n),intersectsTriangle:n=>io.intersectsTriangle(n)})}intersectsSphere(t){return this.shapecast({intersectsBounds:e=>t.intersectsBox(e),intersectsTriangle:e=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,n={},s={},r=0,a=1/0){return(this.indirect?bh:_h)(this,t,e,n,s,r,a)}closestPointToPoint(t,e={},n=0,s=1/0){return nh(this,t,e,n,s)}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach(n=>{Zt(0,new Float32Array(n),Eh),t.union(Eh)}),t}};var wh=`

// A stack of uint32 indices can can store the indices for
// a perfectly balanced tree with a depth up to 31. Lower stack
// depth gets higher performance.
//
// However not all trees are balanced. Best value to set this to
// is the trees max depth.
#ifndef BVH_STACK_DEPTH
#define BVH_STACK_DEPTH 60
#endif

#ifndef INFINITY
#define INFINITY 1e20
#endif

// Utilities
uvec4 uTexelFetch1D( usampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

ivec4 iTexelFetch1D( isampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 texelFetch1D( sampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 textureSampleBarycoord( sampler2D tex, vec3 barycoord, uvec3 faceIndices ) {

	return
		barycoord.x * texelFetch1D( tex, faceIndices.x ) +
		barycoord.y * texelFetch1D( tex, faceIndices.y ) +
		barycoord.z * texelFetch1D( tex, faceIndices.z );

}

void ndcToCameraRay(
	vec2 coord, mat4 cameraWorld, mat4 invProjectionMatrix,
	out vec3 rayOrigin, out vec3 rayDirection
) {

	// get camera look direction and near plane for camera clipping
	vec4 lookDirection = cameraWorld * vec4( 0.0, 0.0, - 1.0, 0.0 );
	vec4 nearVector = invProjectionMatrix * vec4( 0.0, 0.0, - 1.0, 1.0 );
	float near = abs( nearVector.z / nearVector.w );

	// get the camera direction and position from camera matrices
	vec4 origin = cameraWorld * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 direction = invProjectionMatrix * vec4( coord, 0.5, 1.0 );
	direction /= direction.w;
	direction = cameraWorld * direction - origin;

	// slide the origin along the ray until it sits at the near clip plane position
	origin.xyz += direction.xyz * near / dot( direction, lookDirection );

	rayOrigin = origin.xyz;
	rayDirection = direction.xyz;

}
`;var Rh=`

#ifndef TRI_INTERSECT_EPSILON
#define TRI_INTERSECT_EPSILON 1e-5
#endif

// Raycasting
bool intersectsBounds( vec3 rayOrigin, vec3 rayDirection, vec3 boundsMin, vec3 boundsMax, out float dist ) {

	// https://www.reddit.com/r/opengl/comments/8ntzz5/fast_glsl_ray_box_intersection/
	// https://tavianator.com/2011/ray_box.html
	vec3 invDir = 1.0 / rayDirection;

	// find intersection distances for each plane
	vec3 tMinPlane = invDir * ( boundsMin - rayOrigin );
	vec3 tMaxPlane = invDir * ( boundsMax - rayOrigin );

	// get the min and max distances from each intersection
	vec3 tMinHit = min( tMaxPlane, tMinPlane );
	vec3 tMaxHit = max( tMaxPlane, tMinPlane );

	// get the furthest hit distance
	vec2 t = max( tMinHit.xx, tMinHit.yz );
	float t0 = max( t.x, t.y );

	// get the minimum hit distance
	t = min( tMaxHit.xx, tMaxHit.yz );
	float t1 = min( t.x, t.y );

	// set distance to 0.0 if the ray starts inside the box
	dist = max( t0, 0.0 );

	return t1 >= dist;

}

bool intersectsTriangle(
	vec3 rayOrigin, vec3 rayDirection, vec3 a, vec3 b, vec3 c,
	out vec3 barycoord, out vec3 norm, out float dist, out float side
) {

	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	vec3 edge1 = b - a;
	vec3 edge2 = c - a;
	norm = cross( edge1, edge2 );

	float det = - dot( rayDirection, norm );
	float invdet = 1.0 / det;

	vec3 AO = rayOrigin - a;
	vec3 DAO = cross( AO, rayDirection );

	vec4 uvt;
	uvt.x = dot( edge2, DAO ) * invdet;
	uvt.y = - dot( edge1, DAO ) * invdet;
	uvt.z = dot( AO, norm ) * invdet;
	uvt.w = 1.0 - uvt.x - uvt.y;

	// set the hit information
	barycoord = uvt.wxy; // arranged in A, B, C order
	dist = uvt.z;
	side = sign( det );
	norm = side * normalize( norm );

	// add an epsilon to avoid misses between triangles
	uvt += vec4( TRI_INTERSECT_EPSILON );

	return all( greaterThanEqual( uvt, vec4( 0.0 ) ) );

}

bool intersectTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// outputs
	inout float minDistance, inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	bool found = false;
	vec3 localBarycoord, localNormal;
	float localDist, localSide;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		if (
			intersectsTriangle( rayOrigin, rayDirection, a, b, c, localBarycoord, localNormal, localDist, localSide )
			&& localDist < minDistance
		) {

			found = true;
			minDistance = localDist;

			faceIndices = uvec4( indices.xyz, i );
			faceNormal = localNormal;

			side = localSide;
			barycoord = localBarycoord;
			dist = localDist;

		}

	}

	return found;

}

bool intersectsBVHNodeBounds( vec3 rayOrigin, vec3 rayDirection, sampler2D bvhBounds, uint currNodeIndex, out float dist ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return intersectsBounds( rayOrigin, rayDirection, boundsMin, boundsMax, dist );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhIntersectFirstHit(		bvh,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)	_bvhIntersectFirstHit(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)

bool _bvhIntersectFirstHit(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// output variables split into separate variables due to output precision
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int ptr = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float triangleDistance = INFINITY;
	bool found = false;
	while ( ptr > - 1 && ptr < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ ptr ];
		ptr --;

		// check if we intersect the current bounds
		float boundsHitDistance;
		if (
			! intersectsBVHNodeBounds( rayOrigin, rayDirection, bvh_bvhBounds, currNodeIndex, boundsHitDistance )
			|| boundsHitDistance > triangleDistance
		) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );

		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;

			found = intersectTriangles(
				bvh_position, bvh_index, offset, count,
				rayOrigin, rayDirection, triangleDistance,
				faceIndices, faceNormal, barycoord, side, dist
			) || found;

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = boundsInfo.y;

			bool leftToRight = rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			ptr ++;
			stack[ ptr ] = c2;

			ptr ++;
			stack[ ptr ] = c1;

		}

	}

	return found;

}
`;var cM=`
	${wh}
	${Rh}
`;var Ch=Math.pow(10,-Math.log10(1e-6)),H0=5e-7*Ch;function fn(i){return~~(i*Ch+H0)}function Ph(i){return`${fn(i.x)},${fn(i.y)}`}function xc(i){return`${fn(i.x)},${fn(i.y)},${fn(i.z)}`}function Ih(i){return`${fn(i.x)},${fn(i.y)},${fn(i.z)},${fn(i.w)}`}function Lh(i,t,e){e.direction.subVectors(t,i).normalize();let n=i.dot(e.direction);return e.origin.copy(i).addScaledVector(e.direction,-n),e}function so(){return typeof SharedArrayBuffer<"u"}function Dh(i){if(i.buffer instanceof SharedArrayBuffer)return i;let t=i.constructor,e=i.buffer,n=new SharedArrayBuffer(e.byteLength),s=new Uint8Array(e);return new Uint8Array(n).set(s,0),new t(n)}function G0(i,t=ArrayBuffer){return i>65535?new Uint32Array(new t(4*i)):new Uint16Array(new t(2*i))}function Uh(i,t){if(!i.index){let e=i.attributes.position.count,n=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,s=G0(e,n);i.setIndex(new ie(s,1));for(let r=0;r<e;r++)s[r]=r}}function W0(i){return i.index?i.index.count:i.attributes.position.count}function ds(i){return W0(i)/3}var X0=1e-8,q0=new D;function Fh(i){return~~(i/3)}function Oh(i){return i%3}function Nh(i,t){return i.start-t.start}function yc(i,t){return q0.subVectors(t,i.origin).dot(i.direction)}function Bh(i,t,e,n=X0){i.sort(Nh),t.sort(Nh);for(let o=0;o<i.length;o++){let c=i[o];for(let l=0;l<t.length;l++){let u=t[l];if(!(u.start>c.end)){if(c.end<u.start||u.end<c.start)continue;if(c.start<=u.start&&c.end>=u.end)r(u.end,c.end)||i.splice(o+1,0,{start:u.end,end:c.end,index:c.index}),c.end=u.start,u.start=0,u.end=0;else if(c.start>=u.start&&c.end<=u.end)r(c.end,u.end)||t.splice(l+1,0,{start:c.end,end:u.end,index:u.index}),u.end=c.start,c.start=0,c.end=0;else if(c.start<=u.start&&c.end<=u.end){let d=c.end;c.end=u.start,u.start=d}else if(c.start>=u.start&&c.end>=u.end){let d=u.end;u.end=c.start,c.start=d}else throw new Error}if(e.has(c.index)||e.set(c.index,[]),e.has(u.index)||e.set(u.index,[]),e.get(c.index).push(u.index),e.get(u.index).push(c.index),a(u)&&(t.splice(l,1),l--),a(c)){i.splice(o,1),o--;break}}}s(i),s(t);function s(o){for(let c=0;c<o.length;c++)a(o[c])&&(o.splice(c,1),c--)}function r(o,c){return Math.abs(c-o)<n}function a(o){return Math.abs(o.end-o.start)<n}}var ro=class{constructor(){this._rays=[]}addRay(t){this._rays.push(t)}findClosestRay(t){let e=this._rays,n=t.clone();n.direction.multiplyScalar(-1);let s=1/0,r=null;for(let c=0,l=e.length;c<l;c++){let u=e[c];if(a(u,t)&&a(u,n))continue;let d=o(u,t),h=o(u,n),p=Math.min(d,h);p<s&&(s=p,r=u)}return r;function a(c,l){let u=c.origin.distanceTo(l.origin)>1e-5;return c.direction.angleTo(l.direction)>1e-4||u}function o(c,l){let u=c.origin.distanceTo(l.origin),d=c.direction.angleTo(l.direction);return u/1e-5+d/1e-4}}};var vc=new D,Mc=new D,oo=new mi;function zh(i,t,e){let n=i.attributes,s=i.index,r=n.position,a=new Map,o=new Map,c=Array.from(t),l=new ro;for(let u=0,d=c.length;u<d;u++){let h=c[u],p=Fh(h),_=Oh(h),x=3*p+_,m=3*p+(_+1)%3;s&&(x=s.getX(x),m=s.getX(m)),vc.fromBufferAttribute(r,x),Mc.fromBufferAttribute(r,m),Lh(vc,Mc,oo);let f,y=l.findClosestRay(oo);y===null&&(y=oo.clone(),l.addRay(y)),o.has(y)||o.set(y,{forward:[],reverse:[],ray:y}),f=o.get(y);let g=yc(y,vc),M=yc(y,Mc);g>M&&([g,M]=[M,g]),oo.direction.dot(y.direction)<0?f.reverse.push({start:g,end:M,index:h}):f.forward.push({start:g,end:M,index:h})}return o.forEach(({forward:u,reverse:d},h)=>{Bh(u,d,a,e),u.length===0&&d.length===0&&o.delete(h)}),{disjointConnectivityMap:a,fragmentMap:o}}var Y0=new Ct,Sc=new D,Z0=new Qt,bc=["","",""],ao=class{constructor(t=null){this.data=null,this.disjointConnections=null,this.unmatchedDisjointEdges=null,this.unmatchedEdges=-1,this.matchedEdges=-1,this.useDrawRange=!0,this.useAllAttributes=!1,this.matchDisjointEdges=!1,this.degenerateEpsilon=1e-8,t&&this.updateFrom(t)}getSiblingTriangleIndex(t,e){let n=this.data[t*3+e];return n===-1?-1:~~(n/3)}getSiblingEdgeIndex(t,e){let n=this.data[t*3+e];return n===-1?-1:n%3}getDisjointSiblingTriangleIndices(t,e){let n=t*3+e,s=this.disjointConnections.get(n);return s?s.map(r=>~~(r/3)):[]}getDisjointSiblingEdgeIndices(t,e){let n=t*3+e,s=this.disjointConnections.get(n);return s?s.map(r=>r%3):[]}isFullyConnected(){return this.unmatchedEdges===0}updateFrom(t){let{useAllAttributes:e,useDrawRange:n,matchDisjointEdges:s,degenerateEpsilon:r}=this,a=e?g:y,o=new Map,{attributes:c}=t,l=e?Object.keys(c):null,u=t.index,d=c.position,h=ds(t),p=h,_=0;n&&(_=t.drawRange.start,t.drawRange.count!==1/0&&(h=~~(t.drawRange.count/3)));let x=this.data;(!x||x.length<3*p)&&(x=new Int32Array(3*p)),x.fill(-1);let m=0,f=new Set;for(let M=_,A=h*3+_;M<A;M+=3){let T=M;for(let S=0;S<3;S++){let I=T+S;u&&(I=u.getX(I)),bc[S]=a(I)}for(let S=0;S<3;S++){let I=(S+1)%3,v=bc[S],b=bc[I],R=`${b}_${v}`;if(o.has(R)){let P=T+S,F=o.get(R);x[P]=F,x[F]=P,o.delete(R),m+=2,f.delete(F)}else{let P=`${v}_${b}`,F=T+S;o.set(P,F),f.add(F)}}}if(s){let{fragmentMap:M,disjointConnectivityMap:A}=zh(t,f,r);f.clear(),M.forEach(({forward:T,reverse:S})=>{T.forEach(({index:I})=>f.add(I)),S.forEach(({index:I})=>f.add(I))}),this.unmatchedDisjointEdges=M,this.disjointConnections=A,m=h*3-f.size}this.matchedEdges=m,this.unmatchedEdges=f.size,this.data=x;function y(M){return Sc.fromBufferAttribute(d,M),xc(Sc)}function g(M){let A="";for(let T=0,S=l.length;T<S;T++){let I=c[l[T]],v;switch(I.itemSize){case 1:v=fn(I.getX(M));break;case 2:v=Ph(Y0.fromBufferAttribute(I,M));break;case 3:v=xc(Sc.fromBufferAttribute(I,M));break;case 4:v=Ih(Z0.fromBufferAttribute(I,M));break}A!==""&&(A+="|"),A+=v}return A}}};var Qn=class extends je{constructor(...t){super(...t),this.isBrush=!0,this._previousMatrix=new kt,this._previousMatrix.elements.fill(0)}markUpdated(){this._previousMatrix.copy(this.matrix)}isDirty(){let{matrix:t,_previousMatrix:e}=this,n=t.elements,s=e.elements;for(let r=0;r<16;r++)if(n[r]!==s[r])return!0;return!1}prepareGeometry(){let t=this.geometry,e=t.attributes,n=so();if(n)for(let s in e){let r=e[s];if(r.isInterleavedBufferAttribute)throw new Error("Brush: InterleavedBufferAttributes are not supported.");r.array=Dh(r.array)}if(t.boundsTree||(Uh(t,{useSharedArrayBuffer:n}),t.boundsTree=new Bs(t,{maxLeafTris:3,indirect:!0,useSharedArrayBuffer:n})),t.halfEdges||(t.halfEdges=new ao(t)),!t.groupIndices){let s=ds(t),r=new Uint16Array(s),a=t.groups;for(let o=0,c=a.length;o<c;o++){let{start:l,count:u}=a[o];for(let d=l/3,h=(l+u)/3;d<h;d++)r[d]=o}t.groupIndices=r}}disposeCacheData(){let{geometry:t}=this;t.halfEdges=null,t.boundsTree=null,t.groupIndices=null}};var J0=1e-14,Ac=new D,kh=new D,Vh=new D;function dn(i,t=J0){Ac.subVectors(i.b,i.a),kh.subVectors(i.c,i.a),Vh.subVectors(i.b,i.c);let e=Ac.angleTo(kh),n=Ac.angleTo(Vh),s=Math.PI-e-n;return Math.abs(e)<t||Math.abs(n)<t||Math.abs(s)<t||i.a.distanceToSquared(i.b)<t||i.a.distanceToSquared(i.c)<t||i.b.distanceToSquared(i.c)<t}var Tc=1e-10,zs=1e-10,$0=1e-10,Un=new xe,de=new xe,Nn=new D,Ec=new D,Hh=new D,co=new Fe,wc=new ye,Rc=class{constructor(){this._pool=[],this._index=0}getTriangle(){return this._index>=this._pool.length&&this._pool.push(new ee),this._pool[this._index++]}clear(){this._index=0}reset(){this._pool.length=0,this._index=0}},lo=class{constructor(){this.trianglePool=new Rc,this.triangles=[],this.normal=new D,this.coplanarTriangleUsed=!1}initialize(t){this.reset();let{triangles:e,trianglePool:n,normal:s}=this;if(Array.isArray(t))for(let r=0,a=t.length;r<a;r++){let o=t[r];if(r===0)o.getNormal(s);else if(Math.abs(1-o.getNormal(Nn).dot(s))>Tc)throw new Error("Triangle Splitter: Cannot initialize with triangles that have different normals.");let c=n.getTriangle();c.copy(o),e.push(c)}else{t.getNormal(s);let r=n.getTriangle();r.copy(t),e.push(r)}}splitByTriangle(t){let{normal:e,triangles:n}=this;if(t.getNormal(Ec).normalize(),Math.abs(1-Math.abs(Ec.dot(e)))<$0){this.coplanarTriangleUsed=!0;for(let r=0,a=n.length;r<a;r++){let o=n[r];o.coplanarCount=0}let s=[t.a,t.b,t.c];for(let r=0;r<3;r++){let a=(r+1)%3,o=s[r],c=s[a];Nn.subVectors(c,o).normalize(),Hh.crossVectors(Ec,Nn),co.setFromNormalAndCoplanarPoint(Hh,o),this.splitByPlane(co,t)}}else t.getPlane(co),this.splitByPlane(co,t)}splitByPlane(t,e){let{triangles:n,trianglePool:s}=this;wc.copy(e),wc.needsUpdate=!0;for(let r=0,a=n.length;r<a;r++){let o=n[r];if(!wc.intersectsTriangle(o,Un,!0))continue;let{a:c,b:l,c:u}=o,d=0,h=-1,p=!1,_=[],x=[],m=[c,l,u];for(let f=0;f<3;f++){let y=(f+1)%3;Un.start.copy(m[f]),Un.end.copy(m[y]);let g=t.distanceToPoint(Un.start),M=t.distanceToPoint(Un.end);if(Math.abs(g)<zs&&Math.abs(M)<zs){p=!0;break}if(g>0?_.push(f):x.push(f),Math.abs(g)<zs)continue;let A=!!t.intersectLine(Un,Nn);!A&&Math.abs(M)<zs&&(Nn.copy(Un.end),A=!0),A&&!(Nn.distanceTo(Un.start)<Tc)&&(Nn.distanceTo(Un.end)<Tc&&(h=f),d===0?de.start.copy(Nn):de.end.copy(Nn),d++)}if(!p&&d===2&&de.distance()>zs)if(h!==-1){h=(h+1)%3;let f=0;f===h&&(f=(f+1)%3);let y=f+1;y===h&&(y=(y+1)%3);let g=s.getTriangle();g.a.copy(m[y]),g.b.copy(de.end),g.c.copy(de.start),dn(g)||n.push(g),o.a.copy(m[f]),o.b.copy(de.start),o.c.copy(de.end),dn(o)&&(n.splice(r,1),r--,a--)}else{let f=_.length>=2?x[0]:_[0];if(f===0){let T=de.start;de.start=de.end,de.end=T}let y=(f+1)%3,g=(f+2)%3,M=s.getTriangle(),A=s.getTriangle();m[y].distanceToSquared(de.start)<m[g].distanceToSquared(de.end)?(M.a.copy(m[y]),M.b.copy(de.start),M.c.copy(de.end),A.a.copy(m[y]),A.b.copy(m[g]),A.c.copy(de.start)):(M.a.copy(m[g]),M.b.copy(de.start),M.c.copy(de.end),A.a.copy(m[y]),A.b.copy(m[g]),A.c.copy(de.end)),o.a.copy(m[f]),o.b.copy(de.end),o.c.copy(de.start),dn(M)||n.push(M),dn(A)||n.push(A),dn(o)&&(n.splice(r,1),r--,a--)}else d===3&&console.warn("TriangleClipper: Coplanar clip not handled")}}reset(){this.triangles.length=0,this.trianglePool.clear(),this.coplanarTriangleUsed=!1}};function K0(i){return i=~~i,i+4-i%4}var ks=class{constructor(t,e=500){this.expansionFactor=1.5,this.type=t,this.length=0,this.array=null,this.setSize(e)}setType(t){if(this.length!==0)throw new Error("TypeBackedArray: Cannot change the type while there is used data in the buffer.");let e=this.array.buffer;this.array=new t(e),this.type=t}setSize(t){if(this.array&&t===this.array.length)return;let e=this.type,n=so()?SharedArrayBuffer:ArrayBuffer,s=new e(new n(K0(t*e.BYTES_PER_ELEMENT)));this.array&&s.set(this.array,0),this.array=s}expand(){let{array:t,expansionFactor:e}=this;this.setSize(t.length*e)}push(...t){let{array:e,length:n}=this;n+t.length>e.length&&(this.expand(),e=this.array);for(let s=0,r=t.length;s<r;s++)e[n+s]=t[s];this.length+=t.length}clear(){this.length=0}};var uo=class{constructor(){this.groupAttributes=[{}],this.groupCount=0}getType(t){return this.groupAttributes[0][t].type}getItemSize(t){return this.groupAttributes[0][t].itemSize}getNormalized(t){return this.groupAttributes[0][t].normalized}getCount(t){if(this.groupCount<=t)return 0;let e=this.getGroupAttrArray("position",t);return e.length/e.itemSize}getTotalLength(t){let{groupCount:e,groupAttributes:n}=this,s=0;for(let r=0;r<e;r++){let a=n[r];s+=a[t].length}return s}getGroupAttrSet(t=0){let{groupAttributes:e}=this;if(e[t])return this.groupCount=Math.max(this.groupCount,t+1),e[t];let n=e[0];for(this.groupCount=Math.max(this.groupCount,t+1);t>=e.length;){let s={};e.push(s);for(let r in n){let a=n[r],o=new ks(a.type);o.itemSize=a.itemSize,o.normalized=a.normalized,s[r]=o}}return e[t]}getGroupAttrArray(t,e=0){let{groupAttributes:n}=this;if(!n[0][t])throw new Error(`TypedAttributeData: Attribute with "${t}" has not been initialized`);return this.getGroupAttrSet(e)[t]}initializeArray(t,e,n,s){let{groupAttributes:r}=this,o=r[0][t];if(o){if(o.type!==e)for(let c=0,l=r.length;c<l;c++){let u=r[c][t];u.setType(e),u.itemSize=n,u.normalized=s}}else for(let c=0,l=r.length;c<l;c++){let u=new ks(e);u.itemSize=n,u.normalized=s,r[c][t]=u}}clear(){this.groupCount=0;let{groupAttributes:t}=this;t.forEach(e=>{for(let n in e)e[n].clear()})}delete(t){this.groupAttributes.forEach(e=>{delete e[t]})}reset(){this.groupAttributes=[],this.groupCount=0}};var Vs=class{constructor(){this.intersectionSet={},this.ids=[]}add(t,e){let{intersectionSet:n,ids:s}=this;n[t]||(n[t]=[],s.push(t)),n[t].push(e)}};var en=new mi,Gh=new kt,Be=new ee,Fn=new D,Wh=new Qt,Xh=new Qt,qh=new Qt,Cc=new Qt,ho=new Qt,fo=new Qt,Yh=new xe,Pc=new D,Ic=1e-8,tx=1e-15,vi=-1,Mi=1,po=-2,mo=2,ps=0,yi=1,_o=2,ex=1e-14,go=null;function Uc(i){go=i}function Nc(i,t){i.getMidpoint(en.origin),i.getNormal(en.direction);let e=t.raycastFirst(en,ke);return!!(e&&en.direction.dot(e.face.normal)>0)?vi:Mi}function Jh(i,t){function e(){return Math.random()-.5}i.getNormal(Pc),en.direction.copy(Pc),i.getMidpoint(en.origin);let n=3,s=0,r=1/0;for(let a=0;a<n;a++){en.direction.x+=e()*Ic,en.direction.y+=e()*Ic,en.direction.z+=e()*Ic,en.direction.multiplyScalar(-1);let o=t.raycastFirst(en,ke);if(!!(o&&en.direction.dot(o.face.normal)>0)&&s++,o!==null&&(r=Math.min(r,o.distance)),r<=tx)return o.face.normal.dot(Pc)>0?mo:po;if(s/n>.5||(a-s+1)/n>.5)break}return s/n>.5?vi:Mi}function $h(i,t){let e=new Vs,n=new Vs;return Gh.copy(i.matrixWorld).invert().multiply(t.matrixWorld),i.geometry.boundsTree.bvhcast(t.geometry.boundsTree,Gh,{intersectsTriangles(s,r,a,o){if(!dn(s)&&!dn(r)){let c=s.intersectsTriangle(r,Yh,!0);if(!c){let l=s.plane,u=r.plane,d=l.normal,h=u.normal;d.dot(h)===1&&Math.abs(l.constant-u.constant)<ex&&(c=!0)}if(c){let l=i.geometry.boundsTree.resolveTriangleIndex(a),u=t.geometry.boundsTree.resolveTriangleIndex(o);e.add(l,u),n.add(u,l),go&&(go.addEdge(Yh),go.addIntersectingTriangles(a,s,o,r))}}return!1}}),{aIntersections:e,bIntersections:n}}function Kh(i,t,e,n,s,r,a=!1){let o=e.attributes,c=e.index,l=i*3,u=c.getX(l+0),d=c.getX(l+1),h=c.getX(l+2);for(let p in r){let _=o[p],x=r[p];if(!(p in o))throw new Error(`CSG Operations: Attribute ${p} not available on geometry.`);let m=_.itemSize;p==="position"?(Be.a.fromBufferAttribute(_,u).applyMatrix4(n),Be.b.fromBufferAttribute(_,d).applyMatrix4(n),Be.c.fromBufferAttribute(_,h).applyMatrix4(n),Lc(Be.a,Be.b,Be.c,t,3,x,a)):p==="normal"?(Be.a.fromBufferAttribute(_,u).applyNormalMatrix(s),Be.b.fromBufferAttribute(_,d).applyNormalMatrix(s),Be.c.fromBufferAttribute(_,h).applyNormalMatrix(s),a&&(Be.a.multiplyScalar(-1),Be.b.multiplyScalar(-1),Be.c.multiplyScalar(-1)),Lc(Be.a,Be.b,Be.c,t,3,x,a,!0)):(Wh.fromBufferAttribute(_,u),Xh.fromBufferAttribute(_,d),qh.fromBufferAttribute(_,h),Lc(Wh,Xh,qh,t,m,x,a))}}function jh(i,t,e,n,s,r,a,o=!1){Dc(i,n,s,r,a,o),Dc(o?e:t,n,s,r,a,o),Dc(o?t:e,n,s,r,a,o)}function Fc(i,t,e=!1){switch(i){case 0:if(t===Mi||t===mo&&!e)return yi;break;case 1:if(e){if(t===vi)return ps}else if(t===Mi||t===po)return yi;break;case 2:if(e){if(t===Mi||t===po)return yi}else if(t===vi)return ps;break;case 4:if(t===vi)return ps;if(t===Mi)return yi;break;case 3:if(t===vi||t===mo&&!e)return yi;break;case 5:if(!e&&(t===Mi||t===po))return yi;break;case 6:if(!e&&(t===vi||t===mo))return yi;break;default:throw new Error(`Unrecognized CSG operation enum "${i}".`)}return _o}function Lc(i,t,e,n,s,r,a=!1,o=!1){let c=l=>{r.push(l.x),s>1&&r.push(l.y),s>2&&r.push(l.z),s>3&&r.push(l.w)};Cc.set(0,0,0,0).addScaledVector(i,n.a.x).addScaledVector(t,n.a.y).addScaledVector(e,n.a.z),ho.set(0,0,0,0).addScaledVector(i,n.b.x).addScaledVector(t,n.b.y).addScaledVector(e,n.b.z),fo.set(0,0,0,0).addScaledVector(i,n.c.x).addScaledVector(t,n.c.y).addScaledVector(e,n.c.z),o&&(Cc.normalize(),ho.normalize(),fo.normalize()),c(Cc),a?(c(fo),c(ho)):(c(ho),c(fo))}function Dc(i,t,e,n,s,r=!1){for(let a in s){let o=t[a],c=s[a];if(!(a in t))throw new Error(`CSG Operations: Attribute ${a} no available on geometry.`);let l=o.itemSize;a==="position"?(Fn.fromBufferAttribute(o,i).applyMatrix4(e),c.push(Fn.x,Fn.y,Fn.z)):a==="normal"?(Fn.fromBufferAttribute(o,i).applyNormalMatrix(n),r&&Fn.multiplyScalar(-1),c.push(Fn.x,Fn.y,Fn.z)):(c.push(o.getX(i)),l>1&&c.push(o.getY(i)),l>2&&c.push(o.getZ(i)),l>3&&c.push(o.getW(i)))}}var Oc=class{constructor(t){this.triangle=new ee().copy(t),this.intersects={}}addTriangle(t,e){this.intersects[t]=new ee().copy(e)}getIntersectArray(){let t=[],{intersects:e}=this;for(let n in e)t.push(e[n]);return t}},xo=class{constructor(){this.data={}}addTriangleIntersection(t,e,n,s){let{data:r}=this;r[t]||(r[t]=new Oc(e)),r[t].addTriangle(n,s)}getTrianglesAsArray(t=null){let{data:e}=this,n=[];if(t!==null)t in e&&n.push(e[t].triangle);else for(let s in e)n.push(e[s].triangle);return n}getTriangleIndices(){return Object.keys(this.data).map(t=>parseInt(t))}getIntersectionIndices(t){let{data:e}=this;return e[t]?Object.keys(e[t].intersects).map(n=>parseInt(n)):[]}getIntersectionsAsArray(t=null,e=null){let{data:n}=this,s=new Set,r=[],a=o=>{if(n[o])if(e!==null)n[o].intersects[e]&&r.push(n[o].intersects[e]);else{let c=n[o].intersects;for(let l in c)s.has(l)||(s.add(l),r.push(c[l]))}};if(t!==null)a(t);else for(let o in n)a(o);return r}reset(){this.data={}}},yo=class{constructor(){this.enabled=!1,this.triangleIntersectsA=new xo,this.triangleIntersectsB=new xo,this.intersectionEdges=[]}addIntersectingTriangles(t,e,n,s){let{triangleIntersectsA:r,triangleIntersectsB:a}=this;r.addTriangleIntersection(t,e,n,s),a.addTriangleIntersection(n,s,t,e)}addEdge(t){this.intersectionEdges.push(t.clone())}reset(){this.triangleIntersectsA.reset(),this.triangleIntersectsB.reset(),this.intersectionEdges=[]}init(){this.enabled&&(this.reset(),Uc(this))}complete(){this.enabled&&Uc(null)}};var ei=new kt,So=new Dt,Si=new ee,vo=new ee,ti=new ee,Mo=new ee,pn=[],bi=[];function nx(i){for(let t of i)return t}function ef(i,t,e,n,s,r={}){let{useGroups:a=!0}=r,{aIntersections:o,bIntersections:c}=$h(i,t),l=[],u=null,d;return d=a?0:-1,Qh(i,t,o,e,!1,n,s,d),tf(i,t,o,e,!1,s,d),e.findIndex(p=>p!==6&&p!==5)!==-1&&(d=a?i.geometry.groups.length||1:-1,Qh(t,i,c,e,!0,n,s,d),tf(t,i,c,e,!0,s,d)),pn.length=0,bi.length=0,{groups:l,materials:u}}function Qh(i,t,e,n,s,r,a,o=0){let c=i.matrixWorld.determinant()<0;ei.copy(t.matrixWorld).invert().multiply(i.matrixWorld),So.getNormalMatrix(i.matrixWorld).multiplyScalar(c?-1:1);let l=i.geometry.groupIndices,u=i.geometry.index,d=i.geometry.attributes.position,h=t.geometry.boundsTree,p=t.geometry.index,_=t.geometry.attributes.position,x=e.ids,m=e.intersectionSet;for(let f=0,y=x.length;f<y;f++){let g=x[f],M=o===-1?0:l[g]+o,A=3*g,T=u.getX(A+0),S=u.getX(A+1),I=u.getX(A+2);Si.a.fromBufferAttribute(d,T).applyMatrix4(ei),Si.b.fromBufferAttribute(d,S).applyMatrix4(ei),Si.c.fromBufferAttribute(d,I).applyMatrix4(ei),r.reset(),r.initialize(Si);let v=m[g];for(let R=0,P=v.length;R<P;R++){let F=3*v[R],L=p.getX(F+0),U=p.getX(F+1),B=p.getX(F+2);vo.a.fromBufferAttribute(_,L),vo.b.fromBufferAttribute(_,U),vo.c.fromBufferAttribute(_,B),r.splitByTriangle(vo)}let b=r.triangles;for(let R=0,P=b.length;R<P;R++){let F=b[R],L=r.coplanarTriangleUsed?Jh(F,h):Nc(F,h);pn.length=0,bi.length=0;for(let U=0,B=n.length;U<B;U++){let Y=Fc(n[U],L,s);Y!==_o&&(bi.push(Y),pn.push(a[U].getGroupAttrSet(M)))}if(pn.length!==0){Si.getBarycoord(F.a,Mo.a),Si.getBarycoord(F.b,Mo.b),Si.getBarycoord(F.c,Mo.c);for(let U=0,B=pn.length;U<B;U++){let Y=pn[U],q=bi[U]===ps;Kh(g,Mo,i.geometry,i.matrixWorld,So,Y,c!==q)}}}}return x.length}function tf(i,t,e,n,s,r,a=0){let o=i.matrixWorld.determinant()<0;ei.copy(t.matrixWorld).invert().multiply(i.matrixWorld),So.getNormalMatrix(i.matrixWorld).multiplyScalar(o?-1:1);let c=t.geometry.boundsTree,l=i.geometry.groupIndices,u=i.geometry.index,d=i.geometry.attributes,h=d.position,p=[],_=i.geometry.halfEdges,x=new Set,m=ds(i.geometry);for(let f=0,y=m;f<y;f++)f in e.intersectionSet||x.add(f);for(;x.size>0;){let f=nx(x);x.delete(f),p.push(f);let y=3*f,g=u.getX(y+0),M=u.getX(y+1),A=u.getX(y+2);ti.a.fromBufferAttribute(h,g).applyMatrix4(ei),ti.b.fromBufferAttribute(h,M).applyMatrix4(ei),ti.c.fromBufferAttribute(h,A).applyMatrix4(ei);let T=Nc(ti,c);bi.length=0,pn.length=0;for(let S=0,I=n.length;S<I;S++){let v=Fc(n[S],T,s);v!==_o&&(bi.push(v),pn.push(r[S]))}for(;p.length>0;){let S=p.pop();for(let I=0;I<3;I++){let v=_.getSiblingTriangleIndex(S,I);v!==-1&&x.has(v)&&(p.push(v),x.delete(v))}if(pn.length!==0){let I=3*S,v=u.getX(I+0),b=u.getX(I+1),R=u.getX(I+2),P=a===-1?0:l[S]+a;if(ti.a.fromBufferAttribute(h,v),ti.b.fromBufferAttribute(h,b),ti.c.fromBufferAttribute(h,R),!dn(ti))for(let F=0,L=pn.length;F<L;F++){let U=bi[F],B=pn[F].getGroupAttrSet(P),Y=U===ps;jh(v,b,R,d,i.matrixWorld,So,B,Y!==o)}}}}}function ix(i){for(let t=0;t<i.length-1;t++){let e=i[t],n=i[t+1];if(e.materialIndex===n.materialIndex){let s=e.start,r=n.start+n.count;n.start=s,n.count=r-s,i.splice(t,1),t--}}}function sx(i,t,e,n){e.clear();let s=i.attributes;for(let r=0,a=n.length;r<a;r++){let o=n[r],c=s[o];e.initializeArray(o,c.array.constructor,c.itemSize,c.normalized)}for(let r in e.attributes)n.includes(r)||e.delete(r);for(let r in t.attributes)n.includes(r)||(t.deleteAttribute(r),t.dispose())}function rx(i,t,e){let n=!1,s=-1,r=i.attributes,a=t.groupAttributes[0];for(let c in a){let l=t.getTotalLength(c),u=t.getType(c),d=t.getItemSize(c),h=t.getNormalized(c),p=r[c];(!p||p.array.length<l)&&(p=new ie(new u(l),d,h),i.setAttribute(c,p),n=!0);let _=0;for(let x=0,m=Math.min(e.length,t.groupCount);x<m;x++){let f=e[x].index,{array:y,type:g,length:M}=t.groupAttributes[f][c],A=new g(y.buffer,0,M);p.array.set(A,_),_+=A.length}p.needsUpdate=!0,s=l/p.itemSize}if(i.index){let c=i.index.array;if(c.length<s)i.index=null,n=!0;else for(let l=0,u=c.length;l<u;l++)c[l]=l}let o=0;i.clearGroups();for(let c=0,l=Math.min(e.length,t.groupCount);c<l;c++){let{index:u,materialIndex:d}=e[c],h=t.getCount(u);h!==0&&(i.addGroup(o,h,d),o+=h)}i.setDrawRange(0,s),i.boundsTree=null,n&&i.dispose()}function nf(i,t){let e=t;return Array.isArray(t)||(e=[],i.forEach(n=>{e[n.materialIndex]=t})),e}var bo=class{constructor(){this.triangleSplitter=new lo,this.attributeData=[],this.attributes=["position","uv","normal"],this.useGroups=!0,this.consolidateGroups=!0,this.debug=new yo}getGroupRanges(t){return!this.useGroups||t.groups.length===0?[{start:0,count:1/0,materialIndex:0}]:t.groups.map(e=>({...e}))}evaluate(t,e,n,s=new Qn){let r=!0;if(Array.isArray(n)||(n=[n]),Array.isArray(s)||(s=[s],r=!1),s.length!==n.length)throw new Error("Evaluator: operations and target array passed as different sizes.");t.prepareGeometry(),e.prepareGeometry();let{triangleSplitter:a,attributeData:o,attributes:c,useGroups:l,consolidateGroups:u,debug:d}=this;for(;o.length<s.length;)o.push(new uo);s.forEach((f,y)=>{sx(t.geometry,f.geometry,o[y],c)}),d.init(),ef(t,e,n,a,o,{useGroups:l}),d.complete();let h=this.getGroupRanges(t.geometry),p=nf(h,t.material),_=this.getGroupRanges(e.geometry),x=nf(_,e.material);_.forEach(f=>f.materialIndex+=p.length);let m=[...h,..._].map((f,y)=>({...f,index:y}));if(l){let f=[...p,...x];u&&(m=m.map(g=>{let M=f[g.materialIndex];return g.materialIndex=f.indexOf(M),g}).sort((g,M)=>g.materialIndex-M.materialIndex));let y=[];for(let g=0,M=f.length;g<M;g++){let A=!1;for(let T=0,S=m.length;T<S;T++){let I=m[T];I.materialIndex===g&&(A=!0,I.materialIndex=y.length)}A&&y.push(f[g])}s.forEach(g=>{g.material=y})}else m=[{start:0,count:1/0,index:0,materialIndex:0}],s.forEach(f=>{f.material=p[0]});return s.forEach((f,y)=>{let g=f.geometry;rx(g,o[y],m),u&&ix(g.groups)}),r?s:s[0]}evaluateHierarchy(t,e=new Qn){t.updateMatrixWorld(!0);let n=(r,a)=>{let o=r.children;for(let c=0,l=o.length;c<l;c++){let u=o[c];u.isOperationGroup?n(u,a):a(u)}},s=r=>{let a=r.children,o=!1;for(let l=0,u=a.length;l<u;l++){let d=a[l];o=s(d)||o}let c=r.isDirty();if(c&&r.markUpdated(),o&&!r.isOperationGroup){let l;return n(r,u=>{l?l=this.evaluate(l,u,u.operation):l=this.evaluate(r,u,u.operation)}),r._cachedGeometry=l.geometry,r._cachedMaterials=l.material,!0}else return o||c};return s(t),e.geometry=t._cachedGeometry,e.material=t._cachedMaterials,e}reset(){this.triangleSplitter.reset()}};var Mn=["position","normal","_ao","_rim"],Ge={position:3,normal:3,_ao:1,_rim:1},rf=.005,He=16,ox=3e-5,Bc=2e-7,ax=.35,cx=6e-6,lx=3e-4,ux=new gi,Hc=new gi,Gc=new bo;Gc.attributes=Mn;Gc.useGroups=!0;var zc=[],vn=null,Yt=[],of=[],af=1,kc=new Map;self.onmessage=({data:i})=>{if(i.type==="init")zc=i.blocks,vn=i.grid,sf();else if(i.type==="reset")sf();else if(i.type==="cut"){let t=px(i),e=[];for(let n of t.changed)n.arrays&&e.push(...Object.values(n.arrays).map(s=>s.buffer));for(let n of t.pieces)e.push(...Object.values(n.arrays).map(s=>s.buffer));self.postMessage({type:"cut",gen:i.gen,...t},e)}};function sf(){let i=new Map;Yt=zc.map((t,e)=>{let n=t.index,s=n.length,r={};for(let a of Mn)r[a]=new Float32Array(s*Ge[a]);for(let a=0;a<s;a++){let o=n[a];for(let c=0;c<3;c++)r.position[a*3+c]=t.position[o*3+c],r.normal[a*3+c]=t.normal[o*3+c];r._ao[a]=t.ao[o]}return i.set(t.cell.join(","),e),Wc({a:r,n:s,skinN:t.skinCount},t.cell)}),of=zc.map(t=>[0,1,2].map(e=>{let n=t.cell.slice();return n[e]++,i.get(n.join(","))??-1})),af=Yt.reduce((t,e)=>t+e.vol,0),kc=new Map,self.postMessage({type:"ready",loose:cf().length})}function Wc(i,t){let e=new xn;for(let r of Mn)e.setAttribute(r,new ie(i.a[r],Ge[r]));e.addGroup(0,i.skinN,0),e.addGroup(i.skinN,i.n-i.skinN,1);let n=new Qn(e,[ux,Hc]);n.updateMatrixWorld(),e.computeBoundingBox();let s={soup:i,brush:n,box:e.boundingBox,cell:t,vol:yx(i)};return s.part=gx(s),s}function hx(i){let t=i.geometry,e=Array.isArray(i.material)?i.material:[i.material],n=[[],[]];for(let c of t.groups)n[e[c.materialIndex]===Hc?1:0].push([c.start,c.start+c.count]);let s=n.flat().reduce((c,[l,u])=>c+u-l,0),r={};for(let c of Mn)r[c]=new Float32Array(s*Ge[c]);let a=0,o=0;for(let c=0;c<2;c++){for(let[l,u]of n[c]){for(let d of Mn)r[d].set(t.attributes[d].array.subarray(l*Ge[d],u*Ge[d]),a*Ge[d]);a+=u-l}c===0&&(o=a)}return{a:r,n:s,skinN:o}}function fx(i){let t={};for(let e of Mn)t[e]=i.a[e].slice();return{arrays:t,skinN:i.skinN,n:i.n}}function dx({position:i,quaternion:t,scale:e}){let n=new Ur(1,1);n.deleteAttribute("uv");let s=n.attributes.position,r=new Map;for(let o=0;o<s.count;o++){let c=`${s.getX(o).toFixed(3)},${s.getY(o).toFixed(3)},${s.getZ(o).toFixed(3)}`;r.has(c)||r.set(c,.74+Math.random()*.42);let l=r.get(c);s.setXYZ(o,s.getX(o)*l,s.getY(o)*l,s.getZ(o)*l)}n.computeVertexNormals(),n.setAttribute("_ao",new ie(new Float32Array(s.count).fill(1),1)),n.setAttribute("_rim",new ie(new Float32Array(s.count),1));let a=new Qn(n,Hc);return a.position.fromArray(i),a.quaternion.fromArray(t),a.scale.fromArray(e),a.updateMatrixWorld(),n.computeBoundingBox(),{brush:a,bounds:n.boundingBox.clone().applyMatrix4(a.matrixWorld)}}function px(i){let t=new Set,e=new Set,n=null;for(let l of i.rocks){let{brush:u,bounds:d}=dx(l);n=n?n.union(d):d;for(let h=0;h<Yt.length;h++){let p=Yt[h];if(!p||!d.intersectsBox(p.box))continue;let _=p.brush.geometry;_.halfEdges||(_.halfEdges=vx(_));let x=Gc.evaluate(p.brush,u,1),m=hx(x);if(m.n===0){Yt[h]=null,e.add(h),t.delete(h);continue}Yt[h]=Wc(m,p.cell),t.add(h)}u.geometry.dispose()}let s=n.clone().expandByScalar(rf*1.5),r=[];for(let l=0;l<Yt.length;l++)Yt[l]&&s.intersectsBox(Yt[l].box)&&r.push(l);for(let l of mx([...t],r,s))t.add(l);let a=[];for(let l of cf()){let u=l.reduce((h,[p,_])=>h+Yt[p].part.vol[_],0),d=xx(l);u>=Bc&&d.n>=60&&a.push(d);for(let[h]of l)Yt[h]?t.add(h):(t.delete(h),e.add(h))}let o=[...e].map(l=>({id:l,gone:!0}));for(let l of t)Yt[l]&&o.push({id:l,...fx(Yt[l].soup)});let c=Yt.reduce((l,u)=>l+(u?u.vol:0),0)/af;return{changed:o,pieces:a,left:c}}function mx(i,t,e){let n=[],s=rf,r=new Map;for(let c of i){let{soup:l,part:u}=Yt[c],d=new Uint8Array(u.nIds),h=new Uint8Array(u.nIds);for(let _=0;_<l.n/3;_++){let x=_*3<l.skinN;if(!(!x&&u.wallOf[_]>=0))for(let m=0;m<3;m++)(x?d:h)[u.corner[_*3+m]]=1}let p=new Uint8Array(u.nIds);for(let _=0;_<l.n;_++){let x=u.corner[_];!d[x]||!h[x]||p[x]||(p[x]=1,n.push(l.a.position[_*3],l.a.position[_*3+1],l.a.position[_*3+2]))}}if(!n.length)return[];let a=(c,l,u)=>Math.imul(c,73856093)^Math.imul(l,19349663)^Math.imul(u,83492791)|0;for(let c=0;c<n.length;c+=3){let l=a(Math.floor(n[c]/s),Math.floor(n[c+1]/s),Math.floor(n[c+2]/s));r.has(l)||r.set(l,[]),r.get(l).push(c)}let o=[];for(let c of t){let{soup:l}=Yt[c],u=l.a.position,d=l.a._rim,h=!1,{min:p,max:_}=e;for(let x=0;x<l.skinN;x++){let m=u[x*3],f=u[x*3+1],y=u[x*3+2];if(m<p.x||m>_.x||f<p.y||f>_.y||y<p.z||y>_.z)continue;let g=Math.floor(m/s),M=Math.floor(f/s),A=Math.floor(y/s),T=s*s;for(let I=-1;I<=1;I++)for(let v=-1;v<=1;v++)for(let b=-1;b<=1;b++){let R=r.get(a(g+I,M+v,A+b));if(R)for(let P of R){let F=(n[P]-m)**2+(n[P+1]-f)**2+(n[P+2]-y)**2;F<T&&(T=F)}}if(T>=s*s)continue;let S=1-Math.sqrt(T)/s;S>d[x]&&(d[x]=S,h=!0)}h&&(Yt[c].brush.geometry.attributes._rim.needsUpdate=!0,o.push(c))}return o}function gx(i){let{soup:t,cell:e}=i,n=t.a.position,s=t.n/3,r=1;for(;r<t.n*2;)r<<=1;let a=new Int32Array(r),o=new Int32Array(r),c=new Int32Array(r),l=new Int32Array(r).fill(-1),u=new Int32Array(t.n),d=0;for(let R=0;R<t.n;R++){let P=Math.round(n[R*3]*1e5),F=Math.round(n[R*3+1]*1e5),L=Math.round(n[R*3+2]*1e5),U=(Math.imul(P,73856093)^Math.imul(F,19349663)^Math.imul(L,83492791))&r-1;for(;l[U]!==-1&&(a[U]!==P||o[U]!==F||c[U]!==L);)U=U+1&r-1;l[U]===-1&&(l[U]=d++,a[U]=P,o[U]=F,c[U]=L),u[R]=l[U]}let h=new Int32Array(d).map((R,P)=>P),p=R=>{for(;h[R]!==R;)R=h[R]=h[h[R]];return R};for(let R=0;R<s;R++){let P=p(u[R*3]);h[p(u[R*3+1])]=P,h[p(u[R*3+2])]=p(u[R*3])}let _=new Map,x=new Int32Array(s);for(let R=0;R<s;R++){let P=p(u[R*3]);_.has(P)||_.set(P,_.size),x[R]=_.get(P)}let m=_.size,f=new Uint8Array(m),y=new Float64Array(m);for(let R=0;R<s;R++){let P=R*9;y[x[R]]+=(n[P]*(n[P+4]*n[P+8]-n[P+5]*n[P+7])-n[P+1]*(n[P+3]*n[P+8]-n[P+5]*n[P+6])+n[P+2]*(n[P+3]*n[P+7]-n[P+4]*n[P+6]))/6}let g=vn.gridMin[1]+5e-4;for(let R=0;R<s;R++)if(!f[x[R]]){for(let P=0;P<3;P++)if(n[(R*3+P)*3+1]<g){f[x[R]]=1;break}}let M=e.map((R,P)=>vn.gridMin[P]+R*vn.cell),A=new Int8Array(s).fill(-1),T=Array.from({length:6},()=>({samples:new Int32Array(He*He).fill(-1),tris:[],area:new Map})),S=[[1,2],[1,2],[0,2],[0,2],[0,1],[0,1]];for(let R=t.skinN/3;R<s;R++)for(let P=0;P<6;P++){let F=P>>1,L=M[F]+(P&1)*vn.cell,U=!0;for(let Z=0;Z<3;Z++)if(Math.abs(n[(R*3+Z)*3+F]-L)>ox){U=!1;break}if(!U)continue;A[R]=P;let[B,Y]=S[P],G=[0,1,2].map(Z=>[(n[(R*3+Z)*3+B]-M[B])/vn.cell,(n[(R*3+Z)*3+Y]-M[Y])/vn.cell]);T[P].tris.push({tri:G,part:x[R]});let q=Math.abs((G[1][0]-G[0][0])*(G[2][1]-G[0][1])-(G[2][0]-G[0][0])*(G[1][1]-G[0][1]))/2*vn.cell*vn.cell;T[P].area.set(x[R],(T[P].area.get(x[R])||0)+q);let J=Math.max(0,Math.floor(Math.min(G[0][0],G[1][0],G[2][0])*He-.5)),Q=Math.min(He-1,Math.ceil(Math.max(G[0][0],G[1][0],G[2][0])*He-.5)),at=Math.max(0,Math.floor(Math.min(G[0][1],G[1][1],G[2][1])*He-.5)),X=Math.min(He-1,Math.ceil(Math.max(G[0][1],G[1][1],G[2][1])*He-.5));for(let Z=J;Z<=Q;Z++)for(let it=at;it<=X;it++)Vc((Z+.5)/He,(it+.5)/He,G)&&(T[P].samples[Z*He+it]=x[R]);break}let I=new Float64Array(m*3).fill(1/0),v=new Float64Array(m*3).fill(-1/0);for(let R=0;R<s;R++){let P=x[R]*3;for(let F=0;F<3;F++)for(let L=0;L<3;L++){let U=n[(R*3+F)*3+L];U<I[P+L]&&(I[P+L]=U),U>v[P+L]&&(v[P+L]=U)}}let b=new Float64Array(m);for(let R=0;R<m;R++){let P=(v[R*3]-I[R*3])*(v[R*3+1]-I[R*3+1])*(v[R*3+2]-I[R*3+2]);b[R]=Math.min(Math.abs(y[R]),P)}return{corner:u,nIds:d,partOf:x,count:m,grounded:f,vol:y,weight:b,wallOf:A,walls:T}}function Vc(i,t,[e,n,s]){let r=(i-n[0])*(e[1]-n[1])-(e[0]-n[0])*(t-n[1]),a=(i-s[0])*(n[1]-s[1])-(n[0]-s[0])*(t-s[1]),o=(i-e[0])*(s[1]-e[1])-(s[0]-e[0])*(t-e[1]);return!((r<0||a<0||o<0)&&(r>0||a>0||o>0))}function cf(){let i=new Int32Array(Yt.length+1);for(let f=0;f<Yt.length;f++)i[f+1]=i[f]+(Yt[f]?Yt[f].part.count:0);let t=i[Yt.length],e=new Int32Array(t).map((f,y)=>y),n=new Uint8Array(t),s=f=>{for(;e[f]!==f;)f=e[f]=e[e[f]];return f},r=(f,y)=>{f=s(f),y=s(y),f!==y&&(e[y]=f)},a=new Int32Array(t).map((f,y)=>y),o=f=>{for(;a[f]!==f;)f=a[f]=a[a[f]];return f},c=(f,y)=>{f=o(f),y=o(y),f!==y&&(a[y]=f)},l=[],u=new Float64Array(t),d=[];for(let f=0;f<Yt.length;f++){let y=Yt[f];if(y){for(let g=0;g<y.part.count;g++)(y.part.grounded[g]||y.part.vol[g]<-Bc/20)&&(n[i[f]+g]=1),u[i[f]+g]=y.part.vol[g]>0?y.part.weight[g]:0,d[i[f]+g]=[f,g];for(let g=0;g<3;g++){let M=of[f][g],A=M>=0?Yt[M]:null;if(!A)continue;let T=f*4096+M,S=kc.get(T);(!S||S.a!==y||S.b!==A)&&kc.set(T,S={a:y,b:A,pairs:_x(y.part.walls[g*2+1],A.part.walls[g*2])});for(let I=0;I<S.pairs.length;I+=3){let v=i[f]+S.pairs[I],b=i[M]+S.pairs[I+1],R=S.pairs[I+2];r(v,b),l.push(v,b,R),R>=lx&&c(v,b)}}}}let h=new Uint8Array(t),p=new Uint8Array(t);for(let f=0;f<t;f++)n[f]&&(h[s(f)]=1,p[o(f)]=1);let _=new Map,x=[];for(let f=0;f<t;f++){let y=s(f);h[y]||(_.has(y)||_.set(y,[]),_.get(y).push(d[f]))}x.push(..._.values());let m=new Map;for(let f=0;f<t;f++){if(!h[s(f)])continue;let y=o(f);if(p[y])continue;m.has(y)||m.set(y,{nodes:[],vol:0,hold:0});let g=m.get(y);g.nodes.push(f),g.vol+=u[f]}if(m.size){for(let f=0;f<l.length;f+=3){let y=o(l[f]),g=o(l[f+1]);y!==g&&(m.has(y)&&(m.get(y).hold+=l[f+2]),m.has(g)&&(m.get(g).hold+=l[f+2]))}for(let f of m.values())f.vol<Bc||f.hold<Math.max(cx,f.vol*ax)&&x.push(f.nodes.map(y=>d[y]))}return x}function _x(i,t){let e=new Map,n=[],s=(l,u,d)=>{let h=l*65536+u;e.set(h,(e.get(h)||0)+d)};if(!i.tris.length||!t.tris.length)return n;for(let l=0;l<He*He;l++)i.samples[l]>=0&&t.samples[l]>=0&&s(i.samples[l],t.samples[l],1);let r=new Set,a=new Set;for(let l of e.keys())r.add(Math.floor(l/65536)),a.add(l%65536);let o=l=>[(l[0][0]+l[1][0]+l[2][0])/3,(l[0][1]+l[1][1]+l[2][1])/3];for(let l of i.tris){if(r.has(l.part))continue;let[u,d]=o(l.tri);for(let h of t.tris)if(Vc(u,d,h.tri)){s(l.part,h.part,0);break}}for(let l of t.tris){if(a.has(l.part))continue;let[u,d]=o(l.tri);for(let h of i.tris)if(Vc(u,d,h.tri)){s(h.part,l.part,0);break}}let c=(vn.cell/He)**2;for(let[l,u]of e){let d=Math.floor(l/65536),h=l%65536,p=Math.min(i.area.get(d)||0,t.area.get(h)||0);n.push(d,h,u>0?u*c:p)}return n}function xx(i){let t=new Map;for(let[o,c]of i)t.has(o)||t.set(o,new Set),t.get(o).add(c);let e=[[],[]];for(let[o,c]of t){let l=Yt[o],{soup:u,part:d}=l,h=[];for(let x=0;x<u.n/3;x++)c.has(d.partOf[x])?e[x*3<u.skinN?0:1].push([u,x]):h.push(x);if(!h.length){Yt[o]=null;continue}let p={};for(let x of Mn)p[x]=new Float32Array(h.length*3*Ge[x]);let _=0;h.forEach((x,m)=>{for(let f of Mn)p[f].set(u.a[f].subarray(x*3*Ge[f],(x+1)*3*Ge[f]),m*3*Ge[f]);x*3<u.skinN&&(_+=3)}),Yt[o]=Wc({a:p,n:h.length*3,skinN:_},l.cell)}let n=(e[0].length+e[1].length)*3,s={};for(let o of Mn)s[o]=new Float32Array(n*Ge[o]);let r=0;for(let o of e)for(let[c,l]of o){for(let u of Mn)s[u].set(c.a[u].subarray(l*3*Ge[u],(l+1)*3*Ge[u]),r*3*Ge[u]);r++}let a=[0,0,0];for(let o=0;o<n;o++)for(let c=0;c<3;c++)a[c]+=s.position[o*3+c]/n;return{arrays:s,skinN:e[0].length*3,n,center:a}}function yx(i){let t=i.a.position,e=0;for(let n=0;n<i.n/3;n++){let s=n*9;e+=t[s]*(t[s+4]*t[s+8]-t[s+5]*t[s+7])-t[s+1]*(t[s+3]*t[s+8]-t[s+5]*t[s+6])+t[s+2]*(t[s+3]*t[s+7]-t[s+4]*t[s+6])}return e/6}function vx(i){let t=i.attributes.position,e=i.index?i.index.array:null,n=(e?e.length:t.count)/3,s=1;for(;s<n*6;)s<<=1;let r=new Int32Array(s),a=new Int32Array(s),o=new Int32Array(s),c=new Int32Array(s).fill(-1),l=new Int32Array(n*3),u=t.array,d=0;for(let _=0;_<n*3;_++){let x=(e?e[_]:_)*3,m=Math.round(u[x]*1e5),f=Math.round(u[x+1]*1e5),y=Math.round(u[x+2]*1e5),g=(Math.imul(m,73856093)^Math.imul(f,19349663)^Math.imul(y,83492791))&s-1;for(;c[g]!==-1&&(r[g]!==m||a[g]!==f||o[g]!==y);)g=g+1&s-1;c[g]===-1&&(c[g]=d++,r[g]=m,a[g]=f,o[g]=y),l[_]=c[g]}let h=new Map,p=new Int32Array(n*3).fill(-1);for(let _=0;_<n;_++)for(let x=0;x<3;x++){let m=l[_*3+x],f=l[_*3+(x+1)%3],y=h.get(f*d+m);y!==void 0?(p[_*3+x]=y,p[y]=_*3+x,h.delete(f*d+m)):h.set(m*d+f,_*3+x)}return{data:p,getSiblingTriangleIndex(_,x){let m=p[_*3+x];return m===-1?-1:m/3|0},getSiblingEdgeIndex(_,x){let m=p[_*3+x];return m===-1?-1:m%3}}}
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
