import { type Expert, type ContentSection } from "@shared/schema";

export interface IStorage {
  getExperts(): Promise<Expert[]>;
  getContentSections(): Promise<ContentSection[]>;
}

export class MemStorage implements IStorage {
  private experts: Expert[] = [];
  private contentSections: ContentSection[] = [];

  async getExperts(): Promise<Expert[]> {
    return this.experts;
  }

  async getContentSections(): Promise<ContentSection[]> {
    return this.contentSections;
  }

  setExperts(experts: Expert[]): void {
    this.experts = experts;
  }

  setContentSections(sections: ContentSection[]): void {
    this.contentSections = sections;
  }
}

export const storage = new MemStorage();
