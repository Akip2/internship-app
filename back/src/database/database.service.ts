import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

const PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private pools: Map<string, Pool> = new Map();

    async onModuleInit() {
        this.pools.set('admin', new Pool({
            host: process.env.DB_HOST,
            port: PORT,
            database: process.env.DB_NAME,
            user: 'admin_optimatch',
            password: process.env.DB_ADMIN_PASSWORD,
            max: 20,
        }));

        this.pools.set('etudiant', new Pool({
            host: process.env.DB_HOST,
            port: PORT,
            database: process.env.DB_NAME,
            user: 'etudiant_optimatch',
            password: process.env.DB_ETUDIANT_PASSWORD,
            max: 20,
        }));

        this.pools.set('entreprise', new Pool({
            host: process.env.DB_HOST,
            port: PORT,
            database: process.env.DB_NAME,
            user: 'entreprise_optimatch',
            password: process.env.DB_ENTREPRISE_PASSWORD,
            max: 20,
        }));

        this.pools.set('enseignant', new Pool({
            host: process.env.DB_HOST,
            port: PORT,
            database: process.env.DB_NAME,
            user: 'enseignant_responsable_optimatch',
            password: process.env.DB_ENSEIGNANT_PASSWORD,
            max: 20,
        }));

        this.pools.set('secretaire', new Pool({
            host: process.env.DB_HOST,
            port: PORT,
            database: process.env.DB_NAME,
            user: 'secretaire_optimatch',
            password: process.env.DB_SECRETAIRE_PASSWORD,
            max: 20,
        }));

        this.pools.set('internaute', new Pool({
            host: process.env.DB_HOST,
            port: PORT,
            database: process.env.DB_NAME,
            user: 'internaute_optimatch',
            password: process.env.DB_INTERNAUTE_PASSWORD,
            max: 20,
        }));

        console.log('✅ Connexions à la base de données établies');
    }

    async onModuleDestroy() {
        for (const [role, pool] of this.pools.entries()) {
            await pool.end();
            console.log(`✅ Pool ${role} fermé`);
        }
    }

    // Récupère le pool selon le rôle
    private getPool(role: string): Pool {
        const pool = this.pools.get(role);
        if (!pool) {
            throw new Error(`Pool non trouvé pour le rôle: ${role}`);
        }
        return pool;
    }

    // Exécute une requête avec le rôle approprié
    async query(role: string, text: string, params?: any[]) {
        const pool = this.getPool(role);
        const start = Date.now();

        try {
            const res = await pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`✅ Query [${role}]`, { text, duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error(`❌ Query error [${role}]:`, error);
            throw error;
        }
    }

    // Pour les transactions
    async transaction(role: string, callback: (client: PoolClient) => Promise<any>) {
        const pool = this.getPool(role);
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async getClientWithUserId(role: string, userId: number, tempSecretaireMode?: boolean): Promise<PoolClient> {
        const client = await this.getPool(role).connect();

        try {
            await client.query(`SET app.current_user_id = ${Number(userId)}`);
            
            // Si l'enseignant est en mode secrétaire temporaire, changer le rôle PostgreSQL
            if (tempSecretaireMode && role === 'enseignant') {
                await client.query('SET ROLE secretaire_optimatch');
            }
            
            return client;
        } catch (e) {
            client.release();
            throw e;
        }
    }
}
