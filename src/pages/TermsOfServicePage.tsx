import { LegalDocumentPage } from '../components/legal/LegalDocumentPage';
import { TERMS_LAST_UPDATED, TERMS_SECTIONS } from '../lib/termsContent';

export function TermsOfServicePage() {
  return (
    <LegalDocumentPage
      title="Terms and Conditions"
      lastUpdated={TERMS_LAST_UPDATED}
      sections={TERMS_SECTIONS}
    />
  );
}
