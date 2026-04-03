import type { Label } from "@/models";
import type { LabelRepo } from "@/repos/label-repo";

export function createLabelService(labelRepo: LabelRepo) {
  return {
    async getAll(): Promise<Label[]> {
      return await labelRepo.getAll();
    },
    async create(name: string): Promise<Label> {
      const id = await labelRepo.create({ name });
      return { id, name };
    },
    async update(id: string, name: string): Promise<void> {
      await labelRepo.update(id, { name });
    },
    async delete(id: string): Promise<void> {
      await labelRepo.delete(id);
    },
  };
}
