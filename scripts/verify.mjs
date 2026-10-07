import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};};
globalThis.localStorage=storage();
globalThis.sessionStorage=storage();
globalThis.window={location:{origin:"http://localhost"},matchMedia:()=>({matches:false}),addEventListener(){},dispatchEvent(){}};
const server=await createServer({server:{middlewareMode:true},appType:"custom"});
let checks=0;
function check(label,fn){fn();checks++;console.log("PASS "+label);}
try {
  const utils=await server.ssrLoadModule("/src/utils.js");
  check("opening boundary is inclusive, closing boundary exclusive",()=>{
    const c={open:"06:00",close:"22:00"};
    assert.equal(utils.isOpenAtMinutes(c,359),false);
    assert.equal(utils.isOpenAtMinutes(c,360),true);
    assert.equal(utils.isOpenAtMinutes(c,1320),false);
  });
  check("overnight hours and all-day venues",()=>{
    const c={open:"18:00",close:"02:00"};
    assert.equal(utils.isOpenAtMinutes(c,60),true);
    assert.equal(utils.isOpenAtMinutes(c,600),false);
    assert.equal(utils.isOpenDuring(c,1380,180),true);
    assert.equal(utils.isOpenDuring(c,60,120),false);
    assert.equal(utils.isOpenDuring({open:"00:00",close:"24:00"},1380,180),true);
  });
  check("game validation checks the whole session, not just its endpoints",()=>{
    assert.equal(utils.isOpenDuring({open:"06:00",close:"22:00"},1260,120),false);
    assert.equal(utils.isOpenDuring({open:"01:00",close:"23:00"},1320,240),false);
    assert.equal(utils.isOpenDuring({open:null,close:null},1200,120),null);
    assert.equal(utils.isOpenDuring({open:"06:00",close:"22:00"},NaN,120),false);
  });
  check("search includes address, amenities, multiple words, and accents",()=>{
    const c={name:"Casa Café",municipality:"Lipa City",address:"Brgy. Balintawak",amenities:["Paddle rental","Covered"]};
    assert.equal(utils.matchesCourt(c,"cafe lipa"),true);
    assert.equal(utils.matchesCourt(c,"paddle balintawak"),true);
    assert.equal(utils.matchesCourt(c,"nasugbu"),false);
    assert.equal(utils.matchesCourt(c,"   "),true);
  });
  const courts=JSON.parse(await readFile(new URL("../src/data/courts.json",import.meta.url),"utf8"));
  check("court IDs, coordinates, and photo references are valid",()=>{
    assert.equal(new Set(courts.map(c=>c.id)).size,courts.length);
    for(const c of courts){assert.ok(Number.isFinite(c.lat)&&Number.isFinite(c.lng));assert.ok(c.name&&c.municipality);assert.ok(c.photos.length);}
  });
  // Render with actual React hooks and routing to catch runtime errors outside map-only Leaflet code.
  const originalError=console.error;
  console.error=(...args)=>{if(!String(args[0]).includes("useLayoutEffect does nothing on the server"))originalError(...args);};
  try{
    for(const [file,url,expected] of [
      ["Landing","/","Your next game"],
      ["Courts","/courts?town=Lipa%20City","Lipa Elite Pickleball"],
      ["Courts","/courts?q=zzzz-no-match","No courts match"],
      ["Saved","/saved","Browse courts"],
      ["Plan","/plan","Your game details"],
      ["Compare","/compare","Which court"],
      ["About","/about","Made for Batangas"],
      ["NotFound","/missing","Out of bounds"]
    ]){
      const {default:Page}=await server.ssrLoadModule("/src/pages/"+file+".jsx");
      check("render "+url,()=>{const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[url]},React.createElement(Page)));assert.ok(html.includes(expected),url+" expected "+expected);if(file==="Courts"&&url.includes("town="))assert.ok(!html.includes("4215 Pickle Club"));});
    }
    const {default:useCompare}=await server.ssrLoadModule("/src/useCompare.js");
    let selection;
    const Probe=()=>{selection=useCompare();return null;};
    const readSelection=()=>renderToStaticMarkup(React.createElement(Probe));
    readSelection();
    check("comparison allows three valid courts and rejects a fourth",()=>{
      for(const c of courts.slice(0,3)){selection.toggle(c.id);readSelection();}
      selection.toggle(courts[3].id);readSelection();
      assert.equal(selection.ids.length,3);
      selection.toggle("not-a-court");readSelection();assert.equal(selection.ids.length,3);
    });
    const {default:Compare}=await server.ssrLoadModule("/src/pages/Compare.jsx");
    check("selected comparison renders court names and honest unknown details",()=>{const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:["/compare"]},React.createElement(Compare)));for(const c of courts.slice(0,3))assert.ok(html.includes(c.name));assert.ok(html.includes("Not listed"));});
    check("comparison removes courts and clears its persisted shortlist",()=>{selection.toggle(courts[0].id);readSelection();assert.equal(selection.ids.length,2);selection.clear();readSelection();assert.equal(selection.ids.length,0);assert.deepEqual(JSON.parse(sessionStorage.getItem("pickle-compare")),[]);});
    const {default:Plan}=await server.ssrLoadModule("/src/pages/Plan.jsx");
    check("planner safely renders an invalid restored draft",()=>{localStorage.setItem("pickle-plan-draft",JSON.stringify({date:"zzzz",time:"bad",players:99}));const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:["/plan"]},React.createElement(Plan)));assert.ok(html.includes("Choose today or a future date"));assert.ok(html.includes("disabled"));});
  }finally{console.error=originalError;}
  console.log(checks+" checks passed.");
}finally{await server.close();}
