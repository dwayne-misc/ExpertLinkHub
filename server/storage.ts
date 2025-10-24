import { type Expert } from "@shared/schema";

export interface IStorage {
  getExperts(): Promise<Expert[]>;
}

export class MemStorage implements IStorage {
  private experts: Expert[] = [];

  async getExperts(): Promise<Expert[]> {
    return this.experts;
  }

  setExperts(experts: Expert[]): void {
    this.experts = experts;
  }
}

export const storage = new MemStorage();
