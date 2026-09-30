export type CaseState = {
  caseId:string;
  issue:string;
  category:string;
  entity:string|null;
  amount:number|null;
  timeline:string|null;
  communicationAttempted:boolean;
  requestedResolution:string|null;
  evidence:{name:string;type:string;status:"verified"|"needs-review"}[];
  readiness:number;
  missing:string[];
  nextAction:string;
  sources:{title:string;url:string;status:"verified"|"needs-review"}[];
  agentTrace:{agent:string;status:"complete"|"waiting"|"guardrail";note:string}[];
};