import {release,maxParty} from './policy.js';
const allowed=['name','party','track','note','confirm'];
const tracks=['design','systems','community'];
export function parse(body) {
  const params=new URLSearchParams(body),errors=[];
  params.forEach((value,key)=>{if(allowed.indexOf(key)<0&&errors.indexOf('unknown_field')<0)errors.push('unknown_field');});
  const singles=['name','party','note','confirm'];
  singles.forEach(key=>{if(params.getAll(key).length>1)errors.push('duplicate_'+key);});
  const name=(params.get('name')||'').trim(),partyText=params.get('party')||'',note=params.get('note')||'';
  if(name.length<1||name.length>80)errors.push('name_length');
  if(!/^[1-9][0-9]*$/.test(partyText)||Number(partyText)>maxParty)errors.push('party_range');
  if(note.length>400)errors.push('note_length');
  if(params.get('confirm')!=='yes')errors.push('confirmation_required');
  const selected=[];
  params.getAll('track').forEach(track=>{if(tracks.indexOf(track)<0)errors.push('unknown_track');else if(selected.indexOf(track)<0)selected.push(track);});
  if(selected.length===0)errors.push('track_required');
  if(errors.length)return {ok:false,release,errors};
  const data={name,party:Number(partyText),tracks:selected,note};
  const canonical=new URLSearchParams();canonical.append('name',name);canonical.append('party',String(data.party));
  selected.forEach(track=>canonical.append('track',track));canonical.append('note',note);canonical.append('confirm','yes');
  return {ok:true,release,data,canonical:canonical.toString()};
}
export function echo(query) {
  const params=new URLSearchParams(query);const before=params.toString();params.sort();
  return {release,tags:params.getAll('tag'),space:params.get('space'),literalPlus:params.get('plus'),empty:params.get('empty'),missing:params.get('missing'),before,sorted:params.toString()};
}
