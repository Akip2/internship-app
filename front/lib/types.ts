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
}