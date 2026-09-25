"use client";

import React from "react";
import { Avatar, Badge, Button, Dropdown, MenuProps, Tooltip } from "antd";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileCheck2,
  FolderGit2,
  Layers,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useMtlStore } from "@/stores/useMtlStore";
import { useMtlUiStore, type MtlViewMode } from "@/stores/useMtlUiStore";
import { DEMO_ACCOUNTS } from "@/constants/mtl";

export const MtlSidebar: React.FC = () => {
  const { projects, activeProjectId, setActiveProjectId, currentUser, setCurrentUser } =
    useMtlStore();
  const { view, setView, sidebarCollapsed, setSidebarCollapsed, setCreateProjectOpen } =
    useMtlUiStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0];

  const menuItems: { key: MtlViewMode; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      key: "director_hub",
      label: "Bàn làm việc Lãnh đạo",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      key: "overview",
      label: "Theo dõi thực hiện",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      key: "workspace",
      label: "MTL Workspace (Bước 5)",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      key: "design",
      label: "Quản lý Thiết kế",
      icon: <Compass className="w-4 h-4" />,
    },
    {
      key: "fs",
      label: "Phương án kinh doanh (FS)",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      key: "confirm",
      label: "Xác nhận MTL (PBCM)",
      icon: <FileCheck2 className="w-4 h-4" />,
    },
  ];

  const userDropdownItems: MenuProps["items"] = DEMO_ACCOUNTS.map((account) => ({
    key: account.username,
    label: (
      <div className="py-1">
        <div className="font-semibold text-xs text-foreground">{account.name}</div>
        <div className="text-[11px] text-muted-foreground">{account.role}</div>
      </div>
    ),
    icon: (
      <Avatar size={22} className="bg-primary/20 text-primary text-[10px] font-bold">
        {account.initials}
      </Avatar>
    ),
    onClick: () => setCurrentUser(account),
  }));

  return (
    <aside
      className={`h-screen flex flex-col bg-[#002b60] text-white transition-all duration-200 select-none z-20 flex-shrink-0 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-white/10 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center font-black text-sm tracking-wider shadow-sm flex-shrink-0">
          MTL
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-sm leading-tight truncate">Master Timeline</span>
            <span className="text-[10px] text-emerald-300 font-medium tracking-wide">
              NVLG STANDARD SOP06
            </span>
          </div>
        )}
      </div>

      {/* Create Project Button */}
      <div className="p-3">
        {sidebarCollapsed ? (
          <Tooltip title="Tạo dự án mới" placement="right">
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              className="w-full !h-10 bg-primary hover:!bg-primary/90 flex items-center justify-center border-none shadow-md"
              onClick={() => setCreateProjectOpen(true)}
            />
          </Tooltip>
        ) : (
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            className="w-full !h-10 bg-primary hover:!bg-primary/90 flex items-center justify-center gap-2 font-semibold text-xs border-none shadow-md"
            onClick={() => setCreateProjectOpen(true)}
          >
            Tạo dự án mới
          </Button>
        )}
      </div>

      {/* Main Nav Items */}
      <div className="px-2 py-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = view === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
            >
              <Tooltip title={sidebarCollapsed ? item.label : undefined} placement="right">
                <span className="flex items-center gap-3">
                  {item.icon}
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </span>
              </Tooltip>
            </button>
          );
        })}
      </div>

      {/* Projects List Section */}
      {!sidebarCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2 mt-2 border-t border-white/10 space-y-1">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Dự án gần đây</span>
            <Badge count={projects.length} className="site-badge-count-sm" style={{ backgroundColor: "#2db34b" }} />
          </div>
          {projects.slice(0, 6).map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => setActiveProjectId(proj.id)}
                className={`w-full text-left px-2.5 py-2 rounded-md transition-all text-xs flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-white/15 text-white font-semibold border-l-2 border-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <div className="truncate flex-1">
                  <div className="truncate text-xs">{proj.name}</div>
                  <div className="text-[10px] text-white/50">{proj.code}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Spacer if collapsed */}
      {sidebarCollapsed && <div className="flex-1" />}

      {/* Toggle Collapse & User Footer */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-2">
        <Dropdown menu={{ items: userDropdownItems }} trigger={["click"]} placement="topRight">
          <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
            <Avatar size={32} className="bg-primary text-white font-bold text-xs flex-shrink-0">
              {currentUser?.initials || "NV"}
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate leading-tight">
                  {currentUser?.name || "Người dùng"}
                </div>
                <div className="text-[10px] text-white/60 truncate">{currentUser?.role}</div>
              </div>
            )}
          </div>
        </Dropdown>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="w-full flex items-center justify-center p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs"
          title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
