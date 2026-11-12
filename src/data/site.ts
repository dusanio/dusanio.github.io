/**
 * All site copy lives here. Roles and dates follow the CV (public/cv).
 * Company descriptions come from each company's public website; figures marked
 * "self-reported" are the company's own marketing numbers.
 */

export interface Project {
  slug: string;
  name: string;
  /** Optional short label for tight spaces (mobile tabs). */
  shortName?: string;
  /** Short line under the title on the stage. */
  tagline: string;
  /** Short role label for chips (home stage, About timeline). */
  role: string;
  /** Overall time with the company, e.g. "Aug 2026 – Present". */
  period: string;
  status: 'Now' | 'Previously';
  tags: string[];
  url: string;
  urlLabel: string;
  /** White-on-transparent logo mask the particle exhibit is sampled from (public/scene/logos). */
  logo: string;
  /** Accent (brand colour) used for particles, highlights and the case-study page. */
  accent: string;
  overview: string;
  /** Positions held at the company, newest first (from the CV). */
  positions: { title: string; period: string; items: string[] }[];
  facts: { label: string; value: string; note?: string }[];
  sections: { heading: string; body?: string; items?: string[] }[];
}

export const profile = {
  name: 'Dushan Trajkovic',
  title: 'AI-Assisted Engineer · Technical Customer Success & Business Development',
  /** Two short lines for the sidebar, where the full title doesn't fit. */
  titleShort: ['AI-Assisted Engineer', 'Customer Success & BD'],
  headline: 'Engineering with AI, and the customers and deals around it.',
  /** Shown as tags on the About page. */
  roles: ['AI-assisted engineer', 'Technical customer success', 'Business development', 'Founder, Telebux'],
  email: 'trajkodulic@gmail.com',
  /** CV served from public/cv. Replace the file (same name) to update it. */
  cv: { href: '/cv/Dushan_Trajkovic_CV.pdf', fileName: 'Dushan_Trajkovic_CV.pdf', updated: 'Nov 2026' },
  telegram: { handle: '@dusanio', url: 'https://t.me/dusanio' },
  // Shown in the HUD clock. Confirm city and time zone.
  location: { label: 'Based in Belgrade', timeZone: 'Europe/Belgrade' },
  community: [{ name: 'Superteam Balkan', role: 'Member' }],
  socials: [
    { label: 'GitHub', href: 'https://github.com/dusanio' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/dusanio' },
    { label: 'X', href: 'https://x.com/thedusanio' },
    { label: 'Telegram', href: 'https://t.me/dusanio' },
  ],
};

export const projects: Project[] = [
  {
    slug: 'telebux',
    name: 'Telebux',
    tagline: 'The agentic sales layer for teams that sell through messengers.',
    role: 'Founder',
    period: 'Aug 2026 – Present',
    status: 'Now',
    tags: ['Founder', 'CRM', 'AI'],
    url: 'https://telebux.xyz',
    urlLabel: 'telebux.xyz',
    logo: 'telebux.png',
    accent: '#3ad6a6',
    overview:
      'Telebux is a CRM and business workspace for people and teams who sell through Telegram, Slack and email. Instead of a bot, it connects your own accounts, so deals that start in a chat never have to be copied into a CRM by hand.',
    positions: [
      {
        title: 'Founder',
        period: 'Aug 2026 – Present',
        items: [
          'Building Telebux, a sales layer for web3 teams that run leads through Telegram, Slack and email, with a CRM built in rather than a CRM alone.',
          'Shipping product end to end.',
          'Running outbound and customer discovery directly, and sharing progress publicly through daily build-in-public updates on X.',
          'Supported by Superteam Balkan; featured in a SaaS Browser case study.',
        ],
      },
    ],
    facts: [
      { label: 'Channels', value: 'Telegram · Slack · Email' },
      { label: 'AI', value: 'Claude, bring-your-own-key' },
      { label: 'Trial', value: '7 days, no card' },
      { label: 'Billing', value: 'Card, SOL or USDC' },
    ],
    sections: [
      {
        heading: 'The problem',
        body:
          'For founders and BD teams, the pipeline lives in DMs and group chats. CRMs built around email and forms miss most of it, so deals go stale and context gets lost between people.',
      },
      {
        heading: 'What it does',
        items: [
          'AI assistant that finds and updates CRM records, running on your own Anthropic key.',
          'Claude over MCP, so Claude Desktop or Claude Code can read, or read and write, your workspace.',
          'A private daily digest of deals that moved, important chats and next steps, built on your device.',
          'Radar: scans new Telegram messages, flags the ones that matter and notifies you about urgent ones.',
          'A full CRM: contacts, organizations, deals, tasks, multiple pipelines, calendar, analytics and Cmd+K search.',
          'Campaigns over email or Telegram with merge fields, scheduling and per-recipient delivery tracking.',
          'Isolated workspaces per business, each with its own team and billing.',
        ],
      },
      {
        heading: 'Integrations',
        body:
          'Telegram, Slack and Gmail for conversations; Google Calendar and Meet; Notion; Zapier; Claude; and Solana payments via Helio.',
      },
    ],
  },
  {
    slug: 'streamflow',
    name: 'Streamflow',
    tagline: 'Token vesting, locks, airdrops and payouts on Solana.',
    role: 'BD & Customer Success · Web Developer',
    period: 'Mar 2022 – Aug 2026',
    status: 'Previously',
    tags: ['BD & Customer Success', 'Web Development', 'Solana'],
    url: 'https://streamflow.finance',
    urlLabel: 'streamflow.finance',
    logo: 'streamflow.png',
    accent: '#5b7bff',
    overview:
      'Streamflow is a token distribution platform on Solana. It automates vesting, token locks, airdrops, staking and payouts through on-chain contracts, with no-code tools for teams and an SDK for developers.',
    positions: [
      {
        title: 'Business Development / Customer Success',
        period: 'Mar 2025 – Aug 2026',
        items: [
          'Managed customer success and business development for Web3 clients, including sales calls, partnership discussions and customer onboarding.',
          'Led product demos, technical support and onboarding calls to help clients successfully adopt Streamflow products.',
          'Provided customer and technical support: helped users navigate the platform, resolved their issues, and escalated bugs to the engineering team for fixes.',
          'Worked closely with Product and Engineering to translate customer feedback into platform improvements and feature enhancements.',
        ],
      },
      {
        title: 'Intern / Junior Web Developer',
        period: 'Mar 2022 – Sep 2023',
        items: [
          'Coded the design for ~30 landing pages in the Astro framework and boosted the company’s SEO ranking.',
          'Took part in design discussions for landing pages.',
        ],
      },
    ],
    facts: [
      { label: 'TVL', value: '$365M+', note: 'self-reported' },
      { label: 'Users', value: '1.3M+', note: 'self-reported' },
      { label: 'Projects', value: '40K+', note: 'self-reported' },
      { label: 'Audits', value: 'FYEO · OPCODES' },
    ],
    sections: [
      {
        heading: 'What it replaces',
        body:
          'Spreadsheets and manual transfers. Distribution runs on schedules enforced on-chain, with records anyone can verify, from a handful of recipients to community-wide drops.',
      },
      {
        heading: 'Products',
        items: [
          'Vesting: batch schedules for teams and investors, with automatic transfers on unlock.',
          'Token locks, vested and non-vested airdrops, and staking as a service.',
          'Payouts, recurring transfers and escrow.',
          'Token tooling: mint, dashboard, airdrop and sybil checkers, dust collector.',
          'White-label staking, claim and lock portals.',
          'An SDK for custom dApps: subscriptions, milestone-based donations and more.',
        ],
      },
      {
        heading: 'In the ecosystem',
        body:
          'Listed in the official Solana documentation for token vesting. Public case studies include Heavenland, BONK and UXD.',
      },
    ],
  },
  {
    slug: 'multichain-advisors',
    name: 'MultiChain Advisors',
    shortName: 'MCA',
    tagline: 'Growth, CFO and M&A advisory for emerging tech.',
    role: 'Junior Web Developer (Freelance)',
    period: 'Aug 2022 – Dec 2023',
    status: 'Previously',
    tags: ['Web Development', 'Freelance', 'Advisory'],
    url: 'https://mca.digital',
    urlLabel: 'mca.digital',
    logo: 'mca.png',
    accent: '#4fcbe6',
    overview:
      'MultiChain Advisors (MCA) advises emerging technology companies on growth, financial strategy, AI transformation and capital markets.',
    positions: [
      {
        title: 'Junior Web Developer (Freelance)',
        period: 'Aug 2022 – Dec 2023',
        items: ['Built landing pages for the company.'],
      },
    ],
    facts: [
      { label: 'Focus', value: 'Growth · CFO · M&A' },
      { label: 'Clients', value: 'Emerging tech' },
    ],
    sections: [
      {
        heading: 'The firm',
        body:
          'MCA works with emerging technology companies on growth strategy, CFO-level advisory and M&A, with a focus on financial strategy, AI transformation and capital markets.',
      },
    ],
  },
];

export const about = {
  intro: [
    'I’m an AI-assisted engineer working across technical customer success and business development. I build software with AI in the loop, on a frontend background in React, Astro and Tailwind CSS.',
    'Since August 2026 I’ve been building Telebux, a sales layer for web3 teams with a CRM built in, supported by Superteam Balkan. At Streamflow Finance I started as an intern and junior web developer (2022–2023), then came back to run customer success and business development for Web3 clients (2025–2026). Alongside my first stint, I built landing pages for MultiChain Advisors as a freelancer.',
    'Working across the product, the customer and the deal means I build for the people who use it, support them once they do, and can talk to the people who buy it.',
  ],
  disciplines: [
    {
      title: 'AI-assisted engineering',
      body: 'Shipping software with AI as part of the workflow, from React and Astro interfaces to integrations and tooling, without letting quality, accessibility or performance slip.',
    },
    {
      title: 'Technical support & customer success',
      body: 'Getting customers set up and keeping them successful: troubleshooting, onboarding, and turning what they run into back into product improvements.',
    },
    {
      title: 'Business development & sales',
      body: 'Partnerships and sales in web3, translating product into value for the teams that adopt it.',
    },
    {
      title: 'Product building',
      body: 'Taking a product from idea to paying users as a founder: scope, interface, onboarding and iteration.',
    },
  ],
  // Confirm this list reflects what you use.
  toolkit: ['React', 'Astro', 'TypeScript', 'Tailwind CSS', 'Three.js / WebGL', 'Figma', 'Solana'],
};
