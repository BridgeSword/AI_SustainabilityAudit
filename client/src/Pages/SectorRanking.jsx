import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Home/Home.css";
import "../Home/MidPanel.css";
import "../Home/RightPanel.css";
import "./SectorRanking.css";   // 本页专用覆盖（含 sr-container / sr-main / sr-right / sr-toolbar 等）
import NavBar from "../NavBar/NavBar.jsx";
import SectorRightPanel from "./SectorRightPanel.jsx";  // 复制自 Home 的 RightPanel

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// === Options ===
const DEFAULT_INDUSTRIES = [
  "Technology","Energy","Industrials","Consumer Discretionary","Consumer Staples",
  "Utilities","Materials","Financials","Health Care","Real Estate","Communication Services",
];
const DEFAULT_REGIONS = ["Global", "North America", "Europe", "APAC", "LATAM", "MEA"];
const DEFAULT_SCALES  = ["Large Cap", "Mid Cap", "Small Cap"];
const DEFAULT_COUNTRIES = [
  "United States","United Kingdom","Germany","France","Japan","China","Canada","Australia","India",
];

// === Formatters ===
function fmtPct(n) { if (n==null || Number.isNaN(n)) return "—"; return `${(n*100).toFixed(1)}%`; }
function fmtNum(n, digits=2){ if(n==null || Number.isNaN(n)) return "—"; return new Intl.NumberFormat(undefined,{maximumFractionDigits:digits}).format(n); }

export default function SectorRanking() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // --- Filters ---
  const [industry, setIndustry] = useState(DEFAULT_INDUSTRIES[0]);
  const [region, setRegion]     = useState(DEFAULT_REGIONS[0]);
  const [scale, setScale]       = useState("");
  const [country, setCountry]   = useState("");
  const [year, setYear]         = useState(currentYear); // 如不需要，可删
  const [nameQuery, setNameQuery] = useState("");

  // --- Data / sort / page ---
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [sortKey, setSortKey] = useState("adj_intensity");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // --- Selection & baseline ---
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [baselineIds, setBaselineIds] = useState(() => {
    const saved = localStorage.getItem("baseline_companies");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showCompare, setShowCompare] = useState(false);

  // Compare 滚动定位
  const compareRef = useRef(null);
  useEffect(() => {
    if (showCompare && compareRef.current) {
      compareRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showCompare]);

  // Fetch
  async function fetchData(){
    setErr(null); setLoading(true); setPage(1); setShowCompare(false); setSelectedIds(new Set());
    try{
      const params = new URLSearchParams({
        year: String(year),
        sector: industry, // FastAPI 后端用 "sector" 做行业参数
        top: "2000",
      });
      if(region)  params.set("region", region);
      if(scale)   params.set("scale", scale);
      if(country) params.set("country", country);
      if(nameQuery) params.set("name", nameQuery);

      const r = await fetch(`${API_BASE}/emissions/leaderboard?${params.toString()}`);
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      let data = await r.json();

      // 后端若暂不支持额外过滤，则前端兜底过滤
      if(nameQuery){ const q = nameQuery.toLowerCase(); data = data.filter(d => (d.name||"").toLowerCase().includes(q)); }
      if(country)  data = data.filter(d => (d.country||"") === country);
      if(region && region !== "Global") data = data.filter(d => (d.region||"") === region);
      if(scale)    data = data.filter(d => (d.scale||"") === scale);

      setRows(data);
    }catch(e){
      setErr(e?.message || "Failed to load data");
    }finally{
      setLoading(false);
    }
  }

  // 初次进入拉一次（可按需关闭）
  useEffect(()=>{ fetchData(); /* eslint-disable-next-line */ },[]);

  // Sort / page
  const sorted = useMemo(()=>{
    const data = [...rows];
    data.sort((a,b)=>{
      const av=a[sortKey], bv=b[sortKey];
      if(av===bv) return 0;
      if(av==null) return 1;
      if(bv==null) return -1;
      return av < bv ? -1 : 1;
    });
    return sortAsc ? data : data.reverse();
  },[rows,sortKey,sortAsc]);

  const paged = useMemo(()=>{
    const start=(page-1)*pageSize;
    return sorted.slice(start, start+pageSize);
  },[sorted,page]);

  // Selection
  function toggleOne(id){
    setSelectedIds(prev=>{ const next=new Set(prev); next.has(id)?next.delete(id):next.add(id); return next; });
  }
  function toggleAllPage(){
    const idsOnPage = paged.map(r=>r.company_id);
    const allSelected = idsOnPage.every(id=>selectedIds.has(id));
    setSelectedIds(prev=>{
      const next = new Set(prev);
      idsOnPage.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }
  function clearSelection(){ setSelectedIds(new Set()); }
  function addBaseline(){
    const next = new Set([...baselineIds, ...selectedIds]);
    setBaselineIds(next);
    localStorage.setItem("baseline_companies", JSON.stringify([...next]));
  }

  const selectedRows = useMemo(()=> sorted.filter(r=>selectedIds.has(r.company_id)), [sorted,selectedIds]);
  const comparison = useMemo(()=>{
    if(!selectedRows.length) return null;
    const best  = selectedRows.reduce((min,r)=> r.adj_intensity < min.adj_intensity ? r : min, selectedRows[0]);
    const worst = selectedRows.reduce((max,r)=> r.adj_intensity > max.adj_intensity ? r : max, selectedRows[0]);
    return {best, worst};
  },[selectedRows]);

  // Select/Unselect Page 动态标题
  const pageAllSelected = paged.length > 0 && paged.every(r => selectedIds.has(r.company_id));
  const togglePageLabel = pageAllSelected ? "Unselect Page" : "Select Page";

  return (
    <div className="home-container sr-container">
      <NavBar />
      <div className="main-content sr-main">

        {/* Left: keep homepage style */}
        <div className="left-panel">
          <button className="text-button" onClick={()=>navigate("/")}>← Back Home</button>
          <button className="text-button" onClick={fetchData}>{loading? "Loading..." : "Refresh"}</button>

          <div className="history">
            <h3 className="history-title">Baseline</h3>
            <div className="history-list" style={{maxHeight:160,overflow:"auto"}}>
              {[...baselineIds].map(id => (
                <div className="history-item" key={id}>{id}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: filters + table */}
        <div className="mid-panel" style={{ width: "53vw" }}>
          <div className="mid-panel-header">
            <h2>Industry Ranking & Comparison</h2>
            <hr className="header-hr" />
          </div>

          <div className="mid-panel-form" style={{ marginBottom: 8 }}>
            {/* 第一行四个筛选 */}
            <div className="form-row" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
              <div className="form-group">
                <label>Industry</label>
                <select value={industry} onChange={(e)=>setIndustry(e.target.value)}>
                  {DEFAULT_INDUSTRIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Region</label>
                <select value={region} onChange={(e)=>setRegion(e.target.value)}>
                  {DEFAULT_REGIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Scale</label>
                <select value={scale} onChange={(e)=>setScale(e.target.value)}>
                  <option value="">All</option>
                  {DEFAULT_SCALES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Country</label>
                <select value={country} onChange={(e)=>setCountry(e.target.value)}>
                  <option value="">All</option>
                  {DEFAULT_COUNTRIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* 第二行：名字搜索 + Year + 应用 */}
            <div className="form-row" style={{ display:"grid", gridTemplateColumns:"1fr 120px 120px", gap:8, marginTop:8 }}>
              <div className="form-group">
                <label>Search by name</label>
                <input value={nameQuery} onChange={e=>setNameQuery(e.target.value)} placeholder="Type company name…" />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input type="number" min={2000} max={currentYear} value={year} onChange={e=>setYear(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>&nbsp;</label>
                <button className="save-button" onClick={fetchData} disabled={loading}>{loading? "Loading..." : "Apply"}</button>
              </div>
            </div>
          </div>

          {/* —— 美观工具栏（粘性顶部） —— */}
          <div className="sr-toolbar">
            <div className="sr-toolbar-left">
              <button
                className="btn-primary"
                onClick={() => setShowCompare(true)}
                disabled={!selectedIds.size}
                aria-label="Compare selected companies"
                title="Compare selected companies"
              >
                Compare Selected
              </button>

              <button
                className="btn"
                onClick={addBaseline}
                disabled={!selectedIds.size}
                aria-label="Add selected to baseline"
                title="Add selected companies to baseline"
              >
                Add Baseline
              </button>

              <button
                className="btn-ghost"
                onClick={toggleAllPage}
                aria-label="Toggle selection for current page"
                title="Select/Unselect all on this page"
              >
                {togglePageLabel}
              </button>

              <button
                className="btn-link"
                onClick={clearSelection}
                disabled={!selectedIds.size}
                aria-label="Clear selection"
                title="Clear selection"
              >
                Clear
              </button>
            </div>

            <div className="sr-toolbar-right">
              <span className="chip">Selected {selectedIds.size}</span>
              <span className="chip chip-muted">{sorted.length} results</span>
            </div>
          </div>

          {/* 列表 */}
          <div className="uploaded-content" style={{ alignItems:"stretch" }}>
            {err && (
              <div style={{ border:"1px solid #e57373", background:"#ffebee", color:"#c62828", padding:"8px 12px", borderRadius:8, marginBottom:10 }}>
                Error: {err}
              </div>
            )}

            <div className="uploaded-content" style={{ alignItems:"stretch", maxHeight:"55vh", overflow:"auto", border:"1px solid #dbdbdb", borderRadius:10, padding:10, background:"#fff" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding:10 }}>
                      <input
                        type="checkbox"
                        onChange={toggleAllPage}
                        checked={paged.length>0 && paged.every(r=>selectedIds.has(r.company_id))}
                      />
                    </th>
                    {renderTH("Company","name")}
                    {renderTH("Total (tCO₂e)","total")}
                    {renderTH("Intensity","intensity")}
                    {renderTH("Adj Intensity","adj_intensity", true)}
                    {renderTH("Coverage","coverage")}
                    {renderTH("Audited","audited")}
                    {renderTH("YoY","yoy")}
                    {renderTH("Flags","anomaly_flags")}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`sk-${i}`}>
                        {/* 勾选框列 */}
                        <td style={{ padding: 10 }}>
                          <div style={{ height: 14, width: 16, background: "#eee", borderRadius: 4 }} />
                        </td>
                        {/* 其余 8 列骨架，和表头列数一致 */}
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={`skc-${i}-${j}`} style={{ padding: 10 }}>
                            <div style={{ height: 14, width: 80, background: "#eee", borderRadius: 6 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    paged.map((r) => {
                      const checked = selectedIds.has(r.company_id);
                      const isBaseline = baselineIds.has(r.company_id);
                      return (
                        <tr
                          key={r.company_id}
                          style={{
                            borderTop: "1px solid #f0f0f0",
                            background: checked ? "#f7fbff" : "transparent",
                          }}
                        >
                          {/* 勾选框列 */}
                          <td style={{ padding: 10 }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleOne(r.company_id)}
                            />
                          </td>

                          {/* Company */}
                          <td style={{ padding: 10 }}>
                            <div style={{ fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                              <span>{r.name || r.company_id}</span>
                              {isBaseline && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    padding: "2px 8px",
                                    border: "1px solid #b2dfdb",
                                    color: "#00695c",
                                    borderRadius: 999,
                                  }}
                                >
                                  Baseline
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: "#666" }}>{r.sector ?? industry}</div>
                          </td>

                          {/* Total */}
                          <td style={{ padding: 10 }}>{fmtNum(r.total, 0)}</td>
                          {/* Intensity */}
                          <td style={{ padding: 10 }}>{fmtNum(r.intensity, 4)}</td>
                          {/* Adj Intensity */}
                          <td style={{ padding: 10, fontWeight: 600 }}>{fmtNum(r.adj_intensity, 4)}</td>
                          {/* Coverage */}
                          <td style={{ padding: 10 }}>{fmtPct(r.coverage)}</td>
                          {/* Audited */}
                          <td style={{ padding: 10 }}>{r.audited ? "Yes" : "No"}</td>
                          {/* YoY */}
                          <td style={{ padding: 10 }}>{r.yoy == null ? "—" : fmtPct(r.yoy)}</td>
                          {/* Flags */}
                          <td style={{ padding: 10 }}>{r.anomaly_flags}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
              <div className="text-sm text-muted-foreground">
                Page {page} / {Math.max(1, Math.ceil(sorted.length / pageSize))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="save-button" style={{ background:"#eefaf9", color:"#128C7E" }} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
                <button className="save-button" onClick={()=>setPage(p => (p*pageSize<sorted.length ? p+1 : p))} disabled={page*pageSize>=sorted.length}>Next</button>
              </div>
            </div>

            {/* 对比结果 */}
            {showCompare && comparison && (
              <div
                ref={compareRef}
                style={{ marginTop:12, border:"1px solid #e0f2f1", background:"#f1fdfb", borderRadius:10, padding:12 }}
              >
                <div style={{ fontWeight:600, marginBottom:6 }}>Who performs best / worst (Adj Intensity)</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <div style={{ fontSize:12, color:"#388e3c" }}>Best</div>
                    <div style={{ fontWeight:700 }}>{comparison.best.name}</div>
                    <div style={{ fontSize:12, color:"#555" }}>Adj Intensity: {fmtNum(comparison.best.adj_intensity,4)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:12, color:"#d32f2f" }}>Worst</div>
                    <div style={{ fontWeight:700 }}>{comparison.worst.name}</div>
                    <div style={{ fontSize:12, color:"#555" }}>Adj Intensity: {fmtNum(comparison.worst.adj_intensity,4)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: 复用 SectorRightPanel（样式与 Home 一致，撑满右侧） */}
        <div className="divider"></div>
        <div className="right-panel sr-right">
          <SectorRightPanel />
        </div>
      </div>
    </div>
  );

  function renderTH(label, key, defaultAsc=true){
    const active = sortKey===key;
    return (
      <th
        style={{ textAlign:"left", padding:"10px", cursor:"pointer", userSelect:"none", whiteSpace:"nowrap" }}
        onClick={()=>{
          if(sortKey===key) setSortAsc(!sortAsc);
          else { setSortKey(key); setSortAsc(defaultAsc); }
        }}
        title="Sort"
      >
        <span style={{ fontWeight: active?700:500 }}>{label}</span>
        <span style={{ marginLeft:6, opacity:0.7 }}>▾</span>
      </th>
    );
  }
}
