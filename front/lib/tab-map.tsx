import { UserRole } from "@/enums/user-role";
import { Tab } from "./types";
import AccountManagement from "@/components/homepage/admin/account-management";
import AttestationManagement from "@/components/homepage/secretaire/attestation-management";
import StudentManagement from "@/components/homepage/secretaire/student-management";
import AttestationDeposit from "@/components/homepage/student/attestation-deposit";
import OffersToValidate from "@/components/homepage/enseignant/offers-to-validate";
import AffectationsToValidate from "@/components/homepage/enseignant/affectations-to-validate";
import MyOffers from "@/components/homepage/enterprise/my-offers";
import PublicStudents from "@/components/homepage/enterprise/public-students";
import { Search } from "lucide-react";
import SearchOffers from "@/components/homepage/student/search-offers";
import MyCandidatures from "@/components/homepage/student/my-candidatures";
import DeclareAbsence from "@/components/homepage/secretaire/declare-absence";

export default function getTabs(role: UserRole): Tab[] {
    switch (role) {
        case UserRole.ADMIN:
            return [
                {
                    label: "Gestion des comptes",
                    content: <AccountManagement />
                }
            ]

        case UserRole.SECRETAIRE:
            return [
                {
                    label: "Gestion des étudiants",
                    content: <StudentManagement />
                },

                {
                    label: "Attestations",
                    content: <AttestationManagement />
                },

                {
                    label: "Déclaration d'absences",
                    content: <DeclareAbsence />
                }
            ]
        case UserRole.ETUDIANT:
            return [
                {
                    label: "Recherche d'offres",
                    content: <SearchOffers />
                },

                {
                    label: "Mes candidatures",
                    content: <MyCandidatures />
                },

                {
                    label: "Mon attestation",
                    content: <AttestationDeposit />
                }
            ]

        case UserRole.ENTREPRISE:
            return [
                {
                    label: "Mes Offres",
                    content: <MyOffers />
                },

                {
                    label: "Consulter les profils étudiants",
                    content: <PublicStudents />
                }
            ]

        case UserRole.ENSEIGNANT:
            return [
                {
                    label: "Offres à valider",
                    content: <OffersToValidate />
                },
                {
                    label: "Affectations à valider",
                    content: <AffectationsToValidate />
                }
            ]

        default:
            return [
                {
                    label: "Placeholder",
                    content: null
                }
            ];
    }
}