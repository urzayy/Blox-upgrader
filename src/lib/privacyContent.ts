export const PRIVACY_LAST_UPDATED = 'August 2, 2026';

export interface PrivacySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: '1. Introduction',
    paragraphs: [
      'This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website and services.',
      'By accessing or using the platform, you agree to the collection and use of information in accordance with this Privacy Policy.',
    ],
  },
  {
    title: '2. Information We Collect',
    paragraphs: ['We may collect the following information:'],
    bullets: [
      'Email address',
      'Username',
      'Roblox User ID',
      'Discord User ID (if connected)',
      'IP address',
      'Browser and device information',
      'Cookies and similar technologies',
      'Login history',
      'Deposit and withdrawal history',
      'Transaction history',
      'Any information voluntarily provided through support requests or contact forms',
    ],
  },
  {
    title: '3. How We Use Your Information',
    paragraphs: ['We use your information to:'],
    bullets: [
      'Provide and maintain the platform.',
      'Process deposits, withdrawals, and transactions.',
      'Verify account ownership and prevent fraud.',
      'Detect bugs, exploits, and unauthorized activity.',
      'Improve website performance and user experience.',
      'Respond to support requests.',
      'Enforce our Terms and Conditions.',
      'Comply with applicable legal obligations.',
    ],
  },
  {
    title: '4. Cookies',
    paragraphs: ['We use cookies and similar technologies to:'],
    bullets: [
      'Keep users logged in.',
      'Remember user preferences.',
      'Analyze website traffic.',
      'Improve website functionality.',
      'Detect suspicious activity.',
    ],
    closingParagraphs: [
      'You may disable cookies through your browser settings; however, some features of the website may no longer function properly.',
    ],
  },
  {
    title: '5. Fraud Prevention',
    paragraphs: [
      'To protect the integrity of the platform, we may collect and analyze technical information, including IP addresses, browser fingerprints, device identifiers, and account activity.',
      'If suspicious behavior, bug abuse, exploits, or fraudulent activity is detected, administrators may investigate and take action as described in our Terms and Conditions.',
    ],
  },
  {
    title: '6. Information Sharing',
    paragraphs: [
      'We may share information with trusted third-party providers that assist in operating our platform, including:',
    ],
    bullets: [
      'Cloud hosting providers',
      'Security and anti-fraud services',
      'Analytics providers',
      'Email service providers',
      'Customer support platforms',
    ],
    closingParagraphs: [
      'These providers may only process personal information as necessary to perform services on our behalf.',
      'We may also disclose information when required by law or to protect the rights, safety, or security of the platform, our users, or others.',
    ],
  },
  {
    title: '7. Data Security',
    paragraphs: [
      'We implement reasonable administrative, technical, and organizational measures to protect your information from unauthorized access, alteration, disclosure, or destruction.',
      'However, no internet transmission or electronic storage system can be guaranteed to be completely secure.',
    ],
  },
  {
    title: '8. Data Retention',
    paragraphs: ['We retain personal information only for as long as necessary to:'],
    bullets: [
      'Operate the platform.',
      'Resolve disputes.',
      'Prevent fraud.',
      'Enforce our Terms.',
      'Comply with legal obligations.',
    ],
    closingParagraphs: [
      'When information is no longer required, it will be securely deleted or anonymized where appropriate.',
    ],
  },
  {
    title: '9. Your Rights',
    paragraphs: ['Depending on your location and applicable law, you may have the right to:'],
    bullets: [
      'Access your personal information.',
      'Request correction of inaccurate information.',
      'Request deletion of your personal information.',
      'Object to certain processing activities.',
      'Request a copy of your personal information.',
      'Withdraw consent where consent is the legal basis for processing.',
    ],
    closingParagraphs: ['Requests may be submitted by contacting us through the platform.'],
  },
  {
    title: '10. Children\'s Privacy',
    paragraphs: [
      'Our services are not intended for individuals who are prohibited from using them under applicable law.',
      'If we become aware that personal information has been collected unlawfully, we reserve the right to remove such information and suspend or terminate the associated account.',
    ],
  },
  {
    title: '11. International Data Transfers',
    paragraphs: [
      'Your information may be processed and stored in countries other than your own.',
      'By using the platform, you acknowledge that your information may be transferred to jurisdictions with different data protection laws.',
    ],
  },
  {
    title: '12. Changes to This Privacy Policy',
    paragraphs: [
      'We reserve the right to update this Privacy Policy at any time.',
      'Changes become effective immediately upon publication on the website.',
      'Continued use of the platform after changes are published constitutes acceptance of the updated Privacy Policy.',
    ],
  },
  {
    title: '13. Contact',
    paragraphs: [
      'If you have any questions regarding this Privacy Policy, you may contact us through the support section of the website.',
    ],
  },
  {
    title: '14. No Affiliation with Roblox',
    paragraphs: [
      'This website is an independent platform and is not affiliated with, endorsed by, sponsored by, or associated with Roblox Corporation.',
      '"Roblox" and "Robux" are trademarks of Roblox Corporation. All trademarks belong to their respective owners.',
    ],
  },
];
