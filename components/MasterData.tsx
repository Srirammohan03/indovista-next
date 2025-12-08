"use client";
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Search, Plus, Trash2, ArrowLeft, Globe, Ship, Clock, DollarSign, Thermometer } from 'lucide-react';
import  Link  from 'next/link';

type MasterDataType = 'ports' | 'incoterms' | 'status-codes' | 'currencies' | 'temp-presets';

interface MasterDataEntry {
    id: string;
    [key: string]: any;
}

interface MasterDataProps {
    type: MasterDataType;
}

const MasterData: React.FC<MasterDataProps> = ({ type }) => {

    const getConfig = (type: MasterDataType) => {
        switch(type) {
            case 'ports':
                return {
                    title: 'Ports & Airports',
                    subtitle: 'UN/LOCODE Database',
                    icon: <Globe className="w-6 h-6 text-blue-600" />,
                    bg: 'bg-blue-50',
                    columns: [
                        { key: 'code', label: 'Code' },
                        { key: 'city', label: 'City' },
                        { key: 'country', label: 'Country' }
                    ],
                    initialData: [
                        { id: '1', code: 'INMAA', city: 'Chennai', country: 'India' },
                        { id: '2', code: 'NLRTM', city: 'Rotterdam', country: 'Netherlands' },
                        { id: '3', code: 'DEHAM', city: 'Hamburg', country: 'Germany' },
                        { id: '4', code: 'AEDXB', city: 'Dubai', country: 'UAE' },
                        { id: '5', code: 'USNYC', city: 'New York', country: 'USA' },
                    ]
                };
            case 'incoterms':
                return {
                    title: 'Incoterms',
                    subtitle: 'Incoterms 2020 Rules',
                    icon: <Ship className="w-6 h-6 text-green-600" />,
                    bg: 'bg-green-50',
                    columns: [
                        { key: 'code', label: 'Code' },
                        { key: 'name', label: 'Name' },
                        { key: 'type', label: 'Type' }
                    ],
                    initialData: [
                        { id: '1', code: 'EXW', name: 'Ex Works', type: 'Any Mode' },
                        { id: '2', code: 'FOB', name: 'Free On Board', type: 'Sea' },
                        { id: '3', code: 'CIF', name: 'Cost, Insurance & Freight', type: 'Sea' },
                        { id: '4', code: 'DAP', name: 'Delivered at Place', type: 'Any Mode' },
                    ]
                };
            case 'status-codes':
                return {
                    title: 'Status Codes',
                    subtitle: 'Shipment Tracking Milestones',
                    icon: <Clock className="w-6 h-6 text-orange-600" />,
                    bg: 'bg-orange-50',
                    columns: [
                        { key: 'code', label: 'Code' },
                        { key: 'description', label: 'Description' },
                        { key: 'stage', label: 'Stage' }
                    ],
                    initialData: [
                        { id: '1', code: 'BKD', description: 'Booked', stage: 'Pre-Transit' },
                        { id: '2', code: 'PUP', description: 'Picked Up', stage: 'Origin' },
                        { id: '3', code: 'DEP', description: 'Departed', stage: 'Transit' },
                        { id: '4', code: 'ARR', description: 'Arrived', stage: 'Destination' },
                        { id: '5', code: 'DLV', description: 'Delivered', stage: 'Final' },
                    ]
                };
             case 'currencies':
                return {
                    title: 'Currencies',
                    subtitle: 'Supported Exchange Rates',
                    icon: <DollarSign className="w-6 h-6 text-purple-600" />,
                    bg: 'bg-purple-50',
                    columns: [
                        { key: 'code', label: 'Currency Code' },
                        { key: 'name', label: 'Name' },
                        { key: 'rate', label: 'Exch. Rate (to INR)' }
                    ],
                    initialData: [
                        { id: '1', code: 'USD', name: 'US Dollar', rate: '83.50' },
                        { id: '2', code: 'EUR', name: 'Euro', rate: '90.20' },
                        { id: '3', code: 'GBP', name: 'British Pound', rate: '105.10' },
                        { id: '4', code: 'AED', name: 'UAE Dirham', rate: '22.70' },
                    ]
                };
             case 'temp-presets':
                return {
                    title: 'Temperature Presets',
                    subtitle: 'Cold Chain Configuration',
                    icon: <Thermometer className="w-6 h-6 text-cyan-600" />,
                    bg: 'bg-cyan-50',
                    columns: [
                        { key: 'name', label: 'Preset Name' },
                        { key: 'range', label: 'Range' },
                        { key: 'tolerance', label: 'Tolerance' }
                    ],
                    initialData: [
                        { id: '1', name: 'Deep Frozen', range: '-25°C to -30°C', tolerance: '+/- 2°C' },
                        { id: '2', name: 'Frozen', range: '-18°C to -20°C', tolerance: '+/- 2°C' },
                        { id: '3', name: 'Chilled', range: '0°C to 4°C', tolerance: '+/- 1°C' },
                        { id: '4', name: 'Ambient', range: '15°C to 25°C', tolerance: 'N/A' },
                    ]
                };
            default:
                return { title: '', subtitle: '', icon: null, bg: '', columns: [], initialData: [] };
        }
    };

    const config = getConfig(type);
    const [data, setData] = useState<MasterDataEntry[]>(config.initialData);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id: string) => {
        if (confirm('Delete this entry?')) {
            setData(data.filter(i => i.id !== id));
        }
    };

    const handleAdd = () => {
        const val1 = prompt(`Enter ${config.columns[0].label}:`);
        if (!val1) return;
        const val2 = prompt(`Enter ${config.columns[1].label}:`);
        const val3 = prompt(`Enter ${config.columns[2].label}:`);
        
        const newEntry = {
            id: Date.now().toString(),
            [config.columns[0].key]: val1,
            [config.columns[1].key]: val2,
            [config.columns[2].key]: val3
        };
        setData([...data, newEntry]);
    };

    const filtered = data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/settings" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                            {config.icon}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                            <p className="text-gray-500 text-sm">{config.subtitle}</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                </button>
            </div>

            <Card noPadding className="border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="relative max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                            <tr>
                                {config.columns.map(col => (
                                    <th key={col.key} className="px-6 py-4">{col.label}</th>
                                ))}
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    {config.columns.map((col, idx) => (
                                        <td key={col.key} className={`px-6 py-4 ${idx === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                            {item[col.key]}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MasterData;
