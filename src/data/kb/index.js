// Predefined knowledge base: 1000 questions and answers built from industries.js and roles.js.
// Every item can be browsed (Learn mode) or asked as a 4-option multiple-choice question (Quiz mode).
import industries from './industries';
import roles from './roles';

export const DISCLAIMER =
  'Companies are widely recognised leaders in each industry, not an official ranking. Facts reflect public information as of 2025.';

export const TOPICS = [
  { id: 'roles', label: 'Roles & Skills' },
  { id: 'companies', label: 'Top Companies' },
  { id: 'industry', label: 'Industry' },
  { id: 'careers', label: 'Careers' },
];

const list = (items) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// 'an' before vowel sounds, including acronyms read letter by letter (HR, ML, SDET, RPA).
const article = (word) => (/^([aeiou]|(hr|ml|sdet|rpa)\b)/i.test(word) ? 'an' : 'a');

function buildItems() {
  const items = [];
  const add = (item) => items.push({ id: `q${String(items.length + 1).padStart(4, '0')}`, ...item });

  // 1. Top companies: 6 industries × 10 companies × 4 questions = 240
  industries.forEach((ind) => {
    ind.companies.forEach((co) => {
      const base = { topic: 'companies', industry: ind.id, role: null, company: co.name };
      add({ ...base, type: 'co_hq', question: `Where is ${co.name} headquartered?`, answer: `${co.name} is headquartered in ${co.hq}.`, short: co.hq });
      add({ ...base, type: 'co_known', question: `What is ${co.name} best known for?`, answer: `${co.name} is a leading ${ind.name} company, best known for ${co.knownFor}.`, short: cap(co.knownFor) });
      add({ ...base, type: 'co_founded', question: `Which fact about ${co.name}’s origins is correct?`, answer: `${co.founded}.`, short: co.founded });
      add({ ...base, type: 'co_flagship', question: `What is a flagship product or service of ${co.name}?`, answer: `A flagship offering of ${co.name} is ${co.flagship}.`, short: cap(co.flagship) });
    });
  });

  // 2. Roles & skills: 6 industries × 10 roles × 11 questions = 660
  industries.forEach((ind) => {
    roles.forEach((role, roleIndex) => {
      const rs = ind.roles[role.id];
      const t = rs.title;
      const a = article(t);
      const base = { topic: 'roles', industry: ind.id, role: role.id, company: null };
      const employers = [0, 1, 2, 3, 4].map((i) => ind.companies[(roleIndex + i * 2) % ind.companies.length].name);

      add({ ...base, type: 'rs_skills', question: `What skills does ${a} ${t} need in ${ind.name}?`,
        answer: `Core skills: ${list(role.coreSkills)}. In ${ind.name} specifically, you also need ${list(rs.skills)}.`,
        short: cap(list(rs.skills)) });
      add({ ...base, type: 'rs_tools', question: `Which tools does ${a} ${t} use in ${ind.name}?`,
        answer: `Common tools are ${list(role.tools)}. ${ind.name} teams also rely on ${list(rs.tools)}.`,
        short: list(rs.tools) });
      add({ ...base, type: 'rs_certs', question: `Which certifications help ${a} ${t} in ${ind.name}?`,
        answer: `Useful certifications: ${list(role.certs)}. Industry credentials such as ${ind.certs[0]} also add weight in ${ind.name}.`,
        short: `${role.certs[0]} and ${role.certs[1]}` });
      add({ ...base, type: 'rs_kpis', question: `Which KPIs is ${a} ${t} in ${ind.name} usually measured on?`,
        answer: `Typical KPIs: ${list(role.kpis)}.`,
        short: list(role.kpis.slice(0, 2)) });
      add({ ...base, type: 'rs_day', question: `What does ${a} ${t} do day to day in ${ind.name}?`,
        answer: `${cap(a)} ${t} ${role.dayToDay}. In ${ind.name}, this happens in the context of ${rs.domain}.`,
        short: cap(role.dayToDay) });
      add({ ...base, type: 'rs_domain', question: `What domain knowledge does ${a} ${t} need in ${ind.name}?`,
        answer: `You should understand ${rs.domain}. More broadly, ${ind.name} work is shaped by ${ind.regulations}.`,
        short: cap(rs.domain) });
      add({ ...base, type: 'rs_entry', question: `How do you start a career as ${a} ${t} in ${ind.name}?`,
        answer: `${role.entry} Common ${ind.name} entry roles include ${list(ind.entryRoles.slice(0, 2))}.`,
        short: role.entry });
      add({ ...base, type: 'rs_interview', question: `What do interviews for ${a} ${t} role in ${ind.name} focus on?`,
        answer: `${role.interview} The typical ${ind.name} process is: ${ind.interview}.`,
        short: role.interview });
      add({ ...base, type: 'rs_growth', question: `What is the career path for ${a} ${t} in ${ind.name}?`,
        answer: `A typical path is ${role.growth}.`,
        short: role.growth });
      add({ ...base, type: 'rs_soft', question: `Which soft skills matter most for ${a} ${t} in ${ind.name}?`,
        answer: `For this role: ${list(role.soft)}. ${ind.name} employers also value ${list(ind.soft)}.`,
        short: cap(list(role.soft)) });
      add({ ...base, type: 'rs_employers', question: `Which leading ${ind.name} companies hire for ${t} roles?`,
        answer: `Leading ${ind.name} employers for this role include ${list(employers)}.`,
        short: list(employers.slice(0, 3)) });
    });
  });

  // 3. Industry overview: 6 industries × 10 questions = 60
  industries.forEach((ind) => {
    const base = { topic: 'industry', industry: ind.id, role: null, company: null };
    const n = ind.name;
    add({ ...base, type: 'in_overview', question: `What does the ${n} industry cover?`, answer: ind.overview, short: ind.overview });
    add({ ...base, type: 'in_regs', question: `Which regulations and standards matter most in ${n}?`, answer: `Key ones include ${ind.regulations}.`, short: cap(ind.regulations) });
    add({ ...base, type: 'in_skills', question: `Which skills are most in demand in ${n} right now?`, answer: `In-demand skills include ${list(ind.inDemand)}.`, short: cap(list(ind.inDemand.slice(0, 3))) });
    add({ ...base, type: 'in_trends', question: `What are the big trends shaping ${n}?`, answer: `Major trends: ${list(ind.trends)}.`, short: cap(list(ind.trends.slice(0, 2))) });
    add({ ...base, type: 'in_entry', question: `What are common entry-level jobs in ${n}?`, answer: `Common starting roles: ${list(ind.entryRoles)}.`, short: list(ind.entryRoles.slice(0, 2)) });
    add({ ...base, type: 'in_certs', question: `Which certifications are valued across ${n}?`, answer: `Widely valued: ${list(ind.certs)}.`, short: list(ind.certs.slice(0, 2)) });
    add({ ...base, type: 'in_hubs', question: `Which cities are major hubs for ${n} jobs?`, answer: `Major hubs include ${list(ind.hubs)}.`, short: list(ind.hubs.slice(0, 3)) });
    add({ ...base, type: 'in_interview', question: `What does a typical ${n} hiring process look like?`, answer: `Usually: ${ind.interview}.`, short: ind.interview });
    add({ ...base, type: 'in_companies', question: `Which companies are among the leaders in ${n}?`, answer: `Leading ${n} companies include ${list(ind.companies.map((co) => co.name))}. ${DISCLAIMER}`, short: list(ind.companies.slice(0, 3).map((co) => co.name)) });
    add({ ...base, type: 'in_soft', question: `Which soft skills do ${n} employers value most?`, answer: `${n} employers especially value ${list(ind.soft)}.`, short: cap(list(ind.soft)) });
  });

  // 4. Careers (any industry): 10 roles × 4 questions = 40
  roles.forEach((role) => {
    const base = { topic: 'careers', industry: null, role: role.id, company: null };
    add({ ...base, type: 'cr_what', question: `What does ${article(role.name)} ${role.name} do?`, answer: role.summary, short: role.summary });
    add({ ...base, type: 'cr_skills', question: `What are the core skills of ${article(role.name)} ${role.name} in any industry?`, answer: `Core skills: ${list(role.coreSkills)}.`, short: cap(list(role.coreSkills.slice(0, 3))) });
    add({ ...base, type: 'cr_switch', question: `How can I move into ${article(role.shortName)} ${role.shortName} role?`, answer: role.switchInto, short: role.switchInto });
    add({ ...base, type: 'cr_versus', question: `How is ${article(role.shortName)} ${role.shortName} role different from similar roles?`, answer: role.versus, short: role.versus });
  });

  return items;
}

export const items = buildItems();
export const industryList = industries.map(({ id, name, fullName }) => ({ id, name, fullName }));
export const roleList = roles.map(({ id, name, shortName }) => ({ id, name, shortName }));
export const industryById = Object.fromEntries(industries.map((ind) => [ind.id, ind]));
export const roleById = Object.fromEntries(roles.map((role) => [role.id, role]));

// Deterministic randomness so each question always shows the same options.
function seededRandom(seedText) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) seed = (Math.imul(31, seed) + seedText.charCodeAt(i)) | 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(array, random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const shortsByType = items.reduce((acc, item) => {
  (acc[item.type] ||= new Set()).add(item.short);
  return acc;
}, {});

/** Four answer options (one correct) for an item, always the same for the same item. */
export function getQuizOptions(item) {
  const random = seededRandom(item.id);
  const wrong = shuffle([...shortsByType[item.type]].filter((s) => s !== item.short), random).slice(0, 3);
  const options = shuffle([item.short, ...wrong], random);
  return { options, correctIndex: options.indexOf(item.short) };
}

export function filterItems({ industry = 'all', topic = 'all', role = 'all', search = '' } = {}) {
  const needle = search.trim().toLowerCase();
  return items.filter(
    (item) =>
      (topic === 'all' || item.topic === topic) &&
      (industry === 'all' || item.industry === industry || item.industry === null) &&
      (role === 'all' || item.role === role) &&
      (!needle || item.question.toLowerCase().includes(needle))
  );
}

/** Random quiz questions for the given filters. */
export function pickQuizQuestions(filters, count = 10) {
  return shuffle(filterItems(filters), Math.random).slice(0, count);
}

/** Other questions about the same company, role/industry pair, industry or role. */
export function relatedItems(item, count = 3) {
  return items
    .filter(
      (other) =>
        other.id !== item.id &&
        other.topic === item.topic &&
        other.industry === item.industry &&
        other.role === item.role &&
        other.company === item.company
    )
    .slice(0, count);
}
