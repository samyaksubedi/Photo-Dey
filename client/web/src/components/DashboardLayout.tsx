import { Images, LayoutGrid, LogOut, Menu, Plus, ShieldCheck, X } from 'lucide-react';
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
  const close = () => setOpen(false);

  return (
    <div className="app">
      <aside className={`app-side${open ? ' is-open' : ''}`}>
        <div className="app-side-head">
          <Brand light />
          <button className="app-icon-btn app-side-close" onClick={close} aria-label="Close menu"><X size={18} /></button>
        </div>
        <NavLink className="btn btn-gold app-new" to="/dashboard/events/new" onClick={close}><Plus size={17} />New event</NavLink>
        <nav className="app-nav" aria-label="Dashboard">
          <NavLink end to="/dashboard" onClick={close}><LayoutGrid size={18} />Overview</NavLink>
          <NavLink to="/dashboard/events" onClick={close}><Images size={18} />Events</NavLink>
          <NavLink to="/dashboard/account" onClick={close}><ShieldCheck size={18} />Account</NavLink>
        </nav>
        <div className="app-side-foot">
          <NavLink className="app-user" to="/dashboard/account" onClick={close}>
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
            <div><strong>{user?.name}</strong><small>{user?.email}</small></div>
          </NavLink>
          <button className="app-icon-btn" onClick={logout} aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>
      {open && <button className="app-scrim" onClick={close} aria-label="Close menu" />}
      <div className="app-main">
        <header className="app-top">
          <button className="app-icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <Brand />
          <NavLink className="btn btn-primary btn-sm" to="/dashboard/events/new"><Plus size={15} />New</NavLink>
        </header>
        <div className="app-content"><Outlet /></div>
      </div>
    </div>
  );
}
