export default function TnpMemberAccessView({ Portal, user, tnpRole, profileImageUrl, setView }) {
  return (
    <div style={{ paddingTop: "60px" }}>
      <Portal user={user} tnpRole={tnpRole} profileImageUrl={profileImageUrl} onBack={() => setView("landing")} />
    </div>
  );
}
