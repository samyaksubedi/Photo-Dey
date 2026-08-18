import {
  CalendarDays,
  ChevronDown,
  Images,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brand } from './Brand';

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar${open ? ' is-open' : ''}`}>
        <div className="sidebar-head"><Brand /><button className="icon-button sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
        <nav className="dashboard-nav">
          <span>Workspace</span>
          <NavLink end to="/dashboard" onClick={() => setOpen(false)}><LayoutGrid size={17} />Overview</NavLink>
          <NavLink to="/dashboard/events" onClick={() => setOpen(false)}><Images size={17} />Events</NavLink>
          <NavLink to="/dashboard/events/new" onClick={() => setOpen(false)}><Plus size={17} />New event</NavLink>
          <NavLink to="/dashboard/account" onClick={() => setOpen(false)}><ShieldCheck size={17} />Account & security</NavLink>
        </nav>
        <div className="sidebar-foot">
          <div className="sidebar-tip"><CalendarDays size={19} /><strong>Ready for the next event?</strong><p>Upload photographs and share one public QR.</p></div>
          <div className="sidebar-account"><NavLink to="/dashboard/account" onClick={() => setOpen(false)}><span>{user?.name?.charAt(0).toUpperCase()}</span><div><strong>{user?.name}</strong><small>{user?.email}</small></div></NavLink><button onClick={logout} aria-label="Sign out"><LogOut size={15} /></button></div>
        </div>
      </aside>
      {open && <button className="sidebar-scrim" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="icon-button menu-button" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
          <div className="topbar-context"><span>Organizer workspace</span><strong>PhotoDey <ChevronDown size={13} /></strong></div>
          <NavLink className="button button-dark button-small" to="/dashboard/events/new"><Plus size={15} />New event</NavLink>
        </header>
        <div className="dashboard-content"><Outlet /></div>
      </section>
    </div>
  );
}
