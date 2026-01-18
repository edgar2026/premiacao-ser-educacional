// Types for the Premiações Ser Educacional system

export interface Award {
    id: string;
    title: string;
    category: string;
    semester: string;
    unit: string;
    date: string;
    description?: string;
}

export interface Honoree {
    id: string;
    name: string;
    photo: string;
    role: string;
    category: string;
    unit: string;
    yearsOfService: number;
    totalAwards: number;
    projectsLed: number;
    units: number;
    bio: string;
    awards: Award[];
}

export interface DashboardMetric {
    label: string;
    value: number | string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    badge?: string;
}

export interface RegionalData {
    name: string;
    value: number;
    percentage: number;
}

export interface TrendData {
    quarter: string;
    value: number;
}

export interface RankingUnit {
    rank: number;
    name: string;
    campus: string;
    regional: string;
    kpi: number;
    awards: number;
    certification: string;
    certificationColor: 'blue' | 'gold' | 'silver';
}

export interface PrizeCategory {
    id: string;
    icon: string;
    title: string;
    description: string;
}
