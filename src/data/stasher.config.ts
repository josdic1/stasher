import rawConfig from "./stasher.config.json";

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

export type StasherConfig = {
  categories: StashCategory[];
  items: StashItem[];
};

export const stasherConfig = rawConfig as StasherConfig;
