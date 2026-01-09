'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  MessageSquare,
  Video,
  Bell,
  UserPlus,
  Settings,
  Users,
  MapPin,
  Megaphone,
  Trophy,
  FileText,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type FeatureModule } from '@/lib/feature-modules';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  MessageSquare,
  Video,
  Bell,
  UserPlus,
  Settings,
  Users,
  MapPin,
  Megaphone,
  Trophy,
  FileText,
  CreditCard,
};

const categoryColors: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-700',
  community: 'bg-purple-100 text-purple-700',
  content: 'bg-green-100 text-green-700',
  communication: 'bg-amber-100 text-amber-700',
  portal: 'bg-pink-100 text-pink-700',
};

interface FeatureModulesPanelProps {
  initialModules: FeatureModule[];
}

export function FeatureModulesPanel({ initialModules }: FeatureModulesPanelProps) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [loadingModule, setLoadingModule] = useState<string | null>(null);

  const handleToggle = async (moduleKey: string, currentState: boolean) => {
    setLoadingModule(moduleKey);

    try {
      const res = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_key: moduleKey,
          is_enabled: !currentState,
        }),
      });

      if (res.ok) {
        setModules((prev) =>
          prev.map((m) =>
            m.module_key === moduleKey ? { ...m, is_enabled: !currentState } : m
          )
        );
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to toggle module:', error);
    } finally {
      setLoadingModule(null);
    }
  };

  const handleDisableAll = async () => {
    setLoadingModule('all');
    try {
      const res = await fetch('/api/admin/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: modules.map((m) => ({
            module_key: m.module_key,
            is_enabled: false,
          })),
        }),
      });

      if (res.ok) {
        setModules((prev) => prev.map((m) => ({ ...m, is_enabled: false })));
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to disable all:', error);
    } finally {
      setLoadingModule(null);
    }
  };

  const handleEnableAll = async () => {
    setLoadingModule('all');
    try {
      const res = await fetch('/api/admin/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: modules.map((m) => ({
            module_key: m.module_key,
            is_enabled: true,
          })),
        }),
      });

      if (res.ok) {
        setModules((prev) => prev.map((m) => ({ ...m, is_enabled: true })));
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to enable all:', error);
    } finally {
      setLoadingModule(null);
    }
  };

  const enabledCount = modules.filter((m) => m.is_enabled).length;
  const totalCount = modules.length;

  const groupedModules = modules.reduce(
    (acc, module) => {
      const category = module.category || 'general';
      if (!acc[category]) acc[category] = [];
      acc[category].push(module);
      return acc;
    },
    {} as Record<string, FeatureModule[]>
  );

  const categoryLabels: Record<string, string> = {
    admin: 'Admin Tools',
    community: 'Community',
    content: 'Content',
    communication: 'Communication',
    portal: 'Parent Portal',
    general: 'General',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Feature Modules</CardTitle>
            <CardDescription>
              {enabledCount} of {totalCount} modules enabled
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableAll}
              disabled={loadingModule === 'all' || enabledCount === totalCount}
            >
              Enable All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisableAll}
              disabled={loadingModule === 'all' || enabledCount === 0}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Disable All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedModules).map(([category, categoryModules]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">
              {categoryLabels[category] || category}
            </h4>
            <div className="space-y-2">
              {categoryModules.map((module) => {
                const IconComponent = iconMap[module.icon || 'Settings'] || Settings;
                const isLoading = loadingModule === module.module_key;

                return (
                  <div
                    key={module.module_key}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      module.is_enabled
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          module.is_enabled
                            ? categoryColors[category] || 'bg-slate-100 text-slate-600'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <p
                          className={`font-medium ${
                            module.is_enabled ? 'text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          {module.name}
                        </p>
                        <p className="text-xs text-slate-500">{module.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(module.module_key, module.is_enabled)}
                      disabled={isLoading || loadingModule === 'all'}
                      className="focus:outline-none disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                      ) : module.is_enabled ? (
                        <ToggleRight className="h-8 w-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-slate-300" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No feature modules found.</p>
            <p className="text-sm mt-1">Run the SQL migration to create modules.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
