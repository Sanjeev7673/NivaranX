import type { CaseState } from "./types";
export function runNivaranAgents(story:string):CaseState{
  const text=story.toLowerCase();
  const amountMatch=story.match(/₹\s?([\d,]+)/);
  const amount=amountMatch?Number(amountMatch[1].replace(/,/g,"")):null;
  const transaction=/transaction|shares|stock|broker|deduct|settlement|credit/.test(text);
  const communication=/called|contacted|emailed|customer care|complaint/.test(text);
  const missing:string[]=[];
  if(!/date|yesterday|today|last week|on \d/.test(text)) missing.push("Transaction / incident date");
  if(!/reference|id|order/.test(text)) missing.push("Transaction or complaint reference");
  if(!/want|resolve|refund|credit|reverse|correct/.test(text)) missing.push("Requested resolution");
  const readiness=Math.max(35,100-missing.length*15);
  return {
    caseId:`NV-${new Date().getFullYear()}-${Math.floor(1000+Math.random()*9000)}`,
    issue:story.trim(),
    category:transaction?"Transaction / intermediary grievance":"Investor issue — needs classification",
    entity:/broker/.test(text)?"Broker / intermediary":null,
    amount,
    timeline:/yesterday/.test(text)?"Yesterday":null,
    communicationAttempted:communication,
    requestedResolution:/refund/.test(text)?"Refund / reversal":null,
    evidence:[],
    readiness,
    missing,
    nextAction:missing.length?`Collect ${missing.length} missing case detail${missing.length>1?"s":""} before preparing a final grievance.`:"Case information is sufficiently structured for the next official grievance step.",
    sources:[{title:"Official grievance mechanism — verify applicability",url:"https://scores.sebi.gov.in/",status:"verified"}],
    agentTrace:[
      {agent:"Orchestrator",status:"complete",note:"Selected case-analysis workflow."},
      {agent:"Case Analyst",status:"complete",note:"Converted the narrative into structured case fields."},
      {agent:"Evidence Agent",status:"waiting",note:"No evidence file supplied yet."},
      {agent:"Rights Agent",status:"complete",note:"Returned a source-grounded navigation placeholder."},
      {agent:"Verification Agent",status:"guardrail",note:"Regulatory claims must be verified against current authoritative sources."},
      {agent:"Readiness Agent",status:"complete",note:"Calculated explainable completeness from missing fields."}
    ]
  };
}