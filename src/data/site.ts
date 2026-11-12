/**
 * All site copy lives here.
 *
 * DRAFT CONTENT: project write-ups were drafted from each company's public website (Nov 2026).
 * Figures marked "self-reported" are the company's own marketing numbers. Review every line
 * before publishing — especially role descriptions, which describe the role, not personal results.
 */

export interface Project {
  slug: string;
  name: string;
  /** Optional short label for tight spaces (mobile tabs). */
  shortName?: string;
  /** Short line under the title on the stage. */
  tagline: string;
  role: string;
  status: 'Now' | 'Previously';
  tags: string[];
  url: string;
  urlLabel: string;
  /** White-on-transparent logo mask the particle exhibit is sampled from (public/scene/logos). */
  logo: string;
  /** Accent (brand colour) used for particles, highlights and the case-study page. */
  accent: string;
  overview: string;
  role_detail: string;
  facts: { label: string; value: string; note?: string }[];
  sections: { heading: string; body?: string; items?: string[] }[];
}

export const profile = {
  name: 'Dusan Trajkovic',
  title: 'AI-Assisted Engineer & BD',
  headline: 'Engineering with AI, and the customers and deals around it.',
  /** Shown as tags on the About page. */
  roles: ['AI-assisted engineer', 'Support & customer success', 'BD & sales', 'Founder'],
  email: 'trajkodulic@gmail.com',
  telegram: { handle: '@dusanio', url: 'https://t.me/dusanio' },
  // Shown in the HUD clock. Confirm city and time zone.
  location: { label: 'Based in Belgrade', timeZone: 'Europe/Belgrade' },
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
    status: 'Now',
    tags: ['Founder', 'CRM', 'AI'],
    url: 'https://telebux.xyz',
    urlLabel: 'telebux.xyz',
    logo: 'telebux.png',
    accent: '#3ad6a6',
    overview:
      'Telebux is a CRM and business workspace for people and teams who sell through Telegram, Slack and email. Instead of a bot, it connects your own accounts, so deals that start in a chat never have to be copied into a CRM by hand.',
    role_detail:
      'I founded Telebux and build it end to end: product direction, the interface, and getting it in front of the founders, BD teams, agencies and web3 teams it is made for.',
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
    role: 'BD, Sales & Customer Success',
    status: 'Previously',
    tags: ['BD & Sales', 'Web3', 'Solana'],
    url: 'https://streamflow.finance',
    urlLabel: 'streamflow.finance',
    logo: 'streamflow.png',
    accent: '#5b7bff',
    overview:
      'Streamflow is a token distribution platform on Solana. It automates vesting, token locks, airdrops, staking and payouts through on-chain contracts, with no-code tools for teams and an SDK for developers.',
    role_detail:
      'I worked in business development and sales until August 2026, bringing Solana teams onto Streamflow for their vesting, airdrop and distribution needs.',
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
    role: 'UI Developer',
    status: 'Previously',
    tags: ['UI Development', 'Advisory', 'Web3'],
    url: 'https://mca.digital',
    urlLabel: 'mca.digital',
    logo: 'mca.png',
    accent: '#4fcbe6',
    overview:
      'MultiChain Advisors (MCA) advises emerging technology companies on growth, financial strategy, AI transformation and capital markets.',
    role_detail:
      'I worked as a UI developer, building the interfaces and web presence behind the firm’s advisory work.',
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
    'I’m an AI-assisted engineer working across technical support, customer success, business development and sales. I build software with AI in the loop, backed by 4+ years of shipping web applications with React, Astro and Tailwind CSS.',
    'Right now I’m building Telebux, a CRM for teams that sell through messengers. Until August 2026 I worked in business development and sales at Streamflow, and before that as a UI developer at MultiChain Advisors.',
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
