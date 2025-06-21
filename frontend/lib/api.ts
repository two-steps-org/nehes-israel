import { ActiveLeads, Lead } from "@/types/activeLeads.type";

const dev = process.env.NEXT_PUBLIC_DEV_URL;
const prod = process.env.NEXT_PUBLIC_SERVER_URL;

const BACKEND_URL = process.env.NODE_ENV === 'development' ? dev : prod;

export async function bridgeCall(agentNumber: string, customerNumbers: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/twilio/trigger_target_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
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
  const leadsNumbers = leads.map((lead) => lead.phone_number)

  // Ensure we have at least 3 leads
  if (leads.length < 3 || leads.some((lead, index) => leads.findIndex(l => l.phone_number === lead.phone_number) !== index)) {
    throw new Error("Leads are not valid. Please check the leads numbers.");
  }

  const formattedLeads = leadsNumbers.map((lead) => "+972" + (lead.startsWith('0') ? lead.slice(1) : lead));
  const formattedAgentNumber = "+972" + (agentNumber.startsWith('0') ? agentNumber.slice(1) : agentNumber);

  // Trigger the call
  const callResponse = await fetch(`${BACKEND_URL}/api/twilio/trigger_target_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
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

export async function fetchActiveLeads(page: number = 1, pageSize: number = 20, search: string = ""): Promise<ActiveLeads> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`${BACKEND_URL}/api/leads-data?page=${page}&pageSize=${pageSize}${searchParam}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }
  return await response.json() as ActiveLeads;
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
