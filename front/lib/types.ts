export type Tab = {
    label: string;
    content: React.ReactNode;
};

export interface UserAccount {
    id_utilisateur: number,
    nom: string,
    prenom: string,
    num_tel: string,
    login: string,
    mail: string
}

export interface StudentAccount extends UserAccount {
    date_naissance_etu: string;
    niveau_etu: string;
    statut_etu?: string;
    visibilite_infos?: boolean;
}

export 
interface Affectation {
  id_candidature: number;
  nom_etudiant: string;
  prenom_etudiant: string;
  intitule_offre: string;
  type_contrat: string;
  adresse_offre: string;
  remuneration_offre: number | null;
  date_debut_contrat: string;
  date_fin_contrat: string;
  etat_candidature: string;
  date_candidature: string;
  niveau_etu: string;
}