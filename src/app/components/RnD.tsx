import React from 'react';
import {
  ShieldCheck,
  Target,
  Zap,
  Rocket,
  Handshake,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function RnDDashboard() {
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          R&D & Technology Performance
        </h2>
        <p className="text-slate-600">
          Quarterly snapshot — Q4 (Jan–Mar 2025)
        </p>
      </div>

      {/* ===================== */}
      {/* PATENTS – FIRST HALF */}
      {/* ===================== */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Intellectual Property (Patents)
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <KpiCard
            title="Patents Filed (Cumulative)"
            value="11"
            subtitle="Granted / Filed patents till date"
            icon={<ShieldCheck className="w-7 h-7 text-cyan-600" />}
          />

          <KpiCard
            title="Quarterly Patent Target"
            value="2 / 3"
            subtitle="Filed vs target (Q4), Q3: 1 filed"
            icon={<Target className="w-7 h-7 text-teal-600" />}
          />
        </div>
      </div>

      {/* ===================== */}
      {/* OTHER R&D METRICS */}
      {/* ===================== */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          R&D Execution & Enablement
        </h3>

        <div className="grid grid-cols-2 gap-6">

          {/* TRL PROGRESS */}
          <InfoCard
            title="Technology Readiness (TRL)"
            icon={<Zap className="w-6 h-6 text-emerald-600" />}
          >
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Achieved +1 TRL across core R&D projects
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                E-NH₃ (IN) progressing slower than plan
              </li>
            </ul>
          </InfoCard>

          {/* PROJECT EXECUTION */}
          <InfoCard
            title="Key R&D Projects"
            icon={<Rocket className="w-6 h-6 text-blue-600" />}
          >
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Plasma Coating (H₂): TRL milestone achieved</li>
              <li>• RFC Concept: ~70% completion</li>
              <li>• E-NH₃ (SG): Pilot readiness in progress</li>
              <li>• E-NH₃ (IN): Concept validation stage</li>
            </ul>
          </InfoCard>

          {/* PARTNERSHIPS */}
          <InfoCard
            title="Partnerships & Validation"
            icon={<Handshake className="w-6 h-6 text-indigo-600" />}
          >
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                External validation partner onboarded
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                One JDA delayed due to scope alignment
              </li>
            </ul>
          </InfoCard>

          {/* GRANTS & FUNDING */}
          <InfoCard
            title="Grants & Non-Dilutive Funding"
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
          >
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Target: $200K (POC & pilots)</li>
              <li>• Secured: $120K</li>
              <li>• Additional proposals under review</li>
            </ul>
          </InfoCard>

        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function KpiCard({ title, value, subtitle, icon }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, icon, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>
      {children}
    </div>
  );
}
