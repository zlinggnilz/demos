import{u as p,W as F,w as R,H as L,b as x,_ as T}from"./ThreeLoading-591c6b8b.js";import{r as t}from"./index-99d6b49e.js";function _(n){return function(u){n.forEach(function(r){typeof r=="function"?r(u):r!=null&&(r.current=u)})}}function h(n,u,r){const{gl:g,size:i,viewport:f}=p(),m=typeof n=="number"?n:i.width*f.dpr,a=typeof u=="number"?u:i.height*f.dpr,d=(typeof n=="number"?r:n)||{},{samples:c,...o}=d,s=t.useMemo(()=>{let l;return l=new F(m,a,{minFilter:R,magFilter:R,encoding:g.outputEncoding,type:L,...o}),l.samples=c,l},[]);return t.useLayoutEffect(()=>{s.setSize(m,a),c&&(s.samples=c)},[c,s,m,a]),t.useEffect(()=>()=>s.dispose(),[]),s}const v=n=>typeof n=="function",C=t.forwardRef(({envMap:n,resolution:u=256,frames:r=1/0,makeDefault:g,children:i,...f},m)=>{const a=p(({set:e})=>e),d=p(({camera:e})=>e),c=p(({size:e})=>e),o=t.useRef(null),s=t.useRef(null),l=h(u);t.useLayoutEffect(()=>{f.manual||(o.current.aspect=c.width/c.height)},[c,f]),t.useLayoutEffect(()=>{o.current.updateProjectionMatrix()});let E=0,b=null;const y=v(i);return x(e=>{y&&(r===1/0||E<r)&&(s.current.visible=!1,e.gl.setRenderTarget(l),b=e.scene.background,n&&(e.scene.background=n),e.gl.render(e.scene,o.current),e.scene.background=b,e.gl.setRenderTarget(null),s.current.visible=!0,E++)}),t.useLayoutEffect(()=>{if(g){const e=d;return a(()=>({camera:o.current})),()=>a(()=>({camera:e}))}},[o,g,a]),t.createElement(t.Fragment,null,t.createElement("perspectiveCamera",T({ref:_([o,m])},f),!y&&i),t.createElement("group",{ref:s},y&&i(l.texture)))});export{C as P,_ as m};
