export type Tab = {
    label: string;
    content: React.ReactNode;
};

export type UserAccount = {
    id_utilisateur: number,
    nom: string,
    prenom: string,
    num_tel: string,
    login: string,
    mail: string
}