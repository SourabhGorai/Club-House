export default function TnpPublicAccessView({
  Hero,
  CompaniesSection,
  PlacementsSection,
  SessionCompanyInsightsSection,
  TeamSection,
  Footer,
  user,
  tnpRole,
  landingStats,
  globalRole,
  setView,
}) {
  return (
    <main style={{ paddingTop: "60px" }}>
      <Hero
        user={user}
        tnpRole={tnpRole}
        stats={landingStats}
        onEnterPortal={() => setView("portal")}
      />
      <CompaniesSection />
      <PlacementsSection />
      <SessionCompanyInsightsSection />
      <TeamSection globalRole={globalRole} tnpRole={tnpRole} onEnterPortal={() => setView("portal")} />
      <Footer />
    </main>
  );
}
