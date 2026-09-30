type AgentResult = Record<string, unknown>;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const baseGuardrails = `You are part of NIVARAN X, an investor awareness and grievance-navigation system for Track B: Investor Awareness, Rights & Grievance. Never provide individualized investment advice, guarantee compensation or outcomes, fabricate regulations, or turn uncertainty into fact. Do not request or expose passwords, OTPs, PINs, CVV, private keys, or unnecessary personal data. Return valid JSON only.`;

async function ask(system: string, input: unknown): Promise<AgentResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured on the server.");
  const response = await fetch(`${API_URL}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
      systemInstruction: { parts: [{ text: `${baseGuardrails}\n\n${system}` }] },
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    }),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);
  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("");
  if (!text) throw new Error("Gemini returned an empty response.");
  return JSON.parse(text);
}

export async function runRealNivaranAgents(story: string) {
  const orchestrator = await ask(`You are the Orchestrator Agent. Classify the investor story, identify the issue, entity, amount, timeline, communication history, requested resolution, missing information, and required specialist agents. Do not infer absent facts.`, { story });

  const context = { story, orchestrator };
  const [caseAnalysis, evidence, rights] = await Promise.all([
    ask(`You are the Case Analyst Agent. Reconstruct the incident into a chronological, factual case. Extract known facts, contradictions and missing fields.`, context),
    ask(`You are the Evidence Agent. Identify evidence already mentioned, map evidence to claims, flag missing supporting material, and identify privacy-sensitive material that should not be shared unnecessarily.`, context),
    ask(`You are the Rights Navigator Agent. Identify the potentially relevant grievance mechanism and explain the procedural next step. Use only official-source-oriented guidance. If applicability cannot be established from the input, explicitly say so. Do not invent regulations or URLs.`, context)
  ]);

  const verification = await ask(`You are the Verification and Safety Guardrail Agent. Audit the orchestrator, case, evidence and rights outputs. Flag unsupported claims, invented rules, unsafe advice, privacy issues and unverified sources. Mark uncertain claims UNVERIFIED.`, { ...context, caseAnalysis, evidence, rights });

  const readiness = await ask(`You are the Grievance Readiness Agent. Evaluate information completeness only, not legal merit or likelihood of success. Produce an explainable 0-100 readiness score, completed fields, missing fields, critical missing fields and a safe next action.`, { ...context, caseAnalysis, evidence, rights, verification });

  return {
    caseId: `NV-${Date.now()}`,
    issue: story,
    orchestrator,
    caseAnalysis,
    evidence,
    rights,
    verification,
    readiness,
    agentTrace: [
      { agent: "Orchestrator", status: "complete" },
      { agent: "Case Analyst", status: "complete" },
      { agent: "Evidence Agent", status: "complete" },
      { agent: "Rights Navigator", status: "complete" },
      { agent: "Verification Guardrail", status: "complete" },
      { agent: "Readiness Agent", status: "complete" }
    ]
  };
}
