/**
 * ============================================================================
 * THIS IS THE ONLY FILE YOU EDIT TO MAKE THIS SITE YOURS.
 * ============================================================================
 *
 * Everything else in `src/` reads from here, so you should never have to
 * hardcode a name, a job title, or a date into a component.
 *
 * The shape is enforced by `src/content/schema.ts` and checked by
 * `tests/content.test.ts`. Run `npm test` after you edit this file - if you
 * get the shape wrong, the test tells you which field.
 *
 * Never invent content. If something is not in your resume, leave the field
 * out. This is a public page about you.
 *
 * Ordering does not matter. `Timeline` sorts by date, most recent first.
 *
 * ---------------------------------------------------------------------------
 * TODO(simra): four dates are still marked `TODO month` - the start of the BWSI
 * summer weeks, and the three hackathons. The year is right in every case; the
 * month is a placeholder, and the only thing it changes is the order those
 * three first places appear in. Everything else is confirmed.
 * ---------------------------------------------------------------------------
 */
import type { Profile } from './schema.ts';

export const profile: Profile = {
  name: 'Simra Ali',
  // Also the page's meta description - the grey line under the link in a search
  // result, and the preview when someone pastes the URL. See metadata.ts.
  headline: 'Robotics and autonomous systems. Westford Academy ’27.',
  intro:
    "I'm Simra, a high school engineer who likes figuring out how things work—and building things I don't completely know how to build yet. That curiosity has taken me from wiring robots to CAD, autonomous drones, drive-team coaching, and mentoring other students. I love learning by doing, solving problems with other people, and always finding something new to figure out.",
  location: 'Westford, Massachusetts',

  avatar: '/sim.jpg',

  // Simra's own one-page export. Replace the file in `public/` whenever the
  // resume changes - this copy is what the public page serves, and nothing
  // keeps it in step with the original automatically.
  resumeUrl: '/simra-ali-resume.pdf',

  // The page, top to bottom, under the hero. Timeline first: the work is the
  // argument, honors are the corroboration, and contact details are what
  // someone wants *after* they are convinced.
  // See docs/adr/ADR-006-section-order.md.
  sections: ['timeline', 'honors', 'links'],

  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sim-ali' },
    { label: 'GitHub', href: 'https://github.com/Simzali' },
    // The address on your public LinkedIn profile. Swap or remove it if you
    // would rather not have it scraped off a public page.
    { label: 'Email', href: 'mailto:simrazali13@gmail.com' },
  ],

  // Awards with no timeline entry to sit on.
  //
  // An honor that a timeline entry already carries does NOT go here as well -
  // the FIRST Quality Award, the BWSI Honorable Mention and the three first
  // places are highlights on their own entries, and listing them twice is two
  // copies of one fact waiting to disagree. See ADR-011.
  honors: [
    {
      id: 'first-deans-list-semifinalist',
      title: "FIRST Leadership Award (Dean's List) Semi-Finalist",
      organization: 'FIRST',
      year: '2026',
    },
    {
      id: 'westford-academic-high-honors',
      title: 'Academic High Honors',
      organization: 'Westford Academy',
      year: '2024-2026',
    },
    {
      id: 'presidents-award-academic-excellence',
      title: "President's Award for Outstanding Academic Excellence",
    },
    {
      id: 'dei-award',
      title: 'Diversity, Equity and Inclusion Award',
    },
    {
      id: 'toastmasters-youth-leadership',
      title: 'Youth Leadership Award & Medal',
      organization: 'Toastmasters',
    },
    {
      id: 'national-spanish-exam-silver',
      title: 'National Spanish Exam, Silver Medal',
    },
    {
      id: 'honored-citizen',
      title: 'Honored Citizen Award',
    },
  ],

  timeline: [
    // ---------------------------------------------------------------- work
    {
      id: 'stormgears-frc-5422',
      kind: 'work',
      title: 'Co-Captain, Lead CAD & Mechanical Designer',
      organization: 'FIRST Robotics Competition - Stormgears 5422',
      startDate: '2023-09',
      endDate: null,
      location: 'Westford, MA',
      summary:
        'Co-captain of a 45-person team. I design the robot in SolidWorks, coach the drive team from the side of the field, and used to run electrical.',
      highlights: [
        'Design competition-robot mechanisms in SolidWorks - chassis, intake, hopper, shooter - and lay out electrical systems that can actually be serviced between matches.',
        "Taught myself SolidWorks after the team's experienced designer graduated, then helped lead a custom-robot effort that won the FIRST Quality Award for design intent, robustness, and fabrication quality.",
        'Run technical trainings and mentor new members. The student I trained on electrical succeeded me as Electrical Lead.',
        'Competition Technician and Drive Coach - the two jobs where your mistakes happen in front of everyone.',
      ],
      tags: [
        'SolidWorks',
        'CAD',
        'Mechanical Design',
        'Design for Assembly',
        'Electrical',
        'Leadership',
        'FRC',
      ],
      links: [],
    },
    {
      id: 'ghost-robotics-ftc-3565',
      kind: 'work',
      title: 'Vision Software, CAD & Drive Team',
      organization: 'FIRST Tech Challenge - Ghost Robotics 3565',
      startDate: '2023-09',
      endDate: null,
      location: 'Westford, MA',
      summary:
        'A ten-person team, where titles do not help much. I work across Onshape CAD, computer vision, strategy, media, and outreach - deliberately, instead of picking one lane.',
      highlights: [
        '2026 Massachusetts State Champion and Winning Alliance Captain.',
        '2026 FIRST Championship, Ross Division Winner.',
        'Team earned the Control, Inspire, Innovate, and Connect Awards.',
      ],
      tags: ['Computer Vision', 'Onshape', 'CAD', 'Strategy', 'FTC'],
      links: [
        { label: 'Team site', href: 'https://sites.google.com/westfordk12.us/ghostrobotics' },
      ],
    },
    {
      id: 'bwsi-autonomous-air-vehicle-racing',
      kind: 'work',
      title: 'Autonomous Air Vehicle Racing',
      organization: 'MIT Beaver Works Summer Institute, AeroAstro',
      // End confirmed by LinkedIn, which dates BWSI overall Feb 2024 - Aug 2026.
      // The start is derived: four weeks, ending in August, puts it in July.
      startDate: '2026-07', // TODO month
      endDate: '2026-08',
      location: 'Cambridge, MA',
      summary:
        'Four weeks in person at MIT designing, programming, repairing, testing, and racing autonomous drones.',
      highlights: [
        'Studied computer vision, state estimation, control systems, navigation, and flight dynamics, then had to make all of it hold together on a drone moving at speed.',
        'Explored socially aware path planning for autonomous drones, and connected with an MIT PhD researcher working in the field.',
        'Honorable Mention, BWSI "You Belong in STEM" essay contest.',
        'Worked up to it through BWSI online coursework from February 2024: Basics of ASICs, Microelectronics & Hardware Development, Python Core, Version Control and UNIX, and Git/GitHub.',
      ],
      tags: ['Drones', 'Autonomous Systems', 'Computer Vision', 'Control Systems', 'Python'],
      links: [],
    },
    {
      id: 'bae-women-in-technology',
      kind: 'work',
      title: 'Women in Technology Program',
      organization: 'BAE Systems',
      startDate: '2026-01',
      // Confirmed by Simra, 2026-09-07. Her LinkedIn still says "Present" -
      // the program ended in May, so this is the right end date and LinkedIn
      // is the stale one.
      endDate: '2026-05',
      location: 'New Hampshire',
      summary:
        'A semester inside an engineering company, rotating through the disciplines you never see from a classroom.',
      highlights: [
        'Hands-on labs, workshops, tours, and presentations across electrical, microwave/RF, software, mechanical, signal processing, optical, manufacturing, and failure-analysis engineering.',
        'The failure-analysis lab was the one that stuck: an entire discipline built around asking why something broke.',
      ],
      tags: ['RF', 'Signal Processing', 'Hardware', 'Electrical'],
      links: [],
    },
    {
      id: 'westford-broadcasting-club',
      kind: 'work',
      title: 'Manager',
      organization: 'Westford Academy Broadcasting Club',
      startDate: '2023-09',
      endDate: null,
      summary: 'I coordinate club operations and still work the shows.',
      highlights: [
        'Anchor and production crew: teleprompter, sound board, video switching, scripts, and school-wide broadcasts.',
      ],
      tags: ['Broadcast', 'Video', 'Leadership'],
      links: [],
    },
    {
      id: 'women-in-computer-science',
      kind: 'work',
      title: 'Co-Founder & Co-Lead',
      organization: 'Women in Computer Science, Westford Academy',
      startDate: '2024-09',
      endDate: null,
      location: 'Westford, MA',
      summary:
        'A club I co-founded for students who want to try computing without being the only girl in the room.',
      highlights: [
        'Teach Python, support member projects, and run hackathon preparation.',
        'Pass along STEM opportunities - programs, competitions, deadlines - that are easy to miss if nobody tells you they exist.',
      ],
      tags: ['Python', 'Teaching', 'Community', 'Leadership'],
      links: [],
    },
    {
      id: 'stem-outreach-mentorship',
      kind: 'work',
      title: 'STEM Outreach & Mentorship',
      startDate: '2023-09',
      endDate: null,
      summary:
        'Robotics demos, trainings, and workshops for kids who have not decided yet whether this is for them.',
      highlights: [
        'Lead and support Girl Scout STEM Fest, FIRST LEGO League trainings and scrimmages, the Apple Blossom Parade, and school and community demonstrations.',
        'Focus on mentoring girls into technical roles and, the harder half, keeping them there.',
      ],
      tags: ['Outreach', 'Mentorship', 'Robotics', 'Teaching'],
      links: [],
    },
    {
      id: 'harvard-summer-robotics-ai',
      kind: 'work',
      title: 'Robotics, Autonomous Vehicles, Drones & Artificial Intelligence',
      organization: 'Harvard Summer School',
      startDate: '2025-06',
      endDate: '2025-08',
      location: 'Cambridge, MA',
      summary: 'A college course on how autonomous systems perceive, plan, and move. Final grade: A.',
      highlights: [
        'Sensors, motion planning, SLAM, reinforcement learning, autonomous systems, and computer vision.',
        'Co-led "Solve It, Defend It!" and developed Flood Watch, a concept for tracking floods using drone and autonomous-vehicle data.',
      ],
      tags: ['SLAM', 'Reinforcement Learning', 'Autonomous Systems', 'Computer Vision'],
      links: [],
    },

    {
      id: 'girls-who-code',
      kind: 'work',
      title: 'Pathways & Summer Immersion Programs',
      organization: 'Girls Who Code',
      startDate: '2024-06',
      endDate: '2025-07',
      summary: 'Two Girls Who Code programs back to back, plus the club that runs alongside them.',
      highlights: [
        'Pathways Program in 2024, Summer Immersion Program in 2025.',
        'Harvard Girls Who Code Club, 2023 to 2026.',
      ],
      tags: ['Computer Science', 'Community'],
      links: [],
    },
    {
      id: 'kode-with-klossy',
      kind: 'work',
      title: 'Data Science & Web Development Camps',
      organization: 'Kode With Klossy',
      startDate: '2023-07',
      endDate: '2024-08',
      summary: 'Two Kode With Klossy camps: one in data science, one in web development.',
      highlights: [],
      tags: ['Data Science', 'Web Development'],
      links: [],
    },
    {
      id: 'demoulas-cashier',
      kind: 'work',
      title: 'Cashier',
      organization: 'Demoulas Super Markets',
      startDate: '2023-08',
      endDate: '2025-01',
      location: 'Westford, MA',
      summary:
        'A year and a half on a register, running alongside school and two robotics teams.',
      highlights: [],
      tags: ['Customer Service'],
      links: [],
    },

    // ------------------------------------------------------------ projects
    {
      id: 'the-bat',
      kind: 'project',
      title: 'The Bat',
      organization: 'Microsoft NERD GirlHacks',
      startDate: '2025-10', // TODO month
      endDate: '2025-10', // TODO month
      location: 'Cambridge, MA',
      summary:
        'An ultrasonic assistive navigation device for people who are blind or have low vision - it finds the obstacle before you do.',
      highlights: [
        'First place at Microsoft NERD GirlHacks.',
        'Ultrasonic ranging turned into feedback a person can act on, built and demoed inside a hackathon.',
      ],
      tags: ['Ultrasonic', 'Sensors', 'Assistive Tech', 'Hardware'],
      links: [],
    },
    {
      id: 'hireable',
      kind: 'project',
      title: 'HireAble',
      organization: 'NetScout Tech for Good',
      startDate: '2025-04', // TODO month
      endDate: '2025-04', // TODO month
      summary:
        'A platform connecting people with disabilities to employers who are actually set up to hire them.',
      highlights: ['First place at NetScout Tech for Good.'],
      tags: ['Web', 'Accessibility', 'Social Impact'],
      links: [],
    },
    {
      id: 'vtxcads-cadathon',
      kind: 'project',
      title: 'VTXCADs CADathon',
      organization: 'Phillips Exeter Academy Robotics',
      startDate: '2025-03', // TODO month
      endDate: '2025-03', // TODO month
      summary:
        'A CAD design competition, and the clearest test I have had of the SolidWorks I taught myself.',
      highlights: ['First place.'],
      tags: ['Competition', 'SolidWorks', 'CAD'],
      links: [],
    },
  ],
};
