export const TERMS_LAST_UPDATED = 'August 2, 2026';

export interface TermsSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closingParagraphs?: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. Acceptance of Terms',
    paragraphs: [
      'By accessing and using this website, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these Terms, you must immediately stop using the website.',
    ],
  },
  {
    title: '2. Service Description',
    paragraphs: [
      'This platform allows users to participate in games using virtual items ("skins"), Robux, or other supported virtual assets, depending on the features available on the website.',
      'Users acknowledge that all items used on the platform are virtual goods and have no guaranteed real-world monetary value.',
    ],
  },
  {
    title: '3. Eligibility',
    paragraphs: ['By using this platform, you represent and warrant that:'],
    bullets: [
      'You own a valid Roblox account.',
      'You have the legal right to use any skins, items, or Robux you deposit.',
      'You will not use stolen, compromised, or unauthorized accounts.',
      'You will comply with all platform rules and these Terms.',
    ],
  },
  {
    title: '4. Deposits and Withdrawals',
    paragraphs: [
      'Deposits of skins, virtual items, or Robux are made voluntarily.',
      'Once a deposit has been successfully processed, it may not be reversible.',
      'Withdrawals may be subject to security checks and verification procedures to prevent fraud or abuse.',
    ],
  },
  {
    title: '5. Prohibited Conduct',
    paragraphs: ['Users are strictly prohibited from:'],
    bullets: [
      'Exploiting bugs, glitches, or vulnerabilities in the website.',
      'Manipulating or attempting to manipulate the platform or its systems.',
      'Using bots, scripts, macros, or automated software.',
      'Accessing or attempting to access another user\'s account without authorization.',
      'Duplicating items or engaging in fraudulent activities.',
      'Abusing promotions, rewards, or bonuses.',
      'Interfering with the fairness or operation of the platform.',
    ],
  },
  {
    title: '6. Administrative Actions',
    paragraphs: [
      'The website administrators and moderators reserve the right, at their sole discretion and without prior notice, to:',
    ],
    bullets: [
      'Temporarily suspend any account.',
      'Permanently ban any user.',
      'Remove, confiscate, or withhold skins, items, Robux, balances, or other virtual assets held on the platform.',
      'Void bets, trades, rewards, or transactions obtained through the exploitation of bugs, glitches, vulnerabilities, or any fraudulent activity.',
      'Reset account balances or inventories when there is evidence or reasonable suspicion of abuse or exploitation.',
    ],
    closingParagraphs: [
      'These actions may be taken to protect the integrity, security, and fairness of the platform.',
    ],
  },
  {
    title: '7. Investigations',
    paragraphs: [
      'The platform reserves the right to investigate any activity deemed suspicious.',
      'If there is reasonable evidence or suspicion of fraud, bug abuse, exploit usage, automation, or any behavior that may compromise the platform, administrators may temporarily restrict account access while the investigation is ongoing.',
    ],
  },
  {
    title: '8. Service Availability',
    paragraphs: [
      'The platform is provided on an "as available" basis.',
      'We do not guarantee uninterrupted availability and reserve the right to perform maintenance, updates, or temporary shutdowns at any time without prior notice.',
    ],
  },
  {
    title: '9. Limitation of Liability',
    paragraphs: ['The platform shall not be liable for:'],
    bullets: [
      'Service interruptions.',
      'Third-party system failures.',
      'Loss of access to Roblox accounts.',
      'Technical issues outside our control.',
      'Any loss resulting from the use of the website.',
    ],
    closingParagraphs: ['Users assume full responsibility for using the platform.'],
  },
  {
    title: '10. Changes to These Terms',
    paragraphs: [
      'We reserve the right to modify these Terms and Conditions at any time.',
      'Any changes become effective immediately upon publication on the website.',
      'Continued use of the platform after changes have been published constitutes acceptance of the revised Terms.',
    ],
  },
  {
    title: '11. Account Termination',
    paragraphs: [
      'We reserve the right to suspend or permanently terminate any account that violates these Terms or engages in activities considered harmful to the platform.',
      'Termination may result in the loss of access to virtual items, balances, or other assets associated with the account, particularly where fraud, abuse, or violations of these Terms are involved.',
    ],
  },
  {
    title: '12. No Affiliation with Roblox',
    paragraphs: [
      'This website is an independent platform and is not affiliated with, endorsed by, sponsored by, or associated with Roblox Corporation.',
      '"Roblox" and "Robux" are trademarks of Roblox Corporation. All trademarks, logos, and copyrights belong to their respective owners.',
    ],
  },
  {
    title: '13. Acceptance',
    paragraphs: [
      'By accessing or using this website, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.',
    ],
  },
];
