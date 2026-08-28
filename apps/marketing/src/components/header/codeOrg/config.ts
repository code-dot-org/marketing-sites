import {HeaderContent, PromoBackground} from './types';

export const HEADER_HEIGHT = 50; // px

// Two-stage collapse: below this width the secondary menu moves into the
// hamburger; below the theme's md breakpoint (900) the main menu follows.
export const HAMBURGER_BREAKPOINT = 1000; // px

export const PROMO_BACKGROUNDS: Record<PromoBackground, string> = {
  lightPurple: 'var(--codeai-purple-light, #e4e2f8)',
  lightBlue: 'var(--codeai-blue-light, #d5efff)',
  lightGreen: 'var(--codeai-green-light, #ccf1d0)',
  lightOrange: 'var(--codeai-orange-light, #ffe3ce)',
  lightPink: 'var(--codeai-pink-light, #fbdae8)',
};

// Fallback nav, rendered when the `siteHeader` Contentful entry is
// unavailable. A full mirror of the authored siteHeader: every link, image,
// subtitle and promo banner, so a cold render is visually identical to the
// live header. Image URLs point at contentful-images.code.org, a separate
// service from the CDA -- if it is also unreachable, SubmenuColumn guards on
// `imageUrl` and the rows degrade to text.
// Generated from the live entry; regenerate rather than hand-editing.
export const DEFAULT_HEADER_CONTENT: HeaderContent = {
  mainMenu: [
    {
      label: 'Teachers',
      href: '/teachers',
      submenu: {
        subtitle: 'Inspire your students’ futures with digital fluency.',
        columns: [
          {
            heading: 'Teach with CodeAI',
            type: 'Text List',
            items: [
              {title: 'Start Teaching', href: '/teachers'},
              {title: 'AI Curriculum', href: '/artificial-intelligence'},
              {title: 'Professional Learning', href: '/professional-learning'},
              {
                title: 'Teacher Community Forum',
                href: 'https://forum.code.org/',
              },
              {
                title: 'Access Your Dashboard',
                href: 'https://studio.code.org/teacher_dashboard/home',
                iconName: 'smile',
              },
            ],
          },
          {
            heading: 'Curriculum & Tools',
            type: 'Text List',
            items: [
              {title: 'All Courses', href: '/curriculum', iconName: 'books'},
              {title: 'CodeAI Platform', href: '/teachers#platform'},
              {
                title: 'AI Teaching Assistant',
                href: '/artificial-intelligence/teaching-assistant',
              },
              {title: 'AI Tutor', href: '/tools/ai-tutor'},
              {title: 'CodeAI Labs', href: '/tools'},
              {title: 'Hour of AI', href: '/hour-of-ai'},
            ],
          },
          {
            heading: 'Featured Courses',
            type: 'Image List Horizontal',
            items: [
              {
                title: 'AI Foundations',
                href: '/curriculum/artificial-intelligence-foundations',
                subtitle:
                  'A complete high school curriculum — students go from understanding how AI works to building web apps with AI as a creative partner.',
                imageUrl:
                  'https://contentful-images.code.org/90t6bu6vlf76/7sk6h3AXtYHxYYIh2X5Xtd/cff59adc7ba908b3a61742173e247931/aif-sem-500.jpg?fm=avif',
              },
              {
                title: 'AI Discoveries',
                href: '/curriculum/artificial-intelligence-discoveries',
                subtitle:
                  'A flexible middle school course built so every student leaves knowing not just how to use AI, but how to think about it too.',
                imageUrl:
                  'https://contentful-images.code.org/90t6bu6vlf76/4Sgw1g40mXHKb1fvgjpd2F/e61272e33288fb7e13f58a6ecf932948/aid-sem-500.jpg?fm=avif',
              },
            ],
          },
        ],
        promo: {
          background: 'lightBlue',
          content: {
            title: 'Explore Hour of AI activities',
            href: 'https://csforall.org/en-US/activities/hour-of-ai',
            subtitle:
              'The Hour of AI makes teaching AI literacy easy, engaging, and fun.',
            iconName: 'computer',
          },
        },
      },
    },
    {
      label: 'Districts',
      href: '/districts',
      submenu: {
        subtitle:
          'Bring computer science, AI science, and data science to every school in your district.',
        columns: [
          {
            heading: 'District Implementation',
            type: 'Text List',
            items: [
              {title: 'CodeAI District Program', href: '/districts'},
              {
                title: 'K-12 Curriculum Pathways',
                href: '/administrators#pathways',
                iconName: 'book-open-cover',
              },
              {
                title: 'LMS Integration & Support',
                href: '/learning-management-systems',
                iconName: 'circle-user-circle-question',
              },
            ],
          },
          {
            heading: 'Resources',
            type: 'Text List',
            items: [
              {
                title: 'District Dashboard',
                href: 'https://districts.code.org/data-dashboard/',
                subtitle: 'See CodeAI utilization data in your district.',
                iconName: 'chart-bar',
              },
              {
                title: 'State Standards Alignment',
                href: '/correlations',
                subtitle:
                  'CodeAI curriculum alignment with your state education standards.',
                imageUrl:
                  'https://contentful-images.code.org/90t6bu6vlf76/2YhVhFL83OgMu5Btvidobq/796516061b902670eb52fbf138130b32/checklist.png?fm=avif',
              },
              {
                title: 'CS Access Report',
                href: '/your-school',
                subtitle: 'Interactive map of schools offering CS.',
              },
            ],
          },
          {
            type: 'Image List Vertical',
            items: [
              {
                title: 'Success Stories: Why This Works',
                href: '/if-then',
                subtitle:
                  'What difference does a single digital sciences course make for students?',
                imageUrl:
                  'https://contentful-images.code.org/90t6bu6vlf76/6a0Gu7H1ziaws1gsxZhD6t/1ae45694b9a6cfef7218458a1bc1361d/IfThen_website_graphic.png?fm=avif',
              },
            ],
          },
        ],
        promo: {
          background: 'lightGreen',
          content: {
            title: 'Request info today!',
            href: '/districts#signup',
            subtitle:
              'Contact us to get implementation information specific to your district.',
            iconName: 'circle-info',
          },
        },
      },
    },
    {
      label: 'Advocacy',
      href: '/advocacy',
      submenu: {
        subtitle: 'Make digital fluency the standard, not the exception.',
        columns: [
          {
            heading: 'Movement Networks',
            type: 'Text List',
            items: [
              {
                title: 'Policy & Advocacy',
                href: '/advocacy',
                subtitle: 'Advocate for digital fluency in education.',
              },
              {
                title: 'TeachAI',
                href: 'https://www.teachai.org/',
                subtitle: 'Empowering educators to teach with and about AI​.',
              },
              {
                title: 'CSforALL',
                href: 'https://csforall.org/',
                subtitle:
                  'Making AI and CS education accessible to all students.',
              },
              {
                title: 'AI Literacy Framework',
                href: 'https://ailiteracyframework.org/',
                subtitle:
                  'AI Literacy Framework for primary & secondary education.',
              },
            ],
          },
          {
            heading: 'Resources',
            type: 'Text List',
            items: [
              {
                title: '10 Policies',
                href: '/10policies',
                subtitle:
                  'Ten policies to make digital fluency foundational to K–12 education.',
              },
              {
                title: 'Access and Participation Data',
                href: 'https://advocacy.code.org/report-data/',
                subtitle:
                  'An interactive visualization provides data nationally and per state for the most recent school year.',
              },
              {
                title: 'State of AI & CS Education',
                href: 'https://advocacy.code.org/stateofaics/',
                subtitle:
                  'State-by-state analysis of AI & CS education policies, standards, and graduation requirements.',
                imageUrl:
                  'https://contentful-images.code.org/90t6bu6vlf76/3eL28HLogpO1AxVnzluLMS/424ff4b34ad10ad47990903d8a6e392a/code.org-20.resized.jpg?fm=avif',
              },
            ],
          },
          {
            type: 'Image List Vertical',
            items: [
              {
                title: 'The Urgent Need for Teacher Training',
                href: '/next/urgent-need-for-teacher-training',
                subtitle:
                  "Teachers are being asked to prepare students for an AI-shaped world without the training to do it. What happens to students if we don't fix it?",
                imageUrl:
                  'https://contentful-images.code.org/90t6bu6vlf76/188xlfIpLLKdoDRAkBH8K6/6a23adcb044258e57487d347b9db4a2f/Next_in_AI_Education_-_The_Urgent_Need_for_Teacher_Training.jpg?fm=avif',
              },
            ],
          },
        ],
      },
    },
    {label: 'Hour of AI', href: '/hour-of-ai'},
    {label: 'Parents', href: '/parents'},
    {label: 'Students', href: '/students'},
  ],
  secondaryMenu: [
    {label: 'About', href: '/about'},
    {label: 'Donate', href: '/donate'},
  ],
};
