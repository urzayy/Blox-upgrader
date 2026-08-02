import { LegalDocumentPage } from '../components/legal/LegalDocumentPage';
import { COOKIE_POLICY_LAST_UPDATED, COOKIE_POLICY_SECTIONS } from '../lib/cookieContent';

export function CookiePolicyPage() {
  return (
    <LegalDocumentPage
      title="Cookie Policy"
      lastUpdated={COOKIE_POLICY_LAST_UPDATED}
      sections={COOKIE_POLICY_SECTIONS}
    />
  );
}
