import type { KansuDb } from "@/lib/db";
import { resolveServiceNotificationSettings, type ServiceConfig } from "@/lib/types";

const normalizeServiceConfig = (config: ServiceConfig): ServiceConfig => ({
  ...config,
  notificationSettings: resolveServiceNotificationSettings(config.notificationSettings),
});

/** サービス設定の永続化アクセスをまとめる。 */
export class ServiceConfigRepository {
  constructor(private readonly db: KansuDb) {}

  async list(): Promise<ServiceConfig[]> {
    const configs = await this.db.serviceConfigs.toArray();
    return configs.map(normalizeServiceConfig);
  }

  async save(config: ServiceConfig): Promise<string> {
    const normalized = normalizeServiceConfig(config);
    await this.db.serviceConfigs.put(normalized);
    return normalized.id;
  }

  async findById(id: string): Promise<ServiceConfig | undefined> {
    const config = await this.db.serviceConfigs.get(id);
    return config ? normalizeServiceConfig(config) : undefined;
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
