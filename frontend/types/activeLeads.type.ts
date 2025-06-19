export type ActiveLeads = {
    data: Lead[]
    metadata: Metadata
}

type Metadata = {
    page: number
    pageSize: number
    total: number
    totalPages: number
}

export type Lead = {
    _id: string;
    createdAt: string;
    phone_number: string;
    meeting_scheduled: string;
    meeting_attended: string;
    isNew?: boolean;
    handled_by?: string;
    campaign?: string;
    channel?: string;
    date?: string;
    email?: string;
    facebook_campaign?: string;
    facebook_platform?: string;
    full_name?: string;
    ip?: string;
    isCalled?: string;
    note?: string;
    record_number?: number;
    routes?: number;
    status?: string;
    time?: string
    timestamp?: string
    vendor?: string;
}