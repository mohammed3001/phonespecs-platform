// src/payments/payments.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { ZainCashService } from './zaincash/zaincash.service';
import { QiCardService } from './qicard/qicard.service';
import { FibService } from './fib/fib.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
    private zaincash: ZainCashService,
    private qicard: QiCardService,
    private fib: FibService,
  ) {}

  async getEnabledGateways() {
    return this.prisma.paymentGateway.findMany({
      where: { isEnabled: true },
      select: { id: true, provider: true, name: true, environment: true },
    });
  }

  async createPayment(dto: CreatePaymentDto, provider: string) {
    const gateway = await this.prisma.paymentGateway.findFirst({
      where: { provider, isEnabled: true },
    });
    if (!gateway) throw new NotFoundException(`Gateway ${provider} not available`);

    const config = this.encryption.decrypt(JSON.stringify(gateway.config));
    const parsedConfig = JSON.parse(config);

    let result: { externalId: string; paymentUrl: string };

    switch (provider) {
      case 'zaincash':
        result = await this.zaincash.createPayment(dto, parsedConfig, gateway.environment);
        break;
      case 'qicard':
        result = await this.qicard.createPayment(dto, parsedConfig, gateway.environment);
        break;
      case 'fib':
        result = await this.fib.createPayment(dto, parsedConfig, gateway.environment);
        break;
      default:
        throw new BadRequestException('Unknown payment provider');
    }

    const tx = await this.prisma.transaction.create({
      data: {
        gatewayId: gateway.id,
        externalId: result.externalId,
        amount: dto.amount,
        currency: dto.currency || 'IQD',
        status: 'PENDING',
        metadata: dto.metadata,
      },
    });

    return { transactionId: tx.id, paymentUrl: result.paymentUrl };
  }

  async handleCallback(provider: string, body: any, headers: any) {
    const gateway = await this.prisma.paymentGateway.findFirst({
      where: { provider },
    });
    if (!gateway) throw new NotFoundException();

    const config = JSON.parse(this.encryption.decrypt(JSON.stringify(gateway.config)));

    let status: string;
    let externalId: string;

    switch (provider) {
      case 'zaincash':
        ({ status, externalId } = await this.zaincash.verifyCallback(body, config));
        break;
      case 'qicard':
        ({ status, externalId } = await this.qicard.verifyCallback(body, headers, config));
        break;
      case 'fib':
        ({ status, externalId } = await this.fib.verifyCallback(body, headers, config));
        break;
      default:
        throw new BadRequestException();
    }

    await this.prisma.transaction.updateMany({
      where: { gatewayId: gateway.id, externalId },
      data: {
        status: status === 'success' ? 'COMPLETED' : 'FAILED',
        callbackData: body,
      },
    });

    return { received: true };
  }
}

// ─── ZainCash Service ─────────────────────────────────────────
// src/payments/zaincash/zaincash.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class ZainCashService {
  private readonly SANDBOX_URL = 'https://test.zaincash.iq';
  private readonly PROD_URL = 'https://api.zaincash.iq';

  getBaseUrl(env: string) {
    return env === 'production' ? this.PROD_URL : this.SANDBOX_URL;
  }

  async createPayment(dto: any, config: any, environment: string) {
    const baseUrl = this.getBaseUrl(environment);
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = {
      amount: dto.amount,
      serviceType: dto.description || 'PhoneSpec Service',
      msisdn: config.msisdn,
      orderId: dto.orderId || `ORDER_${Date.now()}`,
      redirectUrl: dto.redirectUrl,
      iat: timestamp,
      exp: timestamp + 3600,
    };

    // Sign with HMAC-SHA256
    const token = this.signPayload(payload, config.secret);

    const response = await axios.post(
      `${baseUrl}/api/create`,
      { token, merchantId: config.merchantId, lang: dto.language || 'en' },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const { transactionId } = response.data;
    const paymentUrl = `${baseUrl}/api/pay?id=${transactionId}`;

    return { externalId: transactionId, paymentUrl };
  }

  async verifyCallback(body: any, config: any) {
    // Verify the callback token
    const { token } = body;
    const decoded = this.verifyToken(token, config.secret);

    if (!decoded) throw new Error('Invalid callback signature');

    return {
      externalId: decoded.id,
      status: decoded.status === 'success' ? 'success' : 'failed',
    };
  }

  private signPayload(payload: object, secret: string): string {
    const { sign } = require('jsonwebtoken');
    return sign(payload, secret);
  }

  private verifyToken(token: string, secret: string): any {
    try {
      const { verify } = require('jsonwebtoken');
      return verify(token, secret);
    } catch {
      return null;
    }
  }
}

// ─── QiCard Service ───────────────────────────────────────────

@Injectable()
export class QiCardService {
  private readonly SANDBOX_URL = 'https://testsecureacceptance.qi.iq';
  private readonly PROD_URL = 'https://secureacceptance.qi.iq';

  getBaseUrl(env: string) {
    return env === 'production' ? this.PROD_URL : this.SANDBOX_URL;
  }

  async createPayment(dto: any, config: any, environment: string) {
    const baseUrl = this.getBaseUrl(environment);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const referenceNumber = `REF_${Date.now()}`;

    const params: Record<string, string> = {
      access_key: config.accessKey,
      profile_id: config.profileId,
      transaction_uuid: referenceNumber,
      signed_field_names: 'access_key,profile_id,transaction_uuid,signed_field_names,unsigned_field_names,signed_date_time,locale,transaction_type,reference_number,amount,currency',
      unsigned_field_names: 'card_type,card_number',
      signed_date_time: timestamp,
      locale: dto.language === 'ar' ? 'ar' : 'en-us',
      transaction_type: 'sale',
      reference_number: referenceNumber,
      amount: String(dto.amount),
      currency: dto.currency || 'IQD',
    };

    params.signature = this.sign(params, config.secretKey);

    return {
      externalId: referenceNumber,
      paymentUrl: `${baseUrl}/pay?${new URLSearchParams(params).toString()}`,
    };
  }

  async verifyCallback(body: any, headers: any, config: any) {
    const signature = this.sign(body, config.secretKey);
    if (signature !== body.signature) throw new Error('Invalid signature');

    return {
      externalId: body.reference_number,
      status: body.decision === 'ACCEPT' ? 'success' : 'failed',
    };
  }

  private sign(params: Record<string, string>, secret: string): string {
    const signedFieldNames = params.signed_field_names?.split(',') || Object.keys(params);
    const dataToSign = signedFieldNames.map((k) => `${k}=${params[k]}`).join(',');
    return crypto.createHmac('sha256', secret).update(dataToSign).digest('base64');
  }
}

// ─── FIB Service ─────────────────────────────────────────────

@Injectable()
export class FibService {
  private readonly SANDBOX_URL = 'https://fib.iq/api/sandbox';
  private readonly PROD_URL = 'https://fib.iq/api';

  getBaseUrl(env: string) {
    return env === 'production' ? this.PROD_URL : this.SANDBOX_URL;
  }

  async getAccessToken(config: any, environment: string): Promise<string> {
    const baseUrl = this.getBaseUrl(environment);
    const response = await axios.post(
      `${baseUrl}/auth/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    return response.data.access_token;
  }

  async createPayment(dto: any, config: any, environment: string) {
    const token = await this.getAccessToken(config, environment);
    const baseUrl = this.getBaseUrl(environment);

    const response = await axios.post(
      `${baseUrl}/v1/payments`,
      {
        monetaryValue: { amount: dto.amount, currency: dto.currency || 'IQD' },
        statusCallbackUrl: dto.callbackUrl,
        description: dto.description,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return {
      externalId: response.data.paymentId,
      paymentUrl: response.data.readableCode || response.data.qrCode,
    };
  }

  async verifyCallback(body: any, headers: any, config: any) {
    // FIB uses HMAC signature in header
    const signature = headers['x-fib-signature'];
    const expected = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expected) throw new Error('Invalid webhook signature');

    return {
      externalId: body.paymentId,
      status: body.status === 'PAID' ? 'success' : 'failed',
    };
  }
}
