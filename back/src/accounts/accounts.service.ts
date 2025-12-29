import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from "bcrypt";
import { CreateAccountDto } from './dto';

@Injectable()
export class AccountsService {
  async getSecretaires(client: PrismaClient) {
    return client.secretaire.findMany({
      include: {
        utilisateur: {
          select: {
            id_utilisateur: true,
            mail: true,
            num_tel: true,
            login: true,
          }
        }
      }
    });
  }

  async getEnseignants(client: PrismaClient) {
    return client.enseignantresponsable.findMany({
      include: {
        utilisateur: {
          select: {
            id_utilisateur: true,
            mail: true,
            num_tel: true,
            login: true,
          }
        }
      }
    });
  }

  async createSecretaire(client: PrismaClient, dto: CreateAccountDto) {
    const login = await this.generateLogin(client, dto.lastName);

    const existingCompte = await client.compte.findUnique({
      where: { login }
    });

    if (existingCompte) {
      throw new ConflictException(`Le login ${login} existe déjà`);
    }

    const existingUser = await client.utilisateur.findUnique({
      where: { mail: dto.mail }
    });

    if (existingUser) {
      throw new ConflictException(`L'email ${dto.mail} est déjà utilisé`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await client.compte.create({
      data: {
        login,
        mot_de_passe: hashedPassword,
      }
    });

    const utilisateur = await client.utilisateur.create({
      data: {
        mail: dto.mail,
        num_tel: dto.phone,
        login,
      }
    });

    const secretaire = await client.secretaire.create({
      data: {
        id_utilisateur: utilisateur.id_utilisateur,
        nom: dto.lastName,
        prenom: dto.firstName,
      },
      include: {
        utilisateur: {
          select: {
            id_utilisateur: true,
            mail: true,
            num_tel: true,
            login: true,
          }
        }
      }
    });

    return {
      message: 'Secrétaire créé avec succès',
      login,
      secretaire,
    };
  }

  async createEnseignant(client: PrismaClient, dto: CreateAccountDto) {
    const login = await this.generateLogin(client, dto.lastName);

    const existingCompte = await client.compte.findUnique({
      where: { login }
    });

    if (existingCompte) {
      throw new ConflictException(`Le login ${login} existe déjà`);
    }

    const existingUser = await client.utilisateur.findUnique({
      where: { mail: dto.mail }
    });

    if (existingUser) {
      throw new ConflictException(`L'email ${dto.mail} est déjà utilisé`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await client.compte.create({
      data: {
        login,
        mot_de_passe: hashedPassword,
      }
    });

    const utilisateur = await client.utilisateur.create({
      data: {
        mail: dto.mail,
        num_tel: dto.phone,
        login,
      }
    });

    const enseignant = await client.enseignantresponsable.create({
      data: {
        id_utilisateur: utilisateur.id_utilisateur,
        nom: dto.lastName,
        prenom: dto.firstName,
      },
      include: {
        utilisateur: {
          select: {
            id_utilisateur: true,
            mail: true,
            num_tel: true,
            login: true,
          }
        }
      }
    });

    return {
      message: 'Enseignant créé avec succès',
      login,
      enseignant,
    };
  }

  private async generateLogin(client: PrismaClient, lastName: string): Promise<string> {
    const loginResult: any = await client.$queryRaw`
            SELECT generate_login(${lastName}) as login
        `;
    const login = loginResult[0].login;

    return login;
  }
}