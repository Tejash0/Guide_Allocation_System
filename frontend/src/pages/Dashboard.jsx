import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAvailableGuides, getFacultyProfile, updateFacultyProfile, getNotifications, markNotificationsRead } from '../api/faculty.js';
import { getPreference, setPreference, getInterests, saveInterests, getProject, saveProject, getStudentNotifications, markStudentNotificationsRead } from '../api/student.js';
import { sendRequest, getMyRequests, getIncomingRequests, updateRequestStatus, withdrawRequest } from '../api/requests.js';

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .anim {
    opacity: 0;
    animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border-radius: 8px;
    cursor: pointer;
    color: rgba(255,255,255,0.45);
    font-size: 0.8375rem;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    position: relative;
    user-select: none;
  }
  .nav-item:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.85); }
  .nav-item.active { background: rgba(201,168,76,0.13); color: #c9a84c; }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 18px;
    background: #c9a84c;
    border-radius: 0 2px 2px 0;
  }

  .stat-card {
    background: #fff;
    border-radius: 14px;
    padding: 22px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px rgba(0,0,0,0.1);
  }

  .section-card {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04);
    overflow: hidden;
  }

  .sign-out {
    background: transparent;
    border: 1.5px solid #d1cdc6;
    color: #374151;
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .sign-out:hover { background: #0d1b2a; color: #fff; border-color: #0d1b2a; }

  .notif-btn {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: #f3f0eb;
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .notif-btn:hover { background: #e8e3db; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1cdc6; border-radius: 3px; }
`;

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = decodeToken(token);
  const isStudent = user?.role !== 'faculty';
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [guides, setGuides] = useState([]);
  const [preferredId, setPreferredId] = useState(null);
  const [prefSaving, setPrefSaving] = useState(null);
  const [prefMsg, setPrefMsg] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  // Request state
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentIds, setSentIds] = useState(new Set());

  // Student interests state
  const [interestsInput, setInterestsInput] = useState('');
  const [savedInterests, setSavedInterests] = useState('');
  const [interestsSaving, setInterestsSaving] = useState(false);
  const [interestsMsg, setInterestsMsg] = useState('');

  // Faculty profile state
  const [facultyProfile, setFacultyProfile] = useState(null);
  const [domainInput, setDomainInput] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Faculty notifications state
  const [notifications, setNotifications] = useState([]);
  const [notifDismissed, setNotifDismissed] = useState(false);

  // Student notifications state
  const [studentNotifs, setStudentNotifs] = useState([]);
  const [studentNotifDismissed, setStudentNotifDismissed] = useState(false);

  // Request action state (accept/reject/withdraw)
  const [requestActionLoading, setRequestActionLoading] = useState(null);
  const [requestActionMsg, setRequestActionMsg] = useState('');

  // Project submission state
  const [projectData, setProjectData] = useState({ project_title: '', project_description: '', tech_stack: '' });
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectMsg, setProjectMsg] = useState('');
  const [projectSaved, setProjectSaved] = useState(null);

  useEffect(() => {
    if (isStudent) {
      getAvailableGuides().then(r => setGuides(Array.isArray(r) ? r : [])).catch(() => {});
      getPreference().then(d => d.preferred_faculty_id != null && setPreferredId(d.preferred_faculty_id)).catch(() => {});
      getInterests().then(d => { if (d.interests) { setInterestsInput(d.interests); setSavedInterests(d.interests); } }).catch(() => {});
      getMyRequests().then(r => { setMyRequests(Array.isArray(r) ? r : []); setSentIds(new Set((Array.isArray(r) ? r : []).map(x => x.faculty_id))); }).catch(() => {});
      getStudentNotifications().then(n => setStudentNotifs(Array.isArray(n) ? n : [])).catch(() => {});
      getProject().then(p => { if (p && !p.error) setProjectSaved(p); }).catch(() => {});
    } else {
      getFacultyProfile()
        .then(p => { setFacultyProfile(p); setDomainInput(p.domain || ''); })
        .catch(() => {});
      getNotifications().then(n => setNotifications(Array.isArray(n) ? n : [])).catch(() => {});
    }
  }, [isStudent]);

  // Re-fetch faculty profile whenever Dashboard tab is opened
  useEffect(() => {
    if (!isStudent && activeTab === 'Dashboard') {
      getFacultyProfile().then(p => setFacultyProfile(p)).catch(() => {});
    }
    if (!isStudent && (activeTab === 'Requests' || activeTab === 'My Students')) {
      getIncomingRequests().then(r => setIncomingRequests(Array.isArray(r) ? r : [])).catch(() => {});
    }
    if (isStudent && activeTab === 'Project') {
      getMyRequests().then(r => { setMyRequests(Array.isArray(r) ? r : []); setSentIds(new Set((Array.isArray(r) ? r : []).map(x => x.faculty_id))); }).catch(() => {});
    }
    if (isStudent && activeTab === 'Submissions') {
      getProject().then(p => { if (p && !p.error) setProjectSaved(p); }).catch(() => {});
    }
  }, [activeTab, isStudent]);

  const handleSaveInterests = async () => {
    if (!interestsInput.trim()) return;
    setInterestsSaving(true);
    setInterestsMsg('');
    try {
      const res = await saveInterests(interestsInput.trim());
      if (res.message) {
        setSavedInterests(interestsInput.trim());
        setInterestsMsg('Interests saved!');
      } else {
        setInterestsMsg(res.error || 'Error saving');
      }
    } catch {
      setInterestsMsg('Network error — try again');
    } finally {
      setInterestsSaving(false);
    }
  };

  const handleDismissNotifications = async () => {
    setNotifDismissed(true);
    try { await markNotificationsRead(); } catch {}
    setNotifications([]);
  };

  const handleSaveProfile = async () => {
    if (!domainInput.trim()) return;
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await updateFacultyProfile(domainInput.trim());
      if (res.message) {
        setProfileMsg('Profile updated!');
        // Re-fetch profile so max_teams and all fields stay in sync
        getFacultyProfile().then(p => setFacultyProfile(p)).catch(() => {});
        setFacultyProfile(prev => ({ ...prev, domain: domainInput.trim() }));
      } else {
        setProfileMsg(res.error || 'Error updating profile');
      }
    } catch {
      setProfileMsg('Network error — try again');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSelectGuide = async (facultyId) => {
    setPrefSaving(facultyId);
    setPrefMsg('');
    try {
      const res = await sendRequest(facultyId);
      if (res.message) {
        setPreferredId(facultyId);
        setSentIds(prev => new Set([...prev, facultyId]));
        setPrefMsg('Request sent to faculty!');
        getAvailableGuides().then(r => setGuides(Array.isArray(r) ? r : [])).catch(() => {});
        getMyRequests().then(r => setMyRequests(Array.isArray(r) ? r : [])).catch(() => {});
      } else {
        setPrefMsg(res.error || 'Error sending request');
      }
    } catch {
      setPrefMsg('Network error — try again');
    }
    setPrefSaving(null);
  };

  const handleDomainFilter = async (domain) => {
    const next = domain === domainFilter ? '' : domain; // clicking active chip clears it
    setDomainFilter(next);
    try {
      const result = await getAvailableGuides(next || undefined);
      setGuides(Array.isArray(result) ? result : []);
    } catch {
      // leave guides as-is on network error
    }
  };

  const handleRequestAction = async (requestId, status) => {
    setRequestActionLoading(requestId + status);
    setRequestActionMsg('');
    try {
      const res = await updateRequestStatus(requestId, status);
      if (res.message) {
        setIncomingRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
        getFacultyProfile().then(p => setFacultyProfile(p)).catch(() => {});
      } else {
        setRequestActionMsg(res.error || 'Error updating request');
      }
    } catch {
      setRequestActionMsg('Network error — try again');
    }
    setRequestActionLoading(null);
  };

  const handleWithdraw = async (requestId, facultyId) => {
    try {
      const res = await withdrawRequest(requestId);
      if (res.message) {
        setMyRequests(prev => prev.filter(r => r.id !== requestId));
        setSentIds(prev => { const next = new Set(prev); next.delete(facultyId); return next; });
        getAvailableGuides().then(r => setGuides(Array.isArray(r) ? r : [])).catch(() => {});
      }
    } catch {}
  };

  const handleDismissStudentNotifs = async () => {
    setStudentNotifDismissed(true);
    try { await markStudentNotificationsRead(); } catch {}
    setStudentNotifs([]);
  };

  const handleSaveProject = async () => {
    if (!projectData.project_title.trim()) return;
    setProjectSaving(true);
    setProjectMsg('');
    try {
      const res = await saveProject(projectData.project_title, projectData.project_description, projectData.tech_stack);
      if (res.message) {
        setProjectMsg('Project saved!');
        setProjectSaved({ ...projectData });
      } else {
        setProjectMsg(res.error || 'Error saving project');
      }
    } catch {
      setProjectMsg('Network error — try again');
    }
    setProjectSaving(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const studentNav = [
    { label: 'Dashboard', icon: IconGrid },
    { label: 'Available Guides', icon: IconUsers },
    { label: 'My Preferences', icon: IconStar },
    { label: 'Project', icon: IconFile },
    { label: 'Submissions', icon: IconSend },
  ];
  const facultyNav = [
    { label: 'Dashboard', icon: IconGrid },
    { label: 'My Students', icon: IconUsers },
    { label: 'Requests', icon: IconBell },
    { label: 'Profile', icon: IconUser },
  ];
  const navItems = isStudent ? studentNav : facultyNav;

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: 'flex', height: '100vh', background: '#ede9e3', fontFamily: "'Trebuchet MS', 'Gill Sans MT', sans-serif" }}>

        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside style={{
          width: 248, flexShrink: 0,
          background: '#0d1b2a',
          display: 'flex', flexDirection: 'column',
          height: '100vh', position: 'sticky', top: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 38, height: 38, flexShrink: 0,
                background: 'linear-gradient(135deg, #c9a84c 0%, #e8c96b 100%)',
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#0d1b2a',
                fontFamily: 'Georgia, serif', letterSpacing: '0.04em',
              }}>GAS</div>
              <div>
                <div style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>
                  Guide Allocation
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', marginTop: 2 }}>
                  System · AY 2024–25
                </div>
              </div>
            </div>
          </div>

          {/* Section label */}
          <div style={{ padding: '18px 20px 6px', color: 'rgba(255,255,255,0.2)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Menu
          </div>

          {/* Nav items */}
          <nav style={{ padding: '0 10px', flex: 1 }}>
            {navItems.map(({ label, icon: Icon }) => (
              <div key={label} className={`nav-item${activeTab === label ? ' active' : ''}`} onClick={() => setActiveTab(label)}>
                <Icon size={15} />
                <span>{label}</span>
              </div>
            ))}
          </nav>

          {/* User footer */}
          <div style={{
            padding: '14px 18px', margin: '0 10px 12px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, flexShrink: 0,
              background: 'linear-gradient(135deg, #1e3a5f, #2a5298)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.7rem', fontWeight: 700,
            }}>{initials}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', textTransform: 'capitalize' }}>
                {user?.role || 'student'}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Topbar */}
          <header style={{
            height: 62, flexShrink: 0,
            background: '#fff',
            borderBottom: '1px solid #e4e0da',
            padding: '0 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>
                {activeTab === 'Dashboard' ? (isStudent ? 'Student Dashboard' : 'Faculty Dashboard') : activeTab}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a0998f', marginTop: 1 }}>{today}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="notif-btn" title="Notifications" style={{ position: 'relative' }}>
                <IconBell size={15} color="#6b7280" />
                {isStudent && studentNotifs.length > 0 && !studentNotifDismissed && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#ef4444', border: '1.5px solid #fff',
                  }} />
                )}
              </button>
              <button className="sign-out" onClick={logout}>Sign Out</button>
            </div>
          </header>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
            {activeTab === 'Available Guides' && isStudent && (
              <div className="anim" style={{ animationDelay: '0s' }}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>
                    Available Faculty Guides ({guides.length}){domainFilter ? ` — "${domainFilter}"` : ''}
                  </div>
                  {prefMsg && (
                    <div style={{ fontSize: '0.8rem', color: prefMsg.includes('saved') ? '#166534' : '#991b1b',
                      background: prefMsg.includes('saved') ? '#dcfce7' : '#fee2e2',
                      padding: '4px 12px', borderRadius: 6, fontWeight: 600 }}>
                      {prefMsg}
                    </div>
                  )}
                </div>
                {/* Domain filter chips */}
                {(() => {
                  const allTags = Array.from(
                    new Set(
                      guides.flatMap(g =>
                        g.domain ? g.domain.split(',').map(d => d.trim()).filter(Boolean) : []
                      )
                    )
                  ).sort();

                  if (allTags.length === 0) return null;

                  return (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      <button
                        onClick={() => handleDomainFilter('')}
                        style={{
                          padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem',
                          fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          border: domainFilter === ''
                            ? '1.5px solid #1e3a5f'
                            : '1px solid rgba(30,58,95,0.25)',
                          background: domainFilter === ''
                            ? 'rgba(30,58,95,0.12)'
                            : 'transparent',
                          color: domainFilter === '' ? '#1e3a5f' : '#6b7280',
                          transition: 'all 0.15s',
                        }}
                      >
                        All
                      </button>
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleDomainFilter(tag)}
                          style={{
                            padding: '4px 12px', borderRadius: 999, fontSize: '0.75rem',
                            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            border: domainFilter === tag
                              ? '1.5px solid #1e3a5f'
                              : '1px solid rgba(30,58,95,0.25)',
                            background: domainFilter === tag
                              ? 'rgba(30,58,95,0.12)'
                              : 'transparent',
                            color: domainFilter === tag ? '#1e3a5f' : '#6b7280',
                            transition: 'all 0.15s',
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  );
                })()}
                {guides.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: 14, padding: '48px', textAlign: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)', color: '#a0998f' }}>
                    No approved faculty available yet.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {guides.map(g => {
                      const isSelected = g.id === preferredId;
                      const isFull = g.current_team_count >= g.max_teams;
                      return (
                        <div key={g.id} style={{
                          background: '#fff', borderRadius: 14, padding: '20px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
                          border: isSelected ? '2px solid #c9a84c' : '2px solid transparent',
                          transition: 'border-color 0.2s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, #1e3a5f, #2a5298)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                            }}>
                              {g.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0d1b2a', fontSize: '0.9rem' }}>{g.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{g.department}</div>
                            </div>
                            {isSelected && (
                              <span style={{ marginLeft: 'auto', background: 'rgba(201,168,76,0.15)', color: '#b8923a',
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
                                Selected
                              </span>
                            )}
                          </div>
                          {/* Domain tags */}
                          {g.domain ? (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                              {g.domain.split(',').map(d => d.trim()).filter(Boolean).map((tag, i) => (
                                <span key={i} style={{
                                  background: 'rgba(30,58,95,0.08)', color: '#1e3a5f',
                                  border: '1px solid rgba(30,58,95,0.15)',
                                  padding: '2px 9px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                                }}>{tag}</span>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 12 }}>No domain listed</div>
                          )}
                          <div style={{ fontSize: '0.75rem', color: isFull ? '#991b1b' : '#166534', marginBottom: 14,
                            background: isFull ? '#fee2e2' : '#dcfce7', display: 'inline-block',
                            padding: '2px 9px', borderRadius: 4, fontWeight: 600 }}>
                            {g.current_team_count} / {g.max_teams} slots filled
                          </div>
                          {(() => {
                            const hasAccepted = myRequests.some(r => r.status === 'accepted');
                            const isDisabled = isFull || prefSaving === g.id || sentIds.has(g.id) || hasAccepted;
                            const alreadyAccepted = myRequests.find(r => r.faculty_id === g.id && r.status === 'accepted');
                            return (
                              <button
                                disabled={isDisabled}
                                onClick={() => !hasAccepted && handleSelectGuide(g.id)}
                                style={{
                                  width: '100%', padding: '9px', borderRadius: 8,
                                  border: alreadyAccepted ? '1.5px solid #22c55e' : sentIds.has(g.id) ? '1.5px solid #c9a84c' : 'none',
                                  cursor: isDisabled ? 'default' : 'pointer',
                                  background: alreadyAccepted ? 'rgba(34,197,94,0.1)' : sentIds.has(g.id) ? 'rgba(201,168,76,0.1)' : isFull || hasAccepted ? '#f3f4f6' : '#0d1b2a',
                                  color: alreadyAccepted ? '#166534' : sentIds.has(g.id) ? '#b8923a' : isFull || hasAccepted ? '#9ca3af' : '#fff',
                                  fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit',
                                  transition: 'all 0.15s',
                                }}>
                                {prefSaving === g.id ? 'Sending…' : alreadyAccepted ? '✓ Your Guide' : sentIds.has(g.id) ? '✓ Request Sent' : isFull ? 'Full' : hasAccepted ? 'Guide Confirmed' : 'Send Guide Request'}
                              </button>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'My Preferences' && isStudent && (
              <div className="anim" style={{ animationDelay: '0s', maxWidth: 680 }}>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 6 }}>Guide Allocation System</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>My Project Preferences</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>Fields you are comfortable working in or have prior experience with.</div>
                </div>

                {/* Tags preview */}
                {savedInterests && (
                  <div style={{
                    background: 'linear-gradient(135deg, #0d1b2a 0%, #162840 100%)',
                    borderRadius: 18, padding: '22px 26px', marginBottom: 16,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', right: -30, top: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(201,168,76,0.07)', pointerEvents: 'none' }} />
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Your Saved Interests</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {savedInterests.split(',').map(d => d.trim()).filter(Boolean).map((tag, i) => (
                        <span key={i} style={{
                          background: 'rgba(201,168,76,0.15)', color: '#e8c96b',
                          border: '1px solid rgba(201,168,76,0.3)',
                          padding: '5px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editor card */}
                <div style={{
                  background: '#fff', borderRadius: 18, padding: '26px 28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
                  marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0ece6' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c' }}>
                      <IconStar size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>Project Domain Preferences</div>
                      <div style={{ fontSize: '0.72rem', color: '#a0998f' }}>Enter fields you've worked in or want to do your project in</div>
                    </div>
                  </div>

                  {/* Suggestion chips */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Quick add (click to append):</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['Machine Learning', 'Web Development', 'Data Science', 'Computer Vision', 'NLP', 'Cybersecurity', 'Cloud Computing', 'IoT', 'Blockchain', 'Mobile Apps'].map(s => (
                        <button key={s} onClick={() => {
                          const current = interestsInput.split(',').map(x => x.trim()).filter(Boolean);
                          if (!current.includes(s)) setInterestsInput(current.length ? current.join(', ') + ', ' + s : s);
                        }} style={{
                          padding: '3px 11px', borderRadius: 999, border: '1px solid #e4e0da',
                          background: '#f8f6f2', color: '#374151', fontSize: '0.76rem', fontWeight: 500,
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.target.style.background = '#0d1b2a'; e.target.style.color = '#fff'; e.target.style.borderColor = '#0d1b2a'; }}
                        onMouseLeave={e => { e.target.style.background = '#f8f6f2'; e.target.style.color = '#374151'; e.target.style.borderColor = '#e4e0da'; }}
                        >+ {s}</button>
                      ))}
                    </div>
                  </div>

                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Your Interested Fields
                    <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>(comma-separated)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Machine Learning, Web Development, Data Science"
                    value={interestsInput}
                    onChange={e => setInterestsInput(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: '1.5px solid #e4e0da', fontSize: '0.85rem', fontFamily: 'inherit',
                      resize: 'vertical', outline: 'none', color: '#0d1b2a', lineHeight: 1.6,
                      transition: 'border-color 0.15s', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#c9a84c'}
                    onBlur={e => e.target.style.borderColor = '#e4e0da'}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                    {interestsMsg ? (
                      <div style={{
                        fontSize: '0.8rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6,
                        color: interestsMsg.includes('saved') ? '#166534' : '#991b1b',
                        background: interestsMsg.includes('saved') ? '#dcfce7' : '#fee2e2',
                      }}>{interestsMsg}</div>
                    ) : <div />}
                    <button
                      onClick={handleSaveInterests}
                      disabled={interestsSaving || !interestsInput.trim()}
                      style={{
                        padding: '9px 24px', borderRadius: 10, border: 'none',
                        cursor: interestsSaving || !interestsInput.trim() ? 'not-allowed' : 'pointer',
                        background: interestsSaving || !interestsInput.trim() ? '#f3f4f6' : '#0d1b2a',
                        color: interestsSaving || !interestsInput.trim() ? '#9ca3af' : '#fff',
                        fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                      {interestsSaving ? 'Saving…' : 'Save Preferences'}
                    </button>
                  </div>
                </div>

                {/* Info note */}
                <div style={{
                  background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)',
                  borderRadius: 12, padding: '12px 16px', fontSize: '0.78rem', color: '#78350f',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>💡</span>
                  <span>These are <strong>your</strong> project domain interests — fields you've worked in before or want to work in. This helps match you with the right faculty guide.</span>
                </div>
              </div>
            )}

            {activeTab === 'Profile' && !isStudent && (
              <div className="anim" style={{ animationDelay: '0s', maxWidth: 680 }}>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 6 }}>Guide Allocation System</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>Faculty Profile</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>Manage your public information and research interests.</div>
                </div>

                {/* Profile overview card */}
                <div style={{
                  background: 'linear-gradient(135deg, #0d1b2a 0%, #162840 100%)',
                  borderRadius: 18, padding: '26px 28px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', right: -20, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(59,130,246,0.07)', pointerEvents: 'none' }} />
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1e3a5f, #2a5298)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '1.1rem', fontWeight: 800,
                    boxShadow: '0 4px 16px rgba(30,58,95,0.5)',
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Georgia, serif', marginBottom: 3 }}>{user?.name || 'Faculty'}</div>
                    {facultyProfile && (
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>{facultyProfile.department} · {facultyProfile.email}</div>
                    )}
                  </div>
                  <div style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(99,163,255,0.3)', color: '#93c5fd', padding: '5px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                    🏛 Faculty
                  </div>
                </div>

                {/* Research interests editor */}
                <div style={{
                  background: '#fff', borderRadius: 18, padding: '26px 28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
                  marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0ece6' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c' }}>
                      <IconStar size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>Research Interests &amp; Domain</div>
                      <div style={{ fontSize: '0.72rem', color: '#a0998f' }}>Visible to students browsing available guides</div>
                    </div>
                  </div>

                  {/* Tag preview */}
                  {domainInput && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {domainInput.split(',').map(d => d.trim()).filter(Boolean).map((tag, i) => (
                        <span key={i} style={{
                          background: 'rgba(201,168,76,0.1)', color: '#b8923a',
                          border: '1px solid rgba(201,168,76,0.25)',
                          padding: '3px 12px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600,
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}

                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Interested Fields / Research Areas
                    <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>(comma-separated)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Machine Learning, Computer Vision, Natural Language Processing"
                    value={domainInput}
                    onChange={e => setDomainInput(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      border: '1.5px solid #e4e0da', fontSize: '0.85rem', fontFamily: 'inherit',
                      resize: 'vertical', outline: 'none', color: '#0d1b2a', lineHeight: 1.6,
                      transition: 'border-color 0.15s', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#c9a84c'}
                    onBlur={e => e.target.style.borderColor = '#e4e0da'}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                    {profileMsg ? (
                      <div style={{
                        fontSize: '0.8rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6,
                        color: profileMsg.includes('updated') ? '#166534' : '#991b1b',
                        background: profileMsg.includes('updated') ? '#dcfce7' : '#fee2e2',
                      }}>{profileMsg}</div>
                    ) : <div />}
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving || !domainInput.trim()}
                      style={{
                        padding: '9px 24px', borderRadius: 10, border: 'none',
                        cursor: profileSaving || !domainInput.trim() ? 'not-allowed' : 'pointer',
                        background: profileSaving || !domainInput.trim() ? '#f3f4f6' : '#0d1b2a',
                        color: profileSaving || !domainInput.trim() ? '#9ca3af' : '#fff',
                        fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.15s',
                      }}>
                      {profileSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* Info note */}
                <div style={{
                  background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: 12, padding: '12px 16px', fontSize: '0.78rem', color: '#1e40af',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>💡</span>
                  <span>Separate multiple interests with commas. Students see this when choosing a guide — clear, specific topics help them make better choices.</span>
                </div>
              </div>
            )}

            {/* ── Student: Project tab with Requests section ── */}
            {activeTab === 'Project' && isStudent && (
              <div className="anim" style={{ animationDelay: '0s' }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 6 }}>Guide Allocation System</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>My Project</div>
                </div>

                {/* Guide Requests section */}
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconBell size={14} color="#a0998f" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>My Guide Requests</span>
                    {myRequests.length > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#eff6ff', color: '#1d4ed8', padding: '1px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700 }}>{myRequests.length}</span>
                    )}
                  </div>
                  {myRequests.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                      <div style={{ marginBottom: 10, opacity: 0.2 }}><IconBell size={30} /></div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>No requests sent yet</div>
                      <div style={{ fontSize: '0.75rem', color: '#a0998f', marginBottom: 16 }}>Go to Available Guides and send a request to a faculty member.</div>
                      <button onClick={() => setActiveTab('Available Guides')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#0d1b2a', color: '#fff', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>Browse Guides</button>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead>
                        <tr>
                          {['Faculty', 'Department', 'Domain', 'Sent On', 'Status', ''].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '9px 16px', background: '#f8f6f2', color: '#6b7280', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #ede9e3' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {myRequests.map(r => (
                          <tr key={r.id}>
                            <td style={{ padding: '11px 16px', fontWeight: 600, color: '#0d1b2a', borderBottom: '1px solid #f3f0eb' }}>{r.faculty_name}</td>
                            <td style={{ padding: '11px 16px', color: '#6b7280', borderBottom: '1px solid #f3f0eb' }}>{r.department}</td>
                            <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f0eb' }}>
                              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {(r.domain || '').split(',').map(d => d.trim()).filter(Boolean).map((tag, i) => (
                                  <span key={i} style={{ background: 'rgba(30,58,95,0.08)', color: '#1e3a5f', padding: '1px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>{tag}</span>
                                ))}
                                {!r.domain && <span style={{ color: '#9ca3af' }}>—</span>}
                              </div>
                            </td>
                            <td style={{ padding: '11px 16px', color: '#9ca3af', fontSize: '0.76rem', borderBottom: '1px solid #f3f0eb' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                            <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f0eb' }}>
                              <span style={{
                                padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                                background: r.status === 'accepted' ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                                color: r.status === 'accepted' ? '#166534' : r.status === 'rejected' ? '#991b1b' : '#854d0e',
                              }}>
                                {r.status === 'pending' ? 'Pending' : r.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                              </span>
                            </td>
                            <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f0eb' }}>
                              {r.status === 'pending' && (
                                <button
                                  onClick={() => handleWithdraw(r.id, r.faculty_id)}
                                  style={{
                                    padding: '4px 11px', borderRadius: 6, border: '1.5px solid #fca5a5',
                                    cursor: 'pointer', background: '#fff', color: '#991b1b',
                                    fontWeight: 600, fontSize: '0.72rem', fontFamily: 'inherit',
                                  }}>
                                  Withdraw
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Quick link to Submissions */}
                <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                      <IconFile size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0d1b2a', fontSize: '0.875rem' }}>
                        {projectSaved?.project_title ? projectSaved.project_title : 'No project submitted yet'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a0998f' }}>
                        {projectSaved?.project_title ? 'Click to update your submission' : 'Submit your project title, description, and tech stack'}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('Submissions')} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#0d1b2a', color: '#fff', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                    {projectSaved?.project_title ? 'Update' : 'Submit Project'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Faculty: Requests tab ── */}
            {activeTab === 'Requests' && !isStudent && (
              <div className="anim" style={{ animationDelay: '0s' }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 6 }}>Guide Allocation System</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>Student Requests</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>Review and accept or reject student guide requests.</div>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconBell size={14} color="#a0998f" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>Incoming Requests ({incomingRequests.length})</span>
                    {requestActionMsg && (
                      <span style={{ marginLeft: 'auto', background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>
                        {requestActionMsg}
                      </span>
                    )}
                  </div>
                  {incomingRequests.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ marginBottom: 10, opacity: 0.2 }}><IconUsers size={30} /></div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>No requests yet</div>
                      <div style={{ fontSize: '0.75rem', color: '#a0998f' }}>Students who select you as their preferred guide will appear here.</div>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead>
                        <tr>
                          {['Student', 'Roll No', 'Email', 'Interests', 'Requested On', 'Status', 'Action'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '9px 16px', background: '#f8f6f2', color: '#6b7280', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #ede9e3' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {incomingRequests.map(r => {
                          const isPending = r.status === 'pending';
                          const atCapacity = (facultyProfile?.accepted_students_count ?? 0) >= (facultyProfile?.max_teams ?? 5);
                          return (
                            <tr key={r.id}>
                              <td style={{ padding: '11px 16px', fontWeight: 600, color: '#0d1b2a', borderBottom: '1px solid #f3f0eb' }}>{r.student_name}</td>
                              <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f0eb' }}>
                                <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>{r.roll_no}</span>
                              </td>
                              <td style={{ padding: '11px 16px', color: '#6b7280', fontSize: '0.8rem', borderBottom: '1px solid #f3f0eb' }}>{r.email}</td>
                              <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f0eb' }}>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {(r.interests || '').split(',').map(d => d.trim()).filter(Boolean).map((tag, i) => (
                                    <span key={i} style={{ background: 'rgba(201,168,76,0.1)', color: '#b8923a', border: '1px solid rgba(201,168,76,0.2)', padding: '1px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>{tag}</span>
                                  ))}
                                  {!r.interests && <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Not specified</span>}
                                </div>
                              </td>
                              <td style={{ padding: '11px 16px', color: '#9ca3af', fontSize: '0.76rem', borderBottom: '1px solid #f3f0eb' }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                              <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f0eb' }}>
                                <span style={{
                                  padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                                  background: r.status === 'accepted' ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                                  color: r.status === 'accepted' ? '#166534' : r.status === 'rejected' ? '#991b1b' : '#854d0e',
                                }}>
                                  {r.status === 'accepted' ? '✓ Accepted' : r.status === 'rejected' ? '✗ Rejected' : 'Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f0eb' }}>
                                {isPending ? (
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                      disabled={requestActionLoading != null || atCapacity}
                                      onClick={() => handleRequestAction(r.id, 'accepted')}
                                      title={atCapacity ? 'You are at full capacity' : 'Accept this student'}
                                      style={{
                                        padding: '4px 12px', borderRadius: 6, border: 'none',
                                        cursor: requestActionLoading != null || atCapacity ? 'not-allowed' : 'pointer',
                                        background: atCapacity ? '#f3f4f6' : '#166534',
                                        color: atCapacity ? '#9ca3af' : '#fff',
                                        fontWeight: 700, fontSize: '0.72rem', fontFamily: 'inherit',
                                      }}>
                                      {requestActionLoading === r.id + 'accepted' ? '…' : 'Accept'}
                                    </button>
                                    <button
                                      disabled={requestActionLoading != null}
                                      onClick={() => handleRequestAction(r.id, 'rejected')}
                                      style={{
                                        padding: '4px 12px', borderRadius: 6, border: '1.5px solid #fca5a5',
                                        cursor: requestActionLoading != null ? 'not-allowed' : 'pointer',
                                        background: '#fff', color: '#991b1b',
                                        fontWeight: 700, fontSize: '0.72rem', fontFamily: 'inherit',
                                      }}>
                                      {requestActionLoading === r.id + 'rejected' ? '…' : 'Reject'}
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── Faculty: My Students tab ── */}
            {activeTab === 'My Students' && !isStudent && (
              <div className="anim" style={{ animationDelay: '0s' }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 6 }}>Guide Allocation System</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>My Students</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>Students who have been assigned to you as their guide.</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece6', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconUsers size={14} color="#a0998f" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>
                      Assigned Students ({incomingRequests.filter(r => r.status === 'accepted').length})
                    </span>
                  </div>
                  {incomingRequests.filter(r => r.status === 'accepted').length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ marginBottom: 10, opacity: 0.2 }}><IconUsers size={30} /></div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>No students assigned yet</div>
                      <div style={{ fontSize: '0.75rem', color: '#a0998f' }}>Accept student requests from the Requests tab to see them here.</div>
                      <button onClick={() => setActiveTab('Requests')} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#0d1b2a', color: '#fff', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                        View Requests
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, padding: 20 }}>
                      {incomingRequests.filter(r => r.status === 'accepted').map(r => (
                        <div key={r.id} style={{ background: '#f8f6f2', borderRadius: 12, padding: '18px', border: '1px solid #e8e3db' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                              background: 'linear-gradient(135deg, #1e3a5f, #2a5298)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                            }}>
                              {r.student_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0d1b2a', fontSize: '0.875rem' }}>{r.student_name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{r.email}</div>
                            </div>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>{r.roll_no}</span>
                          </div>
                          {r.interests && (
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {r.interests.split(',').map(d => d.trim()).filter(Boolean).map((tag, i) => (
                                <span key={i} style={{ background: 'rgba(201,168,76,0.1)', color: '#b8923a', border: '1px solid rgba(201,168,76,0.2)', padding: '1px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Student: Submissions tab ── */}
            {activeTab === 'Submissions' && isStudent && (
              <div className="anim" style={{ animationDelay: '0s', maxWidth: 680 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 6 }}>Guide Allocation System</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>Project Submission</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>Submit your project details once your guide has been confirmed.</div>
                </div>

                {myRequests.filter(r => r.status === 'accepted').length === 0 ? (
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: '48px 24px', textAlign: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)',
                    border: '2px dashed #e4e0da',
                  }}>
                    <div style={{ opacity: 0.2, marginBottom: 12 }}><IconFile size={36} /></div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>Guide not confirmed yet</div>
                    <div style={{ fontSize: '0.78rem', color: '#a0998f', marginBottom: 18 }}>Your project submission will be unlocked once a faculty guide accepts your request.</div>
                    <button onClick={() => setActiveTab('Available Guides')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#0d1b2a', color: '#fff', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                      Find a Guide
                    </button>
                  </div>
                ) : (
                  <>
                    {projectSaved?.project_title && (
                      <div style={{
                        background: 'linear-gradient(135deg, #0d1b2a 0%, #162840 100%)',
                        borderRadius: 16, padding: '20px 24px', marginBottom: 16,
                      }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Currently Saved</div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{projectSaved.project_title}</div>
                        {projectSaved.project_description && (
                          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', marginBottom: 10, lineHeight: 1.5 }}>{projectSaved.project_description}</div>
                        )}
                        {projectSaved.tech_stack && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {projectSaved.tech_stack.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                              <span key={i} style={{ background: 'rgba(201,168,76,0.15)', color: '#e8c96b', border: '1px solid rgba(201,168,76,0.3)', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ background: '#fff', borderRadius: 16, padding: '26px 28px', boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f0ece6' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                          <IconFile size={15} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>Project Details</div>
                          <div style={{ fontSize: '0.72rem', color: '#a0998f' }}>Fill in your project information</div>
                        </div>
                      </div>

                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Project Title <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Smart Traffic Management using Computer Vision"
                        value={projectData.project_title}
                        onChange={e => setProjectData(p => ({ ...p, project_title: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                          border: '1.5px solid #e4e0da', fontSize: '0.85rem', fontFamily: 'inherit',
                          outline: 'none', color: '#0d1b2a', marginBottom: 16,
                        }}
                        onFocus={e => e.target.style.borderColor = '#c9a84c'}
                        onBlur={e => e.target.style.borderColor = '#e4e0da'}
                      />

                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>Description</label>
                      <textarea
                        rows={4}
                        placeholder="Brief description of your project scope and objectives"
                        value={projectData.project_description}
                        onChange={e => setProjectData(p => ({ ...p, project_description: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                          border: '1.5px solid #e4e0da', fontSize: '0.85rem', fontFamily: 'inherit',
                          resize: 'vertical', outline: 'none', color: '#0d1b2a', lineHeight: 1.6, marginBottom: 16,
                        }}
                        onFocus={e => e.target.style.borderColor = '#c9a84c'}
                        onBlur={e => e.target.style.borderColor = '#e4e0da'}
                      />

                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Tech Stack <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Python, OpenCV, TensorFlow, Flask"
                        value={projectData.tech_stack}
                        onChange={e => setProjectData(p => ({ ...p, tech_stack: e.target.value }))}
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 10, boxSizing: 'border-box',
                          border: '1.5px solid #e4e0da', fontSize: '0.85rem', fontFamily: 'inherit',
                          outline: 'none', color: '#0d1b2a', marginBottom: 20,
                        }}
                        onFocus={e => e.target.style.borderColor = '#c9a84c'}
                        onBlur={e => e.target.style.borderColor = '#e4e0da'}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {projectMsg ? (
                          <div style={{
                            fontSize: '0.8rem', fontWeight: 600, padding: '5px 12px', borderRadius: 6,
                            color: projectMsg.includes('saved') ? '#166534' : '#991b1b',
                            background: projectMsg.includes('saved') ? '#dcfce7' : '#fee2e2',
                          }}>{projectMsg}</div>
                        ) : <div />}
                        <button
                          onClick={handleSaveProject}
                          disabled={projectSaving || !projectData.project_title.trim()}
                          style={{
                            padding: '9px 24px', borderRadius: 10, border: 'none',
                            cursor: projectSaving || !projectData.project_title.trim() ? 'not-allowed' : 'pointer',
                            background: projectSaving || !projectData.project_title.trim() ? '#f3f4f6' : '#0d1b2a',
                            color: projectSaving || !projectData.project_title.trim() ? '#9ca3af' : '#fff',
                            fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.15s',
                          }}>
                          {projectSaving ? 'Saving…' : projectSaved?.project_title ? 'Update Project' : 'Submit Project'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab !== 'Dashboard' && activeTab !== 'Available Guides' && activeTab !== 'My Preferences' && activeTab !== 'Profile' && activeTab !== 'Project' && activeTab !== 'Requests' && activeTab !== 'My Students' && activeTab !== 'Submissions' && (
              <div className="anim" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: 'calc(100vh - 120px)', textAlign: 'center', animationDelay: '0s',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, marginBottom: 20,
                  background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c9a84c',
                }}>
                  {(() => { const Item = navItems.find(n => n.label === activeTab); return Item ? <Item.icon size={30} /> : null; })()}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif', marginBottom: 8 }}>
                  {activeTab}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#a0998f', marginBottom: 6 }}>
                  This feature is coming in a future sprint.
                </div>
                <div style={{
                  display: 'inline-block', marginTop: 16,
                  padding: '5px 14px', borderRadius: 999,
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  color: '#b8923a', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  Available Soon
                </div>
              </div>
            )}
            {activeTab === 'Dashboard' && (<>

            {/* Welcome banner */}
            <div className="anim" style={{
              background: 'linear-gradient(130deg, #0d1b2a 0%, #16304f 60%, #1a3a5c 100%)',
              borderRadius: 16,
              padding: '26px 30px',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              animationDelay: '0s',
            }}>
              {/* Decorative blobs */}
              <div style={{ position: 'absolute', right: -30, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(201,168,76,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 80, bottom: -70, width: 160, height: 160, borderRadius: '50%', background: 'rgba(201,168,76,0.04)', pointerEvents: 'none' }} />

              <div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 500, marginBottom: 6 }}>
                  Welcome back
                </div>
                <div style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 700, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {user?.name || 'User'}
                </div>
              </div>

              <div style={{
                padding: '7px 18px', borderRadius: 999,
                background: isStudent ? 'rgba(201,168,76,0.18)' : 'rgba(59,130,246,0.18)',
                border: `1px solid ${isStudent ? 'rgba(201,168,76,0.35)' : 'rgba(99,163,255,0.35)'}`,
                color: isStudent ? '#e8c96b' : '#93c5fd',
                fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.02em',
                flexShrink: 0,
              }}>
                {isStudent ? '🎓 Student' : '🏛 Faculty'}
              </div>
            </div>

            {/* Faculty approval notification banner */}
            {!isStudent && notifications.length > 0 && !notifDismissed && (
              <div className="anim" style={{
                background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
                border: '1px solid #22c55e',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                boxShadow: '0 0 0 1px rgba(34,197,94,0.2), 0 4px 20px rgba(34,197,94,0.12)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.2)',
                  border: '1.5px solid #22c55e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '1rem',
                }}>✓</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>
                    Account Approved
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {notifications[0].message}
                  </div>
                </div>
                <button
                  onClick={handleDismissNotifications}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', padding: '0 4px',
                    lineHeight: 1, flexShrink: 0,
                  }}
                  title="Dismiss"
                >✕</button>
              </div>
            )}

            {/* Student notification banner */}
            {isStudent && studentNotifs.length > 0 && !studentNotifDismissed && (
              <div className="anim" style={{
                background: studentNotifs[0].message.includes('accepted')
                  ? 'linear-gradient(135deg, #052e16 0%, #14532d 100%)'
                  : 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
                border: `1px solid ${studentNotifs[0].message.includes('accepted') ? '#22c55e' : '#ef4444'}`,
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                boxShadow: studentNotifs[0].message.includes('accepted')
                  ? '0 0 0 1px rgba(34,197,94,0.2), 0 4px 20px rgba(34,197,94,0.12)'
                  : '0 0 0 1px rgba(239,68,68,0.2), 0 4px 20px rgba(239,68,68,0.12)',
                animationDelay: '0s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: studentNotifs[0].message.includes('accepted') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                  border: `1.5px solid ${studentNotifs[0].message.includes('accepted') ? '#22c55e' : '#ef4444'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '1rem',
                }}>{studentNotifs[0].message.includes('accepted') ? '✓' : '✕'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: studentNotifs[0].message.includes('accepted') ? '#4ade80' : '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>
                    {studentNotifs[0].message.includes('accepted') ? 'Guide Request Accepted!' : 'Guide Request Update'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    {studentNotifs[0].message}
                  </div>
                </div>
                <button
                  onClick={handleDismissStudentNotifs}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}
                  title="Dismiss"
                >✕</button>
              </div>
            )}

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
              {isStudent ? <>
                <StatCard label="Guide Status"
                  value={preferredId ? (guides.find(g => g.id === preferredId)?.name || 'Preferred') : 'Unassigned'}
                  sub={preferredId ? 'Preference set' : 'Awaiting allocation'}
                  accent="#f59e0b" Icon={IconUser} delay="0.08s" />
                <StatCard label="Project Status"
                  value={projectSaved?.project_title ? 'Submitted' : 'Not Submitted'}
                  sub={projectSaved?.project_title ? projectSaved.project_title : 'No project added'}
                  accent="#3b82f6" Icon={IconFile} delay="0.14s" />
                <StatCard label="Requests Sent"
                  value={myRequests.length}
                  sub={`${myRequests.filter(r => r.status === 'accepted').length} accepted`}
                  accent="#10b981" Icon={IconSend} delay="0.20s" />
              </> : <>
                <StatCard label="Assigned Students" value={facultyProfile?.accepted_students_count ?? '…'} sub="Currently guiding"       accent="#3b82f6" Icon={IconUsers} delay="0.08s" />
                <StatCard label="Pending Requests"  value={facultyProfile?.pending_requests_count ?? '…'} sub="Awaiting your review"    accent="#f59e0b" Icon={IconBell}  delay="0.14s" />
                <StatCard label="Max Capacity" value={facultyProfile?.max_teams ?? '…'} sub="Team slots (set by admin)" accent="#10b981" Icon={IconGrid} delay="0.20s" />
              </>}
            </div>

            {/* Section cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {isStudent ? <>
                <SectionCard title="My Guide" Icon={IconUser} delay="0.28s">
                  {(() => {
                    const accepted = myRequests.find(r => r.status === 'accepted');
                    if (!accepted) return (
                      <EmptyState Icon={IconUser} title="No guide confirmed yet"
                        desc="Send a request to a faculty guide. Once they accept, your guide will appear here." />
                    );
                    return (
                      <div style={{ padding: '20px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #2a5298)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                            {accepted.faculty_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0d1b2a', fontSize: '0.9rem' }}>{accepted.faculty_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{accepted.department}</div>
                          </div>
                          <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#166534', padding: '2px 9px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700 }}>✓ Confirmed</span>
                        </div>
                        {accepted.domain && (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            {accepted.domain.split(',').map(d => d.trim()).filter(Boolean).map((tag, i) => (
                              <span key={i} style={{ background: 'rgba(30,58,95,0.08)', color: '#1e3a5f', padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600 }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </SectionCard>
                <SectionCard title="Guide Requests" Icon={IconBell} delay="0.34s">
                  {myRequests.length === 0 ? (
                    <EmptyState Icon={IconBell} title="No requests sent"
                      desc="Browse available guides and send a request to get started." />
                  ) : (
                    <div style={{ padding: '12px 18px' }}>
                      {myRequests.slice(0, 3).map(r => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f0eb' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b2a' }}>{r.faculty_name}</div>
                          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: r.status === 'accepted' ? '#dcfce7' : r.status === 'rejected' ? '#fee2e2' : '#fef9c3', color: r.status === 'accepted' ? '#166534' : r.status === 'rejected' ? '#991b1b' : '#854d0e' }}>
                            {r.status === 'accepted' ? '✓' : r.status === 'rejected' ? '✗' : '…'} {r.status}
                          </span>
                        </div>
                      ))}
                      {myRequests.length > 3 && (
                        <div style={{ fontSize: '0.75rem', color: '#a0998f', marginTop: 8, cursor: 'pointer', textAlign: 'center' }} onClick={() => setActiveTab('Project')}>
                          +{myRequests.length - 3} more — view all
                        </div>
                      )}
                    </div>
                  )}
                </SectionCard>
              </> : <>
                <SectionCard title="My Students" Icon={IconUsers} delay="0.28s">
                  {(facultyProfile?.accepted_students_count ?? 0) === 0 ? (
                    <EmptyState Icon={IconUsers} title="No students assigned"
                      desc="Accept student requests from the Requests tab to assign them as your guides." />
                  ) : (
                    <div style={{ padding: '12px 18px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#374151', marginBottom: 8 }}>
                        You are currently guiding <strong>{facultyProfile.accepted_students_count}</strong> student{facultyProfile.accepted_students_count !== 1 ? 's' : ''}.
                      </div>
                      <button onClick={() => setActiveTab('My Students')} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', background: '#0d1b2a', color: '#fff', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit' }}>View Students</button>
                    </div>
                  )}
                </SectionCard>
                <SectionCard title="Pending Requests" Icon={IconBell} delay="0.34s">
                  {(facultyProfile?.pending_requests_count ?? 0) === 0 ? (
                    <EmptyState Icon={IconBell} title="No pending requests"
                      desc="Student guide requests will appear here for your review." />
                  ) : (
                    <div style={{ padding: '12px 18px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#374151', marginBottom: 8 }}>
                        <strong>{facultyProfile.pending_requests_count}</strong> student{facultyProfile.pending_requests_count !== 1 ? 's are' : ' is'} awaiting your response.
                      </div>
                      <button onClick={() => setActiveTab('Requests')} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', background: '#0d1b2a', color: '#fff', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit' }}>Review Requests</button>
                    </div>
                  )}
                </SectionCard>
              </>}
            </div>

            </>)}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function StatCard({ label, value, sub, accent, Icon, delay }) {
  return (
    <div className="stat-card anim" style={{ animationDelay: delay }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, marginBottom: 16,
        background: accent + '18', color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} />
      </div>
      <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.72rem', color: '#a0998f' }}>{sub}</div>
    </div>
  );
}

function SectionCard({ title, Icon, children, delay }) {
  return (
    <div className="section-card anim" style={{ animationDelay: delay }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid #f0ece6',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ color: '#a0998f' }}><Icon size={14} /></span>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d1b2a', fontFamily: 'Georgia, serif' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ Icon, title, desc }) {
  return (
    <div style={{ padding: '36px 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: 10, opacity: 0.25 }}><Icon size={30} /></div>
      <div style={{ fontSize: '0.8375rem', fontWeight: 600, color: '#374151', marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: '#a0998f', lineHeight: 1.55, maxWidth: 230, margin: '0 auto' }}>{desc}</div>
    </div>
  );
}

/* ── Inline SVG Icons ────────────────────────────────────────── */

function IconGrid({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconUser({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconUsers({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconFile({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}
function IconSend({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function IconBell({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconClock({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconStar({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
