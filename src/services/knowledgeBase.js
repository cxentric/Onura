/**
 * Offline replacements for the old AI features, driven by the predefined knowledge base.
 * No API key or network access is needed.
 */
import industries from '../data/kb/industries';
import roles from '../data/kb/roles';

const GENERAL_TAGS = ['#CareerGrowth', '#Upskilling', '#Networking', '#Leadership', '#FutureOfWork', '#ProfessionalDevelopment'];

const ROLE_KEYWORDS = {
  cxm: ['cx', 'cxm', 'customer experience', 'nps', 'csat', 'journey'],
  presales: ['presales', 'pre-sales', 'solution consultant', 'solutions consultant', 'rfp', 'demo'],
  dev: ['developer', 'development', 'coding', 'code', 'programming', 'software engineer'],
  qe: ['qe', 'qa', 'quality', 'testing', 'test automation', 'sdet'],
  designer: ['design', 'designer', 'ux', 'ui', 'figma'],
  pm: ['project manager', 'project management', 'pmp', 'scrum', 'agile', 'delivery'],
  ba: ['business analyst', 'requirements', 'user stories', ' ba '],
  data: ['data', 'analytics', 'analyst', 'dashboard', 'sql'],
  sales: ['sales', 'account manager', 'selling', 'pipeline', 'quota'],
  hr: ['hr', 'hiring', 'recruit', 'talent', 'onboarding'],
};

const ROLE_TAGS = {
  cxm: ['#CustomerExperience', '#CXM', '#VoiceOfCustomer', '#CustomerJourney'],
  presales: ['#Presales', '#SolutionsConsulting', '#RFP', '#SalesEngineering'],
  dev: ['#SoftwareDevelopment', '#Coding', '#Developers', '#TechCareers'],
  qe: ['#QualityEngineering', '#TestAutomation', '#QA', '#SoftwareTesting'],
  designer: ['#UXDesign', '#UIDesign', '#ProductDesign', '#DesignThinking'],
  pm: ['#ProjectManagement', '#Agile', '#PMP', '#Delivery'],
  ba: ['#BusinessAnalysis', '#Requirements', '#ProcessImprovement', '#BA'],
  data: ['#DataAnalytics', '#DataScience', '#BusinessIntelligence', '#DataDriven'],
  sales: ['#Sales', '#B2BSales', '#AccountManagement', '#SalesLeadership'],
  hr: ['#HR', '#TalentAcquisition', '#Recruiting', '#EmployerBranding'],
};

const hasKeyword = (text, keyword) => {
  // Short keywords (e.g. "ai", "it", "ux") must match whole words to avoid false hits.
  if (keyword.trim().length <= 3) return new RegExp(`\\b${keyword.trim()}\\b`, 'i').test(text);
  return text.includes(keyword);
};

function detect(text) {
  const lower = ` ${text.toLowerCase()} `;
  const matchedIndustries = industries.filter((ind) => ind.keywords.some((k) => hasKeyword(lower, k)));
  const matchedRoles = roles.filter((role) => ROLE_KEYWORDS[role.id].some((k) => hasKeyword(lower, k)));
  return { matchedIndustries, matchedRoles };
}

const unique = (items) => [...new Set(items)];
const withArticle = (title) => `${/^([aeiou]|(hr|ml|sdet|rpa)\b)/i.test(title) ? 'an' : 'a'} ${title}`;

/**
 * Suggest hashtags for a post, based on the industries and roles it mentions.
 * @returns {Promise<{hashtags: string[], trending: string[], suggestions: string}>}
 */
export async function generateHashtags(content) {
  const { matchedIndustries, matchedRoles } = detect(content);

  const hashtags = unique([
    ...matchedRoles.flatMap((role) => ROLE_TAGS[role.id]),
    ...matchedIndustries.flatMap((ind) => ind.hashtags.slice(0, 5)),
    ...GENERAL_TAGS,
  ]).slice(0, 10);

  const trendSource = matchedIndustries.length ? matchedIndustries : industries;
  const trending = unique(trendSource.flatMap((ind) => ind.hashtags.slice(5))).slice(0, 5);

  const topics = [...matchedRoles.map((role) => role.shortName), ...matchedIndustries.map((ind) => ind.name)];
  const suggestions = topics.length
    ? `Tailored for ${topics.join(', ')}. Use 3–5 of these, putting the most specific first.`
    : 'Mention an industry (IT, BPO, Medicine, Engineering, AI, Teaching) or a role (CXM, Presales, Developer, QE, Designer…) for more specific hashtags.';

  return { hashtags, trending, suggestions };
}

/**
 * Suggest post ideas for a topic, using the matching industry and role profiles.
 * @returns {Promise<{title: string, content: string, ideas: string[]}>}
 */
export async function generateContentIdeas(topic) {
  const { matchedIndustries, matchedRoles } = detect(topic);
  const ind = matchedIndustries[0];
  const role = matchedRoles[0];
  const label = topic.trim() || 'your field';

  if (ind && role) {
    const rs = ind.roles[role.id];
    return {
      title: `Being ${withArticle(rs.title)} in ${ind.name}: what it really takes`,
      content: `Post ideas that show your expertise as ${withArticle(rs.title)} in ${ind.fullName}.`,
      ideas: [
        `The 3 skills that matter most for ${rs.title}s: ${rs.skills.join(', ')} — and how you built them`,
        `A day in the life: how ${withArticle(role.shortName)} ${role.dayToDay}`,
        `Tools of the trade: why ${rs.tools.join(' and ')} matter in ${ind.name}`,
        `What ${ind.name} newcomers should know about ${rs.domain}`,
        `My career path so far vs. the classic route: ${role.growth}`,
      ],
    };
  }

  if (role) {
    return {
      title: `${role.name}: lessons worth sharing`,
      content: role.summary,
      ideas: [
        `Myths vs. reality of working as ${withArticle(role.shortName)}`,
        `The KPIs I’m measured on (${role.kpis.slice(0, 2).join(', ')}) and how I improve them`,
        `How to break into ${role.shortName}: ${role.switchInto}`,
        `${role.shortName} vs. similar roles — a quick explainer`,
        `The soft skills nobody tells you about: ${role.soft.join(', ')}`,
      ],
    };
  }

  if (ind) {
    return {
      title: `What’s changing in ${ind.fullName}`,
      content: ind.overview,
      ideas: [
        `My take on the biggest ${ind.name} trend: ${ind.trends[0]}`,
        `Skills in demand in ${ind.name}: ${ind.inDemand.slice(0, 3).join(', ')} — which one I’m learning next`,
        `Lessons from how ${ind.companies[0].name} approaches ${ind.companies[0].knownFor}`,
        `A beginner’s guide to getting into ${ind.name} (${ind.entryRoles.slice(0, 2).join(', ')})`,
        `Why ${ind.regulations.split(',')[0]} matters for everyone in ${ind.name}`,
      ],
    };
  }

  return {
    title: `Content ideas about ${label}`,
    content: `General post ideas about ${label}. Mention an industry or role for tailored ideas.`,
    ideas: [
      `A lesson you learned about ${label} this year`,
      `3 resources that helped you understand ${label}`,
      `A common misconception about ${label}`,
      `Ask your network: what’s your biggest challenge with ${label}?`,
      `Share a small win related to ${label} and what made it work`,
    ],
  };
}
