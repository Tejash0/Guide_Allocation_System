import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getStudents, getFaculty, approveFaculty, removeFaculty, assignSlots } from '../api/admin.js';

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim { opacity: 0; animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }

  .a-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; border-radius: 8px; cursor: pointer;
    color: rgba(255,255,255,0.45); font-size: 0.8375rem; font-weight: 500;
    transition: background 0.15s, color 0.15s; position: relative; user-select: none;
  }
  .a-nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
  .a-nav-item.active { background: rgba(239,68,68,0.15); color: #f87171; }
  .a-nav-item.active::before {
    content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 18px; background: #ef4444; border-radius: 0 2px 2px 0;
  }

  .a-stat-card {
    background: #fff; border-radius: 14px; padding: 22px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .a-stat-card:hover { transform: translateY(-3px); box-shadow: 0 6px 24px rgba(0,0,0,0.1); }

  .a-table { width: 100%; border-collapse: collapse; font-size: 0.8375rem; }
  .a-table th {
    text-align: left; padding: 10px 14px; background: #f8f6f2;
    color: #6b7280; font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    border-bottom: 1px solid #ede9e3;
  }
  .a-table td { padding: 11px 14px; border-bottom: 1px solid #f3f0eb; color: #374151; vertical-align: middle; }
  .a-table tr:last-child td { border-bottom: none; }
  .a-table tr:hover td { background: #faf8f5; }

  .btn-approve {
    padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer;
    font-size: 0.75rem; font-weight: 600; font-family: inherit;
    background: #dcfce7; color: #166534;
    transition: background 0.15s;
  }
  .btn-approve:hover { background: #bbf7d0; }
  .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-reject {
    padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer;
    font-size: 0.75rem; font-weight: 600; font-family: inherit;
    background: #fee2e2; color: #991b1b;
    transition: background 0.15s;
  }
  .btn-reject:hover { background: #fecaca; }
  .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

  .sign-out {
    background: transparent; border: 1.5px solid #d1cdc6; color: #374151;
    padding: 6px 14px; border-radius: 7px; font-size: 0.8125rem; font-weight: 500;
    cursor: pointer; font-family: inherit; transition: all 0.15s;
  }
  .sign-out:hover { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

  .notif-btn {
    width: 36px; height: 36px; border-radius: 8px; background: #f3f0eb;
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .notif-btn:hover { background: #e8e3db; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1cdc6; border-radius: 3px; }
`;

const TABS = ['Overview', 'Pending Approvals', 'Students', 'Faculty'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = decodeToken(token);

  // Guard: only admin
  useEffect(() => {
    if (!token || user?.role !== 'admin') navigate('/login');
  }, []);

  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ students: 0, faculty: 0, pending: 0 });
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [slotInputs, setSlotInputs] = useState({});
  const [slotSaving, setSlotSaving] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    if (activeTab === 'Overview') {
      setStats(await getStats());
    } else if (activeTab === 'Students') {
      setStudents(await getStudents());
    } else if (activeTab === 'Faculty' || activeTab === 'Pending Approvals') {
      setFaculty(await getFaculty());
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id) => {
    setActionId(id);
    await approveFaculty(id);
    setActionId(null);
    loadData();
  };

  const handleReject = async (id) => {
    setActionId(id);
    await removeFaculty(id);
    setActionId(null);
    loadData();
  };

  const handleSetSlots = async (id) => {
    const val = parseInt(slotInputs[id], 10);
    if (!val || val < 1 || val > 20) return;
    setSlotSaving(id);
    await assignSlots(id, val);
    setSlotSaving(null);
    loadData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const navIcons = [IconGrid, IconShield, IconUsers, IconUser2];
  const pendingFaculty = faculty.filter(f => f.approved === 0);
  const approvedFaculty = faculty.filter(f => f.approved === 1);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: 'flex', height: '100vh', background: '#ede9e3', fontFamily: "'Trebuchet MS', 'Gill Sans MT', sans-serif" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 248, flexShrink: 0, background: '#1a0a0a', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
          {/* Logo */}
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 38, height: 38, flexShrink: 0,
                background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#fff',
                fontFamily: 'Georgia, serif', letterSpacing: '0.04em',
              }}>ADM</div>
              <div>
                <div style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>Admin Panel</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', marginTop: 2 }}>Guide Allocation · 2024–25</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '18px 20px 6px', color: 'rgba(255,255,255,0.2)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Manage
          </div>

          <nav style={{ padding: '0 10px', flex: 1 }}>
            {TABS.map((tab, i) => {
              const Icon = navIcons[i];
              return (
                <div key={tab} className={`a-nav-item${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                  <Icon size={15} />
                  <span>{tab}</span>
                  {tab === 'Pending Approvals' && stats.pending > 0 && (
                    <span style={{
                      marginLeft: 'auto', background: '#ef4444', color: '#fff',
                      borderRadius: 999, fontSize: '0.65rem', fontWeight: 700,
                      padding: '1px 7px', minWidth: 18, textAlign: 'center',
                    }}>{stats.pending}</span>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Admin footer */}
          <div style={{ padding: '14px 18px', margin: '0 10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, flexShrink: 0,
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.7rem', fontWeight: 700,
            }}>A</div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Admin</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>admin@gmail.com</div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Topbar */}
          <header style={{ height: 62, flexShrink: 0, background: '#fff', borderBottom: '1px solid #e4e0da', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1a0a0a', fontFamily: 'Georgia, serif' }}>{activeTab}</div>
              <div style={{ fontSize: '0.72rem', color: '#a0998f', marginTop: 1 }}>{today}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="notif-btn"><IconBell size={15} color="#6b7280" /></button>
              <button className="sign-out" onClick={logout}>Sign Out</button>
            </div>
          </header>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>

            {/* ── Overview ── */}
            {activeTab === 'Overview' && (
              <>
                {/* Welcome banner */}
                <div className="anim" style={{
                  background: 'linear-gradient(130deg, #1a0a0a 0%, #3b0f0f 60%, #4a1515 100%)',
                  borderRadius: 16, padding: '26px 30px', marginBottom: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  position: 'relative', overflow: 'hidden', animationDelay: '0s',
                }}>
                  <div style={{ position: 'absolute', right: -30, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(239,68,68,0.07)', pointerEvents: 'none' }} />
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 500, marginBottom: 6 }}>Logged in as</div>
                    <div style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>Administrator</div>
                  </div>
                  <div style={{ padding: '7px 18px', borderRadius: 999, background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600 }}>
                    🔐 Admin Access
                  </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  <StatCard label="Total Students" value={stats.students} sub="Registered accounts" accent="#3b82f6" Icon={IconUsers} delay="0.08s" />
                  <StatCard label="Approved Faculty" value={stats.faculty} sub="Active faculty members" accent="#10b981" Icon={IconUser2} delay="0.14s" />
                  <StatCard label="Pending Approvals" value={stats.pending} sub="Awaiting review" accent="#ef4444" Icon={IconShield} delay="0.20s"
                    onClick={() => setActiveTab('Pending Approvals')} clickable />
                </div>
              </>
            )}

            {/* ── Pending Approvals ── */}
            {activeTab === 'Pending Approvals' && (
              <div className="anim" style={{ animationDelay: '0s' }}>
                <TableCard title={`Pending Faculty Approvals (${pendingFaculty.length})`} loading={loading}>
                  {pendingFaculty.length === 0 ? (
                    <EmptyRow colspan={5} message="No pending approvals" />
                  ) : (
                    <table className="a-table">
                      <thead>
                        <tr>
                          <th>Name</th><th>Email</th><th>Department</th><th>Domain</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingFaculty.map(f => (
                          <tr key={f.id}>
                            <td style={{ fontWeight: 600 }}>{f.name}</td>
                            <td style={{ color: '#6b7280' }}>{f.email}</td>
                            <td>{f.department}</td>
                            <td style={{ color: '#9ca3af' }}>{f.domain || '—'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn-approve" disabled={actionId === f.id} onClick={() => handleApprove(f.id)}>
                                  {actionId === f.id ? '...' : 'Approve'}
                                </button>
                                <button className="btn-reject" disabled={actionId === f.id} onClick={() => handleReject(f.id)}>
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </TableCard>
              </div>
            )}

            {/* ── Students ── */}
            {activeTab === 'Students' && (
              <div className="anim" style={{ animationDelay: '0s' }}>
                <TableCard title={`All Students (${students.length})`} loading={loading}>
                  {students.length === 0 ? (
                    <EmptyRow colspan={4} message="No students registered yet" />
                  ) : (
                    <table className="a-table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Student ID</th><th>Registered</th></tr>
                      </thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.name}</td>
                            <td style={{ color: '#6b7280' }}>{s.email}</td>
                            <td><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>{s.student_id}</span></td>
                            <td style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{new Date(s.created_at).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </TableCard>
              </div>
            )}

            {/* ── Faculty ── */}
            {activeTab === 'Faculty' && (
              <div className="anim" style={{ animationDelay: '0s' }}>
                <TableCard title={`All Faculty (${faculty.length})`} loading={loading}>
                  {faculty.length === 0 ? (
                    <EmptyRow colspan={7} message="No faculty registered yet" />
                  ) : (
                    <table className="a-table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Department</th><th>Domain</th><th>Status</th><th>Max Slots</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {faculty.map(f => (
                          <tr key={f.id}>
                            <td style={{ fontWeight: 600 }}>{f.name}</td>
                            <td style={{ color: '#6b7280' }}>{f.email}</td>
                            <td>{f.department}</td>
                            <td style={{ color: '#9ca3af' }}>{f.domain || '—'}</td>
                            <td>
                              {f.approved === 1
                                ? <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>Approved</span>
                                : <span style={{ background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>Pending</span>
                              }
                            </td>
                            <td>
                              {f.approved === 1 ? (
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                  <input
                                    type="number" min="1" max="20"
                                    placeholder={String(f.max_teams ?? 5)}
                                    value={slotInputs[f.id] ?? ''}
                                    onChange={e => setSlotInputs(prev => ({ ...prev, [f.id]: e.target.value }))}
                                    style={{ width: 52, padding: '3px 6px', border: '1px solid #d0d9e4', borderRadius: 4, fontSize: '0.8rem', fontFamily: 'inherit' }}
                                  />
                                  <button
                                    style={{ padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', background: '#1e3a5f', color: '#fff', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit' }}
                                    disabled={slotSaving === f.id}
                                    onClick={() => handleSetSlots(f.id)}>
                                    {slotSaving === f.id ? '…' : 'Set'}
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
                              )}
                            </td>
                            <td>
                              {f.approved === 0 && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn-approve" disabled={actionId === f.id} onClick={() => handleApprove(f.id)}>
                                    {actionId === f.id ? '...' : 'Approve'}
                                  </button>
                                  <button className="btn-reject" disabled={actionId === f.id} onClick={() => handleReject(f.id)}>
                                    Reject
                                  </button>
                                </div>
                              )}
                              {f.approved === 1 && (
                                <button className="btn-reject" disabled={actionId === f.id} onClick={() => handleReject(f.id)}>
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </TableCard>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, sub, accent, Icon, delay, onClick, clickable }) {
  return (
    <div className="a-stat-card anim"
      style={{ animationDelay: delay, cursor: clickable ? 'pointer' : 'default' }}
      onClick={onClick}>
      <div style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 16, background: accent + '18', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} />
      </div>
      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#1a0a0a', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.72rem', color: '#a0998f' }}>{sub}</div>
    </div>
  );
}

function TableCard({ title, children, loading }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a0a0a', fontFamily: 'Georgia, serif' }}>{title}</h3>
        {loading && <span style={{ fontSize: '0.75rem', color: '#a0998f' }}>Loading…</span>}
      </div>
      <div style={{ overflowX: 'auto' }}>{children}</div>
    </div>
  );
}

function EmptyRow({ message }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#a0998f', fontSize: '0.875rem' }}>{message}</div>
  );
}

/* ── Icons ── */
function IconGrid({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IconShield({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function IconUsers({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconUser2({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconBell({ size = 20, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
