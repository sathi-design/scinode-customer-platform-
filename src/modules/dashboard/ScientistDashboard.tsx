"use client";

import { MetricCard } from "@/components/shared/MetricCard";
import { Timeline } from "@/components/shared/Timeline";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProjectTypePill } from "@/components/shared/ProjectTypePill";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { mockMetrics, mockProjects, mockProposals, mockActivity, mockTimeline } from "@/services/mock-data";
import { Microscope, FileText, Users, BookOpen, TrendingUp, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Project, Proposal } from "@/types";

const researchColumns: Column<Project>[] = [
  { key: "id", header: "ID", width: "100px",
    render: (v) => <span className="text-xs font-mono text-text-muted">{String(v)}</span> },
  { key: "title", header: "Research Project",
    render: (v, row) => (
      <div>
        <p className="text-sm font-medium text-text-primary leading-snug">{String(v)}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {(row.tags as string[] | undefined)?.map((tag) => (
            <span key={tag} className="text-xs bg-bg-exclusive text-[#6237C7] px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </div>
    )},
  { key: "type", header: "Type", width: "110px",
    render: (v) => <ProjectTypePill type={v as never} /> },
  { key: "progress", header: "Progress", width: "140px",
    render: (v) => <ProgressBar value={v as number} showLabel color="purple" /> },
  { key: "status", header: "Status", width: "130px",
    render: (v) => <StatusBadge status={v as never} /> },
  { key: "deadline", header: "Deadline", width: "110px",
    render: (v) => <span className="text-xs text-text-muted">{formatDate(String(v))}</span> },
];

const proposalColumns: Column<Proposal>[] = [
  { key: "id", header: "ID", width: "100px",
    render: (v) => <span className="text-xs font-mono text-text-muted">{String(v)}</span> },
  { key: "title", header: "Proposal",
    render: (v, row) => (
      <div>
        <p className="text-sm font-medium text-text-primary">{String(v)}</p>
        <p className="text-xs text-text-muted">{row.client as string}</p>
      </div>
    )},
  { key: "projectType", header: "Type", width: "100px",
    render: (v) => <ProjectTypePill type={v as never} /> },
  { key: "value", header: "Value", width: "90px",
    render: (v) => <span className="text-sm font-medium text-text-primary">{v ? String(v) : "—"}</span> },
  { key: "status", header: "Status", width: "130px",
    render: (v) => <StatusBadge status={v as never} /> },
  { key: "submittedAt", header: "Date", width: "100px",
    render: (v) => <span className="text-xs text-text-muted">{formatDate(String(v))}</span> },
];

export function ScientistDashboard() {
  const metrics = mockMetrics.scientist;
  const projects = mockProjects.scientist;
  const proposals = mockProposals.scientist;
  const activity = mockActivity.scientist;
  const timeline = mockTimeline.scientist;

  const expertiseItems = [
    { label: "Medicinal Chemistry", score: 95 },
    { label: "PROTAC/Degrader Design", score: 88 },
    { label: "Computational Docking", score: 72 },
    { label: "Biochemistry / Assay Dev.", score: 80 },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-4 sm:p-6">
      <div>
        <h1 className="page-heading">Research Dashboard</h1>
        <p className="body-text mt-1">Your research portfolio, proposals, and collaborations</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Active Research"   value={metrics.activeProjects}    icon={Microscope} variant="exclusive" />
        <MetricCard label="Total Proposals"   value={metrics.totalProposals}    icon={FileText}   trend={{ value: 5, direction: "up" }} />
        <MetricCard label="Collaborations"    value={3}                         icon={Users} variant="highlight" />
        <MetricCard label="Publications"      value={32}                        icon={BookOpen} />
        <MetricCard label="Citations"         value="1.4k"                      icon={TrendingUp} variant="highlight" />
        <MetricCard label="h-index"           value={18}                        icon={Star} variant="exclusive" />
      </div>

      {/* Research + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-standard">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Research Projects</h2>
            <button className="text-xs text-secondary-1 hover:underline font-medium">View all</button>
          </div>
          <div className="overflow-x-auto">
            <DataTable
              columns={researchColumns}
              data={projects as unknown as Record<string, unknown>[]}
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Expertise panel */}
          <div className="card-standard">
            <h2 className="section-heading mb-4">Expertise Strength</h2>
            <div className="space-y-3.5">
              {expertiseItems.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-text-body">{item.label}</span>
                    <span className="text-xs text-text-muted">{item.score}%</span>
                  </div>
                  <ProgressBar value={item.score} color="purple" />
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration timeline */}
          <div className="card-standard">
            <h2 className="section-heading mb-3">Collaboration Timeline</h2>
            <Timeline steps={timeline} />
          </div>
        </div>
      </div>

      {/* Proposals + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-standard">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Proposals</h2>
            <div className="flex gap-2 items-center">
              <span className="text-xs bg-bg-exclusive text-[#6237C7] px-2 py-1 rounded">
                {proposals.filter(p => p.status === "accepted").length} accepted
              </span>
              <button className="text-xs text-secondary-1 hover:underline font-medium">View all</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <DataTable
              columns={proposalColumns}
              data={proposals as unknown as Record<string, unknown>[]}
            />
          </div>
        </div>

        <div className="card-standard">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-heading">Activity</h2>
            <button className="text-xs text-secondary-1 hover:underline font-medium">See all</button>
          </div>
          <ActivityFeed items={activity} />
        </div>
      </div>
    </div>
  );
}
