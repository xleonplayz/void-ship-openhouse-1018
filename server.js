import http from 'node:http';
import {release,maxParty,maxBody} from './policy.js';
import {parse,echo} from './forms.js';
import {html,client,receipt,failure} from './ui.js';
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://openhouse.local');let sent=false;
  const send=(status,type,body,headers={})=>{
    if(sent)return;sent=true;
    console.log(JSON.stringify({event:'openhouse_request',release,method:req.method,path:url.pathname,status}));
    res.writeHead(status,{'content-type':type,'cache-control':'no-store','x-openhouse-release':String(release),...headers});res.end(body);
  };
  const json=(status,body)=>send(status,'application/json; charset=utf-8',JSON.stringify(body));
  if(req.method==='GET') {
    if(url.pathname==='/')return send(200,'text/html; charset=utf-8',html);
    if(url.pathname==='/client.js')return send(200,'text/javascript; charset=utf-8',client);
    if(url.pathname==='/favicon.ico')return send(204,'image/x-icon','');
    if(url.pathname==='/health')return json(200,{ok:true,release,maxParty,maxBody});
    if(url.pathname==='/diagnostic/raw-url')return json(200,{requestUrl:req.url,pathname:url.pathname,search:url.search});
    if(url.pathname==='/diagnostic/url-params') {
      const value=new URL('/?tag=x&tag=y&space=a+b','http://fixture.local');
      return json(200,{get:value.searchParams.get('tag'),all:value.searchParams.getAll('tag'),space:value.searchParams.get('space'),text:value.searchParams.toString()});
    }
    if(url.pathname==='/diagnostic/params-literal') {
      const value=new URLSearchParams('tag=x&tag=y&space=a+b');
      return json(200,{type:typeof value,getType:typeof value.get,get:value.get('tag'),all:value.getAll('tag'),space:value.get('space'),text:value.toString()});
    }
    if(url.pathname==='/diagnostic/params-append') {
      const value=new URLSearchParams();value.append('z','9');value.append('tag','x');value.append('tag','y');value.append('a','1');value.sort();
      return json(200,{all:value.getAll('tag'),text:value.toString(),missing:value.get('missing')});
    }
    if(url.pathname==='/api/echo')return json(200,echo(url.search));
    if(url.pathname==='/receipt') {const result=parse(url.search);return send(result.ok?200:422,'text/html; charset=utf-8',result.ok?receipt(result):failure(result));}
    return json(404,{error:'not_found',release});
  }
  if(req.method!=='POST')return send(405,'application/json','{"error":"method_not_allowed"}',{'allow':'GET, POST'});
  if(url.pathname!=='/rsvp'&&url.pathname!=='/api/rsvp'&&url.pathname!=='/diagnostic/body')return json(404,{error:'not_found',release});
  if((req.headers['content-type']||'').split(';')[0].trim().toLowerCase()!=='application/x-www-form-urlencoded')return json(415,{error:'unsupported_media_type',release});
  const chunks=[];let bytes=0;
  req.on('data',chunk=>{bytes+=chunk.length;if(bytes>maxBody){json(413,{error:'body_too_large',maxBody,release});return;}chunks.push(chunk);});
  req.on('end',()=>{
    if(sent)return;
    if(url.pathname==='/diagnostic/body')return json(200,{bytes,utf8:Buffer.concat(chunks).toString('utf8'),release});
    const result=parse(Buffer.concat(chunks).toString('utf8'));
    if(url.pathname==='/api/rsvp')return json(result.ok?201:422,result);
    if(!result.ok)return send(422,'text/html; charset=utf-8',failure(result));
    return send(303,'text/plain; charset=utf-8','See your preview',{'location':'/receipt?'+result.canonical});
  });
  req.on('error',()=>{if(!sent)json(400,{error:'request_error',release});});
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('openhouse_ready release='+release));
