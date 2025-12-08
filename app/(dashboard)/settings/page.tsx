"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

import {
  Globe,
  Ship,
  Clock,
  DollarSign,
  Thermometer,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";

interface SettingsCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  description: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  description,
  children,
  onClick,
}) => {
  return (
    <Card className="flex flex-col h-full transition-shadow hover:shadow-md cursor-pointer border border-gray-200">
      <div onClick={onClick} className="h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6 flex-grow">{description}</p>

        <div className="pt-4 border-t border-gray-100 mt-auto">{children}</div>
      </div>
    </Card>
  );
};

const SettingsPage = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">System configuration and master data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* User Management */}
        <SettingsCard
          icon={<Users className="w-6 h-6" />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          title="User Management"
          subtitle="Access Control"
          description="Add, remove users and assign roles for the portal."
          onClick={() => router.push("/settings/users")}
        >
          <div className="text-sm font-semibold text-blue-600 hover:underline">
            Manage Users →
          </div>
        </SettingsCard>

        {/* Ports & Airports */}
        <SettingsCard
          icon={<Globe className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          title="Ports & Airports"
          subtitle="UN/LOCODE database"
          description="Manage port and airport codes used for shipment routing."
          onClick={() => router.push("/settings/ports")}
        >
          <div className="text-sm font-semibold text-gray-900">
            248 locations
          </div>
        </SettingsCard>

        {/* Incoterms */}
        <SettingsCard
          icon={<Ship className="w-6 h-6" />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          title="Incoterms"
          subtitle="Incoterms 2020"
          description="Configure available incoterms for quotations and shipments."
          onClick={() => router.push("/settings/incoterms")}
        >
          <div className="flex flex-wrap gap-2">
            {["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"].map((term) => (
              <span
                key={term}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded border border-gray-200"
              >
                {term}
              </span>
            ))}
          </div>
        </SettingsCard>

        {/* Status Codes */}
        <SettingsCard
          icon={<Clock className="w-6 h-6" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          title="Status Codes"
          subtitle="Tracking milestones"
          description="Define shipment status codes and tracking events."
          onClick={() => router.push("/settings/status-codes")}
        >
          <div className="text-sm font-semibold text-gray-900">
            12 status codes
          </div>
        </SettingsCard>

        {/* Currencies */}
        <SettingsCard
          icon={<DollarSign className="w-6 h-6" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          title="Currencies"
          subtitle="Exchange rates"
          description="Manage supported currencies and default settings."
          onClick={() => router.push("/settings/currencies")}
        >
          <div className="flex flex-wrap gap-2">
            {["INR", "USD", "EUR", "GBP", "AED"].map((curr) => (
              <span
                key={curr}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded border border-gray-200"
              >
                {curr}
              </span>
            ))}
          </div>
        </SettingsCard>

        {/* Temperature Presets */}
        <SettingsCard
          icon={<Thermometer className="w-6 h-6" />}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
          title="Temperature Presets"
          subtitle="Cold chain settings"
          description="Define temperature ranges for different commodity types."
          onClick={() => router.push("/settings/temp-presets")}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Deep Frozen</span>
              <span className="font-mono text-gray-900">-25°C to -30°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Frozen</span>
              <span className="font-mono text-gray-900">-18°C to -20°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chilled</span>
              <span className="font-mono text-gray-900">0°C to 4°C</span>
            </div>
          </div>
        </SettingsCard>

        {/* General */}
        <SettingsCard
          icon={<SettingsIcon className="w-6 h-6" />}
          iconBg="bg-gray-100"
          iconColor="text-gray-600"
          title="General"
          subtitle="System preferences"
          description="Date/time formats, timezone, and other preferences."
          onClick={() => router.push("/settings/general")}
        >
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Timezone</span>
              <span className="font-medium text-gray-900">UTC+5:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date Format</span>
              <span className="font-medium text-gray-900">YYYY-MM-DD</span>
            </div>
          </div>
        </SettingsCard>

      </div>
    </div>
  );
};

export default SettingsPage;
