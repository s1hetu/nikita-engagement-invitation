const WEDDING={
groom:"Krunal",bride:"Nikita",dateText:"15 December 2026",
message:"With the blessings of our families, we invite you to join us as we celebrate a beautiful new chapter together.",
story:"Some stories are written in the stars. Ours is written in the little moments, shared smiles and memories that brought two families together.",
countdownTarget:"2026-12-15T19:00:00",
venue:"Your Beautiful Venue",address:"Your venue address, Your City, India",
mapsUrl:"https://maps.google.com/",rsvpUrl:"https://forms.google.com/",
events:[
{icon:"♡",name:"Engagement",date:"15 December 2026",time:"07:00 PM onwards",venue:"Your Beautiful Venue",address:"Your venue address, Your City",maps:"https://maps.google.com/"},
{icon:"✦",name:"Wedding",date:"16 December 2026",time:"11:00 AM onwards",venue:"Your Wedding Venue",address:"Your wedding venue address, Your City",maps:"https://maps.google.com/"}
],
gallery:["images/photo-1.jpg","images/photo-2.jpg","images/photo-3.jpg","images/photo-4.jpg"]
};

document.querySelectorAll("[data-groom]").forEach(e=>e.textContent=WEDDING.groom);
document.querySelectorAll("[data-bride]").forEach(e=>e.textContent=WEDDING.bride);
document.querySelectorAll("[data-date]").forEach(e=>e.textContent=WEDDING.dateText);
document.querySelector("[data-message]").textContent=WEDDING.message;
document.querySelector("[data-story]").textContent=WEDDING.story;
document.querySelector("[data-venue]").textContent=WEDDING.venue;
document.querySelector("[data-address]").textContent=WEDDING.address;
document.querySelector("#map").href=WEDDING.mapsUrl;
document.querySelector("#rsvp").href=WEDDING.rsvpUrl;

document.querySelector("#eventList").innerHTML=WEDDING.events.map(x=>`
<article class="event reveal"><div>${x.icon}</div><h3>${x.name}</h3>
<p><b>${x.date}</b><br>${x.time}</p><p><strong>${x.venue}</strong><br>${x.address}</p>
<a href="${x.maps}" target="_blank" rel="noopener">View location →</a></article>`).join("");

document.querySelector("#gallery").innerHTML=WEDDING.gallery.map((x,i)=>`<img class="reveal" src="${x}" alt="Memory ${i+1}" loading="lazy">`).join("");

window.addEventListener("load",()=>setTimeout(()=>{const p=document.querySelector("#preloader");p.style.opacity="0";p.style.transition="opacity .5s";setTimeout(()=>p.remove(),550)},500));

const music=document.querySelector("#music"),musicToggle=document.querySelector("#musicToggle");
document.querySelector("#openInvitation").addEventListener("click",()=>{
document.querySelector("#invitation").classList.remove("hidden");document.body.classList.remove("locked");
music.play().catch(()=>{});document.querySelector("#invitation").scrollIntoView({behavior:"smooth"});observe();
});
musicToggle.addEventListener("click",()=>{if(music.paused){music.play().catch(()=>{});musicToggle.textContent="♫"}else{music.pause();musicToggle.textContent="🔇"}});

const target=new Date(WEDDING.countdownTarget).getTime();
function tick(){let d=Math.max(0,target-Date.now());const a=Math.floor(d/86400000);d%=86400000;const b=Math.floor(d/3600000);d%=3600000;const c=Math.floor(d/60000);d%=60000;const e=Math.floor(d/1000);[a,b,c,e].forEach((v,i)=>document.querySelectorAll("#timer b")[i].textContent=String(v).padStart(2,"0"))}tick();setInterval(tick,1000);

function observe(){const els=document.querySelectorAll(".reveal");if(!("IntersectionObserver"in window)){els.forEach(x=>x.classList.add("visible"));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});els.forEach(x=>io.observe(x))}
observe();
