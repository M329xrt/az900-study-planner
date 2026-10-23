/**
 * The AZ-900 syllabus, written out topic by topic as a checklist.
 * Skill areas and weightings follow the official AZ-900 study guide.
 * No vendor artwork or logos are used anywhere in this app.
 */

export const DOMAINS = [
  {
    id: 'cloud-concepts',
    name: 'Cloud concepts',
    weight: 27,
    summary: 'The ideas behind cloud computing and the vocabulary the exam leans on in half its questions.',
    topics: [
      {
        id: 'cloud-fundamentals',
        title: 'What cloud computing actually is',
        minutes: 35,
        focus: [
          'Define cloud computing in one sentence you can defend',
          'The shared responsibility model — what you own vs what the provider owns',
          'Public, private and hybrid cloud models, and when each fits',
          'The consumption-based model and why it changes budgeting',
          'CapEx vs OpEx pricing models',
          'Serverless: what it means and what it does not mean'
        ],
        teachBack: 'Explain the shared responsibility model using a rented flat as the analogy.',
        practical: 'Take three services you use daily and label each one IaaS, PaaS or SaaS.'
      },
      {
        id: 'cloud-benefits',
        title: 'Benefits of cloud services',
        minutes: 30,
        focus: [
          'High availability and why it differs from reliability',
          'Scalability: vertical (up) vs horizontal (out)',
          'Reliability and predictability of performance and cost',
          'Security and governance benefits that come with the platform',
          'Manageability: what the provider keeps running for you'
        ],
        teachBack: 'Explain scalability to someone who has never scaled anything, using a food-stall example.',
        practical: 'Write one sentence per benefit describing a real outage or slowdown it would have prevented.'
      },
      {
        id: 'cloud-service-types',
        title: 'Cloud service types',
        minutes: 30,
        focus: [
          'IaaS: you manage the operating system and everything above it',
          'PaaS: you manage your code and data only',
          'SaaS: you manage your users and your settings',
          'Choosing a service type from a written scenario',
          'Which service type suits lift-and-shift, and which suits a new app'
        ],
        teachBack: 'Describe IaaS, PaaS and SaaS as three levels of renting a kitchen.',
        practical: 'For five short scenarios, pick the service type and justify it in one line.'
      }
    ]
  },
  {
    id: 'architecture-services',
    name: 'Azure architecture and services',
    weight: 41,
    summary: 'The biggest skill area. Regions, compute, networking, storage, identity and security.',
    topics: [
      {
        id: 'core-architecture',
        title: 'Core architectural components',
        minutes: 40,
        focus: [
          'Regions, region pairs and sovereign regions',
          'Availability zones and datacenters inside a region',
          'Resources and resource groups',
          'Subscriptions and what they represent',
          'Management groups and the resource hierarchy',
          'Why you would choose a region close to your users'
        ],
        teachBack: 'Draw the hierarchy management group → subscription → resource group → resource from memory.',
        practical: 'Sketch a deployment for a hospital that must keep patient data in country.'
      },
      {
        id: 'compute',
        title: 'Compute services',
        minutes: 40,
        focus: [
          'Virtual machines: full control, more responsibility',
          'Availability sets and virtual machine scale sets',
          'Azure Virtual Desktop and when it beats a normal VM',
          'Containers vs virtual machines',
          'Container Instances and Kubernetes Service, in plain words',
          'Azure Functions and serverless compute',
          'App Service for web apps and APIs'
        ],
        teachBack: 'Explain containers vs virtual machines to a friend who thinks they are the same thing.',
        practical: 'Match six workloads (batch job, legacy app, microservice, website) to a compute option.'
      },
      {
        id: 'networking',
        title: 'Networking services',
        minutes: 35,
        focus: [
          'Virtual networks and subnets',
          'Virtual network peering',
          'Public endpoints vs private endpoints',
          'Azure DNS and name resolution',
          'VPN Gateway vs ExpressRoute',
          'Why traffic between services should stay on the private network'
        ],
        teachBack: 'Explain peering as connecting two office LANs with a private corridor.',
        practical: 'Describe how a web app reaches a database without the database ever being public.'
      },
      {
        id: 'storage',
        title: 'Storage services',
        minutes: 40,
        focus: [
          'Storage accounts and what you can put in them',
          'Blob storage tiers (hot, cool, cold, archive) and lifecycle rules',
          'Azure Files, Disks, Queues and Tables',
          'Redundancy: LRS, ZRS, GRS, GZRS and what each survives',
          'Migration and movement: Azure Migrate, Data Box, AzCopy, Storage Explorer'
        ],
        teachBack: 'Explain redundancy options as different levels of insurance for one file.',
        practical: 'Pick the cheapest sensible storage tier for backups, app data and long-term archives.'
      },
      {
        id: 'identity-security',
        title: 'Identity, access and security',
        minutes: 45,
        focus: [
          'Microsoft Entra ID vs Entra Domain Services',
          'Single sign-on, multifactor authentication and passwordless sign-in',
          'External identities and guest access',
          'Conditional Access: signals, then decisions',
          'Role-based access control and least privilege',
          'Zero Trust: verify explicitly, least privilege, assume breach',
          'Defence in depth layers',
          'Microsoft Defender for Cloud'
        ],
        teachBack: 'Explain Zero Trust to a security-sceptical manager in three sentences.',
        practical: 'Write the access rule you would give a new intern, then tighten it twice.'
      }
    ]
  },
  {
    id: 'management-governance',
    name: 'Management and governance',
    weight: 32,
    summary: 'Costs, guardrails, deployment tools and monitoring — how an organisation keeps control.',
    topics: [
      {
        id: 'cost',
        title: 'Cost management',
        minutes: 30,
        focus: [
          'The factors that actually drive a bill',
          'Pricing calculator vs total cost of ownership calculator',
          'Microsoft Cost Management for tracking and alerts',
          'Tags and cost allocation across teams',
          'How reserved capacity and region choice change the price'
        ],
        teachBack: 'Explain to a finance officer why cloud cost is variable, not fixed.',
        practical: 'Name three decisions you control that directly lower a monthly bill.'
      },
      {
        id: 'governance',
        title: 'Governance and compliance',
        minutes: 30,
        focus: [
          'Microsoft Purview for data governance and compliance',
          'Azure Policy: what it enforces and how it flags drift',
          'Resource locks: CanNotDelete vs ReadOnly',
          'Compliance offerings and the Service Trust Portal',
          'Who is allowed to change what, and how that is recorded'
        ],
        teachBack: 'Explain the difference between Azure Policy and RBAC using a building-access analogy.',
        practical: 'Decide where you would place a lock on a production database and why.'
      },
      {
        id: 'deploy-manage',
        title: 'Managing and deploying resources',
        minutes: 35,
        focus: [
          'Azure portal, Cloud Shell and when each is fastest',
          'Azure CLI vs Azure PowerShell',
          'Infrastructure as code with ARM templates and Bicep',
          'Azure Arc for resources outside Azure',
          'Azure Advisor recommendations, and why they are free'
        ],
        teachBack: 'Explain infrastructure as code to someone who only clicks in the portal.',
        practical: 'Write the one-line command you would use to list your resource groups from Cloud Shell.'
      },
      {
        id: 'monitoring',
        title: 'Monitoring tools',
        minutes: 35,
        focus: [
          'Azure Advisor for recommendations and optimisation',
          'Azure Service Health for outages affecting you',
          'Azure Monitor and Log Analytics',
          'Application Insights for app-level telemetry',
          'Alerts and action groups: from a metric to a phone call',
          'Metric vs log: which one answers which question'
        ],
        teachBack: 'Explain the difference between Service Health and Azure Monitor in one breath.',
        practical: 'Pick one symptom (slow logins) and trace the tools you would use to find the cause.'
      }
    ]
  }
];

export const TOPICS = DOMAINS.flatMap((domain) =>
  domain.topics.map((topic) => ({ ...topic, domainId: domain.id, domainName: domain.name }))
);

export const TOPIC_MAP = TOPICS.reduce((acc, topic) => {
  acc[topic.id] = topic;
  return acc;
}, {});

export const TOTAL_TOPICS = TOPICS.length;

export const TOTAL_MINUTES = TOPICS.reduce((sum, topic) => sum + topic.minutes, 0);