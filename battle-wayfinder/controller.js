// MakeMoney: 独立编写的占点策略；预计算到每个目标的可达路径，减少碰撞和逐帧开销。
const SCALE = 65536, TURN = 4096;
let terrainMap, routes, points;
function buildRoute(point) {
  const {width:w, height:h, terrain} = terrainMap;
  const n=w*h, distance=new Int32Array(n); distance.fill(-1);
  const tx=Math.max(0,Math.min(w-1,Math.floor(point.x/SCALE)));
  const ty=Math.max(0,Math.min(h-1,Math.floor(point.y/SCALE)));
  const start=ty*w+tx, queue=new Int32Array(n); let begin=0,end=0;
  distance[start]=0; queue[end++]=start;
  while(begin<end) {
    const cell=queue[begin++], x=cell%w, y=Math.floor(cell/w);
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx=x+dx, ny=y+dy;
      if(nx<0||nx>=w||ny<0||ny>=h) continue;
      const next=ny*w+nx, t=terrain[next];
      if(distance[next]!==-1||t===2||t===4||t===6) continue;
      distance[next]=distance[cell]+1; queue[end++]=next;
    }
  }
  return distance;
}
function nextTile(x,y,route) {
  const {width:w,height:h}=terrainMap, tx=Math.floor(x/SCALE),ty=Math.floor(y/SCALE);
  if(tx<0||tx>=w||ty<0||ty>=h) return null;
  let best=route[ty*w+tx], result=null;
  if(best<0) return null;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx=tx+dx,ny=ty+dy;
    if(nx<0||nx>=w||ny<0||ny>=h) continue;
    const value=route[ny*w+nx];
    if(value>=0&&value<best){best=value;result=[(nx+.5)*SCALE,(ny+.5)*SCALE];}
  }
  return result;
}
globalThis.controller={
  // APC 的两倍占点权重与坦克火力结合；预算不足时由引擎回退默认阵容。
  draft(h){const p=['apc','mbt','scout','scout'];return h.draft&&p.every(k=>h.draft.roster.includes(k))&&p.reduce((s,k)=>s+h.draft.costs[k],0)<=h.draft.budget?p:undefined;},
  hello(h){terrainMap=h.map;points=h.objectives;routes=points.map(buildRoute);},
  tick(o){
    const living=o.units.filter(u=>u.alive), out=[];
    for(let i=0;i<living.length;i++) {
      const u=living[i], order={id:u.id}, target=points.length?points[i%points.length]:null;
      if(target&&o.canMove) {
        const dist=Math.hypot(target.x-u.x,target.y-u.y);
        if(dist<target.radius*0.72){order.throttle=0;order.steer=0;}
        else {
          const step=nextTile(u.x,u.y,routes[i%points.length])||[target.x,target.y];
          const desired=Math.round(Math.atan2(step[1]-u.y,step[0]-u.x)*TURN/(2*Math.PI))&(TURN-1);
          let diff=(desired-u.heading)&(TURN-1); if(diff>TURN/2)diff-=TURN;
          order.steer=Math.max(-SCALE,Math.min(SCALE,Math.round(diff*SCALE/400)));
          order.throttle=Math.abs(diff)>700?0:SCALE;
        }
      }
      let nearest=null,best=Infinity;
      for(const c of o.contacts){const d=(c.x-u.x)**2+(c.y-u.y)**2;if(d<best){best=d;nearest=c;}}
      if(nearest){order.aimAt=[nearest.x,nearest.y];if(u.reload===0)order.fire=[nearest.x,nearest.y];}
      out.push(order);
    }
    return {units:out};
  }
};
