import { useState } from "react";

const teamMembers = [
  {
    name: "Karthikeyan S",
    role: "Team Lead & Developer",
    avatar: "KS",
    dept: "BE-CSE (Cyber Security)",
    batch: "2024–2028 Batch",
  },
  {
    name: "Bala Sundar K",
    role: "UI/UX Designer",
    avatar: "BK",
    dept: "BE-CSE (Cyber Security)",
    batch: "2024–2028 Batch",
  },
  {
    name: "Anusha N",
    role: "Tester",
    avatar: "AN",
    dept: "BE-CSE (Cyber Security)",
    batch: "2024–2028 Batch",
  },
];

const MeetTheTeamFooter = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Static footer at the bottom of the page */}
      <footer className="w-full border-t border-white/15 py-2 px-6 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>
        <button
          onClick={() => setOpen(true)}
          className="meet-team-btn"
        >
          <span className="meet-team-btn-icon">👥</span>
          Meet the Team
          <span className="meet-team-btn-shine"></span>
        </button>
      </footer>

      {/* Overlay + Card */}
      {open && (
        <div className="meet-team-overlay" onClick={() => setOpen(false)}>
          <div className="meet-team-card" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button className="meet-team-close" onClick={() => setOpen(false)}>
              ✕
            </button>

            <h2 className="meet-team-title">Our Team</h2>
            <p className="meet-team-subtitle">The people behind the EMS</p>

            <div className="meet-team-grid">
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="meet-team-member"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="meet-team-avatar">{member.avatar}</div>
                  <h3 className="meet-team-name">{member.name}</h3>
                  <p className="meet-team-role">{member.role}</p>
                  <p className="meet-team-bio">{member.dept}</p>
                  <p className="meet-team-batch">{member.batch}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .meet-team-btn {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 24px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.3px;
          color: #fff;
          background: linear-gradient(135deg, hsl(221, 83%, 53%), hsl(230, 75%, 48%));
          box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 2px 12px hsla(221, 83%, 53%, 0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: all 0.25s ease;
        }
        .meet-team-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15), 0 4px 20px hsla(221, 83%, 53%, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .meet-team-btn:active {
          transform: translateY(0) scale(0.98);
        }
        .meet-team-btn-icon {
          font-size: 14px;
          line-height: 1;
        }
        .meet-team-btn-shine {
          position: absolute;
          top: 0;
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-20deg);
          animation: btnShine 3.5s ease-in-out infinite;
        }
        @keyframes btnShine {
          0%, 100% { left: -75%; }
          50% { left: 125%; }
        }
        .meet-team-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          animation: mttFadeIn 0.25s ease;
        }

        .meet-team-card {
          position: relative;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 16px;
          padding: 36px 32px 32px;
          max-width: 780px;
          width: 92%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6);
          animation: mttSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .meet-team-close {
          position: absolute;
          top: 14px;
          right: 16px;
          background: hsl(210, 40%, 96%);
          border: 1px solid hsl(214, 32%, 91%);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          color: hsl(215, 16%, 47%);
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .meet-team-close:hover {
          background: hsl(210, 40%, 92%);
          color: hsl(215, 25%, 27%);
        }

        .meet-team-title {
          text-align: center;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
          background: linear-gradient(to right, hsl(221.2, 83.2%, 53.3%), hsl(221.2, 70%, 40%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .meet-team-subtitle {
          text-align: center;
          color: hsl(215, 16%, 57%);
          font-size: 13px;
          margin-bottom: 28px;
        }

        .meet-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 640px) {
          .meet-team-grid {
            grid-template-columns: 1fr;
          }
        }

        .meet-team-member {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          padding: 24px 16px;
          text-align: center;
          transition: all 0.25s ease;
          animation: mttSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .meet-team-member:hover {
          border-color: hsla(221.2, 83.2%, 53.3%, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px hsla(221.2, 83.2%, 53.3%, 0.12);
        }

        .meet-team-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%), hsl(221.2, 83.2%, 42%));
          box-shadow: 0 3px 10px hsla(221.2, 83.2%, 53.3%, 0.3);
        }

        .meet-team-name {
          color: hsl(222, 47%, 11%);
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .meet-team-role {
          font-size: 11px;
          font-weight: 600;
          color: hsl(221.2, 83.2%, 53.3%);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .meet-team-bio {
          font-size: 12.5px;
          color: hsl(215, 16%, 47%);
          line-height: 1.55;
          margin: 0;
        }

        .meet-team-batch {
          font-size: 11.5px;
          color: hsl(215, 16%, 55%);
          margin-top: 4px;
          font-weight: 500;
          font-style: italic;
        }

        @keyframes mttFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mttSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default MeetTheTeamFooter;
