import React, { useState } from 'react';
import {
  ArrowLeft,
  UserPlus,
  Award,
  ArrowRightLeft,
  Heart,
  BookOpen,
  FileText,
  Calendar,
  MapPin,
  Globe,
  Phone,
  Mail,
  Home,
  Briefcase,
  Info,
  ShieldAlert,
  Plus,
  Download,
  Users as UsersIcon,
  Edit2
} from 'lucide-react';
import ProfileField from './ProfileField';
import ObedienceTimeline from '../Obedience/ObedienceTimeline';
import DocumentManager from './DocumentManager';

interface SisterProfileViewProps {
  sister: any;
  onBack: () => void;
  onEdit: (sister: any) => void;
}

const SisterProfileView: React.FC<SisterProfileViewProps> = ({ sister, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserPlus },
    { id: 'religious', label: 'Religious Life', icon: Award },
    { id: 'obediences', label: 'Obediences', icon: ArrowRightLeft },
    { id: 'family', label: 'Family & Kin', icon: Heart },
    { id: 'education', label: 'Skills & Health', icon: BookOpen },
    { id: 'docs', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="animate-fade-in profile-view-container">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="icon-btn" style={{ width: '42px', height: '42px' }}><ArrowLeft size={22} /></button>
          <div className="flex items-center gap-4">
            <div className="profile-photo-circle" style={sister.passportPhoto ? { backgroundImage: `url(${sister.passportPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}>
              {sister.passportPhoto ? '' : sister.fullName?.[0]}
            </div>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 850, margin: 0, letterSpacing: '-0.02em', color: 'var(--primary)' }}>{sister.religiousName || sister.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge badge-${
                  sister.status === 'Active' ? 'success' : 
                  sister.status === 'on Mission' ? 'info' : 
                  sister.status === 'Exclaustration' ? 'warning' : 
                  sister.status === 'Dismissed' ? 'danger' : 
                  'secondary'
                }`}>{sister.status?.toUpperCase()}</span>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>• {sister.region || 'No Region'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary ripple" onClick={() => onEdit(sister)}><Edit2 size={18} /> Modify Records</button>
        </div>
      </div>

      <div className="profile-nav-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`prof-tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="profile-content-area glass-panel">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h4 className="section-title">Identity & Contact Information</h4>
            <div className="grid grid-2">
              <ProfileField label="Official Name" value={sister.fullName} icon={UsersIcon} />
              <ProfileField label="Religious Name" value={sister.religiousName} icon={Award} />
              <ProfileField label="Region Assigned" value={sister.region} icon={MapPin} />
              <ProfileField label="Date of Birth" value={sister.dateOfBirth ? new Date(sister.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not Recorded'} icon={Calendar} />
              <ProfileField label="Nationality" value={sister.nationality} icon={Globe} />
              <ProfileField label="Blood Group" value={sister.bloodGroup} icon={Heart} />
              <ProfileField label="Phone Contact" value={sister.phone} icon={Phone} />
              <ProfileField label="Email Address" value={sister.email} icon={Mail} />
              <div className="col-span-2">
                <ProfileField label="Home Address" value={sister.homeAddress} icon={MapPin} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'religious' && (
          <div className="animate-fade-in">
            <h4 className="section-title">Religious Life & Apostolate</h4>
            <div className="grid grid-2">
              <ProfileField label="Current Community" value={sister.currentCommunity} icon={Home} />
              <ProfileField label="Assigned Office" value={sister.currentRole} icon={Briefcase} />
              <ProfileField label="Temporary Profession" value={sister.firstProfession ? new Date(sister.firstProfession).toLocaleDateString(undefined, { dateStyle: 'long' }) : '-'} icon={Calendar} />
              <ProfileField label="Perpetual Vows" value={sister.finalVows ? new Date(sister.finalVows).toLocaleDateString(undefined, { dateStyle: 'long' }) : '-'} icon={Award} />
              <div className="col-span-2">
                <ProfileField label="Feast Day" value={sister.feastDay ? new Date(sister.feastDay).toLocaleDateString(undefined, { dateStyle: 'long' }) : '-'} icon={Info} />
              </div>
              <div className="col-span-2">
                <ProfileField label="General Remarks" value={sister.notes} icon={FileText} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'obediences' && (
          <ObedienceTimeline sisterId={sister.id} sisterName={sister.religiousName || sister.fullName} />
        )}

        {activeTab === 'family' && (
          <div className="animate-fade-in">
            <h4 className="section-title">Kinship & Emergency Contacts</h4>
            <div className="grid grid-2">
              <div className="col-span-2">
                <ProfileField label="Primary Emergency Contact" value={sister.emergencyContact} icon={Phone} />
              </div>
              <div className="col-span-2">
                <ProfileField label="Emergency Contact Address" value={sister.emergencyContactAddress} icon={MapPin} />
              </div>

              <div className="col-span-2" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <h5 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 800 }}>LEGAL NEXT OF KIN</h5>
              </div>

              <ProfileField label="Official Name" value={sister.nextOfKinName} icon={UsersIcon} />
              <ProfileField label="Relationship" value={sister.nextOfKinRelationship} icon={Heart} />
              <ProfileField label="Phone Contact" value={sister.nextOfKinPhone} icon={Phone} />
              <ProfileField label="Email Address" value={sister.nextOfKinEmail} icon={Mail} />
              <div className="col-span-2">
                <ProfileField label="Residential Address" value={sister.nextOfKinAddress} icon={MapPin} />
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '20px', background: 'rgba(var(--primary-rgb), 0.02)' }}>
              <UsersIcon size={40} className="text-muted" style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p className="text-muted">Extended family records for <strong>{sister.fullName}</strong> are not yet linked.</p>
              <button className="btn btn-secondary mt-4"><Plus size={16} /> Add Family Member</button>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="animate-fade-in">
            <h4 className="section-title">Education & Competencies</h4>
            <div className="grid grid-1">
              <ProfileField label="Higher Education" value={sister.education} icon={BookOpen} />
              <ProfileField label="Skills & Talents" value={sister.skills} icon={Award} />
              <ProfileField label="Certifications" value={sister.certifications} icon={FileText} />
              <ProfileField label="Languages" value={sister.languages} icon={Globe} />
            </div>

            <h4 className="section-title" style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldAlert size={20} className="text-danger" />
              Health & Medical Confidential
            </h4>
            <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#991b1b' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontWeight: 500 }}>
                {sister.healthNotes || 'No specific health notes recorded.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <DocumentManager sisterId={sister.id} />
        )}
      </div>
    </div>
  );
};

export default SisterProfileView;
