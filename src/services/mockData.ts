import type { Honoree, Award, DashboardMetric, RankingUnit, PrizeCategory } from '../types/global';

export const mockAwards: Award[] = [
    {
        id: '1',
        title: 'Excelência em Pesquisa 2026',
        category: 'Pesquisa',
        semester: '2026.1',
        unit: 'Recife - Matriz',
        date: '2026-06-15',
        description: 'Reconhecimento por contribuições significativas na área de Inteligência Artificial.'
    },
    {
        id: '2',
        title: 'Prêmio de Mérito Institucional',
        category: 'Institucional',
        semester: '2023.2',
        unit: 'São Paulo',
        date: '2023-12-10',
        description: 'Destaque em gestão operacional e eficiência administrativa.'
    }
];

export const mockHonorees: Honoree[] = [
    {
        id: 'roberto-almeida',
        name: 'Dr. Roberto Almeida',
        photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBur6dTFgMDigONc9nmckAjzYT0d_pHy6cuHOdmGdUJgARZDFmPmYQHAxcpIZbxgLx36lqTgQ66NI91v7WJxzRGTE8rLX55pfxWKhK895m6SxBw5T3n00dJpGmZ_mUychm7jdspqF8Iwxa8n_QozFTWRMI033lM_iIULQYBXJk3ZjlJdnyAsOHMktCc89B1_kE-gMzO9iHlalBPPYnV4CP-2viEH6DwnAg5UX6q7lIl45h99uWqLTtKLPXLL9PfN_Jfa8BzA9IJeYgD',
        role: 'Diretor Executivo — UNINASSAU Campus Recife',
        category: 'Gestão Regional',
        unit: 'Recife',
        yearsOfService: 12,
        totalAwards: 8,
        projectsLed: 42,
        units: 15,
        bio: 'O Dr. Roberto Almeida tem sido um pilar da equipe executiva do Grupo Ser Educacional há mais de uma década. Sua gestão como Diretor Executivo na UNINASSAU Campus Recife tem sido marcada por uma busca incessante por rigor acadêmico e eficiência operacional.',
        awards: [
            { id: 'a1', title: 'Prêmio de Excelência', category: 'Liderança Executiva', semester: '2023.2', unit: 'Recife', date: '2023-12-01' },
            { id: 'a2', title: 'Pioneiro em Inovação', category: 'Digitalização do Campus', semester: '2021.1', unit: 'Recife', date: '2021-06-01' },
            { id: 'a3', title: 'Mérito Institucional', category: 'Eficiência Operacional', semester: '2018.2', unit: 'Recife', date: '2018-12-01' }
        ]
    },
    {
        id: 'ricardo-almeida',
        name: 'Dr. Ricardo Almeida',
        photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoJVPEWE30pAN9HERNpY7Y_dMGcIQIy4hGRI7_Of761VIp-Kjmk9_9s2HAUYPRGB3NLKBc4cBuqWTSm3yLztkyX-ot-_DDS1KBKv5u8Ym0pI_5ZffmUht4N9jHxZ09oc80S0i2VyFJNpEQaGfez8iocdkcvP0SFDLNRe_2dM6RswCw-fEJIcM5ogql5Hw7fAueCoBIgaNlnfz71aKoPyXJEy_IjHU8aijvWCAFFuh6cTZKuf-2d4OFFYY_YAu5ILUVmltL7zfhyzel',
        role: 'Diretor de Operações NE',
        category: 'Gestão Regional',
        unit: 'Nordeste',
        yearsOfService: 10,
        totalAwards: 5,
        projectsLed: 30,
        units: 10,
        bio: 'Liderança estratégica focada na expansão regional do grupo.',
        awards: []
    },
    {
        id: 'helena-martins',
        name: 'Dra. Helena Martins',
        photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDApM69H7CT4Ooo2oGWNsEByx8YYO-QEXPhlblxoxu1fXkPX-5RO45inYslIIK24gR6OOr-JBNkwuQKJ2fgNjtDwN_6LP60Y9bqPYP90HTHN44LtKf6r2iQ3-o5KuHIz0qzLmOIkfla50CqVlFJDgr-vCHfkixbIjPvkeDyLq4IrKx_UWgJZYBfa_Hi3zaAkDFdRp8nSMRN75bHvelX4zLcvKKyPk_ss_HbozYwzE9ztGuhVBd0xP7tWWolV-yvAib_7zjeX_XPqjc3',
        role: 'Coordenadora Pedagógica',
        category: 'Destaque Acadêmico',
        unit: 'Salvador',
        yearsOfService: 8,
        totalAwards: 4,
        projectsLed: 25,
        units: 5,
        bio: 'Excelência em inovação pedagógica e suporte acadêmico.',
        awards: []
    }
];

export const mockMetrics: DashboardMetric[] = [
    { label: 'Total de Prêmios', value: '1.284', change: '+12.5%', trend: 'up' },
    { label: 'Unidade Líder', value: 'UNINASSAU Recife', badge: 'Elite', trend: 'neutral' },
    { label: 'Média Semestral', value: '412', change: '+15.3%', trend: 'up' }
];

export const mockRanking: RankingUnit[] = [
    { rank: 1, name: 'UNINASSAU Recife', campus: 'Headquarters PE', regional: 'Nordeste', kpi: 9.84, awards: 284, certification: 'Nível Diamante', certificationColor: 'blue' },
    { rank: 2, name: 'UNAMA Belém', campus: 'Campus Alcindo Cacela', regional: 'Norte', kpi: 9.71, awards: 241, certification: 'Nível Ouro', certificationColor: 'gold' },
    { rank: 3, name: 'UNIJUZEIRO', campus: 'Campus Juazeiro do Norte', regional: 'Nordeste', kpi: 9.45, awards: 198, certification: 'Nível Prata', certificationColor: 'silver' }
];

export const mockCategories: PrizeCategory[] = [
    { id: 'academic', icon: 'school', title: 'Prêmio Acadêmico', description: 'Reconhecendo a inovação pedagógica e a excelência acadêmica.' },
    { id: 'management', icon: 'leaderboard', title: 'Prêmio de Gestão', description: 'Celebrando a eficiência operacional e liderança estratégica.' },
    { id: 'innovation', icon: 'lightbulb', title: 'Prêmio de Inovação', description: 'Destacando soluções visionárias e adoção tecnológica.' }
];
