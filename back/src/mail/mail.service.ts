import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateAccountDto } from '../accounts/dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendAccountCredentials(dto: CreateAccountDto, login: string) {
    try {
      await this.mailerService.sendMail({
        to: dto.mail,
        subject: `Création de votre compte OptiMatch`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Bonjour ${dto.firstName} ${dto.lastName},</h2>
            
            <p>Votre compte OptiMatch a été créé avec succès.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Vos identifiants de connexion :</h3>
              <p><strong>Login :</strong> ${login}</p>
              <p><strong>Mot de passe :</strong> ${dto.password}</p>
            </div>
            
            <p style="color: #666;">
              <strong>Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer 
              votre mot de passe lors de votre première connexion.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Si vous n'êtes pas à l'origine de cette demande, veuillez contacter l'administrateur.
            </p>
          </div>
        `,
      });
      
      console.log(`✅ Email envoyé à ${dto.mail}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email à ${dto.mail}:`, error.message);
      throw error;
    }
  }
}