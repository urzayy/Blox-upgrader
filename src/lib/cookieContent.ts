export const COOKIE_POLICY_LAST_UPDATED = 'August 2, 2026';

export interface CookiePolicySubsection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
}

export interface CookiePolicySection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
  subsections?: CookiePolicySubsection[];
}

export const COOKIE_POLICY_SECTIONS: CookiePolicySection[] = [
  {
    title: '1. Introduction',
    paragraphs: [
      'This Cookie Policy explains how our website uses cookies and similar technologies when you visit or use our services.',
      'By continuing to use the website, you acknowledge that cookies may be used as described in this Policy.',
    ],
  },
  {
    title: '2. What Are Cookies?',
    paragraphs: [
      'Cookies are small text files stored on your device by your web browser. They help websites remember information about your visit, improve functionality, enhance security, and provide a better user experience.',
    ],
  },
  {
    title: '3. Types of Cookies We Use',
    subsections: [
      {
        title: 'Essential Cookies',
        paragraphs: ['These cookies are necessary for the website to function properly. They may be used to:'],
        bullets: [
          'Keep you logged into your account.',
          'Maintain secure sessions.',
          'Protect against unauthorized access.',
          'Process requests and transactions.',
          'Prevent fraudulent activity.',
        ],
        closingParagraphs: [
          'These cookies cannot be disabled without affecting the operation of the website.',
        ],
      },
      {
        title: 'Preference Cookies',
        paragraphs: ['These cookies remember your settings and preferences, including:'],
        bullets: [
          'Language selection.',
          'Theme preferences (such as light or dark mode).',
          'User interface preferences.',
        ],
      },
      {
        title: 'Analytics Cookies',
        paragraphs: [
          'Analytics cookies help us understand how visitors use the website by collecting anonymous usage information, including:',
        ],
        bullets: [
          'Pages visited.',
          'Time spent on the website.',
          'Browser type.',
          'Device type.',
          'General geographic region.',
          'Website performance.',
        ],
        closingParagraphs: ['This information helps us improve our services.'],
      },
      {
        title: 'Security Cookies',
        paragraphs: ['Security cookies help detect:'],
        bullets: [
          'Suspicious login attempts.',
          'Abuse of the platform.',
          'Bots and automated traffic.',
          'Fraudulent or malicious activity.',
        ],
      },
    ],
  },
  {
    title: '4. Third-Party Cookies',
    paragraphs: [
      'Some cookies may be placed by third-party services integrated into the website, including but not limited to:',
    ],
    bullets: [
      'Analytics providers.',
      'Cloud hosting services.',
      'Security and anti-fraud providers.',
      'Authentication providers.',
      'Content delivery services.',
    ],
    closingParagraphs: [
      'These third parties may collect information in accordance with their own privacy policies.',
    ],
  },
  {
    title: '5. Cookie Duration',
    paragraphs: ['Cookies may be:'],
    subsections: [
      {
        title: 'Session Cookies',
        paragraphs: ['These are automatically deleted when you close your browser.'],
      },
      {
        title: 'Persistent Cookies',
        paragraphs: ['These remain on your device for a limited period or until manually deleted.'],
      },
    ],
  },
  {
    title: '6. Managing Cookies',
    paragraphs: ['Most web browsers allow you to:'],
    bullets: [
      'View stored cookies.',
      'Delete cookies.',
      'Block cookies.',
      'Receive notifications before cookies are stored.',
    ],
    closingParagraphs: [
      'Please note that disabling essential cookies may prevent certain features of the website from functioning correctly.',
    ],
  },
  {
    title: '7. Changes to This Cookie Policy',
    paragraphs: [
      'We reserve the right to update this Cookie Policy at any time.',
      'Changes become effective immediately upon publication on the website.',
      'Your continued use of the website constitutes acceptance of any updated version of this Policy.',
    ],
  },
  {
    title: '8. Contact',
    paragraphs: [
      'If you have any questions regarding this Cookie Policy, please contact us through the support section of the website.',
    ],
  },
];
