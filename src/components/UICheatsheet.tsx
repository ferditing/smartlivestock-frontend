/**
 * SmartLivestock — UI Component Cheatsheet
 * =========================================
 * Drop this file anywhere as a reference. Shows every button, tab,
 * filter chip and quick-action tile with copy-paste usage examples.
 *
 * Components live in:
 *   src/components/Button.tsx   — Button, QuickActionTile
 *   src/components/Tabs.tsx     — Tabs, Tab, TabPanel, FilterBar, FilterChip
 *   src/index.css               — all CSS classes (.btn-*, .tab, .filter-chip, .qa-tile)
 */

import Button, { QuickActionTile } from "../components/Button";
import Tabs, { Tab, TabPanel, FilterBar, FilterChip } from "../components/Tabs";
import {
  PawPrint, Calendar, Activity, ShoppingCart, 
  Zap, Plus, Save, Trash2, Bell, ArrowRight,
  Store, Shield, BarChart2,
} from "lucide-react";
import { useState } from "react";

export default function UICheatsheet() {
  const [activeTab, setActiveTab] = useState("animals");
  const [filter, setFilter]       = useState("all");

  return (
    <div className="max-w-4xl mx-auto space-y-10 p-6">

      {/* ════════════════════════════════════════
          SECTION 1 — SOLID BUTTONS
      ════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="page-title">Solid Buttons</h2>

        {/* All variants */}
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="blue">Blue</Button>
          <Button variant="amber">Amber</Button>
        </div>

        {/* Role-specific — use inside that role's dashboard */}
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-farmer">Farmer Action</button>
          <button className="btn btn-vet">Vet Action</button>
          <button className="btn btn-agrovet">Agrovet Action</button>
          <button className="btn btn-subadmin">SubAdmin Action</button>
          <button className="btn btn-admin">Admin Action</button>
        </div>

        {/* Outline + ghost */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">Outline</Button>
          <Button variant="outline-blue">Outline Blue</Button>
          <Button variant="outline-red">Outline Red</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="ghost-green">Ghost Green</Button>
          <Button variant="link">Link style <ArrowRight className="w-3.5 h-3.5" /></Button>
          <Button variant="link-gray">Link gray</Button>
        </div>

        {/* Role outlines */}
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-outline-farmer">Farmer Outline</button>
          <button className="btn btn-outline-vet">Vet Outline</button>
          <button className="btn btn-outline-agrovet">Agrovet Outline</button>
          <button className="btn btn-outline-subadmin">SubAdmin Outline</button>
          <button className="btn btn-outline-admin">Admin Outline</button>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — SIZES
      ════════════════════════════════════════ */}
      <section className="space-y-3">
        <h2 className="page-title">Sizes</h2>
        <div className="flex flex-wrap items-end gap-3">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium (default)</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — ICONS, LOADING, SHAPES
      ════════════════════════════════════════ */}
      <section className="space-y-3">
        <h2 className="page-title">Icons, Loading & Shapes</h2>
        <div className="flex flex-wrap gap-3">
          {/* Icon left */}
          <Button variant="primary" icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>

          {/* Icon right */}
          <Button variant="outline" iconRight={<ArrowRight className="w-4 h-4" />}>
            Continue
          </Button>

          {/* Loading — auto-disables and shows spinner */}
          <Button variant="primary" loading>
            Saving…
          </Button>

          {/* Icon only */}
          <Button variant="ghost" iconOnly icon={<Bell className="w-4 h-4" />} />
          <Button variant="primary" iconOnly icon={<Plus className="w-4 h-4" />} />
          <Button variant="danger" iconOnly icon={<Trash2 className="w-4 h-4" />} size="sm" />

          {/* Pill shape */}
          <Button variant="primary" pill>Pill Button</Button>
          <Button variant="outline" pill size="sm">Small Pill</Button>

          {/* Full width */}
          <Button variant="primary" wide icon={<Zap className="w-4 h-4" />}>
            Full Width Button
          </Button>
        </div>

        {/* As anchor link */}
        <Button as="a" href="/login" variant="link">
          Go to Login <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — QUICK ACTION TILES
      ════════════════════════════════════════ */}
      <section className="space-y-3">
        <h2 className="page-title">Quick Action Tiles</h2>
        <p className="text-sm text-gray-500">Used in dashboard grids. 9 colours, 3 sizes.</p>

        {/* Normal tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <QuickActionTile color="green"  icon={<PawPrint className="w-6 h-6" />}     onClick={() => {}}>Add Animal</QuickActionTile>
          <QuickActionTile color="blue"   icon={<Calendar className="w-6 h-6" />}     onClick={() => {}}>Book Appt</QuickActionTile>
          <QuickActionTile color="purple" icon={<Activity className="w-6 h-6" />}     onClick={() => {}}>Health Report</QuickActionTile>
          <QuickActionTile color="amber"  icon={<ShoppingCart className="w-6 h-6" />} onClick={() => {}}>Marketplace</QuickActionTile>
          <QuickActionTile color="red"    icon={<Zap className="w-6 h-6" />}          onClick={() => {}}>Emergency</QuickActionTile>
        </div>

        {/* More colours */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <QuickActionTile color="teal"           icon={<Shield className="w-6 h-6" />}    onClick={() => {}}>Verification</QuickActionTile>
          <QuickActionTile color="rose"           icon={<Bell className="w-6 h-6" />}      onClick={() => {}}>Alerts</QuickActionTile>
          <QuickActionTile color="indigo"         icon={<BarChart2 className="w-6 h-6" />} onClick={() => {}}>Analytics</QuickActionTile>
          <QuickActionTile color="gradient-green" icon={<Zap className="w-6 h-6" />}       onClick={() => {}}>Featured</QuickActionTile>
        </div>

        {/* Size variants */}
        <div className="flex flex-wrap gap-3 items-end">
          <QuickActionTile color="green" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => {}}>Small</QuickActionTile>
          <QuickActionTile color="blue"  size="md" icon={<Calendar className="w-6 h-6" />} onClick={() => {}}>Medium</QuickActionTile>
          <QuickActionTile color="amber" size="lg" icon={<Store className="w-7 h-7" />} onClick={() => {}}>Large Tile</QuickActionTile>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 5 — TABS  (4 styles)
      ════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2 className="page-title">Tabs — 4 Styles</h2>

        {/* Style 1: Underline — page-level navigation */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Underline (default, page-level)</p>
          <Tabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style="underline"
            color="green"
          >
            <Tab id="animals"      label="My Animals"      icon={<PawPrint className="w-4 h-4" />}    badge={animals_count} />
            <Tab id="appointments" label="Appointments"    icon={<Calendar className="w-4 h-4" />}    badge={3} />
            <Tab id="reports"      label="Health Reports"  icon={<Activity className="w-4 h-4" />} />
            <Tab id="orders"       label="Orders"          icon={<ShoppingCart className="w-4 h-4" />} disabled />
          </Tabs>
          <TabPanel tabId="animals"      activeTab={activeTab}><div className="py-4 text-sm text-gray-600">🐄 Animals list content here</div></TabPanel>
          <TabPanel tabId="appointments" activeTab={activeTab}><div className="py-4 text-sm text-gray-600">📅 Appointments content here</div></TabPanel>
          <TabPanel tabId="reports"      activeTab={activeTab}><div className="py-4 text-sm text-gray-600">📋 Reports content here</div></TabPanel>
        </div>

        {/* Style 2: Pill — inside card, segment control */}
        <div className="card">
          <div className="card-header">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Pill (inside cards)</p>
            <Tabs style="pill" color="blue" defaultTab="pending">
              <Tab id="pending"  label="Pending"  badge={12} />
              <Tab id="approved" label="Approved" badge={4} />
              <Tab id="rejected" label="Rejected" />
            </Tabs>
          </div>
          <div className="card-body">
            <TabPanel tabId="pending"><p className="text-sm text-gray-600">Pending items…</p></TabPanel>
            <TabPanel tabId="approved"><p className="text-sm text-gray-600">Approved items…</p></TabPanel>
            <TabPanel tabId="rejected"><p className="text-sm text-gray-600">Rejected items…</p></TabPanel>
          </div>
        </div>

        {/* Style 3: Card — admin panels */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Card (admin panels)</p>
          <Tabs style="card" color="purple" defaultTab="users">
            <Tab id="users"    label="Users"    badge={142} />
            <Tab id="counties" label="Counties" badge={47} />
            <Tab id="reports"  label="Reports" />
            <Tab id="settings" label="Settings" />
          </Tabs>
        </div>

        {/* Style 4: Solid — dark background, modal headers */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Solid (modal headers, dark sections)</p>
          <div className="bg-gray-900 p-4 rounded-2xl inline-block">
            <Tabs style="solid" defaultTab="overview">
              <Tab id="overview" label="Overview" />
              <Tab id="stats"    label="Stats"    badge={5} />
              <Tab id="history"  label="History" />
            </Tabs>
          </div>
        </div>

        {/* Underline with role colours */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Underline — role colours</p>
          <div className="space-y-2">
            <Tabs style="underline" color="green"  defaultTab="a1"><Tab id="a1" label="Farmer (green)" /><Tab id="a2" label="Tab 2" /></Tabs>
            <Tabs style="underline" color="blue"   defaultTab="b1"><Tab id="b1" label="Vet (blue)" /><Tab id="b2" label="Tab 2" /></Tabs>
            <Tabs style="underline" color="amber"  defaultTab="c1"><Tab id="c1" label="Agrovet (amber)" /><Tab id="c2" label="Tab 2" /></Tabs>
            <Tabs style="underline" color="teal"   defaultTab="d1"><Tab id="d1" label="SubAdmin (teal)" /><Tab id="d2" label="Tab 2" /></Tabs>
            <Tabs style="underline" color="purple" defaultTab="e1"><Tab id="e1" label="Admin (purple)" /><Tab id="e2" label="Tab 2" /></Tabs>
          </div>
        </div>

        {/* Vertical tabs */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Vertical (sidebar-style)</p>
          <div className="flex gap-6 border border-gray-100 rounded-2xl overflow-hidden">
            <div className="w-48 bg-gray-50 p-3">
              <Tabs style="underline" vertical defaultTab="profile">
                <Tab id="profile"   label="Profile"   icon={<Shield className="w-4 h-4" />} />
                <Tab id="documents" label="Documents"  icon={<PawPrint className="w-4 h-4" />} />
                <Tab id="settings"  label="Settings"  icon={<BarChart2 className="w-4 h-4" />} />
              </Tabs>
            </div>
            <div className="flex-1 p-5">
              <p className="text-sm text-gray-600">Tab panel content shows here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 6 — FILTER CHIPS
      ════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2 className="page-title">Filter Bar</h2>
        <p className="text-sm text-gray-500">Horizontal chips for filtering lists — appointments, animals, orders, providers, etc.</p>

        {/* Controlled FilterBar component */}
        <FilterBar value={filter} onChange={setFilter}>
          <FilterChip value="all"      color="green">All</FilterChip>
          <FilterChip value="pending"  color="amber"  badge={12}>Pending</FilterChip>
          <FilterChip value="approved" color="green"  badge={34}>Approved</FilterChip>
          <FilterChip value="rejected" color="red"    badge={3}>Rejected</FilterChip>
        </FilterBar>

        {/* Or use raw CSS classes for simple cases */}
        <div className="filter-bar">
          <button className="filter-chip active">All Animals</button>
          <button className="filter-chip">Cattle</button>
          <button className="filter-chip">Poultry</button>
          <button className="filter-chip">Goats</button>
          <button className="filter-chip">Sheep</button>
        </div>

        {/* Multiple colour chips */}
        <div className="filter-bar">
          <button className="filter-chip active">Active</button>
          <button className="filter-chip active-blue">In Review</button>
          <button className="filter-chip active-amber">Pending</button>
          <button className="filter-chip active-red">Rejected</button>
          <button className="filter-chip active-purple">Archived</button>
          <button className="filter-chip active-teal">Verified</button>
        </div>
      </section>

    </div>
  );
}

// placeholder — replace with real animal count
const animals_count = 0;