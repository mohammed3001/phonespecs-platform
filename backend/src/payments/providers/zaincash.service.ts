// src/payments/providers/zaincash.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { EncryptionService } from '../../common/encryption/encryption.service';

@Injectable()
export class ZainCashService {
  constructor(private encryption: EncryptionService) {}

  /**
   * All URLs read from config (stored in DB by Admin).
   * NO hardcoded URLs anywhere.
   */
  async createPayment(dto: any, rawConfig: Record<string, string>) {
    const config = this.decryptConfig(rawConfig);

    // API base URL from DB (admin sets sandbox vs prod)
    const apiBaseUrl = config.apiBaseUrl;
    if (!apiBaseUrl) throw new BadRequestException('ZainCash apiBaseUrl not configured');

    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
      amount: dto.amount,
      serviceType: dto.description || 'PhoneSpec',
      msisdn: config.msisdn,
      orderId: dto.orderId || `PS_${Date.now()}`,
      redirectUrl: config.redirectUrl || dto.redirectUrl,
      iat: timestamp,
      exp: timestamp + 3600,
    };

    const token = jwt.sign(payload, config.secret);

    const createPath = config.createPaymentPath || '/api/create';
    const { data } = await axios.post(
      `${apiBaseUrl}${createPath}`,
      { token, merchantId: config.merchantId, lang: dto.language || 'en' },
    );

    const payPath = config.payPath || '/api/pay';
    return {
      externalId: data.transactionId,
      paymentUrl: `${apiBaseUrl}${payPath}?id=${data.transactionId}`,
    };
  }

  async verifyCallback(body: any, rawConfig: Record<string, string>) {
    const config = this.decryptConfig(rawConfig);
    try {
      const decoded = jwt.verify(body.token, config.secret) as any;
      return { externalId: decoded.id, status: decoded.status === 'success' ? 'success' : 'failed' };
    } catch {
      throw new BadRequestException('Invalid ZainCash callback signature');
    }
  }

  private decryptConfig(raw: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      out[k] = typeof v === 'string' && v.startsWith('ENCRYPTED:')
        ? this.encryption.decrypt(v.slice(10))
        : v;
    }
    return out;
  }
}

// ─── QiCard ───────────────────────────────────────────────────
// src/payments/providers/qicard.service.ts
import { createHmac } from 'crypto';

@Injectable()
export class QiCardService {
  constructor(private encryption: EncryptionService) {}

  async createPayment(dto: any, rawConfig: Record<string, string>) {
    const config = this.decryptConfig(rawConfig);
    const apiBaseUrl = config.apiBaseUrl;
    if (!apiBaseUrl) throw new BadRequestException('QiCard apiBaseUrl not configured');

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const referenceNumber = `QI_${Date.now()}`;

    const params: Record<string, string> = {
      access_key: config.accessKey,
      profile_id: config.profileId,
      transaction_uuid: referenceNumber,
      signed_field_names: [
        'access_key','profile_id','transaction_uuid','signed_field_names',
        'unsigned_field_names','signed_date_time','locale','transaction_type',
        'reference_number','amount','currency'
      ].join(','),
      unsigned_field_names: '',
      signed_date_time: timestamp,
      locale: dto.language === 'ar' ? 'ar' : 'en-us',
      transaction_type: 'sale',
      reference_number: referenceNumber,
      amount: String(dto.amount),
      currency: dto.currency || 'IQD',
    };

    params.signature = this.sign(params, config.secretKey);

    const payPath = config.payPath || '/pay';
    return {
      externalId: referenceNumber,
      paymentUrl: `${apiBaseUrl}${payPath}?${new URLSearchParams(params)}`,
    };
  }

  async verifyCallback(body: any, _headers: any, rawConfig: Record<string, string>) {
    const config = this.decryptConfig(rawConfig);
    const expected = this.sign(body, config.secretKey);
    if (expected !== body.signature) throw new BadRequestException('Invalid QiCard signature');
    return { externalId: body.reference_number, status: body.decision === 'ACCEPT' ? 'success' : 'failed' };
  }

  private sign(params: Record<string, string>, secret: string): string {
    const fields = params.signed_field_names?.split(',') || Object.keys(params);
    const data = fields.map((k) => `${k}=${params[k] ?? ''}`).join(',');
    return createHmac('sha256', secret).update(data).digest('base64');
  }

  private decryptConfig(raw: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      out[k] = typeof v === 'string' && v.startsWith('ENCRYPTED:')
        ? this.encryption.decrypt(v.slice(10))
        : v;
    }
    return out;
  }
}

// ─── FIB ─────────────────────────────────────────────────────
// src/payments/providers/fib.service.ts
import { createHmac as hmac } from 'crypto';

@Injectable()
export class FibService {
  constructor(private encryption: EncryptionService) {}

  async createPayment(dto: any, rawConfig: Record<string, string>) {
    const config = this.decryptConfig(rawConfig);
    const apiBaseUrl = config.apiBaseUrl;
    if (!apiBaseUrl) throw new BadRequestException('FIB apiBaseUrl not configured');

    const token = await this.getToken(config);

    const createPath = config.createPaymentPath || '/v1/payments';
    const { data } = await axios.post(
      `${apiBaseUrl}${createPath}`,
      {
        monetaryValue: { amount: dto.amount, currency: dto.currency || 'IQD' },
        statusCallbackUrl: config.webhookUrl || dto.callbackUrl,
        description: dto.description,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return { externalId: data.paymentId, paymentUrl: data.readableCode || data.qrCode };
  }

  async verifyCallback(body: any, headers: any, rawConfig: Record<string, string>) {
    const config = this.decryptConfig(rawConfig);
    const sig = headers['x-fib-signature'];
    const expected = hmac('sha256', config.webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');
    if (sig !== expected) throw new BadRequestException('Invalid FIB webhook signature');
    return { externalId: body.paymentId, status: body.status === 'PAID' ? 'success' : 'failed' };
  }

  private async getToken(config: Record<string, string>): Promise<string> {
    const tokenPath = config.tokenPath || '/auth/token';
    const { data } = await axios.post(
      `${config.apiBaseUrl}${tokenPath}`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return data.access_token;
  }

  private decryptConfig(raw: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      out[k] = typeof v === 'string' && v.startsWith('ENCRYPTED:')
        ? this.encryption.decrypt(v.slice(10))
        : v;
    }
    return out;
  }
}
