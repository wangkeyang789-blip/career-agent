import jdData from "@/lib/data/jd.json";
import qaData from "@/lib/data/qa.json";
import interviewData from "@/lib/data/interview.json";

export interface SearchContext {
  role?: string;
  stage?: string;
  message: string;
}

export interface SearchResult {
  content: string;
  source: string;
  role: string;
  relevance: number;
  type: "jd" | "qa" | "interview";
}

export interface KnowledgeProvider {
  name: string;
  search(query: string, context?: SearchContext): Promise<SearchResult[]>;
}

const ROLE_KEYWORDS: Record<string, string[]> = {
  "产品经理": ["产品经理", "产品", "pm", "toC", "toB", "PRD", "原型"],
  "数据分析师": ["数据分析", "数据", "sql", "分析师", "bi", "可视化", "统计"],
  "后端开发": ["后端", "java", "spring", "redis", "微服务", "架构", "数据库", "高并发"],
  "前端开发": ["前端", "react", "vue", "html", "css", "javascript", "h5"],
  "UI/UX 设计师": ["设计", "ui", "ux", "figma", "sketch", "交互", "视觉", "用户体验"],
  "运营": ["运营", "增长", "留存", "社群", "内容", "活动", "新媒体"],
};

const GENERIC_KEYWORDS = [
  "面试", "简历", "薪资", "职业发展", "转行", "实习", "应届生",
  "求职", "offer", "招聘", "技能", "学习", "准备",
];

function matchRole(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      // Check for exclusion: if the query mentions a different role more specifically
      return role;
    }
  }
  return null;
}

function extractKeywords(query: string): string[] {
  const words: string[] = [];
  const lower = query.toLowerCase();

  // Check role keywords
  for (const keywords of Object.values(ROLE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) words.push(kw);
    }
  }

  // Check generic keywords
  for (const kw of GENERIC_KEYWORDS) {
    if (lower.includes(kw)) words.push(kw);
  }

  return [...new Set(words)];
}

export class MockKnowledgeProvider implements KnowledgeProvider {
  name = "mock-knowledge";

  private jdCache: typeof jdData;
  private qaCache: typeof qaData;
  private interviewCache: typeof interviewData;

  constructor() {
    this.jdCache = jdData;
    this.qaCache = qaData;
    this.interviewCache = interviewData;
  }

  async search(query: string, context?: SearchContext): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const matchedRole = context?.role || matchRole(query);
    const keywords = extractKeywords(query);

    // 1. Search JDs
    for (const entry of this.jdCache) {
      if (matchedRole && entry.role !== matchedRole) continue;
      const roleRelevance = matchedRole === entry.role ? 0.3 : 0;
      results.push({
        content: JSON.stringify(entry.jd, null, 2),
        source: "JD 数据库",
        role: entry.role,
        relevance: 0.8 + roleRelevance,
        type: "jd",
      });
    }

    // 2. Search QA
    for (const entry of this.qaCache) {
      if (matchedRole && entry.role !== matchedRole) continue;
      for (const qa of entry.qa) {
        const qRelevance = keywords.reduce((score, kw) => {
          return score + (qa.question.includes(kw) ? 0.15 : 0);
        }, 0);
        if (qRelevance > 0 || !matchedRole) {
          results.push({
            content: `Q: ${qa.question}\nA: ${qa.answer}`,
            source: "职业问答库",
            role: entry.role,
            relevance: 0.5 + qRelevance,
            type: "qa",
          });
        }
      }
    }

    // 3. Search interview questions
    for (const entry of this.interviewCache) {
      if (matchedRole && entry.role !== matchedRole) continue;
      for (const q of entry.questions) {
        const qRelevance = keywords.reduce((score, kw) => {
          return score + (q.question.includes(kw) ? 0.2 : 0);
        }, 0);
        if (qRelevance > 0 || (!matchedRole && keywords.length === 0)) {
          results.push({
            content: `面试题(${q.type}): ${q.question}\n考察要点: ${q.expectedPoints.join("、")}`,
            source: "面试题库",
            role: entry.role,
            relevance: 0.4 + qRelevance,
            type: "interview",
          });
        }
      }
    }

    // Sort by relevance descending, limit top 8
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 8);
  }
}

// Singleton
let provider: KnowledgeProvider | null = null;

export function getKnowledgeProvider(): KnowledgeProvider {
  if (!provider) {
    provider = new MockKnowledgeProvider();
  }
  return provider;
}
