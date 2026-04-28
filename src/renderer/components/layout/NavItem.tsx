import React from 'react'

const NavItem = ({ icon: Icon, label, active = false, onClick, collapsed = false }: any) => (
  <div 
    className={`nav-item ${active ? 'active' : ''}`} 
    onClick={onClick}
    title={collapsed ? label : undefined}
  >
    <div className="nav-icon-container">
      <Icon size={20} />
    </div>
    {!collapsed && <span>{label}</span>}
  </div>
)

export default NavItem
