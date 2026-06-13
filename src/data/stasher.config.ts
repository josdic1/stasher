export type StashCategory = {
  id: string;
  name: string;
};

export type StashItem = {
  id: string;
  title: string;
  body: string;
  categoryId: string;
  tags: string[];
};

export const stasherConfig = {
  categories: [
    { id: "git", name: "Git" },
    { id: "npm", name: "NPM" },
    { id: "mac", name: "Mac" },
    { id: "sql", name: "SQL" },
    { id: "urls", name: "URLs" },
  ] satisfies StashCategory[],

  items: [
    {
      id: "git-status",
      title: "Git Status",
      body: "git status",
      categoryId: "git",
      tags: ["git", "status", "changes"],
    },
    {
      id: "git-commit",
      title: "Commit Changes",
      body: 'git add . && git commit -m "message"',
      categoryId: "git",
      tags: ["git", "commit", "save"],
    },
    {
      id: "npm-dev",
      title: "Run Dev Server",
      body: "npm run dev",
      categoryId: "npm",
      tags: ["npm", "vite", "dev"],
    },
    {
      id: "show-hidden-files",
      title: "Show Hidden Files on Mac",
      body: "defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder",
      categoryId: "mac",
      tags: ["mac", "finder", "hidden"],
    },
  ] satisfies StashItem[],
};
