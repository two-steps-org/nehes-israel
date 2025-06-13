// Mock API functions for Twilio integration

const BACKEND_URL = 'https://nehes-israel-system-backend.onrender.com';
export const LOCAL_BACKEND_URL = 'http://localhost:8080';
//const LOCAL_BACKEND_URL = 'https://f21e-143-44-168-187.ngrok-free.app';

export async function bridgeCall(agentNumber: string, customerNumbers: string[]): Promise<void> {
  // console.log(agentNumber)
  // console.log(customerNumbers)
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
  name: string;
}

export interface TripleCallResult {
  success: boolean;
  message: string;
  leads: Lead[];
}

export async function tripleCallLeads(agentNumber: string): Promise<TripleCallResult> {
  // Numbers to dial (you can fetch from CRM/API elsewhere—hardcoded for this example)
  const leads: Lead[] = [
    { id: "lead1", phoneNumber: "+972544831148", name: "Yoni" },
    { id: "lead2", phoneNumber: "+972502300180", name: "Ziv" },
    { id: "lead3", phoneNumber: "+972543190987", name: "Tal" },
  ];

  // TODO: add a loading state
  const response = await fetch(`${LOCAL_BACKEND_URL}/trigger_target_call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent: agentNumber,
      //numbers: leads.map((lead) => lead.phoneNumber),
      numbers: [leads[1].phoneNumber],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} - ${await response.text()}`);
  }

  // Optionally, you can parse backend response if you want more info
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




export interface Lead {
  id: string
  phoneNumber: string
  name: string
}

export interface TripleCallResult {
  success: boolean
  message: string
  leads: Lead[]
}
