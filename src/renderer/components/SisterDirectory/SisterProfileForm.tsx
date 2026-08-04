import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ChevronRight,
  Save,
  Camera,
  Check,
  ArrowRightLeft,
  Users as UsersIcon,
  Award,
  Heart,
  BookOpen,
  Plus,
  Trash2,
} from "lucide-react";
import { showToast } from "../../utils/toast";
import FieldErr from "../shared/FieldErr";
import FG from "../shared/FG";

const WIZARD_STEPS = [
  { label: "Personal", subtitle: "Identity & Contacts", icon: UsersIcon },
  { label: "Religious", subtitle: "Vows & Apostolate", icon: Award },
  { label: "Family", subtitle: "Next of Kin", icon: Heart },
  { label: "Education", subtitle: "Skills & Health", icon: BookOpen },
  { label: "Obedience", subtitle: "Initial Posting", icon: ArrowRightLeft },
];

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

const sisterSchema = z.object({
  fullName: z.string().min(1, "Birth Name is required"),
  religiousName: z.string().optional(),
  region: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  originState: z.string().optional(),
  bloodGroup: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  homeAddress: z.string().optional(),
  status: z.string().min(1),
  currentCommunity: z.string().optional(),
  currentRole: z.string().optional(),
  feastDay: z.string().optional(),
  firstProfession: z.string().optional(),
  finalVows: z.string().optional(),
  notes: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactAddress: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinEmail: z.string().optional(),
  nextOfKinAddress: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  certifications: z.string().optional(),
  languages: z.string().optional(),
  healthNotes: z.string().optional(),
  ObedienceCommunity: z.string().optional(),
  ObedienceRole: z.string().optional(),
  ObedienceStartDate: z.string().optional(),
});

type SisterFormData = z.infer<typeof sisterSchema>;

const STEP_FIELDS: (keyof SisterFormData)[][] = [
  [
    "fullName",
    "religiousName",
    "region",
    "dateOfBirth",
    "nationality",
    "originState",
    "bloodGroup",
    "phone",
    "email",
    "homeAddress",
  ],
  [
    "status",
    "currentCommunity",
    "currentRole",
    "feastDay",
    "firstProfession",
    "finalVows",
    "notes",
  ],
  [
    "emergencyContact",
    "emergencyContactPhone",
    "emergencyContactAddress",
    "nextOfKinName",
    "nextOfKinRelationship",
    "nextOfKinPhone",
    "nextOfKinEmail",
    "nextOfKinAddress",
  ],
  ["education", "skills", "certifications", "languages", "healthNotes"],
  ["ObedienceCommunity", "ObedienceRole", "ObedienceStartDate"],
];

const SisterProfileForm = ({
  sister,
  onBack,
  onSave,
}: {
  sister?: any;
  onBack: () => void;
  onSave: () => void;
}) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string | null>(
    sister?.passportPhoto || null,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [communities, setCommunities] = useState<any[]>([]);

  const [obediencesList, setObediencesList] = useState<
    Array<{
      id?: string;
      communityName: string;
      officeHeld: string;
      startDate: string;
      endDate: string;
      remarks: string;
    }>
  >(() => {
    if (sister?.Obediences && sister.Obediences.length > 0) {
      return sister.Obediences.map((o: any) => ({
        id: o.id,
        communityName: o.communityName || "",
        officeHeld: o.officeHeld || "",
        startDate: o.startDate
          ? new Date(o.startDate).toISOString().split("T")[0]
          : "",
        endDate: o.endDate
          ? new Date(o.endDate).toISOString().split("T")[0]
          : "",
        remarks: o.remarks || "",
      }));
    }
    return [
      {
        communityName: "",
        officeHeld: "",
        startDate: "",
        endDate: "",
        remarks: "",
      },
    ];
  });

  const handleAddObedience = () => {
    setObediencesList((prev) => [
      ...prev,
      {
        communityName: "",
        officeHeld: "",
        startDate: "",
        endDate: "",
        remarks: "",
      },
    ]);
  };

  const handleRemoveObedience = (index: number) => {
    setObediencesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleObedienceChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setObediencesList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  useEffect(() => {
    // @ts-ignore
    window.api
      .getCommunities()
      .then((data) => setCommunities(data || []))
      .catch(console.error);
  }, []);

  const {
    register,
    handleSubmit: rhfSubmit,
    trigger,
    formState: { errors },
    setValue,
  } = useForm<SisterFormData>({
    resolver: zodResolver(sisterSchema),
    defaultValues: {
      fullName: sister?.fullName || "",
      religiousName: sister?.religiousName || "",
      region: sister?.region || "",
      dateOfBirth: sister?.dateOfBirth
        ? new Date(sister.dateOfBirth).toISOString().split("T")[0]
        : "",
      nationality: sister?.nationality || "Nigerian",
      originState: sister?.originState || "",
      bloodGroup: sister?.bloodGroup || "O+",
      phone: sister?.phone || "",
      email: sister?.email || "",
      homeAddress: sister?.homeAddress || "",
      status: sister?.status || "Active",
      feastDay: sister?.feastDay
        ? new Date(sister.feastDay).toISOString().split("T")[0]
        : "",
      firstProfession: sister?.firstProfession
        ? new Date(sister.firstProfession).toISOString().split("T")[0]
        : "",
      finalVows: sister?.finalVows
        ? new Date(sister.finalVows).toISOString().split("T")[0]
        : "",
      currentCommunity: sister?.currentCommunity || "",
      currentRole: sister?.currentRole || "",
      notes: sister?.notes || "",
      emergencyContact: sister?.emergencyContact || "",
      emergencyContactPhone: sister?.emergencyContactPhone || "",
      emergencyContactAddress: sister?.emergencyContactAddress || "",
      nextOfKinName: sister?.nextOfKinName || "",
      nextOfKinRelationship: sister?.nextOfKinRelationship || "",
      nextOfKinPhone: sister?.nextOfKinPhone || "",
      nextOfKinEmail: sister?.nextOfKinEmail || "",
      nextOfKinAddress: sister?.nextOfKinAddress || "",
      education: sister?.education || "",
      skills: sister?.skills || "",
      certifications: sister?.certifications || "",
      languages: sister?.languages || "",
      healthNotes: sister?.healthNotes || "",
      ObedienceCommunity: "",
      ObedienceRole: "",
      ObedienceStartDate: "",
    },
  });

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: SisterFormData) => {
    setSaving(true);
    try {
      const payload: any = { ...data };

      // Automatic formatting for Religious Name
      if (payload.religiousName) {
        let name = payload.religiousName.trim();
        if (name) {
          // Prepend 'Sr. ' if not present
          if (!name.toLowerCase().startsWith("sr.")) {
            name = `Sr. ${name}`;
          }
          // Append ', OSF' if not present
          const upperName = name.toUpperCase();
          if (!upperName.endsWith(", OSF") && !upperName.endsWith(",OSF")) {
            name = `${name}, OSF`;
          }
        }
        payload.religiousName = name;
      }
      if (payload.dateOfBirth)
        payload.dateOfBirth = new Date(payload.dateOfBirth);
      else payload.dateOfBirth = null;
      if (payload.feastDay) payload.feastDay = new Date(payload.feastDay);
      else payload.feastDay = null;
      if (payload.firstProfession)
        payload.firstProfession = new Date(payload.firstProfession);
      else payload.firstProfession = null;
      if (payload.finalVows) payload.finalVows = new Date(payload.finalVows);
      else payload.finalVows = null;
      if (photo) payload.passportPhoto = photo;

      const {
        ObedienceCommunity,
        ObedienceRole,
        ObedienceStartDate,
        ...restPayload
      } = payload;
      const finalPayload = { ...restPayload };

      // Process dynamic obediences array
      const validObediences = obediencesList
        .filter((o) => o.communityName.trim() && o.startDate)
        .map((o) => ({
          id: o.id,
          communityName: o.communityName.trim(),
          officeHeld: o.officeHeld.trim() || "Member",
          ministryType: "Missionary",
          startDate: new Date(o.startDate),
          endDate: o.endDate ? new Date(o.endDate) : null,
          remarks: o.remarks ? o.remarks.trim() : null,
        }));

      if (!sister?.id && validObediences.length > 0) {
        finalPayload.Obediences = {
          create: validObediences.map(({ id, ...rest }) => rest),
        };
        const currentActive =
          validObediences.find((o) => !o.endDate) ||
          validObediences[validObediences.length - 1];
        if (currentActive) {
          finalPayload.currentCommunity = currentActive.communityName;
          finalPayload.currentRole = currentActive.officeHeld;
        }
      }

      // @ts-ignore
      const savedSister = await window.api.upsertSister(sister?.id, finalPayload);
      const targetSisterId = sister?.id || savedSister?.id;

      if (sister?.id && validObediences.length > 0 && targetSisterId) {
        for (const ob of validObediences) {
          if (!ob.id) {
            // @ts-ignore
            await window.api.upsertObedience({
              ...ob,
              sisterId: targetSisterId,
            });
          }
        }
      }
      showToast(
        "success",
        "Profile Saved",
        `${data.fullName}'s record has been saved successfully.`,
      );
      onSave();
    } catch (err: any) {
      showToast(
        "error",
        "Save Failed",
        err.message || "An unexpected error occurred.",
      );
    } finally {
      setSaving(false);
    }
  };

  const progress = Math.round(((step + 1) / WIZARD_STEPS.length) * 100);

  return (
    <div className="wiz-wrap animate-fade-in">
      <div className="wiz-hdr">
        <button
          className="icon-btn"
          onClick={onBack}
          style={{ background: "white", flexShrink: 0 }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="wiz-title">
            {sister ? "Edit Sister Profile" : "New Sister Registration"}
          </h2>
          <p className="text-muted" style={{ fontSize: "0.875rem" }}>
            Step {step + 1} of {WIZARD_STEPS.length} —{" "}
            {WIZARD_STEPS[step].subtitle}
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
          {step > 0 && (
            <button
              className="btn btn-outline"
              style={{ background: "white" }}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          {step < WIZARD_STEPS.length - 1 ? (
            <button className="btn btn-primary ripple" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary ripple"
              onClick={rhfSubmit(onSubmit)}
              disabled={saving}
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
            </button>
          )}
        </div>
      </div>

      <div className="wiz-bar">
        <div className="wiz-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="wiz-tabs">
        {WIZARD_STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step,
            active = i === step;
          return (
            <button
              key={i}
              className={`wiz-tab${active ? " active" : ""}${done ? " done" : ""}`}
              onClick={() => setStep(i)}
            >
              <div className="wiz-tab-ico">
                {done ? <Check size={15} /> : <Icon size={15} />}
              </div>
              <div>
                <div className="wiz-tab-step">Step {i + 1}</div>
                <div className="wiz-tab-label">{s.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {step === 0 && (
        <div className="glass-panel wiz-body animate-fade-in">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div
              className="photo-upload-area"
              onClick={() => fileRef.current?.click()}
              style={
                photo
                  ? {
                      backgroundImage: `url(${photo})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "3px solid var(--accent)",
                    }
                  : {}
              }
            >
              {!photo && (
                <div className="photo-upload-inner">
                  <Camera size={36} />
                  <span>Upload Photo</span>
                </div>
              )}
              <div className="photo-upload-overlay">
                <Camera size={22} />
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const r = new FileReader();
                  r.onload = (ev) => setPhoto(ev.target?.result as string);
                  r.readAsDataURL(f);
                }
              }}
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginTop: "0.75rem",
              }}
            >
              Click to upload passport photograph
            </p>
          </div>

          <div className="grid grid-2">
            <FG label="Birth Name" required>
              <input
                {...register("fullName")}
                className={errors.fullName ? "input-error" : ""}
                placeholder="e.g. OKORO, Mary Magdalene"
              />
              <FieldErr msg={errors.fullName?.message} />
            </FG>
            <FG label="Religious Name">
              <input
                {...register("religiousName")}
                placeholder="e.g. Sr. Mary Thérèse, OSF"
              />
            </FG>
            <FG label="Region Assigned">
              <select {...register("region")}>
                <option value="">Select Region...</option>
                <option value="St. Francis Region, Abeokuta">
                  St. Francis Region, Abeokuta
                </option>
                <option value="Immaculate Conception Region, Asaba">
                  Immaculate Conception Region, Asaba
                </option>
                <option value="Our Lady of Angels Region, Osogbo">
                  Our Lady of Angels Region, Osogbo
                </option>
              </select>
            </FG>
            <FG label="Date of Birth">
              <input type="date" {...register("dateOfBirth")} />
            </FG>
            <FG label="Nationality">
              <input {...register("nationality")} />
            </FG>
            <FG label="State of Origin">
              <input
                {...register("originState")}
                placeholder="e.g. Enugu State"
              />
            </FG>
            <FG label="Blood Group">
              <select {...register("bloodGroup")}>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </FG>
            <FG label="Phone Number">
              <input
                type="tel"
                {...register("phone")}
                placeholder="+234 xxx xxx xxxx"
              />
            </FG>
            <FG label="Email Address">
              <input
                type="email"
                {...register("email")}
                placeholder="sister@fsic.org"
              />
            </FG>
            <FG label="Permanent Home Address" full>
              <textarea
                {...register("homeAddress")}
                rows={2}
                placeholder="Full residential address..."
              />
            </FG>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="glass-panel wiz-body animate-fade-in">
          <div className="grid grid-2">
            <FG label="Membership Status">
              <select {...register("status")}>
                <option value="Active">Active</option>
                <option value="in Formation">in Formation</option>
                <option value="on Mission">on Mission</option>
                <option value="Exclaustration">Exclaustration</option>
                <option value="Departure">Departure</option>
                <option value="Dismissed">Dismissed</option>
                <option value="Deceased">Deceased</option>
              </select>
            </FG>
            <FG label="Current Community / Convent">
              <select {...register("currentCommunity")}>
                <option value="">Select Community...</option>
                {communities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FG>
            <FG label="Current Role / Office">
              <input
                {...register("currentRole")}
                placeholder="e.g. Co-ordinator, Member, Bursar"
              />
            </FG>
            <FG label="Feast Day Date">
              <input type="date" {...register("feastDay")} />
            </FG>
            <FG label="Date of Temporary Vows">
              <input type="date" {...register("firstProfession")} />
            </FG>
            <FG label="Date of Perpetual Vows">
              <input type="date" {...register("finalVows")} />
            </FG>
            <FG label="General Remarks / Notes" full>
              <textarea
                {...register("notes")}
                rows={3}
                placeholder="Any other relevant information about this sister's religious life..."
              />
            </FG>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass-panel wiz-body animate-fade-in">
          <div className="grid grid-2" style={{ marginBottom: "2rem" }}>
            <FG label="Primary Emergency Contact Name">
              <input
                {...register("emergencyContact")}
                placeholder="e.g. Mrs. Ngozi Okoro"
              />
            </FG>
            <FG label="Emergency Contact Phone Number">
              <input
                type="tel"
                {...register("emergencyContactPhone")}
                placeholder="+234 812 000 0000"
              />
            </FG>
            <FG label="Emergency Contact Address" full>
              <input
                {...register("emergencyContactAddress")}
                placeholder="Residential or Office address of emergency contact..."
              />
            </FG>

            <div
              className="col-span-2"
              style={{ marginTop: "1.5rem", marginBottom: "1rem" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    height: "1px",
                    background: "var(--border)",
                    flex: 1,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Next of Kin Details
                </span>
                <div
                  style={{
                    height: "1px",
                    background: "var(--border)",
                    flex: 1,
                  }}
                />
              </div>
            </div>

            <FG label="Next of Kin Birth Name">
              <input
                {...register("nextOfKinName")}
                placeholder="Birth name of next of kin"
              />
            </FG>
            <FG label="Relationship">
              <input
                {...register("nextOfKinRelationship")}
                placeholder="e.g. Father, Mother, Brother, Sister"
              />
            </FG>
            <FG label="Phone Number">
              <input
                type="tel"
                {...register("nextOfKinPhone")}
                placeholder="+234 ..."
              />
            </FG>
            <FG label="Email Address">
              <input
                type="email"
                {...register("nextOfKinEmail")}
                placeholder="email@example.com"
              />
            </FG>
            <FG label="Residential Address" full>
              <textarea
                {...register("nextOfKinAddress")}
                rows={2}
                placeholder="Full address of next of kin..."
              />
            </FG>
          </div>

          <div
            style={{
              padding: "1.75rem 2rem",
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.05), rgba(249,115,22,0.02))",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed rgba(249,115,22,0.3)",
            }}
          >
            <div
              className="flex items-center gap-3"
              style={{ marginBottom: "0.75rem" }}
            >
              <div
                style={{
                  padding: "0.5rem",
                  background: "rgba(249,115,22,0.1)",
                  borderRadius: "10px",
                  color: "var(--accent)",
                }}
              >
                <Heart size={20} />
              </div>
              <p
                style={{
                  fontWeight: 800,
                  color: "var(--primary)",
                  fontSize: "1rem",
                }}
              >
                Individual Family Member Records
              </p>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                lineHeight: 1.8,
              }}
            >
              Detailed family contacts — parents, siblings, guardians — with
              phone, WhatsApp, address, and emergency flags can be added{" "}
              <strong>after saving this profile</strong>. Open the sister's
              profile page and use the <strong>Family</strong> section to build
              her complete family record.
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-panel wiz-body animate-fade-in">
          <div className="grid grid-2">
            <FG label="Educational Background" full>
              <textarea
                {...register("education")}
                rows={4}
                placeholder={`List qualifications:\n• B.Sc. Nursing – University of Nigeria, 2003\n• NCE – Adeyemi College, 2001\n• SSCE – Holy Child College, 1998`}
              />
            </FG>
            <FG label="Professional Certifications & Licences" full>
              <input
                {...register("certifications")}
                placeholder="e.g COREN, ICAN..."
              />
            </FG>
            <FG label="Skills & Professional Competencies" full>
              <textarea
                {...register("skills")}
                rows={3}
                placeholder="e.g. Teaching (Secondary), Paediatric Nursing, Music (Organ), Administration, Counselling..."
              />
            </FG>
            <FG label="Languages Spoken" full>
              <input
                {...register("languages")}
                placeholder="English (Fluent), Igbo (Native), French (Basic)"
              />
            </FG>
            <FG label="Health Notes & Medical Information" full confidential>
              <textarea
                {...register("healthNotes")}
                rows={3}
                placeholder="Allergies, ongoing medications, known conditions, dietary restrictions..."
              />
            </FG>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="glass-panel wiz-body animate-fade-in">
          <div
            className="flex items-center justify-between mb-8"
            style={{
              padding: "1.25rem 1.5rem",
              background: "rgba(var(--primary-rgb), 0.03)",
              borderRadius: "14px",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  color: "var(--accent)",
                  padding: "0.5rem",
                  background: "rgba(249,115,22,0.1)",
                  borderRadius: "10px",
                }}
              >
                <ArrowRightLeft size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: "1.1rem" }}>
                  Record Postings & Obediences
                </h4>
                <p className="text-muted" style={{ fontSize: "0.85rem", margin: "0.2rem 0 0" }}>
                  Record her past and current mission assignments. Click "+ Add Posting" to add past or additional postings.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm ripple"
              style={{
                background: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                borderRadius: "10px",
                fontWeight: 700,
              }}
              onClick={handleAddObedience}
            >
              <Plus size={16} /> Add Posting
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {obediencesList.map((ob, idx) => (
              <div
                key={idx}
                style={{
                  padding: "1.5rem",
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "var(--primary)",
                        background: "rgba(var(--primary-rgb), 0.08)",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "6px",
                      }}
                    >
                      Posting #{idx + 1}
                    </span>
                    <span
                      className={`badge badge-${
                        ob.endDate ? "secondary" : "success"
                      }`}
                      style={{ fontSize: "0.65rem" }}
                    >
                      {ob.endDate ? "Past Posting" : "Active / Current"}
                    </span>
                  </div>
                  {obediencesList.length > 1 && (
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ color: "var(--danger)", width: "32px", height: "32px" }}
                      title="Remove posting entry"
                      onClick={() => handleRemoveObedience(idx)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-2">
                  <FG label="Community / House Obedience" full>
                    <select
                      value={ob.communityName}
                      onChange={(e) =>
                        handleObedienceChange(idx, "communityName", e.target.value)
                      }
                    >
                      <option value="">Select Community House...</option>
                      {communities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FG>
                  <FG label="Role / Designation">
                    <input
                      value={ob.officeHeld}
                      onChange={(e) =>
                        handleObedienceChange(idx, "officeHeld", e.target.value)
                      }
                      placeholder="e.g. Co-ordinator, Bursar, Secretary, Member"
                    />
                  </FG>
                  <FG label="Start Date">
                    <input
                      type="date"
                      value={ob.startDate}
                      onChange={(e) =>
                        handleObedienceChange(idx, "startDate", e.target.value)
                      }
                    />
                  </FG>
                  <FG label="End Date (Optional for past postings)">
                    <input
                      type="date"
                      value={ob.endDate}
                      onChange={(e) =>
                        handleObedienceChange(idx, "endDate", e.target.value)
                      }
                    />
                  </FG>
                  <FG label="Remarks / Notes (Optional)" full>
                    <input
                      value={ob.remarks}
                      onChange={(e) =>
                        handleObedienceChange(idx, "remarks", e.target.value)
                      }
                      placeholder="Additional remarks or notes about this posting..."
                    />
                  </FG>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              justify: "center",
            }}
          >
            <button
              type="button"
              className="btn btn-outline ripple"
              style={{
                background: "white",
                borderColor: "var(--accent)",
                color: "var(--accent)",
                fontWeight: 700,
                padding: "0.8rem 1.75rem",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 14px rgba(249, 115, 22, 0.1)",
              }}
              onClick={handleAddObedience}
            >
              <Plus size={18} /> Add Another Obedience / Posting
            </button>
          </div>
        </div>
      )}

      <div className="wiz-footer">
        <button
          className="btn btn-outline"
          style={{ background: "white" }}
          onClick={step === 0 ? onBack : () => setStep((s) => s - 1)}
        >
          <ArrowLeft size={16} /> {step === 0 ? "Cancel" : "Previous"}
        </button>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {WIZARD_STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? "28px" : "8px",
                height: "8px",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  i < step
                    ? "var(--success)"
                    : i === step
                      ? "var(--accent)"
                      : "var(--border)",
              }}
            />
          ))}
        </div>
        {step < WIZARD_STEPS.length - 1 ? (
          <button className="btn btn-primary ripple" onClick={handleNext}>
            Next Step <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary ripple"
            onClick={rhfSubmit(onSubmit)}
            disabled={saving}
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SisterProfileForm;
