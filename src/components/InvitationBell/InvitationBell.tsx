import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collaboratorService } from "../../services/collaboratorService";

type Invitation = { id: string; role: string; tet_config_id: string };
type InvitationResponse = { data: Invitation[] };

const InvitationBell = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response =
          (await collaboratorService.getMyInvitations()) as InvitationResponse;
        setInvitations(response.data || []);
      } catch (error) {
        console.error("Failed to fetch invitations", error);
      }
    };
    fetchInvitations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccept = async (invitation: Invitation) => {
    try {
      await collaboratorService.acceptInvitation(invitation.id);
      setInvitations((prev) =>
        prev.filter((inv) => inv.id !== invitation.id),
      );
      setIsOpen(false);
      navigate(`/task?config=${invitation.tet_config_id}`);
    } catch (error) {
      console.error("Failed to accept invitation", error);
    }
  };

  const handleDecline = async (id: string) => {
    if (!window.confirm("Bạn muốn từ chối lời mời này?")) return;
    try {
      await collaboratorService.declineInvitation(id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to decline invitation", error);
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all bg-accent hover:bg-primary/20 text-text-main"
        title="Invitations"
        style={{ position: "relative" }}
      >
        🔔
        {invitations.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              backgroundColor: "#dc2626",
              color: "white",
              fontSize: "10px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
            }}
          >
            {invitations.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "320px",
            backgroundColor: "white",
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f3f4f6",
              fontWeight: 600,
              color: "#374151",
              fontSize: "14px",
            }}
          >
            Thông báo mời cộng tác
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {invitations.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Không có lời mời nào.
              </div>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    backgroundColor: "#fffbeb",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "13px",
                      color: "#374151",
                      lineHeight: "1.4",
                    }}
                  >
                    Someone invites you to be an{" "}
                    <strong>{inv.role}</strong> for a Tet plan!
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleAccept(inv)}
                      style={{
                        flex: 1,
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        padding: "6px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleDecline(inv.id)}
                      style={{
                        flex: 1,
                        backgroundColor: "white",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        padding: "6px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationBell;
