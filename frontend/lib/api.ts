const dev = 'https://jamaica-revolution-analyses-sf.trycloudflare.com';
const prod = 'https://nehes-israel-system-backend.onrender.com';
const local = 'http://127.0.0.1:5000';
const BACKEND_URL = process.env.NODE_ENV === 'development' ? dev : prod;

export async function bridgeCall(agentNumber: string, customerNumbers: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/trigger_target_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentNumber,
      numbers: [customerNumbers]
    }),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }
}

export async function tripleCallLeads(agentNumber: string, leads: Lead[]): Promise<TripleCallResult> {
  const leadsNumbers = leads.map((lead) => lead.phoneNumber)

  // Ensure we have at least 3 leads
  if (leads.length < 3 || leads.some((lead, index) => leads.findIndex(l => l.phoneNumber === lead.phoneNumber) !== index)) {
    throw new Error("Leads are not valid. Please check the leads numbers.");
  }

  const formattedLeads = leadsNumbers.map((lead) => "+972" + (lead.startsWith('0') ? lead.slice(1) : lead));
  const formattedAgentNumber = "+972" + (agentNumber.startsWith('0') ? agentNumber.slice(1) : agentNumber);

  // Trigger the call
  const callResponse = await fetch(`${BACKEND_URL}/api/twilio/trigger_target_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: formattedAgentNumber,
      numbers: formattedLeads,
    }),
  });

  if (!callResponse.ok) {
    throw new Error(`API error: ${callResponse.status} - ${await callResponse.text()}`);
  }

  return {
    success: true,
    message: `Successfully initiated calls to ${leads.length} leads`,
    leads: leads,
  };
}

export async function fetchMongoData(): Promise<any[]> {
  const response = await fetch(`${BACKEND_URL}/api/mongo-data`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }
  return await response.json();
}

// interfaces
export interface Lead {
  id: string;
  phoneNumber: string;
  name?: string;
}
export interface TripleCallResult {
  success: boolean;
  message: string;
  leads: Lead[];
}
export type CallRecord = {
  id?: string
  full_name?: string
  phoneNumber?: string
  phone_number?: string
  customerNumber: string
  agentNumber: string
  timestamp: string
  status: string
  duration: number
  isCalled?: string
}
export interface TripleCallResult {
  success: boolean
  message: string
  leads: Lead[]
}
