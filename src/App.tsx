import React, { useState, useRef, useCallback } from "react";

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');`;

const TEMPLATES = [
  { id:"classic",    label:"Classic",       desc:"Timeless sidebar elegance" },
  { id:"executive",  label:"Executive",     desc:"Gold-accented authority"   },
  { id:"creative",   label:"Creative",      desc:"Editorial bold header"     },
  { id:"minimal",    label:"Minimal",       desc:"Clean Swiss precision"     },
  { id:"corporate",  label:"Corporate",     desc:"Navy professional"         },
  { id:"luxurySerif",label:"Luxury Serif",  desc:"Warm refined serif"        },
  { id:"techNeon",   label:"Tech Neon",     desc:"Dark code aesthetic"       },
  { id:"startup",    label:"Startup",       desc:"Purple modern energy"      },
];

const TONES = ["Professional","Confident","Creative","Conversational","Formal"];

const TPL_STYLES = {
  classic:    { bg:"#FFFDF9", sidebar:"#1C2B3A", sidebarText:"#E8DFC8", acc:"#B8973A", fd:"'Cormorant Garamond',serif", fb:"'Outfit',sans-serif", headerBg:"#FFFDF9", headerText:"#0D1B2A" },
  executive:  { bg:"#FFFFFF", sidebar:"#0A0A0A", sidebarText:"#D4AF37", acc:"#D4AF37", fd:"'Cormorant Garamond',serif", fb:"'Outfit',sans-serif", headerBg:"#0A0A0A", headerText:"#D4AF37" },
  creative:   { bg:"#F7F4EF", sidebar:"#1A1A1A", sidebarText:"#F0EDE8", acc:"#C0392B", fd:"'Playfair Display',serif",    fb:"'DM Sans',sans-serif",    headerBg:"#1A1A1A", headerText:"#FFFFFF" },
  minimal:    { bg:"#FFFFFF", sidebar:"#FAFAFA",  sidebarText:"#333333", acc:"#999999", fd:"'DM Sans',sans-serif",         fb:"'DM Sans',sans-serif",    headerBg:"#FAFAFA",  headerText:"#111111" },
  corporate:  { bg:"#FFFFFF", sidebar:"#1A2744",  sidebarText:"#D8E4F8", acc:"#2A5098", fd:"'Outfit',sans-serif",          fb:"'DM Sans',sans-serif",    headerBg:"#1A2744",  headerText:"#FFFFFF" },
  luxurySerif:{ bg:"#FDFAF4", sidebar:"#2C1810",  sidebarText:"#F5E8CC", acc:"#8B6914", fd:"'EB Garamond',serif",          fb:"'Cormorant Garamond',serif",headerBg:"#2C1810",headerText:"#F5E8CC"},
  techNeon:   { bg:"#080E1C", sidebar:"#050A14",  sidebarText:"#7DFFD6", acc:"#00FFB2", fd:"'Space Grotesk',sans-serif",   fb:"'Space Grotesk',sans-serif",headerBg:"#050A14",headerText:"#00FFB2"},
  startup:    { bg:"#FFFFFF", sidebar:"#0F0F23",  sidebarText:"#E0E0FF", acc:"#6C5CE7", fd:"'Space Grotesk',sans-serif",   fb:"'DM Sans',sans-serif",    headerBg:"#0F0F23",  headerText:"#E0E0FF" },
};

const today = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

export default function CoverLetterBuilder() {
  const [template, setTemplate] = useState("classic");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const letterRef = useRef(null);

  const [form, setForm] = useState({
    name:"Alexandra Whitmore", jobTitle:"Chief Executive Officer",
    company:"Meridian Capital Group", industry:"Executive Leadership",
    email:"a.whitmore@company.com", phone:"+1 (212) 555-0190",
    location:"New York, NY", linkedin:"linkedin.com/in/awhitmore",
    hiringManager:"Hiring Manager",
    keyPoints:"20+ years leading Fortune 500 companies, scaled revenue from $200M to $2B+, led 12,000-person workforce across 28 countries",
    tone:"Professional",
    letterBody:`Dear Hiring Manager,\n\nI am writing to express my strong interest in the Chief Executive Officer position at Meridian Capital Group. With over two decades of experience leading Fortune 500 organizations through transformational growth, I am confident in my ability to drive meaningful results for your company.\n\nThroughout my career, I have demonstrated a proven track record of scaling organizations from $200M to over $2B in revenue while cultivating high-performance cultures. My experience leading a 12,000-person workforce across 28 countries has equipped me with the strategic vision and operational excellence needed to excel in this role.\n\nI am particularly drawn to Meridian Capital Group's commitment to innovation and global expansion. I believe my expertise in M&A strategy, P&L management, and board relations aligns perfectly with your organizational goals.\n\nI would welcome the opportunity to discuss how my experience can contribute to Meridian Capital Group's continued success. Thank you for your consideration.\n\nSincerely,\nAlexandra Whitmore`,
  });

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const s = TPL_STYLES[template];

  const generateLetter = async () => {
    if (!form.name || !form.jobTitle || !form.company) {
      setError("Please fill in your name, job title, and company first.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const prompt = "Write a compelling, " + form.tone.toLowerCase() + " cover letter for " + form.name + " applying for the position of " + form.jobTitle + " at " + form.company + " in the " + form.industry + " industry.\n\nKey points to highlight: " + form.keyPoints + "\n\nRequirements:\n- Address it to \"" + form.hiringManager + "\"\n- 3-4 paragraphs, professional and engaging\n- Highlight the key points naturally\n- End with a strong call to action\n- Sign off with: " + form.name + "\n- Do NOT include date or address headers\n- Tone: " + form.tone + "\n- Keep it under 350 words";

      const response = await fetch("/api/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.content && data.content[0]?.text) {
        upd("letterBody", data.content[0].text.trim());
      } else {
        setError("Generation failed. Please try again.");
      }
    } catch(e) {
      setError("Connection error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const exportHTML = () => {
    if (!letterRef.current) return;
    const root = letterRef.current;
    const rootStyle = getComputedStyle(root);
    const varMap = {};
    ["--acc","--fd","--fb","--sbg","--stx","--mbg"].forEach(function(v){
      varMap[v] = rootStyle.getPropertyValue(v).trim();
    });
    const resolveStyle = function(styleStr) {
      if (!styleStr) return styleStr;
      let result = styleStr;
      Object.keys(varMap).forEach(function(key){
        result = result.split("var("+key+")").join(varMap[key]||"");
        result = result.split("var("+key+" )").join(varMap[key]||"");
      });
      return result;
    };
    const clone = root.cloneNode(true);
    const allEls = [clone].concat(Array.from(clone.querySelectorAll("*")));
    allEls.forEach(function(el){
      const sa = el.getAttribute("style");
      if (sa) el.setAttribute("style", resolveStyle(sa));
    });
    const FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap";
    const fullHTML = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><title>Cover Letter</title>"
      + "<link rel=\"stylesheet\" href=\"" + FONTS + "\"/>"
      + "<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}"
      + "html,body{margin:0;padding:0;background:white;width:100%;}"
      + ".cl-doc{width:100%!important;min-height:297mm;}"
      + "@page{size:A4 portrait;margin:0;}"
      + "@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}}"
      + "</style></head><body>"
      + clone.outerHTML
      + "<scr"+"ipt>document.fonts.ready.then(function(){setTimeout(function(){window.print();},600);});<\/script>"
      + "</body></html>";
    const blob = new Blob([fullHTML],{type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "cover-letter.html"; a.click();
    URL.revokeObjectURL(url);
  };

  const isSidebar = !["minimal","corporate"].includes(template);

  return (
    <>
      <style>{`
        ${GOOGLE_FONTS}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{background:#0A0C14;font-family:'DM Sans',sans-serif;}

        .shell{display:flex;flex-direction:column;background:#0A0C14;}

        /* Panel */
        .panel{width:100%;background:#10121C;border-bottom:1px solid #1C1F30;display:flex;flex-direction:column;}
        .ph{padding:16px 22px 12px;border-bottom:1px solid #181A28;background:#0D0F18;display:flex;align-items:center;justify-content:space-between;}
        .ph-left h1{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;color:#F0EAD6;letter-spacing:.02em;}
        .ph-left p{font-size:10.5px;color:#3A3E58;margin-top:1px;}
        .gen-btn{padding:10px 20px;background:linear-gradient(135deg,#B8973A,#8B6914);border:none;border-radius:7px;color:#0D0E14;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;letter-spacing:.04em;transition:all .18s;white-space:nowrap;}
        .gen-btn:hover{transform:translateY(-1px);filter:brightness(1.1);}
        .gen-btn:disabled{opacity:.5;cursor:wait;transform:none;}

        /* Template strip */
        .tpl-strip{display:flex;gap:6px;padding:10px 22px;border-bottom:1px solid #181A28;overflow-x:auto;scrollbar-width:none;}
        .tpl-strip::-webkit-scrollbar{display:none;}
        .tcard{flex-shrink:0;padding:6px 12px;background:#161826;border:1px solid #222438;border-radius:6px;cursor:pointer;transition:all .14s;text-align:center;}
        .tcard:hover{border-color:#32355A;}
        .tcard.on{background:#18203A;border-color:#B8973A;}
        .tcard-name{font-size:11px;color:#8A8EAA;font-family:'DM Sans',sans-serif;display:block;}
        .tcard.on .tcard-name{color:#D4AF37;}
        .tcard-desc{font-size:9px;color:#3A3E58;font-family:'DM Sans',sans-serif;display:block;margin-top:1px;}

        /* Form area */
        .form-body{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #181A28;}
        .form-col{padding:16px 22px;}
        .form-col+.form-col{border-left:1px solid #181A28;}
        .section-label{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#B8973A;font-family:'DM Sans',sans-serif;margin-bottom:10px;display:block;}
        .fg{margin-bottom:11px;}
        .flabel{display:block;font-size:9.5px;color:#40445E;letter-spacing:.07em;text-transform:uppercase;margin-bottom:3px;font-family:'DM Sans',sans-serif;}
        .fi{width:100%;background:#161826;border:1px solid #222438;border-radius:5px;padding:6px 10px;font-size:12px;color:#A8ACCB;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .13s;}
        .fi:focus{border-color:#B8973A;}
        .fi::placeholder{color:#282A40;}
        textarea.fi{resize:vertical;min-height:60px;line-height:1.5;}
        .frow{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .tone-row{display:flex;gap:5px;flex-wrap:wrap;}
        .tone-btn{padding:4px 10px;background:#161826;border:1px solid #222438;border-radius:4px;cursor:pointer;font-size:10px;color:#4A4E68;font-family:'DM Sans',sans-serif;transition:all .13s;}
        .tone-btn:hover{color:#8A8EAA;border-color:#32355A;}
        .tone-btn.on{background:#18203A;border-color:#B8973A;color:#D4AF37;}

        /* Letter body editor */
        .letter-edit-wrap{padding:0 22px 16px;}
        .letter-textarea{width:100%;background:#0E1020;border:1px solid #222438;border-radius:6px;padding:14px 16px;font-size:12.5px;color:#C8CCDA;font-family:'DM Sans',sans-serif;line-height:1.8;resize:vertical;min-height:180px;outline:none;transition:border-color .13s;}
        .letter-textarea:focus{border-color:#B8973A;}

        /* Error */
        .err-bar{background:#2A1010;border:1px solid #5A2020;border-radius:6px;padding:8px 14px;margin:0 22px 10px;font-size:11px;color:#DD6666;font-family:'DM Sans',sans-serif;}

        /* Print bar */
        .pbar{padding:11px 22px;border-top:1px solid #181A28;background:#0D0F18;display:flex;gap:8px;align-items:center;}
        .pbtn{flex:1;padding:10px;background:linear-gradient(135deg,#2A4EBB,#1A3A9E);border:none;border-radius:7px;color:#E0E8FF;font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer;letter-spacing:.04em;transition:all .17s;}
        .pbtn:hover{background:linear-gradient(135deg,#3A5ECC,#2A4ABA);transform:translateY(-1px);}
        .pinfo{font-size:10px;color:#3A3E58;font-family:'DM Sans',sans-serif;}

        /* Preview */
        .preview{background:#07080E;padding:28px 16px 48px;display:flex;justify-content:flex-start;overflow-x:auto;}

        /* Cover letter doc */
        .cl-doc{width:794px;flex-shrink:0;background:white;box-shadow:0 20px 80px rgba(0,0,0,.7);overflow:visible;}

        @media print{
          body{background:white!important;}
          .panel{display:none!important;}
          .preview{padding:0!important;background:white!important;}
          .cl-doc{width:100%!important;box-shadow:none!important;}
          .shell{height:auto!important;}
        }
      `}</style>

      <div className="shell">
        <aside className="panel">
          {/* Header */}
          <div className="ph">
            <div className="ph-left">
              <h1>Cover Letter Builder</h1>
              <p>Professional · AI-Powered · Instant Export</p>
            </div>
            <button className="gen-btn" onClick={generateLetter} disabled={generating}>
              {generating ? "✦ Writing your letter…" : "✦ Generate with AI"}
            </button>
          </div>

          {/* Template picker */}
          <div className="tpl-strip">
            {TEMPLATES.map(t=>(
              <div key={t.id} className={`tcard ${template===t.id?"on":""}`} onClick={()=>setTemplate(t.id)}>
                <span className="tcard-name">{t.label}</span>
                <span className="tcard-desc">{t.desc}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="form-body">
            {/* Col 1 — Your info */}
            <div className="form-col">
              <span className="section-label">Your Information</span>
              <div className="fg"><label className="flabel">Full Name</label>
                <input className="fi" value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Your full name"/></div>
              <div className="frow">
                <div className="fg"><label className="flabel">Email</label>
                  <input className="fi" value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="email@example.com"/></div>
                <div className="fg"><label className="flabel">Phone</label>
                  <input className="fi" value={form.phone} onChange={e=>upd("phone",e.target.value)} placeholder="+1 (555) 000-0000"/></div>
              </div>
              <div className="frow">
                <div className="fg"><label className="flabel">Location</label>
                  <input className="fi" value={form.location} onChange={e=>upd("location",e.target.value)} placeholder="City, State"/></div>
                <div className="fg"><label className="flabel">LinkedIn</label>
                  <input className="fi" value={form.linkedin} onChange={e=>upd("linkedin",e.target.value)} placeholder="linkedin.com/in/..."/></div>
              </div>
              <div className="fg"><label className="flabel">Tone</label>
                <div className="tone-row">
                  {TONES.map(t=>(
                    <button key={t} className={`tone-btn ${form.tone===t?"on":""}`} onClick={()=>upd("tone",t)}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2 — Job info */}
            <div className="form-col">
              <span className="section-label">Job & AI Settings</span>
              <div className="frow">
                <div className="fg"><label className="flabel">Your Job Title</label>
                  <input className="fi" value={form.jobTitle} onChange={e=>upd("jobTitle",e.target.value)} placeholder="e.g. Software Engineer"/></div>
                <div className="fg"><label className="flabel">Industry</label>
                  <input className="fi" value={form.industry} onChange={e=>upd("industry",e.target.value)} placeholder="e.g. Technology"/></div>
              </div>
              <div className="frow">
                <div className="fg"><label className="flabel">Target Company</label>
                  <input className="fi" value={form.company} onChange={e=>upd("company",e.target.value)} placeholder="Company name"/></div>
                <div className="fg"><label className="flabel">Hiring Manager</label>
                  <input className="fi" value={form.hiringManager} onChange={e=>upd("hiringManager",e.target.value)} placeholder="Name or 'Hiring Manager'"/></div>
              </div>
              <div className="fg"><label className="flabel">Key Points to Highlight</label>
                <textarea className="fi" rows={3} value={form.keyPoints} onChange={e=>upd("keyPoints",e.target.value)}
                  placeholder="Your top achievements, skills, or experiences to include in the letter…"/></div>
            </div>
          </div>

          {/* Error */}
          {error&&<div className="err-bar">{error}</div>}

          {/* Letter body editor */}
          <div className="letter-edit-wrap">
            <label className="flabel" style={{marginBottom:6,display:"block"}}>Letter Body — Edit freely after generation</label>
            <textarea className="letter-textarea" rows={8} value={form.letterBody}
              onChange={e=>upd("letterBody",e.target.value)}
              placeholder="Click 'Generate with AI' to write your letter, or type it manually here…"/>
          </div>

          {/* Print bar */}
          <div className="pbar">
            <button className="pbtn" onClick={exportHTML}>⬇ &nbsp;Download Cover Letter</button>
            <span className="pinfo">Opens in browser → Print → Save as PDF · Enable background graphics</span>
          </div>
        </aside>

        {/* Preview */}
        <div className="preview">
          <CoverLetterDoc form={form} tpl={template} s={s} docRef={letterRef}/>
        </div>
      </div>
    </>
  );
}

function CoverLetterDoc({form, tpl, s, docRef}) {
  const isSidebar = !["minimal","corporate"].includes(tpl);
  const isNeon = tpl==="techNeon";
  const bodyLines = (form.letterBody||"").split("\n");

  const cssVars = {
    "--acc":s.acc, "--fd":s.fd, "--fb":s.fb,
    "--sbg":s.sidebar, "--stx":s.sidebarText,
    "--mbg":s.bg,
  };

  return (
    <div ref={docRef} className="cl-doc" style={{...cssVars, background:s.bg, display:"flex", minHeight:794, fontFamily:s.fb}}>
      {/* SIDEBAR */}
      {isSidebar&&(
        <div style={{width:210,minWidth:210,background:s.sidebar,color:s.sidebarText,display:"flex",flexDirection:"column",minHeight:794}}>
          {/* Accent bar */}
          <div style={{height:4,background:s.acc,width:"100%"}}/>

          {/* Identity block */}
          <div style={{padding:"28px 20px 22px",borderBottom:`1px solid ${s.acc}22`,marginBottom:16,textAlign:"center"}}>
            {isNeon&&<div style={{fontSize:9,letterSpacing:".3em",color:s.acc,marginBottom:8,fontFamily:s.fd}}>COVER_LETTER.doc</div>}
            <div style={{width:64,height:64,borderRadius:"50%",border:`2px solid ${s.acc}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:s.fd,fontSize:20,fontWeight:600,color:s.acc,margin:"0 auto 12px"}}>
              {(form.name||"AB").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{fontFamily:s.fd,fontSize:14,fontWeight:600,color:s.sidebarText,marginBottom:4}}>{form.name||"Your Name"}</div>
            <div style={{fontSize:10,color:s.acc,letterSpacing:".1em",textTransform:"uppercase"}}>{form.jobTitle||"Your Title"}</div>
          </div>

          {/* Contact */}
          <div style={{padding:"0 18px 18px"}}>
            <div style={{fontSize:8,letterSpacing:".18em",textTransform:"uppercase",color:s.acc,marginBottom:10,fontFamily:s.fb}}>Contact</div>
            {form.email&&<div style={{fontSize:10.5,color:s.sidebarText,opacity:.8,marginBottom:6,fontFamily:s.fb,wordBreak:"break-all"}}>{form.email}</div>}
            {form.phone&&<div style={{fontSize:10.5,color:s.sidebarText,opacity:.8,marginBottom:6,fontFamily:s.fb}}>{form.phone}</div>}
            {form.location&&<div style={{fontSize:10.5,color:s.sidebarText,opacity:.8,marginBottom:6,fontFamily:s.fb}}>{form.location}</div>}
            {form.linkedin&&<div style={{fontSize:10,color:s.acc,opacity:.85,marginBottom:6,fontFamily:s.fb,wordBreak:"break-all"}}>{form.linkedin}</div>}
          </div>

          {/* Date */}
          <div style={{padding:"0 18px 18px",marginTop:"auto"}}>
            <div style={{fontSize:8,letterSpacing:".18em",textTransform:"uppercase",color:s.acc,marginBottom:8,fontFamily:s.fb}}>Date</div>
            <div style={{fontSize:10.5,color:s.sidebarText,opacity:.7,fontFamily:s.fb}}>{today}</div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",background:s.bg,minHeight:794}}>

        {/* Header bar for non-sidebar layouts */}
        {!isSidebar&&(
          <div style={{background:s.headerBg,padding:"32px 40px 24px",borderBottom:`2px solid ${s.acc}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <div style={{fontFamily:s.fd,fontSize:26,fontWeight:700,color:s.headerText,marginBottom:4}}>{form.name||"Your Name"}</div>
                <div style={{fontSize:11,color:s.acc,letterSpacing:".14em",textTransform:"uppercase",fontFamily:s.fb}}>{form.jobTitle||"Your Title"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {form.email&&<div style={{fontSize:10.5,color:s.headerText==="#FFFFFF"?"rgba(255,255,255,.7)":"rgba(0,0,0,.5)",marginBottom:2,fontFamily:s.fb}}>{form.email}</div>}
                {form.phone&&<div style={{fontSize:10.5,color:s.headerText==="#FFFFFF"?"rgba(255,255,255,.7)":"rgba(0,0,0,.5)",marginBottom:2,fontFamily:s.fb}}>{form.phone}</div>}
                {form.location&&<div style={{fontSize:10.5,color:s.headerText==="#FFFFFF"?"rgba(255,255,255,.7)":"rgba(0,0,0,.5)",fontFamily:s.fb}}>{form.location}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Accent line */}
        {isSidebar&&<div style={{height:4,background:s.acc,opacity:.2}}/>}

        {/* Letter content */}
        <div style={{padding:"32px 40px",flex:1}}>
          {/* Date for sidebar layouts */}
          {!isSidebar&&(
            <div style={{fontSize:12,color:s.acc,marginBottom:20,fontFamily:s.fb}}>{today}</div>
          )}

          {/* Recipient */}
          <div style={{marginBottom:24}}>
            <div style={{fontFamily:s.fb,fontSize:12,color:s.bg===s.sidebar?"rgba(255,255,255,.6)":(tpl==="techNeon"?"#7DFFD6":"rgba(0,0,0,.5)"),marginBottom:2}}>{form.hiringManager||"Hiring Manager"}</div>
            <div style={{fontFamily:s.fb,fontSize:12,fontWeight:500,color:tpl==="techNeon"?"#C8E8FF":s.bg==="0A0A0A"?"#E8E0CC":"#111",marginBottom:2}}>{form.company||"Company Name"}</div>
          </div>

          {/* Letter body */}
          <div style={{fontFamily:s.fb,fontSize:12.5,lineHeight:1.85,color:tpl==="techNeon"?"#C8E8FF":tpl==="execblack"?"#E8E0CC":"#222"}}>
            {bodyLines.map((line,i)=>(
              <p key={i} style={{marginBottom: line.trim()==="" ? 14 : 0, minHeight: line.trim()===""?14:undefined}}>
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Footer accent */}
        <div style={{height:4,background:s.acc,opacity:.15,marginTop:"auto"}}/>
      </div>
    </div>
  );
}
