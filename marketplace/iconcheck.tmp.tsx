import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TypeIcon from "/home/user/adamhall/marketplace/components/site/TypeIcon";
import * as fs from "node:fs";

const values = ["Hatch","Sedan","Wagon","SUV","Ute","Van","Coupe","Convertible","People Mover","Cab Chassis","Hybrid","Plug-in Hybrid","Diesel","Petrol","Electric","Something Else"];

const tile = (v: string, scale: number) => `
  <button class="tile" style="--s:${scale}">
    <span class="img">${renderToStaticMarkup(<TypeIcon value={v} className="ico" />)}</span>
    <span class="line"><b>${v}</b><i>3</i></span>
  </button>`;

fs.writeFileSync("/tmp/claude-0/-home-user-adamhall/61e342b9-e1d7-5556-926e-42eb07922bd7/scratchpad/icons.html", `<!doctype html><meta charset=utf8>
<style>
  body { margin:0; background:#0d3b31; font-family: system-ui, sans-serif; padding: 24px; }
  .row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:28px; align-items:flex-start; }
  .big .tile { transform: scale(2.4); transform-origin: top left; margin-right: 128px; margin-bottom: 90px; }
  .tile { width:88px; padding:0; border:0; background:none; text-align:center; }
  .img { display:flex; align-items:center; justify-content:center; height:66px;
         border:1px solid rgba(255,255,255,.16); border-radius:8px; background:rgba(255,255,255,.06); color:#fff; }
  .on .img { border-color:#f3dcb3; box-shadow:0 0 0 1px #f3dcb3; color:#f3dcb3; }
  .line { display:flex; gap:5px; justify-content:center; margin-top:7px; font-size:13px; color:#fff; }
  .line i { color:#f3dcb3; font-style:normal; font-size:12px; }
  h2 { color:#f3dcb3; font:600 12px/1 system-ui; letter-spacing:.14em; text-transform:uppercase; margin:0 0 12px; }
</style>
<h2>At tile size</h2>
<div class="row">${values.map((v) => tile(v, 1)).join("")}</div>
<h2>Selected state</h2>
<div class="row">${["SUV","Ute","Hybrid","Diesel"].map((v) => tile(v, 1).replace('class="tile"', 'class="tile on"')).join("")}</div>
<h2>2.4x</h2>
<div class="row big">${["Hatch","Sedan","Wagon","SUV","Ute","Van","Coupe","Convertible"].map((v) => tile(v, 1)).join("")}</div>
<div class="row big">${["Hybrid","Diesel","Petrol","Electric"].map((v) => tile(v, 1)).join("")}</div>
`);
console.log("written");
