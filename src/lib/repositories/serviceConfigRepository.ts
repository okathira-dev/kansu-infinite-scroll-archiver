import type { KansuDb } from "@/lib/db";
import type { ServiceConfig } from "@/lib/types";

/** サービス設定の永続化アクセスをまとめる。 */
export class ServiceConfigRepository {
  constructor(private readonly db: KansuDb) {}

  async list(): Promise<ServiceConfig[]> {
    return this.db.serviceConfigs.toArray();
  }

  async save(config: ServiceConfig): Promise<string> {
    await this.db.serviceConfigs.put(config);
    return config.id;
  }

  async findById(id: string): Promise<ServiceConfig | undefined> {
    return this.db.serviceConfigs.get(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) {
      return false;
    }
    await this.db.serviceConfigs.delete(id);
    return true;
  }
}
