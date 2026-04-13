import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export interface TopicMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  officialWebsite?: string;
  missionaryLink?: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  topic: string;
  description: string;
  tags: string[];
  date: string;
  perspective?: string;
}

export interface TopicData extends TopicMeta {
  contentHtml: string;
}

export interface ArticleData extends ArticleMeta {
  contentHtml: string;
}

export function getAllTopics(): TopicMeta[] {
  const topicsDir = path.join(contentDirectory, "topics");
  if (!fs.existsSync(topicsDir)) return [];
  const files = fs.readdirSync(topicsDir).filter((f) => f.endsWith(".md"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const filePath = path.join(topicsDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title || slug,
        description: data.description || "",
        icon: data.icon || "",
        color: data.color || "blue",
        officialWebsite: data.officialWebsite,
        missionaryLink: data.missionaryLink,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getTopicBySlug(
  slug: string
): Promise<TopicData | null> {
  const filePath = path.join(contentDirectory, "topics", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    icon: data.icon || "",
    color: data.color || "blue",
    officialWebsite: data.officialWebsite,
    missionaryLink: data.missionaryLink,
    contentHtml: processedContent.toString(),
  };
}

export function getAllArticles(): ArticleMeta[] {
  const articlesDir = path.join(contentDirectory, "articles");
  if (!fs.existsSync(articlesDir)) return [];
  const articles: ArticleMeta[] = [];

  const topicDirs = fs
    .readdirSync(articlesDir)
    .filter((d) =>
      fs.statSync(path.join(articlesDir, d)).isDirectory()
    );

  for (const topicDir of topicDirs) {
    const files = fs
      .readdirSync(path.join(articlesDir, topicDir))
      .filter((f) => f.endsWith(".md"));
    for (const filename of files) {
      const slug = filename.replace(/\.md$/, "");
      const filePath = path.join(articlesDir, topicDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);
      articles.push({
        slug,
        title: data.title || slug,
        topic: data.topic || topicDir,
        description: data.description || "",
        tags: data.tags || [],
        date: data.date || "",
        perspective: data.perspective,
      });
    }
  }

  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getArticlesByTopic(topic: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.topic === topic);
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleData | null> {
  const articlesDir = path.join(contentDirectory, "articles");
  if (!fs.existsSync(articlesDir)) return null;

  const topicDirs = fs
    .readdirSync(articlesDir)
    .filter((d) =>
      fs.statSync(path.join(articlesDir, d)).isDirectory()
    );

  for (const topicDir of topicDirs) {
    const filePath = path.join(articlesDir, topicDir, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      const processedContent = await remark().use(html).process(content);
      return {
        slug,
        title: data.title || slug,
        topic: data.topic || topicDir,
        description: data.description || "",
        tags: data.tags || [],
        date: data.date || "",
        perspective: data.perspective,
        contentHtml: processedContent.toString(),
      };
    }
  }

  return null;
}

export function getAllArticleSlugs(): string[] {
  return getAllArticles().map((a) => a.slug);
}

export function getAllTopicSlugs(): string[] {
  return getAllTopics().map((t) => t.slug);
}

/* ── Blog posts ── */

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  author: string;
}

export interface BlogData extends BlogMeta {
  contentHtml: string;
}

export function getAllBlogPosts(): BlogMeta[] {
  const blogDir = path.join(contentDirectory, "blog");
  if (!fs.existsSync(blogDir)) return [];
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const filePath = path.join(blogDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title || slug,
        date: data.date ? String(data.date) : "",
        tags: data.tags || [],
        author: data.author || "Vibeproof",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPostBySlug(slug: string): Promise<BlogData | null> {
  const filePath = path.join(contentDirectory, "blog", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  return {
    slug,
    title: data.title || slug,
    date: data.date ? String(data.date) : "",
    tags: data.tags || [],
    author: data.author || "Vibeproof",
    contentHtml: processedContent.toString(),
  };
}

export function getAllBlogSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug);
}

/* ── Static pages (legal, about, etc.) ── */

export interface PageMeta {
  slug: string;
  title: string;
}

export interface PageData extends PageMeta {
  contentHtml: string;
}

export function getAllPages(): PageMeta[] {
  const pagesDir = path.join(contentDirectory, "pages");
  if (!fs.existsSync(pagesDir)) return [];
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".md"));
  return files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(pagesDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data } = matter(fileContents);
    return { slug, title: data.title || slug };
  });
}

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const filePath = path.join(contentDirectory, "pages", `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  return {
    slug,
    title: data.title || slug,
    contentHtml: processedContent.toString(),
  };
}
