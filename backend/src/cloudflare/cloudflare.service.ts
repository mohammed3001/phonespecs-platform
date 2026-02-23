// src/cloudflare/cloudflare.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class CloudflareService {
  private readonly CF_BASE = 'https://api.cloudflare.com/client/v4';

  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  private async getClient(): Promise<{ client: AxiosInstance; zoneId: string }> {
    const cfg = await this.prisma.cloudflareConfig.findFirst({ where: { isActive: true } });
    if (!cfg) throw new BadRequestException('Cloudflare not configured');

    const apiKey = this.encryption.decrypt(cfg.apiKey);
    const client = axios.create({
      baseURL: this.CF_BASE,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    });
    return { client, zoneId: cfg.zoneId };
  }

  async purgeAllCache() {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.post(`/zones/${zoneId}/purge_cache`, {
      purge_everything: true,
    });
    return data;
  }

  async purgeUrls(urls: string[]) {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.post(`/zones/${zoneId}/purge_cache`, { files: urls });
    return data;
  }

  async getDnsRecords() {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.get(`/zones/${zoneId}/dns_records`);
    return data.result;
  }

  async createDnsRecord(record: {
    type: string;
    name: string;
    content: string;
    ttl?: number;
    proxied?: boolean;
  }) {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.post(`/zones/${zoneId}/dns_records`, record);
    return data.result;
  }

  async updateDnsRecord(recordId: string, record: any) {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.put(`/zones/${zoneId}/dns_records/${recordId}`, record);
    return data.result;
  }

  async deleteDnsRecord(recordId: string) {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.delete(`/zones/${zoneId}/dns_records/${recordId}`);
    return data.result;
  }

  async getZoneInfo() {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.get(`/zones/${zoneId}`);
    return data.result;
  }

  async toggleWaf(enabled: boolean) {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.patch(`/zones/${zoneId}/settings/waf`, {
      value: enabled ? 'on' : 'off',
    });
    return data.result;
  }

  async getCacheRules() {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.get(`/zones/${zoneId}/cache/cache_reserve`);
    return data.result;
  }

  async setCachingLevel(level: 'aggressive' | 'basic' | 'simplified' | 'no_query_string') {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.patch(`/zones/${zoneId}/settings/cache_level`, {
      value: level,
    });
    return data.result;
  }

  async getAnalytics(since: string, until: string) {
    const { client, zoneId } = await this.getClient();
    const { data } = await client.get(
      `/zones/${zoneId}/analytics/dashboard?since=${since}&until=${until}`,
    );
    return data.result;
  }

  async updateConfig(dto: {
    apiKey: string;
    accountId: string;
    zoneId: string;
  }) {
    const encryptedKey = this.encryption.encrypt(dto.apiKey);
    
    const existing = await this.prisma.cloudflareConfig.findFirst();
    if (existing) {
      return this.prisma.cloudflareConfig.update({
        where: { id: existing.id },
        data: {
          apiKey: encryptedKey,
          accountId: dto.accountId,
          zoneId: dto.zoneId,
          isActive: true,
        },
      });
    }

    return this.prisma.cloudflareConfig.create({
      data: {
        apiKey: encryptedKey,
        accountId: dto.accountId,
        zoneId: dto.zoneId,
        isActive: true,
      },
    });
  }
}
