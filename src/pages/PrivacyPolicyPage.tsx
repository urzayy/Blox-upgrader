import { LegalDocumentPage } from '../components/legal/LegalDocumentPage';
import { PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from '../lib/privacyContent';

export function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      lastUpdated={PRIVACY_LAST_UPDATED}
      sections={PRIVACY_SECTIONS}
    />
  );
}
