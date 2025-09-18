
const PLAYLIST_ID = 'PL7A9n1TybRSmp7udNvwK0ldngp5ngAUDh'; //playlist ID
const API_KEY = 'AIzaSyB144WvOlCpdSrp1qnsj-h8XvBrCh_Lt9E'; // api key

let player, isPlaying=false, updateTimer=null;
let shuffle=false, loopMode=false;
let playlistVideoIds = [];
let playlistTitles = [];
let playlistThumbs = [];

// DOM refs
const nowTitleEl = document.getElementById('nowTitle');
const thumbnailEl = document.getElementById('thumbnail');

// Load YouTube IFrame API
(function loadYT(){ const s=document.createElement('script'); s.src="https://www.youtube.com/iframe_api"; document.head.appendChild(s); })();

function onYouTubeIframeAPIReady(){
  player = new YT.Player('yt-player', {
    height:'0', width:'0',
    playerVars:{
      listType:'playlist', list:PLAYLIST_ID, autoplay:0, controls:0, disablekb:1, modestbranding:1, rel:0
    },
    events:{ onReady: onPlayerReady, onStateChange: onPlayerStateChange }
  });
}

function onPlayerReady(){
  // Try to fetch playlist items with Data API if API_KEY provided
  if (API_KEY){
    fetchPlaylistItemsWithAPI(PLAYLIST_ID, API_KEY).then(data=>{
      if (data && data.items && data.items.length>0){
        playlistVideoIds = data.items.map(i=>i.contentDetails.videoId);
        playlistTitles = data.items.map(i=>i.snippet.title);
        playlistThumbs = data.items.map(i=> (i.snippet.thumbnails && (i.snippet.thumbnails.medium||i.snippet.thumbnails.default)) ? (i.snippet.thumbnails.medium ? i.snippet.thumbnails.medium.url : i.snippet.thumbnails.default.url) : null);
        buildPlaylistUI();
        updateNowPlaying();
      } else fallbackBuild();
    }).catch(e=>{ console.warn('API fetch failed',e); fallbackBuild(); });
  } else {
    fallbackBuild();
  }
  // set initial volume
  const vol = document.getElementById('vol'); player.setVolume(vol.value);
}

function fallbackBuild(){
  try{
    const pls = player.getPlaylist();
    if (pls && pls.length>0){ playlistVideoIds = pls.slice(); }
  }catch(e){}
  // build placeholder UI (will show Track #n)
  buildPlaylistUI();
  updateNowPlaying();
}

function onPlayerStateChange(e){
  const state = e.data;
  if (state===YT.PlayerState.PLAYING){ isPlaying=true; document.getElementById('playBtn').textContent='⏸'; startProgressUpdater(); }
  else if (state===YT.PlayerState.PAUSED || state===YT.PlayerState.ENDED){ isPlaying=false; document.getElementById('playBtn').textContent='▶️'; stopProgressUpdater(); if(state===YT.PlayerState.ENDED && loopMode) player.playVideoAt(0); }
  updateNowPlaying();
}

// UI wiring
document.getElementById('playBtn').addEventListener('click', ()=>{ if(!player) return; const s=player.getPlayerState(); if(s===YT.PlayerState.PLAYING) player.pauseVideo(); else player.playVideo(); });
document.getElementById('prevBtn').addEventListener('click', ()=>{ if(!player) return; player.previousVideo(); setTimeout(updateNowPlaying,200); });
document.getElementById('nextBtn').addEventListener('click', ()=>{ if(!player) return; player.nextVideo(); setTimeout(updateNowPlaying,200); });
document.getElementById('shuffleBtn').addEventListener('click', ()=>{ shuffle=!shuffle; document.getElementById('shuffleBtn').style.opacity=shuffle? '1':'0.7'; try{ player.setShuffle && player.setShuffle(shuffle);}catch(e){} });
document.getElementById('loopBtn').addEventListener('click', ()=>{ loopMode=!loopMode; document.getElementById('loopBtn').style.opacity=loopMode? '1':'0.7'; try{ player.setLoop && player.setLoop(loopMode);}catch(e){} });
document.getElementById('vol').addEventListener('input',(ev)=>{ const v=parseInt(ev.target.value,10); player && player.setVolume(v); });
document.getElementById('seek').addEventListener('input',(ev)=>{ if(!player||!player.getDuration) return; const pct=Number(ev.target.value); const dur=player.getDuration()||0; const sec=Math.round(dur*pct/100); player.seekTo(sec,true); });
document.getElementById('reloadMetadata').addEventListener('click', ()=>{ if(!API_KEY){ alert('No API key set. Add it to script.js'); return;} fetchPlaylistItemsWithAPI(PLAYLIST_ID,API_KEY).then(data=>{ if(data && data.items){ playlistVideoIds = data.items.map(i=>i.contentDetails.videoId); playlistTitles = data.items.map(i=>i.snippet.title); playlistThumbs = data.items.map(i=> (i.snippet.thumbnails && (i.snippet.thumbnails.medium||i.snippet.thumbnails.default)) ? (i.snippet.thumbnails.medium ? i.snippet.thumbnails.medium.url : i.snippet.thumbnails.default.url) : null); buildPlaylistUI(); } else alert('No data returned.'); }).catch(err=>{ alert('Fetch failed. See console.'); console.error(err); }); });

// Playlist UI
function buildPlaylistUI(){
  const list = document.getElementById('playlist'); list.innerHTML='';
  const count = Math.max(playlistVideoIds.length, playlistTitles.length, 12);
  for(let i=0;i<count;i++){
    const title = playlistTitles[i] || `Track ${i+1}`;
    const vid = playlistVideoIds[i] || '';
    const thumb = playlistThumbs[i] || null;
    const li = makeTrackElement(i+1, title, vid, thumb);
    list.appendChild(li);
  }
  highlightActive();
}

function makeTrackElement(n,title,vid,thumb){
  const li=document.createElement('li'); li.className='track';
  const num=document.createElement('div'); num.className='num'; num.textContent=n;
  const meta=document.createElement('div'); meta.className='meta';
  const t=document.createElement('div'); t.className='t'; t.textContent=title;
  const c=document.createElement('div'); c.className='c'; c.textContent=vid||'';
  meta.appendChild(t); meta.appendChild(c);
  li.appendChild(num); li.appendChild(meta);
  if(thumb){ const img=document.createElement('img'); img.src=thumb; img.alt='thumb'; img.style.width='48px'; img.style.height='48px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; img.style.marginRight='10px'; li.insertBefore(img,num); }
  li.addEventListener('click', ()=>{ if(vid && player && player.getPlaylistIndex){ const idx = playlistVideoIds.indexOf(vid); if(idx>=0) player.playVideoAt(idx); else player.playVideoAt(n-1); } else { player && player.playVideoAt && player.playVideoAt(n-1); } setTimeout(updateNowPlaying,200); });
  return li;
}

function highlightActive(){ const list=document.querySelectorAll('.track'); const curIdx=getCurrentPlaylistIndex(); list.forEach((el,i)=>{ if(i===curIdx) el.classList.add('active'); else el.classList.remove('active'); }); }

// Progress updater
function startProgressUpdater(){ stopProgressUpdater(); updateTimer=setInterval(()=>{ if(!player) return; try{ const dur=player.getDuration(); const cur=player.getCurrentTime(); if(isFinite(dur) && dur>0){ const pct=Math.floor((cur/dur)*100); document.getElementById('seek').value=pct; document.getElementById('curTime').textContent=formatTime(cur); document.getElementById('durTime').textContent=formatTime(dur); } }catch(e){} },500); }
function stopProgressUpdater(){ if(updateTimer){ clearInterval(updateTimer); updateTimer=null; } }
function formatTime(s){ if(!isFinite(s)) return '0:00'; s=Math.floor(s); const m=Math.floor(s/60); const sec=s%60; return `${m}:${sec.toString().padStart(2,'0')}`; }
function getCurrentPlaylistIndex(){ try{ if(!player || !player.getPlaylistIndex) return -1; const idx=player.getPlaylistIndex(); return (typeof idx==='number')? idx: -1; }catch(e){ return -1; } }
function updateNowPlaying(){ try{ const idx=getCurrentPlaylistIndex(); if(idx>=0){ const title = playlistTitles[idx] || `Track ${idx+1}`; nowTitleEl.textContent = title; const thumb = playlistThumbs[idx]; if(thumb){ thumbnailEl.src = thumb; thumbnailEl.classList.add('visible'); } else { thumbnailEl.classList.remove('visible'); thumbnailEl.src = ''; } } else { try{ const meta = player.getVideoData(); const name = meta && meta.title ? meta.title : 'Playlist'; nowTitleEl.textContent = name; }catch(e){ nowTitleEl.textContent = 'Playlist'; } thumbnailEl.classList.remove('visible'); thumbnailEl.src=''; } highlightActive(); }catch(e){} }

async function fetchPlaylistItemsWithAPI(playlistId, apiKey){ const base='https://www.googleapis.com/youtube/v3/playlistItems'; let nextPageToken=''; let allItems=[]; do{ const url=`${base}?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}` + (nextPageToken ? `&pageToken=${nextPageToken}` : ''); const res=await fetch(url); if(!res.ok) throw new Error('YouTube API error: ' + res.status); const json=await res.json(); if(json.items) allItems=allItems.concat(json.items); nextPageToken=json.nextPageToken||''; } while(nextPageToken); return { items: allItems }; }
