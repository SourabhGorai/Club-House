export default function TnpMemberAccessView({ Portal, user, tnpRole, setView }) {
  return (
    <div style={{ paddingTop: "60px" }}>
      <Portal user={user} tnpRole={tnpRole} onBack={() => setView("landing")} />
    </div>
  );
}
