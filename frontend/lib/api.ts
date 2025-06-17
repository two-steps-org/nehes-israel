// Mock API functions for Twilio integration

const BACKEND_URL = 'https://nehes-israel-system-backend.onrender.com';
export const LOCAL_BACKEND_URL = 'http://127.0.0.1:5001';
//const LOCAL_BACKEND_URL = 'https://f21e-143-44-168-187.ngrok-free.app';

export async function bridgeCall(agentNumber: string, customerNumbers: string[]): Promise<void> {
  console.log(agentNumber);
  console.log(customerNumbers);
  const response = await fetch(`${BACKEND_URL}/trigger_target_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentNumber,
      numbers: customerNumbers
    }),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }
}

export async function fetchMongoData(): Promise<any[]> {
  const response = await fetch(`${LOCAL_BACKEND_URL}/api/mongo-data`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }
  return await response.json();
}

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

// TODO: need to implement this function with leads
export async function tripleCallLeads(agentNumber: string, leads: Lead[]): Promise<TripleCallResult> {
  // Ensure we have at least 3 leads
  console.log("hereeeeee");
  console.log(leads);

  if (leads.length < 3) {
    throw new Error("The are no leads with 'חדש' to initiate triple call.");
  }

  if (agentNumber.length < 1) {
    throw new Error("Agent number must be 10 digits.");
  }

  const formattedLeads = leads.map((lead) => `+972${lead.phoneNumber}`);
  console.log(formattedLeads);

  // Trigger the call
  const callResponse = await fetch(`${LOCAL_BACKEND_URL}/trigger_target_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentNumber,
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
