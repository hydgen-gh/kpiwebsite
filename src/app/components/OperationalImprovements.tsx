import React, { useState } from 'react';
import { Bell, FileText, Clock, User, AlertCircle, CheckCircle2, Archive } from 'lucide-react';

interface UpdateLog {
  id: string;
  timestamp: Date;
  user: string;
  department: string;
  action: 'created' | 'updated' | 'archived' | 'milestone';
  kpiName: string;
  oldValue?: string | number;
  newValue?: string | number;
  notes?: string;
}

interface NotificationPreferences {
  weeklyReminders: boolean;
  biweeklyReminders: boolean;
  instantNotifications: boolean;
  digestEmail: boolean;
}

interface OperationalImprovementsProps {
  updateLogs?: UpdateLog[];
  notificationPreferences?: NotificationPreferences;
  onNotificationChange?: (preferences: NotificationPreferences) => void;
}

/**
 * Operational Improvements Component
 * Provides KPI update notifications, logs, and reporting reminders
 */
export function OperationalImprovements({
  updateLogs = [],
  notificationPreferences = {
    weeklyReminders: true,
    biweeklyReminders: false,
    instantNotifications: false,
    digestEmail: true,
  },
  onNotificationChange,
}: OperationalImprovementsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationPreferences);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Placeholder logs - will be replaced with actual backend data
  const mockLogs: UpdateLog[] = updateLogs.length > 0 ? updateLogs : [
    {
      id: 'log-001',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      user: 'John Smith',
      department: 'Sales',
      action: 'updated',
      kpiName: 'Commercial Systems Delivered',
      oldValue: 2,
      newValue: 3,
      notes: 'Q1 delivery completed - system deployed to customer',
    },
    {
      id: 'log-002',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      user: 'Sarah Chen',
      department: 'Product',
      action: 'milestone',
      kpiName: '250 kW Single Stack',
      newValue: '75% Platform Readiness',
      notes: 'BOM finalization completed',
    },
    {
      id: 'log-003',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      user: 'Michael Johnson',
      department: 'Marketing',
      action: 'updated',
      kpiName: 'Qualified Inbound Inquiries',
      oldValue: 8,
      newValue: 12,
      notes: 'LinkedIn campaign generated 4 new qualified leads',
    },
    {
      id: 'log-004',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      user: 'Emily Davis',
      department: 'Finance',
      action: 'updated',
      kpiName: 'Revenue Recognition',
      oldValue: '$180k',
      newValue: '$280k',
      notes: 'Monthly accrual finalized',
    },
  ];

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    onNotificationChange?.(newPreferences);
  };

  const getActionColor = (action: UpdateLog['action']) => {
    const actionMap = {
      'updated': { icon: CheckCircle2, bg: 'bg-blue-50', text: 'text-blue-700', label: 'Updated' },
      'created': { icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-700', label: 'Created' },
      'archived': { icon: Archive, bg: 'bg-slate-50', text: 'text-slate-700', label: 'Archived' },
      'milestone': { icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-700', label: 'Milestone' },
    };
    return actionMap[action];
  };

  const sortedLogs = [...mockLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Notification Preferences */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-600" />
          Update Notifications
        </h4>

        <div className="space-y-4">
          {/* Weekly Reminders */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">Weekly Reminders</p>
              <p className="text-xs text-slate-600">Every Monday 9 AM</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.weeklyReminders}
              onChange={() => handlePreferenceChange('weeklyReminders')}
              className="w-5 h-5 rounded border-slate-300"
            />
          </div>

          {/* Biweekly Reminders */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">Biweekly Reminders</p>
              <p className="text-xs text-slate-600">Every other Friday</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.biweeklyReminders}
              onChange={() => handlePreferenceChange('biweeklyReminders')}
              className="w-5 h-5 rounded border-slate-300"
            />
          </div>

          {/* Instant Notifications */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">Instant Notifications</p>
              <p className="text-xs text-slate-600">For critical updates</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.instantNotifications}
              onChange={() => handlePreferenceChange('instantNotifications')}
              className="w-5 h-5 rounded border-slate-300"
            />
          </div>

          {/* Digest Email */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">Digest Email</p>
              <p className="text-xs text-slate-600">Weekly summary</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.digestEmail}
              onChange={() => handlePreferenceChange('digestEmail')}
              className="w-5 h-5 rounded border-slate-300"
            />
          </div>
        </div>

        {/* Reporting Schedule */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h5 className="text-xs font-bold text-slate-900 uppercase mb-3">Reporting Schedule</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Monthly: 1st business day</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Quarterly: EOQ + 5 days</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700">Annual: January 15th</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Update Logs (2 columns) */}
      <div className="col-span-2">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Recent KPI Updates ({sortedLogs.length})
          </h4>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedLogs.map((log) => {
              const actionData = getActionColor(log.action);
              const ActionIcon = actionData.icon;
              const isExpanded = expandedLog === log.id;

              return (
                <div
                  key={log.id}
                  className={`${actionData.bg} border border-slate-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm`}
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${actionData.bg}`}>
                      <ActionIcon className={`w-4 h-4 ${actionData.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 truncate">{log.kpiName}</p>
                          <p className={`text-xs ${actionData.text} font-medium`}>{actionData.label} by {log.user}</p>
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {log.timestamp.toLocaleDateString()}
                        </span>
                      </div>

                      {/* Value Change */}
                      {log.oldValue !== undefined && log.newValue !== undefined && (
                        <div className="text-xs text-slate-600 mb-2">
                          {log.oldValue} → <span className="font-semibold text-slate-900">{log.newValue}</span>
                        </div>
                      )}

                      {/* Expanded Details */}
                      {isExpanded && log.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-200/50">
                          <p className="text-xs text-slate-600"><strong>Notes:</strong> {log.notes}</p>
                          <p className="text-xs text-slate-500 mt-1"><strong>Department:</strong> {log.department}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Link */}
          <div className="mt-4 text-center border-t border-slate-200 pt-4">
            <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View All Updates & Audit Log →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperationalImprovements;
