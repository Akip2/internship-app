import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private clients: Map<string, PrismaClient> = new Map();
  private internauteClient: PrismaClient;

  constructor(private configService: ConfigService) {}

  private buildDatabaseUrl(user: string, password: string): string {
    const host = this.configService.get('DB_HOST');
    const port = this.configService.get('DB_PORT');
    const dbName = this.configService.get('DB_NAME');
    const schema = this.configService.get('DB_SCHEMA');

    return `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=${schema}`;
  }

  async getInternauteClient(): Promise<PrismaClient> {
    if (!this.internauteClient) {
      const url = this.buildDatabaseUrl(
        this.configService.get('DB_INTERNAUTE')!,
        this.configService.get('DB_INTERNAUTE_PASSWORD')!,
      );

      this.internauteClient = new PrismaClient({
        datasources: { db: { url } },
      });
      await this.internauteClient.$connect();
    }
    return this.internauteClient;
  }

  async getClientForRole(role: string): Promise<PrismaClient> {
    if (!this.clients.has(role)) {
      const credentialsMap = {
        etudiant: {
          user: this.configService.get('DB_ETUDIANT'),
          password: this.configService.get('DB_ETUDIANT_PASSWORD'),
        },
        entreprise: {
          user: this.configService.get('DB_ENTREPRISE'),
          password: this.configService.get('DB_ENTREPRISE_PASSWORD'),
        },
        enseignant: {
          user: this.configService.get('DB_ENSEIGNANT'),
          password: this.configService.get('DB_ENSEIGNANT_PASSWORD'),
        },
        secretaire: {
          user: this.configService.get('DB_SECRETAIRE'),
          password: this.configService.get('DB_SECRETAIRE_PASSWORD'),
        },
        admin: {
          user: this.configService.get('DB_ADMIN'),
          password: this.configService.get('DB_ADMIN_PASSWORD'),
        },
      };

      const credentials = credentialsMap[role];
      if (!credentials) {
        throw new Error(`Unknown role: ${role}`);
      }

      const url = this.buildDatabaseUrl(credentials.user, credentials.password);

      const client = new PrismaClient({
        datasources: { db: { url } },
      });

      await client.$connect();
      this.clients.set(role, client);
    }

    return this.clients.get(role);
  }

  async onModuleDestroy() {
    if (this.internauteClient) {
      await this.internauteClient.$disconnect();
    }
    for (const client of this.clients.values()) {
      await client.$disconnect();
    }
  }
}